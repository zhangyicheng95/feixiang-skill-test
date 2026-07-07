# Paged.js A4 HTML 模板（v64 标准）

> 单文件 HTML 必须遵守的技术铁律。本文件给出 v64 的最小可用骨架。
>
> **v64 关键升级原因（2026-05-13 重大发现）**：飞象老师在用户全屏浏览/下载 HTML 时，会用 `<iframe srcdoc="…">` 把模型 HTML 嵌入一个外层水印壳页面，并向 srcdoc 内**注入 1100+ 个反爬噪声元素**（`<script>var _bm_xxx=...</script>` / `<style>@media print { ._bm_xxx{color:transparent} }</style>` 等）。
>
> 后果：
> 1. 用户按 Ctrl+P 打印的是**外层壳页面**（带水印），不是 iframe 内的内容 → PDF 几乎全空（只有页眉 URL）
> 2. iframe 高度被锁定为 `100vh`，Paged.js 渲染的多页内容溢出被裁切
> 3. v63 把 `.no-print` 按钮放右下角 `right:8mm; bottom:8mm`，被外层壳 `.ai-badge`（`right:37px; bottom:37px`）位置遮挡
>
> v64 修复：
> - **顶部居中悬浮工具条**（脱离 ai-badge 遮挡区）
> - **多入口降级**：主按钮 iframe 内 print + 副按钮下载干净 HTML + 副按钮新标签打开
> - 响应里明确告知用户操作流程

---

## 1. 脚本白名单（铁律 1）

只允许：

```html
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
<script src="https://unpkg.com/pagedjs@0.4.3/dist/paged.polyfill.js"></script>
```

禁止：

- `metis-online.fbcontent.cn` / `metis-misc/...js`
- 任何 Tailwind CDN
- 飞象 data-collect / data-track / 业务追踪
- MathJax 其他 entry：`tex-mml-chtml.js / tex-chtml.js`

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

## 3. 顶层布局：让 Paged.js 完全负责（铁律 3）

```css
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; width: 100%; }
main { width: 100%; max-width: 100%; }
@page { size: A4 portrait; margin: 10mm 12mm; }
```

禁止顶层容器（`body / main / .container / .paper-container / article`）设固定 `max-width / width` 数值（除 `100%` / `none` / `auto`）。

普通题块禁批量防拆，仅允许：

```css
table, figure, img, .keep-together, .kcard {
  break-inside: avoid;
  page-break-inside: avoid;
}
```

---

## 4. 打印颜色保留（铁律 4）

```css
[class*="card"], [class*="banner"], [class*="badge"], [class*="header"],
[class*="title"], [class*="tag"], .kcard, .print-toolbar, .no-print {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}
@media print {
  html, body, *, *::before, *::after {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .no-print, .print-toolbar { display: none !important; }
}
```

---

## 5. 打印一致性（铁律 6）

屏幕预览 ≡ 打印预览 ≡ 打印纸面，三态结构一致。

```css
/* ❌ 全禁（仅 .print-toolbar / .no-print 例外） */
.card { box-shadow: 0 2px 8px rgba(0,0,0,.1); }
.card { filter: drop-shadow(...); }
.header { background: linear-gradient(135deg, #f5f7fa, #c3cfe2); }
.banner { background-image: url(...); }
.sidebar { position: fixed; }

/* ❌ 禁止 @media print 改布局 */
@media print {
  .options { grid-template-columns: 1fr; }
  .container { display: block; }
  .sidebar { display: none; }
}
```

替代方案：

| 想要的效果 | ❌ web 写法 | ✅ 打印安全替代 |
|---|---|---|
| 立体卡片感 | `box-shadow` | `border: 1pt solid #d0d0d0;` |
| 渐变 banner | `linear-gradient` | 单色 `background-color: #f0f4f8;` |
| 突出标题 | `filter: drop-shadow` | `border-left: 4pt solid #2c5282;` |
| 圆角 | `border-radius` | ✅ 允许 |
| 强调色 | 任何颜色 | ✅ 允许（铁律 4 强制保留） |

---

## 6. 顶部打印工具条（铁律 7，v64 关键）

### 6.1 必须的 HTML

```html
<div class="print-toolbar" id="printToolbar">
  <button class="print-btn-main" onclick="window.print()">🖨 打印 / 导出 PDF</button>
  <button class="print-btn-secondary" onclick="downloadCleanHtml()" title="下载干净版 HTML 到本地，避免飞象内嵌干扰">💾 下载到本地</button>
  <button class="print-btn-secondary" onclick="openInNewTab()" title="在新标签页打开本页面，脱离 iframe 后即可正常打印">🔗 新窗口打开</button>
  <span class="print-hint" id="printHint">↑ 打印请点这里，不要按 Ctrl+P</span>
</div>
```

### 6.2 必须的 CSS

```css
.print-toolbar {
  position: fixed;
  top: 8mm;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  padding: 6px 12px;
  background: #fff;
  border: 1.5px solid #2c5282;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,.15);
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: -apple-system, "PingFang SC", sans-serif;
  font-size: 13px;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}
.print-btn-main {
  padding: 6px 14px;
  background: #2c5282;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}
.print-btn-main:hover { background: #1f3a5f; }
.print-btn-secondary {
  padding: 5px 10px;
  background: #fff;
  color: #2c5282;
  border: 1px solid #2c5282;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}
.print-btn-secondary:hover { background: #f0f4f8; }
.print-hint {
  color: #d96030;
  font-size: 12px;
  margin-left: 6px;
}
@media print {
  .print-toolbar { display: none !important; }
}
```

### 6.3 必须的 JS（剥离飞象壳噪声 + 多入口）

```html
<script>
  // 检测当前 HTML 是否在飞象 iframe 内
  (function(){
    var hint = document.getElementById('printHint');
    if (window !== window.top && hint) {
      hint.innerHTML = '⚠️ 当前在飞象内嵌页面中，<b>必须</b> 点上方按钮才能正确打印';
    }
  })();

  // 下载干净 HTML 到本地，避免飞象壳页噪声
  function downloadCleanHtml() {
    try {
      var doctype = '<!DOCTYPE html>\n';
      var html = document.documentElement.outerHTML;
      var blob = new Blob([doctype + html], { type: 'text/html;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = (document.title || 'document') + '.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
    } catch (e) {
      alert('下载失败：' + e.message);
    }
  }

  // 在新标签打开本页面，脱离 iframe
  function openInNewTab() {
    try {
      var doctype = '<!DOCTYPE html>\n';
      var html = document.documentElement.outerHTML;
      var blob = new Blob([doctype + html], { type: 'text/html;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (e) {
      alert('新标签打开失败：' + e.message);
    }
  }
</script>
```

---

## 7. 选项排版规则

```css
.options[data-cols="2"], .work-options[data-cols="2"] {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4mm 8mm;
  align-items: start;
}
.options[data-cols="1"] { grid-template-columns: 1fr; gap: 3mm 0; }

/* 仅以下情况允许 4 列 */
/* - 1-2 字短文本（如「一/二/三/四」） */
/* - 纯数字 ≤ 3 位（如「4/6/8/12」） */
/* 含 \frac、<img>、长百分式必须 ≤ 2 列 */
```

判定表：

| 选项内容 | 默认列数 |
|---|---:|
| A. 一 / B. 二 / C. 三 / D. 四（1-2 字短文本） | 4 |
| A. 4 / B. 6 / C. 8 / D. 12（纯数字 ≤ 3 位） | 4 |
| A. \(\dfrac{2}{9}\) | **2 强制** |
| 4 个长百分式 | **2 或 1 强制** |
| 含 `<img>` 选项（图形对称轴） | **2 或 1 强制**，每个选项 `.keep-together` |

---

## 8. 图片渲染（按 imageLedger.role）

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

`<img src>` 必须用 `imageLedger[i].url`；如该 entry 是 `dataUriLines`，skill 端 `entry.dataUriLines.join('')` 拼回。

禁止：

- `<img onerror="this.style.display='none'">`
- 编造工具未返回的 URL
- 同一 `<img src>` 被 ≥ 3 个 `<figure>` 引用
- 把 A4 比例（短/长 ≈ 0.62-0.78）的图作为 figure_diagram

---

## 9. 完整最小骨架（v64，**起手参考，不要照抄**）

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
      padding-top: 14mm;  /* 给顶部工具条留出空间，仅屏幕态需要 */
    }
    @media print {
      body { padding-top: 0; }   /* 打印态去掉 padding */
    }

    /* === 铁律 3：仅这些选择器允许防拆 === */
    table, figure, img, .keep-together, .kcard {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    /* === 铁律 4：打印颜色保留 === */
    [class*="card"], [class*="banner"], [class*="badge"],
    [class*="header"], [class*="title"], [class*="tag"], .kcard,
    .print-toolbar {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    @media print {
      html, body, *, *::before, *::after {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .print-toolbar, .no-print { display: none !important; }
    }

    /* === 铁律 7：顶部打印工具条 === */
    .print-toolbar {
      position: fixed;
      top: 8mm;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      padding: 6px 12px;
      background: #fff;
      border: 1.5px solid #2c5282;
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0,0,0,.15);
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: -apple-system, "PingFang SC", sans-serif;
      font-size: 13px;
    }
    .print-btn-main {
      padding: 6px 14px;
      background: #2c5282;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
    }
    .print-btn-main:hover { background: #1f3a5f; }
    .print-btn-secondary {
      padding: 5px 10px;
      background: #fff;
      color: #2c5282;
      border: 1px solid #2c5282;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }
    .print-btn-secondary:hover { background: #f0f4f8; }
    .print-hint {
      color: #d96030;
      font-size: 12px;
      margin-left: 6px;
    }

    /* === 选项 === */
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

    /* === ↓↓↓ 自由发挥区（按学科/场景自定义） ↓↓↓ === */
    /*  ✅ 允许：border / border-radius / padding / margin / 颜色 / 字体 / 单/双栏 / 卡片样式
        ❌ 禁止（铁律 6）：box-shadow（除工具条/no-print）/ filter / linear-gradient
                          / background-image: url() / position: fixed（仅工具条/no-print）
                          / @media print 改 grid/flex/display
    */

    /* 示例：学术蓝（仅供参考，AI 自由调整） */
    body[data-style="academic_blue"] {
      --accent: #1976d2;
      --accent-bg: #e3f2fd;
    }
    body[data-style="academic_blue"] .kcard {
      background: var(--accent-bg);
      border-left: 4pt solid var(--accent);
      padding: 4mm 5mm;
      margin: 4mm 0;
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

  <!-- 铁律 7：顶部打印工具条 -->
  <div class="print-toolbar" id="printToolbar">
    <button class="print-btn-main" onclick="window.print()">🖨 打印 / 导出 PDF</button>
    <button class="print-btn-secondary" onclick="downloadCleanHtml()" title="下载干净版 HTML 到本地，避免飞象内嵌干扰">💾 下载到本地</button>
    <button class="print-btn-secondary" onclick="openInNewTab()" title="在新标签页打开本页面">🔗 新窗口打开</button>
    <span class="print-hint" id="printHint">↑ 打印请点这里，不要按 Ctrl+P</span>
  </div>

  <main>
    <!-- 内容由 AI 按 source-package.blocks 自由排版（顺序流，由 Paged.js 自动分页） -->
    <header><h1>{{title}}</h1></header>
    <article>
      <!-- ...由 AI 填充... -->
    </article>
  </main>

  <!-- 铁律 7：辅助 JS -->
  <script>
    (function(){
      var hint = document.getElementById('printHint');
      if (window !== window.top && hint) {
        hint.innerHTML = '⚠️ 当前在飞象内嵌页面中，<b>必须</b> 点上方按钮才能正确打印';
      }
    })();
    function downloadCleanHtml() {
      try {
        var doctype = '<!DOCTYPE html>\n';
        var html = document.documentElement.outerHTML;
        var blob = new Blob([doctype + html], { type: 'text/html;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = (document.title || 'document') + '.html';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
      } catch (e) { alert('下载失败：' + e.message); }
    }
    function openInNewTab() {
      try {
        var doctype = '<!DOCTYPE html>\n';
        var html = document.documentElement.outerHTML;
        var blob = new Blob([doctype + html], { type: 'text/html;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      } catch (e) { alert('新标签打开失败：' + e.message); }
    }
  </script>
</body>
</html>
```

---

## 10. 不允许的 HTML/CSS 模式

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

## 11. v64 自检最低线（写代码后逐条核对）

```plain
1.  <script src> 含 cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js
2.  <script src> 含 unpkg.com/pagedjs@0.4.3/dist/paged.polyfill.js
3.  PagedConfig.before 调 await window.MathJax.typesetPromise()
4.  MathJax 在 Paged.js 之前
5.  全文不含 metis-online / metis-misc / tailwind
6.  无 <section class="page"> 手动切页
7.  顶层容器（body/main/.container）不含 max-width/width 固定数值
8.  普通题块（.question/.section/.card/.page）不含 break-inside: avoid
9.  仅 table/figure/img/.keep-together/.kcard 防拆
10. 所有有 background-color 的元素都有 -webkit-print-color-adjust: exact !important
11. @media print 内全局 *, html, body 设了 print-color-adjust: exact !important
12. @page margin ≤ 12mm
13. 含 \frac/<img> 选项不用 4 列 grid
14. <img src> 全部来自 imageLedger[i].url 或 dataUriLines.join('')
15. 没有 <object>/<embed>/<iframe>、onerror、占位话术
16. 没有 box-shadow / filter / linear-gradient / background-image:url / position:fixed（除工具条/no-print）
17. @media print 内不改 grid-template-columns / display / flex-direction
18. 含顶部 .print-toolbar 含 3 按钮 + downloadCleanHtml + openInNewTab JS
19. .print-toolbar 位置必须 top:8mm; left:50%; transform:translateX(-50%)
20. body 屏幕态有 padding-top:14mm 给工具条留位（打印态归零）
```
