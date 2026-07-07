# Paged.js A4 HTML 模板（v63 标准）

> 单文件 HTML 必须遵守的技术铁律。本文件给出 v63 的最小可用骨架。
>
> v63 升级原因：v62 修复了脚本/MathJax/打印色，但实测仍有问题：
> 1. **`max-width: 800px / 700px`** 等固定容器与 A4 内容区冲突 → 屏幕居中正常但打印被裁切
> 2. **`box-shadow / linear-gradient / filter`** 等 web 装饰在打印时丢失 → 屏幕/打印预览/打印纸面**不一致**
> 3. **5/5 用例缺打印按钮** → 用户找不到打印入口
>
> 本文件给出**最小骨架**，**不锁死风格** —— class 命名、配色、装饰边框、单/双栏由 AI 自由发挥。

---

## 1. 脚本白名单（铁律 1）

只允许：

```html
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
<script src="https://unpkg.com/pagedjs@0.4.3/dist/paged.polyfill.js"></script>
```

**禁止**：

- `metis-online.fbcontent.cn` / `metis-misc/...js`（飞象代理脚本，会破坏分页 / 打印）
- 任何 Tailwind CDN（preflight 与 Paged.js 0.4.3 严重冲突，导致打印元素丢失）
- 飞象 data-collect / data-track / 业务追踪脚本
- MathJax 其他 entry：`tex-mml-chtml.js / tex-chtml.js`（CHTML 在打印 PDF 中字体不稳）

---

## 2. 脚本顺序（铁律 2，一字不差）

```html
<head>
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
```

---

## 3. 顶层布局：让 Paged.js 完全负责（v63 关键）

**v62 失败模式**：

```css
/* ❌ v62 实测产物，屏幕居中正常但打印被裁切 */
main { max-width: 800px; margin: 0 auto; padding: 20px; }
.paper-container { max-width: 800px; margin: 0 auto; }
```

**为什么错**：A4 portrait 的内容区 = 210mm − margin(12mm × 2) ≈ 186mm ≈ 703px @96dpi。固定 `max-width: 800px` > 703px，Paged.js 渲染时把整段当一个流，宽度被强行限制到 800px → 但 A4 页面内容区只有 703px → 内容溢出右侧或被压缩。

**v63 必须**：

```css
/* ✅ 顶层容器全幅，依赖 @page 处理外边距 */
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; width: 100%; }
main { width: 100%; max-width: 100%; }
@page { size: A4 portrait; margin: 10mm 12mm; }
```

**禁止**给 `body / main / .container / .paper-container / article` 设固定 `max-width / width` 数值（除 `100%` / `none` / `auto`）。

---

## 4. 普通题块禁批量防拆（铁律 3）

```css
/* ❌ 禁止 */
.question, .question-group, .question-item, .answer-area,
.point-card, .section, .card, .page, .main { break-inside: avoid }
```

**仅以下选择器允许防拆**：

```css
table, figure, img, .keep-together, .kcard {
  break-inside: avoid;
  page-break-inside: avoid;
}
```

---

## 5. 打印颜色保留（铁律 4）

```css
/* 元素级（覆盖所有有色块） */
[class*="card"], [class*="banner"], [class*="badge"], [class*="header"],
[class*="title"], [class*="tag"], .kcard {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}

/* @media print 全局兜底 */
@media print {
  html, body, *, *::before, *::after {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .no-print { display: none !important; }
}
```

---

## 6. 打印一致性（铁律 6，v63 关键）

**目标**：屏幕预览看到什么 = 打印预览看到什么 = 打印纸面看到什么。

### 6.1 禁止的 web 装饰

```css
/* ❌ box-shadow（打印时丢失，屏幕有立体感、打印没立体感 → 不一致） */
.card { box-shadow: 0 2px 8px rgba(0,0,0,.1); }

/* ❌ filter（同上，drop-shadow / blur / brightness 都不可靠） */
.card { filter: drop-shadow(0 1px 2px #000); }

/* ❌ linear-gradient / radial-gradient（打印时常被替换为单色） */
.header { background: linear-gradient(135deg, #f5f7fa, #c3cfe2); }

/* ❌ background-image: url(...)（打印不可靠，部分浏览器丢失） */
.banner { background-image: url(...); }

/* ❌ 除 .no-print 外的 position: fixed（打印时位置漂移或裁切） */
.sidebar { position: fixed; }
```

### 6.2 推荐的打印安全装饰（替代方案）

| 想要的效果 | ❌ web 写法 | ✅ 打印安全替代 |
|---|---|---|
| 立体卡片感 | `box-shadow: 0 2px 8px rgba(0,0,0,.1)` | `border: 1px solid #d0d0d0;` |
| 渐变 banner | `background: linear-gradient(...)` | 单色 `background-color: #f0f4f8;` |
| 突出标题 | `filter: drop-shadow(...)` | `border-left: 4px solid #2c5282;` 或 `border-bottom: 2px solid #...;` |
| 圆角 | `border-radius: 8px` | ✅ 允许（打印支持） |
| 强调色 | 任何颜色 | ✅ 允许（已在铁律 4 强制保留） |

### 6.3 禁止 `@media print` 改变布局

**屏幕看到 4 列 → 打印 1 列** 是用户最讨厌的"不一致"。

```css
/* ❌ 禁止改 grid / flex / display 布局 */
@media print {
  .options-grid { grid-template-columns: 1fr; }    /* 屏幕 4 列、打印 1 列 → 不一致 */
  .container { display: block; }                    /* 屏幕 flex、打印 block → 不一致 */
  .sidebar { display: none; }                       /* 屏幕显示、打印隐藏 → 不一致 */
}
```

**唯一允许 `@media print` 做的事**：

1. 隐藏 `.no-print` 按钮（`display: none !important`）
2. 重申 `print-color-adjust: exact`
3. 调整 `body { background: #fff }`（去除屏幕态背景色）

### 6.4 单位规则

- ✅ 推荐：`mm / pt / em / rem`（物理单位，跨设备稳定）
- ⚠️ 谨慎：`px`（不同 DPI 下打印漂移；可用但建议小尺寸如 border-width: 1px / margin: 4px）
- ❌ 避免：`vw / vh / vmin`（与 @page 物理尺寸概念冲突）

---

## 7. 必须打印按钮（铁律 7，v63 强制）

```html
<button class="no-print" onclick="window.print()"
        style="position:fixed; right:8mm; bottom:8mm; z-index:1000;
               padding:8px 16px; border:1px solid #333; border-radius:4px;
               background:#fff; color:#333; cursor:pointer;
               font-size:13px; font-family:inherit;
               box-shadow:0 2px 6px rgba(0,0,0,.15);">
  🖨 打印
</button>
```

> 注：`.no-print` 按钮内部允许 `box-shadow`（屏幕装饰），打印时按钮被隐藏，不破坏一致性。

```css
@media print {
  .no-print { display: none !important; }
}
```

---

## 8. 选项排版规则

```css
/* ✅ 默认 2 列（含分数/公式/图） */
.options[data-cols="2"], .work-options[data-cols="2"] {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4mm 8mm;
  align-items: start;
}

/* ✅ 复杂选项单列 */
.options[data-cols="1"], .work-options[data-cols="1"] {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3mm 0;
}

/* ✅ option-box 与文字同节点 */
.option-item { display: flex; align-items: flex-start; gap: 4mm; }
.option-box {
  flex: 0 0 auto;
  width: 14px; height: 14px;
  border: 1px solid #333;
  margin-top: 0.6em;
}

/* ❌ 仅以下情况允许 4 列 */
/* - 全部为 1-2 字短文本（如「一/二/三/四」） */
/* - 全部为纯数字 ≤ 3 位（如「4/6/8/12」） */
/* 含 \frac、<img>、长百分式必须 ≤ 2 列 */
```

**判定表**：

| 选项内容 | 默认列数 |
|---|---:|
| A. 一 / B. 二 / C. 三 / D. 四（1-2 字短文本） | 4 |
| A. 4 / B. 6 / C. 8 / D. 12（纯数字 ≤ 3 位） | 4 |
| A. \(\dfrac{2}{9}\) / B. \(\dfrac{7}{9}\) | **2 强制** |
| 4 个长百分式 | **2 或 1 强制** |
| 含 `<img>` 选项（图形对称轴） | **2 或 1 强制**，每个选项必须 `.keep-together` |

---

## 9. 图片渲染（按 imageLedger.role）

```css
figure[data-role="page_full"] img { width: 100%; break-inside: avoid; }
figure[data-role="figure_diagram"] img { max-width: 140mm; max-height: 90mm; }
figure[data-role="figure_inline"] img { max-width: 60mm; }

figure[data-role="formula_block"] {
  display: block;
  text-align: center;
  margin: 1.5mm 0;
}
figure[data-role="formula_block"] img { max-width: 80mm; max-height: 24mm; }

figure[data-role="formula_inline"] {
  display: inline-block;
  margin: 0 1mm;
  vertical-align: middle;
}
figure[data-role="formula_inline"] img { max-width: 60mm; max-height: 8mm; vertical-align: middle; }
```

`<img src>` 必须用 `imageLedger[i].url`；如该 entry 是 `dataUriLines`，skill 端 `entry.dataUriLines.join('')` 拼回完整 dataUri 后再放进 `src`。

**禁止**：

- `<img onerror="this.style.display='none'">`
- 编造工具未返回的 URL
- 同一 `<img src>` 被 ≥ 3 个 `<figure>` 引用
- 把 A4 比例（短/长 ≈ 0.62-0.78）的图作为 figure_diagram

---

## 10. 完整最小骨架（v63，**仅供起手参考，不要照抄**）

> 这只是最小骨架，AI 应根据学科/场景自由扩展配色、卡片样式、字体选型、栏数等。

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
  <style>
    /* === 铁律 3：A4 + 顶层全幅 === */
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; width: 100%; }
    main { width: 100%; max-width: 100%; }
    @page { size: A4 portrait; margin: 10mm 12mm; }

    /* === 基础字体（学科可改） === */
    body {
      font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
      font-size: 10.5pt;
      line-height: 1.5;
      color: #222;
    }

    /* === 铁律 3：仅这些选择器允许防拆 === */
    table, figure, img, .keep-together, .kcard {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    /* === 铁律 4：打印颜色保留 === */
    [class*="card"], [class*="banner"], [class*="badge"],
    [class*="header"], [class*="title"], [class*="tag"], .kcard {
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

    /* === 铁律 7：打印按钮（仅 .no-print 允许 box-shadow / position:fixed） === */
    .no-print {
      position: fixed;
      right: 8mm;
      bottom: 8mm;
      z-index: 1000;
      padding: 8px 16px;
      border: 1px solid #333;
      border-radius: 4px;
      background: #fff;
      color: #333;
      cursor: pointer;
      font-size: 13px;
      box-shadow: 0 2px 6px rgba(0,0,0,.15);
    }

    /* === 选项（公式/图选项 ≤ 2 列） === */
    .options, .work-options { display: grid; gap: 4mm 8mm; align-items: start; }
    .options[data-cols="1"], .work-options[data-cols="1"] { grid-template-columns: 1fr; }
    .options[data-cols="2"], .work-options[data-cols="2"] { grid-template-columns: repeat(2, 1fr); }
    .options[data-cols="4"], .work-options[data-cols="4"] { grid-template-columns: repeat(4, 1fr); }
    .option-item { display: flex; align-items: flex-start; gap: 4mm; }
    .option-box { flex: 0 0 auto; width: 14px; height: 14px; border: 1px solid #333; margin-top: 0.6em; }

    /* === 图片 by role === */
    figure[data-role="figure_diagram"] img { max-width: 140mm; max-height: 90mm; }
    figure[data-role="figure_inline"] img  { max-width: 60mm; }
    figure[data-role="formula_block"] { display: block; text-align: center; margin: 1.5mm 0; }
    figure[data-role="formula_block"] img { max-width: 80mm; max-height: 24mm; }
    figure[data-role="formula_inline"] { display: inline-block; vertical-align: middle; margin: 0 1mm; }
    figure[data-role="formula_inline"] img { max-width: 60mm; max-height: 8mm; }

    /* === ↓↓↓ 以下属于「自由发挥区」：AI 按学科/场景自定义 ↓↓↓ === */
    /*  ✅ 允许：border / border-radius / padding / margin / 颜色 / 字体 / single/double column / 卡片样式
         ❌ 禁止（铁律 6）：box-shadow（除 .no-print）/ filter / linear-gradient / background-image: url()
                            / position: fixed（除 .no-print） / @media print 改 grid/flex/display
    */

    /* 示例：学术蓝风格（仅供参考） */
    body[data-style="academic_blue"] {
      --accent: #1976d2;
      --accent-bg: #e3f2fd;
      --accent-border: #90caf9;
    }
    body[data-style="academic_blue"] .kcard {
      background: var(--accent-bg);
      border-left: 4px solid var(--accent);
      border-radius: 0 4mm 4mm 0;
      padding: 4mm 5mm;
      margin: 4mm 0;
    }

    /* 示例：经典黑白（试卷常用） */
    body[data-style="classic_black_white"] .question { margin-bottom: 4mm; }
    body[data-style="classic_black_white"] h2 {
      font-size: 14pt;
      border-bottom: 2px solid #000;
      padding-bottom: 2mm;
    }
  </style>

  <!-- 铁律 1+2：脚本白名单 + 顺序 -->
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
<body data-style="{{style_preset}}" data-density="{{density}}">
  <!-- 铁律 7：打印按钮 -->
  <button class="no-print" onclick="window.print()">🖨 打印</button>

  <main>
    <!-- 内容由 AI 按 source-package.blocks 自由排版（顺序流，由 Paged.js 自动分页） -->
    <header><h1>{{title}}</h1></header>
    <article>
      <!-- ...由 AI 填充... -->
    </article>
  </main>
</body>
</html>
```

---

## 11. 不允许的 HTML/CSS 模式

```html
<!-- ❌ 空白 PDF 框 -->
<object data="..." type="application/pdf"></object>
<embed src="..." type="application/pdf">
<iframe src="..."></iframe>

<!-- ❌ onerror 隐藏失败 -->
<img src="..." onerror="this.style.display='none'">

<!-- ❌ 占位话术 -->
<p>[此处保留原卷图形]</p>
<p>图略</p>
<p>请参考原卷</p>

<!-- ❌ 编造 URL -->
<img src="https://resource.feixiang.cn/{resourceId}/page_1.png">

<!-- ❌ 固定页高 -->
<body style="height:100vh;overflow:hidden;">
<div style="height:297mm;page-break-after:always">

<!-- ❌ 手动切页 -->
<section class="page">...</section>

<!-- ❌ 顶层固定宽度 -->
<main style="max-width:800px;margin:0 auto;">
<div class="paper-container" style="max-width:780px;">
```

---

## 12. v63 自检最低线（写代码后逐条核对）

```plain
1. <script src> 含 cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js
2. <script src> 含 unpkg.com/pagedjs@0.4.3/dist/paged.polyfill.js
3. window.PagedConfig.before 调用 await window.MathJax.typesetPromise()
4. MathJax 在 Paged.js 之前加载
5. 全文不含 metis-online / metis-misc / tailwind 字样
6. 没有 <section class="page"> 手动切页
7. 顶层容器（body/main/.container）不含 max-width/width 固定数值（除 100% / none / auto）
8. 普通题块（.question/.section/.card/.page）不含 break-inside: avoid
9. 仅 table/figure/img/.keep-together/.kcard 防拆
10. 所有有 background-color 的元素都有 -webkit-print-color-adjust: exact !important
11. @media print 内全局 *, html, body 都设了 print-color-adjust: exact !important
12. @page margin ≤ 12mm
13. 含 \frac/<img> 的选项不用 4 列 grid
14. <img src> 全部来自 imageLedger[i].url 或 dataUriLines.join('')
15. 没有 <object>/<embed>/<iframe>、onerror、占位话术
16. 没有 box-shadow / filter / linear-gradient / background-image:url / position:fixed（除 .no-print）
17. @media print 内不改 grid-template-columns / display / flex-direction
18. 含 .no-print 打印按钮（onclick="window.print()"）
```
