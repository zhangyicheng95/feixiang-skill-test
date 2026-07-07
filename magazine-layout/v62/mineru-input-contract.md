# mineru source-package@v2 输入合同

> v62 magazine-layout skill 的核心输入是用户线下用 mineru 跑出、再由
> `mineru_to_package.py` 打包成的 `*.source-package.json`（schema v2）。
> 本文件定义字段合同与读取流程。
>
> v2 改动（v1 → v2）：
> - 图片改为 OSS URL 化（`imageLedger[i].url`），不再全 base64 内嵌
> - `document.markdown` 删除，改 `document.markdownPreview`（仅 200 字预览，完整原文用 `blocks` 数组）
> - JSON 输出多行 indent=2，避免飞象 `read_url` 单行 ~2 KB 截断

---

## 1. 单文件设计原则

`source-package@v2` 是 self-contained 的，飞象老师只需 `read_url` / `read_file` 即可拿到：

- 全部文本（按阅读顺序的 `blocks` 数组）
- 全部图片（`imageLedger[].url` OSS URL，或备用 `dataUriLines` base64 拆行数组）
- 路由建议（`routing.recommendedSubtype`）
- 质量统计（`quality.questionCount / answerCount / warnings`）

### 1.1 v62 关键限制：飞象 `read_url` 行为

实测飞象 `read_url`：

| 场景 | 行为 |
|---|---|
| 文件 ≤ 1000 行 + 单行 ≤ 1500 B | 一次拿全（含末尾 `(End of file - total N lines)`） |
| 文件 > 1000 行 | 默认前 1000 行；要继续读必须用 `offset` 参数 |
| 单行 > 2 KB | **截断到 2049 字符**，导致 JSON 解析失败 |

所以 v62 打包工具默认输出多行 JSON（`indent=2`），保证：

- 单行 ≤ 1100 B（绝不超 2 KB）
- 中等包（教案/讲义/知识清单/杂志风）≤ 1000 行 → 一次拿全
- 试卷（>200 题/30 张图）3000-4000 行 → skill 用 offset 多次读

### 1.2 飞象上传白名单与三种承载格式

飞象网页上传**只接受**：`.doc/.docx/.pdf/.ppt/.pptx/.xls/.xlsx/.txt/.csv/.html/.jpeg/.jpg/.png/.webp`，**不接受 `.json` / `.md`**。

| 后缀 | 内容 | 用途 |
|---|---|---|
| `.json` | 标准缩进 JSON（多行） | **fxls upload admin 通道**首选，绕过白名单 |
| `.txt` | 同 .json 内容，仅扩展名换成 .txt | 飞象网页直接拖入；read_file 兼容 |
| `.html` | `<script id="source-package" type="application/json">...</script>` 包装 | 飞象网页拖入 + 浏览器双击预览 |

---

## 2. 三种入口（推荐顺序）

```text
[A] OSS URL 入口（首推）
    1. 本地  python3 mineru_to_package.py \
              --input  ./out/<name>/auto \
              --output ./<name>.source-package \
              --user-intent 试卷
       工具会自动 fxls upload admin 主包，最后一行打印「★ 主包 URL: https://...」
    2. 用户在飞象老师对话中粘贴 URL
    3. skill 调  read_url(URL)  → 字符串 → JSON.parse

[B] 文件上传入口
    1. 本地输出 .txt 或 .html
    2. 用户在飞象网页拖入
    3. skill 调  read_file(resourceId)
       .txt → 直接 JSON.parse
       .html → 用 /<script[^>]*id="source-package"[^>]*>([\s\S]*?)<\/script>/ 截取后 parse

[C] 文本粘贴入口（应急，仅小包 < 5 KB）
    用户消息含 "schema":"magazine-layout/source-package@v"
    skill 从消息正则截取 JSON 后 parse
```

### 2.1 read_url 多次读取（试卷 >1000 行场景）

```js
async function readSourcePackageFromUrl(url) {
  let raw = '';
  let offset = 0;
  let totalLines = Infinity;
  for (let i = 0; i < 12; i++) {  // 最多 12 段，防止死循环
    const chunk = await read_url(url, { offset, limit: 1000 });
    // 去掉每行 5 位行号前缀  "00001| {..."
    const cleaned = chunk.replace(/^\s*\d+\|\s?/gm, '').replace(/\(End of file - total \d+ lines\)\s*$/, '');
    raw += cleaned;
    const m = chunk.match(/\(End of file - total (\d+) lines\)/);
    if (m) {
      totalLines = +m[1];
      if (offset + 1000 >= totalLines) break;
    }
    offset += 1000;
  }
  return JSON.parse(raw);
}
```

### 2.2 典型大小与适配入口

| 资料类型 | blocks 数 | 图片数 | 主包大小 | JSON 行数 | 入口 |
|---|---|---|---|---|---|
| 纯文字讲义 / 默写纸 | 30-100 | 0 | 12-20 KB | 400-800 行 | [A]/[B]/[C] |
| 知识清单 | 30-50 | 1-3 | 8-15 KB | 300-500 行 | 全部 OK |
| 杂志风（含水墨配图） | 30-60 | 4-10 | 15-25 KB | 500-1000 行 | [A]/[B] |
| 数学教案（含公式块） | 100-200 | 10-20 | 25-40 KB | 800-1200 行 | [A] 首推 |
| 试卷（多图） | 200-300 | 20-40 | 80-130 KB | 3000-4000 行 | [A] 首推（需 offset 多次读） |

---

## 3. 字段合同（v2）

### 3.1 顶级字段

```jsonc
{
  "schema": "magazine-layout/source-package@v2",
  "source":      { ... },
  "document":    { ... },     // 文档级元数据
  "blocks":      [ ... ],     // 阅读顺序的块列表（完整原文）
  "imageLedger": [ ... ],     // 每张图：url 或 dataUriLines
  "routing":     { ... },     // 模板族路由建议
  "quality":     { ... }      // 质量统计与警告
}
```

### 3.2 source

```jsonc
"source": {
  "fileName": "2026 北京西城六年级（上）期末数学",
  "parser": "mineru",
  "parseMode": "pipeline" | "vlm" | "hybrid",
  "inputDir": "/path/.../auto"   // 仅供调试
}
```

### 3.3 document（v2 改动）

```jsonc
"document": {
  "title":   "10.2.1 代入消元法（第 1 课时）",
  "subject": "math|chinese|english|physics|chemistry|biology|geography|general",
  "grade":   "七年级",
  "markdownPreview": "前 200 字预览，仅供 skill 快速判断"
  // v1 的 "markdown" 字段已删除：完整原文用 blocks 数组拼接，避免单行 16 KB 截断
}
```

### 3.4 blocks（完整原文）

按阅读顺序的结构化块。skill 必须遍历 `blocks` 数组生成 HTML，**不要** 再去取 `document.markdown`（v2 已删）。

```jsonc
"blocks": [
  // 文本块（含标题、段落）
  { "type": "text", "text": "**10.2.1 代入消元法**", "page_idx": 0 },
  // 标题块（mineru 显式标记）
  { "type": "text", "text": "教学目标", "text_level": 1, "page_idx": 0 },
  // 图片块（src 引用 imageLedger）
  { "type": "image", "src": "images/abc.jpg", "page_idx": 0, "alt": "..." },
  // 表格块（mineru 输出 HTML 字符串）
  { "type": "table", "table_body": "<table>...</table>", "page_idx": 1 },
  // 公式块（OCR LaTeX）
  { "type": "equation", "text": "x^2 + y^2 = 1", "page_idx": 2 },
  { "type": "list_item", "text": "...", "page_idx": 0 }
]
```

**约定**：

- `blocks[*].src` 是 imageLedger 的 join key
- `text_level` 由 mineru 提供：1=主标题，2=二级，3=三级
- 段落开头加粗（`**xx**`）通常是教案 stage 名（教学目标/教学重点/...），需识别后做 stage 徽章

### 3.5 imageLedger（v2 改动）

每张图片一条记录，按"图片在 blocks 中首次出现的顺序"排列：

```jsonc
"imageLedger": [
  {
    "filename": "images/abc.jpg",
    "role": "page_full | figure_diagram | figure_inline | formula_block | formula_inline | unknown",
    "naturalSize": { "width": 720, "height": 440 },
    "bytes": 23456,
    "mime": "image/jpeg",
    "refCount": 3,                              // blocks 中被引用次数

    // v2：以下三种 src 字段三选一（按优先级）
    "url": "https://musk-test.fbcontent.cn/.../abc.jpg",       // ★ 首选：OSS URL
    // "dataUriLines": [                                        // 备用：base64 拆成行
    //   "data:image/jpeg;base64,/9j/4AAQ...续...",
    //   "...续...",
    //   ...
    // ]
    // skill 端用 dataUriLines.join('') 拼回完整 dataUri
  }
]
```

**为什么改成 url 优先**：v1 的 `dataUri` 字段是单行 base64，单张大图（如 26 KB JPG）会变成单行 26 KB 字符串，被飞象 `read_url` 单行 2 KB 限制截断。v2 的方案：

- 主路径：`mineru_to_package.py` 默认 `--upload-images` 打开，每张图 `fxls upload admin` 拿 OSS URL
- 备用路径：上传失败的图（如内容审核拦截）用 `dataUriLines` 拆行数组

**skill 拿可用 src**：

```js
function imgSrc(entry) {
  if (entry.url) return entry.url;
  if (entry.dataUriLines) return entry.dataUriLines.join('');
  if (entry.dataUri) return entry.dataUri;  // v1 兼容
  return null;
}
```

**role 含义与渲染策略**：

| role | 典型来源 | 渲染策略 |
|---|---|---|
| `formula_inline` | docx 内嵌 WMF（小尺寸） | `display:inline-block; max-height:8mm; vertical-align:middle` |
| `formula_block` | docx/PDF 中独立公式 | `display:block; max-width:80mm; max-height:24mm; text-align:center` |
| `figure_diagram` | 几何图、电路图、思维导图 | `max-width:140mm; max-height:90mm` 题内题图 |
| `figure_inline` | 小型示意图 | `max-width:60mm` 行内或浮动 |
| `page_full` | A4 整页扫描 | 仅 `Phase 3.fullpage` 原卷整页保真模式用 |
| `unknown` | 未分类 | 阻塞，要求重传或在响应中说明 |

`refCount` 用于检测「同一图被 ≥ 3 次复用」的伪裁剪反例。

### 3.6 routing

```jsonc
"routing": {
  "recommendedFamily": "assessment_work|learning_document|knowledge_reference|magazine_reading",
  "recommendedSubtype": "exam_paper|practice_sheet|question_set|dictation_sheet|teacher_lesson_plan|student_handout|knowledge_sheet|magazine_article",
  "confidence": 0.85,
  "reasons": [...],
  "candidates": [...],
  "fallback": "magazine_article" | null,
  "userIntent": "试卷" | null
}
```

**优先级**：

1. 用户在对话中说"做成 X"（"做成默写纸""做成杂志风"）→ **最高**，覆盖 routing
2. routing.recommendedSubtype（confidence ≥ 0.5）→ 默认采用
3. routing.confidence 0.3-0.5 → ask_user 确认
4. routing.confidence < 0.3 → 询问用户或用 routing.fallback

### 3.7 quality

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

- `missingImages` 非空 → 跳过这些块，并在 cover 上方加 warning bar
- `diagramDependent` → 阻塞，要求用户先用 mineru pipeline 重跑（或换 vlm 后端）
- `answerCount=0` 但用户说"试卷" → 提醒用户上传含答案的版本

---

## 4. 读取流程

### 4.1 主路径

```text
1. 取字符串
   [A] 用户消息含 OSS URL → read_url(URL)（>1000 行用 offset 循环）
   [B] 用户上传 .txt    → read_file(resourceId)
   [C] 用户上传 .html   → read_file → /<script[^>]*id="source-package"[^>]*>([\s\S]*?)<\/script>/ 截取
   [D] 用户消息直接含 JSON → 取 "{...}" 子串
2. JSON.parse → pkg
3. 校验 pkg.schema 以 "magazine-layout/source-package@v" 开头
4. 取 pkg.routing.recommendedSubtype 作为默认模板族选择
5. 检查 pkg.quality.warnings
6. 进入 Phase 2 模板族选择
```

### 4.2 降级路径（用户没传 source-package）

```text
1. 用户上传 PDF / DOCX / PPTX / XLSX / 图片
2. convert_to_text 拿 OCR 文本
3. 三类分流：
   a. 纯文字 → Phase 2 走 text_only_degraded（cover 标注「文字版」）
   b. 图形依赖型试卷 → 阻塞，按 SKILL.md 阻塞模板回复
   c. 含图非图形依赖 → ask_user 是否接受文字版
```

降级路径不构造 source-package，直接用 OCR 文本进 Phase 2。

---

## 5. 用户上传操作指引（写入对话话术）

```plain
推荐流程（精美排版质量最稳）：

1. 本地用 mineru 跑出文档：
   mineru -p <你的文件.pdf> -o ./out -b pipeline    # pipeline 速度快
   # 或  mineru -p <你的文件.pdf> -o ./out -b vlm   # vlm 识别更准

2. 用 mineru_to_package.py 打包（默认会自动上传图片到 OSS、自动上传主包）：
   python3 mineru_to_package.py \
     --input  ./out/<文件名>/auto \
     --output ./<文件名>.source-package \
     --user-intent 试卷    # 或 教案 / 讲义 / 知识清单 / 杂志风

   工具会自动打印「★ 主包 URL: https://musk-test.fbcontent.cn/.../xxx.json」

3. 把这个 URL 粘进飞象老师对话即可，告诉它「按 magazine-layout 精美排版」。
   （或更具体：「按 exam_paper / teacher_lesson_plan / magazine_article 排版」）

注：
- 默认走 [A] OSS URL 路径，所有大小都能正确处理
- 如不方便跑 mineru，直接传原 PDF/DOCX：图形依赖型试卷会阻塞、纯文字会出文字版
```

---

## 6. v1 → v2 兼容性

skill v62 同时支持 v1 / v2 schema：

| 字段 | v1 | v2 | skill 处理 |
|---|---|---|---|
| `schema` | `...source-package@v1` | `...source-package@v2` | 都接受 |
| `document.markdown` | 单行长字符串 | 删除 | v1 走 markdown 兜底，v2 用 blocks |
| `document.markdownPreview` | 不存在 | 200 字预览 | v2 仅快速判断用 |
| `imageLedger[].dataUri` | 单行 base64 | 仅 fallback 才有 | 优先 url > dataUriLines > dataUri |
| `imageLedger[].url` | 不存在 | 主推 OSS URL | v2 首选 |
| `imageLedger[].dataUriLines` | 不存在 | 拆行数组 | v2 备用，skill 端 .join('') 拼回 |
