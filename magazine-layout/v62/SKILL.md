---
name: magazine-layout
description: 精美排版唯一主 Skill。Use when 用户要求把已给定内容或上传文档改造为 A4 打印友好的高级试卷、讲义、练习单、题单、默写纸、知识清单、教案打印版、杂志风资料，或提到精美排版、高级排版、好看、美化、可打印、A4、一比一、还原、原卷图、按这个格式来。**v62 协议·五条铁律（违反任一条立刻自我否决）**：① **唯一脚本白名单**：HTML 中只允许出现 `cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js` + `unpkg.com/pagedjs@0.4.3/dist/paged.polyfill.js` 这两个外链脚本，**严禁** 引入 Tailwind / 飞象代理脚本（任何 `metis-online.fbcontent.cn`、`metis-misc`、Tailwind CDN 都禁），**严禁** 自己 inline 大段 `<script>` 调度逻辑；② **脚本顺序固定**：MathJax 配置 → MathJax 脚本 → PagedConfig.before（含 `await window.MathJax.typesetPromise()`）→ Paged.js 脚本，缺一不可；③ **禁手动切页**：禁止 `<section class="page">` 或任何固定高度容器手动分页，**只能** 让 Paged.js 自动分页；普通题块（`.question / .question-group / .section / .card / .page`）禁止批量 `break-inside: avoid`，只对 `table / figure / img / .keep-together / .kcard` 防拆；④ **打印颜色保留**：所有有 `background-color / background / color != #000` 的元素必须显式 `-webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;`，并在 `@media print` 里复述一遍 `body, * { print-color-adjust: exact !important }`；⑤ **保真不变形**：不删题、不换题、不漏题、不丢图；含 `\frac/<img>/长表达式` 的选项严禁 4 列；@page margin ≤ 12mm；数理化生地学科严禁 `generate_image` 替代原卷图；杂志风/语文/英语 AI 配图必须 `<figcaption>` 标注「AI 辅助插图」；source-package.imageLedger 中 `role!=unknown` 的图全部出现在 HTML 中，全部用 `imageLedger[i].url`（或拼接 `dataUriLines.join('')`）做 `<img src>`。**输入主路径** 是用户在线下用 `mineru_to_package.py` 跑出的 `source-package@v2`：`document.markdownPreview` 仅前 200 字预览（用 `blocks` 数组才是完整原文）；`imageLedger` 每张图带 `url`（OSS URL，首选）或 `dataUriLines`（base64 拆行数组，备用）。**3 种入口**：[A] 对话里贴 OSS URL → `read_url(url)`；[B] 上传 `.txt`/`.html` → `read_file(resourceId)`；[C] 粘贴 JSON → 从最近用户消息正则截取。**每轮第一个工具调用必须** `skills(name="magazine-layout")`；用户回复 `ask_user` 后必须再调一次。`create_html_deliverable` 之前**必须** 在响应里逐条贴出 12 项手工自检结果，任一未过停止交付。已 `ask_user` 后本轮**严禁** 继续 `create_html_deliverable`。
---

更新时间：2026-05-09

# 精美排版 magazine-layout · v62

> v62 升级原因：v61 实测大模型选择性忽略了"禁 Tailwind / 标准 MathJax CDN / 脚本顺序 / print-color-adjust"等关键约束，导致打印预览大量元素消失。本版本把这些约束提到 description 顶部并加强语气，新增 12 项硬自检。

---

## 1. 五条铁律（绝不允许违反）

任何一条违反即视为不合格交付，**必须当场重写**。

### 铁律 1 · 脚本白名单（违者立即否决）

HTML 的 `<script src>` **只允许** 出现这两个：

```html
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
<script src="https://unpkg.com/pagedjs@0.4.3/dist/paged.polyfill.js"></script>
```

**禁止** 任何其他 `<script src>`，包括但不限于：

- `metis-online.fbcontent.cn/...`（飞象代理脚本，**会破坏分页与打印**）
- `metis-misc/...`（同上）
- `cdn.tailwindcss.com` / Tailwind 任何 CDN（preflight 与 Paged.js 0.4.3 严重冲突）
- 任何 `tailwind` 命名的 CDN
- 飞象内部 `data-collect` / `data-track` 注入脚本

**禁止** 在 `<head>` 内 inline 大段 `<script>`（仅允许 `window.MathJax = {...}` 配置 + `window.PagedConfig = {...}` 配置，**不超过 30 行**，不允许其他业务逻辑）。

### 铁律 2 · 脚本顺序（一字不差）

```html
<head>
  <!-- 1. MathJax 配置（先于 MathJax 脚本声明） -->
  <script>
    window.MathJax = {
      tex: { inlineMath: [['\\(','\\)']], displayMath: [['\\[','\\]']] },
      svg: { fontCache: 'global' },
      startup: { typeset: false }
    };
  </script>

  <!-- 2. MathJax 脚本 -->
  <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>

  <!-- 3. Paged.js 配置：必须 await typesetPromise -->
  <script>
    window.PagedConfig = {
      before: async () => {
        if (window.MathJax?.typesetPromise) {
          await window.MathJax.typesetPromise();
        }
      }
    };
  </script>

  <!-- 4. Paged.js 脚本（必须最后加载） -->
  <script src="https://unpkg.com/pagedjs@0.4.3/dist/paged.polyfill.js"></script>
</head>
```

颠倒顺序、缺 PagedConfig.before、缺 typesetPromise 任何一项 → 公式渲染时序错乱 → 打印产物丢公式。

### 铁律 3 · 不准手动切页

**禁止**：

```html
<!-- 错 -->
<section class="page">...</section>
<section class="page">...</section>
<div style="height: 297mm; page-break-after: always">...</div>
```

**禁止** 给 `.question / .question-group / .question-item / .answer-area / .section / .card / .page / .point-card` 等普通题块批量加 `break-inside: avoid` 或 `page-break-inside: avoid`（会造成大面积空白页）。

**允许** 仅对以下选择器加防拆：

```css
table, figure, img, .keep-together, .kcard {
  break-inside: avoid;
  page-break-inside: avoid;
}
```

布局只能是顺序流（`<main>` 直接放 `<header>/<section>/<article>` 等语义块），**让 Paged.js 自动分页**。

### 铁律 4 · 打印颜色保留（v61 重大失败原因）

凡是设了 `background-color / background / color`（且不是 `#000` / `#222` 这类近黑文字）的元素，**必须显式声明 print-color-adjust**：

```css
.kcard,
.handout-objective,
.unit-title,
.cover-header,
.cover-eyebrow,
.option-box,
.work-options,
.section-title,
[class*="card"],
[class*="banner"] {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}

@media print {
  html, body, * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .no-print { display: none !important; }
}
```

否则浏览器打印时会丢失背景色 → 卡片仅剩外框 → **打印预览像 v61 实测那样大量空白**。

### 铁律 5 · 内容保真（不变形）

- **不删题、不换题、不漏题**：HTML 题目数量必须 ≥ `source-package.quality.questionCount`
- **不丢图**：`source-package.imageLedger` 中所有 `role!=unknown` 的图必须出现在 HTML 中
- **不伪造图**：数学/物理/化学/生物/地理学科 `<img>` **不允许** 任何 AI 生成图（一律用 `imageLedger[i].url`）；杂志风/语文/英语 AI 配图必须 `<figcaption>AI 辅助插图</figcaption>`
- **答案/解析完整**：若 `quality.answerCount > 0`，每条答案与解析必须完整保留
- **公式选项不挤**：含 `\frac / \dfrac / <img> / 长表达式` 的 `.options` 严禁 `repeat(4, 1fr)`，改 `repeat(2, 1fr)` 或 `1fr`
- **@page margin ≤ 12mm**

---

## 2. 输入：source-package@v2（主路径）

> v62 起 schema 升到 `magazine-layout/source-package@v2`：图片用 OSS URL（`imageLedger[i].url`）而非 base64 内嵌；markdown 字段去除（用 `blocks` 数组拼接，详见 §3）。

**3 种入口**（按优先级）：

```text
[A] OSS URL 入口（首推）
    用户消息中贴出 https://musk-test.fbcontent.cn/.../xxx.json 或 .txt 或 .html
    → 调用  read_url(那个 URL)
    → 多次调用直到拿到 (End of file - total N lines) 提示
    → 字符串拼接后 JSON.parse

[B] 上传文件入口
    用户在飞象网页拖入 *.txt / *.html
    → 调用  read_file(resourceId)
    → .txt：直接 JSON.parse
    → .html：用 /<script[^>]*id="source-package"[^>]*>([\s\S]*?)<\/script>/ 截取后 parse

[C] 文本粘贴入口（应急）
    用户消息含 "schema":"magazine-layout/source-package@v"
    → 从消息正则截取 JSON 后 parse
```

**read_url 行数处理**：飞象 `read_url` 默认每次返回前 1000 行 + `(End of file - total N lines)` 末尾提示。若 `N > 1000`：

```js
let raw = '';
let offset = 0;
while (true) {
  const chunk = await read_url(url, { offset, limit: 1000 });
  raw += chunk.replace(/^\s*\d+\|\s?/gm, '');  // 去掉行号前缀
  const m = chunk.match(/\(End of file - total (\d+) lines\)/);
  if (m && offset + 1000 >= +m[1]) break;
  offset += 1000;
  if (offset > 10000) break;  // 安全阈值
}
const pkg = JSON.parse(raw);
```

**source-package@v2 字段速查**：

```jsonc
{
  "schema": "magazine-layout/source-package@v2",
  "source": { "fileName", "parser": "mineru", "parseMode": "pipeline|vlm" },
  "document": {
    "title", "subject", "grade",
    "markdownPreview": "前 200 字预览，仅供 skill 快速判断；完整原文用 blocks 数组拼接"
  },
  "blocks": [                                  // 完整原文，按阅读顺序
    { "type": "text",  "text": "...", "page_idx": 0 },
    { "type": "image", "src": "images/xxx.jpg", "page_idx": 1 },
    { "type": "table", "table_body": "<table>...</table>" },
    { "type": "equation", "text": "x^2+y^2=1" }
  ],
  "imageLedger": [                             // 每张图 1 条
    {
      "filename": "images/xxx.jpg",
      "role": "page_full|figure_diagram|figure_inline|formula_block|formula_inline|unknown",
      "naturalSize": { "width": 720, "height": 440 },
      "url": "https://musk-test.fbcontent.cn/...../xxx.jpg"   // ← 首选用这个做 <img src>
      // 或者，仅当上传失败时回落：
      // "dataUriLines": ["data:image/png;base64,iVBOR...", "...续...", ...]   // skill 端 .join('') 拼回
    }
  ],
  "routing": { "recommendedFamily", "recommendedSubtype", "confidence", "reasons" },
  "quality": { "blockCount", "questionCount", "answerCount", "warnings", "missingImages" }
}
```

**图片渲染规则**：

```js
// 给一个 imageLedger entry 拿出可用 src
function imgSrc(entry) {
  if (entry.url) return entry.url;
  if (entry.dataUriLines) return entry.dataUriLines.join('');
  if (entry.dataUri) return entry.dataUri;  // v1 兼容
  return null;  // role=unknown 或 missing 时不渲染
}
```

**HTML 内 `<img>` 写法**：

```html
<img src="<上面 imgSrc 拿到的字符串>"
     alt="<imageLedger[i].role 或 简短文字描述>"
     style="max-width: 100%; height: auto" />
```

不允许用 `<img onerror=...>` 隐藏失败，不允许编造工具未返回的 URL。

---

## 3. fallback：原始 PDF/DOCX/PPTX

当用户没传 source-package、只传了原始文件：

```text
1. 调用 convert_to_text 拿 OCR 文本
2. 三类分流：
   a. 纯文字资料（讲义无图 / 默写纸 / 答案订正）→ 进入 Phase 2 走 text_only_degraded 模式
   b. 图形依赖型（数学/物理/化学/生物/地理或含「如图/示意图/统计图/电路图/光路图/数轴」）
      → 阻塞，按下方模板告知用户先用 mineru 跑 source-package
   c. 含图非图形依赖（语文/英语阅读、知识清单）→ ask_user 是否接受文字版
3. text_only_degraded 模式必须在交付物 cover 标注「未走结构化解析 / 文字版」
```

**阻塞模板**：

```plain
当前不生成精美 A4 重排：上传文件含图形条件（如图 / 统计图 / 电路图等），
convert_to_text 只能拿到文字层，无法获取真实题内图，会导致原卷图形丢失。

请采用以下任一方式：
① 推荐：本地用 mineru 跑出 source-package 再上传（保留题号、图片、公式、答案完整结构）
② 仅文字版（不可作为完整试卷使用）：明确回复"我接受文字版，不需要原图"，会输出标注的文字版 HTML
```

---

## 4. 模板族与场景映射

详细规则见 [`template-families.md`](template-families.md)。摘要：

| 用户场景词 | 模板族 | subtype | 默认风格 | 默认密度 |
|---|---|---|---|---|
| 试卷、卷子、期末/期中 | `assessment_work` | `exam_paper` | classic_black_white | compact |
| 练习单、巩固训练 | `assessment_work` | `practice_sheet` | classic_black_white | compact |
| 题单、专题、错题集 | `assessment_work` | `question_set` | academic_blue | compact |
| 默写纸、听写、单词/古诗 | `assessment_work` | `dictation_sheet` | classic_black_white | spacious |
| 教案、教师备课 | `learning_document` | `teacher_lesson_plan` | academic_blue | compact |
| 讲义、学生学习材料 | `learning_document` | `student_handout` | warm_amber/academic_blue | standard |
| 知识清单、公式表 | `knowledge_reference` | `knowledge_sheet` | academic_green | compact |
| 杂志风、主题阅读 | `magazine_reading` | `magazine_article` | magazine_light | spacious |

优先用 `routing.recommendedSubtype`；用户显式说"做成 X"才覆盖。

---

## 5. 工作流（4 阶段）

```text
Phase 0：加载本 skill
  必读：SKILL.md、template-families.md、pagedjs-template.md、quality-gate.md
  禁止：调 mathdesign-1-html / html-authoring / page-optimize 等冲突 skill

Phase 1：读取输入
  优先：read_url / read_file 拿 source-package 字符串 → JSON.parse
  降级：convert_to_text + 按 §3 分流

Phase 2：路由 + 配置
  用 routing.recommendedSubtype；用户显式覆盖才换
  挑选 style_preset / density / columns / answer_space / fidelity_mode 至少 2 个参数

Phase 3：生成 HTML + 12 项硬自检 + 交付
  按 pagedjs-template.md 的标准骨架写 HTML
  逐条对照 12 项硬自检（见 §6）
  把"已自检 12 项"贴在响应里 → 才能 create_html_deliverable
```

**Phase 0 重读触发点**：用户回复 `ask_user` 后、补传新文件后、距上次 `skills` 调用 ≥3 个工具调用且即将 `create_html_deliverable` 时，必须重新调 `skills(name="magazine-layout")`。

---

## 6. 12 项硬自检（v62 强制贴在响应里）

`create_html_deliverable` 之前必须逐条对照、并在响应里**完整贴出**「已自检 12 项」清单。任一未过停止交付、重写 HTML。

| # | 检查项 | 通过条件 |
|---|---|---|
| 1 | **MathJax 标准 CDN** | `<script src>` 含 `cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js`；**不含** `metis-online` / `metis-misc` |
| 2 | **Paged.js 0.4.3 标准 CDN** | `<script src>` 含 `unpkg.com/pagedjs@0.4.3/dist/paged.polyfill.js`；MathJax 在 Paged.js 之前 |
| 3 | **PagedConfig.before** | 含 `window.PagedConfig = { before: async () => { await window.MathJax.typesetPromise() } }` |
| 4 | **不引 Tailwind / 飞象代理脚本** | 全文搜不到 `tailwind` / `metis-online` / `metis-misc` 字样 |
| 5 | **不手动切页** | 全文搜不到 `<section class="page">`；不含 `style="height: 297mm` 等固定高度 |
| 6 | **普通题块无 break-inside avoid** | `.question / .question-group / .section / .card / .page / .point-card` 不含 `break-inside: avoid`；只对 `table / figure / img / .keep-together / .kcard` 防拆 |
| 7 | **print-color-adjust: exact** | 所有有 background-color 的 class 显式 `-webkit-print-color-adjust: exact !important` 或 `@media print { *, html, body { print-color-adjust: exact !important } }` |
| 8 | **@page margin ≤ 12mm** | `@page { size: A4 portrait; margin: 10mm 12mm }` 或更小 |
| 9 | **题量保真** | HTML 内题目数量 ≥ `quality.questionCount`（贴出实际数 vs 期望数） |
| 10 | **图片保真** | `imageLedger` 中 `role!=unknown` 的图全部出现在 HTML（贴出 `n/total` 比例）；全部用 `imageLedger[i].url` 或 `dataUriLines.join('')`，**不允许** AI 图替代学科原图 |
| 11 | **答案/解析完整** | 若 `quality.answerCount > 0`，每条答案与解析完整出现在 HTML |
| 12 | **分数选项 ≤ 2 列** | 含 `\frac / <img> / 长表达式` 的 `.options` CSS 不用 `repeat(4, 1fr)` |

**响应模板**：

```plain
[Agent v62 硬自检 12 项]
1. MathJax 标准 CDN ✅ jsdelivr/mathjax@3/es5/tex-svg.js
2. Paged.js 0.4.3 标准 CDN ✅ unpkg/pagedjs@0.4.3
3. PagedConfig.before + typesetPromise ✅
4. 无 Tailwind / 飞象代理脚本 ✅
5. 不手动切页 ✅ 由 Paged.js 自动分页
6. 普通题块无 break-inside avoid ✅
7. print-color-adjust exact ✅ 已声明在 .kcard / @media print
8. @page margin ≤ 12mm ✅ 10mm 12mm
9. 题量保真 ✅ HTML 30 题 vs quality.questionCount=30
10. 图片保真 ✅ 12/12 张图全部到位（全部 imageLedger.url）
11. 答案/解析完整 ✅ 30 条答案+解析齐全
12. 分数选项 ≤ 2 列 ✅
```

---

## 7. 可调用工具（v62 实测白名单）

| 工具 | 用途 |
|---|---|
| `skills` | Phase 0 加载本 skill 规则 |
| `read_url` | **首选**：读用户贴的 OSS URL（`*.json`/`*.txt`/`*.html`） |
| `read_file` | 读用户上传的 `.txt`/`.html`（含 `<script id="source-package">`） |
| `convert_to_text` | 降级：从 PDF/DOCX 拿 OCR 文本 |
| `ask_user` | 缺信息时表单询问 |
| `think` | 内部思考 |
| `search_html_component` / `get_html_component_detail` | 复用 HTML 组件库（可选） |
| `generate_image` | 仅杂志风/语文/英语装饰图，**禁** 学科原卷 |
| `create_html_deliverable` | 最终 HTML 交付（必须先贴 12 项自检） |

**严禁调用**：`mathdesign-1-html`、`html-authoring`、`page-optimize`、`parse_pptx`、`picture_gen` / `image_create` / `picture_edit` / `edit_image`（用于学科原卷题图）。

---

## 8. 模板锁定（保留 v50 行为）

用户说以下任一句即进入模板锁定：

- "记住这个格式" / "下次按这个来"
- "按照 resourceId XXXX 一模一样的格式"
- "继续制作 Unit 5 / 下一个单元"

锁定 = 固定层（布局/配色/字体/版式/题型结构）保持不变，可变层（年级/学科/具体内容）允许变化。

---

## 9. 文件说明

| 文件 | 用途 |
|---|---|
| `SKILL.md` | 本文件：五条铁律、12 项硬自检、工作流 |
| [`mineru-input-contract.md`](mineru-input-contract.md) | source-package@v2 字段合同、读取流程、降级路径 |
| [`template-families.md`](template-families.md) | 4 模板族 × 8 subtype × 参数化系统 |
| [`pagedjs-template.md`](pagedjs-template.md) | A4 + Paged.js 0.4.3 + MathJax 标准 HTML 骨架 |
| [`quality-gate.md`](quality-gate.md) | 12 项基线 + 4 项 subtype 专项自检细则 |
| [`visual-design-guide.md`](visual-design-guide.md) | 设计 token、信息层级、风格预设 |
| [`math-image-fidelity.md`](math-image-fidelity.md) | 公式/原图保真规则 |
| [`examples.md`](examples.md) | 8 类场景示例 |

---

## 10. v62 失败案例（v61 实测教训，警惕）

实测会话产物中发现的违规模式（**v62 必须避免**）：

| 违规 | 实测后果 | v62 修复 |
|---|---|---|
| 用 `metis-online.fbcontent.cn/.../mathjax.js` 飞象代理 | MathJax 渲染时序错乱，公式不显示 | 铁律 1：脚本白名单只允许 jsdelivr |
| 用 `metis-misc/...js` 飞象 Tailwind 代理 | Tailwind preflight 与 Paged.js 0.4.3 冲突，**打印预览大量元素消失** | 铁律 1：禁 Tailwind |
| MathJax 在 Paged.js 之后加载、缺 PagedConfig.before | 公式被截断 / 不渲染 | 铁律 2：四步顺序固定 |
| 用 `<section class="page">` 手动切页 | 与 Paged.js 自动分页冲突，产生空白页 | 铁律 3：禁手动切页 |
| `.card { background-color }` 但无 `print-color-adjust: exact` | 打印预览中卡片只剩外框、文字消失 | 铁律 4：强制声明 |
| 数学教案调 `generate_image` 生成插图 | 学科原图被 AI 图替代 | 铁律 5：STEM 严禁 AI 图 |
| 大模型主动简化题量（23 题 → 4 题） | 内容缩水 | 自检 9：HTML 题数 ≥ quality.questionCount |
| 大文件 read_url 单行截断到 2 KB | 拿不到完整 source-package | source-package@v2 改多行 + 单图 URL |
