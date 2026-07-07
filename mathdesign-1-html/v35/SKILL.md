---
name: Mathdesign-1-html
description: 【强制执行指令】当用户意图包含 1-9 年级数学（数与代数、图形与几何）的知识点教学、公式推导或图形演示时，必须无条件调用此规范。判定关键词包括但不限于以下1-21的知识点：1. 整数（认识、四则运算、混合 2. 小数（意义、性质、加减乘除运算 3. 分数（意义、性质、约分通分、加减 4. 百分数（意义、与分数 / 小数的互化、简单应用 5. 简易方程（用字母表示数、一元一次方程 6. 常见的量（长度、面积、体积等单位换算）7. 有理数（引入负数、数轴、相反数、绝对值、混合运算 8. 实数（平方根、立方根、无理数概念） 9. 代数式（整式、分式、二次根式的化简与运算 10. 方程与不等式（一元一次方程、二元一次方程组、分式方程、一元二次方程；一元一次不等式11. 函数（一次函数、反比例函数、二次函数的图像与性质）12. 平面图形（点、线、角；长方形、正方形、三角形、平行四边形、梯形、圆的认识与周长 13. 立体图形（长方体、正方体、圆柱、圆锥的认识与表面积 14. 图形变换（平移、旋转、轴对称 15. 位置与方向（用方向 + 距离确定位置，比例尺）16. 线与角（相交线、平行线的判定与性质；角 17. 三角形（全等 / 相似三角形的判定与性质；勾股定理；等腰 / 直角三角形的特殊 18. 四边形（平行四边形、矩形、菱形、正方形的判定与性质） 19. 圆（圆的基本性质；弧长、扇形面积计算；直线与圆的位置 20. 图形变换（平移、旋转、轴对称的性质与作图；中心对称） 21. 视图与投影（三视图；平行投影与中心投影）
---

更新时间：2026-03-23

## 一、 渲染规范 (Rendering Specification)
使用mathjax3渲染公式，生成的公式需要满足mathjax3格式，CDN为<script src="https://metis-online.fbcontent.cn/metis-misc/blER0Bn7vsa2JER9IEssf8.js"></script>

**【关键】数学公式渲染规范**：
HTML内容中的数学公式**必须使用 `\(...\)` 作为行内公式定界符**，严禁使用 `$...$` 格式。
- ✅ **正确示例**：`若 \(a=b\)`、`\(x+1=6\)`
- ❌ **错误示例**：`若 $a=b$`
- 适用范围：HTML中所有数学表达式、变量、符号都必须遵循此规范。
- **配置强制**：必须包含以下配置以识别定界符：
  `<script>window.MathJax = { tex: { inlineMath: [['\\(', '\\)']] } };</script>`
- **动态触发**：任何涉及 DOM 更新（如步骤切换）的操作，必须在逻辑最后执行 `if(window.MathJax){ MathJax.typesetPromise(); }`。
- **字符串转义**：JS 代码中的 LaTeX 必须使用双反斜杠 `\\(` 和 `\\)`。

---

## 二、 视觉硬性要求 (Visual Identity)
- 可视区域参考比例：16:7，优先一屏展示所有交互，当内容超过可视区域时，建议通过以下方式解决：
   - Step Navigation（步骤切换）
   - Card Tab 切换
- 允许纵向滚动（必要时）
- 演示图示部分必须通过色彩填充保持视觉冲击力，需要读取色彩方案配置 (Color Palettes)
- 必须调用我的色彩方案配置页面
- 按照我的字号系统设计页面
- 按钮统一高度：80px
- 页面采用“安全高度设计”（safe area）
- grid 仅用于模块，不用于锁死整体高度
- 禁止 Emoji：全篇严禁出现任何表情符号，确保学术严谨感。禁止图片**：页面中严禁使用 `<img>` 标签或任何背景图片。
- UI使用描边+填充的风格

---

## 三、 布局硬性约束 (Visual & Layout Constraints)

- **一屏优先级 (Single-Screen Priority)**：
  - AI 应以“不产生全局滚动条”为最高目标规划内容密度。
  - **布局公式**：Container(flex) = Header(fixed) + Stage(flex-grow: 1 + overflow-y: auto) + Controls(flex-shrink: 0).
  - **核心意义**：确保标题和按钮始终在首屏，仅让中间的演示内容在必要时提供局部滚动。

- **弹性字号保护**：
  - 默认 H1 为 42px。当内容检测到可能触发滚动时，优先通过 `clamp(30px, 5vh, 42px)` 缩小字号，而非直接溢出。

- **安全边界**：
  - 底部按钮（80px）上方必须保留 `20px` 的固定间距，防止内容与交互组件粘连。

---

## 四、字号系统（Typography）

- H1 = 40px / font-weight: 700 !important** (必须确保权重，防止被框架覆盖)
- H2 = 30px / font-weight:600
- H3 = 28px / font-weight:500
- Body = 28px/ font-weight:500
- Caption ≥ 22px/ font-weight:300
- 按钮字号 = 28px/font-weight:500

---

## 五、 色彩方案配置 (Color Palettes)
> 调用准则：如果用户有指定颜色要求则优先使用用户颜色；如果没有要求，则从以下色彩方案中随机选择一组，但是需要避免总是选用同一色彩。

### 色彩1
- 背景色 (Background): #FAF4DB
- 所有字体颜色 (Text): #3A1D03
- 主色调 (Primary): #FFDF5E

- 卡片色彩/样式：
  background: rgba(255, 255, 255, 0.90);
  border: 1px solid rgba(58, 29, 3, 0.50);
  border-radius: 20px;


- 按钮色彩/样式：
 01:核心按钮
 background: #FFDF5E;
 border: 2px solid #D17A00;
 border-radius: 20px;
 02:次要按钮
 border: 2px solid rgba(186, 148, 43, 0.50);
 border-radius: 20px;

- 知识点演示色彩/样式：（知识点演示部分需要用到以下80%的颜色）
  01
  background: rgba(255, 223, 94, 0.90);
  border: 3px solid #BA942B;
  02
  background: rgba(170, 202, 249, 0.90);
  border: 3px solid #004768;
  03
  background: rgba(209, 122, 0, 0.90);
  border: 3px solid #6B4B02;
  04
  background: rgba(255, 184, 193, 0.90);
  border: 3px solid #FF6421;
  05
  background: rgba(2, 84, 59, 0.90);
  border: 3px solid #02543B;

### 色彩2
- 背景色 (Background): #DCF5D9 #02543B
- 所有字体颜色 (Text): #004737
- 主色调 (Primary): #02543B

- 卡片色彩/样式：
  background: rgba(255, 255, 255, 0.90);
  border: 1px solid rgba(2, 84, 59, 0.50);

- 知识点演示色彩/样式：（知识点演示部分需要用到以下80%的颜色）
  01
  background: #FFFFFF;
  border: 3px solid #02543B;
  02
  background: rgba(2, 84, 59, 0.80);
  border: 3px solid #02543B;
  03
  background: rgba(255, 184, 193, 0.80);
  border: 3px solid #FF6421;
  04
  background: rgba(170, 202, 249, 0.90);
  border: 3px solid #004768;

### 色彩3
- 背景色 (Background): #E0EAF8
- 所有字体颜色 (Text): #004768
- 主色调 (Primary): #AACAF9 #FF6421

- 卡片色彩/样式：
  background: rgba(255, 255, 255, 0.90);
  border: 1px solid rgba(0, 71, 104, 0.50);
  border-radius: 20px;

- 按钮色彩/样式：
  01:核心按钮
  background: #AACAF9;
  border: 2px solid #004768;
  border-radius: 20px;
  02:次要按钮
  background: #FFFFFF;
  border: 2px solid rgba(0, 71, 104, 0.30);
  border-radius: 20px;

- 知识点演示色彩/样式：（知识点演示部分需要用到以下80%的颜色）
  01
  fill: rgba(139, 185, 252, 0.80);
  stroke: #004768;
  stroke-width: 3px;
  02
  fill: rgba(255, 100, 33, 0.80);
  stroke: #8F2C01;
  stroke-width: 3px;
  03
  background: rgba(255, 223, 94, 0.90);
  border: 3px solid #BA942B;

### 图示视觉强化 (Visual Impact)
- **多色利用协议**：在演示核心知识点（如几何图形、公式推导）时，必须激活色彩方案中 80% 以上的预设颜色（例如序号 01-05 均需出现）。
- **应用对象**：颜色应通过 `background` 和 `border` 属性应用在：
  - 公式中的关键变量高亮盒
  - 几何图形的不同侧面或辅助线
  - 步骤卡片的强调边框
- **禁止单一性**：严禁整个演示区域只使用同一种主色调，必须通过色彩填充形成强烈的视觉分块。

---

 ## 六、禁止项（Forbidden）

- Emoji
- <img> 标签
- 背景图片
- $...$ 数学语法
- 多屏核心内容拆分