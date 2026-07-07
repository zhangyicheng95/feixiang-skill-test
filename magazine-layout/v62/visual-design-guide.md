# 高级视觉排版（v60）

> 精美排版的高级感来自「信息秩序」，不来自花哨装饰。本文件给出 v60 的设计系统总纲。

---

## 1. 总原则

```text
真实保真是底线 + 信息秩序是核心 + 装饰最小化
```

精美排版**不是**：

- 把原文档截图贴进 HTML
- 大色块、大留白、海报感装饰
- 把简单题加上花边
- 用 emoji 装饰试卷题号

精美排版**是**：

- 在真实保留内容、题图、原卷信息基础上
- 把已识别内容重组为「设计师排过」的纸面资料
- 统一 design token（字号、行高、间距、颜色）
- 清晰的题型层级和题号锚点
- 标准答题区
- 图文邻近布局
- 高信息密度 + 打印友好

---

## 2. 双层交付

### 2.1 重排正文（主交付）

可复制、可编辑、可打印的 HTML：

- 题目、选项、答题区都是 DOM 文本
- 公式由 MathJax 渲染（可复制为 LaTeX）
- 表格优先 `<table>`
- 图片来自 imageLedger.dataUri 真实嵌入

### 2.2 真实图层（保真）

- 题内图：`<figure data-role="figure_diagram">` 邻近对应题目
- 整页扫描：仅 `fidelity_mode = source_page_print` 才作为校验附录
- 公式图：`<figure data-role="formula_block / formula_inline">` 内联或独占段

---

## 3. Design Token

### 3.1 排版尺度

| 维度 | compact | standard | spacious |
|---|---|---|---|
| 正文 font-size | 10.5 pt | 11 pt | 11.5 pt |
| line-height | 1.32 | 1.5 | 1.6 |
| 段落间距 | 2-3 mm | 3-4 mm | 4-5 mm |
| 题块间距 | 3 mm | 4 mm | 5 mm |
| @page margin | 10mm 12mm | 12mm 15mm | 15mm 18mm |

### 3.2 字号层级

```css
.cover-title    { font-size: 18pt;   font-weight: bold; }
.work-section-title { font-size: 12pt; font-weight: bold; }
.lesson-stage-title { font-size: 14pt; font-weight: bold; }
.kcard-title    { font-size: 11pt;   font-weight: bold; }
.mag-title      { font-size: 24pt;   font-weight: bold; font-family: serif; }
.mag-section-title { font-size: 14pt; font-weight: bold; }
.q-meta         { font-size: 9pt;    color: #666; }
figcaption      { font-size: 8.5pt;  color: #888; }
```

### 3.3 颜色（按 style_preset，注入 CSS 变量）

详见 `template-families.md §6`。每个 preset 都包含：

```css
:root {
  --accent: ...;          /* 主色，用于 stage 徽章、章节标题色条 */
  --section-bg: ...;      /* section title 背景 */
  --section-fg: ...;      /* section title 前景 */
  --tag-bg: ...;          /* chip 背景 */
  --tag-fg: ...;          /* chip 前景 */
  --card-border: ...;     /* knowledge card 边框 */
}
```

---

## 4. 题型层级

按从浅到深四层：

```text
卷面级（cover）
  └─ 章节级（section / stage）
       └─ 题型组（题型徽章 + 分值）
            └─ 题块（question / kcard / mag-section）
                 └─ 题内元素（题号 / 题干 / 选项 / 答题区 / 题图 / 解析）
```

每层的视觉差异：

- **卷面**：cover-eyebrow（小字 + 间距）+ 大标题（粗体 + 大字号）+ 装饰横线
- **章节**：徽章（圆形数字）+ 章节标题（中字号 + 主色）+ 章节背景色条
- **题型组**：题型名 + 分值（可在 section-title 中合并）
- **题块**：题号 + 题干（无视觉装饰）
- **题内元素**：横线 / box / chip / figure 各司其职

---

## 5. 答题区视觉

| 类型 | CSS | 用途 |
|---|---|---|
| `data-kind="short"` | `min-height:6mm; border-bottom:1px solid #999` | 填空、计算（小） |
| `data-kind="standard"` | `min-height:12mm; border:1px solid #ccc` | 选择、判断 |
| `data-kind="large"` | `min-height:24mm; border:1px solid #ccc` | 解答、作文 |
| `data-kind="grid"` | 田字格 / 四线格 / 默写格 | 默写纸专用 |

---

## 6. 图文邻近原则

题图必须在所属题块**内部**或**直接相邻**：

```html
<!-- ✅ 好 -->
<article class="work-question">
  <span class="work-qnum">2.</span>
  <p>如图所示，...</p>
  <figure data-role="figure_diagram">
    <img src="data:image/jpeg;base64,...">
  </figure>
  <p>求 x 的值。</p>
  <div class="answer-space" data-kind="large"></div>
</article>

<!-- ❌ 差：图片堆在卷首图集 -->
<section class="visual-assets">
  <img ...>  <img ...>  <img ...>
</section>
<section class="text-only">
  <p>第 2 题：如图所示...</p>  <!-- 图和题脱节 -->
</section>
```

---

## 7. 装饰最小化

| 不允许 | 替代方案 |
|---|---|
| emoji 装饰试卷题号 | 纯数字题号 |
| 渐变背景 | 单色或浅灰 |
| 阴影、圆角过大 | 直角或微圆角（≤ 2mm） |
| 装饰性 SVG 边框 | 简单的横线/竖线分隔 |
| 卡通配图 | 学科原图 / 仅杂志风允许 AI 装饰图（须标注）|

**例外**：

- 杂志风可以用衬线字体、装饰横线、drop-cap、pull-quote
- 低龄友好（primary_friendly）可以用稍多色彩，但不能影响可读性

---

## 8. 打印细节

```css
@media print {
  body { background: #fff !important; }    /* 强制白底 */
  .no-print { display: none; }              /* 隐藏屏幕装饰 */
  a { color: inherit; text-decoration: none; }   /* 链接不变蓝 */
  table { page-break-inside: avoid; }
}
```

**禁止**：

- 黑底白字作为打印默认（耗墨且不专业）
- 渐变背景在打印中丢失颜色
- `position: fixed` 元素遮挡正文
- 固定页高 `height: 100vh; overflow: hidden`

---

## 9. 不同 family 的视觉差异（重要边界）

| 视觉特征 | assessment_work | learning_document | knowledge_reference | magazine_reading |
|---|---|---|---|---|
| 字体 | sans | sans | sans | **serif（衬线）** |
| 主色 | 黑 / 蓝 | 蓝 / 暖橙 | 绿 | 深蓝 / 暖灰 |
| 栏数 | single | single | double / multi | **double** |
| 标题 | 严肃 | 章节徽章 | 卡片标题 | **大字号衬线** |
| 装饰 | 最少 | 章节色条 | 卡片边框 | **drop-cap / pull-quote** |
| AI 配图 | ❌ | ❌ | ❌ | ✓（须标注） |

**严禁混搭**：试卷不能用衬线字体 + drop-cap，杂志风不能用 `.work-question`。
