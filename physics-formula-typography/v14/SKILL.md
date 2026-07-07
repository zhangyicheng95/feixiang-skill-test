---
name: physics-formula-typography
description: 物理课件公式与物理量排版规范技能。生成或修复初中/高中物理互动课件、教学动画、公式演示、实验模拟 HTML 时启用，尤其是画面中出现物理量字母、单位、公式、速度/动量/密度/电学量、动态读数、控件/滑块 label 单位提示、Canvas/SVG/Three.js/CSS2D/Chart.js 物理标注时。硬约束：使用指定 MathJax3 CDN；有物理语义的可见公式/物理量/单位/受力标签进入 MathJax；物理量斜体，单位正体；vm/vM/v0、F洛/FN/F合 等自然写法必须语义归一为 v_{m}/v_{M}/v_{0}、F_{\text{洛}}/F_N/F_{\text{合}}；禁止 $...$、Unicode 上下标、<sub>/<sup>、Canvas/WebGL/Chart.js 内置文字直接绘制公式或单位轴标题；动态 DOM 更新后必须对非空根节点执行 MathJax.typesetPromise，且不得把动态 <span>/<output> 嵌进 MathJax 定界符内部。边界：不要判定磁场方向、洛伦兹力方向、合力算法；不要把普通 UI 文案、选项编号、英文缩写、CSS/JS 标识符强行 MathJax 化。输出前必须按 self-check-schema.json 自检。
---

更新时间：2026-06-29

# 物理课件公式与字体规范技能

> 版本 1.6.6 | 2026-06-29
> 上游：老师输入、上传的物理 HTML/课件、历史坏产物
> 下游：符合 MathJax3 渲染和物理排版规范的 HTML + `formula_typography_self_check`

## 一、本技能解决什么问题

物理互动课件常见卡点不是“有没有公式”，而是画面中公式与物理量字母没有被统一排版：

1. `vm`、`vM`、`v0` 等被当作普通文本或两个字母连写，而不是 `v_{m}`、`v_{M}`、`v_{0}`。
2. 物理量、单位、角标混用纯文本、Unicode 上下标、`<sub>/<sup>`、Canvas `fillText`，导致字体不规范。
3. 初始页面公式能渲染，但点击“开始”、拖动滑块、分步讲解、动画帧更新后又出现裸字母或裸单位。
4. 源码混用 `$...$`、Unicode `²/₀/×/·`、手写 HTML 角标，MathJax3 不稳定或无法统一渲染。
5. Three.js / CSS2DLabel / DOM overlay 中的受力标签直接写成 `F洛`、`FN`、`F合`、`F_G_N` 等普通文本，导致高三物理受力分析画面中的符号字体不规范。
6. Canvas / Chart.js / ECharts 图表把 `B (⊙)`、`F_洛`、`F_合`、`v0`、`μN`、`速度 (m/s)` 等公式性标签或单位轴标题画成普通文字；或动态公式更新后调用 `MathJax.typesetPromise([])`，导致交互后公式仍以源码形式出现。
7. 控件或滑块 label 中把单位提示写成裸文本，例如 `质量 \(m\) (kg)`、`速度 \(v\) (m/s)`，导致变量已规范但单位仍是普通字体。
8. 自检或测试脚本把 JS 模板字符串 `${...}` 误判成 `$...$` 公式，或把 MathJax 渲染后的 `innerText` 当作源码检查，导致本来合格的页面被误判失败。
9. 动态读数把可变 `<span>`、`<output>` 嵌在 `\(...\)` 内部，例如 `\(m=<span id="m-val">2.0</span>\,\mathrm{kg}\)`；滑块交互后容易泄漏可见源码 `\(m=...\mathrm{kg}\)`。
10. 角度读数把度符号写成 `\mathrm{^\circ}`，在部分 MathJax 渲染中可能显示成可见的 `circ`，例如 `\(\theta=60\,\mathrm{^\circ}\)` 变成 `θ = 60 circ`。

本技能把教研文字规范转成可执行工作流：**物理语义盘点 -> MathJax3 代码约束 -> 动态更新约束 -> 交互后自检 -> 不过即补丁修复**。

同时，本技能不是“把页面上所有英文字母都公式化”的通用字体技能。它只接管有明确物理/数学语义的内容，避免过度约束影响 UI 可读性和生成稳定性。它也不是物理受力建模技能：磁场方向、洛伦兹力方向、合力算法、2D/3D 场景结构由上游物理模板或 `html-authoring` 决定；本技能只负责这些内容一旦出现在画面上，符号和公式是否排版规范。

## 二、文件导航

| 文件 | 用途 | 何时读取 |
|---|---|---|
| `SKILL.md` | 总原则、工作流、验收标准 | 首先读取 |
| `code-patterns.md` | MathJax3 配置、动态更新 helper、DOM/SVG/Canvas 模板 | 写 HTML 或修复 HTML 时 |
| `self-check-schema.json` | 输出前自检报告结构 | 交付前必须对齐 |
| `CHANGELOG.md` | 版本变更记录 | 追溯时读取 |

后台运行时如果系统提供 `<skill-files>` 表，必须使用表里的实际 CDN URL 读取这些文件，禁止自行拼接子目录路径。

## 三、九条铁律

### 铁律 1：只使用指定 MathJax3 CDN

HTML 必须加载以下 CDN，且 `window.MathJax` 配置必须写在 CDN 脚本之前：

```html
<script>
window.MathJax = {
  tex: {
    inlineMath: [['\\(', '\\)']],
    displayMath: [['\\[', '\\]']],
    processEscapes: true
  },
  startup: { typeset: true }
};
</script>
<script src="https://metis-online.fbcontent.cn/metis-misc/blER0Bn7vsa2JER9IEssf8.js"></script>
```

禁止换成 `$...$` 默认配置，禁止混用多个 MathJax CDN。

### 铁律 2：物理语义内容进入 MathJax，不要过度约束普通文本

凡画面可见且有物理/数学语义的以下内容都必须写成 `\(...\)` 或 `\[...\]`：

- 公式、等式、比例式、单位换算式
- 单个物理量字母：`m`、`M`、`v`、`a`、`F`、`p`、`P`、`C`、`Q`、`U`、`I`、`R`、`\rho`、`\mu`
- 带角标物理量：`v_m`、`v_M`、`v_0`、`p_x`、`E_k`
- 单位和含单位读数：`m/s`、`kg/m^3`、`N`、`J`、`F`、`\mu F`、`pF`
- 动态出现的读数、标签、提示条、滑块数值、动画帧标注
- 控件/滑块/输入项 label 中有物理语义的变量和单位提示，例如 `质量 m (kg)`、`电荷量 q (C)`、`磁感应强度 B (T)`、`速度 v (m/s)`
- Three.js / CSS2DLabel / DOM overlay / SVG foreignObject 中的受力与场标签：`G`、`mg`、`F洛`、`Fl`、`FN`、`Fn`、`F合`、`Fnet`、`F_G_N`、`v`、`B`、`E`

中文说明可以是正文，但句中出现的变量、单位、算式必须单独包入 MathJax。

不要为了“全覆盖”把以下内容强行 MathJax 化：

- 按钮和导航文案：`开始`、`暂停`、`Reset`、`Start`
- 选择题选项编号：`A`、`B`、`C`、`D`
- 普通英文缩写或产品/技术词：`AI`、`HTML`、`CSS`、`SVG`、`Canvas`
- 配色、布局、组件名称：`B-12`、`card A`、`panel`
- CSS class、DOM id、JS 变量名等源码标识符
- 没有物理语义的普通英文单词或字母

边界判断优先级：**教学语义 > 物理语义 > 视觉/UI 文案 > 源码标识符**。只有前两类需要 MathJax；后两类保持普通文本。

受力/场标签只做排版归一，不做物理判定：

| 画面/源码常见写法 | 正确 MathJax 写法 | 说明 |
|---|---|---|
| `F洛` / `Fl` | `\(F_{\text{洛}}\)` | 洛伦兹力标签，保留中文语义 |
| `FN` / `Fn` | `\(F_N\)` | 管道弹力/支持力标签 |
| `F合` / `Fnet` | `\(F_{\text{合}}\)` | 最终合力标签 |
| `F_G_N` | `\(F_{G,N}\)` 或 `\(F_{G+N}\)` | 中间合力标签；若用户要求隐藏则不显示 |
| `v`、`B`、`E` | `\(v\)`、`\(B\)`、`\(E\)` | 速度、磁场、电场标签 |

如果老师明确要求“用 FN 表示”“用 F洛 表示”，只能做排版归一为 `\(F_N\)`、`\(F_{\text{洛}}\)`；不得擅自改名为其他物理符号，也不得补充或改变力的方向。

### 铁律 3：物理量斜体，单位正体

物理量字母用 LaTeX 数学默认斜体：

```html
速度 \(v\)，质量 \(m\)，槽质量 \(M\)，电荷量 \(Q\)
```

单位必须用正体 `\mathrm{...}`，数字与单位之间用 `\,`：

```html
\(2.5\,\mathrm{m/s}\)
\(1.0\,\mathrm{kg/m^3}\)
\(1.50\,\mathrm{g/cm^3}\)
\(10\,\mathrm{\mu F}\)
\(3\,\mathrm{N}\)
```

禁止把单位写成裸文本 `m/s`、`kg/m³`、`μF`；禁止让单位字母跟物理量一样斜体。
密度类读数卡片、滑块当前值、结果徽标、刻度端点、图例说明也必须按单位规则处理，例如 `1.50 g/cm³`、`1.2 g/cm³`、`8.0 g/cm³` 必须写成 `\(1.50\,\mathrm{g/cm^3}\)`、`\(1.2\,\mathrm{g/cm^3}\)`、`\(8.0\,\mathrm{g/cm^3}\)`；`1000 kg/m³` 必须写成 `\(1000\,\mathrm{kg/m^3}\)`。

角度的度符号是数学符号，不是需要 `\mathrm{...}` 的文本单位。角度读数和倾角 label 推荐：

```html
\(\theta = 30^\circ\)
\(\theta = 30\,{}^\circ\)
<label>倾角 \(\theta\)（单位 \({}^\circ\)）</label>
```

不要写：

```html
\(\theta = 30\,\mathrm{^\circ}\)
<label>倾角 \(\theta\)（单位 \(\mathrm{^\circ}\)）</label>
```

这条只约束角度/倾角的度符号写法；`kg`、`N`、`m/s`、`T`、`C` 等普通单位仍按 `\mathrm{...}` 处理。

控件/滑块/输入项的 label 如果只是说明单位，也必须让单位进入 MathJax；但不要把整个控件文案都变成公式。推荐写法：

```html
<label>质量 \(m\)（单位 \(\mathrm{kg}\)）</label>
<label>速度 \(v\)（单位 \(\mathrm{m/s}\)）</label>
<label>磁感应强度 \(B\)（单位 \(\mathrm{T}\)）</label>
```

以下写法视为失败：

```html
<label>质量 \(m\) (kg)</label>
<label>速度 \(v\) (m/s)</label>
<label>电荷量 q (C)</label>
```

这条规则只覆盖有明确物理语义的控件 label。`开始`、`暂停`、`重置`、`显示轨迹` 等普通操作控件仍保持普通文本。

### 铁律 4：自然语言变量必须语义归一

老师常写的连写变量必须先转成物理语义，再进 MathJax：

| 老师/旧 HTML 可能写法 | 正确写法 | 含义 |
|---|---|---|
| `vm` | `\(v_{m}\)` | 小球速度或质量为 `m` 的物体速度 |
| `vM` | `\(v_{M}\)` | 槽/大物体速度 |
| `v0` / `v₀` | `\(v_{0}\)` | 初速度 |
| `pm` | `\(p_{m}\)` | 小球动量 |
| `pM` | `\(p_{M}\)` | 槽/大物体动量 |
| `Px` / `P_x` | `\(P_{x}\)` | 水平方向总动量 |
| `rho` / `ρ` | `\(\rho\)` | 密度 |
| `uF` / `μF` | `\(\mathrm{\mu F}\)` | 微法，单位 |
| `V1` / `V₂` / `V₃` | `\(V_{1}\)` / `\(V_{2}\)` / `\(V_{3}\)` | 实验读数或体积测量值 |

多字符文字角标用 `\text{}` 或 `\mathrm{}`，例如 `\(v_{\text{初}}\)`、`\(E_{\mathrm{k}}\)`。
步骤编号 `A/B/C/D` 保持普通文本；但同一句里的测量变量仍要 MathJax 化，例如 `步骤 A：测量 \(V_{1}\)`。

### 铁律 5：禁止 Unicode 数学替代品和 HTML 角标

以下写法一律失败：

- Unicode 上下标：`v₀`、`m²`、`kg/m³`
- 动态提示或按钮文案里的 Unicode 读数：`读取 V₁`、`测量 V₂`
- Unicode 运算符替代：`×`、`÷`、`≤`、`≥`、`·`
- HTML 角标：`v<sub>m</sub>`、`m/s<sup>2</sup>`
- 纯文本公式：`m·v0 = m·vm + M·vM`

统一改为：

```html
\(v_{0}\)
\(V_{1}\)
\(\mathrm{m^2}\)
\(\mathrm{kg/m^3}\)
\(\times\)
\(m v_{0}=m v_{m}+M v_{M}\)
```

### 铁律 6：动态更新必须重渲染

凡 `innerHTML` / `textContent` / 模板字符串 / 滑块 / 动画帧 / 点击步骤更新了公式或单位，必须在更新后执行：

```js
await MathJax.typesetPromise([container]);
```

`container` 必须是真实且非空的 DOM 根节点，例如刚更新的标签、包含本次更新的一小块面板，或最后兜底的 `document.body`。以下写法视为失败，因为调用方不传参时会把空数组交给 MathJax，交互后很容易留下裸 `\(...\)`：

```js
await MathJax.typesetPromise([]);
await MathJax.typesetPromise(el ? [el] : []);
async function typeset(el) {
  await MathJax.typesetPromise(el ? [el] : []);
}
await typeset();
```

推荐使用 `code-patterns.md` 中的 `setFormula()`、`setPhysicsValue()`、`typesetMath()`。禁止动画开始后出现 `vm`、`vM`、`m/s` 等裸文本。
若动态文案是混合文本（如 `读取 V₁`、`步骤 B：测量 V2`），不要用 `innerText/textContent` 写 Unicode 下标；改用 `innerHTML = '读取 \\(V_{1}\\)'` 或 helper，然后对该节点 `typesetPromise`。步骤编号 `A/B/C` 仍保持普通文本。
若动态文案是数值 + 密度单位（如滑块标签 `1.50 g/cm³`、结果卡片 `0.92 kg/m³`），也必须用 `setPhysicsValue()` 或 `setFormula()`，不得用普通文本拼接 Unicode `³`。
静态密度刻度或图例也一样：不要写 `<span>1.2 g/cm³</span>`；要写 `<span>\(1.2\,\mathrm{g/cm^3}\)</span>`。

### 铁律 7：Canvas/SVG/Three.js/Chart.js 不直接画公式标签

Canvas `ctx.fillText('vM')`、SVG `<text>vM</text>`、Three.js sprite / canvas texture / WebGL 文字贴图、Chart.js/ECharts 内置 legend/title/axis/annotation 文本无法由 MathJax 稳定排版，禁止用于公式、变量、单位和受力标签。

正确做法：

- 物理对象、轨迹、箭头可以画在 Canvas/SVG。
- 公式标签放到 HTML overlay。
- SVG 内必须标公式时，使用 `<foreignObject>` 放 HTML `\(v_{M}\)`，然后对父节点 `typesetPromise`。
- Three.js 内的箭头、球、管道、轨迹可以由 WebGL 绘制；公式和受力标签必须放到 CSS2DLabel、HTML overlay 或 DOM 节点中，例如 `\(F_{\text{洛}}\)`、`\(F_N\)`、`\(F_{\text{合}}\)`。
- 标签只移动位置时不要每帧重新 typeset；只有标签内容变化或重新创建时才对标签节点执行 `MathJax.typesetPromise([labelElement])`。
- Chart.js/ECharts 可以画坐标轴、曲线、柱形和纯中文描述；含 `F_洛/F合/v0/B/E/μN/m/s/N/T` 等公式性信息的图例、轴标题、注释和数据标签，必须放到图表外层 HTML 自定义 legend/axis caption/annotation overlay，再用 MathJax 排版。
- 图表内置轴标题只放纯中文维度名，例如 `速度`、`力`、`时间`。`速度 (m/s)`、`时间 t/s`、`力 (μN)`、`v (m/s)`、`F (N)` 这类带变量或单位的轴标题视为失败；改为内置轴标题 `速度` / `力`，并在图表外 HTML caption 写 `横轴：速度 \(v\)，单位 \(\mathrm{m/s}\)`、`纵轴：力 \(F\)，单位 \(\mu\mathrm{N}\)`。
- 纯图形磁场方向符号 `×`、`⊙`、`⊗` 可以作为画布符号出现；但一旦和变量或单位组合成 `B (⊙)`、`B×`、`B=\cdots`，其中 `B` 和公式部分必须使用 MathJax DOM 标签。

失败示例：

```js
ctx.fillText('B (⊙)', 10, 20);
ctx.fillText('F_洛', x, y);
new Chart(ctx, { data: { datasets: [{ label: '洛伦兹力 F_洛 (μN)' }] } });
new Chart(ctx, { options: { scales: { x: { title: { text: '速度 (m/s)' } } } } });
```

### 铁律 8：修复旧 HTML 时只修本卡点

老师要求“修公式/修物理量字母/修单位字体”时：

- 保留原 HTML 的布局、颜色、交互、资源 URL、按钮结构。
- 只替换公式/变量/单位的写法和相关动态更新逻辑。
- 不顺手重写整页、不改教学内容、不新增无关动画。
- 如果本次正好编辑到 `<head>` 或 spec 注释，顺手把 `forbid=$...$` 改为 `forbid=dollar-math-delimiter`；但不要为了改注释而重写页面结构。

### 铁律 9：交付前必须自检

输出前必须生成 `formula_typography_self_check`，至少包含：

- MathJax CDN 是否正确
- 是否存在 `$...$` 数学定界符；检测时必须忽略 JS 模板插值 `${...}`，禁止用 `"$" not in page.content()` 这类粗暴断言替代定界符检查
- 是否存在 Unicode 上下标/`<sub>/<sup>`
- 是否所有可见物理量和单位已 MathJax 化
- 是否控件/滑块 label 中的单位提示也已 MathJax 化，例如没有 `质量 \(m\) (kg)`、`速度 \(v\) (m/s)` 这类半规范写法
- 是否所有可见受力/场标签（如 `F洛/FN/F合/v/B/E`）已 MathJax 化
- 点击/播放/滑块/步骤切换后是否仍无裸公式
- 动态 MathJax 重排是否使用非空 DOM 根节点，是否不存在 `typesetPromise([])` 或等价空根 helper
- Canvas/SVG/Chart.js/ECharts 中是否仍有公式性文字标签，尤其是图例、轴标题、注释中是否仍有 `速度 (m/s)`、`力 (μN)`、`v0` 等裸变量/单位
- Three.js/CSS2DLabel/DOM overlay 中是否仍有裸 `F洛/FN/F合/F_G_N`
- 是否没有把普通 UI 文案、选项编号、英文缩写过度 MathJax 化
- MathJax 检查是否区分三类对象：raw source 检查原始 HTML 字符串中的 `\(...\)`、`\mathrm{...}`；post-MathJax DOM 检查 `mjx-container`、`data-physics-label` 等渲染后结构；visual text 检查 `innerText`，不要期望渲染后的 DOM 或 `innerText` 里仍保留原始 `\(`、`\mathrm`

任一核心项失败，不得交付；进入补丁循环。

## 四、六阶段工作流

```
Phase 1 | 输入分诊
  - fresh_generate: 从老师需求生成新的物理 HTML
  - fix_existing: 修复老师上传/历史生成的 HTML
  - 识别学段、物理主题、重点物理量、动态交互点

Phase 2 | 公式盘点
  - 列出所有可见公式、变量、单位、动态读数
  - 列出控件/滑块/输入项 label 中的物理量和单位提示
  - 列出所有可见受力/场标签：G、mg、F洛、FN、F合、v、B、E 等
  - 把老师自然写法归一：vm -> v_{m}, vM -> v_{M}, v0 -> v_{0}
  - 把受力标签归一：F洛 -> F_{\text{洛}}, FN -> F_N, F合 -> F_{\text{合}}
  - 排除普通 UI 文案、选项编号、英文缩写、源码标识符，避免过度约束
  - 标记 Canvas/SVG/Three.js/CSS2DLabel/Chart.js/ECharts/JS 动态字符串里的公式风险

Phase 3 | HTML/JS 实现
  - 按 code-patterns.md 加载 MathJax3
  - 静态文本全部用 \(...\) 或 \[...\]
  - 动态读数使用 setFormula/setPhysicsValue
  - 动态读数更新整个公式节点，不把 `<span>` / `<output>` / `<input>` 等可变 DOM 放进 `\(...\)` 或 `\[...\]` 内部
  - 动态公式更新后对真实非空根节点 typeset，避免 typesetPromise([])
  - Canvas/SVG/Three.js/Chart.js 公式与受力标签改为 HTML overlay、CSS2DLabel、foreignObject 或自定义 HTML 图例

Phase 4 | 交互 smoke
  - 初始页面等待 MathJax 完成
  - 点击开始/播放/下一步
  - 拖动主要滑块
  - 切换标签/步骤
  - 检查图表图例/轴标题/标注层没有裸 F_洛/F合/v0/B/μN/m/s/N/T；图表内置轴标题只保留纯中文维度名
  - 检查控件/滑块 label 没有裸单位提示，如 `(kg)`、`(m/s)`、`(T)`、`(C)`
  - 至少一次交互后检查 visual text 不包含裸 LaTeX 源码片段，如 `\(`、`\)`、`\[`、`\]`、`\mathrm`、`\text`
  - 若页面有角度/倾角读数，交互后 visual text 不应出现独立的 `circ`；改用 `^\circ` 或 `{}^\circ`
  - 每次变化后检查画面没有裸 vm/vM/v0/m/s/kg/m3/F洛/FN/F合

Phase 5 | Self-Check
  - 按 self-check-schema.json 逐项输出
  - 检查 control_label_units：控件/滑块 label 中的物理量和单位提示是否都已进入 MathJax
  - 检查 delimiter_policy：只判定 `$...$` 数学定界符，忽略 JS 模板插值 `${...}` 和 HTML 注释；不得用整页不含 `$` 作为通过条件；spec 注释里也不要写 literal `$...$`，改写为 `dollar-math-delimiter`
  - 检查 dynamic_typeset_nonempty_root 和 canvas_chart_formula_labels
  - 检查 dynamic_readout_nested_dom：不存在 `\(...<span ...>...\)`、`\(...<output ...>...\)` 这类 MathJax 定界符内部嵌动态 DOM 的写法
  - 检查 angle_degree_symbol：若存在角度/倾角读数或 label，不使用 `\mathrm{^\circ}`，视觉文本中不出现独立 `circ`
  - 检查 MathJax 测试口径：raw source / post-MathJax DOM / visual text 三层分开；动态受力标签建议有非展示性的 `data-physics-label="G"` 等测试钩子
  - 检查 non_overconstraint：普通 UI 和非物理英文是否仍保持普通文本
  - 任一失败 -> Phase 6

Phase 6 | 补丁循环（最多 2 次）
  - 按失败维度精确修补
  - 不大改布局和交互
  - 重跑 Phase 4-5
  - 仍失败则 status=degraded，列出无法自动修复的证据
```

## 五、典型正确写法

```html
<p>小球速度 \(v_{m}\)：<span id="vm-value">\(0.00\,\mathrm{m/s}\)</span></p>
<p>半圆槽速度 \(v_{M}\)：<span id="vM-value">\(0.00\,\mathrm{m/s}\)</span></p>
<div class="formula">\[m v_{m} + M v_{M}=0\]</div>
```

```js
await setFormula(document.getElementById('vm-value'), `${vm.toFixed(2)}\\,\\mathrm{m/s}`);
await setFormula(document.getElementById('vM-value'), `${vM.toFixed(2)}\\,\\mathrm{m/s}`);
```

## 六、补丁矩阵

| 失败项 | 立即修复 |
|---|---|
| `mathjax_cdn` | 移除其他 MathJax 脚本；在指定 CDN 前写 `window.MathJax` 配置 |
| `delimiter_policy` | 全局替换真正的 `$...$` 数学定界符为 `\(...\)` 或 `\[...\]`；保留正常 JS 模板插值 `${...}`，测试时不要断言整页完全没有 `$` |
| `quantity_unit_font` | 变量用数学默认斜体；单位改 `\mathrm{...}` |
| `angle_degree_symbol` | 把 `\(\theta=30\,\mathrm{^\circ}\)` 改为 `\(\theta=30^\circ\)` 或 `\(\theta=30\,{}^\circ\)`；控件 label 写 `倾角 \(\theta\)（单位 \({}^\circ\)）`；交互后视觉文本不得出现独立 `circ` |
| `control_label_units` | 把控件/滑块 label 中的 `质量 \(m\) (kg)`、`速度 \(v\) (m/s)` 改为 `质量 \(m\)（单位 \(\mathrm{kg}\)）`、`速度 \(v\)（单位 \(\mathrm{m/s}\)）` |
| `semantic_subscripts` | `vm/vM/v0/pm/pM/Px/V1/V2/V3` 统一改为 `v_{m}/v_{M}/v_{0}/p_{m}/p_{M}/P_{x}/V_{1}/V_{2}/V_{3}` |
| `unicode_or_html_subscripts` | Unicode 上下标、`<sub>/<sup>` 全部改 LaTeX `_` / `^` |
| `dynamic_typeset` | 为每个动态更新点接入 `setFormula` 或更新后 `MathJax.typesetPromise([el])` |
| `dynamic_typeset_nonempty_root` | 把 `typesetPromise([])`、`el ? [el] : []` 改为对更新节点、容器或 `document.body` 的非空根节点重排 |
| `dynamic_readout_nested_dom` | 把 `\(m=<span id="m-val">...</span>\,\mathrm{kg}\)` 改为整块读数节点，例如 `<div id="m-readout">\(m=2.0\,\mathrm{kg}\)</div>`，交互时更新 `mReadout.innerHTML` 后对该节点 typeset |
| `canvas_svg_labels` | Canvas/SVG 文本公式迁移到 HTML overlay 或 SVG foreignObject |
| `canvas_chart_formula_labels` | Chart.js/ECharts 内置 legend/axis/annotation 中的公式性文字迁移到 HTML 自定义图例、轴说明或 overlay；内置轴标题 `速度 (m/s)`、`力 (μN)` 改为纯中文轴名 + HTML MathJax caption |
| `force_vector_labels` | Three.js/CSS2DLabel/DOM overlay 中的 `F洛/FN/F合/v/B/E` 改为 MathJax 标签；只移动位置时不重复 typeset |
| `interaction_smoke` 误报 MathJax | raw source 查原始 HTML 字符串；post-MathJax DOM 查 `mjx-container` / `data-physics-label`；visual text 查 `innerText`；动态力标签可加 `data-physics-label="G"`、`data-physics-label="F_N"` 等非展示性属性辅助定位 |
| `interaction_smoke` | 找出点击/播放/滑块后出现的裸符号，回到对应 JS 更新函数修补 |
| `non_overconstraint` | 若 `A/B/C/D`、`Start/Reset`、`AI/HTML/CSS` 等被包成公式，改回普通文本；只保留物理语义内容 MathJax |

## 七、反模式速查

| 反模式 | 后果 | 正确做法 |
|---|---|---|
| `小球速度 vm: 0.00 m/s` | `vm` 和单位裸露 | `小球速度 \(v_{m}\)：\(0.00\,\mathrm{m/s}\)` |
| `<label>质量 \(m\) (kg)</label>` | 控件 label 变量规范但单位仍裸露 | `<label>质量 \(m\)（单位 \(\mathrm{kg}\)）</label>` |
| `<label>速度 v (m/s)</label>` | 控件 label 变量和单位都未规范 | `<label>速度 \(v\)（单位 \(\mathrm{m/s}\)）</label>` |
| `\(\theta=30\,\mathrm{^\circ}\)` | 度符号被当成文本单位，可能渲染成可见 `circ` | `\(\theta=30^\circ\)` 或 `\(\theta=30\,{}^\circ\)` |
| `<label>倾角 \(\theta\)（单位 \(\mathrm{^\circ}\)）</label>` | label 里的度符号可能显示成 `circ` | `<label>倾角 \(\theta\)（单位 \({}^\circ\)）</label>` |
| `m·v₀ = m·vm + M·vM` | Unicode + 裸连写 | `\(m v_{0}=m v_{m}+M v_{M}\)` |
| `<sub>m</sub>` | 字体不统一，MathJax 不接管 | `_{m}` |
| `ctx.fillText('vM', x, y)` | Canvas 字体不规范 | HTML overlay: `<span>\(v_{M}\)</span>` |
| `ctx.fillText('B (⊙)', x, y)` | 磁场变量和方向混成普通 Canvas 文字 | 画布只画 `⊙` 图形；HTML overlay 显示 `\(B\)` |
| `drawVector(..., 'F_洛')` / `ctx.fillText('F_合', x, y)` | 受力标签进入 Canvas 文本，MathJax 不接管 | 箭头留在 Canvas；标签用 overlay `\(F_{\text{洛}}\)`、`\(F_{\text{合}}\)` |
| `dataset.label = '洛伦兹力 F_洛 (μN)'` | Chart.js 图例无法按物理排版渲染 | 内置图例隐藏；自定义 HTML legend 写 `洛伦兹力 \(F_{\text{洛}}\)（\(\mu\mathrm{N}\)）` |
| `axis.title.text = '力 (μN)'` / `annotation.label='临界速度 v0'` | 图表轴标题/注释裸单位和角标 | 图表内用纯中文标题；精确符号和单位放 HTML 轴说明/注释 overlay |
| `scales.x.title.text = '速度 (m/s)'` | Chart.js 内置轴标题承载单位，MathJax 不接管 | 轴标题写 `速度`；图外 caption 写 `横轴：速度 \(v\)，单位 \(\mathrm{m/s}\)` |
| `createLabel('F洛')` / `new CSS2DObject(el)` 中 `el.textContent='FN'` | Three.js 受力标签裸文本 | `createPhysicsLabel('F_{\\text{洛}}')` / `createPhysicsLabel('F_N')` |
| `labels.Fnet.textContent = 'F合'` | 动态切换后合力标签退回普通文本 | `setForceLabel(labels.Fnet.element, 'F_{\\text{合}}')` 后 typeset |
| 为了规范标签而强制新增/删除某个力 | 过度约束，越权改物理模型 | 只规范已有可见符号；是否显示某个力由物理模板/用户需求决定 |
| `expect("$" not in page.content())` | 把 JS 模板字符串 `${...}` 误判为 `$...$` 公式 | 用定界符扫描函数，只检查真正成对的 `$...$` 数学定界符 |
| `<!-- spec: forbid=$...$ -->` | 自检提示本身把禁用写法写进源码，污染 raw source 扫描 | 写成 `<!-- spec: forbid=dollar-math-delimiter -->` |
| 用 `innerText` 断言包含 `\(G\)` 或 `\mathrm{kg}` | MathJax 渲染后视觉文本不保留源码定界符，容易误报 | raw source 查 LaTeX；visual text 查可读文本；动态标签用 `data-physics-label` 定位 |
| MathJax 启动后还用 `innerHTML` 断言包含 `\(G\)` | MathJax 可能已把源码改写成 MathML，导致正确页面被误判 | raw source 查下载/读取到的原始 HTML；渲染后 DOM 查 `mjx-container`、`data-physics-label` 或可见文本 |
| 动画循环里只移动标签位置却反复 `typesetPromise` | 性能差，且可能造成测试时序波动 | 标签内容创建或变化时 typeset 一次；只移动位置时更新 `style/position` |
| 动态 `el.textContent = value + ' m/s'` | 动画后裸单位 | `setFormula(el, value + '\\,\\mathrm{m/s}')` |
| `<div>\(m=<span id="m-val">2.0</span>\,\mathrm{kg}\)</div>` | MathJax 会改写节点结构，滑块后只改内部 span 容易泄漏 `\(...\)` 源码 | `<div id="m-readout">\(m=2.0\,\mathrm{kg}\)</div>`；交互时更新整个 readout 并 typeset |
| 写完公式不重渲染 | 页面留下源码 `\(v\)` | `await MathJax.typesetPromise([container])` |
| `await MathJax.typesetPromise([])` / `typeset(el ? [el] : [])` 后调用 `typeset()` | MathJax 收到空根节点，动态公式可能不渲染 | helper 默认 `document.body`，或传入刚更新的节点/容器 |
| 把选项 `A/B/C/D` 或 `HTML/CSS` 包成 MathJax | 过度约束，UI 可读性变差 | 选项编号和技术缩写保持普通文本 |
| 动态提示 `tip.innerText = "读取 V₁"` | 运行后出现 Unicode 下标，MathJax 不接管 | `tip.innerHTML = '读取 \\(V_{1}\\)'` 后 `typesetMath(tip)` |
| 动态读数 `label.textContent = value + ' g/cm³'` | 密度单位裸露，且含 Unicode 上标 | `setPhysicsValue(label, value, 'g/cm^3')` |
| 图例端点 `<span>8.0 g/cm³</span>` | 静态密度单位裸露 | `<span>\(8.0\,\mathrm{g/cm^3}\)</span>` |

## 八、输出要求

交付时输出：

```json
{
  "final_html_url": "<生成或修复后的 HTML URL>",
  "formula_typography_self_check": {
    "version": "1.6.6",
    "passed": true,
    "status": "passed"
  }
}
```

若无法全部修复，必须把 `status` 置为 `degraded`，列出仍失败的 HTML 位置和原因，不得声称“已解决”。
