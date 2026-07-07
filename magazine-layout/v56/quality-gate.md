# 生成后质量门禁

## 目标

精美排版结果在对用户公开前必须先过质量门禁。门禁失败时，不发布 HTML 链接，而是返回失败原因，要求补齐 OCR、题目结构或题内图片。

## 必须拦截的坏结果

- HTML 中没有真实 `<img>`，但输入是 PDF、截图或扫描卷。
- DOC/DOCX/PPTX/XLSX 等 Office 文档存在图片/截图/图示/媒体线索，或用户要求“图也要读/带图/图片文字转化”，但最终 HTML 的 `<img>` 数量为 0。
- 已知源文档含多张必须视觉保真的图片时，最终 HTML 的真实 `<img>` 数量少于源文档视觉图片数或少于工具返回的视觉图片资源数。
- 已知源文档含纯文字/表格截图时，最终 HTML 既没有真实图片，也没有把截图文字 OCR 成可编辑文本或把截图表格转成 `<table>`。
- 已知图片对象主要是文章段落、题目、答案或解析截图时，最终 HTML 仍把这些图片集中放进 `.visual-assets`、`image-gallery` 或开头图片墙，而没有按阅读顺序转成可编辑正文。
- 已知源文档含多张图片/截图时，没有逐张图片读取台账，或任一图片台账的 OCR/表格/保真结果没有在最终 HTML 中出现。
- 源文档含“参考答案/答案/解析”时，最终答案区缺少原有解析、只保留选项字母或合并摘要。
- 出现 `【原卷图形】`、`请参考原卷图示`、`请参考原卷`、`对照原卷使用`、`预留位置`、`图略`、`占位`。
- 题号数量明显少于原卷题量。
- 只有原卷图片或校验附录，没有可编辑重排正文。
- 原卷图片全部集中在正文主体，充当贴图式交付。
- 出现 `<object>`、`<iframe>`、`<embed>` PDF 空白框。
- 出现 `onerror` 隐藏图片加载失败。
- 图片 URL 是猜测/拼接出来的假地址。
- 图形依赖题没有题内图、裁剪图、bbox 或明确阻塞说明，却继续发布。
- `convert_to_text` 返回空/极短后，改用 `read_file` 预览文本继续生成 HTML，而不是阻塞。
- 已调用 `ask_user` 请求补充素材或确认降级后，又继续调用 `create_file` 生成占位版/降级版 HTML。
- 将用户或测试 prompt 给出的验收片段当成图片 OCR 来源，生成“根据验收片段还原/视觉化还原”的 HTML。
- 使用 `generate_image`/`picture_gen`/AI 生成插画替代原卷图形，并把它当作原图保真通过。
- 数学/理科试卷只有 SVG 重绘图、没有真实 `<img>`、bbox 或完整 `diagramSpec/redrawData`，却宣称“准确还原/精确重绘/原图还原”。
- 用户要求“一比一/还原/复原/真实原图/原卷图”时，出现 AI 生成图、SVG 重绘图、Canvas 图形或 CSS 图形替代真实原图。
- 英语/语文阅读材料存在图片占位或用户要求带图，但最终 HTML 的 `<img>` 数量为 0，且没有说明图片生成工具不可用。
- 产物只满足 Paged.js/MathJax 技术壳，但没有统一设计 token、题型层级、题号锚点、答题区规则，呈现为默认灰色模板。
- A4 产物页面密度明显不足：题块/环节卡片间距过大、页边距过宽，`.question`、`.question-group`、`.question-item`、`.answer-area`、大容器等强制 `break-inside: avoid` 导致分页留下大块空白。
- 产物满足真实图片保真，但没有可编辑重排正文、题型结构、标准答题区和高级纸面设计，把一比一复原误做成“原卷图片合集”。
- 产物视觉好看，但题量、公式、题内图或原卷图不准；美化不能覆盖或替代一比一保真。
- MinerU/OCR 已识别出图片文字或表格，但最终 HTML 仍只贴截图，没有先转成可编辑段落或 `<table>` 再排版。
- MinerU 素材包中 `quality.questionCount/tableCount/formulaCount/figureCount` 与最终 HTML 明显不一致，却继续发布。

## 推荐 CLI

后端可在 `create_file` 之后、发布链接之前执行：

```bash
cd tools/magazine-layout-guard
npm run check -- \
  --input "result.html" \
  --min-questions 30 \
  --min-images 1 \
  --expected-images <源文档视觉图片数> \
  --require-text-snippet "<纯文字截图 OCR 文本>" \
  --require-text-snippet "<每张图片的唯一 OCR/表格片段>" \
  --require-text-snippet "<答案/解析关键片段>" \
  --forbid-image-gallery \
  --require-real-images \
  --require-compact-a4 \
  --require-mathjax \
  --json
```

如果退出码非 0，不能发布结果。

`--require-real-images` 只用于已知存在必须视觉保真的图形/照片/示意图时。若图片对象均为纯文字、表格、题目或答案截图，且已完整 OCR 成可编辑正文/`<table>`/答案区，可以不设置 `--require-real-images`，但必须用 `--require-text-snippet` 和 `--forbid-image-gallery` 验证转写完整且没有图片墙错位。

## 西城六年级数学样例门禁

该卷不是 10 道题以内的小练习，门禁阈值应偏严格：

- `--min-questions 30`
- `--min-images 1`
- 带图 DOC/DOCX/PPTX/XLSX：如果已知源文档视觉图片数，必须追加 `--expected-images <源文档视觉图片数>`；纯文字/表格/答案截图必须为每张图片追加至少 1 个唯一 `--require-text-snippet`，检查 OCR 文本、表格关键内容和答案解析片段，不能只用 `--min-images 1` 或少数总片段放行。
- 图片对象主要是文字截图时，必须追加 `--forbid-image-gallery`，避免把文字图集中放到开头造成错位。
- `--require-real-images`
- `--require-compact-a4`
- `--require-mathjax`

如果没有题内图裁剪能力，图形题不能写成“请参考原卷图示”；必须阻塞并说明缺少题内图片裁剪/定位能力。

## 初一教案第883期金样门禁

该样例来自 `初一教案第883期 (2) (1).doc`，目标是英语阅读教案的 A4 精美排版。源文档内 6 张图片均为文字/表格截图，后端预处理必须先抽图、白底重编码、OCR，并生成 `material.json` / `image-ledger.json`。若 6 张图都已转成可编辑正文或 `<table>`，最终 HTML 可以 `<img>` 为 0，但必须用逐图 OCR 片段验收，禁止图片墙或占位。

推荐后端回归命令：

```bash
python3 tools/magazine-layout-preprocess/extract_doc_assets.py \
  "/Users/dujiahua/Downloads/初一教案第883期 (2) (1).doc" \
  --out "tmp-preprocess/lesson-883-final-layout" \
  --ocr-engine paddle

cd tools/magazine-layout-guard
npm run test:lesson883
```

该金样至少验证：

- 题量：`--min-questions 5`。
- OCR 片段：`Plants are very important`、`But a new study found that when it is hot`、`plants lose more water through a layer`、`If it gets too hot`、`normal weather hot weather`。
- 答案完整性：必须出现 `参考答案`，并保留解析。
- A4 密度：必须 `--require-compact-a4`，页边距不超过 12mm。
- 结构：必须 `--forbid-image-gallery`，不能把文字截图堆成 `.visual-assets` 或图片墙。
- 金样固定层：若用户要求“按金样/按已生成版本/后台测试根据这个来”，结果必须保留金样 DOM 骨架和关键 class。Lesson883 金样的最低结构信号为 `.cover=1`、`.meta-card=1`、`.meta-row=3`、`.grid-2>=2`、`.card>=5`、`.reading=1`、`.q-title>=5`、`.options>=4`、`.language-box=1`、`.term-list>=2`、`.quote>=2`、`table.compare=1`、`.word-bank=1`、`.answer=1`、`.checklist=1`、`h2>=9`、`@media print`、`print-color-adjust`、真实 Paged.js 运行库。只满足颜色、CSS 字数或局部片段不算通过；只写 `window.PagedConfig` 但没有 `paged.polyfill.js` / `pagedjs` 运行库也不算通过。模板锁定时 Paged.js 推荐固定为 `https://unpkg.com/pagedjs@0.4.3/dist/paged.polyfill.js`，不要照抄可能被发布链路错误替换的 jsdelivr 地址。
- 若参考 HTML 被作为资源提供，必须先读取它并抽取固定层，再生成结果；不能只在 prompt 中写“参考金样”后生成近似版。
- 模板锁定时，参考 HTML 的期号、标题文本、作者、年级、单元名、日期和 meta 文案属于可变层。Lesson883 输入文件名为 `初一教案第883期...doc` 时，结果不得继续显示旧模板的 `882` 期号；若源文件名与模板期号冲突，以源文件名/用户指令为准。
- 最终 HTML 可见正文不得包含内部验收说明，例如 `排版自检`、`已严格遵循`、`自检通过`、`门禁通过`、`使用了 Paged.js`。这些只能作为 Agent 内部检查或日志，不能出现在交付物页面。

## Agent 自检要求

在生成 HTML 后，Agent 必须按以下顺序自检：

1. 正文是否是可复制题目文本，而不是整页图片。
2. 题号数量是否达到原卷清单。
3. 是否存在占位/摘要/参考原卷话术。
4. 图形题和统计图题是否有真实图片、bbox 或完整 `diagramSpec/redrawData`。
5. 带图题图片是否靠近对应题目，而不是只堆在附录。
6. SVG 是否只在有完整结构化图形数据时使用；没有真实图时不能宣称准确还原。
7. 如果用户要求一比一复原，是否完全没有 AI 图、SVG 猜画、Canvas/CSS 替代图。
8. AI 生成图是否只作为辅助插画，且没有冒充原卷图。
9. 图片中的文字、表格是否已先转成可编辑 HTML 再排版；截图是否只作为校验或识别失败兜底。
10. 如果输入来自 MinerU，最终题量、表格数、公式数、图片数是否与 MinerU 质量元数据一致。
11. 视觉系统是否完整：颜色 token、字体、间距、题型标题、题号、选项网格、答题线是否一致。
12. 是否同时满足“双目标”：一比一真实保真 + 设计师级美化重排；任一项缺失都不能发布。
13. MathJax、Paged.js、A4 `@page` 是否存在。
14. 原卷校验附录是否只在正文之后出现。
15. A4 信息密度是否合格：页边距、字号、行距、题块间距紧凑；普通题块、重复卡片和大容器没有 `break-inside: avoid`；没有每页只排很少内容的大面积空白。
16. 已知源文档视觉图片数量时，最终 `<img>` 数量是否达到视觉图片数；只读到 1 张图不能算“图都读了”。
17. 已知源文档含纯文字/表格/答案截图时，截图文字或表格关键内容是否已转成可编辑正文/`<table>`/答案区，并用 `--require-text-snippet` 验证。
18. 图片是否在语义附近，是否没有 `.visual-assets`/图片墙前置错位。
19. 答案区是否完整保留原答案和解析，而不是只保留选项字母。
20. 是否有逐张图片读取台账；每张图片的 OCR/表格/保真结果是否都有唯一片段进入最终 HTML。

任一项失败，停止发布。
