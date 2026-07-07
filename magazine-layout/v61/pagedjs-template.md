# Paged.js A4 HTML 模板（v60 标准）

> 单文件 HTML 必须遵守的技术铁律。本文件给出可直接复用的最小骨架。

---

## 1. 必须的脚本顺序

**唯一允许的加载顺序**（v60 强制）：

```html
<script>
  window.MathJax = {
    tex: {
      inlineMath: [['\\(', '\\)'], ['$', '$']],
      displayMath: [['\\[', '\\]']]
    },
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
```

**禁止**：

- 替换 MathJax CDN 为 `metis-online.fbcontent.cn/...` 等未公开验证脚本
- 使用 `tex-mml-chtml.js / tex-chtml.js`（CHTML 在打印 PDF 中字体不稳）
- LaTeX 写进 `<code> / <pre> / <textarea>`（MathJax 不会处理）
- MathJax 在 Paged.js 之后加载

---

## 2. 必须的 CSS 铁律

```css
/* 1. A4 页面 */
@page {
  size: A4 portrait;
  margin: 10mm 12mm;       /* ≤ 12mm，禁止超过 */
}

/* 2. 仅以下选择器允许防拆 */
table, figure, img, .keep-together, .kcard {
  break-inside: avoid;
  page-break-inside: avoid;
}

/* 3. 普通题块绝不允许批量防拆（v50 红线）*/
/* 禁止：
   .question, .question-group, .question-item, .answer-area,
   .point-card, .section, .card, .page, .main { break-inside: avoid }  ❌ */

/* 4. 打印按钮（屏幕显示，打印隐藏）*/
.no-print { /* 屏幕显示样式 */ }
@media print {
  .no-print { display: none; }
}

/* 5. 内容密集型 A4 默认正文字号 */
body {
  font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
  font-size: 10.5pt;
  line-height: 1.4;
  color: #222;
}

body[data-density="compact"] { font-size: 10.5pt; line-height: 1.32; }
body[data-density="standard"] { font-size: 11pt;   line-height: 1.5; }
body[data-density="spacious"] { font-size: 11.5pt; line-height: 1.6; }
```

---

## 3. 选项排版规则（v50 强化）

```css
/* ✅ 默认：2 列布局（推荐用于含分数/公式/图）*/
.work-options[data-cols="2"], .options[data-cols="2"] {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4mm 8mm;
  align-items: start;
}

/* ✅ 复杂选项（含分数 + 长表达式 + 图）：单列 */
.work-options[data-cols="1"], .options[data-cols="1"] {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3mm 0;
}

/* ✅ option-box 与选项文字 必须同 DOM 父节点 */
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
  margin-top: 0.6em;        /* 与文字基线对齐 */
}

/* ❌ 禁止：4 列 grid 装分数选项 → 行高乱、孤立方框 */
/* .work-options { grid-template-columns: repeat(4, 1fr) }   仅当所有选项都是 1 字符短文本时允许 */
```

**判定表**：

| 选项内容 | 默认列数 |
|---|---:|
| A. 一 / B. 二 / C. 三 / D. 四（1-2 字短文本） | 4（唯一允许） |
| A. 4 / B. 6 / C. 8 / D. 12（纯数字 ≤ 3 位） | 4 |
| A. \(\dfrac{2}{9}\) / B. \(\dfrac{7}{9}\) / C. 1 / D. \(\dfrac{9}{7}\)（含分数） | **2 强制** |
| A. \(\dfrac{198}{102}\times 100\%\) ... 4 个长百分式 | **2 或 1 强制** |
| 含 `<img>` 选项（如对称轴图选择） | **2 或 1 强制**，每个选项必须 `.keep-together` |
| "无解 / 一个解 / 两个解 / 无穷解" | 2 或 4（单选项 ≤ 6 字符可 4 列） |

---

## 4. 图片渲染规则（按 imageLedger.role）

```css
/* page_full（A4 整页扫描）—— 仅在 fidelity_mode = source_page_print 才用 */
figure[data-role="page_full"] img {
  width: 100%;
  break-inside: avoid;
}

/* figure_diagram（题内题图、几何图、思维导图）*/
figure[data-role="figure_diagram"] img {
  max-width: 140mm;
  max-height: 90mm;
}

/* figure_inline（小型示意图）*/
figure[data-role="figure_inline"] img {
  max-width: 60mm;
}

/* formula_block（独占段公式块）*/
figure[data-role="formula_block"] {
  display: block;
  text-align: center;
  margin: 1.5mm 0;
}
figure[data-role="formula_block"] img {
  max-width: 80mm;
  max-height: 24mm;
}

/* formula_inline（行内公式片段）*/
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

**禁止**：

- 把 A4 比例（短/长 ≈ 0.62-0.78）的图作为 figure_diagram 显示，且 max-height < 250px（≈ 56mm 打印）
- 同一 `<img src>` 被 ≥ 3 个 `<figure>` 引用
- `<img>` 用 `onerror` 隐藏失败

---

## 5. 完整最小可用骨架

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8"/>
  <title>{{title}}</title>
  <style>
    @page { size: A4 portrait; margin: 10mm 12mm; }
    table, figure, img, .keep-together, .kcard {
      break-inside: avoid; page-break-inside: avoid;
    }
    body {
      font-family: -apple-system, "PingFang SC", sans-serif;
      font-size: 10.5pt; line-height: 1.4; color: #222;
      margin: 0; padding: 0;
    }
    .no-print { /* 打印按钮等屏幕装饰 */ }
    @media print { .no-print { display: none; } }

    /* 风格预设变量（单例）*/
    body[data-style="academic_blue"]{
      --accent: #1976d2;
      --section-bg: #e3f2fd; --section-fg: #1976d2;
    }
    /* ... 见 template-families.md §6 */

    /* 选项 */
    .work-options{ display:grid; gap:3mm 6mm; align-items:start; }
    .work-options[data-cols="2"]{ grid-template-columns: repeat(2,1fr); }
    .work-options[data-cols="1"]{ grid-template-columns: 1fr; }
    .option-item{ display:flex; align-items:flex-start; gap:3mm; }
    .option-box{ flex:0 0 auto; width:14px; height:14px;
                  border:1px solid #333; margin-top:0.6em; }

    /* 图片（按 role）*/
    figure[data-role="figure_diagram"] img{ max-width:140mm; max-height:90mm; }
    figure[data-role="figure_inline"] img{ max-width:60mm; }
    figure[data-role="formula_block"]{ display:block; text-align:center; margin:1.5mm 0; }
    figure[data-role="formula_block"] img{ max-width:80mm; max-height:24mm; }
    figure[data-role="formula_inline"]{ display:inline-block; vertical-align:middle; margin:0 1mm; }
    figure[data-role="formula_inline"] img{ max-width:60mm; max-height:8mm; vertical-align:middle; }
  </style>
  <script>
    window.MathJax = {
      tex: { inlineMath: [['\\(','\\)'],['$','$']], displayMath: [['\\[','\\]']] },
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
  <button class="no-print" style="position:fixed;right:8mm;bottom:8mm;
            padding:2mm 4mm;border:1px solid #333;border-radius:1mm;
            background:#fff;cursor:pointer;"
          onclick="window.print()">打印</button>

  <main>
    <!-- 内容由 builder 按 template-families.md 的 8 类示例片段填充 -->
  </main>
</body>
</html>
```

---

## 6. 不允许的 HTML/CSS 模式

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
<p>更多题目请参考原卷保真层</p>

<!-- ❌ 编造 URL -->
<img src="https://resource.feixiang.cn/{resourceId}/page_1.png">

<!-- ❌ 固定页高 -->
<body style="height:100vh;overflow:hidden;">
```

---

## 7. 自检最低线（写代码前）

```plain
✓ <script src> 包含 cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js
✓ <script src> 包含 unpkg.com/pagedjs@0.4.3/dist/paged.polyfill.js
✓ window.PagedConfig.before 调用 await window.MathJax.typesetPromise()
✓ MathJax 加载在 Paged.js 之前
✓ @page margin ≤ 12mm
✓ 没有 .question / .section / .card 等普通块加 break-inside: avoid
✓ 仅 table / figure / img / .keep-together / .kcard 防拆
✓ 含 \frac/\dfrac/<img> 的选项不用 4 列 grid
✓ option-box 和文字在同一 .option-item 节点
✓ 没有空白 <object>/<embed>/<iframe>
✓ 没有 onerror 隐藏失败
✓ 没有 [此处保留原卷] 等占位话术
```
