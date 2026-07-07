# mineru source-package 输入合同

> v60 magazine-layout skill 的核心输入是用户线下用 mineru 跑出、再由
> `mineru_to_package.py` 打包成的 self-contained `*.source-package.json`。
> 本文件定义字段合同与读取流程。

---

## 1. 单文件设计原则

`source-package` 是 self-contained 的，飞象老师只需 `read_url` 或 `read_file` 一次即可拿到：

- 全部文本（Markdown 全文 + 结构化 blocks）
- 全部图片（`imageLedger[].dataUri` base64 内嵌，无需另传图片文件）
- 路由建议（`routing.recommendedSubtype`）
- 质量统计（`quality.questionCount / answerCount / warnings`）

**为什么不要求用户分文件上传**：飞象的 resourceId 不会按文件名自动匹配，分文件上传会导致 markdown 中 `![](images/xxx.jpg)` 引用断链。base64 内嵌让单文件解决一切。

### 1.1 飞象上传白名单与三种承载格式

飞象网页上传**只接受**：`.doc/.docx/.pdf/.ppt/.pptx/.xls/.xlsx/.txt/.csv/.html/.jpeg/.jpg/.png/.webp`，
**不接受 `.json` / `.md`**。所以 `mineru_to_package.py` 默认输出三种格式：

| 后缀 | 内容 | 优劣 | 用途 |
|---|---|---|---|
| `.txt` | 单行压缩 JSON（无缩进） | 1 行就能拿全；`read_file` 默认 1000 行限制不会触发 | **首推**飞象网页上传 |
| `.html` | 单页 HTML，`<script id="source-package" type="application/json">JSON</script>` | 用户能浏览器打开预览；行数少；正则提取一次拿全 | 网页上传次选 / 想看预览 |
| `.json` | 标准缩进 JSON | 文件大、行数多（超过 1000 行被截断风险） | **本地开发用，不能上传飞象** |

### 1.2 三种入口（推荐顺序）

```text
[A] OSS URL 入口（首推，无大小限制）
    步骤：
    1. 本地 `mineru_to_package.py --ext all` 输出三种格式
    2. `fxls upload admin <文件路径>` 上传 .json/.txt/.html 任意一种到飞象 OSS（admin 通道不挑后缀）
    3. 拿到的 url 形如 https://musk-test.fbcontent.cn/pub-musk-ai-studio/user/upload/admin/XXX.{json,txt,html}
    4. 用户在飞象老师对话中粘贴这个 URL
    5. skill 调用 `read_url(URL)` 一次拿全 JSON 字符串

[B] 文件上传入口（次推，受 read_file 行数限制）
    步骤：
    1. 本地 `mineru_to_package.py --ext txt` 输出 *.txt（单行压缩 JSON）
    2. 用户在飞象网页拖入 *.txt
    3. skill 调用 `read_file(resourceId)` 拿到字符串
    4. 直接 JSON.parse

[C] 文本粘贴入口（应急，仅小包）
    用户极少数情况直接把整个 JSON 粘进对话
    skill 从用户消息正则截取后 JSON.parse
```

### 1.3 典型大小与适配入口

| 资料类型 | 块数 | 图片数 | 文件大小 | 推荐入口 |
|---|---|---|---|---|
| 纯文字讲义 / 默写纸 | 30-100 | 0 | 12-20 KB | [A] / [B] / [C] 都行 |
| 知识清单 | 30-50 | 1-3 | 20-30 KB | [A] / [B] / [C] 都行 |
| 数学教案（含公式块） | 100-200 | 10-20 | 200-300 KB | [A] 首推、[B] 单行 .txt OK |
| 试卷（多图） | 200-300 | 20-40 | 300-500 KB | [A] 首推 |
| 杂志风（含大幅水墨配图） | 30-60 | 4-10 | 100-200 KB | [A] / [B] |

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
1. 取字符串：
   [A] 用户消息含 OSS URL → read_url(URL)
   [B] 用户上传 .txt    → read_file(resourceId)，直接是 JSON 字符串
   [C] 用户上传 .html   → read_file(resourceId) → 用正则
                         /<script[^>]*id="source-package"[^>]*>([\s\S]*?)<\/script>/
                         提取出 JSON 字符串
   [D] 用户消息直接含整段 JSON → 取 "{...}" 子串
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

1. 本地用 mineru 跑出文档（pipeline 速度快 / vlm 识别更准）：
   mineru -p <你的文件.pdf> -o ./out -b pipeline

2. 用 mineru_to_package.py 打包（自动输出 .json/.txt/.html 三种格式）：
   python3 mineru_to_package.py \
     --input  ./out/<文件名>/auto \
     --output ./<文件名>.source-package \
     --user-intent 试卷            # 或 教案 / 讲义 / 知识清单 / 杂志风
     --ext all                    # .json + .txt + .html 都生成

3. 上传给飞象老师，三选一：
   [A] 用 fxls upload admin <文件名>.source-package.json
       → 拿到 https://musk-test.fbcontent.cn/.../xxx.json
       → 把这个 URL 粘进对话即可（首推，无大小限制）
   [B] 直接在飞象网页拖入 <文件名>.source-package.txt（单行压缩 JSON）
       → 飞象 read_file 1 行拿全
   [C] 直接在飞象网页拖入 <文件名>.source-package.html（含预览页）
       → 飞象 read_file 拿到 HTML，skill 自动从 <script> 标签里取 JSON

4. 任意一种上传后，告诉我「按 magazine-layout 精美排版」即可。
   （或更具体："按 exam_paper / teacher_lesson_plan / magazine_article 排版"）

注：飞象网页上传白名单不接受 .json/.md，所以必须走 [A] OSS URL 或 [B]/[C] .txt/.html。
   若不方便跑 mineru，直接传原 PDF/DOCX 也可以，但图形依赖型试卷会阻塞、纯文字会出文字版。
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
