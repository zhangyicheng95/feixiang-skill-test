---
name: magazine-layout
description: 精美排版唯一主 Skill。Use when 用户要求把已给定内容或上传文档改造为 A4 打印友好的高级试卷、讲义、练习单、题单、默写纸、知识清单、教案打印版、杂志风资料，或提到精美排版、高级排版、好看、美化、可打印、A4、一比一、还原、复原、真实原图、原卷图、按这个格式来。上传试卷的目标是“真实内容一比一保真 + 设计师级美化重排”：真实原图保真是底线，美化排版是核心交付，二者都必须满足。v50 输入判定：优先消费后端预处理素材包 `material.json` / `image-ledger.json`；只有“题号级结构 + 可编辑正文 + 公式/表格 + 真实逐页图或题内视觉图 URL/bbox + 每张图片读取台账 + 图片文字/表格 OCR 可编辑还原 + A4 紧凑分页策略”齐全时才生成 HTML；若台账出现 `missing_ocr` 或 `not_ready_images` 非空，必须阻塞。若出现 `image_preserved_low_confidence`，不得使用其低置信度 OCR 文本，不得写入验收片段，必须把 `image_path` 对应真实图片作为 `<img>` 放回语义位置并在台账说明“低置信度保真”。PDF/截图/扫描卷/DOC/DOCX/PPTX 的每个图片块必须先分类并逐张记录：纯文字/表格/题目/答案截图先转成可编辑 HTML 文本或表格再排版，图形/照片/示意图/无法可靠 OCR 的区域才作为真实 `<img>` 保真。若图片块主要是文章段落、题目或答案，不得集中做成图片合集，必须按原阅读顺序转写进正文。若任一图片没有来自工具输出的 OCR 文本、没有保真 `<img>`、也没有在读取台账中说明去向，必须阻塞。用户或测试 prompt 提供的验收片段只能用于校验，不能当成 OCR 来源、不能据此“视觉化还原”。一旦阻塞、调用 ask_user 或发现需要补素材，本轮必须终止，禁止之后再调用 create_file 生成占位版/降级版 HTML。若存在必须保留的视觉图片对象、用户要求读图/带图，或转换结果提示 figure/image/media，但工具没有返回真实视觉图片 URL，必须禁止 create_file 并返回缺少图片提取资源的阻塞说明。纯文字截图可以转为可编辑正文，但必须逐张还原到语义位置并纳入验收。A4 分页禁止给 `.question`、`.question-group`、`.question-item`、`.answer-area`、`.point-card`、`.section`、`.card` 等普通题块/重复卡片默认 `break-inside: avoid`，否则会造成大面积空白。内容密集型 A4 必须使用 `@page { size: A4 portrait; margin: 10mm 12mm; }` 或不超过 12mm 的页边距。若源文档有“参考答案/答案/解析”，必须完整保留每条答案与解析，禁止压缩成只有选项字母。禁止 AI 生成图、SVG/Canvas/CSS 猜画、文字占位、少量 OCR 文本或大量空白分页冒充完成。
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

## 硬性执行门槛

以下规则优先级高于所有审美和 HTML 生成习惯：

### 输入判定表（v50）

在任何 `create_file` 之前，必须先按下表判定。判定结果为“阻塞”时，**禁止调用 `create_file`**。

| 输入状态 | 是否可生成 HTML | 必须动作 |
|---|---:|---|
| 普通文本、Markdown、DOCX 文本已完整读出，无原图保真要求 | 可以 | 直接做 A4 高级重排，仍需题量/公式/表格自检 |
| 用户提供参考 HTML、金样 HTML、历史 resourceId，或明确说“按这个格式/一模一样/参考金样/你生成的就很好看” | 可以但必须模板锁定 | 先读取参考 HTML 并列出固定层：DOM 骨架、关键 class、h2/h3 层级、表格/答案区结构、打印 CSS token；生成时固定层不得漂移，只替换内容层；若无法读取参考 HTML 或无法复现固定层，必须阻塞，不能生成“像金样”的近似版 |
| 后端预处理已返回 `material.json` / `image-ledger.json`，且每张图片 `status=ocr_ready` 或有真实保真图片去向，`missing_ocr_images=[]` | 可以 | 以素材包为唯一图片/OCR来源；逐张使用 `validation_snippets` 自检，确保图片文字/表格进入语义位置 |
| 后端预处理素材包存在 `image_preserved_low_confidence` / `preserved_low_confidence_images`，且有真实 `image_path` | 可以 | 不使用其 OCR 乱码，不纳入 `validation_snippets`；必须以真实 `<img>` 保真放回语义位置，并在交付说明中标记低置信度保真 |
| 后端预处理素材包存在 `not_ready_images`，或任一图片为 `missing_ocr` 且没有真实图片保真去向 | 阻塞 | 说明对应图片编号与置信度；不能把缺失 OCR、低置信度乱码或 prompt 片段当作图片已读 |
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
| 数学/理科图形题没有真实题内图 URL/bbox，且无完整 `diagramSpec/redrawData` | 阻塞 | 说明缺少题内图片裁剪/定位能力，禁止 SVG/Canvas/AI 图替代 |
| 预计最终 HTML 会出现 `<img>` 为 0、占位、图略、预留位置、请参考原卷、对照原卷使用、题量不足，或 A4 页面大面积空白 | 阻塞 | 不生成 HTML，返回阻塞说明 |

阻塞时只允许回复阻塞说明或调用 `terminate`，不能继续生成“看似完成”的 HTML。已经调用 `ask_user` 请求补素材后，本轮必须停止；禁止在 `ask_user` 之后继续调用 `create_file`。

#### 复现失败反例（必须阻断）

如果运行中出现以下任一情况，必须立即阻塞，禁止继续调用 `create_file`：

- `convert_to_text` 对 PDF/截图/扫描卷返回空内容、极短内容或只有“用户上传了文件，文件的内容是”。
- `convert_to_text` 对 DOC/DOCX/PPTX/XLSX 只返回纯文本，但用户要求读图、带图、图片文字转换，或文档语义中出现图片/图示/截图/媒体线索。
- 已知源文档中存在多张必须视觉保真的图片，但最终只能放入 1 张或少于视觉图片数的图片。
- 已知源文档中存在纯文字/表格截图，但最终 HTML 既没有真实图片，也没有把截图文字 OCR 成可编辑文本或把截图表格转成 `<table>`。
- 已知图片对象主要是文章段落/题目/答案截图，但最终被集中放入 `.visual-assets`、`image-gallery`、图片墙或开头图集，而没有转成可编辑正文。
- 任一图片没有逐张读取台账，或台账里的 OCR 片段没有在最终 HTML 正文/表格/答案区出现。
- 将用户或测试 prompt 提供的 `--require-text-snippet` / 验收片段当成 OCR 来源，写成“根据验收片段还原/视觉化还原”的 HTML。
- 用户要求按参考 HTML / 金样 / resourceId 同款排版时，只复用了颜色或少量 CSS 信号，但 DOM 固定层漂移，例如关键 class、标题层级、表格结构、答案区结构或打印 CSS token 缺失。
- 源文档存在“参考答案/答案/解析”，但最终答案区缺少原有解析、只保留选项字母或合并摘要。
- 随后改用 `read_file` 只拿到 OCR 预览文本，但没有逐页图片、题内图 URL、bbox、reading-order JSON 或可靠题量清单。
- 输出解释里准备写“由于当前工具链未返回题内原图 URL，我在 HTML 中预留位置”。
- HTML 正文里准备出现“[此处原卷为...]”“请参考原卷”“建议打印后对照原卷使用”等文字。

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
| [reproduction-guide.md](reproduction-guide.md) | 内容完整复现规则、题目/图片/公式/模板锁定规则 | Phase 1 执行前读取 |
| [math-image-fidelity.md](math-image-fidelity.md) | 分数公式渲染、原图保留、题量不缩水专项规则 | 处理试卷/题单/PDF/截图前必须读取 |
| [mineru-integration.md](mineru-integration.md) | MinerU 上游解析、Markdown/JSON/图片/表格/公式/bbox 素材包合同 | 处理 PDF、图片、DOCX、PPTX、XLSX 前必须读取 |
| [pdf-ocr-preprocess.md](pdf-ocr-preprocess.md) | MinerU 优先、OCRmyPDF / OCR 预处理策略与边界 | 处理扫描 PDF、图片型 PDF 前读取 |
| [pdf-page-fidelity.md](pdf-page-fidelity.md) | PDF 原页逐页图片保真、禁止空白嵌入框和“参考原卷”兜底 | 处理上传 PDF/扫描卷时必须读取 |
| [visual-design-guide.md](visual-design-guide.md) | 高级视觉排版、设计系统、题型层级、题内图版式和纸面信息密度 | Phase 3 生成 HTML 前必须读取 |
| [pagedjs-template.md](pagedjs-template.md) | Paged.js 0.4.3 A4 打印 HTML 模板和 CSS 铁律 | Phase 3 生成 HTML 前读取 |
| [quality-gate.md](quality-gate.md) | 生成后质量门禁和失败拦截标准 | Phase 4 交付前必须读取 |
| [examples.md](examples.md) | 零散题目、模板锁定、教案打印版示例 | 需要对齐后台配置或输出话术时读取 |

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

## 工作流程

```plain
Phase 1: 内容完整复现
  读取 reproduction-guide.md
  不调用 mathdesign-1-html / html-authoring / page-optimize / mathdesign-* 等其他排版 Skill
  从输入/上传文档中提取全部内容 → 建立内容清单 → 保持题量、标题、图文关系、公式、题号
    ↓
Phase 1.2: PDF/OCR 预处理判断
  扫描 PDF、图片型 PDF、截图类输入和带图 Office 文档读取 mineru-integration.md、pdf-ocr-preprocess.md 与 pdf-page-fidelity.md
  按“输入判定表”分流：素材齐全才进入生成；只有 OCR/整页图/缺题内图时阻塞
  先逐个图片块分类并建立图片读取台账：纯文字/表格/答案截图 → OCR 成可编辑 HTML；视觉图形/照片/示意图 → 真实 <img> 保真
  优先使用 MinerU 素材包：Markdown + reading-order JSON + images + tables HTML + formulas LaTeX + bbox + pageImages
  如果当前链路没有 MinerU，则必须调用 convert_to_text 或等效 OCR/文本转换；同时必须用真实逐页图片或题内原图保留原卷
  如果没有可编辑文本/结构化结果或应保留图片的真实图片 URL，停止，不进入 Phase 3
  若用户要求一比一复原，禁止生成 AI 配图或 SVG 猜画替代图
    ↓
Phase 1.5: 保真专项检查
  读取 math-image-fidelity.md
  校验分数公式可渲染、原图/表格已保留、题量前后一致
    ↓
Phase 2: 场景与模板判断
  判断是试卷/题单/讲义/教案/默写纸/知识清单/模板复用
  若命中“模板锁定”，固定层不变，只换可变层
    ↓
Phase 3: 精美排版生成
  读取 visual-design-guide.md
  读取 pagedjs-template.md
  基于 Paged.js 0.4.3 输出单文件 HTML
  应用真实原图保真、设计系统、A4、分页、防截断、打印按钮、题型层级、题号锚点、图文邻近布局和场景匹配风格
    ↓
Phase 4: 自检交付
  读取 quality-gate.md
  检查第一页非空、题量不缩水、公式图形正确、A4 打印稳定、无英文乱入
  对 PDF/截图/扫描卷，最终 HTML 必须能通过 magazine-layout-guard；不通过则阻塞
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

## 模板锁定规则

当用户说以下任一句，进入模板锁定：

- “记住这个格式”
- “下次按这个来”
- “按照 resourceId XXXX 一模一样的格式”
- “参考我给的文件，格式排版要一模一样”
- “继续制作 Unit 5 / 下一个单元”
- “你生的就很好看，后台测试根据你的来弄”
- “参考金样 / 金样门禁 / 按金样生成”

锁定后分两层：

- 固定层：DOM 骨架、关键 class、标题层级、页眉页脚版式、题型模块、表格结构、答案区结构、布局方式、配色、字体字号、页边距、排版规则、打印 CSS token、技术规格。
- 可变层：年级/学科/单元、期号、标题文本、作者/来源、Topic/Focus/Grade 等 meta 内容、具体词汇与语法、阅读语篇、题目内容。

任何固定层变化必须由老师主动要求，AI不得自行调整。
模板中的期号、标题、作者、年级、单元名、日期等文本不是固定层。新输入文件名、正文标题或用户指令与模板不一致时，必须使用新输入内容；禁止把参考 HTML 的 `第30/882期`、旧标题、旧元数据照搬到新交付物。

模板锁定不是“像模板”。生成后必须对参考 HTML 与结果 HTML 做固定层自检：关键 class 是否存在、h2/h3 数量是否明显缩水、`<table>` 是否仍是表格、答案区是否仍是独立结构、`@page`/Paged.js/MathJax/`@media print` 是否仍在。固定层自检失败时禁止发布。

模板锁定失败判定：

- 参考 HTML 有 `.cover` / `.meta-card` / `.grid-2` / `.card` / `.reading` / `.options` / `.word-bank` / `.answer` 等结构，结果缺失任一核心结构。
- 参考 HTML 有 `.q-title`、`.language-box`、`.term-list` 等内容组织 class，结果改成普通段落或把多个模块合并。
- 参考 HTML 的 `.checklist` 若承载“素材自检/排版自检/门禁说明”等内部验收信息，不属于固定层，必须删除或改为内部日志；不能为了复刻模板把自检说明写进页面。
- 参考 HTML 的主要章节使用稳定 `h2`，结果把章节降级为普通粗体、`h3` 或段落，导致标题数量明显缩水。
- 参考 HTML 有 `<table class="...">`，结果改成 Markdown 表格、纯文本表格或图片。
- 参考 HTML 只有一个完整答案卡片，结果把答案拆散、合并摘要或丢失解析。
- 参考 HTML 有 `@media print`、`print-color-adjust`、Paged.js、MathJax，结果缺失任一打印基础设施。
- 只写 `window.PagedConfig` 不算加载 Paged.js。最终 HTML 必须有真实 Paged.js 库脚本，例如 `paged.polyfill.js`、`pagedjs` 包资源或等效后端打包资源；若只有 `PagedConfig` 而外部脚本不含 Paged.js 运行库，判定失败。
- 模板锁定时如果参考 HTML 使用 `cdn.jsdelivr.net/npm/pagedjs/dist/paged.polyfill.js`，发布前必须归一为 `https://unpkg.com/pagedjs@0.4.3/dist/paged.polyfill.js`。不要照抄可能被发布链路错误替换的 jsdelivr Paged.js 地址。
- 结果正文中出现“排版自检”“已遵循规则”“已严格遵循”“自检通过”“门禁通过”“使用了 Paged.js”等内部验收说明。自检只在内部完成，不能写进最终 HTML 可见内容。

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
- [ ] 对 PDF/截图/扫描卷，已按 `quality-gate.md` 的 CLI 参数做同等自检：`--require-real-images --require-mathjax`，并按原卷题量设置 `--min-questions`。
- [ ] HTML 可直接浏览器打开并打印。
