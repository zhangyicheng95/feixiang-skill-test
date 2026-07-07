---
name: html-authoring
description: 生成或修改单页教学交互 HTML（动画、单页课件、教学海报、教学网页）时使用，覆盖视觉设计决策与技术实现规范（配色布局、动画选型、浏览器兼容、媒体资源）。不适用于多页 PPT 课件、纯知识问答、不涉及 HTML 的场景。
---

更新时间：2026-04-21

# html-authoring

## 适用场景

- 用户要求创建交互式教学动画、单页 HTML 页面、基于 HTML 的图片/视频/海报/课件
- 用户要求修改已有 HTML 文件（改配色、改交互、改内容、改布局）
- 需要为教学场景做视觉设计决策（选配色、定布局、选动画效果）

**不适用于：**
- 纯知识讲解、教学问答等不涉及 HTML 生成的场景
- 多页 PPT 式课件（由 `courseware-*` 相关技能处理）

## 前置条件

需要以下工具可用（以实际工具清单 description 为准）：
- **检索类**：`search_papers`、`search_web`、`search_knowledge`、`read_url`
- **媒体生成类**：`generate_image`、`generate_voice`、`edit_image`
- **文件操作类**：`create_file`、`read_file`、`edit_file`
- **流程控制类**：`terminate`

## 工作流程

### 1. 理解需求与视觉定位
- 确认学科、学段、核心知识点（决定视觉基调：小学数学偏活泼，高中物理偏严谨）
- 需求模糊但可推断时，基于教学经验合理推断；不要反复追问

### 2. 设计决策（未明确指定时由 Agent 决定）
按下列顺序确定：
- **内容组织模式**（**先于布局决定**，见"内容组织模式"章节）：
  - 短内容（单屏可容纳）→ 单页滚动
  - 中等内容（3-5 个并列主区块，如"练习/答案""不同课时""不同场景"）→ **标签页切换（Tabs）**
  - 长内容（6+ 区块、或含大量列表）→ **标签页 + 折叠面板（Accordion）组合**
  - 禁止直接把大量内容摊平成一条滚动长页
- **配色方案**：从"参考配色"中选择或自定义；输出 `primary / secondary / accent / background / foreground` 5 个 Tailwind 设计令牌
- **布局结构**：左右结构（控制器 + 展示区）或上下结构（说明 + 演示）
- **排版**：最多 2 个字体家族；标题为正文 1.5–2 倍；行高 1.4–1.6
- **动画类型**：按"动画效果选择指南"选库
- **交互粒度**（见"交互粒度保留原则"章节）：用户需求中出现的每个具体数值/分类/模式都必须映射到一个独立控件，不要为"简洁"而合并

### 3. 准备素材（按需并行）
- 图片 → `generate_image`；音频 → `generate_voice` 或 Web Audio API（代码生成音效）
- 已有参考资料 → `search_web` / `search_knowledge` / `search_papers` / `read_url`
- **【关键】图片和 generate_voice 生成的音频必须拿到 URL，严禁 base64**

### 4. 生成或修改 HTML
- 首次创建 → `create_file`
- **修改已有 HTML（必做）**：
  1. 用户意图是"改/调整/优化/修复/补充/重做"现有交付物时，属于修改场景
  2. 必须先用 `read_file` 读取目标 HTML 的 `resourceId`；若用户未提供 resourceId，必须向用户确认后再动手，**禁止凭想象重写**
  3. `read_file` 成功后用 `edit_file` 增量修改，保持原配色令牌、布局骨架、控件集合稳定，只改用户要求的部分
  4. 禁止借"改一处"之机把整页重写、简化或改换风格
- 严格遵守下方"技术约束规则"

### 5. 回复用户
- 使用指南：功能说明（1-2 句）+ 操作方式（按钮/滑块/手势）
- 修改场景：列出"修改内容 + 效果变化"
- 不贴 HTML 源码、不输出下载链接、不讲技术实现细节
- 调用 `terminate` 结束

## 领域知识

### 内容组织模式（决定 HTML 骨架）

一份单页 HTML 的"总信息量"决定了骨架怎么搭。**不要把一大块内容直接摊平成单屏滚动列表**，这是单页 HTML 最常见的质量问题。

| 内容规模判据 | 骨架 | 控件 |
|---|---|---|
| 单一主题、单屏可容纳 | 单页 | 直接展示 |
| **并列多主题**（如"练习页/答案页"、"课时 1/课时 2"、"不同演示模式"） | **标签页（Tabs）** | 顶部/侧栏 tab 按钮，`showPage(id)` 切换 `.active` 类 |
| **多个同类条目**（如 10+ 练习题、词汇表、步骤列表） | **折叠面板（Accordion）** | 每条可展开/收起；带"展开全部/收起全部"按钮 |
| 既长又有并列主题 | **Tabs + Accordion 组合** | 外层 Tab 切场景，内层 Accordion 展开单题 |

**标签页最小模板：**
```html
<nav class="flex gap-2 border-b">
  <button class="tab-btn active" data-page="practice">练习</button>
  <button class="tab-btn" data-page="answer">答案解析</button>
</nav>
<section id="practice" class="page active">…</section>
<section id="answer" class="page">…</section>
<style>
  .page { display: none; }
  .page.active { display: block; }
  .tab-btn.active { border-bottom: 2px solid var(--primary); }
</style>
<script>
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn, .page').forEach(el => el.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.page).classList.add('active');
    });
  });
</script>
```

**折叠面板最小模板：**
```html
<details class="accordion-item border rounded-lg p-3 mb-2">
  <summary class="cursor-pointer font-medium">题 1：……</summary>
  <div class="mt-2">……</div>
</details>
```

**判断信号词：** 用户需求里出现以下词之一 → 必须用 Tabs 或 Accordion：
- "练习题/列表/清单" 且数量 > 5
- "练习 + 答案"、"正文 + 讲解"、"课时 1 / 课时 2"、"不同模式/不同方案"
- "梳理 N 个/N 道"（N ≥ 10）

### 交互粒度保留原则（反扁平化）

用户需求中提到的**每一个具体数值、分类、模式、选项**，都必须在 UI 上有**专属控件**，不要为"更简洁"把它们合并成通用控件。

| 需求中出现的表达 | 必须生成的控件 | **禁止**替代方案 |
|---|---|---|
| "+1 / -1 / +5 / +10 等快捷加减分" | 每个数值一个独立按钮 | 用一个通用 `+` `-` 步进器替代全部快捷值 |
| "全员 +5"、"批量操作" | 独立"批量"按钮 | 合并进单人操作 |
| "不同方案/模式/主题/难度" | `<select>` 或一组 radio | 一次只给一个默认，不给选择器 |
| "可调参数（角度/速度/数量/位置）" | `<input type="range">` 或 `<input type="number">` | 硬编码成固定参数 |
| "重置/重新开始" | 独立"重置"按钮 | 混入其他操作 |
| 多课时、多场景 | Tab/Accordion 分开 | 只做第 1 个场景 |

**判断口诀：** 如果用户用到"可以 A，也可以 B，还可以 C"这种枚举句式，**A/B/C 就是三个控件，不是一个控件的三个可能值**。

### 教学 narrative 保留规则

用户需求中出现以下词汇时，产物除了交互/动画之外，**必须同时保留教学说明段落**（不要只生成纯动画本体）：

- "教案/备课/完整课时/2 课时/教学设计"
- "学习目标/教学目标/重难点"
- "知识点讲解/原理说明"
- "分步说明/讲解流程"

这类场景的 HTML 应同时包含：
1. 顶部学习目标/知识点简介（`<h1>` + 2-4 个 `<p>` 或 `<ul>`）
2. 中部交互演示（Canvas/SVG/动画）
3. 底部分步讲解或思考题（`<ol>` 或 Accordion）

**禁止**：把教案类需求简化为"只保留动画演示、删掉文字说明"。

### 色彩系统

- 3-5 种颜色为佳：1 主色 + 2-3 中性色 + 1-2 强调色
- 根据学科选：科学-蓝绿，数学-橙紫，语文-暖色
- 对比度满足 WCAG AA
- 通过 Tailwind 设计令牌统一管理

**设计令牌实现：**
```html
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          primary: '#FF6B6B',
          secondary: '#4ECDC4',
          accent: '#f59e0b',
          background: '#ffffff',
          foreground: '#1f2937'
        }
      }
    }
  }
</script>
```

**渐变使用场景：** 标题文字渐变（hero 区）、按钮渐变（引导操作）、柔和背景渐变（营造氛围）。

### 参考配色方案（5 个）

| 方案 | 风格 | 主题 | 背景 | 文字 | 点缀 | 字体 |
|------|------|------|------|------|------|------|
| 品牌色 | 清新简约 | #A7DBAD/#0A4737 | #D3E09C/#D8FBF7 | #0D2620/#60A0A0 | #FF6421/#A1CAF9 | 无衬线 |
| 复古绿 | 严谨教育 | #2D593E | #1D422B/#EBEDD4 | #021502/#AE7645 | #DC2626/#259525 | 有衬线（宋体/思源宋体） |
| 沉稳橙 | 信息聚焦 | #FF5600 | #F4F3EC | #0C0302/#74706E | #FF5600/#FF8941 | 无衬线 |
| 暗夜 | 科技神秘 | #868686 | #000000 或 #090B2F | #FFFFFF/#E4E4E4 | #4DFF4D/#FF2E26/#FF7710 | 不限 |
| 赛博 | 科技感 | #1A243C | #000000 或 #1C0C57 | #FFFFFF/#E4E4E4 | #175FFF/#F901F7/#67F844 | 不限 |

**通用避坑：** 标题前不加各种表符号；卡片默认不加投影（按需加 `shadow-lg`）。

### 布局与微交互

- 优先 Flexbox，复杂 2D 布局用 Grid，避免 float
- 响应式：< 768px 用 rem 缩放；>= 768px 撑满视口
- 深度层级：卡片 `shadow-lg` → 悬停 `shadow-xl` → 浮动 `shadow-2xl`
- 圆角：卡片 `rounded-2xl`/`rounded-3xl`，按钮 `rounded-full`/`rounded-xl`
- 间距：内容 `gap-6`/`gap-8`，区块 `py-20`
- 悬停上浮：卡片 `translateY(-8px)` + 阴影增强；按钮 `translateY(-2px)` + 彩色阴影
- 微交互：导航栏滚动透明度变化、底部渐变线、焦点边框高亮、平滑锚点

### 动画效果选择指南

**核心原则：** 动画服务于教学，不为炫技。优先 CSS `transform` / `opacity`，时长 0.3-0.8s，目标 60fps。

| 教学目的 | 动画类型 | 推荐库 |
|---------|---------|--------|
| 引导注意力 | 页面加载/元素入场 | Anime.js |
| 展示数据变化 | 数字滚动/图表动画 | Anime.js |
| 演示过程/步骤 | 图形逐步生成 | Anime.js |
| 复杂动画序列 | 时间轴编排 | GSAP |
| 数学/科学可视化 | 动态图形/粒子 | p5.js |
| 氛围装饰 | 粒子背景 | p5.js |
| 3D 几何/函数曲面 | 3D 渲染 | Three.js（复杂）/ p5.js WEBGL（简单） |

### 技术栈

- **HTML5**：语义化结构 + Canvas 动画
- **CSS3**：Tailwind CSS + 自定义样式（渐变、悬停效果、微交互）
- **JavaScript**：原生 ES6+（无框架依赖）
- **动画库**：Anime.js / p5.js / GSAP / Three.js / D3.js / ECharts / Hanziwriter

### 技术约束规则（必须遵守）

1. **媒体资源**：严禁 base64 编码图片和音频，必须通过 `generate_image` / `generate_voice` 产出 URL 后引用
2. **外部库引用**：按习惯写常见 CDN 地址（如 cdnjs、jsdelivr）即可，系统会自动转换为内部加速地址；无需在代码中硬编码内部 CDN
3. **CSS 兼容性**：所有现代 CSS 特性必须添加 `-webkit-` 前缀以支持 Chrome >= 63
4. **响应式**：< 768px 使用 rem 缩放，>= 768px 撑满视口
5. **数学表达式**：使用 LaTeX 标准语法，并确保 MathJax 能渲染
6. **JS 中文引号**：含中文字符串用模板字符串或转义，禁止裸引号嵌套

### HTML 结构模板

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>教学动画标题</title>

  <!-- Tailwind CSS（必需） -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- 动画库（按需引入，如 Anime.js） -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js"></script>
</head>
<body class="bg-gray-50">
  <main>
    <!-- 教学内容 -->
  </main>

  <script type="module">
    // 页面交互逻辑
  </script>
</body>
</html>
```

**要求：** 语义化标签（`<main>`/`<section>`/`<article>`）、完整 ARIA、viewport meta 必需；内容中可用 emoji（🍎 🎯 🌱 等）。

**复用片段用 `<template>`：**
```html
<template id="controllerTemplate">
  <div class="controller bg-white rounded-lg p-4">
    <button id="startBtn" class="btn bg-primary text-white px-4 py-2">开始</button>
  </div>
</template>
<script>
  const template = document.getElementById('controllerTemplate');
  const clone = template.content.cloneNode(true);
  document.body.appendChild(clone);
</script>
```

### 3D 图形实现

**决策：** 简单几何体/旋转展示 → p5.js WEBGL；复杂函数曲面/自定义几何/高级材质 → Three.js。

**p5.js WEBGL 最小模板：**
```javascript
// 禁止使用这些变量名（均为 p5.js 内置函数）：sphere / box / cylinder / cone / torus / plane
let radius = 100;
let rotationX = 0;
let rotationY = 0;

function setup() {
  createCanvas(800, 600, WEBGL);
}

function draw() {
  background(245);
  ambientLight(100);
  directionalLight(255, 255, 255, 0.5, 0.5, -1);
  rotateX(rotationX);
  rotateY(rotationY);
  fill(255, 86, 0);
  noStroke();
  sphere(radius);
}

function mouseDragged() {
  rotationY += (mouseX - pmouseX) * 0.01;
  rotationX += (mouseY - pmouseY) * 0.01;
}
```

**p5.js 常见错误：** 覆盖内置函数名（`let sphere;`）、忘记 `WEBGL` 参数。

**Three.js 最小模板：**
```javascript
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf5f5f5);

const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
camera.position.set(5, 5, 5);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(800, 600);
document.getElementById('canvas-container').appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dl = new THREE.DirectionalLight(0xffffff, 0.4);
dl.position.set(10, 10, 10);
scene.add(dl);

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(2, 2, 2),
  new THREE.MeshPhongMaterial({ color: 0x3b82f6, shininess: 100 })
);
scene.add(cube);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
```

**Three.js 常见错误：** 未引 `OrbitControls`、未设光照（物体全黑）、忘记 `animate()` 循环、相机位置在原点、忘记 `controls.update()`。

### CSS 浏览器前缀（Chrome >= 63）

```css
.element {
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
}
.gradient-text {
  background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

其他需前缀属性：`transform` / `transition` / `user-select`（`box-shadow` Chrome 63 已支持，无需前缀）。

### JavaScript 中文引号处理

```javascript
// 推荐：模板字符串
description: `内容包含"引号"`

// 可用：转义
description: "内容包含\"引号\""

// 禁止：裸引号嵌套
description: "内容包含"引号""
```

### 媒体资源引用

```html
<!-- 正确：使用工具生成的 URL -->
<img src="https://example.com/generated-image.png" alt="描述">
<audio src="https://example.com/generated-audio.mp3"></audio>

<!-- 错误：base64 编码 -->
<img src="data:image/png;base64,iVBORw0KG..." alt="描述">
```

## 教学设计要点

**认知负荷：**
- 一次一个核心概念
- 5-8 个分步展示
- 渐进式信息呈现

**必备交互：** 播放/暂停/重置、前进/后退、速度调节（0.5x-2x）、进度跳转。

**认知支架：** 关键概念高亮、分步文字说明、常见误区纠正、提示帮助。

## 质量标准

**内容组织（必检）：**
- [ ] 内容 ≥ 3 个并列主题时，已使用 Tabs 分组
- [ ] 内容含 6+ 同类条目时，已使用 Accordion/折叠面板
- [ ] 未把大量内容摊平为一条长滚动页

**交互粒度（必检）：**
- [ ] 用户需求中枚举的每个具体数值/分类/模式都有独立控件
- [ ] 需求含"可选/可切换/不同"词汇时，存在 `<select>` 或 radio 组
- [ ] 需求含"参数/角度/速度/数量可调"时，存在 `<input type="range">` 或 `number`
- [ ] 需求含"教案/完整课时/多课时"时，页面同时含教学说明段落 + 交互演示

**视觉层（必检）：**
- [ ] 至少 3 个 CSS 变量（或 Tailwind 设计令牌） —— 不得硬编码所有颜色
- [ ] 至少 1 个 `@keyframes` 或 `transition` 过渡效果
- [ ] 至少 1 个 `:hover` 反馈（按钮/卡片悬停态）

**基础通用：**
- [ ] 设计决策明确（配色/布局/字体/动画类型/内容组织模式）
- [ ] 色彩对比度满足 WCAG AA
- [ ] 动画时长 0.3-0.8s，优先 `transform` + `opacity`，目标 60fps
- [ ] 所有现代 CSS 属性已加 `-webkit-` 前缀
- [ ] HTML 含 viewport meta，语义化标签使用正确
- [ ] 外部库通过 CDN 地址引用（系统会自动转换为内部加速地址），无本地离线脚本
- [ ] 无 base64 编码媒体资源
- [ ] 兼容移动端与 PC 端设备的鼠标、触摸事件
- [ ] 兼容不同分辨率的移动端与 PC 端
- [ ] 目标浏览器 Chrome >= 63

## 完整示例

**用户第 1 轮：** "做一个初中物理'力的分解'教学动画"

**Agent 第 1 轮（推理）：**
- 学段：初中；学科：物理 → 沉稳理性基调
- 设计决策：沉稳橙（`primary=#FF5600`、`background=#F4F3EC`、`foreground=#0C0302`、`accent=#FF8941`）；左右结构（左侧参数控制器、右侧矢量图动画）；Anime.js 驱动矢量箭头渐显 + 伸展
- 并行准备素材：`search_knowledge` 查询"力的分解"教学要点

（工具执行完成）

**Agent 第 2 轮：** 调用 `create_file`，按 HTML 结构模板 + 设计决策生成页面；矢量箭头在用户拖动角度/大小滑块时实时重绘。

（工具执行完成）

**Agent 第 3 轮（回复 + terminate）：**

> 已为您生成初中物理"力的分解"教学动画：
> - 左侧可调节合力的大小与方向，右侧实时显示分解后的两个分量及其夹角
> - 支持"平行四边形法则"和"三角形法则"两种演示模式切换
> - 点击"讲解"按钮可看到分步文字说明与关键概念提示

---

**用户第 2 轮：** "把主色改成蓝色"

**Agent 第 1 轮：** `read_file` 确认当前配色令牌 → `edit_file` 将 `primary` 改为 `#3B82F6`，同步调整 `accent` 的互补色。

（工具执行完成）

**Agent 第 2 轮（回复 + terminate）：**

> 已将主色调从橙色改为蓝色（`#3B82F6`），同时把点缀色调整为更柔和的 `#60A5FA`。整体视觉风格由活力偏暖转为沉稳偏冷，更贴合物理学科的理性感。
