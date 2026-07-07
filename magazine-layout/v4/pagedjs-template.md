# Paged.js A4 HTML 模板规范

## 必备脚本

使用指定版本的 Paged.js：

```html
<script src="https://unpkg.com/pagedjs@0.4.3/dist/paged.polyfill.js"></script>
```

含数学公式时必须引入 MathJax，并让 Paged.js 在公式渲染后再分页：

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
```

## 标准 HTML 骨架

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>精美排版资料</title>
  <!-- 如果有分数、公式、根式，先加载 MathJax，再让 Paged.js 分页 -->
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
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      color: #1f2623;
      background: #f2f3ef;
      font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
      font-size: 12px;
      line-height: 1.45;
    }

    .document {
      background: #fffefa;
    }

    .no-print {
      display: block;
    }

    @media print {
      body {
        background: #fff;
      }

      .no-print {
        display: none !important;
      }
    }

    .pagedjs_pages {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 18px;
      padding: 24px 0;
    }

    .pagedjs_page {
      background: #fffefa;
      box-shadow: 0 8px 24px rgba(31, 38, 35, 0.16);
    }

    .section,
    .question,
    .question-group,
    .answer-area,
    table,
    figure,
    img,
    .keep-together {
      break-inside: avoid;
    }

    .source-figure {
      margin: 4mm 0;
      text-align: center;
    }

    .source-figure img,
    .question img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 0 auto;
      object-fit: contain;
    }

    .source-figure figcaption {
      margin-top: 2mm;
      color: #6b7280;
      font-size: 10px;
    }

    .math {
      white-space: nowrap;
    }

    .print-btn {
      position: fixed;
      right: 18px;
      bottom: 18px;
      z-index: 10;
      border: 0;
      border-radius: 999px;
      padding: 10px 16px;
      color: #fff;
      background: #5b21b6;
      font-size: 14px;
      cursor: pointer;
      box-shadow: 0 8px 20px rgba(91, 33, 182, 0.22);
    }
  </style>
</head>
<body>
  <main class="document">
    <!-- 在这里写流式内容，不手动切 page，不写死页面高度 -->
  </main>
  <button class="print-btn no-print" onclick="window.print()">打印本页</button>
</body>
</html>
```

## 打印铁律

- 交给 Paged.js 自动分页，不手写 `<div class="page">`。
- 不写 `height: 100vh`、`overflow: hidden`、固定页面高度。
- 默认 A4 纵向，边距 `12mm 15mm`。
- 题目、表格、图片、答题区必须加 `break-inside: avoid`。
- 原卷图片必须复用或以原页面截图兜底保留，不能因为排版重构而丢图。
- 有 `\dfrac`、`\frac`、`\times`、根式、方程时必须启用 MathJax，且不能把 LaTeX 源码转义成可见文本。
- 填空题使用真实横线，不用下划线字符堆叠：

```css
.blank {
  display: inline-block;
  min-width: 64px;
  border-bottom: 1px solid #222;
  vertical-align: baseline;
}
```

- 手写答题区使用横线或浅色网格，不能只留空白：

```css
.writing-lines {
  min-height: 46mm;
  background-image: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent 8mm,
    rgba(31, 38, 35, 0.28) 8.2mm
  );
}
```

## 推荐视觉风格

| 风格 | 适用 | 关键样式 |
|---|---|---|
| 优雅紫色练习单 | 小学英语、语文、综合练习 | 背景 `#faf5ff`，标题 `#5b21b6`，重点框淡紫 |
| 清爽学术绿 | 数学、科学、知识清单 | 米白纸、深绿标题、细分割线、紧凑表格 |
| 经典试卷黑白 | 正式考试、测评 | 白底黑字、少装饰、题号清晰、答题区明显 |
| 温和低幼彩色 | 低年级趣味练习 | 少量柔和色块、图标点缀、不能影响打印 |
| 古典纸本文雅 | 古诗文、阅读 | 宋体/衬线标题、浅米底、注释侧栏 |

## 排版密度建议

- 选择题：可用两栏或三栏网格，但题干长时回到单栏。
- 填空题：单列优先，保证手写空间。
- 词汇/短语清单：可用 3-5 列紧凑网格。
- 阅读理解：文章单栏，题目可分组，避免文章和题目被不自然截断。
- 教案：按环节分块，不追求题单式压缩。
