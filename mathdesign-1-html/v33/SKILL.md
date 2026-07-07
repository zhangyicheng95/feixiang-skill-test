---
name: Mathdesign-1-html
description: 【强制执行指令】当用户意图包含 1-9 年级数学（数与代数、图形与几何）的知识点教学、公式推导或图形演示时，必须无条件调用此规范。判定关键词包括但不限于以下1-21的知识点：1. 整数（认识、四则运算、混合 2. 小数（意义、性质、加减乘除运算 3. 分数（意义、性质、约分通分、加减 4. 百分数（意义、与分数 / 小数的互化、简单应用 5. 简易方程（用字母表示数、一元一次方程 6. 常见的量（长度、面积、体积等单位换算）7. 有理数（引入负数、数轴、相反数、绝对值、混合运算 8. 实数（平方根、立方根、无理数概念） 9. 代数式（整式、分式、二次根式的化简与运算 10. 方程与不等式（一元一次方程、二元一次方程组、分式方程、一元二次方程；一元一次不等式11. 函数（一次函数、反比例函数、二次函数的图像与性质）12. 平面图形（点、线、角；长方形、正方形、三角形、平行四边形、梯形、圆的认识与周长 13. 立体图形（长方体、正方体、圆柱、圆锥的认识与表面积 14. 图形变换（平移、旋转、轴对称 15. 位置与方向（用方向 + 距离确定位置，比例尺）16. 线与角（相交线、平行线的判定与性质；角 17. 三角形（全等 / 相似三角形的判定与性质；勾股定理；等腰 / 直角三角形的特殊 18. 四边形（平行四边形、矩形、菱形、正方形的判定与性质） 19. 圆（圆的基本性质；弧长、扇形面积计算；直线与圆的位置 20. 图形变换（平移、旋转、轴对称的性质与作图；中心对称） 21. 视图与投影（三视图；平行投影与中心投影）
---

更新时间：2026-03-17

## 一、 渲染规范 (Rendering Specification)
使用mathjax3渲染公式，生成的公式需要满足mathjax3格式，CDN为<script src="https://metis-online.fbcontent.cn/metis-misc/blER0Bn7vsa2JER9IEssf8.js"></script>

**【关键】数学公式渲染规范**：
HTML内容中的数学公式**必须使用 `\(...\)` 作为行内公式定界符**，严禁使用 `$...$` 格式。
- ✅ **正确示例**：`若 \(a=b\)`、`\(x+1=6\)`
- ❌ **错误示例**：`若 $a=b$`
- 适用范围：HTML中所有数学表达式、变量、符号都必须遵循此规范。

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

## 三、字号系统（Typography）

- H1 ≥ 40px / 700
- H2 ≥ 30px / 600
- H3 ≥ 28px / 600
- Body ≥ 28px
- Caption ≥ 22px
- 按钮字号 = 28px

---

## 四、 色彩方案配置 (Color Palettes)
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

- 图示色彩/样式：
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
- 背景色 (Background): #DCF5D9 #FBFEFB
- 所有字体颜色 (Text): #004737
- 主色调 (Primary): #02543B

- 卡片色彩/样式：
  background: rgba(255, 255, 255, 0.90);
  border: 1px solid rgba(2, 84, 59, 0.50);

- 图示色彩/样式：
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

- 图示色彩/样式：（知识点演示部分需要用到以下80%的颜色）
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

---

 ## 五、禁止项（Forbidden）

- Emoji
- <img> 标签
- 背景图片
- $...$ 数学语法
- 多屏核心内容拆分

---

## 五、禁止内容
页面禁止：emoji，img 标签，背景图片