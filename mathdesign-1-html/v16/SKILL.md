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

---

# 三、页面结构

页面必须使用固定结构：

```
page
├ header
└ main
   ├ stage
   └ panel
```

**严格规则**

stage 与 panel **必须是 main 的直接子元素**

禁止增加额外层级。

---

# 四、页面画布

页面容器：

```
height: calc(100vh - 24px);
overflow: hidden;
```

Header：

```
height: 100px;
```

Main：

```
height: calc(100% - 100px);
```

---

# 五、主布局 Grid

Main 必须使用：

```
display: grid;
grid-template-columns: 2fr 1fr;
gap: 24px;
height: 100%;
align-items: stretch;
```

左侧：

stage（图形演示）

右侧：

panel（讲解内容）

---

# 六、页面间距系统

页面外边距：

```
padding: 60px;
```

Card 内边距：

```
padding: 40px;
```

规则：

页面内容距离浏览器边缘 **必须 60px**

Card 内内容距离 Card 边缘 **必须 ≥ 40px**

---

# 七、颜色变量系统（强制）

所有颜色 **必须使用 CSS 变量**

```
:root{
--bg
--text
--primary
}
```

页面中 **禁止直接写 hex 颜色**

错误：

```
background:#FAF4DB
```

正确：

```
background:var(--bg)
```

SVG 也必须使用变量：

```
stroke:var(--primary)
fill:var(--primary)
```

---

# 八、色彩方案应用规则

如果用户没有指定颜色：

必须 **从色彩方案章节选择一个方案**

并写入：

```
:root{
--bg:
--text:
--primary:
}
```

示例：

```
:root{
--bg:#FAF4DB;
--text:#3A1D03;
--primary:#FFDF5E;
}
```

---

# 九、全局 UI 设计规范

统一圆角：

```
border-radius: 20px;
```

适用于：

- Card
- Button
- SVG容器
- 输入区

---

# 十、Card 组件

Card 样式：

```
border: 1px solid rgba(0,0,0,0.15);
border-radius: 20px;
padding: 40px;
background: #ffffff;
```

数量限制：

```
Stage：1 个 Card
Panel：最多 2 个 Card
整页最多 3 个 Card
```

---

# 十一、Stage 图形区

Stage Card 必须：

```
height: 100%
display: flex
align-items: center
justify-content: center
```

必须包含：

```
1 个 SVG 图形
```

SVG 推荐尺寸：

```
width:100%
height:320px
```

---

# 十二、SVG 图形规范

SVG 必须：

```
viewBox="0 0 600 400"
```

统一样式：

```
fill:var(--primary)
fill-opacity:0.15
stroke:var(--primary)
stroke-width:5
```

禁止：

```
fill:none
```

---

# 十三、Panel 内容区

Panel：

```
display:flex
flex-direction:column
gap:16px
height:100%
```

Panel 内只允许 **一个 Card 使用**

```
overflow-y:auto
```

禁止整个页面滚动。

---

# 十四、交互按钮规范

按钮高度固定：

```
height:80px
```

按钮样式：

```
display:flex
align-items:center
justify-content:center
width:100%

font-size:28px
font-weight:500

border-radius:20px

background:var(--primary)
color:#ffffff

border:2px solid var(--primary)

cursor:pointer
```

---

# 十五、字体系统

字体：

```
Inter
Roboto
PingFang SC
system-ui
sans-serif
```

禁止使用：

```
Light
Thin
```

---

# 十六、字号系统

一级标题：

```
font-size:42px
font-weight:700
```

二级标题：

```
font-size:34px
font-weight:600
```

正文：

```
font-size:28px
```

辅助说明：

```
font-size:24px
```

---

# 十七、标注字体

图形标注：

```
font-size:24px
color:var(--text)
opacity:0.8
```

用于：

- 长度标注
- 角度标注
- 图形说明

---

# 十八、色彩方案

如果用户未指定颜色，从以下方案选择。

---

## 明亮品牌黄

```
--bg:#FAF4DB
--text:#3A1D03
--primary:#FFDF5E
```

教学图示色彩：

```
rgba(255,223,94,0.80)
rgba(170,202,249,0.90)
rgba(209,122,0,0.80)
rgba(255,184,193,0.80)
rgba(2,84,59,0.80)
```

---

## 极简品牌绿

```
--bg:#DCF5D9
--text:#004737
--primary:#02543B
```

教学图示色彩：

```
#FFFFFF
rgba(2,84,59,0.80)
rgba(255,184,193,0.80)
rgba(170,202,249,0.90)
```

---

# 十九、禁止内容

页面禁止：

```
emoji
img 标签
icon 库
背景图片
canvas
```

必须全部使用：

```
HTML
CSS
SVG
```