---
name: magazine-layout
description: 精美排版唯一主 Skill。Use when 用户要求把已给定内容或上传文档改造为 A4 打印友好的高级试卷、讲义、练习单、题单、默写纸、知识清单、教案打印版、杂志风资料，或提到精美排版、高级排版、好看、美化、可打印、A4、一比一、还原、原卷图、按这个格式来。**v60 协议**：① 每轮第一条工具调用必须是 `skills(name="magazine-layout")` 加载本规则；② 推荐输入是用户上传的 `*.source-package.json`（线下用 mineru 跑出、含全部图片 base64 + routing + quality），用 `read_file` 一次读完即可拿到所有结构化字段；③ 若用户没传 source-package、只传原始 PDF/DOCX/PPTX，先 `convert_to_text` 拿 OCR 文本；图形依赖型试卷（数学/物理/化学/生物/地理或含"如图/统计图/电路图/示意图"）直接阻塞并指引用户先用 mineru 跑出 source-package；纯文字资料才允许走 `text_only_degraded` 文字版且首屏标注；④ 路由选 4 个模板族之一（`assessment_work` / `learning_document` / `knowledge_reference` / `magazine_reading`），用户侧 8 个 subtype（exam_paper / practice_sheet / question_set / dictation_sheet / teacher_lesson_plan / student_handout / knowledge_sheet / magazine_article）通过参数化变化（style_preset / density / columns / answer_space）实现，详见 `template-families.md`；⑤ 不删题、不换题、不漏题；不丢图、不伪造图；含 `\frac/\dfrac/<img>/长表达式` 的选项严禁 4 列 grid（默认 2 列或单列）；MathJax 必须用 `https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js` 并在 `PagedConfig.before` 等 `typesetPromise()`；@page margin ≤ 12mm；`.question/.question-group/.section/.card/.page` 等普通题块禁止批量 `break-inside: avoid`，仅 `table/figure/img/.keep-together` 防拆；⑥ 数学/物理/化学/生物/地理学科严禁用 `generate_image` 替代原卷图；杂志风/语文/英语装饰图允许 AI 配图但必须 figcaption 标注 "AI 辅助插图"；⑦ 源文档存在"参考答案/答案/解析"必须完整保留每条；⑧ `create_html_deliverable` 之前必须执行 8 项手工自检，任一未过不得交付；⑨ 已 `ask_user` 后本轮严禁继续 `create_html_deliverable` 生成占位/降级版。
---

更新时间：2026-05-09

# 精美排版 magazine-layout · v60

## 使用时机

把已给定内容或用户上传文档改造为「A4 打印友好的高级纸面资料」时使用：

- 试卷、练习单、题单、默写纸（assessment_work 族）
- 讲义、教案打印版（learning_document 族）
- 知识清单、公式表、语法清单、易错点清单（knowledge_reference 族）
- 杂志风资料、主题阅读、项目化学习材料（magazine_reading 族）
- 常见触发词：A4、可打印、打印友好、纸张、分页、精美排版、高级排版、好看、美化、原卷图、一比一、复原、按这个格式来

不适用于：

- 屏幕优先的交互动画、教学游戏、单页课件 → 走 `mathdesign-1-html`、`html-authoring`
- 多页 PPT 式课件 → 走 `courseware-generator`
- 需要重新搜题/组题 → 走 `paper-generation`
- 上传 HTML 后要求保结构换内容的同款复刻 → 模板锁定（见下文）

## 输入：mineru source-package（主路径）

> v60 的核心简化：**让上游 mineru 把脏活干完**，本 skill 只负责 重排 → 模板族选择 → A4 美化 → 自检 → 交付。

**最佳输入**：用户在线下用 mineru pipeline / vlm 后端跑出文件、再用 `mineru_to_package.py` 打包成的 `*.source-package.json`，单文件包含：

```jsonc
{
  "schema": "magazine-layout/source-package@v1",
  "source": { "fileName", "parser": "mineru", "parseMode": "pipeline|vlm" },
  "document": { "title", "subject", "grade", "markdown" },   // markdown 全文内嵌
  "blocks": [                                                  // 按阅读顺序的结构化块
    { "type": "text",  "text": "...", "page_idx": 0 },
    { "type": "image", "src": "images/xxx.jpg", "page_idx": 1 },
    { "type": "table", "table_body": "<table>...</table>" },
    { "type": "equation", "text": "x^2+y^2=1" }
  ],
  "imageLedger": [                                             // 每张图：data URI + 角色 + 尺寸
    {
      "filename": "images/xxx.jpg",
      "role": "page_full|figure_diagram|figure_inline|formula_block|formula_inline|unknown",
      "naturalSize": { "width": 720, "height": 440 },
      "dataUri": "data:image/jpeg;base64,..."   // 直接可用
    }
  ],
  "routing": { "recommendedFamily", "recommendedSubtype", "confidence", "reasons", "candidates" },
  "quality": { "blockCount", "questionCount", "answerCount", "warnings", "missingImages" }
}
```

**读取方式**：

```text
read_file(resourceId=用户上传 source-package.json 的 id)
  ↓
拿到 schema/source/document/blocks/imageLedger/routing/quality 全部字段
  ↓
直接走 Phase 2 模板族选择 + Phase 3 HTML 生成
```

**source-package 已经替你做了**：

- 题号级结构提取（blocks 顺序 = 阅读顺序）
- 图片识别 + 角色分类 + base64 内嵌（imageLedger.role 已标好）
- 公式 / 表格 / 答案抽取
- 路由建议（routing.recommendedSubtype）
- 质量统计与警告（quality.warnings）

**所以 v60 的 skill 不再需要**：自己 OCR、自己拆题、自己识别 bbox、自己分类截图、自己 PDF 转图。这些都被 mineru 做掉了。

## 输入：原始文件 fallback（降级路径）

当用户没传 source-package、只传了 PDF/DOCX/PPTX/XLSX/图片时：

```text
1. 调用 convert_to_text 拿 OCR 文本（可读字符）
2. 按以下三类分流：
   a. 纯文字资料（讲义无图 / 默写纸 / 答案订正等）→ 进入 Phase 2，按 text_only 模式生成
   b. 图形依赖型试卷或资料（数学/物理/化学/生物/地理或含"如图/示意图/统计图/电路图/光路图/实验装置/几何图/数轴"）
      → 阻塞，按下方阻塞模板告知用户「请先用 mineru 跑出 source-package 再上传」
   c. 含图但非图形依赖（语文/英语阅读、知识清单、杂志风）→ 询问用户是否接受文字版（不含原图）
3. 进入 Phase 2 时必须在交付物 cover 标注 "未走结构化解析 / 文字版"
```

**降级阻塞模板**：

```plain
当前不生成精美 A4 重排：上传文件含图形条件（如图 / 统计图 / 电路图等），
convert_to_text 只能拿到文字层，无法获取真实题内图，会导致原卷图形丢失。

请采用以下任一方式：
① 推荐：本地用 mineru 跑出 source-package.json 再上传（保留题号、图片、公式、答案完整结构）
② 仅文字版（不可作为完整试卷使用）：明确回复"我接受文字版，不需要原图"，会输出标注的文字版 HTML
```

**降级路径绝对禁止**：

- 把 `convert_to_text` 拿到的整页扫描图当 question-figure（同一 src 被多题复用）
- 把 OCR 文字截图当成"原图保真"
- 用 generate_image / SVG / Canvas 替代学科原图

## 模板族与场景映射

详细规则、参数、示例片段写在 [`template-families.md`](template-families.md)，必读。摘要：

| 用户场景词 | 工程模板族 | 工程 subtype | 默认风格 | 默认密度 |
|---|---|---|---|---|
| 试卷、卷子、期末/期中 | `assessment_work` | `exam_paper` | classic_black_white | compact |
| 练习单、巩固训练 | `assessment_work` | `practice_sheet` | classic_black_white | compact |
| 题单、专题、错题集 | `assessment_work` | `question_set` | academic_blue | compact |
| 默写纸、听写、单词/古诗 | `assessment_work` | `dictation_sheet` | classic_black_white | spacious |
| 教案、教师备课打印 | `learning_document` | `teacher_lesson_plan` | academic_blue | compact |
| 讲义、学生学习材料 | `learning_document` | `student_handout` | warm_amber / academic_blue | standard |
| 知识清单、公式表、语法清单 | `knowledge_reference` | `knowledge_sheet` | academic_green | compact |
| 杂志风、主题阅读、项目化学习 | `magazine_reading` | `magazine_article` | magazine_light | spacious |

**模板不是固定 HTML，而是参数化生成系统**：同一个 source-package 通过修改 `style_preset / density / columns / answer_space / fidelity_mode` 即可切换风格。优先用 routing.recommendedSubtype 给的建议，只有用户显式说"我要 X"（"做成默写纸""做成杂志风"）才覆盖。

## 工作流程（v60 四阶段）

```plain
Phase 0：加载本 skill 规则
  必读：SKILL.md（本文件）、mineru-input-contract.md、template-families.md、
        pagedjs-template.md、quality-gate.md
  禁止：调用 mathdesign-1-html / html-authoring / page-optimize 等其他 HTML/排版 skill
        ↓
Phase 1：读取输入
  优先：read_file(source-package.json) 一次拿全
  降级：convert_to_text + 按上方分流
        ↓
Phase 2：路由 + 配置
  优先用 routing.recommendedSubtype；用户显式场景词覆盖
  根据 4 模板族 × 8 subtype × 参数（style_preset/density/columns/answer_space）确定版式
        ↓
Phase 3：生成 HTML + 8 项手工自检 + 交付
  按 template-families.md 与 pagedjs-template.md 写 HTML
  执行 8 项手工自检（见下方），任一未过停止交付
  通过后 create_html_deliverable
```

**Phase 0 重读触发点**：用户回复 ask_user 后、补传新文件后、距上次 `skills` 调用 ≥3 个工具调用且即将 create_html_deliverable 时，必须重新调 `skills(name="magazine-layout")`。

## 8 项手工自检（v60 强制）

`create_html_deliverable` 之前必须逐条对照、并在响应里贴出"已自检"。任一未过停止交付。

| # | 检查项 | 通过条件 |
|---|---|---|
| 1 | **MathJax 标准链路** | `<script src>` 包含 `cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js`，并配置了 `PagedConfig.before` 调用 `typesetPromise()` |
| 2 | **Paged.js 0.4.3** | 使用 `unpkg.com/pagedjs@0.4.3/dist/paged.polyfill.js`；MathJax 在 Paged.js 之前加载 |
| 3 | **@page margin ≤ 12mm** | CSS `@page` 中 `margin` 不超过 `12mm`（如 `10mm 12mm`） |
| 4 | **普通题块无 `break-inside: avoid`** | `.question / .question-group / .question-item / .answer-area / .point-card / .section / .card / .page` 任一选择器都不允许加 `break-inside: avoid`；只对 `table / figure / img / .keep-together` 防拆 |
| 5 | **题量与图片无丢失** | source-package 的 `quality.questionCount` ≤ HTML 内 `.work-question / .lesson-question / .q-item` 数量；`imageLedger` 中 `role != unknown` 的图全部出现在 HTML 中 |
| 6 | **答案/解析完整** | 若 source-package 的 `quality.answerCount > 0`，HTML 必须保留每条答案与解析（不只是选项字母） |
| 7 | **分数选项不用 4 列 grid** | 含 `\frac / \dfrac / <img> / 长表达式` 的 `.options` CSS 不使用 `repeat(4, 1fr)`；改 `repeat(2, 1fr)` 或 `1fr` |
| 8 | **未用 generate_image 替学科原图** | 学科为 math/physics/chemistry/biology/geography 时，HTML 中 `<img>` 不允许出现 AI 生成图。杂志风/语文/英语的 AI 配图必须 figcaption 标注 "AI 辅助插图" |

**自检写入响应模板**：

```plain
[Agent 手工自检 8 项]
1. MathJax 标准链路 ✅
2. Paged.js 0.4.3 ✅
3. @page margin ≤ 12mm ✅ 10mm 12mm
4. 普通题块无 break-inside: avoid ✅
5. 题量/图片无丢失 ✅ 30 题、12 张图全部到位
6. 答案/解析完整 ✅
7. 分数选项 ≤ 2 列 ✅
8. 未用 generate_image 替原图 ✅
```

## 可调用 tool（v60 实测清单）

仅列出本 skill 主路径会用到的：

| 工具 | 用途 | 阶段 |
|---|---|---|
| `skills` | 加载本 skill 规则 | Phase 0 |
| `read_file` | 读用户上传的 source-package.json | Phase 1 主路径 |
| `read_url` | 必要时读外链文档 | Phase 1 |
| `convert_to_text` | 降级路径：从 PDF/DOCX/图片 拿 OCR 文本 | Phase 1 fallback |
| `ask_user` | 缺信息时表单询问 | 任意阶段 |
| `think` | 内部思考规划 | 任意阶段 |
| `search_html_component` / `get_html_component_detail` | 复用现有 HTML 组件库 | Phase 3（可选） |
| `generate_image` | 仅杂志风/语文/英语装饰图，**禁止用于学科原卷** | Phase 3（可选） |
| `create_html_deliverable` | 最终 HTML 交付 | Phase 3 完成 |

**严禁调用**：

- `mathdesign-1-html`、`html-authoring`、`page-optimize`（功能冲突）
- `parse_pptx`（其输出是合并 HTML，不是结构化数据；如需 PPTX 走精美排版，先用 mineru 跑 source-package）
- `picture_gen` / `image_create` / `picture_edit` / `edit_image` 用于学科原卷题图

## 模板锁定规则（保留 v50 行为）

用户说以下任一句即进入模板锁定：

- "记住这个格式" / "下次按这个来"
- "按照 resourceId XXXX 一模一样的格式"
- "参考我给的文件，格式排版要一模一样"
- "继续制作 Unit 5 / 下一个单元"

锁定分两层：

- **固定层**：布局方式、配色、字体字号、页边距、题型结构顺序、排版规则、技术规格
- **可变层**：年级/学科/单元、具体词汇语法、阅读语篇、题目内容

任何固定层变化必须由老师主动要求。

## 禁止事项（精简版）

- 禁止删题、换题、改题、漏题
- 禁止题量大幅缩水
- 禁止把原图丢失后自行生成错误图、用 AI 图替代学科原卷题图
- 禁止使用"[此处保留原卷图形]""图略""请参考原卷"等占位文字
- 禁止 `<img>` 用 `onerror` 隐藏失败、编造未由工具返回的图片 URL
- 禁止把空白 `<object>/<embed>/<iframe>` PDF 框当原图保真
- 禁止 `mathdesign-1-html` 等 HTML/排版 skill 覆盖本 skill 的 Paged.js / MathJax / 模板族规则
- 禁止公式渲染失败（`\\(\\dfrac{}{}\\)` 原样显示）
- 禁止第一页空白
- 禁止中文资料出现无意义英文标题
- 禁止黑底白字作为默认打印风格
- 禁止上传教案后排成阅读材料
- 禁止用普通题块批量 `break-inside: avoid` 制造大面积空白
- 禁止已 `ask_user` 之后再继续 `create_html_deliverable` 生成占位 HTML

## 文件说明

| 文件 | 用途 | 何时读取 |
|---|---|---|
| `SKILL.md` | 总览、触发、主流程、自检（本文件） | 首先读取 |
| [`mineru-input-contract.md`](mineru-input-contract.md) | source-package.json 字段合同、读取流程、降级路径详解 | Phase 1 必读 |
| [`template-families.md`](template-families.md) | 4 模板族 × 8 subtype × 参数化系统 + 8 个示例片段 | Phase 2 必读 |
| [`pagedjs-template.md`](pagedjs-template.md) | A4 + Paged.js 0.4.3 + MathJax 标准 HTML 模板与 CSS 铁律 | Phase 3 必读 |
| [`quality-gate.md`](quality-gate.md) | 8 项基线自检 + 4 项 subtype 专项自检细则 | Phase 3 必读 |
| [`visual-design-guide.md`](visual-design-guide.md) | 设计 token、题型层级、纸面信息密度、风格预设 | Phase 3 视觉调优 |
| [`math-image-fidelity.md`](math-image-fidelity.md) | MathJax 表达式细节、原图保真规则、题量保真自检 | 处理含公式/图形的资料前必读 |
| [`examples.md`](examples.md) | 8 类场景产物示例与产物特征 | 需要快速对齐风格时读取 |

## 验收清单（精简版）

- [ ] 已通过 8 项手工自检
- [ ] 已按 source-package 路由建议（或用户明确意图）选定 family.subtype
- [ ] 已应用 style_preset / density / columns / answer_space 中至少 2 个参数
- [ ] HTML 可直接浏览器打开并打印（A4 portrait，10mm 12mm 边距）
- [ ] 题目、表格、图片不被分页切断
- [ ] 风格与学科/场景匹配（避免试卷排成杂志风、教案排成学生练习单等）
