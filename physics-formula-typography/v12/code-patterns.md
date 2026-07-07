# 物理公式 MathJax3 代码规范

> 供 `physics-formula-typography` 在写 HTML / 修 HTML 时读取。

## 1. 标准 MathJax3 引入

`window.MathJax` 必须出现在 CDN 之前：

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

不要使用 `$...$`，不要加载其他 MathJax CDN。

## 2. 动态公式 helper

所有动态读数和动态公式都走以下 helper，不要散落 `innerHTML = 'vm...'`：

```html
<script>
function normalizeMathRoot(root) {
  if (!root) return [document.body];
  if (Array.isArray(root)) return root.length ? root : [document.body];
  if (root instanceof NodeList || root instanceof HTMLCollection) {
    const nodes = Array.from(root);
    return nodes.length ? nodes : [document.body];
  }
  return [root];
}

async function typesetMath(root = document.body) {
  if (!window.MathJax) return;
  const roots = normalizeMathRoot(root);
  if (MathJax.typesetClear) MathJax.typesetClear(roots);
  if (MathJax.typesetPromise) {
    await MathJax.typesetPromise(roots);
  } else if (MathJax.typeset) {
    MathJax.typeset(roots);
  }
}

async function setFormula(el, latex, display = false) {
  if (!el) return;
  el.textContent = display ? `\\[${latex}\\]` : `\\(${latex}\\)`;
  await typesetMath(el);
}

async function setPhysicsValue(el, value, unitLatex) {
  await setFormula(el, `${value}\\,\\mathrm{${unitLatex}}`);
}

async function setDensityValue(el, value, unit = 'g/cm^3') {
  await setPhysicsValue(el, value, unit);
}

async function setMixedMathText(el, htmlWithMathDelimiters) {
  if (!el) return;
  el.innerHTML = htmlWithMathDelimiters;
  await typesetMath(el);
}

async function setPhysicsReadout(el, latex) {
  // Use one stable readout node. Do not put mutable <span>/<output> inside \( ... \).
  await setFormula(el, latex);
}
</script>
```

不要调用 `MathJax.typesetPromise([])`，也不要写 `el ? [el] : []` 这种空根兜底。调用方不确定更新范围时，优先传入本次更新的 DOM 节点；实在无法定位时让 `typesetMath()` 默认处理 `document.body`。

示例：

```js
await setFormula(document.querySelector('#label-vm'), 'v_{m}');
await setPhysicsValue(document.querySelector('#value-vm'), vm.toFixed(2), 'm/s');
await setFormula(document.querySelector('#momentum'), `m v_{m}+M v_{M}=0`, true);
await setMixedMathText(document.querySelector('#step-tip'), '步骤 A：测量 \\(V_{1}\\)');
await setDensityValue(document.querySelector('#rho-object'), rho.toFixed(2), 'g/cm^3');
await setPhysicsReadout(document.querySelector('#mass-readout'), `m=${m.toFixed(1)}\\,\\mathrm{kg}`);
```

### 2.1 动态读数不要在 MathJax 定界符内嵌可变 DOM

滑块、步进器、动画读数如果会变化，应更新整个公式节点，然后对这个节点执行 MathJax。不要把 `<span>`、`<output>`、`<input>` 放进 `\(...\)` 或 `\[...\]` 内部，再只改这个内部节点。

不要写：

```html
<div>\(m = <span id="m-val">2.0</span>\,\mathrm{kg}\)</div>
<div>\(\theta = <span id="theta-val">30</span>^\circ\)</div>
```

这种写法初始页面可能看起来正常，但 MathJax 会改写 DOM；滑块交互后只更新内部 `span`，容易出现可见源码 `\(m = 10.0\,\mathrm{kg}\)`。

推荐写法：

```html
<div id="m-readout">\(m = 2.0\,\mathrm{kg}\)</div>
<div id="theta-readout">\(\theta = 30^\circ\)</div>
```

```js
async function updateControlReadouts(m, theta) {
  await setFormula(document.getElementById('m-readout'), `m = ${m.toFixed(1)}\\,\\mathrm{kg}`);
  await setFormula(document.getElementById('theta-readout'), `\\theta = ${theta.toFixed(0)}^\\circ`);
}
```

如果确实需要分离数值和单位的布局，请把公式拆成多个完整 MathJax 节点，或把整段读数当作一个节点更新；不要在同一个 MathJax 定界符内部混入可变 DOM。

## 3. 动画循环写法

动画帧里不要每一帧都 typeset 整页，性能会差。推荐：

```js
let lastVmText = '';

async function updateReadouts(vm, vM, px) {
  const nextVm = vm.toFixed(2);
  if (nextVm !== lastVmText) {
    lastVmText = nextVm;
    await setPhysicsValue(document.getElementById('vm-value'), nextVm, 'm/s');
  }
  await setPhysicsValue(document.getElementById('vM-value'), vM.toFixed(2), 'm/s');
  await setPhysicsValue(document.getElementById('px-value'), px.toFixed(2), 'kg\\,m/s');
}
```

若更新频率很高，可以只在数值变化超过阈值或每 100-200 ms 更新一次公式 DOM。

## 4. 静态 HTML 示例

```html
<section class="panel">
  <h2>动量守恒</h2>
  <p>小球质量 \(m\)，半圆槽质量 \(M\)。</p>
  <p>小球速度 <span id="label-vm">\(v_{m}\)</span>：
    <span id="vm-value">\(0.00\,\mathrm{m/s}\)</span>
  </p>
  <p>半圆槽速度 <span id="label-vM">\(v_{M}\)</span>：
    <span id="vM-value">\(0.00\,\mathrm{m/s}\)</span>
  </p>
  <div class="formula">\[m v_{m}+M v_{M}=0\]</div>
</section>
```

## 4.1 控件/滑块 label 中的单位提示

控件标题、滑块 label、输入项 label 如果包含物理量和单位提示，变量与单位都要进入 MathJax；但不要把整个控件文案变成公式。

```html
<label for="mass-slider">质量 \(m\)（单位 \(\mathrm{kg}\)）</label>
<input id="mass-slider" type="range" min="0.1" max="5" step="0.1" />

<label for="speed-slider">速度 \(v\)（单位 \(\mathrm{m/s}\)）</label>
<input id="speed-slider" type="range" min="0" max="30" step="0.5" />

<label for="field-slider">磁感应强度 \(B\)（单位 \(\mathrm{T}\)）</label>
<input id="field-slider" type="range" min="0.1" max="2" step="0.1" />
```

不要写：

```html
<label>质量 \(m\) (kg)</label>
<label>速度 \(v\) (m/s)</label>
<label>电荷量 q (C)</label>
```

如果 label 文案是动态生成的，也用 mixed helper：

```js
await setMixedMathText(massLabel, '质量 \\(m\\)（单位 \\(\\mathrm{kg}\\)）');
await setMixedMathText(speedLabel, '速度 \\(v\\)（单位 \\(\\mathrm{m/s}\\)）');
```

## 5. SVG 标注

SVG 物理图可以保留，但公式标签要用 `foreignObject`：

```html
<svg viewBox="0 0 600 300">
  <path d="M80 220 H520" stroke="#334155" />
  <foreignObject x="350" y="80" width="90" height="40">
    <div xmlns="http://www.w3.org/1999/xhtml" class="math-label">\(v_{M}\)</div>
  </foreignObject>
</svg>
```

显示/更新后对 SVG 容器执行：

```js
await typesetMath(document.querySelector('svg').parentElement);
```

## 6. Canvas 标注

Canvas 只画图形、轨迹、箭头，不画公式文字：

```html
<div class="sim-stage">
  <canvas id="scene"></canvas>
  <div class="formula-overlay" id="ball-velocity-label">\(v_{m}\)</div>
  <div class="formula-overlay" id="trough-velocity-label">\(v_{M}\)</div>
</div>
```

用 CSS/JS 调整 overlay 的 `left/top`，不要用 `ctx.fillText('vM')`。

若 Canvas 场景里需要磁场方向，可以在 Canvas 中画纯图形点/叉，但变量标签必须是 overlay：

```html
<div class="canvas-stage">
  <canvas id="particle-canvas"></canvas>
  <div class="formula-overlay" id="label-b">\(B\)</div>
  <div class="formula-overlay" id="label-florentz">\(F_{\text{洛}}\)</div>
  <div class="formula-overlay" id="label-net">\(F_{\text{合}}\)</div>
</div>
```

```js
function drawMagneticDots(ctx, dots) {
  for (const dot of dots) {
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, 3, 0, Math.PI * 2);
    ctx.fill();
    // 可以画纯图形 ⊙ / × / ⊗，但不要写 ctx.fillText('B (⊙)')。
  }
}

async function updateCanvasMathLabels() {
  document.getElementById('label-b').style.transform = 'translate(18px, 12px)';
  document.getElementById('label-florentz').style.transform = 'translate(260px, 96px)';
  await typesetMath(document.querySelector('.canvas-stage'));
}
```

## 7. Canvas / Chart.js 图表标签

图表库可以负责曲线、坐标轴和交互提示，但公式性图例、轴标题、注释、数据标签不要交给图表内置文字系统。内置文字只保留纯中文描述，准确符号和单位放 HTML 自定义图例/轴说明/overlay。

```html
<div class="chart-wrap">
  <canvas id="force-chart"></canvas>
  <div id="force-chart-legend" class="chart-math-legend"></div>
  <div id="force-chart-x-caption" class="chart-axis-caption"></div>
  <div id="force-chart-y-caption" class="chart-axis-caption"></div>
</div>
```

```js
const chart = new Chart(document.getElementById('force-chart'), {
  type: 'line',
  data: {
    labels: speedSamples,
    datasets: [
      { label: '洛伦兹力', data: forceSamples, borderColor: '#2563eb' },
      { label: '重力', data: gravitySamples, borderColor: '#dc2626' }
    ]
  },
  options: {
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label(context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: { title: { display: true, text: '速度' } },
      y: { title: { display: true, text: '力' } }
    }
  }
});

await setMixedMathText(
  document.getElementById('force-chart-legend'),
  '洛伦兹力 \\(F_{\\text{洛}}\\)（单位 \\(\\mu\\mathrm{N}\\)） · 合力 \\(F_{\\text{合}}\\)'
);
await setMixedMathText(
  document.getElementById('force-chart-x-caption'),
  '横轴：速度 \\(v\\)，单位 \\(\\mathrm{m/s}\\)'
);
await setMixedMathText(
  document.getElementById('force-chart-y-caption'),
  '纵轴：力 \\(F\\)，单位 \\(\\mu\\mathrm{N}\\)'
);
```

内置轴标题保持纯中文维度名即可，例如 `速度`、`力`、`时间`。不要在 Chart.js/ECharts 的内置轴标题里写单位或变量；`速度 (m/s)`、`力 (μN)`、`时间 t/s`、`v (m/s)`、`F (N)` 都要迁移到 HTML caption。

不要写：

```js
ctx.fillText('B (⊙)', 10, 20);
drawVector(ctx, start, end, 'F_洛');
new Chart(ctx, {
  data: { datasets: [{ label: '洛伦兹力 F_洛 (μN)' }] },
  options: {
    scales: {
      x: { title: { display: true, text: '速度 (m/s)' } },
      y: { title: { display: true, text: '力 (μN)' } }
    }
  }
});
```

## 8. Three.js / CSS2D / DOM 受力标签

Three.js/WebGL 只负责物体、箭头、轨迹和空间关系；力、场、速度等可见标签必须走 DOM/CSS2D/HTML overlay，再交给 MathJax。不要用贴图、SpriteCanvas 或 `canvas.fillText()` 直接画 `F洛/FN/F合/v/B/E`。

```js
const PHYSICS_LABEL_LATEX = {
  'F洛': 'F_{\\text{洛}}',
  Fl: 'F_{\\text{洛}}',
  FN: 'F_N',
  Fn: 'F_N',
  'F合': 'F_{\\text{合}}',
  Fnet: 'F_{\\text{合}}',
  F_G_N: 'F_{G,N}',
  v: 'v',
  B: 'B',
  E: 'E',
  G: 'G',
  mg: 'mg'
};

function toPhysicsLabelLatex(labelOrLatex) {
  const raw = String(labelOrLatex ?? '').trim();
  return PHYSICS_LABEL_LATEX[raw] || raw;
}

function toPhysicsLabelKey(labelOrLatex) {
  const raw = String(labelOrLatex ?? '').trim();
  if (raw && !/[\\{}]/.test(raw)) return raw.replace(/\s+/g, '').slice(0, 32);
  const normalized = PHYSICS_LABEL_LATEX[raw] || raw || 'physics-label';
  return normalized
    .replace(/\\text\{([^}]*)\}/g, '$1')
    .replace(/\\mathrm\{([^}]*)\}/g, '$1')
    .replace(/[\\{}\s]/g, '')
    .slice(0, 32);
}

async function setForceLabel(el, labelOrLatex) {
  if (!el) return;
  const latex = toPhysicsLabelLatex(labelOrLatex);
  // Non-visual hooks make tests stable after MathJax rewrites visual text.
  el.dataset.physicsLabel = toPhysicsLabelKey(labelOrLatex || latex);
  el.dataset.physicsLatex = latex;
  el.setAttribute('aria-label', toPhysicsLabelKey(labelOrLatex || latex));
  await setFormula(el, latex);
}

async function createPhysicsLabel(labelOrLatex, className = 'math-label force-label') {
  const el = document.createElement('div');
  el.className = className;
  await setForceLabel(el, labelOrLatex);
  return el;
}
```

CSS2DLabel 示例：

```js
const labelEl = await createPhysicsLabel('F洛');
const forceLabel = new CSS2DObject(labelEl);
forceLabel.position.set(0.35, 0.2, 0);
particle.add(forceLabel);

// 标签只移动时更新 position，不要每帧重新 MathJax 排版。
function animate() {
  requestAnimationFrame(animate);
  forceLabel.position.copy(currentForceLabelPosition);
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}
```

如果教研或题目明确要显示 `F洛`、`FN`、`F合` 等名称，只做排版归一，不借机改方向、增删力或替换求合力方法。未列入映射表的标签，优先让调用方传入明确 LaTeX，例如 `F_{\\text{电}}`。`data-physics-label` 和 `data-physics-latex` 只是非展示性的测试钩子，方便检查动态标签是否存在；不要把它们当作物理方向、受力完整性或视觉样式规则。

## 9. 源码扫描自检

交付前至少扫描以下反模式：

```js
function stripScriptStyle(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');
}

function stripHtmlComments(source) {
  return source.replace(/<!--[\s\S]*?-->/g, '');
}

function stripJsTemplateInterpolations(source) {
  let out = '';
  for (let i = 0; i < source.length; i += 1) {
    if (source[i] === '$' && source[i + 1] === '{') {
      i += 2;
      let depth = 1;
      while (i < source.length && depth > 0) {
        if (source[i] === '{') depth += 1;
        if (source[i] === '}') depth -= 1;
        i += 1;
      }
      i -= 1;
      continue;
    }
    out += source[i];
  }
  return out;
}

function hasDollarMathDelimiter(html) {
  const sourceForDollarScan = stripHtmlComments(stripJsTemplateInterpolations(html));
  return /(^|[^\\$])\$(?!\{)(?=\S)(?:\\.|[^$\\])+\$/.test(sourceForDollarScan);
}

function scanFormulaTypographySource(html) {
  const visibleHtml = stripScriptStyle(html);
  return {
    hasDollarMath: hasDollarMathDelimiter(html),
    hasUnicodeSuperSub: /[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎]/.test(html),
    hasSubSupTags: /<(sub|sup)\b/i.test(html),
    hasEmptyTypesetRoot: /typesetPromise\s*\(\s*\[\s*\]\s*\)|typesetPromise\s*\(\s*[^?;\n]+\?\s*\[[^\]]+\]\s*:\s*\[\s*\]\s*\)|typeset\s*\([^)]*\)\s*\{[\s\S]{0,240}\?\s*\[[^\]]+\]\s*:\s*\[\s*\]/.test(html),
    hasCanvasFormulaText: /fillText\s*\(\s*['"`][^'"`]*(v[mM]|v0|P_x|p[mM]|m\/s|kg\/m|F(?:_洛|_合|洛|N|n|合|net|_G_N)|B\s*[\(（]|E\s*[\(（]|μN|\\mu|\\mathrm\{[NT]\}|力\s*[\(（]|磁场\s*[\(（])[^'"`]*['"`]/.test(html),
    hasChartCanvasFormulaLabels: /(label|text|title)\s*:\s*['"`][^'"`]*(F_洛|F_合|F洛|F合|Fnet|v0|v_0|B\s*[\(（]|E\s*[\(（]|μN|\\mu|m\/s|\\mathrm\{[NT]\}|力\s*[\(（]|磁场\s*[\(（])[^'"`]*['"`]/.test(html),
    hasChartAxisFormulaTitle: /scales\s*:\s*\{[\s\S]{0,2200}title\s*:\s*\{[\s\S]{0,260}text\s*:\s*['"`][^'"`]*(速度\s*[\(（]|时间\s*[\(（]|力\s*[\(（]|v\s*[\(（]|F\s*[\(（]|m\/s|μN|\\mu|\\mathrm\{|N\/kg|kg\/m)[^'"`]*['"`]/.test(html),
    hasControlLabelBareUnitHint: /<(label|legend|span|div)\b[^>]*>[^<]*(质量|电荷量|电荷|磁感应强度|磁场|速度|力|时间|加速度|密度|m|q|B|v|F|t|a|rho|ρ)[^<]*(?<!\\)[（(](?![^)）]*\\\()[^)）]*(kg|g|m\/s|m\/s\^2|N|T|C|s|A|V|Ω|ohm|uF|μF|kg\/m\^?3|g\/cm\^?3)[^)）]*[)）]/i.test(visibleHtml),
    hasMutableDomInsideMathDelimiter: /\\\([\s\S]{0,180}<(span|output|input)\b[\s\S]{0,180}\\\)/i.test(visibleHtml) || /\\\[[\s\S]{0,240}<(span|output|input)\b[\s\S]{0,240}\\\]/i.test(visibleHtml),
    hasBareVmInVisibleTemplate: />[^<]*(vm|vM|v0|m\/s|kg\/m3|kg\/m³)[^<]*</.test(html),
    hasBareForceLabelAssignment: /(textContent|innerText)\s*=\s*['\"`](F洛|FN|Fn|F合|Fnet|F_G_N|v|B|E)['\"`]/.test(html),
    hasBareForceCreateLabel: /create(Label|PhysicsLabel|TextLabel)?\s*\(\s*['\"`](F洛|FN|Fn|F合|Fnet|F_G_N|v|B|E)['\"`]/.test(html)
  };
}
```

不要写 `"$" not in page.content()` 或 `expect(page.content()).not.toContain('$')` 作为 `$...$` 检测；JS 模板字符串里的 `${mass.toFixed(1)}`、`${v0}` 不是数学定界符。

这只是初筛，最终还必须做交互 smoke。

### 9.1 MathJax 自检与测试口径

MathJax 会改写 DOM，因此测试必须分成三层，不要互相替代：

| 层 | 检查对象 | 应检查什么 | 不应检查什么 |
|---|---|---|---|
| raw source | 生成前/上传后读到的原始 HTML 字符串，或 create_file/edit_file 的原始内容 | `\(...\)`、`\mathrm{...}`、真正的 `$...$` 定界符、源码中是否写了 `data-physics-label` | 不要拿 MathJax 启动后的 DOM 当原始源码 |
| post-MathJax DOM | 浏览器里 MathJax 渲染后的 DOM | `mjx-container` 是否存在、`data-physics-label` 是否可定位、节点是否可见 | 不要断言 `innerHTML` 仍包含原始 `\(G\)` 或 `\mathrm{kg}` |
| visual text | 用户可见文本，如 `innerText` / `all_inner_texts()` | 是否能读到“质量、m、单位、kg”等视觉文本 | 不要断言可见文本里仍包含 LaTeX 定界符 |

Python / Playwright 测试中优先直接复制下面的 `$...$` 检测 helper。它会忽略 JS 模板插值 `${...}`：

```python
import re

def strip_html_comments(source: str) -> str:
    return re.sub(r"<!--[\s\S]*?-->", "", source)

def strip_js_template_interpolations(source: str) -> str:
    out = []
    i = 0
    while i < len(source):
        if source[i:i + 2] == "${":
            i += 2
            depth = 1
            while i < len(source) and depth > 0:
                if source[i] == "{":
                    depth += 1
                elif source[i] == "}":
                    depth -= 1
                i += 1
            continue
        out.append(source[i])
        i += 1
    return "".join(out)

def has_dollar_math_delimiter(source: str) -> bool:
    source_for_scan = strip_html_comments(strip_js_template_interpolations(source))
    return re.search(r'(^|[^\\$])\$(?!\{)(?=\S)(?:\\.|[^$\\])+\$', source_for_scan) is not None

# 可以对 page.content() 做 dollar delimiter 初筛，但不要用 "$" not in page.content()。
# spec 注释不要写 forbid=$...$，请写 forbid=dollar-math-delimiter。
content = page.content()
assert not has_dollar_math_delimiter(content), "发现真正的 $...$ 数学定界符"
```

如果要检查原始 LaTeX 源码，优先检查 `read_file` / `create_file` / `edit_file` 得到的 raw HTML 字符串；如果页面已经打开并完成 MathJax 渲染，就改用 post-MathJax DOM 或 visual text：

```python
# Raw source check: 对原始 HTML 字符串检查 LaTeX。
# raw_html 来自 read_file 结果、上传附件文本或 create_file/edit_file 入参，不是 MathJax 渲染后的 DOM。
assert r'质量 \(m\)（单位 \(\mathrm{kg}\)）' in raw_html
assert r'\(G\)' in raw_html

# Post-MathJax DOM check: MathJax 可能已把 \(G\) 改写成 <mjx-container>。
page.wait_for_timeout(1200)
g_label = page.locator('[data-physics-label="G"]').first
assert g_label.count() == 1
assert g_label.is_visible()
assert g_label.locator('mjx-container').count() > 0 or "G" in g_label.inner_text()

# Visual text check: 看用户可见文本，不查 LaTeX 源码。
label_text = " ".join(page.locator('label').all_inner_texts())
assert "质量" in label_text and "m" in label_text and "kg" in label_text
```

交互后还要做一次视觉泄漏检查。它只查用户可见文本，不替代 raw source 检查：

```python
def assert_no_visible_latex_leak(page):
    visual_text = page.locator("body").inner_text()
    forbidden = [r"\(", r"\)", r"\[", r"\]", r"\mathrm", r"\text"]
    leaked = [item for item in forbidden if item in visual_text]
    assert not leaked, f"交互后可见 LaTeX 源码泄漏: {leaked}"

# 至少触发一次会更新公式的交互，例如滑块/按钮/步骤切换。
page.locator('input[type="range"]').first.evaluate(
    """el => {
      el.value = el.max || el.value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }"""
)
page.wait_for_timeout(1200)
assert_no_visible_latex_leak(page)
```

动态受力标签建议加 `data-physics-label="G"`、`data-physics-label="F_N"`、`data-physics-label="F合"` 等非展示性属性，便于测试定位。这个建议只改善可测性；它不要求新增某个力，也不判断力的方向。

如果标签内容不变、只是跟随动画移动位置，不要在 `requestAnimationFrame` / `anime.update` 中反复 `MathJax.typesetPromise([label])`。内容创建或改变时 typeset 一次即可；后续只更新 `style.left/top`、`transform` 或 CSS2DObject 的 `position`。

动态步骤提示也要扫描。以下写法是失败项：

```js
tip.innerText = '读取 V₁';
tip.textContent = '测量 V₂';
```

应改成：

```js
await setMixedMathText(tip, '读取 \\(V_{1}\\)');
```

密度读数也不要拼 Unicode 单位：

```js
// Bad
rhoLabel.textContent = `${rho.toFixed(2)} g/cm³`;

// Good
await setDensityValue(rhoLabel, rho.toFixed(2), 'g/cm^3');
```

静态图例端点也一样：

```html
<!-- Bad -->
<span>1.2 g/cm³</span>
<span>8.0 g/cm³</span>

<!-- Good -->
<span>\(1.2\,\mathrm{g/cm^3}\)</span>
<span>\(8.0\,\mathrm{g/cm^3}\)</span>
```

Three.js/CSS2D/DOM overlay 标签也一样：

```js
// Bad
normalLabel.textContent = 'F合';
createLabel('FN');

// Good
await setForceLabel(normalLabel, 'F合');
const normalLabelObject = new CSS2DObject(await createPhysicsLabel('FN'));
```

Chart.js / Canvas 公式标签也要扫描。以下写法是失败项：

```js
ctx.fillText('B (⊙)', 10, 20);
drawVector(ctx, p0, p1, 'F_洛');
const chartOptions = {
  plugins: { legend: { labels: { text: '洛伦兹力 F_洛 (μN)' } } },
  scales: {
    x: { title: { display: true, text: '速度 (m/s)' } },
    y: { title: { display: true, text: '力 (μN)' } }
  }
};
```

应改成 Canvas/Chart.js 只画图形和纯中文标签，公式性符号放 HTML：

```html
<div class="chart-math-legend">洛伦兹力 \(F_{\text{洛}}\)（\(\mu\mathrm{N}\)）</div>
<div class="chart-axis-caption">横轴：速度 \(v\)，单位 \(\mathrm{m/s}\)</div>
<div class="chart-axis-caption">纵轴：力 \(F\)，单位 \(\mu\mathrm{N}\)</div>
```

控件/滑块 label 也要扫描。以下写法是失败项：

```html
<label>质量 \(m\) (kg)</label>
<label>速度 \(v\) (m/s)</label>
<label>磁感应强度 \(B\) (T)</label>
```

应改成：

```html
<label>质量 \(m\)（单位 \(\mathrm{kg}\)）</label>
<label>速度 \(v\)（单位 \(\mathrm{m/s}\)）</label>
<label>磁感应强度 \(B\)（单位 \(\mathrm{T}\)）</label>
```

动态重排 helper 也要扫描。以下写法是失败项：

```js
await MathJax.typesetPromise([]);
async function typeset(el) {
  await MathJax.typesetPromise(el ? [el] : []);
}
```

应改成非空根节点：

```js
await typesetMath(updatedPanel);
// 或者无法定位更新范围时
await typesetMath();
```

## 10. 不过度约束扫描

公式排版只接管物理语义内容。普通 UI 文案、选项编号、英文缩写不应被包成 MathJax。

```js
function scanNonOverconstraint(html) {
  const visibleHtml = stripScriptStyle(html);
  return {
    optionLettersMathJax: /\\\(\s*[ABCD]\s*\\\)/.test(visibleHtml),
    uiWordsMathJax: /\\\(\s*(Start|Reset|AI|HTML|CSS|SVG|Canvas)\s*\\\)/i.test(visibleHtml),
    sourceOnlyIdentifiersOk: /\b(val-vm|label-vM|const vM|vmx)\b/.test(html)
  };
}
```

如果源码里出现 `vm/vM` 但只在 CSS class、DOM id、JS 变量名中出现，不算失败。失败只针对用户画面可见的裸变量、裸单位，或把非物理 UI 文案错误包成公式。
