# 公式 + 图形保真规则（v63）

> 处理含数学公式、几何图形、电路图等学科原卷资料前必读。

---

## 1. 数学公式

### 1.1 必须用 MathJax 渲染

任何分数、根式、上下标、方程、矩阵、积分、求和等表达式必须用 MathJax 渲染，不能直接显示 LaTeX 源码。

```html
<!-- ✅ 好 -->
<p>计算 \(\dfrac{2}{3} + \dfrac{1}{4}\)。</p>
<p>解方程组 \[ \begin{cases} x + y = 6 \\ 2x + y = 8 \end{cases} \]</p>

<!-- ❌ 差：源码露出 -->
<p>计算 \dfrac{2}{3} + \dfrac{1}{4}。</p>
<p>计算 7/9 加 1/4。</p>      <!-- 把 \dfrac 改成 7/9 是失真 -->
```

### 1.2 内联 vs 行间

- 内联（行内）公式：`\( ... \)` 或 `$ ... $`，与文字共行
- 行间公式：`\[ ... \]`，独占段落

### 1.3 source-package.equation 块

mineru 输出的 `{type: "equation", text: "..."}` 块表示一个公式：

- 通常是 LaTeX 字符串
- 渲染为 `<p>\[{text}\]</p>` 或 `\({text}\)` 视上下文
- 公式块前后要留段距（≥ 2mm）

### 1.4 docx WMF 公式

如果 source-package 的 imageLedger 中有 `role: formula_block / formula_inline`，说明这些公式来自 docx 内嵌的 WMF 格式（已被 `docx_wmf_inject.py` 转为 PNG）：

- `formula_inline` → 行内显示，与文字基线对齐
- `formula_block` → 独占一段，居中显示
- max-width / max-height 由 `pagedjs-template.md` 的图片渲染规则限制

---

## 2. 几何图、电路图、统计图等学科图

### 2.1 来源唯一性

```text
所有题图必须来自 source-package.imageLedger.dataUri
↑
不允许：
  ❌ generate_image / picture_gen / image_create（AI 生成）
  ❌ SVG 猜画 / Canvas 绘制 / CSS 图形
  ❌ 用户/prompt 提供的"验收片段"作为图源
  ❌ 编造 URL（"https://resource.feixiang.cn/{resourceId}/page_1.png"）
```

### 2.2 学科分类

| 学科 | AI 配图允许？ | 说明 |
|---|---|---|
| math | ❌ 严禁 | 几何图、坐标图、统计图、函数图都必须真实原图 |
| physics | ❌ 严禁 | 电路图、光路图、力学图、实验装置图 |
| chemistry | ❌ 严禁 | 装置图、流程图、分子式图 |
| biology | ❌ 严禁 | 细胞图、人体图、植物图、显微图 |
| geography | ❌ 严禁 | 地图、等高线图、气候图、地形图 |
| chinese | ✓ 杂志风允许（标注 "AI 辅助插图"） | 课文配图、古诗插画、人物画像 |
| english | ✓ 杂志风允许（标注 "AI 辅助插图"） | 场景图、卡通对话图 |

### 2.3 题图 vs 装饰图

| 类型 | imageLedger.role | 渲染 | 用途 |
|---|---|---|---|
| 题图（必须真实） | figure_diagram / figure_inline | `<figure data-role="figure_diagram">` | 第 N 题如图所示 |
| 装饰图（可 AI） | （非来自 imageLedger，AI 生成时插入） | `<figure class="mag-figure">` + figcaption "AI 辅助插图" | 杂志风装饰、阅读理解配图 |
| 整页扫描 | page_full | 仅 source_page_print 模式用 | 不能当题图 |

---

## 3. 题量保真（v50 红线）

### 3.1 生成前清点

```text
read_file(source-package)
  ↓
读 quality.questionCount = N
  ↓
读 quality.answerCount = M
  ↓
明确生成目标：N 道题 + M 条答案
```

### 3.2 生成后自检

```text
HTML 中：
  - 题块数（.work-question / .lesson-question / .q-item）
    ≥ N
  - 答案/解析条数 ≥ M
  - 每题题号连续，无跳号
  - imageLedger 中 role != unknown 的图全部出现在 HTML
```

### 3.3 失败动作

```text
题量不一致 / 图片缺失：
  → 不调用 create_html_deliverable
  → 在响应中说明缺失的题号或图片
  → 询问用户是否调整 source-package 重新跑一次
```

---

## 4. 答案与解析保留

### 4.1 不允许的简化

```html
<!-- ❌ 只保留选项字母 -->
<details><summary>答案</summary><p>1.A 2.B 3.C 4.D</p></details>

<!-- ❌ 摘要式答案 -->
<p>本题考查二次函数性质。</p>     <!-- 没有具体推导步骤 -->
```

### 4.2 必须保留

```html
<!-- ✅ 完整答案 + 解析 -->
<details class="q-answer">
  <summary>答案与解析</summary>
  <p><strong>答案：</strong>A</p>
  <p><strong>解析：</strong>由题意，方程组为 \(\begin{cases}x+y=6\\2x+y=8\end{cases}\)。
     由 ①，得 y = 6 - x。把它代入 ②，得 2x + (6 - x) = 8。解得 x = 2。代入 ①，得 y = 4。
     所以选 A。</p>
</details>
```

---

## 5. "一比一原图复原模式"

用户说以下任一句即进入：

- "一比一/还原/复原/真实原图/原卷图"
- "不要 AI 生成"
- "按原文档/原卷一模一样"

进入后强化：

```text
✓ 所有 <img> 必须来自 imageLedger.dataUri
✓ 数学/物理/化学/生物/地理学科严禁调用 generate_image
✓ 公式必须 MathJax，不能改写或简化
✓ 题量、题号、选项、答案逐字保留
✓ 杂志风装饰图也必须明确标注
```

---

## 6. 自检快速表

```plain
[公式 + 图形保真自检]
✓ 所有公式都用 MathJax 渲染（无源码露出）
✓ 所有题图都来自 imageLedger.dataUri（无 AI 图、SVG 猜画、占位文字）
✓ 学科为数理化生地时未调用 generate_image
✓ 杂志风 AI 装饰图均有 figcaption "AI 辅助插图"
✓ source-package.questionCount 与 HTML 题块数一致
✓ source-package.answerCount 与 HTML 答案数一致
✓ imageLedger 中所有 role != unknown 的图都出现在 HTML
✓ 公式块前后留段距 ≥ 2mm
```
