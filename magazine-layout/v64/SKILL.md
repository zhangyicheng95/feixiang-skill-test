---
name: magazine-layout
description: 精美排版唯一主 Skill。Use when 用户要求把已给定内容或上传文档改造为 A4 打印友好的高级试卷、讲义、练习单、题单、默写纸、知识清单、教案打印版、杂志风资料，或提到精美排版、高级排版、好看、美化、可打印、A4、一比一、还原、原卷图、按这个格式来。**v64 协议·七条铁律（违反任一条立刻自我否决重写）**：① **唯一脚本白名单**：HTML `<script src>` 只允许 `cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js` + `unpkg.com/pagedjs@0.4.3/dist/paged.polyfill.js`。② **脚本顺序固定**：MathJax 配置 → MathJax 脚本 → `PagedConfig.before`（含 `await window.MathJax.typesetPromise()`）→ Paged.js 脚本。③ **禁手动切页 + 禁顶层固定宽度**：禁止 `<section class="page">` / 固定高度容器；禁 `body / main / .container` 加 `max-width / width` 固定数值；普通题块禁 `break-inside: avoid`，仅 `table / figure / img / .keep-together / .kcard` 可防拆。④ **打印颜色保留**：所有有色块显式 `-webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;`，并在 `@media print` 兜底。⑤ **保真不变形**：HTML 题块数 ≥ `quality.questionCount`；`imageLedger[*].url`（或 `dataUriLines.join('')`）全部出现在 `<img>`；答案/解析全保留；含 `\frac/<img>/长表达式` 选项严禁 4 列；@page margin ≤ 12mm；STEM 严禁 `generate_image`。⑥ **打印一致性**：屏幕预览 ≡ 打印预览 ≡ 打印纸面，禁 `box-shadow / filter / linear-gradient / background-image:url() / position:fixed`（仅 `.no-print` / `.print-toolbar` 例外）；禁 `@media print` 改 grid/flex/display 布局；尺寸用 mm/pt/em。⑦ **必须显眼打印入口**（v64 加固·**飞象 iframe 嵌套环境关键**）：HTML 必须含**顶部居中悬浮的醒目打印工具条** `.print-toolbar`，含 `🖨 打印 / 导出 PDF` 主按钮（`onclick="window.print()"`，触发 iframe contentWindow.print 绕过外层壳）+ 可选`💾 下载干净 HTML` 副按钮（剥离飞象 srcdoc 噪声后 Blob 下载）+ 可选 `🔗 在新标签打开` 副按钮（脱离 iframe 后再打印），并在响应中明确告知「**请点击 HTML 顶部的『🖨 打印』按钮，不要直接按 Ctrl+P**」。**风格自由度高**：class 命名、style_preset、单/双栏、卡片配色、border / 圆角 / 装饰由 AI 自由发挥，只守 7 条物理铁律。**输入主路径**：[A] 用户贴 OSS URL → `read_url(url)`；[B] 用户上传 .txt/.html → `read_file(resourceId)`；[C] 粘贴 JSON → 从消息正则截取。`source-package@v2`：完整原文用 `blocks` 数组（`markdownLines/markdownPreview` 仅元数据）；`imageLedger[i].url` 首选，备用 `dataUriLines.join('')`。**每轮第一个工具调用必须** `skills(name="magazine-layout")`；用户回复 `ask_user` 后必须再调一次。`create_html_deliverable` 之前**必须** 贴出 14 项硬自检（每项含实际计数对照），任一未过停止交付重写。已 `ask_user` 后本轮**严禁** 继续 `create_html_deliverable`。
---

更新时间：2026-05-13

# 精美排版 magazine-layout · v64

> **v64 关键升级（2026-05-13 重大发现）**：飞象老师在用户全屏浏览/下载 HTML 时，会**把模型生成的 HTML 作为 `iframe srcdoc`** 嵌入一个含水印栏 + AI 标识的外层壳页面，并**注入 1100+ 个反爬噪声元素**（`<script>var _bm_xxx=...`、`<style>@media print {._bm_xxx{color:transparent}}` 等）。后果：
>
> 1. **用户按 Ctrl+P 打印的是外层壳页面**（带水印），iframe 内的 Paged.js 不生效 → PDF 几乎全空（只有页眉 URL/页码）
> 2. **iframe 高度被锁定为 100vh**，Paged.js 渲染的多页内容溢出到 iframe 视口外，打印时只显示首屏
> 3. **v63 的 `right:8mm; bottom:8mm` 打印按钮被外层壳的 `.ai-badge`（在 `right:37px; bottom:37px`）视觉遮挡** → 用户找不到
>
> v64 修复策略：
> - **顶部居中悬浮工具条**（脱离右下角遮挡区）
> - **多入口降级**：主按钮触发 iframe 内 print；副按钮提供「下载干净 HTML」绕过飞象壳；副按钮「新标签打开」让 Paged.js 在独立窗口完整工作
> - **响应里强制告知用户操作流程**：必须点 HTML 顶部按钮，不能按 Ctrl+P
> - **保留 v63 的全部物理铁律 + 14 项防撒谎自检 + 高自由度风格**

---

## 1. 七条铁律（绝不允许违反）

### 铁律 1 · 脚本白名单

`<script src>` 只允许：

```html
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
<script src="https://unpkg.com/pagedjs@0.4.3/dist/paged.polyfill.js"></script>
```

禁止：`metis-online.fbcontent.cn` / `metis-misc` / Tailwind CDN / 飞象 data-collect / MathJax 其他 entry（tex-mml-chtml.js / tex-chtml.js）。

### 铁律 2 · 脚本顺序

```html
<script>window.MathJax = { tex: {inlineMath:[['\\(','\\)']], displayMath:[['\\[','\\]']]}, svg:{fontCache:'global'}, startup:{typeset:false} };</script>
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
<script>window.PagedConfig = { before: async () => { if (window.MathJax?.typesetPromise) await window.MathJax.typesetPromise(); } };</script>
<script src="https://unpkg.com/pagedjs@0.4.3/dist/paged.polyfill.js"></script>
```

### 铁律 3 · 禁手动切页 + 禁顶层固定宽度

```html
<!-- ❌ 全部禁止 -->
<section class="page">...</section>
<div style="height:297mm; page-break-after:always">
<main style="max-width:800px; margin:0 auto">
<div class="container" style="width:780px">
```

唯一允许的顶层布局：

```css
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; width: 100%; }
main { width: 100%; max-width: 100%; }
@page { size: A4 portrait; margin: 10mm 12mm; }
```

普通题块禁批量防拆，仅以下选择器允许：

```css
table, figure, img, .keep-together, .kcard {
  break-inside: avoid;
  page-break-inside: avoid;
}
```

### 铁律 4 · 打印颜色保留

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

### 铁律 5 · 内容保真

- HTML 题块数 ≥ `quality.questionCount`
- `imageLedger[*]` role!=unknown 全部出现在 `<img>`（用 `entry.url` 或 `entry.dataUriLines.join('')`）
- 答案/解析（quality.answerCount > 0 时）每条保留
- 含 `\frac / <img> / 长表达式` 选项 ≤ 2 列
- @page margin ≤ 12mm
- STEM 学科严禁 `generate_image`
- 杂志风/语文/英语 AI 配图必须 `<figcaption>AI 辅助插图</figcaption>`

### 铁律 6 · 打印一致性

屏幕预览 ≡ 打印预览 ≡ 打印纸面，三态结构一致。

```css
/* ❌ 全禁（仅 .no-print / .print-toolbar 例外） */
.card { box-shadow: ...; }              /* 打印时丢失 */
.card { filter: drop-shadow(...); }     /* 同上 */
.header { background: linear-gradient(...); }  /* 打印时常被替换为单色 */
.banner { background-image: url(...); } /* 打印不可靠 */
.sidebar { position: fixed; }           /* 打印漂移 */

/* ❌ 禁止 @media print 改布局 */
@media print {
  .options { grid-template-columns: 1fr; }    /* 屏幕 4 列、打印 1 列 → 不一致 */
  .container { display: block; }              /* 改 display → 不一致 */
  .sidebar { display: none; }                 /* 屏幕显示、打印隐藏 → 不一致 */
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

`@media print` 唯一允许：①隐藏 `.no-print / .print-toolbar`；②重申 `print-color-adjust: exact`；③`body { background: #fff }`。

### 铁律 7 · 必须显眼打印入口（v64 关键加固）

**v63 失败教训**：把 `.no-print` 按钮放在 `right:8mm; bottom:8mm` → 飞象壳的 `.ai-badge`（`right:37px; bottom:37px`）位置完全重叠 → 用户看不到，且 Ctrl+P 打印的是外层壳。

**v64 必须**：

#### 7.1 顶部居中悬浮打印工具条

```html
<div class="print-toolbar" id="printToolbar">
  <button class="print-btn-main" onclick="window.print()">🖨 打印 / 导出 PDF</button>
  <button class="print-btn-secondary" onclick="downloadCleanHtml()" title="下载干净版 HTML 到本地，避免飞象内嵌干扰">💾 下载到本地</button>
  <button class="print-btn-secondary" onclick="openInNewTab()" title="在新标签页打开本页面，脱离 iframe 后即可正常打印">🔗 新窗口打开</button>
  <span class="print-hint">↑ 打印请点这里，不要按 Ctrl+P</span>
</div>
```

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
.print-btn-secondary {
  padding: 5px 10px;
  background: #fff;
  color: #2c5282;
  border: 1px solid #2c5282;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}
.print-hint {
  color: #d96030;
  font-size: 12px;
  margin-left: 6px;
}
@media print {
  .print-toolbar { display: none !important; }
}
```

#### 7.2 必须包含的辅助 JS（剥离飞象壳噪声 + 新窗口打开）

```html
<script>
  // 检测当前 HTML 是否在飞象 iframe 内（top != self 即在 iframe 内）
  (function(){
    var hint = document.querySelector('.print-hint');
    if (window !== window.top && hint) {
      hint.innerHTML = '⚠️ 当前在飞象内嵌页面中。<b>必须</b> 点上方按钮才能正确打印';
    }
  })();

  // 下载干净 HTML：导出 document 为本地 .html 文件，避免飞象壳页噪声
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
      alert('下载失败：' + e.message + '\n请手动复制 URL 在新标签打开。');
    }
  }

  // 在新标签打开：用 Blob URL 让 HTML 脱离 iframe 后用浏览器原生 print
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

#### 7.3 响应中必须告诉用户操作流程

每次 `create_html_deliverable` 后的响应**必须包含**：

```plain
✅ HTML 已生成。打印请按以下方式操作：

【方式 A · 推荐】点击 HTML 内顶部的「🖨 打印 / 导出 PDF」按钮
   —— 这会绕过飞象壳页面，直接调用内嵌内容的 print，由 Paged.js 完整渲染。

【方式 B · 备选】点击「💾 下载到本地」按钮
   —— 把干净 HTML 保存到桌面，双击用浏览器（Chrome/Edge/Firefox）打开后再按 Ctrl+P，
        Paged.js 会完美工作，所见即所得。

【方式 C · 应急】点击「🔗 新窗口打开」按钮
   —— 在新标签页打开当前内容，脱离飞象内嵌后按 Ctrl+P 即可正常打印。

⚠️ 重要提醒：请勿在飞象老师页面直接按 Ctrl+P / Cmd+P，
    那会打印外层水印壳页面，得到几乎空白的 PDF（只有页眉 URL）。
    问题原因详见会话末尾说明。
```

---

## 2. 输入：source-package@v2（主路径）

3 种入口（详见 `mineru-input-contract.md`）：

```text
[A] OSS URL → read_url(url)
[B] 用户上传 .txt/.html → read_file(resourceId)
[C] 用户粘贴 JSON → 从消息正则截取
```

`source-package@v2` 字段速查：

```jsonc
{
  "schema": "magazine-layout/source-package@v2",
  "source": { "fileName", "parser":"mineru", "parseMode":"pipeline|vlm" },
  "document": {
    "title", "subject", "grade",
    "markdownLines": ["# 标题", "正文段落 1", ...]   // 完整 md 拆行
  },
  "blocks": [
    { "type":"text",  "text":"...", "page_idx":0 },
    { "type":"image", "src":"images/xxx.jpg" },
    { "type":"table", "table_body":"<table>...</table>" },
    { "type":"equation", "text":"x^2+y^2=1" }
  ],
  "imageLedger": [
    { "filename":"...", "role":"figure_diagram|figure_inline|formula_block|formula_inline|page_full|unknown",
      "naturalSize":{}, "url":"https://..." }
  ],
  "routing":  { "recommendedSubtype", "confidence", "reasons" },
  "quality":  { "questionCount", "answerCount", "warnings", "missingImages" }
}
```

取图工具：

```js
function imgSrc(entry) {
  if (entry.url) return entry.url;
  if (entry.dataUriLines) return entry.dataUriLines.join('');
  if (entry.dataUri) return entry.dataUri;
  return null;
}
```

---

## 3. fallback：原始 PDF/DOCX/PPTX

```text
1. convert_to_text 拿 OCR 文本
2. 三类分流：
   a. 纯文字 → text_only_degraded
   b. 图形依赖型（数理化生地或含「如图/示意图」）→ 阻塞，请用户先用 mineru
   c. 含图非图形依赖（语文/英语阅读、知识清单）→ ask_user 是否接受文字版
```

---

## 4. 模板族建议（仅供 routing 参考，不强制）

`source-package.routing.recommendedSubtype` 给出建议；用户显式说"做成 X"时覆盖。

| 用户场景词 | subtype | 推荐配色思路（自由调整） |
|---|---|---|
| 试卷 / 期末 / 考试 | `exam_paper` | 经典黑白 / 学术蓝 |
| 练习单 / 巩固训练 | `practice_sheet` | 同上 |
| 题单 / 专题 | `question_set` | 学术蓝 / 学术绿 |
| 默写纸 / 听写 | `dictation_sheet` | 经典黑白 + 大行距 |
| 教案 / 教师备课 | `teacher_lesson_plan` | 学术蓝 + 卡片化 |
| 讲义 / 学习材料 | `student_handout` | 暖琥珀 / 学术蓝 |
| 知识清单 / 公式表 | `knowledge_sheet` | 学术绿 + 紧凑双栏 |
| 杂志风 / 主题阅读 | `magazine_article` | 杂志暖光 |

**风格自由**：上面是建议非强制。可根据学科/场景自行选色、字体、栏数、装饰，只要 7 铁律不违反。

---

## 5. 工作流

```text
Phase 0 · 加载 skill
  必读：SKILL.md（本文件）、pagedjs-template.md、quality-gate.md
  可选：template-families.md / visual-design-guide.md / examples.md / mineru-input-contract.md

Phase 1 · 读取输入
  优先：read_url / read_file 拿 source-package → JSON.parse
  降级：convert_to_text + §3 分流

Phase 2 · 路由 + 视觉决策（高自由度）
  采用 routing.recommendedSubtype 或用户显式覆盖
  自由选：style_preset / 字体 / 单/双栏 / 卡片配色 / border 装饰
  禁：违反 7 铁律

Phase 3 · 生成 HTML
  按 pagedjs-template.md §10 最小骨架填充
  必须：顶部 .print-toolbar 三按钮 + downloadCleanHtml + openInNewTab JS
  必须：MathJax + Paged.js 顺序对、@page、print-color-adjust

Phase 4 · 14 项硬自检 + 交付
  逐条对照、列实际计数、贴在响应里
  通过后 create_html_deliverable
  最后用 §1.7.3 的固定文案告诉用户操作流程
```

**Phase 0 重读触发点**：用户回复 `ask_user` 后、补传新文件后、距上次 `skills` 调用 ≥3 个工具调用且即将 `create_html_deliverable` 时，必须重新调 `skills(name="magazine-layout")`。

---

## 6. 14 项硬自检（v64 = v63 + 顶部工具条检查）

`create_html_deliverable` 之前必须**逐条对照、列实际计数、贴在响应里**。任一未过 → 停止交付重写。

| # | 检查项 | 通过条件（必须列实际证据） |
|---|---|---|
| 1 | MathJax 标准 CDN | "grep `cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js` 命中 1" |
| 2 | Paged.js 标准 CDN | "grep `unpkg.com/pagedjs@0.4.3` 命中 1；MathJax `<script src>` 行号 < Paged.js" |
| 3 | PagedConfig.before + typesetPromise | "grep `PagedConfig` + `typesetPromise` 各命中 1" |
| 4 | 无 Tailwind / 飞象代理 | "grep `tailwind\|metis-online\|metis-misc` 命中 0" |
| 5 | 不手动切页 | "grep `<section class=\"page\">` 命中 0；grep `height:\s*297mm` 命中 0" |
| 6 | 顶层容器无固定宽度 | "grep `body\|main\|container.*max-width:\s*\d+(px\|mm)` 命中 0" |
| 7 | 普通题块无 break-inside avoid | "grep `\(question\|section\|card\|page\).*break-inside:\s*avoid` 命中 0" |
| 8 | print-color-adjust exact | "grep `-webkit-print-color-adjust:\s*exact` 命中 ≥1；@media print 全局兜底" |
| 9 | @page margin ≤ 12mm | 列 `@page` 内 `margin` 实际值 |
| 10 | **题量保真**（必须计数对照） | "**HTML 实际**：grep `<div class=\"...question\\|q-item\"` = **N1**；**源**：quality.questionCount = **N2**；**N1 ≥ N2**（必须列两个具体数字）" |
| 11 | **图片保真**（必须计数对照） | "**HTML 实际**：grep `<img\\s` = **M1**；**源**：imageLedger 中 role!=unknown = **M2**；**M1 ≥ M2**" |
| 12 | **答案保真**（必须计数对照） | "**HTML 实际**：grep `answer-tag\|answer-section\|参考答案` = **K1**；**源**：quality.answerCount = **K2**；**K1 ≥ K2** 或 **K2=0**" |
| 13 | 分数选项 ≤ 2 列 | "grep `repeat\\(4` 命中 0（短文本/纯数字 ≤ 3 位选项例外）" |
| 14 | **顶部打印工具条**（v64 加固·完整版） | "grep `class=\"print-toolbar\"\|id=\"printToolbar\"` 命中 1；grep `window.print()` 命中 ≥ 1；grep `downloadCleanHtml` 函数定义命中 1；grep `openInNewTab` 函数定义命中 1；工具条位置 `top: 8mm` + `left: 50%` + `transform: translateX(-50%)` 全部命中" |

**自检写入响应模板**（v64 强制格式）：

```plain
[Agent v64 硬自检 14 项]
1. MathJax 标准 CDN ✅ 命中 cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js
2. Paged.js 标准 CDN ✅ 命中 unpkg.com/pagedjs@0.4.3；MathJax(L20) < Paged.js(L32)
3. PagedConfig.before + typesetPromise ✅
4. 无 Tailwind / 飞象代理 ✅ grep 0 命中
5. 不手动切页 ✅ grep `<section class="page">` 0 命中
6. 顶层容器无固定宽度 ✅ body/main 均 width:100%
7. 普通题块无 break-inside avoid ✅
8. print-color-adjust exact ✅
9. @page margin ≤ 12mm ✅ 10mm 12mm
10. 题量保真 ✅ HTML 实数 30 ≥ quality.questionCount 30
11. 图片保真 ✅ HTML 实数 33 ≥ imageLedger.role!=unknown 33
12. 答案保真 ✅ HTML 答案块 16 ≥ quality.answerCount 16
13. 分数选项 ≤ 2 列 ✅
14. 顶部打印工具条 ✅ .print-toolbar 含 3 按钮（🖨 打印 + 💾 下载本地 + 🔗 新窗口打开）+ downloadCleanHtml/openInNewTab JS 完整
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
| `create_html_deliverable` | 最终交付（必须先贴 14 项自检） |

**严禁**：`mathdesign-1-html` / `html-authoring` / `page-optimize` / `parse_pptx` / 学科原卷的 `picture_gen` / `image_create` / `picture_edit` / `edit_image`。

---

## 8. 文件说明

| 文件 | 用途 |
|---|---|
| `SKILL.md` | 本文件：7 铁律 + 14 项硬自检 + 工作流 |
| [`pagedjs-template.md`](pagedjs-template.md) | A4 + Paged.js 0.4.3 + 顶部工具条最小骨架 |
| [`quality-gate.md`](quality-gate.md) | 14 项硬自检 + 4 项 subtype 专项 + 反撒谎计数命令 |
| [`mineru-input-contract.md`](mineru-input-contract.md) | source-package@v2 字段合同与读取流程 |
| [`template-families.md`](template-families.md) | 4 模板族 × 8 subtype 建议（**非强制**） |
| [`visual-design-guide.md`](visual-design-guide.md) | 设计 token、信息层级、配色建议 |
| [`math-image-fidelity.md`](math-image-fidelity.md) | 公式/原图保真规则 |
| [`examples.md`](examples.md) | 8 类场景示例（**仅供风格参考，非死模板**） |

---

## 9. v62 → v63 → v64 失败案例

### v62 失败（已 v63 修复）

- 大模型在自检里**撒谎**（HTML 14 题但报告 27 题）
- 缺打印按钮
- `max-width:800px` 容器、`box-shadow / linear-gradient` 装饰

### v63 实测失败（v64 修复）

| 用例 | v63 实测违规 | v64 修复点 |
|---|---|---|
| 5/5 用例 | 用户按 Ctrl+P，PDF 几乎全空（只有页眉 URL/页码） | 铁律 7 加固：顶部工具条主按钮触发 iframe 内 print；响应明确告知不要按 Ctrl+P |
| 5/5 用例 | `right:8mm; bottom:8mm` 打印按钮被外层壳 `.ai-badge`（`right:37px; bottom:37px`）位置遮挡 | 工具条改放 `top:8mm; left:50%; transform:translateX(-50%)` |
| 数学试卷 | 30 题渲染 14 题（仍有内容缩水） | 自检 10 强化：必须列 grep 实际数 vs questionCount，且实际 ≥ 期望 |
| 杂志 38 blocks | 渲染 ~5 段（撒谎"全文完整保留"） | 自检 10 同上 |
| 飞象 iframe | iframe 高 100vh，Paged.js 多页溢出被裁切 | 工具条副按钮：「💾 下载到本地」/「🔗 新窗口打开」让 HTML 脱离 iframe |

### v64 飞象内嵌环境 5 大补救点

1. ✅ 顶部居中工具条（脱离 ai-badge 遮挡）
2. ✅ 主按钮 `window.print()` 在 iframe contentWindow 中触发，绕过外层壳
3. ✅ 副按钮 `downloadCleanHtml()` 把 document 序列化为 Blob 下载，本地浏览器打开 Paged.js 完美工作
4. ✅ 副按钮 `openInNewTab()` 用 Blob URL 在新标签页打开，脱离 iframe 后正常打印
5. ✅ 响应文案明确告知 3 种打印方式，禁止按 Ctrl+P
