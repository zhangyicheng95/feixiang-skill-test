# math-design 数学单页 HTML 工作流

> 仅当 `html-authoring` 已判定为 K12 数学场景时启用。非数学场景禁止读取本目录，禁止写入 `html-authoring:math-design` 注释。
>
> 目标：在发布页真实可视区域内生成完整、居中、可操作的数学演示。禁止用裁切内容的方式换取“无滚动条”。

## 文件导航

| 文件 | 用途 | 读取时机 |
|---|---|---|
| `workflow.md` | 数学页面核心工作流 | 数学场景首先读取 |
| `color-palettes-a.md` | 小学 A-01 至 A-11 色板 | 选定 A 编号后仅读对应段落 |
| `color-palettes-b.md` | 初高中 B-01 至 B-20 色板 | 选定 B 编号后仅读对应段落 |
| `visual-impact.md` | 图示视觉强化规则 | 编写 Stage 前读取 |

## 一、执行顺序

严格按以下顺序执行：

```txt
1. 提取数学知识点与学段
2. 机械选择 palette
3. 机械选择 L1/L2/L3 布局
4. 估算真实可用空间和内容预算
5. 创建页面骨架
6. 创建可响应缩放的演示主体
7. 接通全部交互和教学反馈
8. 在 1600×700、1366×768、1280×720 下检查
9. 修复全部溢出、遮挡、空按钮后交付
```

优先级从高到低：

```txt
内容完整可见
> 核心交互可操作
> Stage 保持视觉主体
> 无全局滚动条
> 固定字号和装饰效果
```

若规则发生冲突，必须缩小内容、减少同时展示数量、折叠次要信息或切换步骤，不得裁掉主体。

## 二、色板选择

### 2.1 学段与色池

- 小学 1-6 年级、低段算术和基础几何：pool A。
- 初中、高中、代数、函数、三角、数列：pool B。
- 年级不明确时按知识点难度判断；仍不确定时使用 pool B。

### 2.2 知识点映射

优先精确匹配下表；命中后禁止主观换号。

| keyword | pool | palette | keyword | pool | palette |
|---|---|---|---|---|---|
| 鸡兔同笼 | A | A-06 | 勾股定理 | B | B-04 |
| 表内乘法 | A | A-03 | 一次函数 | B | B-09 |
| 圆的周长 | A | A-08 | 二次函数 | B | B-14 |
| 长方体 | A | A-04 | 方程组 | B | B-07 |
| 平行四边形 | A | A-09 | 等差数列 | B | B-11 |
| 平均数 | A | A-02 | 阴影面积 | B | B-15 |
| 植树问题 | A | A-07 | 数轴 | B | B-20 |
| 相遇问题 | A | A-10 | 一元一次方程 | B | B-03 |
| 圆锥 | A | A-05 | 因式分解 | B | B-17 |
| 面动成体 | A | A-11 | 圆周角 | B | B-05 |
| 概率（小学） | A | A-06 | 概率（初高中） | B | B-18 |
| 单位进率 | A | A-04 | 绝对值 | B | B-12 |
| 分数加减 | A | A-09 | 全等三角形 | B | B-06 |
| 时分秒 | A | A-02 | 立体几何 | B | B-10 |
| 平移旋转 | A | A-05 | 三角函数 | B | B-13 |
| 表面积展开图 | A | A-01 | 数列求和 | B | B-08 |

未命中时使用：

```txt
c1 = ord(keyword 第一个字符)
c2 = ord(keyword 最后一个字符)
hash = c1 × 7 + c2 × 5 + len(prompt)
pool A: palette = A-{(hash mod 11) + 1:02d}
pool B: palette = B-{(hash mod 20) + 1:02d}
```

生成前声明：

```txt
抽选 ┃ keyword=<词> pool=<A|B> source=<table|hash> palette_id=<X-XX>
```

修改已有 HTML 时保留原 palette，除非用户明确要求更换。

### 2.3 色彩落地

只读取选中编号对应的色板段落，并映射为：

```css
:root {
  --primary: ...;
  --secondary: ...;
  --accent: ...;
  --background: ...;
  --foreground: ...;
}
```

禁止再引入与色板冲突的主色。状态色可在保证对比度的前提下补充。

## 三、布局选择

### 3.1 三向布局

| 布局 | 结构 | 适用内容 |
|---|---|---|
| L1 | Header → Stage → Controls | 步骤导航、少量横向按钮、演示主导 |
| L2 | Header → Controls + Stage | 多参数、滑块、选择列表 |
| L3 | Header → Stage + Controls | 演示主导、辅助参数与公式 |

选择算法：

```txt
c1 = ord(keyword 第一个字符)
layout_hash = (c1 + len(prompt)) mod 3
layout = [L1, L2, L3][layout_hash]
```

生成前声明：

```txt
布局 ┃ keyword=<词> layout_hash=<0|1|2> layout=<L1|L2|L3>
```

仅当 L1 实际包含 3 个及以上滑块或数值输入时，可改用侧栏：

```txt
(c1 + 1) mod 2 = 0 → L2
(c1 + 1) mod 2 = 1 → L3
```

### 3.2 页面骨架

```css
html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
}

body {
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

header {
  flex: 0 0 auto;
}

main {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
}

#stage {
  min-width: 0;
  min-height: 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

`overflow:hidden` 只能作为最终防护，不能作为内容适配手段。设置后仍必须证明所有核心内容位于 Stage 内。

## 四、真实空间预算

发布页可能存在站点顶栏或 iframe，不能假设浏览器窗口高度全部属于生成页面。所有尺寸必须基于当前文档的 `window.innerHeight` 和 Stage 实际尺寸。

### 4.1 L1 底栏

```css
main {
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 1.5vh, 16px);
  padding: clamp(10px, 2vh, 20px);
}

#stage {
  flex: 1 1 auto;
}

#controls {
  flex: 0 0 auto;
  min-height: 64px;
  max-height: min(120px, 17vh);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}
```

- L1 主按钮目标高度 80px，但可用 `clamp(56px, 10vh, 80px)`。
- 控件超过 6 个时必须分组、折叠或采用步骤导航。
- Header、Main padding、gap、Controls 的总高度不得超过视口高度的 34%。

### 4.2 L2/L3 侧栏

```css
main {
  display: flex;
  flex-direction: row;
  gap: 12px;
  padding: 12px 16px 16px;
}

#stage {
  flex: 1 1 auto;
}

#controls {
  flex: 0 0 clamp(220px, 20vw, 320px);
  width: clamp(220px, 20vw, 320px);
  max-width: 22vw;
  min-height: 0;
}
```

- Stage 宽度不得低于 Main 的 68%。
- 侧栏常驻控件块不得超过 4 个。
- 主按钮 56px、20-22px 字号；次按钮 44px、18-20px 字号。
- 超量说明使用 Tabs、Accordion、Popover，不使用 Controls 滚动条。

## 五、Stage 内容适配

### 5.1 必须使用单一演示根节点

```html
<section id="stage">
  <div id="demo-root">
    <!-- SVG、Canvas、卡片或交互主体 -->
  </div>
</section>
```

```css
#demo-root {
  box-sizing: border-box;
  width: min(94%, 1200px);
  height: min(92%, 640px);
  max-width: 94%;
  max-height: 92%;
  min-width: 0;
  min-height: 0;
  margin: auto;
}
```

禁止让多个无共同父节点的绝对定位元素各自争夺 Stage 空间。

### 5.2 内容完整性硬约束

最终状态必须同时满足：

```txt
demoRoot.scrollWidth  <= stage.clientWidth
demoRoot.scrollHeight <= stage.clientHeight
demoRect.left   >= stageRect.left
demoRect.right  <= stageRect.right
demoRect.top    >= stageRect.top
demoRect.bottom <= stageRect.bottom
```

还必须检查：

- 初始状态。
- 内容最多的步骤。
- 动画位移最大的中间状态。
- 公式显示后的状态。
- MathJax 排版完成后的状态。
- 窗口缩放后的状态。

任何一项失败，按以下顺序修复：

```txt
1. 减少同时展示数量
2. 改用分页、步骤或代表性样本
3. 缩小 gap、padding、标题和次要文字
4. 使用响应式尺寸和 aspect-ratio
5. 对整个 demo-root 等比缩放
6. 最后才允许 Stage 局部滚动
```

禁止直接添加 `overflow:hidden` 结束修复。

### 5.3 自动等比缩放

固定内部坐标内容应使用统一缩放器：

```js
function fitDemo() {
  const stage = document.getElementById('stage');
  const demo = document.getElementById('demo-root');
  if (!stage || !demo) return;

  demo.style.transform = 'none';
  const scale = Math.min(
    1,
    (stage.clientWidth * 0.94) / demo.scrollWidth,
    (stage.clientHeight * 0.92) / demo.scrollHeight
  );

  demo.style.transformOrigin = 'center center';
  demo.style.transform = `scale(${scale})`;
}

window.addEventListener('resize', fitDemo);
window.addEventListener('load', () => requestAnimationFrame(fitDemo));
```

若 MathJax 改变内容尺寸，在 `MathJax.typesetPromise()` 完成后再次调用 `fitDemo()`。

注意：缩放器用于固定画布或复杂卡片组。普通响应式布局应优先使用 CSS 自适配。

## 六、SVG、Canvas 与几何绘制

### 6.1 SVG

每个 SVG 必须直接命中有效选择器：

```html
<svg id="animation-svg"
     viewBox="-400 -250 800 500"
     preserveAspectRatio="xMidYMid meet"></svg>
```

```css
#animation-svg {
  display: block;
  width: 94%;
  height: 92%;
  max-width: 94%;
  max-height: 92%;
}
```

硬性要求：

- CSS 选择器必须与真实 `id` 或 `class` 一致。
- 禁止给不存在的 `#svg-container` 设置尺寸，却直接把 SVG 放在 Stage。
- 优先使用中心原点 viewBox。
- 主体对象位于 viewBox 中心 80% 安全区。
- 动画最大位移后仍不得越出 viewBox。
- 公式浮层和标签也计入可视边界检查。

### 6.2 Canvas

- CSS 尺寸使用 `width:100%; height:100%` 或受限的 `aspect-ratio`。
- 内部像素按 `devicePixelRatio` 放大。
- resize 后重新设置画布并重绘。
- 主体绘制不得超过内部坐标 90%。

### 6.3 函数图像

L1 建议：

```html
<svg class="function-stage"
     viewBox="-700 -200 1400 400"
     preserveAspectRatio="xMidYMid meet"></svg>
```

L2/L3 建议：

```html
<svg class="function-stage"
     viewBox="-500 -260 1000 520"
     preserveAspectRatio="xMidYMid meet"></svg>
```

- 坐标轴默认穿过中心。
- 曲线线宽 4-6px，辅助线 2-3px。
- 标签不得贴边、遮挡关键点或曲线交点。

## 七、卡片和大量对象

### 7.1 数量预算

禁止把教学数据总量直接等同于同时渲染数量。

例如“35 个头”不代表必须同时绘制 35 张卡片。可以显示：

```txt
代表性卡片 + 数量徽标
分组图标 + “×N”
分页或逐步增加
抽样展示 + 统计面板
```

卡片布局必须满足：

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  gap: clamp(6px, 1vh, 14px);
  max-width: 100%;
  max-height: 100%;
}
```

- 禁止固定 `height:160px` 后无视实际行数。
- 优先使用 `aspect-ratio`、`clamp()` 和动态列数。
- 预计两行以上时，必须先计算总高度。
- 结果横幅、公式面板等绝对定位层不得覆盖主体。

### 7.2 绝对定位

绝对定位仅用于角标、短提示和临时反馈。以下内容不得同时绝对定位在 Stage：

- 大型公式卡。
- 长结果横幅。
- 主体卡片网格。
- 多行教学说明。

必须为浮层预留安全区，或在显示浮层时缩小/移动主体。

## 八、字号与密度

### 8.1 页面字号

- H1 基准 40px、700；允许 `clamp(30px, 5vh, 40px)` 防止挤压。
- H2 30px。
- H3 26-28px。
- 主体正文 24-28px。
- Caption 不低于 18px。

### 8.2 控件字号

| 元素 | L1 | L2/L3 |
|---|---:|---:|
| 主按钮 | 56-80px 高 / 24-28px | 56px 高 / 20-22px |
| 次按钮 | 48-72px 高 / 22-26px | 44px 高 / 18-20px |
| 标签 | 22-28px | 18-20px |
| 说明 | 20-26px | 16-18px |

固定字号不得导致核心内容被裁切。优先缩小非核心说明，数学公式和主要读数保持清晰。

## 九、交互与教学闭环

- 每个可视按钮和可点击元素必须有事件处理器。
- 用户操作后必须产生可观察变化。
- 模拟器必须包含开始、暂停、重置和状态显示。
- 答题类必须包含提交/检查、结果反馈、重置，以及错题重做或答案入口。
- 多步骤演示必须允许前进、后退或重置。
- 动画结束后控件状态必须可恢复。
- 用户要求的每个参数、模式和分类必须有对应控件。

## 十、发布标记

HTML 第一行必须是：

```html
<!-- html-authoring:math-design palette=<id> layout=<L1|L2|L3> -->
```

随后才是 `<!DOCTYPE html>`。

注释中的 palette 和 layout 必须与实际声明、CSS 和 DOM 一致。

## 十一、自动验收

### 11.1 DOM 溢出检测

交付前运行等价检查：

```js
function auditLayout() {
  const stage = document.getElementById('stage');
  const demo = document.getElementById('demo-root')
    || stage?.querySelector('svg, canvas, .demo-container, .level-card');
  if (!stage || !demo) return { pass: false, reason: 'missing-stage-or-demo' };

  const s = stage.getBoundingClientRect();
  const d = demo.getBoundingClientRect();
  const tolerance = 2;

  return {
    pass:
      d.left >= s.left - tolerance &&
      d.right <= s.right + tolerance &&
      d.top >= s.top - tolerance &&
      d.bottom <= s.bottom + tolerance &&
      demo.scrollWidth <= stage.clientWidth + tolerance &&
      demo.scrollHeight <= stage.clientHeight + tolerance,
    stage: { width: s.width, height: s.height },
    demo: { width: d.width, height: d.height },
    scroll: { width: demo.scrollWidth, height: demo.scrollHeight }
  };
}
```

`pass:false` 时禁止交付。

### 11.2 必测视口

至少检查：

```txt
1600 × 700
1366 × 768
1280 × 720
```

每个视口检查：

1. 页面无全局横向或纵向滚动条。
2. Stage 主体完整可见，没有被边界切断。
3. 内容最多的步骤仍完整可见。
4. SVG/Canvas 的真实选择器已生效。
5. MathJax 完成后公式没有撑破容器。
6. 卡片数量增加后没有超出 Stage。
7. 结果横幅、公式卡和状态框没有遮挡主体。
8. Controls 没有滚动条，且按钮全部可见。
9. 标签、公式、输入框和按钮没有重叠。
10. 所有按钮均可用，并形成教学闭环。

## 十二、禁止事项

- 禁止用 `overflow:hidden` 掩盖超出边界的内容。
- 禁止只验证初始状态，不验证内容最多的步骤。
- 禁止假设浏览器窗口高度等于生成页面可用高度。
- 禁止固定大卡片尺寸后渲染多行对象。
- 禁止 SVG 的 CSS 选择器与真实 DOM 不一致。
- 禁止使用绝对定位堆叠多个大型内容块。
- 禁止 Controls 滚动。
- 禁止空按钮、无反馈操作和无法重置的动画。
- 禁止未通过三种视口检查就交付。

## 十三、交付前声明

terminate 前必须确认：

```txt
路由 ┃ math-design
抽选 ┃ keyword=... pool=... source=... palette_id=...
布局 ┃ layout_hash=... layout=...
适配 ┃ 1600×700=pass 1366×768=pass 1280×720=pass
状态 ┃ initial=pass max-content=pass mathjax=pass animation=pass
交互 ┃ buttons=pass reset=pass feedback=pass
```

任一项不是 `pass`，继续修改，不得交付。
