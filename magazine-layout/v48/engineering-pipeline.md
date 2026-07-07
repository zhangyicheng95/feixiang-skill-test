# 工程化流水线（v48）

## 目标

v47 把规则写到了位，但工程链路仍然依靠 Agent 自行解释。v48 把 magazine-layout 升级为“**解析—重排—质量门禁—打印产物验证**”四层流水线，每层都有明确合同、可执行工具和失败语义。任何一层缺失或失败，下一层不得继续。

```plain
┌──────────────────────────────────────────────────────────────────────────┐
│ Layer 1：上游解析层                                                      │
│   PDF/图片/DOC/DOCX/PPTX/XLSX                                            │
│     → MinerU / Docling / PaddleOCR-VL（首选）                            │
│     → tools/pdf-to-page-images（最低保底，逐页 PNG + manifest.json）     │
│     → tools/question-figure-cropper（题内图 bbox 裁剪）                  │
│     → tools/image-ledger-builder（每张图片台账 + OCR 验收片段）          │
│   输出：标准化素材包 source-package.json（合同见 mineru-integration.md） │
└──────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ Layer 2：Agent 重排层                                                    │
│   读 SKILL.md 主流程；按场景选模板；用真实图保真 + 高级 A4 重排           │
│   不猜版面、不删题、不换图、不文字版降级图形依赖试卷                       │
│   公式 MathJax；表格 <table> 优先；题内图靠近题目；答案解析完整保留        │
│   按 pagedjs-template.md 输出单文件 HTML                                 │
└──────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ Layer 3：HTML 静态质量门禁                                                │
│   tools/magazine-layout-guard 检查：                                      │
│     题量、真实图数、MathJax、紧凑 A4、break-inside avoid、                │
│     占位词、图片墙、孤立方框、答案解析、台账验收片段、不可达 URL/onerror   │
│   失败 → 不发布；通过 → 进入 Layer 4                                       │
└──────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ Layer 4：打印产物验证层                                                   │
│   tools/print-preview-guard：Puppeteer/Chromium 等 MathJax+Paged.js 完成  │
│     → page.pdf() → 检查 PDF 文本量、图片量、空白页比例、孤立方框、         │
│       首页非空、资源加载错误、网页/PDF 文本与图片差异                      │
│   失败 → 不发布并保留失败截图与 JSON 报告                                 │
└──────────────────────────────────────────────────────────────────────────┘
```

## 各层契约

### Layer 1 标准化素材包（v48）

每次 `create_file` 之前，Agent 必须能从工具上下文中拿到下面这份对象。这是**唯一**进入重排层的入口，不允许 Agent 直接读 PDF 字节、resourceId、文件名。

```jsonc
{
  "source": {
    "fileName": "2026北京西城六年级（上）期末数学.pdf",
    "fileType": "pdf",
    "parser": "mineru | docling | paddleocr-vl | pdf-to-page-images",
    "pageImages": [
      { "page": 1, "url": "https://...", "width": 2480, "height": 3508, "dpi": 300 }
    ]
  },
  "document": {
    "title": "2026 北京西城六年级（上）期末数学",
    "markdownUrl": "https://...",
    "jsonUrl": "https://...",
    "blockCount": 120
  },
  "questions": [
    {
      "id": "q-001",
      "number": "1",
      "section": "选择题",
      "stemHtml": "题干 HTML，含 MathJax/HTML 表格",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "answerArea": "writing-lines | blank | choice",
      "figures": ["fig-001"],
      "tables": [],
      "sourcePage": 1,
      "bbox": { "x": 120, "y": 300, "width": 780, "height": 180, "unit": "px" }
    }
  ],
  "figures": [
    {
      "id": "fig-001",
      "questionId": "q-002",
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
      "fallbackImageUrl": "https://...",
      "sourcePage": 2,
      "bbox": { "x": 90, "y": 510, "width": 960, "height": 240, "unit": "px" }
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
      "finalHtmlTarget": "question q-002 / answer-section / appendix",
      "validationSnippet": "用于 --require-text-snippet 校验的唯一片段"
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

`source-package.json` 一旦缺以下字段，Agent 必须阻塞，不进入 Layer 2：

| 缺失字段 | 阻塞文案要点 |
|---|---|
| `source.pageImages` 为空，且 `figures` 为空 | “缺少 PDF 转图/图片提取能力，无法保留原卷图形” |
| `questions` 为空 | “缺少题号级结构化结果，无法可编辑重排” |
| `imageLedger` 缺少任一图片对应的 entry | “图片读取台账不完整，无法 1:1 验收” |
| `exam.diagramDependent=true` 但 `figures` 为空且无 bbox | “图形依赖型试卷缺少题内图，禁止 text-only 降级” |
| `answers` 为空但 `quality.answerCount > 0` 或源卷含答案/解析 | “答案/解析未保留，禁止只保留选项字母” |

### Layer 2 重排层

Agent 读取标准化素材包，按 `SKILL.md` 主流程生成 HTML。核心要求与 v47 相同，**不再重复**。新增：

- 必须遵守 `screenshot-classification.md` 对截图的分流：整页/半页 → source-region；文字/表格/答案 → 转写；单题图/裁剪图 → question-figure。
- 必须遵守 `figure-cropping.md` 的最小可读宽度：默认 `min-width: 35mm`；含文字/刻度/标签的几何图、电路图、光路图、统计图 ≥ 60mm；含细节的物理实验装置图 ≥ 80mm。

### Layer 3 HTML 静态门禁

由 `tools/magazine-layout-guard` 实现，详见 `quality-gate.md`。所有 v47 检查项保留，并新增：

| 检查 ID | 含义 | 失败语义 |
|---|---|---|
| `min-questions` | HTML 题号数量不少于阈值 | 缺题 |
| `expected-images` | HTML 真实 `<img>` 数 ≥ 源图数 | 漏图 |
| `require-real-images` | 真实 `<img>` 必须存在 | 没图 |
| `require-mathjax` | MathJax 已正确加载且 `PagedConfig.before` 存在 | 公式不渲染 |
| `require-compact-a4` | `@page` 边距 ≤ 12mm；正文 ≤ 11.5pt | 不紧凑 |
| `require-text-snippet` | 验收片段必须出现在最终 HTML | 转写丢失 |
| `forbid-image-gallery` | 文字截图不得集中堆在 `.visual-assets` 等 | 图片墙错位 |
| `require-answer-snippet` | 答案/解析关键片段必须出现 | 答案缺失 |
| `forbid-placeholders` | 禁止占位词 | 假装完成 |
| `forbid-object-embed-iframe` | 禁止以 PDF 框冒充保真 | 空白框 |
| `forbid-onerror` | 禁止 `onerror` 隐藏 | 失败掩盖 |
| `first-page-not-blank` | 第一页不空白 | 空白首页 |
| `forbid-question-break-avoid` | 禁止给普通题块批量 `break-inside: avoid` | 大段空白 |
| `forbid-isolated-checkbox-only-area` | 禁止只剩一串孤立选项方框 | 孤立方框 |
| `forbid-guessed-image-url` | 禁止 `_page_1.png`、`?page=1` 等猜测地址 | 伪 URL |
| `forbid-text-only-for-diagram-dependent` | 图形依赖型试卷禁止仅文字版 | 默认降级 |

### Layer 4 打印产物验证层

由 `tools/print-preview-guard` 实现，详见 `print-preview-guard.md`。其本质是**用 Chromium 渲染 → 等 MathJax/Paged.js 完成 → 导出 PDF → 再校验**。

输出报告关键字段：

```jsonc
{
  "verdict": "pass | fail",
  "html": { "imgCount": 6, "questionCount": 30, "tableCount": 2 },
  "pdf": {
    "pageCount": 8,
    "imageCount": 6,
    "textCharCount": 12345,
    "firstPageNonEmpty": true,
    "blankPageRatio": 0.05,
    "isolatedCheckboxes": 0
  },
  "diff": {
    "textCharDiff": 0.03,
    "imageCountDiff": 0
  },
  "consoleErrors": [],
  "failedResources": [],
  "screenshots": ["preview-page-001.png", "preview-fail.png"],
  "violations": []
}
```

阈值默认：

- `blankPageRatio` ≤ 0.15
- `firstPageNonEmpty` 必须为 true
- `consoleErrors` 必须为空（除 MathJax font-loading warning 等白名单）
- `failedResources` 必须为空（即所有 `<img>` 都加载成功）
- `pdf.textCharCount / html.textCharCount ≥ 0.85`
- `pdf.imageCount` 与 `html.imgCount` 相差 ≤ 1
- 含 `如图/下图` 的题目附近必须有图片实例

## 何时使用何种工具

| 场景 | 推荐工具 | 备注 |
|---|---|---|
| 后端有 MinerU/Docling | 直接使用 | 输出已是结构化素材包 |
| 后端只能跑 PDF | `tools/pdf-to-page-images`（Python + PyMuPDF） | 仅做 P0：逐页 PNG + manifest.json |
| 拿到 pageImage + bbox | `tools/question-figure-cropper` | 题内图裁剪 |
| 已有图片资源列表 | `tools/image-ledger-builder` | 生成图片读取台账 |
| 生成 HTML 后 | `tools/magazine-layout-guard` | 静态检查 |
| 上线前最后一关 | `tools/print-preview-guard` | 打印 PDF 验证 |

## 反模式

下面任何一项出现即视为**工程链路失效**，应立即阻塞：

- Agent 跳过 Layer 1 直接读 PDF 文件名/resourceId 生成 HTML。
- Layer 1 解析失败但 Agent 用文字替代，进入 Layer 2。
- Layer 3 失败，Agent 修改 HTML 直至 Layer 3 通过，但实际题量缩水。
- Layer 4 跳过，只看网页效果。
- “仅文字版”作为图形依赖试卷的默认推荐。
- 用 SVG 重绘绕过 `--require-real-images`。
- 把 `--require-text-snippet` 作为生成正文的输入而非验收。
