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
```

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
  document.getElementById('force-chart-y-caption'),
  '纵轴：力 \\(F\\)，单位 \\(\\mu\\mathrm{N}\\)'
);
```

不要写：

```js
ctx.fillText('B (⊙)', 10, 20);
drawVector(ctx, start, end, 'F_洛');
new Chart(ctx, {
  data: { datasets: [{ label: '洛伦兹力 F_洛 (μN)' }] },
  options: { scales: { y: { title: { display: true, text: '力 (μN)' } } } }
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

async function setForceLabel(el, labelOrLatex) {
  await setFormula(el, toPhysicsLabelLatex(labelOrLatex));
}

async function createPhysicsLabel(labelOrLatex, className = 'math-label force-label') {
  const el = document.createElement('div');
  el.className = className;
  el.dataset.physicsLabel = 'true';
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

如果教研或题目明确要显示 `F洛`、`FN`、`F合` 等名称，只做排版归一，不借机改方向、增删力或替换求合力方法。未列入映射表的标签，优先让调用方传入明确 LaTeX，例如 `F_{\\text{电}}`。

## 9. 源码扫描自检

交付前至少扫描以下反模式：

```js
function scanFormulaTypographySource(html) {
  return {
    hasDollarMath: /(^|[^\\])\$[^$]+\$/.test(html),
    hasUnicodeSuperSub: /[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎]/.test(html),
    hasSubSupTags: /<(sub|sup)\b/i.test(html),
    hasEmptyTypesetRoot: /typesetPromise\s*\(\s*\[\s*\]\s*\)|typesetPromise\s*\(\s*[^?;\n]+\?\s*\[[^\]]+\]\s*:\s*\[\s*\]\s*\)|typeset\s*\([^)]*\)\s*\{[\s\S]{0,240}\?\s*\[[^\]]+\]\s*:\s*\[\s*\]/.test(html),
    hasCanvasFormulaText: /fillText\s*\(\s*['"`][^'"`]*(v[mM]|v0|P_x|p[mM]|m\/s|kg\/m|F(?:_洛|_合|洛|N|n|合|net|_G_N)|B\s*[\(（]|E\s*[\(（]|μN|\\mu|\\mathrm\{[NT]\}|力\s*[\(（]|磁场\s*[\(（])[^'"`]*['"`]/.test(html),
    hasChartCanvasFormulaLabels: /(label|text|title)\s*:\s*['"`][^'"`]*(F_洛|F_合|F洛|F合|Fnet|v0|v_0|B\s*[\(（]|E\s*[\(（]|μN|\\mu|m\/s|\\mathrm\{[NT]\}|力\s*[\(（]|磁场\s*[\(（])[^'"`]*['"`]/.test(html),
    hasBareVmInVisibleTemplate: />[^<]*(vm|vM|v0|m\/s|kg\/m3|kg\/m³)[^<]*</.test(html),
    hasBareForceLabelAssignment: /(textContent|innerText)\s*=\s*['\"`](F洛|FN|Fn|F合|Fnet|F_G_N|v|B|E)['\"`]/.test(html),
    hasBareForceCreateLabel: /create(Label|PhysicsLabel|TextLabel)?\s*\(\s*['\"`](F洛|FN|Fn|F合|Fnet|F_G_N|v|B|E)['\"`]/.test(html)
  };
}
```

这只是初筛，最终还必须做交互 smoke。

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
  scales: { y: { title: { display: true, text: '力 (μN)' } } }
};
```

应改成 Canvas/Chart.js 只画图形和纯中文标签，公式性符号放 HTML：

```html
<div class="chart-math-legend">洛伦兹力 \(F_{\text{洛}}\)（\(\mu\mathrm{N}\)）</div>
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
function stripScriptStyle(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');
}

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
