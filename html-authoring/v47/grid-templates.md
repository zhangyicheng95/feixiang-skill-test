# math-design 数学网格、点阵与 3D 地面网格模板

> 仅数学场景可读取。非数学场景禁止读取本文件。

本文件约束“具有数学读数或空间参照意义”的网格/点阵/地面网格。色板里的 CSS 背景网格只能作为非测量性装饰或颜色参数来源，不能直接承担读点、对齐、拖拽吸附、坐标纸、几何画布或 3D 地面。

## 读取条件

当页面实际绘制以下内容时，必须读取本文件：

- 明确要求方格线、网格线、坐标网格、坐标纸、方格纸、点阵纸
- 需要读点、定位、对齐、刻度、拖拽吸附、几何画布
- 带坐标轴/函数图像且用户明确要求“方便读点/参考线/辅助线”
- 数学 3D 几何、立体图形、体积/表面积、空间关系演示中的地面/底面参照

## 分流原则

| 场景 | 默认 | 允许的实现 | 禁止 |
|---|---|---|---|
| 坐标系/坐标轴/函数图像，用户未要求网格 | 无背景方格 | 轴线、短刻度、标签、点/线/曲线 | CSS 网格背景、SVG/Canvas 全幅网格、网格切换入口 |
| 坐标系/函数图像，用户明确要求方格 | 有完整坐标网格 | SVG/Canvas `grid-layer`，与轴共用 `origin/unit/scale` | CSS `linear-gradient` 伪装坐标网格 |
| 统计图明确要求参考线 | 有图表参考线 | SVG/Canvas/chart-layer，按图表比例尺绘制 | 把统计参考线误做成坐标纸 |
| 方格纸/点阵纸/几何画布/拖拽吸附 | 有方格或点阵 | SVG/Canvas `grid-layer` 或 `dot-layer`，吸附逻辑同源 | DOM/CSS 背景与拖拽坐标分离 |
| 数学 3D 几何 | 有 3D 地面网格 | Three.js `GridHelper` 或地面线段对象 | 页面平面 CSS 网格背景 |

## CSS、SVG、Canvas、Three.js 的边界

- CSS `background-image` / `linear-gradient` / `repeating-linear-gradient`：只用于非测量性视觉底纹，例如普通模块、卡片、非读数背景。不得用于坐标读点、几何对齐、拖拽吸附或 3D 地面。
- SVG：适合静态或轻交互的坐标系、函数图、几何画布、点阵纸。优势是 DOM 可检查、层级清晰、轴和网格天然可同源。
- Canvas：适合大量点、动态拖拽、频繁重绘、模拟器。必须把 `origin/unit/scale` 作为唯一状态源，每次重绘先画网格再画数据。
- Three.js：适合数学 3D 几何。地面网格必须是 3D 场景对象，随相机透视变化，不是页面背景。

## SVG 坐标网格模板

适用于带坐标轴、函数图、坐标纸、可读点的平面直角坐标系。所有点、线、轴、刻度必须使用同一套换算函数。

```html
<svg id="math-canvas" class="math-svg" viewBox="0 0 640 640" role="img" aria-label="数学坐标图">
  <rect class="paper-bg" x="0" y="0" width="640" height="640" rx="16"></rect>
  <g id="grid-layer" class="grid-layer" aria-hidden="true"></g>
  <g id="axis-layer" class="axis-layer"></g>
  <g id="data-layer" class="data-layer"></g>
  <g id="label-layer" class="label-layer"></g>
</svg>
```

```js
const SVG_SIZE = 640;
const ORIGIN = { x: 320, y: 320 };
const UNIT = 40;
const RANGE = 7;

function sx(x) {
  return ORIGIN.x + x * UNIT;
}

function sy(y) {
  return ORIGIN.y - y * UNIT;
}

function line(className, x1, y1, x2, y2) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  el.setAttribute('class', className);
  el.setAttribute('x1', x1);
  el.setAttribute('y1', y1);
  el.setAttribute('x2', x2);
  el.setAttribute('y2', y2);
  return el;
}

function buildCoordinateGrid() {
  const grid = document.getElementById('grid-layer');
  grid.replaceChildren();
  for (let i = -RANGE; i <= RANGE; i += 1) {
    const x = sx(i);
    const y = sy(i);
    grid.appendChild(line('grid-line grid-line-v', x, sy(-RANGE), x, sy(RANGE)));
    grid.appendChild(line('grid-line grid-line-h', sx(-RANGE), y, sx(RANGE), y));
  }
}

function buildAxes() {
  const axis = document.getElementById('axis-layer');
  axis.replaceChildren(
    line('axis-line x-axis', sx(-RANGE), sy(0), sx(RANGE), sy(0)),
    line('axis-line y-axis', sx(0), sy(-RANGE), sx(0), sy(RANGE))
  );
}
```

```css
.math-svg {
  width: min(86vmin, 640px);
  aspect-ratio: 1 / 1;
  display: block;
}
.paper-bg { fill: var(--stage-bg, #F7FDF6); }
.grid-line {
  stroke: var(--grid-color, rgba(37, 31, 32, 0.22));
  stroke-width: 1.25;
  vector-effect: non-scaling-stroke;
}
.axis-line {
  stroke: #251F20;
  stroke-width: 2.2;
  vector-effect: non-scaling-stroke;
}
```

**对齐硬约束：**

- `sx(0) === ORIGIN.x`，`sy(0) === ORIGIN.y`，原点是网格交点。
- x 轴的 y 坐标必须等于某条水平网格线的 y；y 轴的 x 坐标必须等于某条垂直网格线的 x。
- 轴、刻度、标签、函数曲线、点位、辅助线都调用 `sx()` / `sy()`，不得各自写一套 `left/top`。

## 标准坐标轴组件加网格

若已按 `manipulatives.md` 使用 `.standard-axis`，不要改 6 个标准 path。显式要求方格时，在同一个 SVG 内、6 个标准 path 之前插入网格层，围绕 `AXIS_CENTER` 对称生成。

```js
function line(className, x1, y1, x2, y2) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  el.setAttribute('class', className);
  el.setAttribute('x1', x1);
  el.setAttribute('y1', y1);
  el.setAttribute('x2', x2);
  el.setAttribute('y2', y2);
  return el;
}

const AXIS_SIZE = 308.0001;
const AXIS_CENTER = 154.082;
const UNIT = 22;
const STEPS = 6;

function axisGridPosition(n) {
  return AXIS_CENTER + n * UNIT;
}

function buildStandardAxisGrid(svg) {
  const grid = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  grid.setAttribute('id', 'grid-layer');
  grid.setAttribute('class', 'grid-layer');
  for (let i = -STEPS; i <= STEPS; i += 1) {
    const p = axisGridPosition(i);
    grid.appendChild(line('grid-line grid-line-v', p, axisGridPosition(-STEPS), p, axisGridPosition(STEPS)));
    grid.appendChild(line('grid-line grid-line-h', axisGridPosition(-STEPS), p, axisGridPosition(STEPS), p));
  }
  svg.insertBefore(grid, svg.firstElementChild);
}
```

## SVG 点阵纸与几何画布模板

适用于平面图形、拖拽顶点、等底等高三角形、图形变换等。点阵可作为几何画布背景，但仍必须是 SVG 图层，不是 CSS 背景。

```html
<svg id="geometry-board" viewBox="0 0 720 480" role="img" aria-label="点阵几何画布">
  <rect class="paper-bg" width="720" height="480"></rect>
  <g id="dot-layer" class="dot-layer" aria-hidden="true"></g>
  <g id="shape-layer" class="shape-layer"></g>
  <g id="handle-layer" class="handle-layer"></g>
</svg>
```

```js
const BOARD = { width: 720, height: 480 };
const GRID = { originX: 60, originY: 420, unit: 24 };

function gx(x) {
  return GRID.originX + x * GRID.unit;
}

function gy(y) {
  return GRID.originY - y * GRID.unit;
}

function snapPoint(px, py) {
  return {
    x: Math.round((px - GRID.originX) / GRID.unit),
    y: Math.round((GRID.originY - py) / GRID.unit)
  };
}

function drawDotGrid() {
  const layer = document.getElementById('dot-layer');
  layer.replaceChildren();
  for (let x = 0; x <= 25; x += 1) {
    for (let y = 0; y <= 16; y += 1) {
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('class', 'grid-dot');
      dot.setAttribute('cx', gx(x));
      dot.setAttribute('cy', gy(y));
      dot.setAttribute('r', '1.7');
      layer.appendChild(dot);
    }
  }
}
```

**几何画布规则：**

- 用户只要求“平面图形/几何变换”时，可用点阵或方格辅助，但点、线、顶点拖拽必须与网格同源。
- 用户没有要求坐标轴时，不要自动添加 x/y 轴。
- 拖拽吸附只能调用 `snapPoint()`；不能让视觉网格和吸附格距分离。

## Canvas 动态网格模板

适用于大量动态元素或高频拖拽。Canvas 必须每帧按同一参数先画网格，再画轴/图形/标签。

```js
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const state = {
  origin: { x: 320, y: 320 },
  unit: 40,
  range: 7
};

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function cx(x) {
  return state.origin.x + x * state.unit;
}

function cy(y) {
  return state.origin.y - y * state.unit;
}

function drawCanvasGrid() {
  ctx.save();
  ctx.strokeStyle = 'rgba(37,31,32,0.22)';
  ctx.lineWidth = 1.25;
  for (let i = -state.range; i <= state.range; i += 1) {
    ctx.beginPath();
    ctx.moveTo(cx(i), cy(-state.range));
    ctx.lineTo(cx(i), cy(state.range));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx(-state.range), cy(i));
    ctx.lineTo(cx(state.range), cy(i));
    ctx.stroke();
  }
  ctx.restore();
}

function drawCanvasAxes() {
  ctx.save();
  ctx.strokeStyle = '#251F20';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(cx(-state.range), cy(0));
  ctx.lineTo(cx(state.range), cy(0));
  ctx.moveTo(cx(0), cy(-state.range));
  ctx.lineTo(cx(0), cy(state.range));
  ctx.stroke();
  ctx.restore();
}
```

Canvas 自检：`state.origin.x % state.unit` 不要求为 0；只要求网格线由 `origin + n * unit` 生成，轴线也由 `origin` 生成，因此轴必然落在网格线上。

## Three.js 标准地面网格模板

适用于数学 3D 几何、立体图形、体积/表面积、空间关系。地面网格必须是 3D 对象，不能写在页面 CSS 背景上。

```js
function createStandardGroundGrid(scene, opts = {}) {
  const size = opts.size ?? 12;
  const divisions = opts.divisions ?? 24;
  const majorColor = opts.majorColor ?? 0x5f8a76;
  const minorColor = opts.minorColor ?? 0xb8cbbd;
  const fillColor = opts.fillColor ?? 0xf7fdf6;

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshBasicMaterial({
      color: fillColor,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide
    })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.002;
  scene.add(ground);

  const grid = new THREE.GridHelper(size, divisions, majorColor, minorColor);
  grid.position.y = 0;
  grid.material.transparent = true;
  grid.material.opacity = 0.46;
  scene.add(grid);

  return { ground, grid };
}
```

3D 自检：

- `renderer.domElement` 或 `#stage` 不得设置 CSS `background-image` 网格。
- 几何体底面、投影、测量线以 `y=0` 地面为参照；相机和 OrbitControls 的 target 指向地面附近。
- 地面网格颜色来自当前 palette 的浅色/边框色或其数值化结果；不要引入外站贴图。
- 数学 3D 优先 Three.js；若使用 p5 WEBGL 或 SVG 伪 3D，仍必须用对应 3D/透视场景对象或 SVG 地面网格层表达“地面”，不能用页面平铺背景。

## 从色板 CSS 网格转为数学图层参数

色板段落中的网格通常写成：

```css
linear-gradient(#E0E0E0 1px, transparent 1px),
linear-gradient(90deg, #DADADA 1px, transparent 1px);
background-size: 30px 30px;
```

当它只作装饰，可保留为 CSS。若用户需要数学网格，必须转为参数：

- `#E0E0E0` / `#DADADA` → `--grid-color` 或 Three.js `minorColor`
- `1px` → SVG/Canvas `stroke-width`
- `30px 30px` → `UNIT = 30` 或按舞台尺寸换算后的 `unit`
- `background-color` → SVG `paper-bg` / Canvas 背景 / Three.js `ground` fill

转换后不得保留原 CSS 网格背景，避免出现图层错位。

## 交付自检

- 默认坐标轴/函数图/图表轴线场景：无 CSS 网格背景、无 `grid-layer`、无网格切换入口；轴线、短刻度、标签、数据图形清晰可见。
- 显式坐标方格：横线和竖线都真实渲染；网格、轴、刻度、点/线/曲线同源；x/y 轴落在网格线上；网格线肉眼可见但不压过数据。
- 点阵/几何画布：所有顶点、拖拽手柄、吸附逻辑都使用同一 `origin/unit/scale`。
- 统计参考线：按图表比例尺绘制，不误伤柱形/折线/分箱标签。
- 数学 3D：没有页面平面 CSS 网格；3D 场景中存在地面网格对象，模型与地面关系清楚。
