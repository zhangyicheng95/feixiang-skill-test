# 工具路由与边界（v50）

## 目标

`magazine-layout` 在飞象老师后台运行时只能调用平台已注册的工具。本文件基于 `fxls tool search` 真实拉取的 schema，明确：

- 每个工具的真实输入/输出形态；
- 每个工具能做与不能做的事；
- 在 magazine-layout 流程中的调用阶段和触发条件；
- 哪些常见误用必须避免（典型导致 v47/v48/v49 失败）。

> 本文件不依赖任何后端自动 hook（例如 `create_file` 之后自动跑 guard）。所有调用判断必须由 Agent 自己执行。

---

## 工具能力矩阵（基于真实 schema）

| 工具名 | type | 是否返回结构化字段 | 关键真实输出 | 与 magazine-layout 的关系 | 可解决的问题 | 关键风险 |
|---|---|---|---|---|---|---|
| `skills` | GENERAL | 否 | `magazine-layout` 等 skill 的 SKILL.md 等规则文本 | **必须调用** | 把 v50 全部规则、tool-routing、screenshot-classification、figure-cropping 等读进上下文 | 不调用就是 v49 失败：Agent 凭印象走会忘记二阶段补图判定 |
| `convert_to_text` | FLUX | **否，仅纯文本** | OCR/解析后的 plain text | **PDF/截图/Office 文档解析的唯一通道**（除 MinerU 接入前） | 把扫描卷、图片型 PDF、图片、DOCX 转成 OCR 文本 | **不返回 bbox/pageImages/figures URL/表格 HTML/公式 LaTeX**；图形依赖型试卷靠它一定缺图 |
| `read_url` | GENERAL | 否 | URL 内容文本 | 读取外部网页 / 文档 / HTML 链接 | 老师贴了一个网页/文档 URL 想排版 | **不能替代 PDF 转图**；不能拿 `?page=1` 或 `_page_1.png` 假装拿到逐页图 |
| `create_paper_by_id` | FLUX | 否，**直接出 docx 文件** | docx 下载链接（不是 JSON） | 飞象内容库 paperId 已有现成试卷 → 直接交付 docx | 用户给了试卷 ID 又要"精美排版"时，先确认 docx 是否已满足，避免重复加工 | 它不是结构化解析工具，**不返回题目/figure/答案 JSON**；不能把它当 MinerU 用 |
| `generate_image` | FLUX | 否 | AI 生成的图片 URL（FLUX 模型） | **学科原卷图严禁使用**；只允许语文/英语/讲义封面等场景的辅助插画 | 阅读理解、英语对话、讲义封面氛围插图 | 数学/物理/化学/生物/地理/几何/统计/电路/光路/实验装置图 **绝对禁止**；用了即失败 |
| `correct_composition` | FLUX | 否，输出批改 PDF | 批改报告 PDF 链接 | **不参与**精美排版主流程 | 老师上传作文要批改时使用（但跟 magazine-layout 不重叠） | 不要把它当成"作文精美排版"通道 |
| `search_knowledge` | FLUX | 否 | 学科可视化设计指南/案例文本 | 设计参考辅助；仅语文+数学 | 给设计选型提供参考依据（题型卡片、版式建议） | 不是内容来源，不能替代用户上传文档 |
| `create_lesson_design` | GENERAL | 否，直接出 docx 文件 | docx 下载链接 | **不参与**精美排版主流程 | 用户要的是 docx 教案交付物时使用 | 跟"教案打印版 HTML 排版"是不同任务，不要互相替代 |
| `create_file` | （后端） | — | HTML 链接 | 最终交付通道 | 把生成的 HTML 文件落库返回给老师 | **本轮调用前必须完成 13 条手工自检**；自检任一项失败就不能调用 |
| `ask_user` | （后端） | — | 用户回复 | 阻塞 / 收集补充素材 | 缺图、缺素材、需要用户明确接受降级时 | 调用之后**本轮不得再 create_file**；用户回复后必须重新进入 Phase 0/1.3，不能跳过 |
| `read_file` | （后端） | — | 资源 ID 对应的预览/正文 | 读取已上传资源的预览 | 拿到 OCR 预览 | **绝不能替代 `convert_to_text`**：read_file 拿到的预览不含 OCR 完整结构，也没有图片 URL |

---

## 阶段化调用协议

### Phase 0：Skill 加载（每轮必做）

任何一轮对话只要触发 magazine-layout，**必须先**：

```text
skills(name="magazine-layout")
```

读取最新 v50 规则到上下文。**首次调用** 与 **二阶段补图后再次推进时** 都要执行。原因：

- 上一轮的规则可能在缓存里被截断；
- 用户补充图片/素材后，需要重新对照"二阶段补图判定"。

**违反场景（v49 真实失败原因）**：
- 第一轮调用了 `skills`，但用户补图后直接用 `read_url` 拿图就 `create_file`，没有重新读 `screenshot-classification.md` → 整页扫描被当题图复用。

### Phase 1：输入类型识别

按用户上传资源类型分流：

| 输入 | 后续动作 |
|---|---|
| 普通文本 / Markdown / 用户直接粘贴的题目 | 跳过解析，直接 Phase 1.5 复现校验 |
| URL（一个网页地址） | `read_url`；不要假设是 PDF 地址 |
| PDF / 图片型 PDF / 扫描卷 | `convert_to_text`（fileUrls）；图形依赖型必走 Phase 1.3 |
| 图片（截图、扫描页、题图） | `convert_to_text`（imageUrls）→ 必须按 `screenshot-classification.md` 分类 |
| DOC / DOCX / PPTX / XLSX | `convert_to_text`（fileUrls）；只能拿到文本，缺图必须阻塞 |
| 飞象内容库 paperId | `create_paper_by_id` 直接出 docx；如老师明确要"网页排版"再走 Phase 1.5 |

### Phase 1.2：上游解析的真实边界

**`convert_to_text` 真实输出 = OCR 后的 plain text**。它**不会**返回：

- 图片 URL（题内图、逐页图都没有）
- bbox（题目定位、figure 定位都没有）
- pageImages 数组
- 表格 HTML
- 公式 LaTeX 结构（公式被 OCR 成普通文本，分数会变成 `7/9` 这种）
- reading order JSON
- OCR 置信度

因此对**图形依赖型试卷**：

> `convert_to_text` 单独完成的解析**永远不够**——必然缺图。
> 此时必须直接进入 Phase 1.3 阻塞，等待用户补图。
> 不要假设"OCR 提到了'如图'但没给图 URL"是临时问题——这是 `convert_to_text` 的**永久能力边界**。

### Phase 1.3：二阶段补图判定（v50 新增）

**触发**：Phase 1.2 后调用了 `ask_user` 要图，用户回复并补充了图片资源。

**严禁的行为**：拿到图片就直接 `read_url` 然后 `create_file`。

**必须的动作**：

1. **重新读规则**：`skills(name="magazine-layout")`，刷新二阶段判定与 screenshot-classification 的最新约束；
2. **逐张图分类**：把每张补充图片代入 `screenshot-classification.md` 的七分类表，写出 imageLedger 草稿；
3. **判定补充质量**：
   - 若全部为 `source-page`/`source-region`（A4 整页或半页扫描，naturalWidth × naturalHeight ≈ A4 比例 1:1.41） → **不得**直接进入 Phase 3；按下表二选一；
   - 若包含 ≥1 张真实 `question-figure`（单题图、bbox 裁剪图、清晰几何图等） → 可进入 Phase 3，但题目仍然缺图的部分必须再次阻塞；
4. **整页保真打印版**或**继续阻塞**二选一：

| 用户态度 | 动作 |
|---|---|
| 用户说"我只要原卷整页打印版，不重排" | 走"原卷整页保真打印版"（见 SKILL.md `Phase 3.fullpage`），HTML 中只放 `.source-pages`，不写 `.question-figure`，标题首屏标注"原卷整页保真打印版（非设计师级重排）" |
| 用户继续要"精美排版" | 必须再次阻塞，要求按题号补真实题图或 bbox。阻塞时必须列出还差哪些题号的图 |

**违反场景（v49 真实失败原因）**：
- 用户上传 4 张原卷 A4 整页扫描后，Agent 直接拿来当 9 个题的 question-figure，再用 max-height: 80-200px 缩成米粒大小贴进 HTML。

### Phase 2：场景与风格判断

不变（见 SKILL.md Phase 2）。

### Phase 3：HTML 生成

不变（见 SKILL.md Phase 3 + pagedjs-template.md），但叠加：

- **MathJax 必须**：`https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js`，不允许替代为飞象内网代理脚本（除非该脚本已经验证等价于 tex-svg.js）；
- **分数选项不允许 4 列 grid**：含 `\frac` / `\dfrac` / 内联公式 / `<img>` / 长表达式的选项默认 2 列或单列（见 pagedjs-template.md）；
- **source-page src 不得作为 question-figure src**：同一 URL 同时出现在 `.source-pages` 和 `.question-figure` 视为伪裁剪。

### Phase 4：发布前的 13 条手工自检（v50 新增，无 guard 时也必须做）

详见 SKILL.md `§ Agent 手工自检协议（13 条）`。任一项失败就不能 `create_file`。

---

## generate_image 严格使用边界

`generate_image` 是 FLUX AI 模型，**输出风格化插画**。

**允许场景（仅作辅助插画）**：

- 语文阅读理解的氛围插画（古诗水墨风、anime 风）
- 英语对话/阅读的卡通插画
- 讲义封面、章节封面、教案封面的装饰插图

**强制约束**：

1. 必须在 `<figcaption>` 标注 "AI 辅助插图，非原卷图"；
2. 不计入 `imageLedger` 的 `type=question-figure`；
3. **不计入** `--expected-images` 的"原图保真"数；
4. 与原卷图同时出现时，AI 插图位置须远离题号区，避免被误以为题图。

**严禁场景**（任何情况下都不允许）：

- 数学几何图、统计图、坐标图、数轴
- 物理电路图、光路图、力学示意图、实验装置图
- 化学实验装置、反应路径、分子结构
- 生物细胞图、解剖图、生理示意图
- 地理地图、地形剖面图、气候图
- 任何用户原卷里已经存在的图（必须还原原图，不允许 AI 重画）
- 用户说"一比一/还原/复原/真实原图/原卷图/不要 AI 生成"时**任何**图

**违反即失败**：guard 没有专门检测 AI 生图（无法从 URL 区分），但用户验收会一眼识破——任何"看起来像 AI 画的"几何图直接判负面。

---

## search_knowledge 使用边界

`search_knowledge` 仅支持语文（subjectId=1）和数学（subjectId=2），返回内部策划的可视化设计指南/案例文本。

**允许场景**：
- 设计选型时检索"统计图卡片版式"、"题型层级 A4"、"封面留白"等；

**严禁场景**：
- 替代用户上传内容的题目来源；
- 当作 OCR/解析工具；
- 假装搜到的"案例"就是用户要的内容。

---

## create_paper_by_id 与 magazine-layout 的关系

`create_paper_by_id` 直接生成 docx 文件。如果用户：

1. 提供了 paperId 又说"做成精美排版的 docx" → 直接调用 `create_paper_by_id`，无需 magazine-layout 介入；
2. 提供了 paperId 又说"做成 A4 打印精美 HTML" → 不能用 `create_paper_by_id`，因为它不返回结构化 JSON。当前能力下应阻塞，告知"内容库 paperId 当前只能产出 docx，不能直接产出 HTML 排版；如确需 HTML，请把 docx 上传一遍";
3. 给了 paperId 但其实想要 HTML 试卷（无需用 paperId）→ 让用户直接上传题目内容，走标准 magazine-layout 流程。

---

## 失败回避 SOP

| 现象 | 错误动作 | 正确动作 |
|---|---|---|
| `convert_to_text` 输出里有"如图/统计图/示意图" | 假装已解决图，直接 create_file | Phase 1.3 阻塞要图 |
| 用户补充了几张 A4 整页扫描 | 当题内图复用 + max-height 缩小 | Phase 1.3 → 整页保真打印版 OR 继续阻塞 |
| `convert_to_text` 输出极短 | 改用 `read_file` 拿预览继续 | 阻塞，告知能力缺失 |
| 公式渲染需要 MathJax | 用飞象代理脚本（metis-misc/...） | 用 `mathjax@3/es5/tex-svg.js` 标准 CDN |
| 老师说"做成图文丰富的版式" | 调 `generate_image` 给数学题配几何图 | 拒绝；告知数学几何图严禁 AI 生成 |
| 已经 `ask_user` 后用户没回应 | 改为 `create_file` 写降级版 | 不写 HTML；只回阻塞文案 |

---

## 自检清单（Agent 每轮调用前自查）

- [ ] 已先调 `skills(name="magazine-layout")` 加载 v50 规则
- [ ] 当前阶段与 Phase 0/1/1.2/1.3/2/3/4 对得上号
- [ ] 选用的工具来自上表 11 个，未捏造工具名
- [ ] 没有把 `convert_to_text` 当结构化解析器
- [ ] 没有把 `generate_image` 用于学科原卷图
- [ ] 没有把 `read_file` 当 OCR 通道
- [ ] 用户补图后，已重新走 Phase 1.3 二阶段判定
- [ ] 没有伪造工具结果或 URL
