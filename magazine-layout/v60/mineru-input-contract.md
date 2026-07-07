# mineru source-package 输入合同

> v60 magazine-layout skill 的核心输入是用户线下用 mineru 跑出、再由
> `mineru_to_package.py` 打包成的 self-contained `*.source-package.json`。
> 本文件定义字段合同与读取流程。

---

## 1. 单文件设计原则

`source-package.json` 是 self-contained 的，飞象老师只需 `read_file` 一次即可拿到：

- 全部文本（Markdown 全文 + 结构化 blocks）
- 全部图片（`imageLedger[].dataUri` base64 内嵌，无需另传图片文件）
- 路由建议（`routing.recommendedSubtype`）
- 质量统计（`quality.questionCount / answerCount / warnings`）

**为什么不要求用户分文件上传**：飞象的 resourceId 不会按文件名自动匹配，分文件上传会导致 markdown 中 `![](images/xxx.jpg)` 引用断链。base64 内嵌让单文件解决一切。

**典型大小**：

| 资料类型 | 块数 | 图片数 | 文件大小 |
|---|---|---|---|
| 纯文字讲义 / 默写纸 | 30-100 | 0 | 0.02-0.1 MB |
| 知识清单 | 30-50 | 1-3 | 0.02-0.2 MB |
| 数学教案（含公式块） | 100-200 | 10-20 | 0.2-0.5 MB |
| 试卷（多图） | 200-300 | 20-40 | 0.3-0.6 MB |
| 杂志风（含大幅水墨配图） | 30-60 | 4-10 | 0.1-0.3 MB |

均 ≤ 1 MB，完全在飞象 read_file 能力范围内。

---

## 2. 字段合同

### 2.1 顶级字段

```jsonc
{
  "schema": "magazine-layout/source-package@v1",
  "source": { ... },          // 文件元信息
  "document": { ... },         // 文档级（标题、md 全文）
  "blocks": [ ... ],           // 阅读顺序的块列表
  "imageLedger": [ ... ],      // 每张图：filename + role + dataUri
  "routing": { ... },          // 模板族路由建议
  "quality": { ... }           // 质量统计与警告
}
```

### 2.2 source

```jsonc
"source": {
  "fileName": "2026 北京西城六年级（上）期末数学",
  "parser": "mineru",
  "parseMode": "pipeline" | "vlm" | "hybrid",
  "inputDir": "/path/to/.../auto"   // 仅供调试，skill 不依赖
}
```

### 2.3 document

```jsonc
"document": {
  "title": "10.2.1 代入消元法（第 1 课时）",
  "subject": "math" | "chinese" | "english" | "physics" | "chemistry" | "biology" | "geography" | "general",
  "grade": "七年级",
  "markdown": "完整 Markdown 全文（含 ![](images/xxx.jpg) 引用）"
}
```

`document.markdown` 是 mineru 直出的完整 md，**保留作为兜底**：当 blocks 字段不足以表达某些复杂结构（如嵌套列表、行内强调）时，可以从 markdown 取原文。

### 2.4 blocks

按文档阅读顺序的结构化块，每块至少含 `type` + 主体字段：

```jsonc
"blocks": [
  // 文本块（含标题、段落）
  { "type": "text", "text": "**10.2.1 代入消元法**", "page_idx": 0 },
  // 标题块（mineru 显式标记的）
  { "type": "text", "text": "教学目标", "text_level": 1, "page_idx": 0 },
  // 图片块（src 引用 imageLedger 中的 filename）
  { "type": "image", "src": "images/abc.jpg", "page_idx": 0, "alt": "..." },
  // 表格块（mineru 输出 HTML 字符串）
  { "type": "table", "table_body": "<table>...</table>", "page_idx": 1 },
  // 公式块（mineru OCR 出的 LaTeX）
  { "type": "equation", "text": "x^2 + y^2 = 1", "page_idx": 2 },
  // 列表项（如有）
  { "type": "list_item", "text": "...", "page_idx": 0 }
]
```

**重要约定**：

- `blocks[*].src` 在 v60 替代了 mineru 原始的 `img_path`，便于跨文件无歧义引用 imageLedger
- `text_level` 由 mineru 提供：1=主标题，2=二级，3=三级；可用于自动识别教案章节、试卷题型分组
- 段落开头加粗（`**xx**`）通常是教案 stage 名（教学目标 / 教学重点 / ...），需要识别后用作 stage 徽章

### 2.5 imageLedger

每张图片一条记录，按"图片在 blocks 中首次出现的顺序"排列：

```jsonc
"imageLedger": [
  {
    "filename": "images/abc.jpg",
    "role": "page_full" | "figure_diagram" | "figure_inline"
              | "formula_block" | "formula_inline" | "unknown",
    "naturalSize": { "width": 720, "height": 440 },
    "bytes": 23456,
    "mime": "image/jpeg",
    "refCount": 3,                                    // blocks 中被引用次数
    "dataUri": "data:image/jpeg;base64,/9j/4AAQ..."   // 直接可用的 src
  }
]
```

**role 含义与渲染策略**：

| role | 典型来源 | 渲染策略 |
|---|---|---|
| `formula_inline` | docx 内嵌 WMF 公式（小尺寸） | `display:inline-block; max-height:8mm; vertical-align:middle` 行内显示 |
| `formula_block` | docx 公式块、PDF 中的方程组 | `display:block; max-width:80mm; max-height:24mm; text-align:center` 段落内独占一段 |
| `figure_diagram` | 几何图、电路图、思维导图 | `max-width:140mm; max-height:90mm` 题内题图，邻近题干 |
| `figure_inline` | 小型示意图、缩略图 | `max-width:60mm` 行内或浮动 |
| `page_full` | A4 整页扫描 | 仅 `Phase 3.fullpage` 原卷整页保真打印版用，**禁止当 question-figure** |
| `unknown` | 未分类 | 阻塞，要求重传或在响应中说明 |

`refCount` 用于检测「同一图被复用 ≥ 3 次」的伪裁剪反例（v49 真实失败模式）。

### 2.6 routing

```jsonc
"routing": {
  "recommendedFamily": "assessment_work" | "learning_document" | "knowledge_reference" | "magazine_reading",
  "recommendedSubtype": "exam_paper" | "practice_sheet" | "question_set" | "dictation_sheet"
                       | "teacher_lesson_plan" | "student_handout"
                       | "knowledge_sheet"
                       | "magazine_article",
  "confidence": 0.85,
  "reasons": [
    "命中『试卷/期末/考试』关键词",
    "选择题/填空题/解答题结构齐全"
  ],
  "candidates": [
    { "subtype": "exam_paper", "confidence": 0.85, "reason": "..." },
    { "subtype": "practice_sheet", "confidence": 0.45, "reason": "..." }
  ],
  "fallback": "magazine_article" | null,
  "userIntent": "试卷" | null
}
```

**优先级**：

1. 用户在对话中说"我要做成 X"（"做成默写纸/做成杂志风"）→ **最高优先级**，覆盖 routing
2. routing.recommendedSubtype（confidence ≥ 0.5）→ 默认采用
3. routing.confidence < 0.3 → 询问用户或用 routing.fallback
4. routing.confidence 0.3-0.5 → 询问用户确认

### 2.7 quality

```jsonc
"quality": {
  "blockCount": 242,
  "imageBlockCount": 33,
  "uniqueImages": 28,
  "headingCount": 12,
  "questionCount": 30,
  "tableCount": 2,
  "formulaCount": 0,
  "answerCount": 16,
  "warnings": [
    "missingImages: 2 个图片块在 images/ 中找不到原始文件",
    "diagramDependent: 文本中出现图形线索但图片块为 0，疑似缺图"
  ],
  "missingImages": ["images/abc.jpg"]
}
```

**警告处理**：

- `missingImages` 非空 → 在最终 HTML 中跳过这些块，并在 cover 上方加 warning bar
- `diagramDependent` 警告 → 阻塞，要求用户先用 mineru pipeline 重新跑一次（vlm 后端通常更可靠）
- `answerCount=0` 但用户说"试卷" → 提醒用户上传含答案的版本

---

## 3. 读取流程

### 3.1 主路径（用户已上传 source-package）

```text
1. read_file(resourceId)  →  得到 JSON 字符串
2. JSON.parse  →  得到 pkg
3. 校验 pkg.schema 以 "magazine-layout/source-package@v" 开头
4. 取 pkg.routing.recommendedSubtype 作为默认模板族选择
5. 检查 pkg.quality.warnings；有则按上节"警告处理"决定继续/阻塞
6. 进入 Phase 2 模板族选择
```

### 3.2 降级路径（用户没传 source-package）

```text
1. 判断用户上传的是 PDF / DOCX / PPTX / XLSX / 图片
2. 调用 convert_to_text 拿 OCR 文本
3. 按以下三类分流：
   a. 纯文字资料 → 进入 Phase 2，按 text_only 模式（标注「未走结构化解析 / 文字版」）
   b. 图形依赖型试卷 → 阻塞，按 SKILL.md 的「降级阻塞模板」回复
   c. 含图但非图形依赖（语文/英语阅读、知识清单、杂志风）→
      ask_user 询问是否接受文字版（不含原图）
```

**降级路径下不构造 source-package**：直接拿 `convert_to_text` 文本走 Phase 2，但生成的 HTML 必须 cover 加标识、`fidelity_mode` 设为 `text_only_degraded`。

---

## 4. 用户上传操作指引（写入对话话术）

当用户问"怎么用"时，建议给出：

```plain
推荐流程（精美排版质量最稳）：
1. 在本地用 mineru 跑出文档（pipeline 后端速度快、vlm 后端识别更准）：
   mineru -p <你的文件.pdf> -o ./out -b pipeline

2. 用 mineru_to_package.py 打包成单文件（含图片 base64）：
   python3 mineru_to_package.py \
     --input  ./out/<文件名>/auto \
     --output ./文件名.source-package.json \
     --user-intent 试卷   # 或 教案 / 讲义 / 知识清单 / 杂志风

3. 把 .source-package.json 上传到飞象老师对话，告诉我「精美排版」即可。

如果你不方便跑 mineru，直接传原始 PDF/DOCX 也可以，但图形依赖型试卷
（数学/物理/化学等）会因缺真实题图而阻塞，仅文字资料会出文字版。
```

---

## 5. 与本 skill 老版本（v59）的差异

| 维度 | v59（旧） | v60（新） |
|---|---|---|
| 主输入 | 用户传原 PDF/DOCX，skill 自己 OCR + 拆题 + bbox | 用户传 source-package.json，skill 直接读 |
| Phase 数 | 5 个 + Phase 1.3 二阶段补图判定 | 4 个，不需要补图判定（mineru 已做好） |
| 工具依赖 | convert_to_text + tools/pdf-to-page-images + tools/question-figure-cropper + tools/image-ledger-builder | read_file 一个就够；tools 全部下放到线下 mineru pipeline |
| 截图分类 | screenshot-classification.md 七分类 + Phase 1.3 二阶段判定 | 不需要（imageLedger.role 已标好） |
| OCR 预处理 | pdf-ocr-preprocess.md（OCRmyPDF / Tesseract） | 不需要（mineru 内置） |
| 题内图裁剪 | figure-cropping.md（最小可读宽度 35/60/80/100mm） | 不需要（imageLedger 已分类，role=figure_diagram 直接渲染） |
| 自检条数 | 13 条手工自检 | 8 条基线 + 4 条 subtype 专项 |

v60 的设计哲学：**让 skill 专注做「重排 + 美化 + 质量」，把「解析 + 拆题 + 拍图」推给上游 mineru**。
