---
name: Mathdesign-1-html
description: 根据用户需求生成「数学公式与函数」类 HTML 结构。当用户提出生成代数：数、式、方程、函数、公式、几何、线、角、三角形、圆、图形变换等教学动画时使用，以提高数学公式与函数类的 HTML 的设计质量。如果需要展示公式，需要严格用mathjax库渲染latex格式的公式。
---

更新时间：2026-02-28

一、 视觉硬性要求 (Visual Identity)
一屏展示：所有内容必须在 16:9 画布内完成，严禁出现滚动条。

禁止 Emoji：全篇不得出现任何表情符号，保持学术严谨性。

卡片设计：

1px 描边：border: 1px solid ${primaryColor}4D;（4D 代表 30% 透明度）。

描边圆角：border-radius: 16px;。

禁止填充：卡片背景必须透明，不带任何背景色。

字体选择：使用几何感强的无衬线字体（如 Inter, Roboto, PingFang SC）。

公式渲染：严格使用 MathJax 库渲染 LaTeX 格式。

二、 色彩方案配置 (Color Palettes)
以下为扩充后的完整配色矩阵，生成时需根据需求场景选择（或随机抽取）：

方案	名称	背景色 (BG)	主色/标题 (Primary)	辅助/次要 (Secondary)	高亮 (Highlight)
01	极简复古主义	#ECEAE4	#181818	#2C4F38	#D45E48
02	现代极简橙	#F4F5ED	#FB5E38	#828282	#FB5E38
03	清新文艺蓝	#FFF3C6	#165DFC	#EEBE00	#165DFC
04	复古未来绿	#121312	#42FC7A	#B1B1B1	#42FC7A
05	人文科技绿	#CCD9D1	#111411	#79B7E1	#A3FF00
06	现代冷静蓝	#34BAF2	#000000	#FDDB33	#000000
07	幽林深绿	#FFF5D9	#006D3E	#66BB6A	#AED581
08	炽能橙	#1A1C22	#F46523	#2B2E35	#FF914D
09	Amber Solidarity	#FCD869	#DFBE5A	#4B492B	#3F3D1B
10	清雅淡蓝	#DAE8FC	#000000	#DAE8FC	#000000
11	Corporate Altruism	#1A252F	#4587B2	#9BC6E1	#D1E5F0
12	Verdant Altruism	#E2F2D1	#285C3F	#1E3D2F	#40916C
13	素雅浅灰	#333333	#C4C4BC	#C1D1DA	#F9CFB5

三、 代码逻辑约束 (Code Logic)
布局：优先使用 Flexbox 或 Grid 保持元素对齐。
交互：如涉及函数图像，使用 SVG 或 Canvas 绘制。
响应式：确保在标准 1920x1080 比例下完美呈现。