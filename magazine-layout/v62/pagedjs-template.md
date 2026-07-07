# Paged.js A4 HTML 模板（v62 标准）

> 单文件 HTML 必须遵守的技术铁律。本文件给出 v62 可直接复用的最小骨架。
>
> v62 升级原因：v61 实测打印预览大量元素消失，根因有 5 个（Tailwind preflight、飞象代理 MathJax、缺 PagedConfig.before、手动切页 `<section class="page">`、卡片 background-color 没 print-color-adjust）。本文件全部修复。

---

## 1. 脚本白名单（v62 铁律 1）

HTML 的 `<script src>` **只允许** 出现这两个：

```html
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
<script src="https://unpkg.com/pagedjs@0.4.3/dist/paged.polyfill.js"></script>
```

**禁止** 出现的脚本（v61 实测违规）：

```html
<!-- ❌ 飞象代理 MathJax -->
<script src="https://metis-online.fbcontent.cn/metis-misc/blER0Bn7vsa2JER9IEssf8.js"></script>

<!-- ❌ 飞象代理 Tailwind -->
<script src="https://metis-online.fbcontent.cn/metis-misc/zgLDUdmazTYc0B4K6Cor.js"></script>

<!-- ❌ Tailwind 任何 CDN -->
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://cdn.jsdelivr.net/npm/tailwindcss/..." rel="stylesheet">

<!-- ❌ 飞象 data-collect / 任何业务追踪 -->
<script src=".../tracker.js"></script>

<!-- ❌ MathJax 其他 entry -->
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>
```

**为什么禁 Tailwind**：Tailwind preflight 的 `*, *::before, *::after { box-sizing: border-box; border-width: 0 }` 与 Paged.js 0.4.3 的元素分页计算严重冲突。v61 实测会导致打印预览中所有有 `background-color` 的卡片**只剩外框、内部文字消失**。

**为什么禁 metis-online**：飞象后台代理脚本未公开版本，可能注入 `data-collect` 或修改 DOM，破坏 Paged.js 分页计算与 MathJax 时序。

---

## 2. 脚本顺序（v62 铁律 2，一字不差）

```html
<head>
  <!-- step 1：MathJax 配置（先于 MathJax 脚本声明） -->
  <script>
    window.MathJax = {
      tex: {
        inlineMath: [['\\(', '\\)']],
        displayMath: [['\\[', '\\]']]
      },
      svg: { fontCache: 'global' },
      startup: { typeset: false }
    };
  </script>

  <!-- step 2：MathJax 脚本 -->
  <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>

  <!-- step 3：Paged.js 配置 - 必须 await typesetPromise -->
  <script>
    window.PagedConfig = {
      before: async () => {
        if (window.MathJax?.typesetPromise) {
          await window.MathJax.typesetPromise();
        }
      }
    };
  </script>

  <!-- step 4：Paged.js 脚本（必须最后加载） -->
  <script src="https://unpkg.com/pagedjs@0.4.3/dist/paged.polyfill.js"></script>
</head>
```

**违规模式**（v61 实测）：

```html
<!-- ❌ 顺序倒置：MathJax 后于 Paged.js -->
<script src="...mathjax/es5/tex-svg.js"></script>
<script src="...pagedjs@0.4.3/...js"></script>
```

```html
<!-- ❌ 缺 PagedConfig：MathJax 渲染时序与 Paged.js 分页不同步 -->
<script src="...mathjax/es5/tex-svg.js"></script>
<script src="...pagedjs@0.4.3/...js"></script>
<!-- 没有 window.PagedConfig = {...} -->
```

任何顺序倒置或缺 `PagedConfig.before` → 公式渲染时序错乱 → 打印产物丢公式或排版错乱。

---

## 3. 不准手动切页（v62 铁律 3）

**禁止 v61 实测违规模式**：

```html
<!-- ❌ 手动 section page 切页 -->
<body>
  <section class="page">
    <div class="content-grid"><!-- 第 1 页内容 --></div>
  </section>
  <section class="page">
    <div class="content-grid"><!-- 第 2 页内容 --></div>
  </section>
</body>

<!-- ❌ 固定 A4 高度容器 -->
<div style="width: 210mm; height: 297mm; page-break-after: always">...</div>

<!-- ❌ 给普通题块批量加 break-inside: avoid -->
<style>
  .question, .question-group, .section, .card, .point-card, .page {
    break-inside: avoid;  /* v50 红线，禁 */
  }
</style>
```

**唯一允许的防拆**：

```css
table, figure, img, .keep-together, .kcard {
  break-inside: avoid;
  page-break-inside: avoid;
}
```

**唯一允许的页面结构**：

```html
<body>
  <button class="no-print">打印</button>
  <header class="cover-header">
    <h1>...</h1>
    <div class="cover-meta">...</div>
  </header>
  <main>
    <!-- 顺序流：Paged.js 自动分页 -->
    <section class="kcard">...</section>
    <section class="kcard">...</section>
    <section class="kcard">...</section>
    <!-- ...更多内容... -->
  </main>
</body>
```

---

## 4. 打印颜色保留（v62 铁律 4，v61 漏写导致大量元素消失）

凡是设了 `background-color / background / color` 且不是 `#000` / `#222` 这类近黑文字的元素，**必须** 显式声明 print-color-adjust。两个层面同时声明：

```css
/* 4.1 元素级（针对所有有色块） */
.kcard,
.handout-objective,
.unit-title,
.cover-header,
.cover-eyebrow,
.option-box,
.work-options,
.section-title,
.poem-box,
.lesson-stage,
[class*="card"],
[class*="banner"],
[class*="badge"] {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}

/* 4.2 全局兜底（@media print 内对所有元素强制保留颜色） */
@media print {
  html, body, *, *::before, *::after {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .no-print { display: none !important; }
}
```

**v61 实测失败案例**：

```css
/* ❌ v61 错误写法（实测产物） */
.card {
  background-color: var(--primary-light);   /* #EBEDD4 浅绿 */
  color: var(--text-main);                   /* #021502 黑字 */
}
@media print {
  body { background: white; }
  /* 没有 print-color-adjust → 浏览器默认丢背景色 */
  /* + Tailwind preflight 干扰 → 黑字也消失 */
}
```

**实测后果**：屏幕预览正常，**打印预览卡片只剩外框、文字消失**（截图 4 实证）。

**v62 修复**：

```css
/* ✅ v62 正确写法 */
.card {
  background-color: var(--primary-light);
  color: var(--text-main);
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}
@media print {
  html, body, * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
```

---

## 5. 必须的 CSS 铁律

```css
/* 1. A4 页面（margin ≤ 12mm） */
@page {
  size: A4 portrait;
  margin: 10mm 12mm;
}

/* 2. 字体与字号（按 density 切换） */
body {
  font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
  font-size: 10.5pt;
  line-height: 1.4;
  color: #222;
  margin: 0;
  padding: 0;
  background: #fff;
}
body[data-density="compact"]  { font-size: 10.5pt; line-height: 1.32; }
body[data-density="standard"] { font-size: 11pt;   line-height: 1.5; }
body[data-density="spacious"] { font-size: 11.5pt; line-height: 1.6; }

/* 3. 仅以下选择器允许防拆 */
table, figure, img, .keep-together, .kcard {
  break-inside: avoid;
  page-break-inside: avoid;
}

/* 4. 禁止：普通题块批量防拆（v50/v62 红线）
   .question, .question-group, .question-item, .answer-area,
   .point-card, .section, .card, .page, .main { break-inside: avoid }   ❌ */

/* 5. 打印按钮（屏幕显示，打印隐藏） */
.no-print {
  position: fixed;
  right: 8mm;
  bottom: 8mm;
  padding: 2mm 4mm;
  border: 1px solid #333;
  border-radius: 1mm;
  background: #fff;
  cursor: pointer;
  z-index: 1000;
}
@media print {
  html, body, *, *::before, *::after {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .no-print { display: none !important; }
}
```

---

## 6. 选项排版规则（保留 v50 强化）

```css
/* ✅ 默认 2 列（含分数/公式/图） */
.work-options[data-cols="2"], .options[data-cols="2"] {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4mm 8mm;
  align-items: start;
}

/* ✅ 复杂选项单列 */
.work-options[data-cols="1"], .options[data-cols="1"] {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3mm 0;
}

/* ✅ option-box 与文字同节点 */
.option-item {
  display: flex;
  align-items: flex-start;
  gap: 4mm;
}
.option-box {
  flex: 0 0 auto;
  width: 14px;
  height: 14px;
  border: 1px solid #333;
  margin-top: 0.6em;
}

/* ❌ 禁止 4 列装分数选项 */
/* .work-options { grid-template-columns: repeat(4, 1fr) }
   仅当所有选项都是 1-2 字符短文本时允许 */
```

**判定表**：

| 选项内容 | 默认列数 |
|---|---:|
| A. 一 / B. 二 / C. 三 / D. 四（1-2 字短文本） | 4 |
| A. 4 / B. 6 / C. 8 / D. 12（纯数字 ≤ 3 位） | 4 |
| A. \(\dfrac{2}{9}\) / B. \(\dfrac{7}{9}\) / C. 1 / D. \(\dfrac{9}{7}\)（含分数） | **2 强制** |
| 4 个长百分式 | **2 或 1 强制** |
| 含 `<img>` 选项（对称轴图选择） | **2 或 1 强制**，每个选项必须 `.keep-together` |

---

## 7. 图片渲染规则（按 imageLedger.role）

```css
figure[data-role="page_full"] img {
  width: 100%;
  break-inside: avoid;
}
figure[data-role="figure_diagram"] img {
  max-width: 140mm;
  max-height: 90mm;
}
figure[data-role="figure_inline"] img {
  max-width: 60mm;
}
figure[data-role="formula_block"] {
  display: block;
  text-align: center;
  margin: 1.5mm 0;
}
figure[data-role="formula_block"] img {
  max-width: 80mm;
  max-height: 24mm;
}
figure[data-role="formula_inline"] {
  display: inline-block;
  margin: 0 1mm;
  vertical-align: middle;
}
figure[data-role="formula_inline"] img {
  max-width: 60mm;
  max-height: 8mm;
  vertical-align: middle;
}
```

`<img src>` 必须用 `imageLedger[i].url`（v2 首选）；如该 entry 是 `dataUriLines`，skill 端 `entry.dataUriLines.join('')` 拼回完整 dataUri 后再放进 `src`。

**禁止**：

- `<img onerror="this.style.display='none'">`
- 编造工具未返回的 URL
- 同一 `<img src>` 被 ≥ 3 个 `<figure>` 引用
- A4 比例（短/长 ≈ 0.62-0.78）的图作为 figure_diagram 显示

---

## 8. 完整最小可用骨架（v62）

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
  <style>
    /* === 1. A4 页面 === */
    @page { size: A4 portrait; margin: 10mm 12mm; }

    /* === 2. 基础重置 === */
    body {
      font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
      font-size: 10.5pt;
      line-height: 1.4;
      color: #222;
      margin: 0; padding: 0;
      background: #fff;
    }
    body[data-density="compact"]  { font-size: 10.5pt; line-height: 1.32; }
    body[data-density="standard"] { font-size: 11pt;   line-height: 1.5; }
    body[data-density="spacious"] { font-size: 11.5pt; line-height: 1.6; }

    /* === 3. 风格预设变量 === */
    body[data-style="academic_blue"] { --accent: #1976d2; --section-bg: #e3f2fd; --section-fg: #1976d2; --card-border: #90caf9; }
    body[data-style="academic_green"] { --accent: #2D593E; --section-bg: #EBEDD4; --section-fg: #2D593E; --card-border: #AE7645; }
    body[data-style="warm_amber"] { --accent: #f57c00; --section-bg: #fff8e1; --section-fg: #e65100; --card-border: #ffcc80; }
    body[data-style="classic_black_white"] { --accent: #222; --section-bg: #f5f5f5; --section-fg: #111; --card-border: #ccc; }
    body[data-style="magazine_light"] { --accent: #6d4c41; --section-bg: #f7f3ee; --section-fg: #4e342e; --card-border: #d7ccc8; }

    /* === 4. 防拆白名单（仅这些） === */
    table, figure, img, .keep-together, .kcard {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    /* === 5. 打印颜色保留（v62 关键） === */
    .kcard, .handout-objective, .unit-title, .cover-header, .cover-eyebrow,
    .option-box, .work-options, .section-title, .poem-box, .lesson-stage,
    [class*="card"], [class*="banner"], [class*="badge"] {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    @media print {
      html, body, *, *::before, *::after {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .no-print { display: none !important; }
    }

    /* === 6. 选项 === */
    .work-options, .options { display: grid; gap: 4mm 8mm; align-items: start; }
    .work-options[data-cols="2"], .options[data-cols="2"] { grid-template-columns: repeat(2, 1fr); }
    .work-options[data-cols="1"], .options[data-cols="1"] { grid-template-columns: 1fr; }
    .option-item { display: flex; align-items: flex-start; gap: 4mm; }
    .option-box { flex: 0 0 auto; width: 14px; height: 14px; border: 1px solid #333; margin-top: 0.6em; }

    /* === 7. 图片 by role === */
    figure[data-role="figure_diagram"] img { max-width: 140mm; max-height: 90mm; }
    figure[data-role="figure_inline"] img { max-width: 60mm; }
    figure[data-role="formula_block"] { display: block; text-align: center; margin: 1.5mm 0; }
    figure[data-role="formula_block"] img { max-width: 80mm; max-height: 24mm; }
    figure[data-role="formula_inline"] { display: inline-block; vertical-align: middle; margin: 0 1mm; }
    figure[data-role="formula_inline"] img { max-width: 60mm; max-height: 8mm; vertical-align: middle; }

    /* === 8. 打印按钮 === */
    .no-print {
      position: fixed; right: 8mm; bottom: 8mm;
      padding: 2mm 4mm; border: 1px solid #333;
      border-radius: 1mm; background: #fff;
      cursor: pointer; z-index: 1000;
    }
  </style>

  <!-- === MathJax & Paged.js 标准链路（v62 严禁修改） === -->
  <script>
    window.MathJax = {
      tex: { inlineMath: [['\\(','\\)']], displayMath: [['\\[','\\]']] },
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
</head>
<body data-family="{{family}}" data-subtype="{{subtype}}"
        data-style="{{style_preset}}" data-density="{{density}}">
  <button class="no-print" onclick="window.print()">打印</button>

  <header class="cover-header">
    <h1 class="cover-title">{{title}}</h1>
    <div class="cover-meta">{{meta}}</div>
  </header>

  <main>
    <!-- 内容由 builder 按 template-families.md 的 8 类示例片段填充
         直接顺序流，由 Paged.js 自动分页，禁止 <section class="page"> -->
  </main>
</body>
</html>
```

---

## 9. 不允许的 HTML/CSS 模式

```html
<!-- ❌ 空白 PDF 框 -->
<object data="..." type="application/pdf"></object>
<embed src="..." type="application/pdf">
<iframe src="..."></iframe>

<!-- ❌ onerror 隐藏失败 -->
<img src="..." onerror="this.style.display='none'">

<!-- ❌ 占位话术 -->
<p>[此处保留原卷图形]</p>
<p>[此处原卷为...]</p>
<p>图略</p>
<p>请参考原卷</p>

<!-- ❌ 编造 URL -->
<img src="https://resource.feixiang.cn/{resourceId}/page_1.png">

<!-- ❌ 固定页高 -->
<body style="height:100vh;overflow:hidden;">

<!-- ❌ 手动切页 -->
<section class="page">...</section>
```

---

## 10. v62 自检最低线（写代码后逐条核对）

```plain
1. <script src> 含 cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js
2. <script src> 含 unpkg.com/pagedjs@0.4.3/dist/paged.polyfill.js
3. window.PagedConfig.before 调用 await window.MathJax.typesetPromise()
4. MathJax 在 Paged.js 之前加载
5. 全文不含 metis-online / metis-misc / tailwind 字样
6. 没有 <section class="page"> 手动切页
7. 没有 .question / .section / .card / .page 等普通块加 break-inside: avoid
8. 仅 table / figure / img / .keep-together / .kcard 防拆
9. 所有有 background-color 的元素都有 -webkit-print-color-adjust: exact !important
10. @media print 内全局 *, html, body 都设了 print-color-adjust: exact !important
11. @page margin ≤ 12mm
12. 含 \frac/<img> 的选项不用 4 列 grid
13. <img src> 全部来自 imageLedger[i].url 或 dataUriLines.join('')
14. 没有 <object>/<embed>/<iframe>、onerror、占位话术
```

---

## 11. v61 → v62 失败案例对照

| v61 实测违规 | 实测后果 | v62 修复 |
|---|---|---|
| `<script src="metis-online...mathjax">` | MathJax 时序错乱、公式不渲染 | §1 脚本白名单只允许 jsdelivr |
| `<script src="metis-misc...tailwind">` | Tailwind preflight 与 Paged.js 冲突，**打印预览大量元素消失** | §1 禁 Tailwind |
| MathJax 后于 Paged.js | 公式截断 | §2 顺序固定 |
| 无 PagedConfig.before | 公式排版错乱 | §2 必须 await typesetPromise |
| `<section class="page">...` | 与 Paged.js 自动分页冲突 | §3 唯一允许顺序流 |
| `.card { background-color }` 无 print-color-adjust | 打印预览卡片只剩外框 | §4 强制声明 |
