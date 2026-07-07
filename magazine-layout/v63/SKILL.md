---
name: magazine-layout
description: 精美排版唯一主 Skill。Use when 用户要求把已给定内容或上传文档改造为 A4 打印友好的高级试卷、讲义、练习单、题单、默写纸、知识清单、教案打印版、杂志风资料，或提到精美排版、高级排版、好看、美化、可打印、A4、一比一、还原、原卷图、按这个格式来。**v63 协议·七条铁律（违反任一条立刻自我否决重写）**：① **唯一脚本白名单**：HTML `<script src>` 只允许 `cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js` + `unpkg.com/pagedjs@0.4.3/dist/paged.polyfill.js`；严禁 Tailwind / `metis-online.fbcontent.cn` / `metis-misc` / 任何业务追踪脚本。② **脚本顺序固定**：MathJax 配置 → MathJax 脚本 → `PagedConfig.before`（含 `await window.MathJax.typesetPromise()`）→ Paged.js 脚本，缺一不可。③ **禁手动切页**：禁止 `<section class="page">` / 任何固定高度容器；禁止 `body / main / .container` 加 `max-width / width` 固定宽度；普通题块禁 `break-inside: avoid`，只对 `table / figure / img / .keep-together / .kcard` 防拆。④ **打印颜色保留**：所有有色块显式 `-webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;`，并在 `@media print` 兜底 `html, body, * { print-color-adjust: exact !important }`。⑤ **保真不变形**：HTML 内 `.question / .work-question / .q-item` 等题块数 ≥ `quality.questionCount`；`imageLedger[*].url`（或 `dataUriLines.join('')`）全部出现在 `<img src>`；`quality.answerCount > 0` 时每条答案与解析必须保留；含 `\frac/<img>/长表达式` 选项严禁 4 列；@page margin ≤ 12mm；STEM 学科严禁 `generate_image`。⑥ **打印一致性**（v63 新）：屏幕预览 ≡ 浏览器打印预览 ≡ 打印纸面 三态必须**结构一致**——禁止 `box-shadow / filter / linear-gradient / background-image: url() / position:fixed`（除 .no-print 按钮）；禁止 `@media print` 改变布局（不改 grid 列数、不改 flex 方向、不改 display）；尺寸单位必须用 mm/pt/em（避免 px 在不同 DPI 漂移）。⑦ **必须打印入口**（v63 新）：HTML 必须包含 `<button class="no-print" onclick="window.print()" style="position:fixed; right:8mm; bottom:8mm; ...">打印</button>`，`@media print { .no-print { display:none !important } }`；并在响应里告诉用户「点击右下角『打印』按钮 或按 Ctrl+P / ⌘+P」。**风格自由度**：class 命名、style_preset、单栏/双栏、卡片配色、装饰元素（border / 背景色 / 圆角）由 AI 根据学科/场景自由发挥，不要照搬模板；只要 7 条铁律不违反就有充分发挥空间。**输入主路径**：[A] 用户贴 OSS URL → `read_url(url)`；[B] 用户上传 .txt/.html → `read_file(resourceId)`；[C] 粘贴 JSON → 从消息正则截取。`source-package@v2`：`document.markdownLines/markdownPreview` 仅元数据，**完整原文用 `blocks` 数组**；`imageLedger[i].url` 是 OSS URL（首选）或 `dataUriLines`（备用，skill 端 .join('') 拼回）。**每轮第一个工具调用必须** `skills(name="magazine-layout")`；用户回复 `ask_user` 后必须再调一次。`create_html_deliverable` 之前**必须** 在响应里贴出 14 项硬自检结果，每项必须含**实际计数对照**（如「题量保真 ✅ HTML `.question` 30 个 vs quality.questionCount=30」），任一未过停止交付重写。已 `ask_user` 后本轮**严禁** 继续 `create_html_deliverable`。
---

更新时间：2026-05-12

# 精美排版 magazine-layout · v63

> v63 升级：v62 已修复脚本/MathJax/打印色，但实测仍有三类问题：
> 1. 大模型在自检里**撒谎**（HTML 14 题但报告 27 题）→ v63 自检改"实际计数对照"模式
> 2. **缺打印按钮** → v63 加铁律 7 强制
> 3. **`max-width:800px` + `box-shadow` + `linear-gradient`** 等 web 风格让屏幕/打印预览/打印纸面**结构不一致** → v63 加铁律 6 强制打印一致性
>
> v63 同时**保留高自由度**：class 命名、配色、装饰、栏数全交给 AI 发挥，只守 7 条物理铁律。

---

## 1. 七条铁律（绝不允许违反）

任何一条违反 = 不合格交付，必须当场重写。

### 铁律 1 · 脚本白名单

`<script src>` **只允许**：

```html
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
<script src="https://unpkg.com/pagedjs@0.4.3/dist/paged.polyfill.js"></script>
```

**禁止**：`metis-online.fbcontent.cn` / `metis-misc` / 任何 Tailwind CDN / 飞象 data-collect 业务脚本 / 其他 MathJax entry（tex-mml-chtml.js / tex-chtml.js）。

### 铁律 2 · 脚本顺序

```html
<script>window.MathJax = { tex: {inlineMath:[['\\(','\\)']], displayMath:[['\\[','\\]']]}, svg:{fontCache:'global'}, startup:{typeset:false} };</script>
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
<script>window.PagedConfig = { before: async () => { if (window.MathJax?.typesetPromise) await window.MathJax.typesetPromise(); } };</script>
<script src="https://unpkg.com/pagedjs@0.4.3/dist/paged.polyfill.js"></script>
```

任何顺序错乱 / 缺 `PagedConfig.before` / 缺 `typesetPromise` → 公式时序错乱。

### 铁律 3 · 禁手动切页 + 禁固定容器宽度

**禁止**（v63 新加固定宽度禁令）：

```html
<section class="page">...</section>                    <!-- ❌ 手动切页 -->
<div style="height:297mm; page-break-after:always">    <!-- ❌ 固定 A4 高度 -->
<main style="max-width:800px; margin:0 auto">          <!-- ❌ 固定容器宽（v63 新） -->
<div class="container" style="width:780px">            <!-- ❌ 同上 -->
```

`body / main / .container / .paper-container` 等顶层容器**禁止** `max-width / width` 固定值。Paged.js 由 `@page` 自动算出 A4 内容区（约 186mm），固定容器会与其冲突 → 屏幕看居中正常但打印时被裁切错位。

**唯一允许的顶层布局**：

```css
body { margin: 0; padding: 0; }
main { width: 100%; max-width: 100%; }   /* 全幅，让 Paged.js 处理 */
@page { size: A4 portrait; margin: 10mm 12mm; }
```

**普通题块禁批量防拆**（同 v62）：`.question / .question-group / .section / .card / .page / .point-card` 禁加 `break-inside: avoid`。

**仅以下选择器允许防拆**：

```css
table, figure, img, .keep-together, .kcard {
  break-inside: avoid;
  page-break-inside: avoid;
}
```

### 铁律 4 · 打印颜色保留

```css
/* 1. 元素级（覆盖所有有色块） */
[class*="card"], [class*="banner"], [class*="badge"], [class*="header"],
[class*="title"], .kcard, .no-print {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}

/* 2. 全局兜底（打印态强制保留所有颜色） */
@media print {
  html, body, *, *::before, *::after {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .no-print { display: none !important; }
}
```

### 铁律 5 · 内容保真

- HTML 内题块（`.question / .work-question / .q-item / 编号段落`）数 ≥ `source-package.quality.questionCount`
- `imageLedger` 中 `role!=unknown` 的图全部出现在 HTML 中（用 `entry.url` 或 `entry.dataUriLines.join('')`）
- 数学/物理/化学/生物/地理学科 `<img>` **不允许** 任何 AI 生成图
- 杂志风/语文/英语 AI 配图必须 `<figcaption>AI 辅助插图</figcaption>`
- 答案/解析：若 `quality.answerCount > 0`，每条必须保留
- 公式选项不挤：含 `\frac / \dfrac / <img> / 长表达式` 的 `.options` 严禁 `repeat(4, 1fr)`，改 `repeat(2, 1fr)` 或 `1fr`
- @page margin ≤ 12mm

### 铁律 6 · 打印一致性（v63 新）

**屏幕预览 ≡ 浏览器打印预览 ≡ 打印纸面，三态结构一致**。

**禁止 web 装饰**（在打印态会丢失或漂移，导致三态不一致）：

```css
/* ❌ 禁止以下 web 装饰 */
.card { box-shadow: 0 2px 8px rgba(0,0,0,.1); }    /* 打印时丢失 */
.card { filter: drop-shadow(...); }                  /* 同上 */
.header { background: linear-gradient(...); }        /* 渐变在打印时常被替换为单色 */
.banner { background-image: url(...); }              /* 打印时不可靠 */
.btn { position: fixed; }                            /* 仅 .no-print 允许 */
```

**禁止 `@media print` 改变布局结构**（导致屏幕看到的与打印的不一致）：

```css
/* ❌ 严禁这种改布局 */
@media print {
  .options-grid { grid-template-columns: 1fr; }      /* 屏幕 4 列、打印 1 列 → 不一致 */
  .container { display: block; }                      /* 屏幕 flex、打印 block → 不一致 */
  .sidebar { display: none; }                         /* 屏幕显示、打印隐藏 → 不一致 */
}
```

**唯一允许 `@media print` 做的事**：

1. 隐藏 `.no-print` 按钮（`display: none !important`）
2. 重申 `print-color-adjust: exact`
3. 调整背景白底（`body { background: #fff }`，可选）

**单位规则**：

- 推荐 mm / pt / em（物理单位，跨设备稳定）
- 避免 px（不同 DPI 下漂移）
- 字号建议 9-12pt 正文 + 14-22pt 标题

### 铁律 7 · 必须打印入口（v63 新）

每个 HTML 必须包含浮动打印按钮：

```html
<button class="no-print" onclick="window.print()"
        style="position:fixed; right:8mm; bottom:8mm; z-index:1000;
               padding:8px 16px; border:1px solid #333; border-radius:4px;
               background:#fff; color:#333; cursor:pointer; font-size:13px;
               box-shadow:0 2px 6px rgba(0,0,0,.15);">
  🖨 打印
</button>
```

> `box-shadow` 仅用于 `.no-print` 按钮（屏幕装饰），打印时按钮被隐藏不影响打印一致性。

```css
@media print {
  .no-print { display: none !important; }
}
```

并在响应里**明确提示用户**操作：

```plain
✅ 已为您生成 A4 精美排版。
- 屏幕预览：直接查看交付文件
- 打印 / 导出 PDF：点击页面右下角「🖨 打印」按钮，或按 Ctrl+P（Mac: ⌘+P）
- 浏览器打印对话框中：①勾选「背景图形」②选 A4 纸张 ③选「保存为 PDF」即可导出可分享文件
```

---

## 2. 输入：source-package@v2（主路径）

**3 种入口**：

```text
[A] OSS URL（首推）        用户贴 https://musk-test.fbcontent.cn/.../*.json
                          → read_url(url)（>1000 行用 offset 多次读，详见 mineru-input-contract.md §2.1）

[B] 上传文件入口          用户拖入 .txt 或 .html
                          → read_file(resourceId)
                          → .txt 直接 JSON.parse；.html 用 /<script id="source-package">.../<\/script>/ 截取

[C] 粘贴入口（应急）       用户消息含 "schema":"magazine-layout/source-package@v"
                          → 从消息正则截取 JSON 后 parse
```

**source-package@v2 字段速查**：

```jsonc
{
  "schema": "magazine-layout/source-package@v2",
  "source": { "fileName", "parser":"mineru", "parseMode":"pipeline|vlm" },
  "document": {
    "title", "subject", "grade",
    "markdownLines": ["# 标题", "正文段落 1", "正文段落 2", ...]   // 完整 md 拆行
  },
  "blocks": [                                          // 完整原文，按阅读顺序
    { "type":"text",  "text":"...", "page_idx":0 },
    { "type":"image", "src":"images/xxx.jpg", "page_idx":1 },
    { "type":"table", "table_body":"<table>...</table>" },
    { "type":"equation", "text":"x^2+y^2=1" }
  ],
  "imageLedger": [
    {
      "filename":"images/xxx.jpg",
      "role":"figure_diagram | figure_inline | formula_block | formula_inline | page_full | unknown",
      "naturalSize": { "width":720, "height":440 },
      "url":"https://...../xxx.jpg"                    // ← 首选；若无，看 dataUriLines
    }
  ],
  "routing":  { "recommendedSubtype", "confidence", "reasons" },
  "quality":  { "questionCount", "answerCount", "warnings", "missingImages" }
}
```

**取图工具函数**：

```js
function imgSrc(entry) {
  if (entry.url) return entry.url;
  if (entry.dataUriLines) return entry.dataUriLines.join('');
  if (entry.dataUri) return entry.dataUri;  // v1 兼容
  return null;
}
```

---

## 3. fallback：原始 PDF/DOCX/PPTX

```text
1. convert_to_text 拿 OCR 文本
2. 三类分流：
   a. 纯文字（讲义无图 / 默写纸 / 答案订正）→ Phase 2 走 text_only_degraded
   b. 图形依赖型（数学/物理/化学/生物/地理或含「如图/示意图/统计图/电路图」）
      → 阻塞，请用户先用 mineru 跑 source-package
   c. 含图非图形依赖（语文/英语阅读、知识清单）→ ask_user 是否接受文字版
```

---

## 4. 模板族建议（仅供 routing 参考，可自由覆盖）

`source-package.routing.recommendedSubtype` 给出建议；用户显式说"做成 X"时覆盖。

| 用户场景词 | subtype | 推荐配色思路（可自由调整） |
|---|---|---|
| 试卷 / 期末 / 考试 | `exam_paper` | 经典黑白 / 学术蓝 |
| 练习单 / 巩固训练 | `practice_sheet` | 同上 |
| 题单 / 专题 | `question_set` | 学术蓝 / 学术绿 |
| 默写纸 / 听写 | `dictation_sheet` | 经典黑白 + 大行距 |
| 教案 / 教师备课 | `teacher_lesson_plan` | 学术蓝 / 学术绿 + 卡片化 |
| 讲义 / 学习材料 | `student_handout` | 暖琥珀 / 学术蓝 |
| 知识清单 / 公式表 | `knowledge_sheet` | 学术绿 / 学术蓝 + 紧凑双栏 |
| 杂志风 / 主题阅读 | `magazine_article` | 杂志暖光 / 自由风 |

**风格自由**：上面是建议非强制。可根据学科特点（语文古诗 → 偏文雅米色；数学 → 偏学术蓝；英语阅读 → 偏暖橘）自行选色，可换字体、可加装饰边框、可单/双栏自由切换。

---

## 5. 工作流

```text
Phase 0 · 加载 skill
  必读：SKILL.md（本文件）、pagedjs-template.md、quality-gate.md
  可选：template-families.md / visual-design-guide.md / examples.md

Phase 1 · 读取输入
  优先：read_url / read_file 拿 source-package → JSON.parse
  降级：convert_to_text + §3 分流

Phase 2 · 路由 + 视觉决策（高自由度）
  采用 routing.recommendedSubtype 或用户显式覆盖
  自由选择：style_preset / 字体 / 单/双栏 / 卡片配色 / 装饰
  禁止：违反 7 条铁律

Phase 3 · 生成 HTML
  按 pagedjs-template.md 的最小骨架填充内容
  必须：.no-print 打印按钮 / 铁律 1-7 全过

Phase 4 · 14 项硬自检 + 交付
  逐条对照、列实际计数、贴在响应里
  通过后 create_html_deliverable
  最后告诉用户「点右下角打印按钮 或 Ctrl+P」
```

**Phase 0 重读触发点**：用户回复 `ask_user` 后、补传新文件后、距上次 `skills` 调用 ≥3 个工具调用且即将 `create_html_deliverable` 时，必须重新调 `skills(name="magazine-layout")`。

---

## 6. 14 项硬自检（v63 防撒谎模式）

`create_html_deliverable` 之前必须**逐条对照、列实际计数、在响应里完整贴出**。任一未过 → 停止交付、重写 HTML。

| # | 检查项 | 通过条件（必须列实际计数/字符串） | 撒谎红线 |
|---|---|---|---|
| 1 | **MathJax 标准 CDN** | 写出 grep 结果："`cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js` 命中 1 次"；不含 metis | 不能只写 ✅ 必须列字符串 |
| 2 | **Paged.js 标准 CDN** | "`unpkg.com/pagedjs@0.4.3` 命中 1 次"；MathJax `<script src>` 行号 < Paged.js `<script src>` 行号 | 同上 |
| 3 | **PagedConfig.before + typesetPromise** | "`window.PagedConfig = { before:` + `typesetPromise()` 都命中 1 次" | 同上 |
| 4 | **无 Tailwind / 飞象代理** | "grep `tailwind \| metis-online \| metis-misc` 命中 0 次" | 同上 |
| 5 | **不手动切页** | "grep `<section class=\"page\">` 命中 0 次；grep `height:\s*297mm` 命中 0 次" | 同上 |
| 6 | **顶层容器无 max-width / width**（v63 新） | "grep `body \| main \| container.*max-width` 命中 0 次（除 100% / none）" | 同上 |
| 7 | **普通题块无 break-inside: avoid** | "grep `.question.*break-inside: avoid` / `.section.*break-inside` / `.card.*break-inside` 命中 0 次" | 同上 |
| 8 | **print-color-adjust: exact** | "grep `-webkit-print-color-adjust: exact` 命中 ≥ 1；`@media print` 内有 `*` 兜底" | 同上 |
| 9 | **@page margin ≤ 12mm** | 列 `@page` 内 `margin` 实际值，如「margin: 10mm 12mm」 | 同上 |
| 10 | **题量保真**（必须实际计数对照） | "**HTML 实际**：grep 题号 `<div class*\"question\\|q-item\"` 实数 = N1；**源**：quality.questionCount = N2；N1 ≥ N2" | 不能只写"完整保留"或"全部内容"等含糊词；**必须列两个具体数字** |
| 11 | **图片保真**（必须实际计数对照） | "**HTML 实际**：grep `<img` 实数 = M1；**源**：imageLedger 中 role!=unknown 的总数 = M2；M1 ≥ M2" | 同上 |
| 12 | **答案保真**（必须实际计数对照） | "**HTML 实际**：grep 答案块（`.answer-tag\|.answer\|参考答案\|答案`）实数 = K1；**源**：quality.answerCount = K2；K1 ≥ K2 或 K2=0" | 同上 |
| 13 | **分数选项 ≤ 2 列** | "grep `.options.*repeat\\(4` 命中 0 次（除全短文/纯数字 ≤ 3 位选项）" | 同上 |
| 14 | **打印按钮 + 一致性**（v63 新） | "HTML 含 `.no-print` + `onclick=\"window.print()\"`；grep `box-shadow \| linear-gradient \| filter` 命中只在 `.no-print` 内或 0 次" | 同上 |

**自检写入响应模板**（v63 强制格式）：

```plain
[Agent v63 硬自检 14 项]
1. MathJax 标准 CDN ✅ 命中 cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js
2. Paged.js 标准 CDN ✅ 命中 unpkg.com/pagedjs@0.4.3；顺序：MathJax(L20) < Paged.js(L32)
3. PagedConfig.before + typesetPromise ✅
4. 无 Tailwind / 飞象代理 ✅ grep 0 命中
5. 不手动切页 ✅ grep `<section class="page">` 0 命中
6. 顶层容器无固定宽度 ✅ body/main/.container 均用 width:100%
7. 普通题块无 break-inside avoid ✅ 仅 table/figure/img/.kcard 防拆
8. print-color-adjust exact ✅ 元素级 + @media print { * } 兜底
9. @page margin ≤ 12mm ✅ 10mm 12mm
10. 题量保真 ✅ HTML 实数 30 ≥ quality.questionCount 30  ←【必须列两个数字】
11. 图片保真 ✅ HTML 实数 33 ≥ imageLedger.role!=unknown 33  ←【必须列两个数字】
12. 答案保真 ✅ HTML 答案块 16 ≥ quality.answerCount 16  ←【必须列两个数字】
13. 分数选项 ≤ 2 列 ✅ 含 \dfrac 选项均用 repeat(2,1fr)
14. 打印按钮 + 一致性 ✅ 含 .no-print + window.print()；无 box-shadow/linear-gradient/filter（除 .no-print）
```

---

## 7. 可调用工具

| 工具 | 用途 |
|---|---|
| `skills` | Phase 0 加载 |
| `read_url` | 读 OSS URL（首选） |
| `read_file` | 读上传 .txt/.html |
| `convert_to_text` | 降级 OCR |
| `ask_user` | 缺信息时询问 |
| `think` | 内部规划 |
| `search_html_component` / `get_html_component_detail` | 复用 HTML 组件（可选） |
| `generate_image` | 仅杂志/语文/英语装饰图，**禁** STEM 学科原卷 |
| `create_html_deliverable` | 最终 HTML 交付（必须先贴 14 项自检） |

**严禁**：`mathdesign-1-html` / `html-authoring` / `page-optimize` / `parse_pptx` / 学科原卷的 `picture_gen` / `image_create` / `picture_edit` / `edit_image`。

---

## 8. 文件说明

| 文件 | 用途 |
|---|---|
| `SKILL.md` | 本文件：7 铁律 + 14 项硬自检 + 工作流 |
| [`pagedjs-template.md`](pagedjs-template.md) | A4 + Paged.js 0.4.3 + 打印一致性的最小骨架 |
| [`quality-gate.md`](quality-gate.md) | 14 项硬自检 + 4 项 subtype 专项 + 反撒谎计数命令 |
| [`mineru-input-contract.md`](mineru-input-contract.md) | source-package@v2 字段合同与读取流程 |
| [`template-families.md`](template-families.md) | 4 模板族 × 8 subtype 建议（**非强制**） |
| [`visual-design-guide.md`](visual-design-guide.md) | 设计 token、信息层级、配色建议 |
| [`math-image-fidelity.md`](math-image-fidelity.md) | 公式/原图保真规则 |
| [`examples.md`](examples.md) | 8 类场景示例（**仅供风格参考，不是死模板**） |

---

## 9. v62 → v63 失败案例（警惕，5 个真实测试用例）

| 用例 | v62 实测违规 | v63 修复点 |
|---|---|---|
| 1 数学试卷 | HTML 14 题 / 30 题 → 自检撒谎"27 题 vs 27" | 自检 10 必须列 grep 实际数 vs questionCount，禁含糊词 |
| 1 数学试卷 | 题 2 用 `repeat(4, 1fr)` 装 4 张图 → 自检撒谎"≤ 2 列" | 自检 13 grep `repeat(4` 必须 0 命中（图选项例外） |
| 1 / 4 | `max-width: 800px` 容器 → A4 内容裁切 | 铁律 3 + 自检 6 禁固定容器宽 |
| 4 杂志 | `linear-gradient` + `box-shadow` 装饰 → 打印态丢失 → 屏幕/打印不一致 | 铁律 6 禁 web 装饰 |
| 4 杂志 | 38 blocks 渲染 ~5 段 → 自检撒谎"全文完整保留" | 自检 10 必须 grep 实际数 |
| 全部 | 缺 `.no-print` 打印按钮 | 铁律 7 强制要求 + 自检 14 必查 |
| 全部 | 自检全 ✅ 但实际有违规 | 14 项自检从"模型自报"→"模型 grep 实际计数"，反撒谎 |
