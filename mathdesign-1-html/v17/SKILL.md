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

## 二、 视觉硬性要求 (Visual Identity)
1. **画布比例参考**：页面设计以 `16:7` 作为视觉排版参考比例。
2. **页面高度控制**：主页面容器必须使用：`height: calc(100vh - 24px);`，确保在浏览器 UI 存在时仍能完整显示内容。
3. **页面级禁止滚动**：页面根容器必须使用 `overflow: hidden;`，禁止出现浏览器页面滚动条。
4. **内容溢出处理规则**：当内容超过可视区域时，必须通过 Card 内部滚动 (`overflow-y: auto`)、Step Navigation（步骤切换）或 Card Tab 切换解决。**演示区域（左侧）不允许有滑动。**
5. **禁止 Emoji 与图片**：全篇严禁出现任何表情符号。严禁使用 `<img>` 标签或任何背景图片。
6. **透明卡片设计**：
   - 1px 描边：`border: 1px solid ${primaryColor}4D;`（4D 代表 30% 透明度）。
   - 描边圆角：`border-radius: 16px;`。
   - **卡片数量限制**：建议 1-3 个框，最多不超过四个。每一个框不能溢出屏幕。
7. **字体选择**：几何感无衬线体（Inter, Roboto, PingFang SC）。**不要出现细体（Light/Thin）。**

## 三、 色彩方案配置 (Color Palettes)

> 调用准则：如果用户有指定颜色要求则优先使用用户颜色；如果没有要求，则从以下色彩方案中随机选择一组。

### 01 极简珊瑚红
背景色 (Background): #F3EFEC  
标题文字色 (Text): #6F2828  
主色调 (Primary): #F23C3C  
辅助色 (Secondary): #FC7777  

### 02 极简类纸黄
背景色 (Background): #FAF6E9  
标题文字色 (Text): #0B2047  
主色调 (Primary): #1451C3  
辅助色 (Secondary): #E7C041  

### 03 深邃墨青
背景色 (Background): #DCF8F6  
标题文字色 (Text): #003742  
主色调 (Primary): #003742  
辅助色 (Secondary): #29D7EE #B56C2A  

### 04 深邃苍翠绿
背景色 (Background): #DEECCF  
标题文字色 (Text): #18250E  
主色调 (Primary): #355F1E  
辅助色 (Secondary): #A3D360  

### 05 极简落霞红
背景色 (Background): #ECEAE4  
标题文字色 (Text): #213B2A  
主色调 (Primary): #265737  
辅助色 (Secondary): #265737 #D45E48  

### 06 现代主义橙
背景色 (Background): #F4F5ED  
标题文字色 (Text): #311504  
主色调 (Primary): #FB5E38  
辅助色 (Secondary): #FF845B  

### 07 烁金黄
背景色 (Background): #262626  
标题文字色 (Text): #FED14A #D7D7D7  
主色调 (Primary): #FED14A  
辅助色 (Secondary): #FB7C46  

### 08 睿智蔚蓝
背景色 (Background): #1A252F  
标题文字色 (Text): #FFFFFF  
主色调 (Primary): #4587B2  
辅助色 (Secondary): #9BC6E1 #D1E5F0 #FEF500  

### 09 极简黑板
背景色 (Background): #1A252F  
标题文字色 (Text): #FFFFFF  
主色调 (Primary): #4587B2  
辅助色 (Secondary): #9BC6E1 #D1E5F0 #FEF500  

### 10 极简学院红
背景色 (Background): #311318  
标题文字色 (Text): #FFFFFF  
主色调 (Primary): #FFED98  
辅助色 (Secondary): #FF5C5C  

### 11 睿智蔚蓝
背景色 (Background): #1a252f
标题字体 (Text): #ffffff
主色调 (Primary): #4587b2
辅助色 (Secondary): #9bc6e1 #d1e5f0 #FEF500

### 12 极简纯灰色
背景色 (Background): #E0E0E0  
标题文字色 (Text): #000000  
主色调 (Primary): #141414  
辅助色 (Secondary): #FEDA24 #BE95FF #642714   

## 四、 布局与代码约束 (防留白逻辑)
1. **比例化布局**：强制使用 `grid-template-columns: 2fr 1fr;`。
2. **垂直撑满**：右侧卡片区必须使用 `display: flex; flex-direction: column; justify-content: space-between;`，确保内容均匀分布，消除底部空白。
3. **SVG 动态化与填充**：所有几何图形必须使用 `<svg>` 绘制。**图形需要有填充（100% 透明度填充即可，即 fill-opacity 设置），严禁纯线框演示。**
4. **页面垂直结构**：`page` -> `header` -> `main`。`header` 高度控制在 `80px – 120px`。
5. **SVG 尺寸限制**：高度必须为 Card 可用高度的 50%–60%，设置 `max-height: 60%; object-fit: contain;`。
6. **MathJax 尺寸**：复杂公式视觉高度不得超过两行正文高度。

## 五、 字号系统 (Typography Scale)
1. **一级标题**：`42px / 2.6rem`，字重 `700`。
2. **二级标题**：`34px / 2.1rem`，字重 `600`。
3. **重要信息（关键内容）**：不得小于 `28px / 1.6rem`，字重 `500`。适用于交互按钮、结论等。
4. **正文信息**：不得小于 `26px / 1.55rem`，字重 `400`。
5. **辅助说明**：不得小于 `24px / 1.5rem`，字重 `400`。
6. **MathJax 公式**：视觉尺寸不得小于 `28px`。

## 六、 排版间距系统 (Spacing System)
1. **基础单位**：基于 `8px` 系统。标题下边距：H1(32px), H2(24px), H3(16px)。
2. **Card 内部间距**：`padding: 24px`，元素垂直间距 `gap: 16px – 20px`。
3. **SVG 与文字间距**：`margin-top/bottom: 16px`。