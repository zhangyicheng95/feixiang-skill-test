---
name: magazine-layout
description: 精美排版唯一主 Skill。Use when 用户要求把已给定内容或上传文档改造为 A4 打印友好的高级试卷、讲义、练习单、题单、默写纸、知识清单、教案打印版、杂志风资料，或提到精美排版、高级排版、好看、美化、可打印、A4、一比一、还原、复原、真实原图、原卷图、按这个格式来。上传试卷的目标是“真实内容一比一保真 + 设计师级美化重排”：真实原图保真是底线，美化排版是核心交付，二者都必须满足。**v50 协议**：① 每轮必须先 `skills(name="magazine-layout")` 加载本 v50 规则；② 上游解析只有 `convert_to_text` 时仅得 OCR 纯文本（无 bbox/无 pageImages/无 figures URL/无表格 HTML/无公式 LaTeX），图形依赖型试卷必然缺图、必须阻塞要图，禁止把降级"仅文字版"当默认推荐；③ 用户在 `ask_user` 后补充图片，**必须重新调 `skills` 并执行 Phase 1.3 二阶段补图判定**：把每张补充图按 screenshot-classification.md 七分类，A4 比例（≈1:1.41）整页扫描只能是 `source-page`，禁止当 `question-figure`、禁止用 max-height:80-200px 缩成题内小图、禁止同 `<img src>` 被 ≥3 个题图复用，仍缺图时按用户态度走"原卷整页保真打印版"或继续阻塞，二者都不得退化为 text-only；④ MathJax 必须用标准 `https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js`，并在 `PagedConfig.before` 里 `await typesetPromise()`；⑤ 含 `\frac` / `\dfrac` / 内联公式 / 图片 / 长表达式的选项严禁 4 列 grid，默认 2 列或单列且 option-box 与文字必须同 DOM 父节点；⑥ A4 分页禁止给 `.question/.question-group/.question-item/.answer-area/.point-card/.section/.card/.page` 等普通题块批量 `break-inside: avoid`、`@page margin` 不超过 12mm；⑦ 题内图必须按 figure-cropping.md 真实 bbox 裁剪并满足最小可读宽度（默认 35mm，含刻度/电路/统计/装置图 60-100mm），`figure.url` 不得等于 `pageImage.url`；⑧ `generate_image` 仅限语文/英语/讲义封面辅助插图，必须 figcaption 标注"AI 辅助插图"，**严禁用于数学/物理/化学/生物/地理任何学科原卷图**；⑨ `create_file` 之前必须执行 13 条手工自检（详见 SKILL.md），任一失败不交付；⑩ 已调 `ask_user` 之后、本轮严禁再 `create_file` 生成占位版/降级版 HTML；⑪ 若 `tools/magazine-layout-guard` 与 `tools/print-preview-guard` 后端可调用则双门禁串接，否则按 13 条手工自检兜底。若图片块主要是文章段落、题目或答案，不得集中做成图片合集，必须按原阅读顺序转写进正文。若源文档有"参考答案/答案/解析"，必须完整保留每条答案与解析，禁止压缩成只有选项字母。禁止 AI 生成图、SVG/Canvas/CSS 猜画、文字占位、少量 OCR 文本或大量空白分页冒充完成。
---

更新时间：2026-05-07

# 精美排版

## 使用时机

当用户要求把**已给定内容**或**上传文档**改造成适合打印/分发的 HTML 时使用：

- 讲义、练习单、试卷、题单、默写纸、知识清单、教案打印版
- A4、可打印、打印友好、纸张、分页、杂志风、期刊风、精美排版
- “按这个格式来”“记住这个格式”“参考 resourceId/文件一模一样排版”

不适用于：

- 屏幕优先的交互动画、教学游戏、单页课件
- 多页 PPT 式课件
- 需要重新搜题、组题、补题的任务
- 上传 HTML 后要求“保持结构换内容”的同款复刻任务；此类先按模板锁定规则处理，必要时转到同款/复刻能力

## Phase 0：Skill 加载与重读（v50 强制）

任何一轮对话只要触发 magazine-layout，**第一条工具调用必须是**：

```text
skills(name="magazine-layout")
```

随后必须读取的最少文件集（用 skills 同一通道返回，不要替代为 read_file）：

1. `SKILL.md`（本文件）
2. `tool-routing.md`（v50 工具路由与边界）
3. `screenshot-classification.md`（截图七分类）
4. `figure-cropping.md`（题内图裁剪与最小宽度）
5. `pagedjs-template.md`（A4 + MathJax + 分数选项）
6. `quality-gate.md`（13 条手工自检与可选门禁参数）

**重读触发点**（必须重新调 `skills`）：

- 用户回复 `ask_user` 后、本轮要继续推进时；
- 用户补充上传新图片/新文档后；
- 任何时候 Agent 准备进入 `Phase 3` 的 `create_file`、且距上次 `skills` 调用已经过了 ≥3 个工具调用。

**禁止**：凭印象/上下文片段判断 magazine-layout 规则。v49 真实失败原因之一就是用户补图后没重读规则，把 `screenshot-classification.md` 二阶段判定给跳过了。

## 硬性执行门槛

以下规则优先级高于所有审美和 HTML 生成习惯：

### 输入判定表（v48）

在任何 `create_file` 之前，必须先按下表判定。判定结果为“阻塞”时，**禁止调用 `create_file`**。

| 输入状态 | 是否可生成 HTML | 必须动作 |
|---|---:|---|
| 普通文本、Markdown、DOCX 文本已完整读出，无原图保真要求 | 可以 | 直接做 A4 高级重排，仍需题量/公式/表格自检 |
| DOC/DOCX/PPTX/XLSX 等 Office 文档，转换结果或用户要求显示存在图片、图示、截图、媒体、表格图片，且工具返回了真实视觉图片 URL 或可访问裁剪图；纯文字/表格截图已 OCR 成可编辑文字或 `<table>` | 可以 | 生成可编辑重排正文，把真实视觉图片放回语义附近，把图片文字/表格放回原语义位置，并使用紧凑 A4 分页 |
| DOC/DOCX/PPTX/XLSX 等 Office 文档，存在图片/图示/截图/媒体线索，但 `convert_to_text` 只返回纯文本、没有任何真实图片 URL | 阻塞 | 说明当前转换链路只读出了文字，没有读出文档内图片；不能生成 img=0 的“精美排版” |
| 已知 Office 文档含多张必须视觉保真的图片，但当前只拿到部分图片 URL | 阻塞 | 说明图片提取不完整，不能用 1 张图冒充“图都读了”；必须补齐全部视觉图片资源或明确降级为不含图版本 |
| 已知 Office 文档含图片对象，其中部分是纯文字/表格截图，且文字或表格已完整 OCR 成可编辑正文或 `<table>` | 可以 | 纯文字/表格截图不强制保留为 `<img>`；但必须在内容清单里标明“已 OCR 转写/表格化”，并在最终 HTML 中出现该文本或表格 |
| 已知图片对象主要是文章段落、题目、答案或解析截图 | 可以 | 必须按阅读顺序 OCR 成正文、题目或答案区内容；禁止统一放到开头的 `.visual-assets`/图片墙 |
| 任一源图片没有 OCR 文本、没有真实 `<img>`、也没有在图片读取台账中说明无法读取原因 | 阻塞 | 不能说“图片已读”；必须继续提取/OCR，或阻塞说明缺失的图片编号 |
| 只有用户/prompt 给出的验收片段，没有工具输出的图片 OCR/URL/表格数据 | 阻塞 | 验收片段只能校验，不能作为生成正文或图示内容的来源 |
| PDF/截图/扫描卷，且有 MinerU/等效素材包：题号级结构、可编辑正文、公式/表格、逐页图、题内图 URL 或 bbox | 可以 | 生成可编辑重排正文 + 原卷校验图层，跑质量门禁 |
| PDF/截图/扫描卷，只有 `convert_to_text` 的普通 OCR 文本 | 阻塞 | 说明缺少题号级结构、题内图/bbox 和可靠题量，不能生成伪 HTML |
| PDF/截图/扫描卷，`convert_to_text` 返回空或极短，随后 `read_file` 只读到预览/OCR 文本 | 阻塞 | 说明当前解析链路没有结构化素材和真实图片，不能把预览文本重排成伪 HTML |
| PDF/截图/扫描卷，只有逐页图片或整页截图 URL，没有题号级结构 | 阻塞 | 说明已有原卷校验图，但缺少结构化 OCR，不能把整页图合集当精美排版 |
| **数学/物理/化学/生物/地理等图形依赖型试卷，或源文档含“如图/下图/统计图/示意图/电路图/光路图/实验装置”等线索，但缺少题内图 URL/bbox** | **阻塞** | **必须阻塞，禁止默认推荐“仅文字和公式排版”；text-only 降级只允许在用户明确说“忽略图片，只排文字”后启用，且必须在标题与首屏标注“文字版，不含原图形条件”** |
| 数学/理科图形题没有真实题内图 URL/bbox，且无完整 `diagramSpec/redrawData` | 阻塞 | 说明缺少题内图片裁剪/定位能力，禁止 SVG/Canvas/AI 图替代 |
| **手动上传整页/半页截图，没有 OCR 与 bbox 拆题，但被要求精美排版** | **阻塞** | **整页截图不得直接作为题内 figure；必须先按 screenshot-classification.md 拆题或 OCR；缺能力时阻塞** |
| **题内图来源 URL 与原页 URL 完全相同（未真正裁剪），或裁剪后实际打印宽度低于最小可读宽度** | **阻塞** | **必须按 figure-cropping.md 真正裁剪并满足最小宽度** |
| **图片读取台账中存在 `type=unknown` 的图片** | **阻塞** | **未分类图片不得进入 HTML** |
| 预计最终 HTML 会出现 `<img>` 为 0、占位、图略、预留位置、请参考原卷、对照原卷使用、题量不足，或 A4 页面大面积空白 | 阻塞 | 不生成 HTML，返回阻塞说明 |

阻塞时只允许回复阻塞说明或调用 `terminate`，不能继续生成“看似完成”的 HTML。已经调用 `ask_user` 请求补素材后，本轮必须停止；禁止在 `ask_user` 之后继续调用 `create_file`。

#### Phase 1.3：二阶段补图判定（v50 新增）

**触发**：上一轮调用了 `ask_user` 要求补图，本轮用户回复并附了一批图片资源。

**严禁的执行链**：

```text
[用户补图] → read_url(每张图URL) → create_file(HTML)        ❌ v49 真实失败链路
```

**正确的执行链**：

```text
[用户补图]
  → skills(name="magazine-layout")                  # 重读 v50 规则
  → 对每张图：分类 → 写 imageLedger 草稿
  → 判定补充质量（见下表）
  → 走 ① 整页保真打印版 / ② 继续阻塞 / ③ 进入 Phase 2 重排
```

**逐张分类**：把每张补充图代入 `screenshot-classification.md` 的七分类表。判定 A4 整页/半页扫描的工程口径：

| 信号 | 阈值 | 含义 |
|---|---|---|
| 图像短边 / 长边 | 0.62-0.78（A4 比例 1:1.414 → 长宽比 0.707） | 接近 A4 整页 |
| 短边像素 | ≥ 800 px | 整页扫描分辨率 |
| 单图含 ≥3 个题号 | 由 OCR/视觉识别 | 多题区域 |
| 单图含答案/解析整段 | 含"参考答案/解析" | answer-explanation-screenshot |

满足前两项即应判为 `source-page`/`source-region`，**不得**当 `question-figure`。

**判定动作**：

| 补充质量 | 是否进入 Phase 3 | 必须动作 |
|---|---:|---|
| 全部为 `source-page`/`source-region`（A4 整页/半页扫描） | 否 | 必须按下表"二选一"处理 |
| 含 ≥1 张 `single-question-figure`（单题图、清晰几何图、bbox 裁剪图），且覆盖所有图形依赖题号 | 是 | 进入 Phase 2/3 重排 |
| 含 ≥1 张 `single-question-figure`，但仍有题号缺图 | 否 | 阻塞，列出还差哪些题号的图 |
| 含 `text-screenshot`/`table-screenshot`/`answer-explanation-screenshot` | 视情况 | OCR 后落入正文/表格/答案区，不计入题图 |
| 含 `unknown` | 否 | 阻塞，要求重传或人工分类 |

**全部为整页扫描时的二选一**：

| 用户态度 | 动作 |
|---|---|
| 用户明确说"我只要原卷整页打印版/我不要重排/原卷直接打印就行" | 走 **Phase 3.fullpage 原卷整页保真打印版**（见下文） |
| 用户继续要"精美排版/重排版/A4 重排" | 必须再次阻塞，措辞清晰列出"还差哪些题号的真实题图"，并给出补图建议（"按题号截题图"/"提供 bbox 信息"/"先用 tools/question-figure-cropper 自助裁剪"） |

阻塞模板：

```plain
当前不生成精美 A4 重排：补充的 N 张图均为原卷整页扫描（A4 比例），属于 source-page，不能直接作为题内 figure。
- 已识别需要题图的题号：第 2、3、7 题（图形依赖题号统计）
- 缺真实裁剪 figure 的题号：第 2、3、7 题
- 不可降级：默认禁止把 source-page 缩成题内小图，会导致打印模糊
- 您可以选择：
  ① 按题号截题图重新上传（一题一图，建议短边 ≥ 600px）
  ② 回复"我只要原卷整页打印版"，我会出原卷整页保真打印 HTML（非设计师级重排）
  ③ 回复"我只要文字版（不含原图形条件）"，会出明确标注的文字降级版
```

#### 图形依赖型试卷判定

满足任一条件即视为“图形依赖型”：

- 学科属于数学、物理、化学、生物、地理（含小学/初中/高中/中考/高考）；
- 题干、答案区或源文档中出现“如图/下图/示意图/统计图/坐标图/电路图/光路图/实验装置/几何图形/数轴”等关键词；
- 源文档已知存在题内 figure（`figures[].kind=original_crop` 或 `original_full_page`）；
- 用户原始指令中包含“一比一/还原/复原/真实原图/原卷图/不要 AI 生成”。

图形依赖型试卷在没有真实题内图 URL/bbox 时，**默认动作是阻塞**。`ask_user` 时严禁出现“是否接受仅对文字和公式进行精美排版（不含原卷图形）”这种把降级当默认的措辞；正确措辞应明确说明缺图、风险与默认阻塞，并把“仅文字版”作为需要老师明确确认的次选项，且任何文字版必须在标题与首屏注明“文字版，不含原图形条件，不可作为完整试卷使用”。

#### 复现失败反例（必须阻断）

如果运行中出现以下任一情况，必须立即阻塞，禁止继续调用 `create_file`：

- `convert_to_text` 对 PDF/截图/扫描卷返回空内容、极短内容或只有“用户上传了文件，文件的内容是”。
- `convert_to_text` 对 DOC/DOCX/PPTX/XLSX 只返回纯文本，但用户要求读图、带图、图片文字转换，或文档语义中出现图片/图示/截图/媒体线索。
- 已知源文档中存在多张必须视觉保真的图片，但最终只能放入 1 张或少于视觉图片数的图片。
- 已知源文档中存在纯文字/表格截图，但最终 HTML 既没有真实图片，也没有把截图文字 OCR 成可编辑文本或把截图表格转成 `<table>`。
- 已知图片对象主要是文章段落/题目/答案截图，但最终被集中放入 `.visual-assets`、`image-gallery`、图片墙或开头图集，而没有转成可编辑正文。
- 任一图片没有逐张读取台账，或台账里的 OCR 片段没有在最终 HTML 正文/表格/答案区出现。
- 将用户或测试 prompt 提供的 `--require-text-snippet` / 验收片段当成 OCR 来源，写成“根据验收片段还原/视觉化还原”的 HTML。
- 源文档存在“参考答案/答案/解析”，但最终答案区缺少原有解析、只保留选项字母或合并摘要。
- 随后改用 `read_file` 只拿到 OCR 预览文本，但没有逐页图片、题内图 URL、bbox、reading-order JSON 或可靠题量清单。
- 输出解释里准备写“由于当前工具链未返回题内原图 URL，我在 HTML 中预留位置”。
- HTML 正文里准备出现“[此处原卷为...]”“请参考原卷”“建议打印后对照原卷使用”等文字。
- **图形依赖型试卷缺真实题内图，但准备调用 `ask_user` 询问“是否接受仅文字和公式精美排版（不含原卷图形）”**：把降级当默认推荐属于失败动作；正确做法是阻塞或在 `ask_user` 中显式说明默认不可降级、风险与确认文案。
- **手动上传整页/半页截图，准备直接放进题内 `<figure>`**：必须先 OCR + bbox 拆题，并按最小可读宽度裁剪。
- **题内 figure 的 `<img src>` 与 source-page 的 `<img src>` 完全相同**：未做真实裁剪，必须阻塞。
- **同一 `<img src>` 被 ≥3 个 `<figure class="question-figure">` 引用**：v49 真实失败模式，4 张原卷整页扫描被 9 个题循环复用——视为伪裁剪集中爆发，立即阻塞。
- **`<img>` 上同时存在 `style/inline width-height` 把 max-height 限制到 80-200px 且自然尺寸为 A4 比例**：v49 真实失败模式，把整页扫描缩成米粒大小当题图——立即阻塞。
- **用户在 `ask_user` 后补图，本轮没重新调 `skills` 就直接 `create_file`**：v49 真实失败模式，跳过 Phase 1.3 二阶段判定——立即阻塞。
- **MathJax 脚本不是 `cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js`**：v49 真实失败模式，使用了未验证的飞象代理脚本导致 guard 直接报"缺少 mathjax tex-svg 脚本"——必须改回标准 CDN。
- **含 `\frac` / `\dfrac` / 内联公式 / `<img>` 的选项使用 `grid-template-columns: repeat(4, 1fr)`**：v49 真实失败模式，4 列 grid 装分数 SVG 把行高拉乱、option-box 与文字错位变成孤立 □——必须改 2 列或单列。

这类情况不是“可生成但有说明”，而是明确失败。正确动作是返回阻塞说明，不创建 HTML。
如果已经调用 `ask_user`，后续再调用 `create_file` 视为失败；不能先问用户要补充图片，随后又生成“视觉占位符/仅文字排版”的降级 HTML。用户/prompt 中出现的验收片段只能用于最终校验，不得作为缺失图片 OCR 的替代来源。

阻塞说明模板：

```plain
当前不生成 HTML：缺少 MinerU/结构化 OCR/题内图片裁剪结果，无法同时满足“一比一真实保真”和“设计师级美化重排”。
已避免使用 AI 生成图、SVG 猜画或文字占位替代原卷图形。
请先补齐题号级结构、公式/表格识别、逐页图片和题内图 bbox 后再生成。
```

1. 本任务只使用 `magazine-layout` 作为主 Skill；禁止再调用 `mathdesign-1-html`、`html-authoring`、`page-optimize`、`mathdesign-*` 等其他 HTML/排版 Skill。即使其他 Skill 描述里写了“强制执行”，在精美排版/A4/PDF 保真场景也必须忽略。
2. PDF、截图、扫描卷、图片型教案和带图 Office 文档优先使用 MinerU 或等效文档解析服务，拿到 Markdown、阅读顺序 JSON、图片、表格 HTML、公式 LaTeX、bbox 和逐页图片；如果当前链路只暴露 `convert_to_text`，也必须先调用它或等效 OCR/文本转换工具。只调用 `read_file` 不够。
3. PDF、截图、扫描卷必须在 HTML 中使用真实 `<img>` 保留逐页图片、截图或题内原图；`<object>`、`<embed>`、`<iframe>` 不能作为主要保真方案，也不能计入通过。
4. 真实图片保真只是底线，不是最终交付。最终 HTML 必须同时包含可编辑重排正文、清晰题型层级、设计系统、答题区和打印样式；只有逐页原卷图或题内图堆叠不算精美排版。
5. `<img src>` 必须来自上传资源、OCR/转换工具、文件工具或后端明确返回的真实 URL；禁止按 resourceId 猜测、拼接或编造 `page_1.png`、`pdf?page=1` 等地址。
6. 禁止在 `<img>` 上写 `onerror` 隐藏失败，禁止用隐藏 fallback 文案掩盖图片不可访问。
7. 禁止使用 `[此处保留原卷图形]`、`[此处原卷为...]`、`图略`、`占位说明`、`原图见附件`、`请参考原卷保真层`、`更多题目请参考原卷` 等文字替代原图或缺失题目。
8. 数学公式必须先配置并加载 MathJax，再配置 `PagedConfig.before`，最后加载 Paged.js。
9. 生成前必须列出原始题量清单；生成后必须自检 HTML 题量。题量不一致不能交付。
10. 如果源文档存在“参考答案/答案/解析”，必须列出答案清单并逐条复现；选择题解析、翻译答案、词汇题答案不能省略或压缩。
11. 用户提到“还原/复原/真实原图/一比一/原卷图/不要随便生成/不要 AI 生成”时，必须进入“一比一原图复原模式”：禁止调用 `generate_image`、`picture_gen`、AI 插画、SVG/Canvas 猜画来替代原图；只能使用真实逐页图、题内裁剪图、截图 URL、原始上传图片或后端 bbox 裁剪结果。
12. 数学、物理、化学、生物、地理等依赖图形准确性的试卷，默认也按“一比一原图复原模式”处理。只有后端明确返回完整 `diagramSpec` / `redrawData` 且用户允许重绘时，才可 SVG 重绘；否则必须真实图片优先。
13. 对 PDF/截图/扫描卷，若没有工具返回的真实图片 URL，必须在生成文件前停止，回复“当前缺少 PDF 转图/图片提取能力，无法完成原图保真排版”；禁止调用 `create_file` 生成伪 HTML。
14. 未满足以上任一项时，必须重新生成或说明当前链路缺能力，禁止假装完成。

## 文件说明

| 文件 | 用途 | 何时读取 |
|---|---|---|
| `SKILL.md` | 总览、触发、主流程和验收 | 首先读取 |
| [tool-routing.md](tool-routing.md) | **v50 工具路由与边界**：fxls 真实 schema 调研、convert_to_text 边界、generate_image 严禁场景、二阶段补图判定 | **Phase 0 必读**，每一轮决策前对照 |
| [engineering-pipeline.md](engineering-pipeline.md) | v48 四层流水线（解析/重排/HTML 门禁/打印 PDF 门禁）总架构与工具职责 | Phase 1 之前必读，理解整体链路 |
| [reproduction-guide.md](reproduction-guide.md) | 内容完整复现规则、题目/图片/公式/模板锁定规则 | Phase 1 执行前读取 |
| [math-image-fidelity.md](math-image-fidelity.md) | 分数公式渲染、原图保留、题量不缩水专项规则 | 处理试卷/题单/PDF/截图前必须读取 |
| [mineru-integration.md](mineru-integration.md) | MinerU 上游解析、Markdown/JSON/图片/表格/公式/bbox/答案/imageLedger 素材包合同 | 处理 PDF、图片、DOCX、PPTX、XLSX 前必须读取 |
| [pdf-ocr-preprocess.md](pdf-ocr-preprocess.md) | MinerU 优先、OCRmyPDF / OCR 预处理策略与边界 | 处理扫描 PDF、图片型 PDF 前读取 |
| [pdf-page-fidelity.md](pdf-page-fidelity.md) | PDF 原页逐页图片保真、禁止空白嵌入框和“参考原卷”兜底 | 处理上传 PDF/扫描卷时必须读取 |
| [screenshot-classification.md](screenshot-classification.md) | 截图七分类（source-page / source-region / question-figure / text / table / answer / photo / unknown） | 处理用户手动截图前必须读取 |
| [figure-cropping.md](figure-cropping.md) | 题内图 bbox 裁剪、最小可读宽度（35/60/80/100mm 分档） | 题内图回填前必须读取 |
| [visual-design-guide.md](visual-design-guide.md) | 高级视觉排版、设计系统、题型层级、题内图版式和纸面信息密度 | Phase 3 生成 HTML 前必须读取 |
| [pagedjs-template.md](pagedjs-template.md) | Paged.js 0.4.3 A4 打印 HTML 模板和 CSS 铁律 | Phase 3 生成 HTML 前读取 |
| [quality-gate.md](quality-gate.md) | 生成后 HTML 静态质量门禁和失败拦截标准（Layer 3） | Phase 4 交付前必须读取 |
| [print-preview-guard.md](print-preview-guard.md) | 打印产物验证层规则（Layer 4，Puppeteer + 打印 PDF 解析） | 上线前必读 |
| [examples.md](examples.md) | 零散题目、模板锁定、教案打印版示例 | 需要对齐后台配置或输出话术时读取 |
| [tools/](tools/) | 工程化脚本：pdf-to-page-images / question-figure-cropper / image-ledger-builder / magazine-layout-guard / print-preview-guard | Phase 1.2 与 Phase 4 调用 |

## 核心原则

**一比一真实保真是底线，设计师级美化重排是核心交付。**

- 单一入口：精美排版任务以 `magazine-layout` 为唯一主 Skill，不要再额外调用 `mathdesign-1-html`、`html-authoring`、`page-optimize`、`mathdesign-*` 等其他排版/HTML Skill，除非用户明确要求。HTML 技术规范、MathJax、Paged.js、PDF 保真规则全部以本 Skill 为准。
- 冲突屏蔽：`mathdesign-1-html` 面向数学互动/课件视觉风格，不适用于 A4 打印试卷、PDF 原图保真、Paged.js 分页。若它的规则与本 Skill 冲突，一律以本 Skill 为准。
- 不搜题：用户已给内容时，不自行补题、换题、删题。
- 不改内容：原文、题号、标题、公式、图片、题型结构必须先完整保留。
- 不先排版：必须先完成内容清点和复现，再进入视觉排版。
- MinerU 优先：PDF/图片/DOCX/PPTX/XLSX 等复杂文档优先依赖 MinerU 或等效解析服务输出 Markdown、阅读顺序 JSON、图片、表格 HTML、公式 LaTeX 和 bbox；Agent 不直接靠视觉猜版面。
- 一比一原图优先：任何“还原/复原/真实原图/一比一/原卷图”请求，真实图片保真优先于美观。没有真实图时停止，不用 AI 生成图、SVG 猜画、文字说明或占位冒充。
- 美化不是可选项：拿到真实图和题目结构后，必须做高级重排，包括统一设计 token、清晰题型层级、题号锚点、选项网格、标准答题区、图文邻近布局和 A4 打印细节。不能只把原卷图或 OCR 文本直接贴出来。
- 打印优先：默认 A4 白底黑字，除非用户明确要海报/深色/杂志封面。
- 模板可锁定：老师说“记住这个格式/下次按这个来/按 resourceId 一样”，固定层不得漂移。

## 工作流程（v50 五阶段 + 双门禁）

```plain
Phase 0: skills(name="magazine-layout") 读规则
  必读：SKILL.md、tool-routing.md、screenshot-classification.md、
        figure-cropping.md、pagedjs-template.md、quality-gate.md
  不调用 mathdesign-1-html / html-authoring / page-optimize 等其他 HTML/排版 Skill
    ↓
Phase 1: 输入识别 + 上游解析
  按 tool-routing.md 选择 convert_to_text / read_url / create_paper_by_id 等
  注意 convert_to_text 的真实边界：仅 OCR 纯文本，无 bbox/无 pageImages/无 figures URL
  扫描 PDF / 图片型 PDF / 截图 / Office 带图文档时：
  mineru-integration.md、pdf-ocr-preprocess.md、pdf-page-fidelity.md、
  screenshot-classification.md、figure-cropping.md
  优先使用 MinerU 素材包；缺失能力时按以下顺序退化：
    - tools/pdf-to-page-images：PDF → 逐页 PNG + manifest.json
    - tools/question-figure-cropper：pageImage + bbox → 题内图
    - tools/image-ledger-builder：聚合图片读取台账与 validationSnippet
  必须输出标准化素材包 source-package.json：
    - source.pageImages
    - questions[]（题号级结构）
    - figures[]（题内图，含 bbox 与裁剪后 URL）
    - tables[]（HTML 表格优先）
    - answers[]（参考答案 + 解析）
    - imageLedger[]（每张图片的 type / OCR / validationSnippet）
    - quality（题量、图数、表数、公式数）
    - exam.diagramDependent（图形依赖型试卷标记）
  按"输入判定表"分流：素材齐全才进入 Phase 2；缺图/缺结构/未分类图片必须阻塞
    ↓
Phase 1.3: 二阶段补图判定（仅在用户回应 ask_user 后触发）
  必须先重新调 skills(name="magazine-layout") 重读规则
  对每张补充图：分类 → imageLedger 草稿 → 七分类判定
  全部为 source-page → 走 Phase 3.fullpage 整页保真打印版 / 或继续阻塞
  含真实题图 → 进入 Phase 2/3
    ↓
    ↓
Phase 1.5: 保真专项检查
  读取 math-image-fidelity.md
  校验分数公式可渲染、原图/表格已保留、题量前后一致
    ↓
Phase 2: 场景与模板判断
  判断是试卷/题单/讲义/教案/默写纸/知识清单/模板复用
  若命中"模板锁定"，固定层不变，只换可变层
    ↓
Phase 3: 精美排版生成 OR Phase 3.fullpage 原卷整页保真打印版
  读取 visual-design-guide.md、pagedjs-template.md
  基于 Paged.js 0.4.3 输出单文件 HTML
  Phase 3 标准：题内图按 figure-cropping.md 真实裁剪，分数选项 ≤ 2 列
  Phase 3.fullpage：仅当用户明确同意时使用，标题首屏标注"原卷整页保真打印版（非设计师级重排）"
  普通题块禁止批量 break-inside: avoid
  MathJax 必须 cdn.jsdelivr.net mathjax@3 tex-svg.js
    ↓
Phase 4: 双门禁（如后端可调用则自动跑，否则改用 Agent 手工自检 13 条）
  Layer 3 静态门禁 - tools/magazine-layout-guard：
    题量、图片、MathJax、紧凑 A4、占位词、孤立方框、答案解析、
    伪裁剪 (fakeCropping)、source-page 身份隔离、4 列分数选项
  Layer 4 打印门禁 - tools/print-preview-guard：
    Puppeteer 渲染 + 等 MathJax/Paged.js 完成 → page.pdf() → 解析 PDF：
    页数、首页非空、文本量、图片量、空白比例、孤立方框、资源加载错误
  任一失败 → 不调用 create_file
  无 guard 环境 → 必须执行 "Agent 手工自检协议（13 条）"，全部通过才能 create_file
    ↓
通过门禁后 create_file 发布
```

## Phase 1：内容完整复现

执行排版前，先输出内部内容清单并据此生成 HTML：

- 原始标题
- 题型与顺序
- 每类题目数量
- 题号范围
- 公式、分数、单位、已知量
- 原图/表格/图文关系
- 教案环节顺序
- 老师明确要求的页数、A4、单栏/双栏、模板格式

上传试卷/题单/教案时，禁止把“摘要式改写”当成排版。内容必须完整进入最终 HTML。

## Phase 1.2：PDF/OCR 预处理判断

当上传文件是扫描 PDF、图片型 PDF、截图型试卷，或 DOC/DOCX/PPTX/XLSX 中包含图片/图示/截图/媒体时：

- 先按“输入判定表”给出结论。不要一边承认缺少结构化素材，一边继续生成 HTML。
- 必须优先使用 MinerU 或等效解析服务，获取 Markdown、阅读顺序 JSON、图片、表格 HTML、公式 LaTeX、bbox 和逐页图片；详见 `mineru-integration.md`。
- 如果当前链路暂未接入 MinerU，必须调用可用的文本转换/OCR 工具提取文字，例如 `convert_to_text`；只调用 `read_file` 后直接 `create_file` 判定为失败。
- 如果系统链路支持 OCRmyPDF，可先把 PDF 处理成带 OCR 文本层的 searchable PDF，再读取文本。
- MinerU/OCR 负责提取可编辑文本、表格、公式和阅读顺序；真实图片和逐页截图负责保真。HTML 不能只贴图，也不能只贴 OCR 文本。
- OCR 结果不完整时，不得只交付 OCR 到的部分题目；必须保留原页图或提示无法完整重排。
- 图片里的文章段落、题目、答案、解析、表格、填空题应先转成可编辑 HTML 段落、题目块、答案区或 `<table>` 再排版；纯文字/表格截图转写成功后不再强制作为 `<img>` 计数，图片只作为校验或识别失败兜底。不要把可 OCR 的文字截图原样贴成图片来冒充“读图”，也不要把它们集中放成开头图片合集。
- 必须为每张图片建立读取台账：`图片编号 / 类型(文字、表格、题目、答案、视觉图) / OCR或保真结果 / 最终 HTML 去向 / 验收片段`。台账必须覆盖所有图片编号；每张图片至少抽取 1 个唯一验收片段，用于最终 `--require-text-snippet` 校验。
- 台账中的 OCR 或表格内容必须来自 `convert_to_text`、MinerU、图片 OCR、真实图片 URL 或后端素材包，不能来自用户 prompt 中给出的验收片段。
- 一比一复原时，正文中的题内图必须来自真实原图裁剪或原页截图；不能用 SVG、Canvas、AI 图、纯 CSS 图形替代。
- 禁止用“[此处保留原卷图形]”“[此处原卷为...]”“图略”“占位说明”“请参考原卷保真层”“更多题目请参考原卷”等文字代替原图或缺失题目；没有真实 `<img>` 就不能宣称已保留原图。
- `create_file` 之前必须已经拿到逐页图片 URL、截图 URL 或题内原图 URL，并确认这些 URL 来自工具返回结果。只有 PDF URL 时，不得生成空白 PDF 嵌入框，也不得自己拼出 `page_1.png` 或 `pdf?page=1` 之类地址冒充保真。
- 如果只有 OCR/转换文本和原文件 URL，没有任何真实图片 URL，必须停止在 Phase 1.2，不能进入 HTML 生成；输出阻塞说明即可。
- 对 Office 文档，`convert_to_text` 只给正文但没有图片 URL 时，不能默认“文档无图”。只要用户要求读图/带图，或标题、题干、教案步骤中有插图、截图、图示、看图、image/figure/media 等线索，就必须阻塞或要求后端提供图片提取结果；禁止发布 `imgCount=0` 的 HTML。
- 对 Office 文档，如果已知源文件包含 N 张必须视觉保真的图片，最终 HTML 必须包含不少于 N 个真实 `<img>`；如果其中部分是纯文字/表格截图，则必须 OCR 成可编辑文本或表格并在验收中检查文本片段/表格内容，不能只放 1 张图通过验收。
- 对 Office 文档，如果图片对象是文章正文或答案截图，最终正文/答案区必须出现 OCR 后的完整文本；不要额外生成 `.visual-assets` 图片墙。若保留校验图，只能放在语义位置附近或文末附录，不能放在正文开头打乱阅读顺序。
- 对 Office 文档，只验证少数总片段不能证明“所有图片都读了”。必须逐图验证：长文截图验证关键句，表格截图验证表头和至少一个单元格，答案截图验证答案/解析片段。

## Phase 1.5：保真专项检查

试卷、题单、PDF、截图类输入必须额外检查：

- 分数/公式：`\\(\\dfrac{7}{9}\\)` 这类内容必须渲染成真正数学公式，不能作为可见源码露出。
- 原图/图形：原卷中的几何图、统计图、表格、电路图、光路图必须用真实 `<img>` 保留；无法可靠重绘时直接保留原图区域或原页面截图。
- 一比一复原：真实原图是唯一合格来源。`generate_image` / `picture_gen` / AI 插画 / SVG 猜画 / Canvas 重绘 / CSS 图形均不能通过“一比一原图复原”验收。
- 美化重排：真实图保真通过后，必须把题目重组成高级 A4 版式；不能只输出原卷逐页图片，也不能只输出 OCR 文本。
- 原页保真：上传 PDF 必须使用逐页图片或页面截图作为视觉层；空白 `<object>`/`<iframe>` PDF 框不合格。
- 题量：先记录原始题量，再记录 HTML 题量，两者必须一致；排不下就自动增加页数，不能删题。

### PDF 原图保留最低实现

当上传资源是 PDF，最低可接受实现是“逐页图片 `<img>`”。如果当前工具链只能拿到 PDF URL，不能拿到逐页图片或截图，必须说明链路缺少 PDF 转图能力，不能生成空白 PDF 框，不能只重排前几题，也不能生成任何“看似完成”的 HTML 文件。

```html
<section class="source-pages">
  <h2>原卷逐页图片</h2>
  <figure class="source-page keep-together">
    <img src="原卷第1页图片URL" alt="原卷第 1 页" />
  </figure>
  <figure class="source-page keep-together">
    <img src="原卷第2页图片URL" alt="原卷第 2 页" />
  </figure>
</section>
```

禁止使用 `[此处保留原卷图形]`、`[此处原卷为...]`、`图略`、`占位说明`、`原图见附件`、`请参考原卷保真层`、`更多题目请参考原卷` 等文字代替真实图片或缺失题目。PDF/截图类 HTML 中如果 `<img>` 为 0，必须判定失败并明确阻塞，不能生成 HTML 文件。

禁止编造图片 URL。以下写法全部判定失败：

- `https://resource.feixiang.cn/{resourceId}/xxx_page_1.png`
- `https://api.feixiang.cn/file/download/{resourceId}/xxx.pdf?page=1`
- 任何未由工具返回、靠猜测拼出来的图片地址
- 带 `onerror="this.style.display='none'"` 的图片保真层

### 停止输出模板

没有真实图片 URL 时，不要创建 HTML。直接回复：

```plain
当前无法完成精美排版：已完成 OCR/文本提取，但当前工具链没有返回 PDF 逐页图片、页面截图或题内原图 URL。
为避免丢失原卷图形或生成伪保真结果，本次不生成 HTML。
需要后端先提供 PDF 转图/图片提取资源后再排版。
```

## Phase 2：场景与风格选择

| 场景 | 默认排版策略 |
|---|---|
| 试卷/题单 | 一比一保留真实图和题量，重排正文为高级 A4 试卷：题型层级清晰、答题区标准、图文邻近、紧凑但不拥挤 |
| 英语练习单 | 题型结构稳定，填空横线标准，支持模板锁定与单元替换 |
| 默写纸 | 答题区清晰，横线/格线适合手写 |
| 知识清单 | 分区、表格、重点框，信息密度高 |
| 教案打印版 | 保持教学环节，不排成阅读材料 |
| 语文古诗文 | 克制、雅致、纸面友好，避免波普风 |
| 趣味低幼练习 | 可用活泼风格，但不得牺牲可读性和打印性 |

## Phase 3：HTML 输出要求

单文件 HTML，必须包含：

1. `https://unpkg.com/pagedjs@0.4.3/dist/paged.polyfill.js`
2. `@page { size: A4 portrait; margin: 10mm 12mm; }`
3. `@media print` 打印样式
4. `.no-print` 打印隐藏
5. `table, figure, img, .keep-together { break-inside: avoid; }`；禁止给 `.question`、`.question-group`、`.question-item`、`.answer-area`、`.point-card`、`.section`、`.main`、`.card`、`.page` 这类普通题块/重复卡片/大容器统一 `break-inside: avoid`
6. 右下角打印按钮：`window.print()`
7. 出现分数、根式、方程、百分式、LaTeX 源码时必须引入 MathJax 渲染公式
8. PDF/截图类必须包含真实 `<img>` 原卷资源层；`<object>`、`<embed>`、`<iframe>` 只可作为下载补充，不能作为保真通过依据
9. `<img src>` 必须是工具返回的真实图片 URL，禁止编造、猜测、拼接图片地址
10. 禁止手动切固定高度页面，交给 Paged.js 自动分页
11. 内容密集型 A4（讲义/教案/题单）优先使用 `@page { size: A4 portrait; margin: 10mm 12mm; }`，正文字号 10.5-11.5pt，段落/题块间距不超过 3-4mm；禁止用大卡片、大留白把一页拆得很短
12. 禁止给 `.question`、`.question-group`、`.question-item`、`.answer-area`、`.point-card` 等普通题块或大量重复小卡片默认 `break-inside: avoid`；只对真实图片、表格、很短且必须同页的关键题组添加 `.keep-together`

脚本顺序必须是：

```html
<script>
  window.MathJax = {
    tex: {
      inlineMath: [['\\(', '\\)'], ['$', '$']],
      displayMath: [['\\[', '\\]']]
    },
    svg: { fontCache: 'global' },
    startup: { typeset: false }
  };
</script>
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
<script>
  window.PagedConfig = {
    before: async () => {
      if (window.MathJax?.typesetPromise) {
        await window.MathJax.typesetPromise();
      }
    }
  };
</script>
<script src="https://unpkg.com/pagedjs@0.4.3/dist/paged.polyfill.js"></script>
```

### 选项排版规则（v50 强化）

数学/含公式/含图选项必须遵守：

```css
/* ✅ 默认：2 列布局（推荐） */
.options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4mm 8mm;
  align-items: start;
}

/* ✅ 复杂选项（含分数 + 长表达式 + 图）：单列 */
.options.options-stacked {
  grid-template-columns: 1fr;
}

/* ✅ option-box 与选项文字 必须 同 DOM 父节点 */
.option-item {
  display: flex;
  align-items: flex-start;
  gap: 4mm;
}
.option-box {
  flex: 0 0 auto;
  width: 14px;
  height: 14px;
  border: 1px solid #333;
  margin-top: 0.6em; /* 与文字基线对齐 */
}
```

```css
/* ❌ 禁止：4 列 grid 装分数选项 → 行高乱、孤立方框 */
.options {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 仅当所有选项都是 1 字符短文本时允许 */
}
```

**判定**：

| 选项内容 | 默认列数 | 备注 |
|---|---:|---|
| A. 一 / B. 二 / C. 三 / D. 四（1-2 字短文本） | 4 | 唯一允许 4 列的场景 |
| A. 4 / B. 6 / C. 8 / D. 12（纯数字） | 4 | 允许 |
| A. \(\frac{2}{9}\) / B. \(\frac{7}{9}\) / C. 1 / D. \(\frac{9}{7}\)（含分数） | **2** | **强制** |
| A. \(\frac{198}{102}\times 100\%\) ... 4 个长百分式 | **2 或 1** | **强制** |
| 含 `<img>` 选项（如对称轴图选择） | **2 或 1** | **强制**，且每个选项必须 `.keep-together` |
| 含数学符号 + 文字混排（"无解 / 一个解 / 两个解 / 无穷解"） | 2 或 4 | 单选项 ≤ 6 字符可 4 列，否则 2 列 |

### MathJax 标准链路（v50 强化）

**唯一允许的 MathJax 加载方式**：

```html
<script>
  window.MathJax = {
    tex: {
      inlineMath: [['\\(', '\\)'], ['$', '$']],
      displayMath: [['\\[', '\\]']]
    },
    svg: { fontCache: 'global' },
    startup: { typeset: false }
  };
</script>
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
<script>
  window.PagedConfig = {
    before: async () => {
      if (window.MathJax?.typesetPromise) {
        await window.MathJax.typesetPromise();
      }
    }
  };
</script>
<script src="https://unpkg.com/pagedjs@0.4.3/dist/paged.polyfill.js"></script>
```

**禁止**：

- 替换 MathJax CDN 为 `metis-online.fbcontent.cn/metis-misc/...` 或任何未公开验证等价于 tex-svg.js 的脚本（v49 真实失败原因之一）；
- 使用 `tex-mml-chtml.js` / `tex-chtml.js` 等非 SVG 模式（CHTML 在打印 PDF 中字体处理不稳定）；
- 把 LaTeX 源码写进 `<code>` / `<pre>` / `<textarea>`（这些标签里的内容 MathJax 不会处理）；
- MathJax 在 Paged.js 之后加载（顺序错则公式来不及渲染）。

## Phase 3.fullpage：原卷整页保真打印版（v50 新增降级模式）

**触发**：Phase 1.3 判定为"全部补充图均为 source-page"且用户**明确同意**"我只要原卷整页打印版/原卷直接打印"。

**这是受控降级模式**，不是默认推荐。

### HTML 模板要点

```html
<header class="banner banner-fullpage">
  <h1>《XXX 试卷》原卷整页保真打印版</h1>
  <p class="fullpage-tag">原卷整页扫描打印版（非设计师级重排）</p>
  <p class="fullpage-warning">本版本由原卷整页扫描组成，未做题号级重排和题图裁剪；适合临时打印应急，不替代设计师级精美排版。</p>
</header>

<section class="source-pages source-pages-main">
  <figure class="source-page keep-together">
    <img src="{用户上传的原卷第1页URL}" alt="原卷第 1 页" />
    <figcaption>原卷第 1 页</figcaption>
  </figure>
  <figure class="source-page keep-together">
    <img src="{用户上传的原卷第2页URL}" alt="原卷第 2 页" />
    <figcaption>原卷第 2 页</figcaption>
  </figure>
  <!-- 每张图按 A4 全宽显示，不缩成题图 -->
</section>
```

### Phase 3.fullpage 必须满足

- HTML 中**只有** `.source-pages` 一个主要内容区，**禁止**出现 `.question` / `.question-figure`；
- 每张原卷扫描图按 A4 全宽显示（`width: 100%`），**禁止** `max-height: 80-200px`；
- 标题与首屏必须含 `.fullpage-tag` 与 `.fullpage-warning`，措辞含"原卷整页"和"非设计师级重排"或等价表述；
- 不引入 MathJax（没有要渲染的公式）；仍引入 Paged.js 用于 A4 分页和打印按钮；
- 不应对原卷扫描图做切片、压缩、CSS 缩放；
- guard 检测 `--require-fullpage-disclaimer` 通过；
- 不混用文字版降级（`.text-only-tag`）与整页保真版（`.fullpage-tag`），互斥。

### Phase 3.fullpage 与 text-only 的区别

| 模式 | 产物 | 适用 | 标识 |
|---|---|---|---|
| Phase 3 标准 | A4 设计师级重排 + 真实题图 + 答题区 | 素材齐全（题号级结构 + 真实题图 + 答案） | 无特殊标识 |
| Phase 3.fullpage | 仅原卷整页扫描的 A4 打印版（**有图**） | 用户只要打印原卷应急 | `.fullpage-tag` + `.fullpage-warning` |
| Text-only 降级 | 仅 OCR 文字 + 公式（**无图**） | 用户明确放弃图形条件 | `.text-only-tag` + `.text-only-warning` |

互斥规则：同一 HTML 中 `.fullpage-tag` 与 `.text-only-tag` 不能同时存在。

## Agent 手工自检协议（13 条，v50 强制）

如果 `tools/magazine-layout-guard` 与 `tools/print-preview-guard` 在当前后端无法实际运行，Agent **在 `create_file` 之前必须**对照下表逐条手工检查并在响应里写出"已自检"的结论。任一项未通过，停止 `create_file`。

| # | 检查项 | 通过条件 | 失败动作 |
|---|---|---|---|
| 1 | **MathJax 标准链路** | `<script src>` 包含 `cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js` | 改 src，或解释为何用了等价脚本 |
| 2 | **@page margin ≤ 12mm** | CSS `@page` 中 `margin` 不超过 `12mm`（如 `10mm 12mm`） | 改成 `10mm 12mm` 或更紧 |
| 3 | **普通题块没有 `break-inside: avoid`** | 不允许 `.question/.question-group/.question-item/.answer-area/.point-card/.section/.card/.page` 任一选择器加 `break-inside: avoid` 或 `page-break-inside: avoid` | 删除该 CSS 规则；只保留 `table/figure/img/.keep-together` |
| 4 | **source-page 不当 question-figure** | `.source-pages` 内的 `<img src>` 与 `.question .question-figure <img src>` 集合无交集 | 阻塞或重新走 figure-cropping 真实裁剪 |
| 5 | **同 src 复用率受限** | 任一 `<img src>` 被 `<figure class="question-figure">` 引用次数 ≤ 2 | 阻塞，要求按题号补真实题图 |
| 6 | **A4 比例图不被 max-height 缩小** | 自然尺寸长宽比在 0.62-0.78 区间的 `<img>` 不允许 `max-height < 250px`（≈660px @300dpi 打印 = 56mm） | 改为按 figure-cropping 最小宽度，或退回 source-page 附录 |
| 7 | **source-pages 不前置图片墙** | `.source-pages` 在 DOM 中排序 ≥ 50% 文档位置（即靠后），不在正文开头 | 移到文末附录 |
| 8 | **无占位话术** | HTML 不含"图略 / 占位 / 请参考原卷 / 预留位置 / 此处原卷为 / 对照原卷使用 / 更多题目请参考" | 替换为真实内容或阻塞 |
| 9 | **分数选项不用 4 列 grid** | 含 `\frac` / `\dfrac` / `<img>` / 长表达式的 `.options` CSS 不使用 `repeat(4, 1fr)` | 改 `repeat(2, 1fr)` 或 `1fr` |
| 10 | **无孤立方框成串** | HTML 渲染后 `<div class="option-item">` 内 `<span class="option-box">` 与文字必须同父节点；不允许出现连续 ≥3 个 option-box 单独成行 | 改 .option-item 结构，使 box 与文字 flex 绑定 |
| 11 | **text-only 必须用户明确同意** | 含 `.text-only-tag` 的 HTML，用户消息历史里必须有"忽略图片/只要文字版/不管图"等明确字眼 | 否则改回阻塞 |
| 12 | **答案/解析完整保留** | 若源文档存在"参考答案/答案/解析"，最终 HTML 中每题答案与解析逐条出现，不只保留选项字母 | 补全答案 |
| 13 | **未用 generate_image 替学科原图** | 学科为数学/物理/化学/生物/地理时，HTML 中 `<img>` 不允许出现 AI 生成图（即使有 figcaption "AI 辅助插图"，学科原卷场景也禁止使用） | 删除 AI 图，阻塞要原图 |

**写入响应模板**（建议交付时贴一份）：

```plain
[Agent 手工自检 13 条]
1. MathJax 标准链路 ✅ 使用 cdn.jsdelivr.net/.../tex-svg.js
2. @page margin ≤ 12mm ✅ 10mm 12mm
3. 普通题块无 break-inside: avoid ✅ 仅 table/figure/img/.keep-together
4. source-page 不当 question-figure ✅ 两组 src 无交集
5. 同 src 复用 ≤ 2 ✅ 最大复用 1 次
6. A4 比例图未被 max-height 缩小 ✅ 题图已按 figure-cropping bbox 裁剪
7. source-pages 在文末 ✅ 位于文档第 92% 处
8. 无占位话术 ✅
9. 分数选项 ≤ 2 列 ✅
10. 无孤立方框 ✅
11. 非 text-only ✅
12. 答案/解析完整 ✅ 30 题 30 解析
13. 未用 generate_image 替原图 ✅
```

## 模板锁定规则

当用户说以下任一句，进入模板锁定：

- “记住这个格式”
- “下次按这个来”
- “按照 resourceId XXXX 一模一样的格式”
- “参考我给的文件，格式排版要一模一样”
- “继续制作 Unit 5 / 下一个单元”

锁定后分两层：

- 固定层：布局方式、配色、字体字号、页边距、题型结构顺序、排版规则、技术规格。
- 可变层：年级/学科/单元、具体词汇与语法、阅读语篇、题目内容。

任何固定层变化必须由老师主动要求，AI不得自行调整。

## 禁止事项

- 禁止删题、换题、改题、漏题。
- 禁止题量大幅缩水。
- 禁止把原图丢失后自行生成错误图。
- 禁止使用“[此处保留原卷图形]”“[此处原卷为...]”“占位”“图略”“请参考原卷保真层”“更多题目请参考原卷”等文字代替真实图片或缺失题目。
- 禁止在 HTML 中 `<img>` 为 0 的情况下交付 PDF/截图类试卷。
- 禁止在没有真实图片 URL 时调用 `create_file` 生成 HTML。
- 禁止把空白 `<object>`、`<embed>`、`<iframe>` PDF 框当成原卷保真层。
- 禁止编造图片 URL；没有工具返回的逐页图片/截图/题内图 URL 时，不得创建图片保真层。
- 禁止使用 `onerror` 隐藏图片加载失败或显示“请参考 PDF 附件”类 fallback。
- 禁止只调用 `read_file` 就处理扫描 PDF/截图卷；必须调用 OCR/文本转换工具。
- 禁止调用 `mathdesign-1-html` 或其他 HTML/排版 Skill 覆盖本 Skill 的 Paged.js、MathJax、PDF 保真规则。
- 禁止公式、分数、单位、已知量错误；禁止把 `\\(\\dfrac{}{}\\)` 原样显示给用户。
- 禁止第一页空白。
- 禁止中文资料出现无意义英文标题。
- 禁止黑底白字作为默认打印风格。
- 禁止上传教案后排成阅读材料。
- 禁止未命中用户要求时一页两栏。

## 验收清单

- [ ] 输入内容已完整复现，题目数量不缩水。
- [ ] 已按“输入判定表”判断当前任务是可生成还是必须阻塞。
- [ ] 未调用 `mathdesign-1-html`、`html-authoring`、`page-optimize`、`mathdesign-*` 等冲突 Skill。
- [ ] 标题、题号、题型顺序、图片、公式、表格均保留。
- [ ] 分数、根式、方程等数学内容已被 MathJax 或等效方式正确渲染。
- [ ] 原卷图形、图表、几何图、电路图没有丢失。
- [ ] PDF/截图类输入已使用 OCR/文本转换辅助提取，并使用真实 `<img>` 保留逐页图片、截图或题内原图。
- [ ] PDF/截图类 HTML 中 `<img>` 数量大于 0，没有空白 PDF 框、占位文字或“参考原卷”话术冒充原图/题目。
- [ ] 所有 `<img src>` 都来自工具返回的真实 URL，不是根据 resourceId 猜测拼接出来的地址。
- [ ] 没有 `onerror` 隐藏图片加载失败。
- [ ] 没有 `[此处原卷为...]`、`[此处保留...]` 等文字代图。
- [ ] 如果没有真实图片 URL，已停止生成 HTML 并返回阻塞说明。
- [ ] 第一页不是空白页。
- [ ] A4 打印预览正常。
- [ ] 题目、表格、图片不被分页切断。
- [ ] 填空横线为标准单横线，适合手写。
- [ ] 风格与学科/场景匹配。
- [ ] 对 PDF/截图/扫描卷，已按 `quality-gate.md` 的 CLI 参数做同等自检：`--require-real-images --require-mathjax --require-compact-a4`，并按原卷题量设置 `--min-questions`。
- [ ] HTML 可直接浏览器打开并打印。
- [ ] 已运行 Layer 3：`tools/magazine-layout-guard`，退出码 0。
- [ ] 已运行 Layer 4：`tools/print-preview-guard`，退出码 0；打印 PDF 首页非空、空白页比例 ≤ 0.15、文本量与 HTML 比 ≥ 0.85、图片量差 ≤ 1。
- [ ] 图形依赖型试卷未走 text-only 默认降级；如确为用户明确同意的文字版，标题与首屏已标注“文字版，不含原图形条件”。
- [ ] 没有“题内 figure URL 与 source-page URL 相同”的伪裁剪。
- [ ] 所有截图都已按 `screenshot-classification.md` 分类，没有 `type=unknown`。
- [ ] 题内图都已按 `figure-cropping.md` 满足最小可读宽度。
