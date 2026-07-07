# math-design 子链路（html-authoring 内置，三向布局优化版）

> 仅当 html-authoring 判定为数学场景时启用。非数学学科禁止读取本目录任何文件，禁止在 HTML 中写入 `html-authoring:math-design` 注释。
>
> 本版重点优化：在 1600:700 参考比例下一屏展示优先；L1 保持大按钮底栏优势；L2/L3 改为紧凑侧栏，保证 Stage 主演示区不被控件挤压。

## 文件导航

| 文件 | 用途 | 何时读取 |
|---|---|---|
| workflow.md（本文件） | 数学视觉工作流 + 布局/字号 + 函数绘制规范 | 数学场景首先读取 |
| color-palettes-a.md | A-色彩01~11 活力高饱和 | Phase 3 选定 A 编号后，仅读该编号段落 |
| color-palettes-b.md | B-色彩01~20 智性低饱和 | Phase 3 选定 B 编号后，仅读该编号段落 |
| visual-impact.md | 图示视觉强化协议 | Phase 4 编写演示区前 |

## 一、色彩选用工作流

```txt
Phase 1 ┃ 场景确认
  已由 html-authoring 路由判定为数学时，启用 math-design。

Phase 2 ┃ 学段判定 → 选择 pool
  - 小学 1-6 年级 / 低段算术几何 → pool A
  - 初中 7-9 / 高中 10-12 / 代数·函数·三角·数列 → pool B
  - 年级未明示：按知识点难度推断；仍不确定 → 默认 pool B

Phase 3 ┃ 机械抽选 1 套
  Step 1：提取 keyword
    keyword = 用户 prompt 中最核心的数学知识点词。
    例如：勾股定理、鸡兔同笼、圆锥、一次函数、三角函数。

  Step 2：优先查 knowledge-palette-map
    精确匹配命中即用，禁止主观换号。

  Step 3：未命中时使用 hash 兜底
    c1 = ord(keyword 第 1 字符)
    c2 = ord(keyword 末字符)
    hash = c1 × 7 + c2 × 5 + len(prompt)
    pool=A → palette_id = A-{(hash mod 11) + 1:02d}
    pool=B → palette_id = B-{(hash mod 20) + 1:02d}

  Step 4：必须在推理中声明
    抽选 ┃ keyword=<词>  pool=<A|B>  source=<table|hash>  palette_id=<X-XX>
```

### knowledge-palette-map

| keyword | pool | palette_id | keyword | pool | palette_id |
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

## 二、视觉硬性要求

- 可视区域参考比例：16:7，优先一屏展示所有交互。
- 1600×700 为主验收基准；页面必须在该比例下不产生全局滚动条。
- 内容超屏时：使用 Step Navigation、Tabs、Accordion、Popover；禁止依赖 Controls 滚动条解决。
- 演示图示必须通过色彩填充保持视觉冲击力，遵循 visual-impact.md。
- 页面采用 safe area 安全高度设计。
- grid 仅用于局部模块，不用于锁死整体页面高度。
- 禁止标题前 Emoji；具体元素用 SVG / Canvas / HTML 图形绘制。
- 色彩必须来自 Phase 3 选定 palette，并映射为 CSS 变量：
  `--primary`、`--secondary`、`--accent`、`--background`、`--foreground`。

## 三、页面基础公式

```txt
Container = Header(fixed) + Main(flex-grow:1)
Main = Stage + Controls
```

- Header 必须固定高度或自然高度，但不得挤压 Main。
- Main 必须 `flex: 1`，并承担三向布局。
- Stage 是主演示区，优先级高于 Controls。
- Controls 是控制区，只能服务演示，不得吞掉主演示空间。
- body 只允许 `overflow: hidden`。
- 唯一允许内部滚动的容器是 `#stage`，且仅在内容真实超出时使用。

## 四、三向布局选择算法

三向布局必须从 L1 / L2 / L3 中选择一种，禁止默认总是使用 L1。

```txt
c1 = ord(keyword 第 1 字符)
layout_hash = (c1 + len(prompt)) mod 3
layout = ["L1底栏", "L2左栏", "L3右栏"][layout_hash]
```

必须在推理中声明：

```txt
布局 ┃ keyword=<词>  layout_hash=<0|1|2>  layout=<L1|L2|L3>
```

### 层级例外

- 仅当算式命中 L1，但实际控件含 3 个及以上滑块/数值输入时，允许改用 L2 或 L3。
- L2 / L3 二选一算法：

```txt
side_hash = (c1 + 1) mod 2
side_hash = 0 → L2
side_hash = 1 → L3
```

- 其它情形一律按 layout_hash，不得以“简洁”“熟悉”“安全”为理由改成 L1。

## 五、三向布局定义

| 变体 | 结构 | Controls 位置 | 主要用途 |
|---|---|---|---|
| L1 底栏 | Header → Stage → Controls(bottom) | 底部 | 步骤导航、游戏操作、上一步/下一步/重置、横向按钮组 |
| L2 左栏 | Header → Controls(left) + Stage | 左侧 | 参数调节、滑块探索、选择列表、几何变量控制 |
| L3 右栏 | Header → Stage + Controls(right) | 右侧 | 演示主导、辅助参数、公式说明、状态反馈 |

## 六、L1 底栏规范

L1 是大按钮、横向操作、强展示布局。它是默认最稳定的一屏方案，但不得替代三向布局算法。

### L1 尺寸

```css
main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  min-height: 0;
}

#stage {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

#controls {
  height: 120px;
  max-height: 140px;
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 16px;
  overflow: visible;
}
```

### L1 控件

- 按钮高度：80px。
- 按钮字号：28px。
- 横向控件块数量：不超过 6 个。
- 适合放大按钮、步骤按钮、模式按钮。
- 禁止在 `#controls` 设置 `overflow-y:auto`、`overflow-y:scroll`、`overflow:auto`、`overflow:scroll`。

## 七、L2 / L3 紧凑侧栏规范

L2 / L3 不得沿用 L1 的大按钮和大字号规则。侧栏布局必须使用 compact density，保证 Stage 在 1600:700 下完整展示。

### 核心原则

```txt
Stage 优先，Controls 从属。
侧栏只放核心控件，解释内容折叠。
按钮变矮，字号降级，卡片减密。
```

### L2 / L3 Main 尺寸

```css
main {
  flex: 1;
  display: flex;
  flex-direction: row;
  gap: 12px;
  padding: 12px 16px 16px;
  min-height: 0;
}
```

### L2 / L3 Stage

```css
#stage {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
```

硬性要求：

- Stage 可视宽度不得低于 Main 宽度的 68%。
- Stage 可视高度不得低于 Main 高度的 86%。
- 主演示元素必须 `max-width: 90%; max-height: 90%`。
- 主演示元素中心必须对齐 Stage 几何中心。
- 左右留白偏差 ≤ 15%，上下留白偏差 ≤ 15%。

### L2 / L3 Controls

```css
#controls {
  width: clamp(220px, 20vw, 320px);
  max-width: 22vw;
  flex: 0 0 clamp(220px, 20vw, 320px);
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: visible;
}
```

硬性要求：

- 1600px 宽度下，侧栏宽度建议不超过 320px。
- 禁止使用原规则 `width: 26%` 作为 L2/L3 默认值。
- 禁止侧栏超过 22vw，除非 Stage 仍满足 68% 宽度要求。
- 控件块数量 ≤ 4 个。
- 超过 4 个控件块时，必须使用 Tabs / Accordion / Popover 折叠。
- 禁止在 `#controls` / `.controls` 设置任何滚动条。

### L2 左栏骨架

```html
<main>
  <aside id="controls">
    <!-- compact controls: ≤ 4 blocks -->
  </aside>
  <section id="stage">
    <!-- centered demonstration -->
  </section>
</main>
```

### L3 右栏骨架

```html
<main>
  <section id="stage">
    <!-- centered demonstration -->
  </section>
  <aside id="controls">
    <!-- compact controls: ≤ 4 blocks -->
  </aside>
</main>
```

## 八、L2 / L3 控件密度规则

侧栏不是正文区，不能使用页面正文的大字号。L2/L3 Controls 内部必须使用紧凑字号体系。

| 元素 | L1 | L2/L3 |
|---|---:|---:|
| 页面 H1 | 40px | 40px |
| 控件组标题 | 28px | 22-24px |
| 控件标签 | 28px | 18-20px |
| 数值显示 | 28px | 20-22px |
| 主按钮 | 80px 高 / 28px 字号 | 56px 高 / 20-22px 字号 |
| 次按钮 | 80px 高 / 28px 字号 | 44px 高 / 18-20px 字号 |
| 说明文字 | 28px | 16-18px，必须短句 |

### L2 / L3 常驻内容上限

侧栏最多常驻以下 4 类：

```txt
1. 参数组：滑块、步进器、选择器
2. 主操作按钮组：开始、暂停、重置、下一步
3. 当前数值 / 公式卡
4. 状态反馈 / 结果摘要
```

以下内容不得常驻展开：

- 大段知识解释。
- 多步骤推导全文。
- 多个公式推演卡片。
- 超过 2 行的操作说明。
- 与当前操作无关的背景信息。

这些内容必须放入：

```txt
Tabs / Accordion / Popover / Step Drawer
```

## 九、字号系统

### 页面级字号

- H1 = 40px / font-weight: 700 !important。
- H2 = 30px / font-weight: 600。
- H3 = 28px / font-weight: 500。
- Body = 28px / font-weight: 500。
- Caption ≥ 22px / font-weight: 300。

### 侧栏紧凑字号

仅适用于 L2/L3 的 `#controls` 内部：

```css
#controls {
  font-size: 18px;
}

#controls h2,
#controls h3 {
  font-size: 22px;
  line-height: 1.2;
}

#controls label,
#controls .label {
  font-size: 18px;
  line-height: 1.25;
}

#controls .value,
#controls .formula {
  font-size: 20px;
  line-height: 1.25;
}

#controls button {
  min-height: 44px;
  font-size: 20px;
  line-height: 1.1;
}

#controls .primary-action {
  min-height: 56px;
  font-size: 22px;
}
```

## 十、Stage 居中硬约束

所有布局通用。

```css
#stage {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.demo-root,
.function-stage,
.geometry-stage,
canvas,
svg {
  margin: auto;
  max-width: 90%;
  max-height: 90%;
}
```

主演示元素必须满足：

- 使用 flex 居中或 `margin:auto`。
- 禁止仅靠 `position:absolute; left:0; top:0` 放置主演示元素。
- 包围盒中心 = Stage 几何中心。
- 坐标系/数轴的原点或对称轴优先对齐 Stage 中心。
- SVG 使用中心原点 viewBox：`viewBox="-W/2 -H/2 W H"`。

## 十一、函数绘制规范

函数类演示必须使用固定内部坐标规范，而不是固定页面像素。页面继续响应式，函数图像通过 SVG viewBox 或 Canvas 内部坐标适配。

### L1 函数画布

适用于底栏布局，横向空间更宽。

```html
<svg
  class="function-stage function-stage-l1"
  viewBox="-700 -200 1400 400"
  preserveAspectRatio="xMidYMid meet"
></svg>
```

```css
.function-stage-l1 {
  width: min(90%, 1400px);
  aspect-ratio: 1400 / 400;
  height: auto;
  max-height: 90%;
}
```

用途：

- 一次函数。
- 数轴变化。
- 横向步骤推演。
- 游戏型横向轨道。
- 宽屏坐标关系。

### L2 / L3 函数画布

适用于侧栏布局，空间更均衡。

```html
<svg
  class="function-stage function-stage-side"
  viewBox="-500 -260 1000 520"
  preserveAspectRatio="xMidYMid meet"
></svg>
```

```css
.function-stage-side {
  width: min(90%, 1000px);
  aspect-ratio: 1000 / 520;
  height: auto;
  max-height: 90%;
}
```

用途：

- 二次函数。
- 反比例函数。
- 三角函数局部探索。
- 参数滑块控制。
- 几何辅助线 + 函数图像混合演示。

### 函数绘制安全区

禁止把曲线、标签、箭头贴边。

```txt
L1 安全绘制区：
  x: -620 至 620
  y: -160 至 160

L2/L3 安全绘制区：
  x: -430 至 430
  y: -210 至 210
```

坐标轴与标签：

- x 轴、y 轴默认穿过 viewBox 中心。
- 坐标轴线宽 2-3px。
- 主函数曲线线宽 4-6px。
- 辅助线线宽 2-3px，使用虚线或低透明度。
- 关键点半径 7-10px。
- 标签字号 L1 使用 22-26px；L2/L3 使用 18-22px。
- 标签不得遮挡关键点和曲线交点。

## 十二、几何 / Canvas / 3D 演示规范

非函数类演示也必须遵守 Stage 优先和中心对齐。

### SVG 几何

- 使用中心原点 viewBox。
- 主几何对象放在中心 80% 安全区。
- 辅助线、标注、角度弧线不得贴边。

### Canvas

- Canvas CSS 尺寸响应式，内部绘制坐标固定。
- 使用 devicePixelRatio 做高清适配。
- 主体绘制区域不得超过 canvas 内部坐标的 90%。

### 3D

- 3D 场景必须完整可见。
- 相机视角必须保证主体对象不被侧栏遮挡。
- L2/L3 中 3D 模型不得使用过宽横向构图，优先居中透视或轻微等距视角。

## 十三、控件组织规则

### 推荐控件类型

- 图标按钮用于工具动作。
- 分段控件用于模式切换。
- Toggle / Checkbox 用于二元开关。
- Slider / Stepper / Input 用于数值控制。
- Tabs / Accordion 用于隐藏非核心说明。
- Popover 用于临时帮助、公式解释、操作提示。

### 禁止

- 禁止 Controls 滚动。
- 禁止侧栏塞入完整讲义。
- 禁止侧栏按钮全部 80px。
- 禁止 L2/L3 使用 28px 正文作为控件默认字号。
- 禁止卡片套卡片。
- 禁止为了塞内容牺牲 Stage 主演示面积。

## 十四、交付硬约束

HTML 第一行必须是：

```html
<!-- html-authoring:math-design palette=<id> layout=<L1|L2|L3> -->
```

必须满足：

- palette_id 与 Phase 3 声明一致。
- layout 与 layout_hash 或层级例外声明一致。
- H1 = 40px / font-weight:700 !important。
- L1 按钮高 80px，按钮字号 28px。
- L2/L3 使用 compact 控件规范。
- L2/L3 Controls 宽度使用 `clamp(220px, 20vw, 320px)` 或等价规则。
- L2/L3 Stage 宽度不得低于 Main 宽度 68%。
- Controls 控件块数：L1 ≤ 6，L2/L3 ≤ 4。
- 超量内容必须 Tabs / Accordion / Popover 折叠。
- body 只允许 `overflow:hidden`。
- `#controls` / `.controls` 不得包含：
  - `overflow-y:auto`
  - `overflow-y:scroll`
  - `overflow:auto`
  - `overflow:scroll`
- Stage 主演示容器中心与 Stage 几何中心可视化对齐。
- terminate 前自检：1600×700 下无全局滚动条，主演示完整可见。

## 十五、1600:700 自检清单

生成或修改 HTML 后必须检查：

```txt
1. 页面是否一屏完整展示？
2. body 是否无全局滚动条？
3. L2/L3 侧栏是否 ≤ 320px 或 ≤ 22vw？
4. L2/L3 Stage 是否仍是视觉主角？
5. Controls 是否没有滚动条？
6. Controls 常驻块是否不超过上限？
7. 主演示元素是否居中？
8. SVG / Canvas / 3D 是否没有贴边？
9. 函数坐标轴是否使用中心原点？
10. 标签、按钮、公式是否没有重叠？
```

若任一项失败，必须先修改布局或控件密度，再交付。

