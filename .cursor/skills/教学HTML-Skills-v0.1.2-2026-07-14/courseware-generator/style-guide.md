# 多页课件视觉指南

本文件用于 `courseware-generator` 生成的多页翻页课件。它约束的是每个 `template.page-data` 内的课件页视觉，以及写入 `template.page-shared` 的共享样式。目标是让课件页在 960×540 画布中保持高识别度、高对比、结构清楚、互动入口明显，并避免通用网页模板感。

## 视觉 DNA

默认审美是纯色块面、实线描边、统一圆角、演示区轻网格、多色分块。层次主要靠色块、边框、留白和字号，不靠厚重阴影、复杂渐变和装饰性图片。课件页要让学生快速判断“本页主题是什么、哪里是重点、哪里可以操作、操作后在哪里看反馈”。

硬规则如下：不把 `box-shadow`、`text-shadow`、`drop-shadow` 当作主要层次来源；不把紫蓝或彩虹渐变作为整页和卡片主背景；同一课件统一 `--radius:16px`，可在 `12px-20px` 内调整但不能混乱；演示区可以使用装饰性网格，但不能冒充数学坐标测量；核心知识对象至少使用 2-4 个实色区分；标题、按钮和要点前不使用 emoji，图标优先用 SVG、纯文字或简单几何。

## 色板选择

每套课件必须选择一套主色板并在所有页面统一使用。用户指定风格时服从用户；否则按课题核心词、学段和学科选择一套最贴近的色板，并在 `page-shared` 与 `artifact-spec.visualDesign` 中记录：

```html
<!-- style-guide: palette=EDU-青; radius=16; keyword=酸碱中和; source=subject -->
```

可用色板如下，生成时应把变量写入 `template.page-shared` 的 `:root`：

| 色板 | 适用场景 | 变量 |
|---|---|---|
| EDU-青 | 科学、理化、实验、生态观察 | `--bg:#FFFFFF; --text:#00404D; --primary:#00404D; --accent:#137F8B; --card:#D3F6F4; --card-border:rgba(0,64,77,.30); --demo-bg:#D3F6F4; --demo-border:#93BFC2; --demo-grid:#DBF1F0; --btn-primary-bg:#00404D; --btn-primary-fg:#FFFFFF; --btn-2nd-bg:#ECFCFB; --btn-2nd-fg:#00404D; --radius:16px;` |
| EDU-蓝 | 通用教学、英语、信息技术、清爽练习 | `--bg:#DFEDFF; --text:#0F2336; --primary:#278DEA; --accent:#40A10B; --card:#FFFFFF; --card-border:rgba(15,35,54,.30); --demo-bg:#FFFFFF; --demo-border:rgba(15,35,54,.30); --demo-grid:#F1F5FB; --btn-primary-bg:#83FE91; --btn-primary-fg:#232323; --btn-2nd-bg:#DFEDFF; --btn-2nd-fg:#000000; --radius:16px;` |
| EDU-绿 | 生物、自然、劳动、环保主题 | `--bg:#E2ECD3; --text:#012B1F; --primary:#405E28; --accent:#549B22; --card:#F7FDF6; --card-border:rgba(1,43,31,.30); --demo-bg:#F7FDF6; --demo-border:rgba(0,0,0,.30); --demo-grid:#ECF1E6; --btn-primary-bg:#405E28; --btn-primary-fg:#E2ECD3; --btn-2nd-bg:#F7FDF6; --btn-2nd-fg:#012B1F; --radius:16px;` |
| EDU-橙 | 语文、历史、地理、低龄活力主题 | `--bg:#FFF3D9; --text:#3D3334; --primary:#F8981F; --accent:#9D3E00; --card:#FFFFFF; --card-border:rgba(0,0,0,.30); --demo-bg:#FFFFFF; --demo-border:rgba(0,0,0,.30); --demo-grid:#ECECEC; --btn-primary-bg:#F8981F; --btn-primary-fg:#000000; --btn-2nd-bg:#FFF6E3; --btn-2nd-fg:#000000; --radius:16px;` |
| EDU-深青 | 理化实验、夜间观察、沉浸式模拟 | `--bg:#0F302F; --text:#EEFFEB; --primary:#06B17A; --accent:#B6FCE5; --info:#E44B40; --card:#123A37; --card-border:rgba(238,255,235,.30); --demo-bg:#123A37; --demo-border:#526F68; --demo-grid:#164441; --btn-primary-bg:#06B17A; --btn-primary-fg:#FFFFFF; --btn-2nd-bg:#184C49; --btn-2nd-fg:#EEFFEB; --radius:16px;` |
| EDU-暗黄 | 几何感、科技感、黑板式演示 | `--bg:#000000; --text:#FFFFFF; --primary:#F8EF50; --accent:#03DEDE; --card:#232323; --card-border:rgba(188,227,223,.30); --demo-bg:#232323; --demo-border:rgba(188,227,223,.30); --demo-grid:#393939; --btn-primary-bg:#F8EF50; --btn-primary-fg:#000000; --btn-2nd-bg:#414141; --btn-2nd-fg:#FFFFFF; --radius:16px;` |

演示对象的辅助色从主色板中派生，优先使用 `--primary`、`--accent`、`--info` 和高对比补色。理科和互动演示至少要让“对象、状态、反馈”三类信息颜色不同；深色板必须提高亮度和文字对比，避免舞台显暗。

## 课件页结构

每页是 960×540 的固定教学画布，不是普通长网页。推荐根结构如下：

```html
<div class="page-container">
  <header class="page-title">
    <p class="eyebrow">学科 / 单元</p>
    <h2>本页核心问题</h2>
  </header>
  <section class="page-layout">
    <div class="demo">演示对象或互动舞台</div>
    <aside class="card">步骤、提示、规则或反馈</aside>
  </section>
  <footer class="toolbar">按钮、状态、反馈</footer>
</div>
```

讲解页使用标题区 + 双栏卡片 + 提示区；互动页使用标题区 + 大演示区 + 控件条 + 反馈区；练习页使用题目区、选项区、确认按钮、反馈解析和进度状态；小结页使用卡片列表和高亮提示；封面页可以轻微同色系渐变，但主标题必须大、居中或接近视觉中心，并保留学科标签或任务标签。

最高约束是每页不滚动。一个 `template.page-data` 就是一张 960×540 课件页，必须完整承载当前页任务；页面内部、主容器、侧栏、演示区和反馈区都不应出现滚动条。一个页面内容过多时，必须拆页、精简、改成分步状态或同页切换，不要纵向硬塞，也不要把按钮、反馈或下一步入口挤到不可见区域。每页都要有清楚阅读顺序：先主题，再主体内容或演示，再操作和反馈。

## page-shared CSS 基线

共享变量、基础样式和通用组件应写入 `template.page-shared`，每页复用。下面是可直接迁入 `page-shared` 的基线：

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
html, body {
  margin:0;
  width:100%;
  height:100%;
  font-family:"PingFang SC","Microsoft YaHei",system-ui,sans-serif;
  color:var(--text);
  background:var(--canvas-bg);
}
.page-container {
  width:100%;
  height:100%;
  max-height:100%;
  padding:24px 30px;
  overflow:hidden;
  background:var(--canvas-bg);
  display:flex;
  flex-direction:column;
  gap:14px;
}
.page-title {
  display:flex;
  align-items:flex-end;
  justify-content:space-between;
  gap:16px;
  flex-shrink:0;
}
.page-title h2 {
  margin:0;
  color:var(--primary);
  font-size:30px;
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
.page-layout {
  flex:1;
  min-height:0;
  display:grid;
  grid-template-columns:minmax(0, 1.4fr) minmax(220px, .8fr);
  gap:14px;
}
.card {
  background:var(--card);
  border:2px solid var(--card-border);
  border-radius:var(--radius);
  padding:14px 16px;
}
.demo {
  min-height:0;
  background:var(--demo-bg);
  border:2px solid var(--demo-border);
  border-radius:var(--radius);
  background-image:
    linear-gradient(var(--demo-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--demo-grid) 1px, transparent 1px);
  background-size:30px 30px;
}
.toolbar {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  flex-shrink:0;
}
.btn {
  min-height:42px;
  padding:8px 18px;
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

`color-mix()` 可用时用于舞台底色混合；如果目标浏览器不支持，提供接近的纯色 fallback。不要把页面、卡片和按钮都设成纯白；白色主要留给卡片、选项块和局部阅读区。

## 字号与密度

封面主标题建议 40-48px；普通页标题 28-34px；小标题 18-22px；正文 16-18px；注释和标签 13-14px；按钮文字 15-16px。中文行高保持 1.5-1.7。课件页的空间比普通网页更紧，标题要有力量，但卡片、侧栏、按钮和反馈区的字不能抢走主体演示区。

每页标题下留 10-16px；卡片内边距保持 14-18px；主舞台和侧栏间距 12-16px；按钮之间至少 8px。不要用过小浅灰字承载核心说明，不要让长句挤压按钮。

## 页型配方

封面页使用大标题、学科标签、1 个视觉主对象和 1 句学习目标。概念页使用“定义/观察/例子/提示”分区，避免大段文字。例题页保留题干、关键步骤和结论，步骤不超过 4-5 段。互动页必须把演示舞台放在视觉中心，控件和反馈紧邻主体。练习页默认一题一屏或同页逐题切换，反馈解析要和当前题保持绑定。总结页使用卡片列表、关键词或对照表，不要堆满段落。

演示区必须有视觉质感：浅灰或色板底色、细网格、清楚边框、多色对象、状态标签。非数学图示可以用装饰网格；数学坐标、函数、统计图必须使用真实坐标关系，不要套用装饰网格当坐标系。

## 防溢出

多页课件以 960×540 为核心画布。生成时要同时考虑初始态、反馈态、展开解析、切换题目、拖拽完成和动画结束后的布局。出现超量内容时必须拆页、精简或改成分步状态，不允许使用 `overflow:auto` 或任何页内滚动容器；不要让整页 body 撑高，也不要用 `overflow:hidden` 掩盖被裁掉的核心内容。

按钮、反馈、进度、得分和重置入口必须始终可见。互动页的“当前状态”应始终可见，例如已选答案、动画是否运行、题号、得分、正确/错误反馈。生成后必须确认每页 iframe 内 `scrollWidth <= clientWidth` 且 `scrollHeight <= clientHeight`；如果不满足，回到版式和内容重排。

## 反模板感清单

生成前自查这些问题：紫蓝渐变铺满封面或卡片；卡片靠阴影漂浮；标题和按钮堆 emoji；默认蓝 `#2563eb` 贯穿全课件；圆角大小混乱；演示区纯白无边界；每页只有卡片没有舞台；按钮没有明确主次；大段浅灰细字；控件和反馈相距太远；页与页之间风格完全不一致。出现这些问题时，优先回到色板、结构和组件配方重写样式，而不是再加装饰。
