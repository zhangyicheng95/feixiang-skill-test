# 通用单页视觉指南

本文件用于非数学或学科不明的单页 HTML。数学任务仍以 `math-design/workflow.md` 为视觉和布局权威；只有通用组件、文字层级和非坐标型演示区可以参考本文件。目标是建立本 skill 包的高识别度教学页视觉：平涂、描边、高对比、结构拆解，用稳定色板和清楚布局保障产物不落入通用网页模板感。

## 视觉 DNA

默认审美是纯色块面、实线描边、统一圆角、演示区轻网格、多色分块。层次主要靠色块、边框、留白和字号，不靠厚重阴影、复杂渐变和装饰性图片。卡片、按钮、演示区、选项块都要有清楚边界，教学对象要用颜色和形状分层，让学生一眼能看出“哪里是信息、哪里能操作、哪里会反馈”。

硬规则如下：不把 `box-shadow`、`text-shadow`、`drop-shadow` 当作主要层次来源；不把紫蓝或彩虹渐变作为页面和卡片主背景；组件统一使用 `12px-20px` 圆角，同一页面优先固定 `--radius:16px`；演示区可以使用装饰性网格，但不能冒充坐标测量；核心知识对象至少使用 2-4 个实色区分；标题、按钮和要点前不使用 emoji，图标优先用 SVG、纯文字或简单几何。

## 色板选择

每个页面必须选择一套主色板并在全页统一使用。不要临场拼颜色，也不要整页只用同一种蓝色的深浅变化。用户指定风格时服从用户；否则按课题核心词、学段和学科选择一套最贴近的色板，并在 HTML 的 spec 注释中记录，例如：

```html
<!-- style-guide: palette=EDU-青; radius=16; keyword=酸碱中和; source=subject -->
```

可用色板如下，生成时应把变量写入 `:root`：

| 色板 | 适用场景 | 变量 |
|---|---|---|
| EDU-青 | 科学、理化、实验、生态观察 | `--bg:#FFFFFF; --text:#00404D; --primary:#00404D; --accent:#137F8B; --card:#D3F6F4; --card-border:rgba(0,64,77,.30); --demo-bg:#D3F6F4; --demo-border:#93BFC2; --demo-grid:#DBF1F0; --btn-primary-bg:#00404D; --btn-primary-fg:#FFFFFF; --btn-2nd-bg:#ECFCFB; --btn-2nd-fg:#00404D; --radius:16px;` |
| EDU-蓝 | 通用教学、英语、信息技术、清爽练习 | `--bg:#DFEDFF; --text:#0F2336; --primary:#278DEA; --accent:#40A10B; --card:#FFFFFF; --card-border:rgba(15,35,54,.30); --demo-bg:#FFFFFF; --demo-border:rgba(15,35,54,.30); --demo-grid:#F1F5FB; --btn-primary-bg:#83FE91; --btn-primary-fg:#232323; --btn-2nd-bg:#DFEDFF; --btn-2nd-fg:#000000; --radius:16px;` |
| EDU-绿 | 生物、自然、劳动、环保主题 | `--bg:#E2ECD3; --text:#012B1F; --primary:#405E28; --accent:#549B22; --card:#F7FDF6; --card-border:rgba(1,43,31,.30); --demo-bg:#F7FDF6; --demo-border:rgba(0,0,0,.30); --demo-grid:#ECF1E6; --btn-primary-bg:#405E28; --btn-primary-fg:#E2ECD3; --btn-2nd-bg:#F7FDF6; --btn-2nd-fg:#012B1F; --radius:16px;` |
| EDU-橙 | 语文、历史、地理、低龄活力主题 | `--bg:#FFF3D9; --text:#3D3334; --primary:#F8981F; --accent:#9D3E00; --card:#FFFFFF; --card-border:rgba(0,0,0,.30); --demo-bg:#FFFFFF; --demo-border:rgba(0,0,0,.30); --demo-grid:#ECECEC; --btn-primary-bg:#F8981F; --btn-primary-fg:#000000; --btn-2nd-bg:#FFF6E3; --btn-2nd-fg:#000000; --radius:16px;` |
| EDU-深青 | 理化实验、夜间观察、沉浸式模拟 | `--bg:#0F302F; --text:#EEFFEB; --primary:#06B17A; --accent:#B6FCE5; --info:#E44B40; --card:#123A37; --card-border:rgba(238,255,235,.30); --demo-bg:#123A37; --demo-border:#526F68; --demo-grid:#164441; --btn-primary-bg:#06B17A; --btn-primary-fg:#FFFFFF; --btn-2nd-bg:#184C49; --btn-2nd-fg:#EEFFEB; --radius:16px;` |
| EDU-暗黄 | 几何感、科技感、黑板式演示 | `--bg:#000000; --text:#FFFFFF; --primary:#F8EF50; --accent:#03DEDE; --card:#232323; --card-border:rgba(188,227,223,.30); --demo-bg:#232323; --demo-border:rgba(188,227,223,.30); --demo-grid:#393939; --btn-primary-bg:#F8EF50; --btn-primary-fg:#000000; --btn-2nd-bg:#414141; --btn-2nd-fg:#FFFFFF; --radius:16px;` |

演示对象的辅助色从主色板中派生，优先使用 `--primary`、`--accent`、`--info` 和高对比补色。理科和互动演示至少要让“对象、状态、反馈”三类信息颜色不同；深色板必须提高亮度和文字对比，避免舞台显暗。

## 页面结构

单页优先使用三段结构：标题区、主体演示/内容区、控制或反馈区。页面根容器建议命名为 `.page-container`，承载统一背景、边距和整体布局；主体区域使用 `.demo` 或 `.content-grid`；操作区使用 `.toolbar` 或 `.feedback`。内容很多时不要纵向堆成长页，并列主题使用 Tabs，十个以上同类条目使用 Accordion、分页或分组列表。

滚动要服务内容类型，而不是掩盖组织问题。互动练习、小游戏、模拟器和演示台应尽量让主体、控件和反馈同屏可见；长文档、阅读材料、资料汇编、打印预览和长表格可以滚动，但要有清楚分区、标题锚点或目录，让读者知道当前位置和下一步。内容超量时优先减少密度、改成 Tabs/Accordion/步骤分页、拆成多页课件或改变版式；选择滚动时也要避免关键操作被长内容淹没。

推荐结构：

```html
<main class="page-container">
  <header class="page-title">
    <p class="eyebrow">学科 / 任务</p>
    <h1>本页核心问题</h1>
  </header>
  <section class="layout">
    <div class="demo">演示对象或互动舞台</div>
    <aside class="card">提示、规则、步骤或结果</aside>
  </section>
  <footer class="toolbar">按钮、状态、反馈</footer>
</main>
```

如果页面需要固定教学画布，可以使用“外框 100%，中间固定画布”的结构：`.page-frame` 铺满可用视口，`.canvas-wrap` 居中，`.canvas` 固定为 960×540 或按容器等比缩放。所有教学内容放在 `.canvas` 中，页眉、页脚和工具条不要挤压主体。这个结构能保证视觉稳定，尤其适合演示、海报、练习台和投屏场景。

## CSS 基线

每个非数学页面至少包含以下基线，可以按色板替换变量：

```css
:root {
  --bg:#DFEDFF;
  --text:#0F2336;
  --primary:#278DEA;
  --accent:#40A10B;
  --card:#FFFFFF;
  --card-border:rgba(15,35,54,.30);
  --demo-bg:#FFFFFF;
  --demo-border:rgba(15,35,54,.30);
  --demo-grid:#F1F5FB;
  --btn-primary-bg:#83FE91;
  --btn-primary-fg:#232323;
  --btn-2nd-bg:#DFEDFF;
  --btn-2nd-fg:#000000;
  --radius:16px;
  --stage-base:#eef1f5;
  --canvas-bg:color-mix(in srgb, var(--bg) 50%, var(--stage-base) 50%);
}
* { box-sizing:border-box; }
body {
  margin:0;
  font-family:"PingFang SC","Microsoft YaHei",system-ui,sans-serif;
  color:var(--text);
  background:var(--canvas-bg);
}
.page-container {
  min-height:100vh;
  padding:28px;
  background:var(--canvas-bg);
}
.page-title {
  display:flex;
  align-items:flex-end;
  justify-content:space-between;
  gap:16px;
  margin-bottom:18px;
}
.page-title h1 {
  margin:0;
  color:var(--primary);
  font-size:clamp(28px, 4vw, 42px);
  line-height:1.15;
  font-weight:800;
}
.eyebrow, .chip {
  display:inline-flex;
  align-items:center;
  min-height:28px;
  padding:4px 12px;
  border:2px solid var(--card-border);
  border-radius:999px;
  background:var(--card);
  font-size:13px;
  font-weight:700;
}
.card {
  background:var(--card);
  border:2px solid var(--card-border);
  border-radius:var(--radius);
  padding:16px 18px;
}
.demo {
  background:var(--demo-bg);
  border:2px solid var(--demo-border);
  border-radius:var(--radius);
  background-image:
    linear-gradient(var(--demo-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--demo-grid) 1px, transparent 1px);
  background-size:30px 30px;
}
.btn {
  min-height:44px;
  padding:9px 18px;
  border:2px solid var(--card-border);
  border-radius:var(--radius);
  background:var(--btn-primary-bg);
  color:var(--btn-primary-fg);
  font-size:15px;
  font-weight:700;
  cursor:pointer;
}
.btn.secondary {
  background:var(--btn-2nd-bg);
  color:var(--btn-2nd-fg);
}
.btn:hover { filter:brightness(.96); }
.btn:focus-visible {
  outline:3px solid color-mix(in srgb, var(--accent) 70%, white 30%);
  outline-offset:2px;
}
```

`color-mix()` 可用时用于舞台底色混合；如果目标浏览器不支持，提供一个接近的纯色 fallback。不要把页面、卡片和按钮都设成纯白；白色主要留给卡片、选项块和局部阅读区。

## 字号与密度

标题要像教学页，不要像后台表单。封面或主任务标题建议 40-48px；普通页标题 28-36px；小标题 18-22px；正文 16-20px；注释和标签 13-14px；按钮文字 15-16px。中文行高保持 1.5-1.75，按钮和卡片内文字要有足够行距。紧凑面板中不要使用 hero 级大字，演示舞台也不要用过小浅灰字承载核心说明。

## 组件配方

讲解页使用标题区 + 双栏卡片 + tip 区，左侧放概念或步骤，右侧放例子、图示或小练习。互动页使用标题区 + 大演示区 + 控件条 + 反馈区，反馈要紧邻操作结果，不要藏到页面底部。测验页使用白底选项块、明显提交按钮、绿色/红色对错反馈和解析区。小结页使用卡片列表和高亮提示，不用 emoji 做项目符号。封面页可以使用轻微同色系渐变，但主标题必须大、居中或接近视觉中心，并保留学科标签或任务标签。

演示区必须有视觉质感：浅灰或色板底色、细网格、清楚边框、多色对象、状态标签。非数学图示可以用装饰网格；数学坐标、函数、统计图必须走 `math-design`，不要套用装饰网格当坐标系。

## 响应与防溢出

默认设计要覆盖 375、768、1280 三类视口。固定画布类页面要用 `aspect-ratio:16/9`、`max-width`、`max-height` 或容器缩放保障完整呈现；普通长内容页面可以滚动，但核心互动区和当前反馈必须容易找到。所有动态状态都要考虑防溢出：展开解析、显示结果、切换 tab、拖拽完成、动画结束后都不能撑破卡片、遮挡按钮或造成横向溢出。

不要用 `overflow:hidden` 裁掉超量内容，也不要用隐藏滚动条伪装成无溢出。生成后应检查横向溢出、按钮可达性、反馈可见性和长内容的导航清晰度；如果滚动让任务完成路径变得不清楚，应回到版式重排或拆分内容。

打印类页面使用 A4 结构时，屏幕样式和打印样式都要定义。打印页可以降低装饰网格和背景色强度，但不能丢失题区、答题区、页眉页脚、分页和留白。

## 反模板感清单

生成前自查这些问题：紫蓝渐变铺满封面或卡片；卡片靠阴影漂浮；标题和按钮堆 emoji；默认蓝 `#2563eb` 贯穿全页；圆角大小混乱；演示区纯白无边界；页面只有卡片没有舞台；按钮没有明确主次；大段浅灰细字；控件和反馈相距太远。出现这些问题时，优先回到色板、结构和组件配方重写样式，而不是再加装饰。
