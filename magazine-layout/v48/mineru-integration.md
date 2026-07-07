# MinerU 上游解析接入

## 目标

`magazine-layout` 不直接猜 PDF 版面、公式和题内图。PDF、图片、DOCX、PPTX、XLSX 等上传文档应优先由 MinerU 或等效文档解析服务转成结构化素材包，再由 Agent 做 A4 精美重排。

MinerU 适合作为精美排版的上游解析层，因为它能把 `PDF`、图片、`DOCX`、`PPTX`、`XLSX` 转成 Markdown / JSON 等机器可读格式，并支持阅读顺序、标题段落结构、图片抽取、表格转 HTML、公式转 LaTeX、扫描件 OCR、多语言 OCR 和版面可视化结果。

## 推荐链路

```plain
用户上传 PDF/图片/DOCX
  ↓
MinerU 解析：Markdown + reading-order JSON + images + tables HTML + formulas LaTeX + layout/spans
  ↓
后端标准化为 magazine-layout 素材包
  ↓
Agent 基于结构化素材生成 A4 精美 HTML
  ↓
magazine-layout-guard 门禁
  ↓
通过后发布；失败则返回缺少 OCR/图片/表格/公式/题量结构
```

## 后端必须保留的 MinerU 输出

后端不要只把 MinerU 的 Markdown 文本传给 Agent。至少需要保留：

- `content.md`：按阅读顺序排列的正文 Markdown，用于可编辑重排。
- `content.json`：阅读顺序 JSON 或等价结构，用于题号、段落、列表、标题层级和块级 bbox。
- `images/`：MinerU 抽取出的原文图片、题内图、截图区域；必须上传成真实 URL。
- `tables`：HTML 表格或结构化表格数据。图片表格必须优先转成 `<table>`，不能只保留截图。
- `formulas`：LaTeX 公式或公式 span，供 MathJax 渲染。
- `layout/spans`：页面、块、行、span 的 bbox 与类型，用于题内图和题目绑定。
- `visualization`：版面可视化、span 可视化结果，用于研发排查，不直接交给用户。

## 标准化素材包（v48 source-package.json）

MinerU 输出进入 Agent 前，后端应标准化为以下合同。**v48 在 v47 基础上新增 `answers[]`、`imageLedger[]`、`exam` 三个顶层字段**，保留所有旧字段：

```jsonc
{
  "source": {
    "parser": "mineru | docling | paddleocr-vl | pdf-to-page-images",
    "fileName": "input.pdf",
    "fileType": "pdf | image | docx | pptx | xlsx",
    "pageImages": [
      { "page": 1, "url": "https://...", "width": 2480, "height": 3508, "dpi": 300 }
    ]
  },
  "document": {
    "title": "文档标题",
    "markdownUrl": "https://...",
    "jsonUrl": "https://...",
    "blockCount": 120
  },
  "questions": [
    {
      "id": "q-001",
      "number": "1",
      "section": "选择题",
      "stemHtml": "题干文本，含 MathJax/HTML 表格",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "answerArea": "writing-lines | blank | choice",
      "figures": ["fig-001"],
      "tables": ["table-001"],
      "sourcePage": 1,
      "bbox": { "x": 120, "y": 300, "width": 780, "height": 180, "unit": "px" }
    }
  ],
  "figures": [
    {
      "id": "fig-001",
      "questionId": "q-001",
      "url": "https://.../fig-001.png",
      "sourcePage": 1,
      "bbox": { "x": 520, "y": 360, "width": 300, "height": 210, "unit": "px" },
      "kind": "original_crop | original_full_page | tool_output",
      "naturalWidth": 600,
      "naturalHeight": 420,
      "minPrintWidthMm": 35,
      "canRedraw": false
    }
  ],
  "tables": [
    {
      "id": "table-001",
      "questionId": "q-010",
      "html": "<table>...</table>",
      "sourcePage": 2,
      "bbox": { "x": 90, "y": 510, "width": 960, "height": 240, "unit": "px" },
      "fallbackImageUrl": "https://..."
    }
  ],
  "answers": [
    {
      "questionId": "q-001",
      "answerHtml": "<p>答：B</p>",
      "explanationHtml": "<p>解析：……</p>"
    }
  ],
  "imageLedger": [
    {
      "imageId": "img-001",
      "sourcePage": 1,
      "type": "text | table | question | answer | visual-diagram | photo | unknown",
      "ocrHtml": "...",
      "tableHtml": "...",
      "imageUrl": "https://...",
      "bbox": null,
      "finalHtmlTarget": "question q-002 / answer-section / appendix",
      "validationSnippet": "用于 --require-text-snippet 校验的唯一 12-30 字片段",
      "ocrConfidence": 0.94,
      "notes": null
    }
  ],
  "quality": {
    "questionCount": 30,
    "figureCount": 5,
    "tableCount": 2,
    "formulaCount": 18,
    "answerCount": 30,
    "ocrConfidence": 0.92,
    "missingFigures": [],
    "warnings": []
  },
  "exam": {
    "subject": "math | physics | chemistry | biology | geography | chinese | english | other",
    "diagramDependent": true,
    "hasFiguresInStem": true
  }
}
```

### 字段释义（v48 新增/强化）

- `answers[]`：每题的参考答案与解析。如果源文档存在“参考答案/答案/解析”，**必须**填齐；缺失视为“答案不完整”，门禁 `--require-answer-snippet` 会失败。
- `imageLedger[]`：每张图片的读取台账，必须覆盖所有图片对象（含 `source-page`、`question-figure`、`text`、`table`、`answer`、`photo`）。`type=unknown` 直接阻塞，详见 `screenshot-classification.md`。
- `exam.subject` / `exam.diagramDependent`：决定是否进入“图形依赖型试卷”分支。`diagramDependent=true` 时缺图默认阻塞，禁止 text-only 默认降级。
- `figures[].minPrintWidthMm`：题内图最小可读宽度，35/60/80/100，详见 `figure-cropping.md`。
- `figures[].url` 与 `source.pageImages[].url` 必须不同：相同视为未做真实 bbox 裁剪，门禁失败。

## Agent 使用规则

Agent 拿到 MinerU 素材包后：

1. 先建立内容清单：标题、章节、题号、题量、图片、表格、公式、答案区。
2. Markdown/JSON 文本必须转成可编辑 HTML，不得只贴截图。
3. MinerU 识别出的表格必须优先转成 `<table>`；只有识别失败时才用真实表格截图兜底，并标记需要人工复核。
4. MinerU 识别出的公式必须用 LaTeX + MathJax 渲染；疑似识别错误时保留原图或公式截图作为校验。
5. 题内图必须来自 `figures.url`、`tables.fallbackImageUrl` 或后端 bbox 裁剪结果，禁止 AI 生成图/SVG 猜画冒充。
6. `pageImages` 只作为原卷校验附录或裁剪来源，不能替代可编辑重排正文。
7. 如果 `quality.missingFigures`、低 OCR 置信度、题量不一致或表格/公式缺失，必须阻塞或返回补齐要求，不能发布伪完成 HTML。
8. **答案/解析**：`answers[]` 必须落入最终 HTML 的 `.answer-section` / `.answer-area` / `.explanation`；不能压缩成只保留选项字母。门禁 `--require-answer-snippet` 必填。
9. **imageLedger 闭环**：`imageLedger[].validationSnippet` 必须出现在最终 HTML 中。生成后跑 `--require-text-snippet`。
10. **图形依赖**：`exam.diagramDependent=true` 且 `figures[]` 为空时，**默认阻塞**；不要主动推荐 text-only 降级。
11. **真实裁剪**：`figures[].url` 不得与 `source.pageImages[].url` 相同；任意一题图片 URL 与所属页图 URL 完全相同，视为未做真实 bbox 裁剪。

## A4 排版要求

MinerU 负责“转成结构化素材”，不负责最终美化。Agent 仍必须：

- 使用 A4 `@page`、Paged.js 和打印样式。
- 设计统一 token：字体、颜色、间距、题号锚点、答题区、表格风格。
- 控制信息密度：页边距、卡片间距和 `break-inside` 要适合打印，不能每页只排很少内容。
- 对图片文字做 OCR 后转成可编辑内容；图片只作为原图校验或识别失败兜底。

## 阻塞条件

以下情况禁止生成或发布最终 HTML：

- 只拿到 PDF URL，没有 MinerU Markdown/JSON、逐页图或抽取图片。
- 只拿到 Markdown，缺少原图/题内图/页面截图，无法做一比一校验。
- 表格只作为图片存在且可读文字未转成 `<table>`，但 Agent 却宣称完成可编辑排版。
- 数学/理科图形题没有真实图 URL/bbox，却使用 SVG/Canvas/AI 图替代。
- 题量、图片数、表格数和 MinerU 质量元数据不一致。

## 与旧方案关系

- MinerU 优先级高于零散 `convert_to_text`，因为它能同时提供阅读顺序、结构、图片、表格、公式和 OCR。
- OCRmyPDF 仍可作为扫描 PDF 的预处理补充，但不能替代 MinerU 的结构化解析，也不能替代 PDF 转图和题内图裁剪。
- `tools/pdf-to-page-images` 仍用于生成逐页 `pageImages` 或补齐原卷校验附录。
- `tools/question-figure-cropper` 在缺少 MinerU 的 `figures[].url` 但能拿到 `pageImage.url + bbox` 时使用。
- `tools/image-ledger-builder` 把多种来源（MinerU、convert_to_text、人工补充）合并为统一 `imageLedger[]`。

## 与各开源方案关系

| 工具 | 解决问题 | 输入 | 输出 | 推荐度 | 集成方式 |
|---|---|---|---|---|---|
| **MinerU** | 综合解析 | PDF/图片/Office | Markdown + JSON + 图片 + 表格 HTML + LaTeX + bbox + pageImages | 强烈推荐 | 后端服务化（FastAPI），结果产物上传成 URL |
| **Docling**（IBM） | 解析 + LayoutBlocks，对扫描件友好 | PDF/图片/Office | DocumentChunks + Markdown + 图表识别 | 推荐作为 MinerU 备选 | Python pip + 服务化 |
| **PaddleOCR-VL** | OCR + 版面识别 + 表格/公式 | PDF/图片 | 阅读顺序文本 + 表格 + 公式 LaTeX | 推荐作为 OCR 主力 | Python pip + 服务化 |
| **PyMuPDF**（fitz） | PDF → 图、bbox 操作、文本抽取 | PDF | PNG/JPEG + 文本 + bbox | 必备 | Python `pip install pymupdf` |
| **pdfjs-dist** | 浏览器/Node 端 PDF 渲染 | PDF | Canvas/PNG | 备选 | npm，纯 JS，速度比 PyMuPDF 慢 |
| **Poppler**（pdftoppm/pdftocairo） | 命令行 PDF → 图 | PDF | PNG/JPEG | 备选 | `brew install poppler` 或 apt |
| **Ghostscript** | 命令行 PDF → 图，老牌 | PDF | PNG | 备选 | `brew install ghostscript` |
| **OCRmyPDF** | 给扫描 PDF 加 OCR 文本层 | PDF | 带文本层 PDF | 用于扫描卷预处理 | `brew install ocrmypdf` |
| **Tesseract** | OCR 引擎 | 图片/PDF | 文本 | OCRmyPDF 底座；中文需要 `tesseract-lang` | 系统包 |
| **PaddleOCR** | 中文友好 OCR | 图片 | 文本 + 检测框 | 推荐 | Python pip |
| **Puppeteer** | 浏览器自动化、HTML → PDF | HTML | PDF + 截图 | Layer 4 必备 | npm |
| **Playwright** | 同上，多浏览器内核 | HTML | PDF + 截图 | Puppeteer 等价 | npm |
| **pdf-parse** / **pdfjs-dist** | PDF 文本/图片抽取 | PDF | 文本 + 图片元数据 | Layer 4 必备 | npm |

最小可行接入：

- **后端有人**：MinerU + PaddleOCR-VL + PyMuPDF；中转后端把 source-package.json 推给 Agent。
- **后端没接 MinerU**：用 `tools/pdf-to-page-images`（PyMuPDF）+ MinerU/PaddleOCR 的 OCR 部分；缺图阻塞而不是猜画。
- **本地开发**：`tools/pdf-to-page-images` + `tools/question-figure-cropper` + `tools/magazine-layout-guard` + `tools/print-preview-guard` 全部用 Python/Node 即可跑通。
