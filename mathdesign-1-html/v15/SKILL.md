---
name: Mathdesign-1-html
description: 【强制执行指令】当用户意图包含 1-9 年级数学（数与代数、图形与几何）的知识点教学、公式推导或图形演示时，必须无条件调用此规范。判定关键词包括但不限于以下1-21的知识点：1. 整数（认识、四则运算、混合 2. 小数（意义、性质、加减乘除运算 3. 分数（意义、性质、约分通分、加减 4. 百分数（意义、与分数 / 小数的互化、简单应用 5. 简易方程（用字母表示数、一元一次方程 6. 常见的量（长度、面积、体积等单位换算）7. 有理数（引入负数、数轴、相反数、绝对值、混合运算 8. 实数（平方根、立方根、无理数概念） 9. 代数式（整式、分式、二次根式的化简与运算 10. 方程与不等式（一元一次方程、二元一次方程组、分式方程、一元二次方程；一元一次不等式11. 函数（一次函数、反比例函数、二次函数的图像与性质）12. 平面图形（点、线、角；长方形、正方形、三角形、平行四边形、梯形、圆的认识与周长 13. 立体图形（长方体、正方体、圆柱、圆锥的认识与表面积 14. 图形变换（平移、旋转、轴对称 15. 位置与方向（用方向 + 距离确定位置，比例尺）16. 线与角（相交线、平行线的判定与性质；角 17. 三角形（全等 / 相似三角形的判定与性质；勾股定理；等腰 / 直角三角形的特殊 18. 四边形（平行四边形、矩形、菱形、正方形的判定与性质） 19. 圆（圆的基本性质；弧长、扇形面积计算；直线与圆的位置 20. 图形变换（平移、旋转、轴对称的性质与作图；中心对称） 21. 视图与投影（三视图；平行投影与中心投影）
---

更新时间：2026-03-16

## 一、 渲染规范 (Rendering Specification)
使用mathjax3渲染公式，生成的公式需要满足mathjax3格式，CDN为<script src="https://metis-online.fbcontent.cn/metis-misc/blER0Bn7vsa2JER9IEssf8.js"></script>

**【关键】数学公式渲染规范**：
HTML内容中的数学公式**必须使用 `\(...\)` 作为行内公式定界符**，严禁使用 `$...$` 格式。
- ✅ **正确示例**：`若 \(a=b\)`、`\(x+1=6\)`
- ❌ **错误示例**：`若 $a=b$`
- 适用范围：HTML中所有数学表达式、变量、符号都必须遵循此规范。

---

# 二、页面结构 (Layout Structure)

页面必须使用固定结构：

page  
├ header  
└ main  
  ├ stage（左侧图形演示）  
  └ panel（右侧讲解内容）

禁止增加额外层级。

---

# 三、画布尺寸 (Canvas)

页面容器必须：

height: calc(100vh - 24px);  
overflow: hidden;

Header 高度固定：

height: 100px;

Main 区域：

height: calc(100% - 100px);

---

# 四、主布局 (Grid)

Main 必须使用：

display: grid;  
grid-template-columns: 2fr 1fr;  
gap: 24px;  
height: 100%;

左侧为图形演示区（stage）  
右侧为讲解区（panel）

---

# 五、页面间距系统 (Spacing System)

为保证 UI 稳定与视觉统一，必须使用固定间距系统。

页面边距：

page padding: **60px**

即：

页面内容与浏览器边缘之间必须保持 **60px 外边距**。

Card 内边距：

Card padding: **40px**

即：

Card 内所有文字与图形距离 Card 边缘 **至少 40px**。

---

# 六、颜色变量规范 (Color Variables)

所有颜色必须定义为 CSS 变量：

```
:root{
--bg
--text
--primary
}
```

页面背景：

background: var(--bg)

标题文字：

color: var(--text)

主题色：

var(--primary)

---

# 七、统一UI设计规范

全局统一圆角：

border-radius: **20px**

适用于：

- Card
- Button
- SVG容器
- 输入区
- 标签

---

# 八、卡片设计 (Card)

Card 样式：

border: 1px solid rgba(0,0,0,0.15);  
border-radius: 20px;  
padding: **40px**

页面卡片数量限制：

Stage：1 个 Card  
Panel：最多 2 个 Card  

整页最多 **3 个 Card**

---

# 九、Stage 图形区 (数学演示区)

Stage Card 必须：

height: 100%  
display: flex  
align-items: center  
justify-content: center

Stage Card 必须包含：

- 1 个 SVG 图形

SVG 推荐尺寸：

width: 100%  
height: 320px

图形统一描边：

stroke-width: **5px**

图形填充：

fill-opacity: 0.15

禁止纯线框图形。

---

# 十、Panel 内容区

Panel 必须：

display: flex  
flex-direction: column  
gap: 16px  
height: 100%

Panel 内只允许 **一个 Card** 使用：

overflow-y: auto

禁止整个页面滚动。

---

# 十一、交互按钮规范 (Interaction Button)

当页面包含交互操作时，必须使用按钮组件。

按钮高度固定：

height: **80px**

按钮样式：

display: flex  
align-items: center  
justify-content: center  

font-size: 28px  
font-weight: 500  

width: 100%  
border-radius: 20px  

background: var(--primary)  
color: #ffffff  

border: 2px solid var(--primary)

cursor: pointer

---

# 十二、字体系统 (Typography)

字体：

Inter  
Roboto  
PingFang SC  
system-ui  
sans-serif

禁止使用 Light / Thin 字重。

---

# 十三、字号系统

一级标题：

font-size: 42px  
font-weight: 700

二级标题：

font-size: 34px  
font-weight: 600

正文：

font-size: 28px

辅助说明：

font-size: 24px

---

# 十四、标注字体规则

图形标注字体：

font-size: 24px

颜色：

color: var(--text);  
opacity: 0.8;

用于：

- 图形标注
- 角度标注
- 长度标注
- 辅助说明

---

# 十五、SVG 图形规范

SVG 必须包含：

viewBox="0 0 600 400"

SVG图形样式：

fill="var(--primary)"  
fill-opacity="0.15"  

stroke="var(--primary)"  
stroke-width="5"

禁止：

fill="none"

---

# 十六、色彩方案 (Color Palettes)

如果用户未指定颜色，从以下方案选择。

---

## 明亮品牌黄

背景色 (Background)  
#FAF4DB

标题字体 (Text)  
#3A1D03

主色调 (Primary)  
#FFDF5E

教学图示色彩样式：

01  
background: rgba(255, 223, 94, 0.80);  
border: 5px solid #BA942B;

02  
background: rgba(170, 202, 249, 0.90);  
border: 5px solid #004768;

03  
background: rgba(209, 122, 0, 0.80);  
border: 5px solid #6B4B02;

04  
background: rgba(255, 184, 193, 0.80);  
border: 5px solid #FF6421;

05  
background: rgba(2, 84, 59, 0.80);  
border: 5px solid #02543B;

---

## 极简品牌绿

背景色 (Background)  
#DCF5D9  
#FBFEFB

标题字体 (Text)  
#004737

主色调 (Primary)  
#02543B

教学图示色彩样式：

01  
background: #FFFFFF;  
border: 5px solid #02543B;

02  
background: rgba(2, 84, 59, 0.80);  
border: 5px solid #02543B;

03  
background: rgba(255, 184, 193, 0.80);  
border: 5px solid #FF6421;

04  
background: rgba(170, 202, 249, 0.90);  
border: 5px solid #004768;

---

# 十七、禁止内容

页面禁止：

- emoji  
- img 标签  
- 背景图片  
- icon 图标库  
- canvas  

必须全部使用 **HTML + CSS + SVG**