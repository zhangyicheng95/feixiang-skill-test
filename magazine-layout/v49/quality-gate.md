# 生成后质量门禁（v48 Layer 3 + Layer 4）

## 目标

精美排版结果在对用户公开前必须先过两道门禁：

1. **Layer 3 - HTML 静态门禁**：`tools/magazine-layout-guard`（零浏览器依赖）。
2. **Layer 4 - 打印产物验证**：`tools/print-preview-guard`（详见 `print-preview-guard.md`）。

任一失败时，不发布 HTML 链接，而是返回失败原因，要求补齐 OCR、题目结构或题内图片。

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
- **图形依赖型试卷未走 text-only 用户明确同意路径，却生成了不带 `text-only-tag` 的“仅文字版”**。
- **题内 `<figure>` 的 `<img src>` 与原页 `<img src>` 完全相同**（伪裁剪）。
- **HTML 中存在大段连续 □ ○ ◯ 等孤立方框且无对应选项文字**（孤立方框 = 选项与方框被 CSS 拆开或 OCR 没读出选项）。
- **存在 `_page_1.png`/`?page=1`/`resourceId/.../page_X.png` 等典型猜测 URL**。
- **HTML 中含 `text-only` 标识但缺少 `text-only-warning`**（用户应被告知不可作为完整试卷使用）。
- **打印 PDF 首页空白、空白页比例 > 0.15、文本量 < HTML 0.85 或图片量差 > 1**。
- **打印 PDF 中孤立方框成行 > 阈值**（默认 5 行）。

## 推荐 CLI（v48）

### Layer 3：magazine-layout-guard

后端可在 `create_file` 之后、发布链接之前执行：

```bash
cd magazine-layout/tools/magazine-layout-guard
npm install   # 仅首次
node guard.js \
  --input "result.html" \
  --min-questions 30 \
  --min-images 1 \
  --expected-images <源文档视觉图片数> \
  --require-text-snippet "<纯文字截图 OCR 文本>" \
  --require-text-snippet "<每张图片的唯一 OCR/表格片段>" \
  --require-answer-snippet "<答案/解析关键片段>" \
  --forbid-image-gallery \
  --require-real-images \
  --require-compact-a4 \
  --require-mathjax \
  --forbid-placeholders \
  --forbid-object-embed-iframe \
  --forbid-onerror \
  --first-page-not-blank \
  --forbid-question-break-avoid \
  --forbid-text-only-for-diagram-dependent \
  --forbid-isolated-checkbox-only-area \
  --forbid-guessed-image-url \
  --json
```

如果退出码非 0，不能发布结果。

### Layer 4：print-preview-guard

```bash
cd magazine-layout/tools/print-preview-guard
npm install   # 仅首次（会下载 Chromium）
node preview.js \
  --input "../../result.html" \
  --out "./report" \
  --expected-images 6 \
  --expected-questions 30 \
  --max-blank-page-ratio 0.15 \
  --max-isolated-checkboxes 5 \
  --min-pdf-text-ratio 0.85 \
  --json
```

退出码非 0，不能发布结果。

### CLI 参数详解

| 参数 | 必填？ | 含义 | 失败语义 |
|---|---|---|---|
| `--input` | 是 | HTML 路径 | 缺路径 |
| `--min-questions` | 试卷必填 | 最低题号数量 | 题量缺失 |
| `--min-images` | 视情况 | 最少图片数 | 图片缺失 |
| `--expected-images` | 视情况 | 应当存在的真实图片数 | 漏图 |
| `--require-real-images` | 图形依赖型试卷必填 | 必须有真实 `<img>` | 用 SVG/Canvas 冒充 |
| `--require-mathjax` | 含公式必填 | 必须正确加载 MathJax + PagedConfig | 公式不渲染 |
| `--require-compact-a4` | 推荐必填 | `@page` 边距 ≤ 12mm；正文 ≤ 11.5pt | 排版稀疏 |
| `--require-text-snippet` | 截图转写必填 | 验收片段必须出现 | 转写缺失 |
| `--require-answer-snippet` | 含答案必填 | 答案/解析关键片段必须出现 | 答案缺失 |
| `--forbid-image-gallery` | 文字截图场景必填 | 禁止 `.visual-assets` 等图片墙 | 错位 |
| `--forbid-placeholders` | 推荐必填 | 禁止 `[此处]/图略/请参考原卷` 等占位词 | 假完成 |
| `--forbid-object-embed-iframe` | PDF 场景必填 | 禁止用 PDF 框冒充保真 | 空白框 |
| `--forbid-onerror` | 推荐必填 | 禁止 `<img onerror>` 隐藏失败 | 失败掩盖 |
| `--first-page-not-blank` | 推荐必填 | 第一页必须非空 | 首屏空白 |
| `--forbid-question-break-avoid` | A4 必填 | 普通题块禁批量 `break-inside: avoid` | 大段空白 |
| `--forbid-text-only-for-diagram-dependent` | 图形依赖型试卷必填 | 不允许 text-only 默认降级 | 默认文字版 |
| `--forbid-isolated-checkbox-only-area` | 推荐必填 | 不允许某段只剩一串孤立 □/○ | 孤立方框 |
| `--forbid-guessed-image-url` | PDF/截图必填 | 不允许 `_page_1.png`/`?page=1` 类伪 URL | 伪 URL |
| `--require-text-only-disclaimer` | text-only 降级时必填 | 必须有 `text-only-tag`/`text-only-warning` | 未告知风险 |

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

## 双门禁示例

```bash
# 1. 静态门禁
cd magazine-layout/tools/magazine-layout-guard
node guard.js --input ../../result.html \
  --min-questions 30 --expected-images 6 \
  --require-real-images --require-mathjax --require-compact-a4 \
  --forbid-placeholders --forbid-object-embed-iframe \
  --forbid-onerror --first-page-not-blank \
  --forbid-question-break-avoid \
  --forbid-text-only-for-diagram-dependent \
  --forbid-isolated-checkbox-only-area \
  --forbid-guessed-image-url \
  --json
[ $? -ne 0 ] && echo "Layer 3 failed, abort" && exit 1

# 2. 打印产物门禁
cd ../print-preview-guard
node preview.js --input ../../result.html \
  --out ./report --expected-images 6 --expected-questions 30 \
  --max-blank-page-ratio 0.15 --min-pdf-text-ratio 0.85 \
  --json
[ $? -ne 0 ] && echo "Layer 4 failed, abort" && exit 1

# 3. 通过后发布
echo "All gates passed"
```

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
21. **图形依赖型试卷**未走 text-only 默认降级；任何 text-only 版本是否带 `text-only-tag` 与 `text-only-warning`。
22. **题内 figure URL 与原页 pageImage URL 不同**（即真正用 bbox 裁剪过）。
23. **打印产物验证**：打印 PDF 首页非空、空白页比例 ≤ 0.15、文本量比 ≥ 0.85、图片量差 ≤ 1、无控制台错误、无资源加载失败、无孤立方框成行。

任一项失败，停止发布。
