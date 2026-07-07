# 课件 HTML 生成指南

AI **只负责编写每页的教学内容 HTML 片段**，壳功能（缩略图、主区预览、演示模式、键盘翻页、焦点管理等）由云端框架 JS 自动提供，**禁止手写壳代码**。最终交付一个 `.html` 文件，浏览器打开即可使用。

---

## 一、工作流总览

> 本文件是 courseware-generator 技能的 Phase 4 子流程。进入本流程时，课件大纲已由 Phase 1（outline-guidance.md）生成并经 Phase 2 用户确认，所需素材已由 Phase 3 准备完毕。

```
步骤 0-T  字体样式选择：读取 typography-guide.md，自主选择 1 套字体 preset，并写入 page-shared
  ↓
步骤 0-A  封面图角色与封面版式选择：读取 cover-layout-guide.md，为第 1 页确定 data-cover-visual 与 data-cover-layout
  ↓
步骤 0  复杂度评估：根据已确认大纲，评估各页生成复杂度权重
  ↓
步骤 1  生成：创建 HTML 骨架 → 按复杂度分批生成页面内容 → 逐批注入骨架
  ↓
步骤 2  验收与首次交付：逐页核对大纲 → 调用 publish_resource 首次发布
  ↓
步骤 3  发布后版面替换：首次发布原版后 → 使用 Phase 1 已确认的模板选择 → 对全部页面做安全替换 → 调用 publish_resource 二次发布模板版
```

> **⚠️ 前置条件**：
> 1. 对话历史中已包含经用户确认的完整课件大纲（含逐页设计表格）。大纲中的课标解读、教材分析、学情分析、学习目标等内容均已由 Phase 1 完成，本流程严格按大纲生成 HTML，不得偏离大纲内容。
> 2. Phase 3 已完成素材准备，图片和音频素材已获取 URL。生成 HTML 时须使用这些素材 URL，**严禁使用 base64 编码替代**。
> 3. 生成第 1 页封面前必须读取 `typography-guide.md`，自主选择 1 套字体 preset，并在 `page-shared` 中写入 `CW_TYPOGRAPHY_DECISION`、字体资源和 `--cw-courseware-*` 变量。
> 4. 生成第 1 页封面前必须读取 `cover-layout-guide.md`，先确定封面图角色与 7 种封面版式之一。
> 5. 对话历史中必须存在首次信息确认后形成的 `lockedPageCount`。进入 HTML 生成前必须确认逐页大纲行数等于 `lockedPageCount`，否则禁止创建骨架。

---

## 二、硬性规则

1. **不要读取、修改或手写壳代码**：缩略图渲染、主区预览、演示模式、键盘/鼠标翻页、焦点管理等功能全部由壳框架 JS 提供，AI 不需要了解其实现，也禁止自行实现。父文档只能是本指南的标准骨架，禁止写入任何 tracking、analytics、feature-flag、build-id、deployment-id、CMS Sync、metadata、checkpoint、preconnect、dns-prefetch、hidden marker 等无关脚本、标签或注释。
2. **完整流程最终交付两个 `.html` 版本**：先发布原版互动课件，再发布模板版互动课件。每次 `publish_resource` 仍只发布当前版本的一个入口 HTML 文件。
3. **每页内容写在 `<template>` 标签中**，由壳框架 JS 在浏览器中自动读取并渲染。
4. **首次验收通过后必须调用 `publish_resource`**，向用户发布基础互动课件；禁止把首次发布延后到模板替换之后。
5. **若发布后需要更换版面，必须在当前最新 HTML 文件上做增量替换**，替换完成后再次调用 `publish_resource` 发布新版；禁止抛弃当前文件重做一份新的整课件。
6. **首次发布完成后必须立刻进入模板后处理**，使用 Phase 1 已确认的 `selectedTemplateId`，禁止再次询问版面满意度；禁止发布后直接结束流程。
7. **模板替换必须覆盖全部页面**；普通页做页面视觉与颜色级替换，互动页做轻量颜色级替换，但同样不能漏页，且不能改组件样式。
8. **封面版式只能在首次生成时确定**；第 1 页标题位置、字号、封面图位置和文字安全区必须按 `cover-layout-guide.md` 在原版 HTML 生成时完成，模板后处理禁止重排。
9. **页数锁是 HTML 生成硬闸门**：HTML 里 `<template class="page-data">` 的数量必须等于 `lockedPageCount`，并且 `data-id` 必须从 1 连续到 `lockedPageCount`。禁止把 15-18 页课件压缩成 8 页核心版本，禁止合并、跳过、删除讲解页/练习页/总结页。数量不一致时不能发布，只能继续补齐或重建。
10. **字体样式只在原版生成前自主选择一次**：读取 `typography-guide.md` 后选择 1 套 preset，写入 `page-shared`。不调用 `ask_user`，不新增字体选择表单；Phase 7 模板后处理不得重新选择或覆盖 `--cw-courseware-*` 字体变量。
11. **字体必须可加载或可降级**：字体不是模型自带能力。使用 `typography-guide.md` 中已上传的真实静态 URL 声明所选 preset 的 `@font-face`；若新增字体没有真实资源 URL，必须使用 fallback 栈，禁止伪造 `<link>` 或 `@font-face`。

---

## 三、HTML 文件结构与共享资源

### 3.1 文件结构（必须严格遵循）

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>课件标题</title>
</head>
<body>

<!-- 可选：壳框架加载前的占位提示 -->
<div id="cw-loading" style="display:flex;align-items:center;justify-content:center;height:100%;font-family:system-ui,sans-serif;font-size:18px;color:#999;">
  加载课件中...
</div>

<!-- ========== 所有页面共享的外部资源与字体变量（必须保留唯一一个） ========== -->
<template class="page-shared">
  <!-- 此处内容会自动注入到每页 iframe 的 <head> 中 -->
  <!-- 例如：共享 CSS、字体资源、CW_TYPOGRAPHY_DECISION、图标库等 -->
</template>

<!-- ========== 页面内容（AI 编写的部分） ========== -->

<template class="page-data" data-id="1" data-name="封面">
  <!-- 第1页内容 -->
</template>

<template class="page-data" data-id="2" data-name="页面名称">
  <!-- 第2页内容 -->
</template>

<!-- ... 更多页面 ... -->

<!-- ========== 壳框架（固定引用，不要修改） ========== -->
<script src="https://musk-test.fbcontent.cn/pub-musk-ai-studio/user/upload/admin/HgSiredEejFXx94ofdiCZ8.js"></script>

</body>
</html>
```

### 3.2 关键说明

- `<title>` 标签的内容会显示在课件界面的工具栏中，请设置为课件标题。
- 每页用一个 `<template class="page-data">` 标签包裹：
  - `data-id`：页码序号（从 1 开始，决定页面顺序）。
  - `data-name`：页面名称（显示在缩略图侧边栏）。
- `<template>` 标签按 `data-id` 顺序排列。
- `<template class="page-shared">`：声明所有页面共享的外部资源，其内容会自动注入到**每页 iframe 的 `<head>` 中**。用于引入 CSS 框架（如 Tailwind CDN）、字体、图标库等。互动课件必须存在且只存在一个 `page-shared`，并在其中写入字体变量和共享 CSS。详见 3.4 节。
- `<script src="...">` 为壳框架 JS 的云端地址，**直接复制上方模板中的完整地址即可，不要修改此 URL**。此标签必须放在所有 `<template>` 标签之后、`</body>` 之前。
- 固定壳脚本 URL 在父文档中必须精确出现 **1 次**。父文档不得出现自写 `#cw-root`、自写翻页脚本、无关 analytics/feature flag/build marker 脚本，也不得在 `<!DOCTYPE html>` 前写入任何非空内容。
- `<div id="cw-loading">` 为可选占位元素，壳框架加载后会自动移除。
- **不要**在 `<template class="page-data">` 标签内写 `<!DOCTYPE>`、`<html>`、`<head>`、`<body>` 标签。壳框架会自动将内容包装为完整的 HTML 文档用于 iframe 渲染。
- **为支持发布后安全替换版面，每页必须输出最小语义钩子**，见 3.5 节。

### 3.3 `<template>` 内可以包含

- `<style>` 标签 — 该页的样式（仅作用于该页，不会影响其他页）。可用原生 CSS，也可使用通过 `page-shared` 引入的 CSS 框架工具类。
- HTML 元素 — 该页的可视内容。
- `<script>` 标签 — 该页的互动逻辑（如动画、题目交互等）。
- **注意**：`<script>` 中不可出现字面量 `</template>`（会提前闭合标签）。如确需此字符串，用 `<\/template>` 替代。

> **⚠️ 外部资源的正确引入方式：** 每页在独立 iframe 中渲染，不继承父文档的样式和脚本。要使用 Tailwind 等 CSS 框架，必须通过 `<template class="page-shared">` 声明（见 3.4 节），壳框架会自动注入到每页 `<head>` 中。**不要**在课件 HTML 的 `<head>` 中引入——那样只在父文档生效，各页 iframe 内无效。

### 3.4 共享外部资源（`page-shared`）

每页在独立 iframe 中渲染，是全新的 HTML 文档，**不继承课件 HTML 父文档的样式和脚本**。如果需要所有页面共用外部资源（CSS 框架、字体、JS 库等），须通过 `<template class="page-shared">` 声明，壳框架会自动将其内容注入到每页 `<head>` 中。

#### 使用示例

```html
<template class="page-shared">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4/fonts/remixicon.css" rel="stylesheet">
</template>
```

#### 规则

- 只需声明**一次**，放在所有 `<template class="page-data">` **之前**。
- 内容可以是 `<script>`、`<link>`、`<style>` 等任何合法的 `<head>` 子元素。
- 声明后，每页 `<template class="page-data">` 内可以直接使用对应的工具类、字体、图标等。
- 互动课件必须保留**唯一一个** `<template class="page-shared">`。即使不使用外部 CDN，也要在其中写入原版共享 CSS、字体变量与后续模板注入位置。
- 字体资源、`@font-face`、`CW_TYPOGRAPHY_DECISION` 注释和 `--cw-courseware-*` 字体变量必须写在 `page-shared` 中。不要写进父文档 `<head>`，也不要分散到每页重复声明。
- **禁止**在课件 HTML 的 `<head>` 中引入外部资源来期望各页继承——这样做无效，资源只会加载在父文档中。

### 3.5 发布后版面替换所需的最小语义钩子（必做）

为保证首次发布后的版面替换只改视觉层、不误伤互动与壳兼容性，**每页 `<template class="page-data">` 内都必须带上以下 `data-cw-role` 语义钩子**：

| 钩子 | 是否必需 | 用途 |
|------|---------|------|
| `data-cw-role="page-root"` | 必需 | 页面最外层可视容器，模板替换时只允许改页面背景、组件外文字颜色与弱装饰；字体继承原版 `--cw-courseware-*` 变量，禁止用根级 `color` 让组件框内文字继承模板颜色 |
| `data-cw-role="title-block"` | 必需 | 标题区容器，模板替换时只允许改已有标题文字的颜色和文字阴影，并继承原版标题字体变量；禁止新增题签文案，禁止改标题结构/字号/横杠/位置 |
| `data-cw-role="content-block"` | 必需 | 主内容区容器，模板替换时只允许让组件框外正文跟随模板颜色并继承原版正文字体变量；禁止让颜色规则穿透到 `component-shell`、`interactive-root`、`media-block`、`button-skin`、`feedback-layer` 内部 |
| `data-cw-role="media-block"` | 按需 | 图片、图表、音频播放器等媒体区容器，模板替换时作为保护边界，**禁止**改变媒体区内部文字颜色、内容图片本身颜色、素材或媒体组件结构 |
| `data-cw-role="component-shell"` | 有卡片/面板/题框时必需 | 普通页和互动页的组件框、面板框、题框、信息卡外壳；模板替换时组件框内文字颜色必须保持原样，禁止替换成新模板组件框 |
| `data-cw-role="button-skin"` | 有可点击按钮时必需 | 普通页和互动页的按钮、选项按钮、提交按钮、切换按钮；模板替换时按钮文字颜色、按钮结构和事件绑定保持原样，禁止替换按钮样式或结构 |
| `data-cw-role="interactive-root"` | 交互页必需 | 互动 DOM 的根容器，模板替换时**禁止重排其内部结构**，互动区内部文字颜色保持原样，只允许改页面背景和组件外文字层 |
| `data-cw-role="feedback-layer"` | 有反馈层时必需 | 正误反馈、解析弹层、提示层容器，模板替换时文字颜色和显示结构保持原样，禁止改事件逻辑和显示结构 |

#### 使用规则

- 每页只能有 **1 个** `page-root`。
- 第 1 页封面的 `page-root` 必须额外包含 `data-cover-layout="<coverLayoutId>"` 与 `data-cover-visual="<coverVisualRole>"`，取值只能来自 `cover-layout-guide.md`。若有封面图片，图片必须放入 `data-cw-role="media-block"` 且带 `data-cover-role="cover-visual"`、`data-cover-slot="<slotId>"` 的独立媒体层，禁止写成 `page-root` 的内联 `background-image`。
- 初次生成阶段允许原课件在 `page-shared` 中定义自己的页面背景；但进入发布后模板替换时，模板 CSS 必须位于所有原课件 `page-root` 背景、背景图和 `::before` 遮罩规则之后，确保模板背景最终生效。若模板后仍有未限定模板的 `page-root` 背景规则，视为假套版，禁止发布。
- 若初次生成阶段把背景写进 `page-root` 内联 `style`，后续模板替换只能删除这个 `page-root` 上的背景相关属性来让模板背景生效；禁止因此改动组件、按钮、标题、媒体框、图片框或反馈层的内联样式。
- 每页应有且仅有 **1 个**主 `title-block` 和 **1 个**主 `content-block`；若存在多列或多卡片布局，使用内部 class 继续细分，不要额外复制同名钩子。
- 普通页中的信息卡、题框、讲解框、图片区外框，尽量都包在 `component-shell` 内，便于模板识别保护边界；不得因此改变组件形状、尺寸、圆角、阴影、边框粗细、布局、文案和框内文字颜色。
- 所有真实可点击的按钮、选项块、切换按钮、提交按钮，尽量都挂上 `button-skin`，便于模板识别保护边界；不得因此替换按钮结构、尺寸、圆角、阴影、文字颜色或事件绑定。
- 含拖拽、选择、排序、Canvas、闯关等交互的页面，必须提供 `interactive-root`，并让交互脚本以内聚方式绑定其内部节点。
- `media-block` 若包含 `<img>`、`<svg>`、题图、插图等内容素材，模板替换不得改变媒体区内部文字颜色；**禁止**对素材节点本身施加 `filter`、`hue-rotate`、`mix-blend-mode`、`backdrop-filter`、着色遮罩或替换原图，也禁止把媒体组件改成新相框/贴纸结构。
- `button-skin` 只作为按钮保护边界；模板替换时必须保留原按钮节点的事件绑定关系，包括 `onclick`、监听函数名、`id`、脚本查询选择器和 `data-*` 标识，并保留原按钮结构、尺寸、圆角、阴影、文字颜色与文案。
- 纯装饰元素放在 `page-root` 内即可；若装饰覆盖在互动区上方，必须显式设置 `pointer-events: none`，禁止遮挡真实可点击元素。
- **禁止**把这些 `data-cw-role` 名称复用到无关节点，否则后置替换会误判施工边界。

#### 推荐结构示例

```html
<template class="page-data" data-id="3" data-name="重点讲解">
  <style>
    .lesson-page { min-height: 100%; padding: 32px 40px; background: #f7f3ea; }
  </style>

  <div class="lesson-page" data-cw-role="page-root">
    <header data-cw-role="title-block">
      <h1>重点讲解</h1>
    </header>

    <main data-cw-role="content-block">
      <section data-cw-role="component-shell" data-cw-role-slot="media-card">
        <div data-cw-role="media-block">
        <img src="..." alt="">
        </div>
      </section>
      <section data-cw-role="interactive-root">
        <!-- 交互主体 -->
        <button data-cw-role="button-skin">提交</button>
      </section>
    </main>

    <div data-cw-role="feedback-layer"></div>
  </div>
</template>
```

---

## 四、单页内容规范（画布、布局与内容预算）

每页内容在壳框架提供的 **960×540 像素固定画布**（16:9）内渲染。壳框架会自动为每页注入 base CSS：`*, *::before, *::after { box-sizing:border-box } html, body { margin:0; padding:0; width:960px; height:540px; }`。壳框架会自动检测内容是否溢出画布，仅在实际溢出时允许垂直滚动。

### 4.1 画布与布局

- 页面根容器（如最外层 `<div>`）使用 `min-height: 100%` 而非 `height: 100%`。正常时撑满 540px 画布，万一内容溢出时容器会自然增高，背景和 padding 随之延伸。
- **禁止使用 `100vh`**：在 iframe 中 `100vh` 取的是外层视口高度，会导致错乱。一律使用 `100%`。
- 建议为 body 或根容器设置 `padding` 留出安全边距（如 `padding: 30px 40px`）。

### 4.2 防溢出

- **所有元素应尽量完整落在 960×540 画布内**，防溢出的首选手段是**调整布局**或**精简内容**。
- **全程不溢出**：动画前/后、互动前/后（如展开答案、显示解析）的所有状态均应考虑溢出问题。设计时须同时校验初始态与所有终态/展开态。
- 内容过多时应拆分为多页或精简，不得强行塞入一页。
- **禁止在 `<style>` 或 `page-shared` 中对 `html`、`body` 或根容器设置 `overflow: hidden`**。壳框架已取消滚动裁切，以便万一内容溢出时用户仍可滑动查看。AI 生成的样式中不得重新加上此限制。

### 4.3 封面页特殊要求

- 第 1 页封面必须按 `cover-layout-guide.md` 选择 7 种封面版式之一，写入 `data-cover-layout`；禁止自由发明第 8 种封面结构。
- 第 1 页必须写入 `data-cover-visual`：`none`、`full-bleed-background`、`side-visual` 或 `inline-card`。
- 标题、说明、页脚、封面图位置必须使用 960×540 画布比例落位；不使用依赖当前浏览器缩放或设计稿截图尺寸的绝对坐标。
- 若封面有图片，必须从 `cover-layout-guide.md` 读取并记录 `coverImageSlot`，图片容器必须写 `data-cover-slot`，并按 slot 的 `x/y/w/h` 固定落位。禁止用 `flex: 1`、自动填充、随内容撑开等模糊布局替代图片槽位。
- 若封面生图作为整页背景，图片必须在独立 `cover-visual` 媒体层里铺满，不得写成 `page-root background-image`；后续模板注入时保留该图并禁用模板背景。
- 若封面生图只是局部主视觉，模板背景仍可保留，图片作为 `media-block` 保护，禁止滤镜、染色、换图或裁掉主体。

### 4.4 通用排版建议

- 标题 `font-size: 28px–36px`，正文 `16px–20px`，要点列表行距 `1.5–1.8`。
- 优先使用 flexbox/grid 做对齐与分区，避免绝对定位导致不同内容量时溢出。
- 配色建议使用教育课件常见方案：白底深文字、左侧色块装饰、圆角卡片等；每页可有轻微差异但整体风格统一。

> 以上（4.1–4.4）为画布布局与排版规则。以下（4.5–4.9）定义每页的**最高内容上限**（防溢出）。每页内容在 960×540 画布内渲染，超出即溢出。最低内容标准见第五节，规划大纲和生成内容时须同时满足下限和上限。

### 4.5 基础空间参数

| 参数 | 值 |
|------|-----|
| 画布尺寸 | 960 × 540 px |
| 推荐内边距 | 上下 30px、左右 40px |
| 可用内容区 | 880 × 480 px |
| 页标题占用 | ≈ 56px（含下边距） |
| 标题后剩余高度 | ≈ 424px |

### 4.6 文字容量速查（18px 正文基准）

| 布局方式 | 每行字数 | 内容区可用行数 | 安全字数上限 |
|----------|---------|-------------|------------|
| 单栏满宽（880px） | ~48字 | ~14行 | **≤ 400字** |
| 双栏（每栏 ~420px） | ~23字/栏 | ~14行/栏 | **≤ 200字/栏** |
| 卡片内（含内边距，宽 ~400px） | ~20字 | 视卡片高度 | **≤ 80字/卡** |

> 安全字数 = 理论容量 × 60%，已扣除段间距、区块间距、装饰元素等。

### 4.7 各页类型内容预算

#### 封面页

| 元素 | 上限 |
|------|------|
| 主标题 | 1行，≤ **12字**，字号 ≥ 40px |
| 副标题 | 1~2行，每行 ≤ **25字**，字号 18~20px |
| 装饰元素 | 不限，但不得遮挡标题 |

#### 目录页

| 元素 | 上限 |
|------|------|
| 页标题 | 1行，≤ 10字 |
| 目录条目 | ≤ **8条**，每条标题 ≤ **16字** |
| 条目描述（可选） | 每条 ≤ 10字 |

#### 讲解/精读页 —— 纯展示

| 元素 | 上限 |
|------|------|
| 页标题 | 1行，≤ 18字 |
| 正文总量 | ≤ **350字**（含所有要点、段落、注释） |

常见组合参考（可灵活选用，总量不超限）：

| 组合 | 各元素预算 |
|------|-----------|
| 要点式 | 要点 ≤ 5条 × 每条 ≤ 50字 + 总结 ≤ 100字 |
| 引用+分析式 | 引用框 ≤ 120字 + 分析 ≤ 3条 × 每条 ≤ 60字 + 小结 ≤ 50字 |
| 双栏对比式 | 左栏 ≤ 160字 + 右栏 ≤ 160字 + 标注 ≤ 30字 |

#### 例题页

| 元素 | 上限 |
|------|------|
| 页标题 | 1行，≤ 18字 |
| 题干 | ≤ **100字**（含条件、已知信息等） |
| 解题步骤 | ≤ **4步**，每步 ≤ **60字** |
| 易错提示/思路点拨（可选） | ≤ **60字** |
| 总文字量 | ≤ **400字** |

含 LaTeX 公式的例题，独立公式块按 2~3行文字估算，须从总量中扣减。

#### 讲解/精读页 —— 含交互（点击展开、逐步展示等）

| 元素 | 上限 |
|------|------|
| 页标题 | 1行 |
| 初始可见内容 | ≤ **250字** |
| 展开/揭示内容 | ≤ **100字** |

**空间预留规则**：初始态占用高度 ≤ 内容区的 70%（≈ 300px），展开增量 ≤ 30%（≈ 124px）。设计交互时先确认展开后会增加多少内容，再反推初始态应放多少。

#### 练习页

> 练习页按交互形式分为以下子类型。规划大纲时页类型标为「练习」，查预算时按实际交互形式对应下方子类型。

##### 选择题

| 元素 | 上限 |
|------|------|
| 题干 | ≤ **80字**（不超过 3行） |
| 选项 | ≤ **4个**，每项 ≤ **35字**（单行为佳，最多 1.5行） |
| 反馈/解析区 | ≤ **80字** |

须同时确认**答题前**和**答题后**（显示解析）两种状态均不溢出。

##### 填空题

| 元素 | 上限 |
|------|------|
| 说明文字 | ≤ 60字 |
| 填空区 | ≤ **4个空**，周围文字 ≤ 180字 |
| 反馈/答案区 | ≤ 60字 |

输入框按 40px 高估算，反馈区预留 ≥ 60px 高度。

##### 拖拽/排序题

| 元素 | 上限 |
|------|------|
| 指导语 | ≤ 40字 |
| 可拖拽项 | ≤ **6个**，每项标签 ≤ **15字** |
| 放置区 | ≤ **4个**，标签 ≤ 10字 |

须同时确认**初始态**（散落）和**完成态**（排好）均不溢出。

#### 分析/讨论页

| 元素 | 上限 |
|------|------|
| 页标题 | 1行 |
| 分析要点 | ≤ 3条，每条 ≤ 60字 |
| 辅助说明 | ≤ 100字 |
| 总文字量 | ≤ **300字** |

#### 小结/结束页

| 元素 | 上限 |
|------|------|
| 页标题 | 1行 |
| 总结要点 | 2~5条，每条 ≤ **40字** |
| 结语 | ≤ 30字 |

### 4.8 交互状态空间预算通则

凡含交互的页面，无论页类型，均须遵循：

| 规则 | 说明 |
|------|------|
| **展开类**（点击显示答案、展开解析） | 初始态 ≤ 70% 高度 + 展开增量 ≤ 30% 高度 |
| **逐步展示类**（动画分步、渐进呈现） | 所有步骤全部展示后的**终态**必须不溢出 |
| **输入类**（填空、文本输入框） | 每个输入框按 40px 高估算 + 反馈区预留 ≥ 60px |
| **多状态通则** | 设计时须逐一列出所有可能的 UI 状态，每个状态均需在 480px 内容区高度内（即 540px 画布减去上下 30px 内边距） |

### 4.9 特殊元素空间估算

页面含以下元素时，须从该页类型的文字预算中**扣减**相应额度：

| 元素 | 估算占用高度 | 文字预算扣减量 |
|------|------------|-------------|
| 引用/原文框（带背景+内边距） | ≈ 80~120px | 减少 ≈ 100字 |
| 表格（3~5行） | ≈ 140~200px | 减少 ≈ 150字 |
| 图片/示意图（全宽） | 高度 ≤ 200px | 按实际高度折算，每 100px ≈ 减少 120字 |
| LaTeX 独立公式块 | ≈ 50~80px | 按 2~3行文字计 |
| 卡片网格（2×2） | ≈ 280~320px | 仅剩 ≈ 100~140px 给标题和说明 |

---

## 五、分页类型最低内容标准

> 第四节定义了每页的**最高**内容上限，本节定义**最低**内容标准。规划与生成时须对照，每页不得低于最低要求。

| 页类型 | 最低内容要求 |
|--------|-------------|
| 封面 | 标题 + 副标题（学科/年级/教材版本） |
| 目录 | 各节标题，可含页码或图标 |
| 讲解/精读 | 核心内容（原文/定义/规则）+ 要点 2～4 条或例证 ≥1；**禁止**仅「标题+一句笼统话」 |
| 分析/讨论 | 分析框架或讨论问题 + 要点/示例 ≥2 |
| 例题 | 题干 + 完整解答过程 + 可选思路/易错点 |
| 练习 | 题干 + 答案（或选项）；若有空间须有解析或提示 |
| 小结/结束 | 归纳或回顾要点 ≥2 条，**禁止**空白 |

---

## 六、互动页状态管理（必做）

含动画或题目交互的页面，须支持**状态保存与恢复**。壳框架的翻页规则：

| 翻页方向 | 行为 |
|----------|------|
| **往后翻**（→ 下一页） | 下一页始终以**全新初始态**加载。 |
| **往前翻**（← 上一页） | 如果上一页之前保存过状态，壳框架会自动**恢复到用户离开时的状态**（如已选的答案、已展开的解析、已完成的动画）。 |

### 6.1 页面 → 壳：保存状态（`saveState`）

每当页面内发生有意义的状态变化（用户答题、展开解析、动画完成等），页面应主动将当前状态上报给壳框架。`state` 对象的结构由页面自行定义，须能被 `JSON.stringify` 序列化。

```javascript
window.parent.postMessage({
  type: 'saveState',
  state: { /* 页面自定义的状态数据 */ }
}, '*');
```

### 6.2 壳 → 页面：恢复状态（`restoreState`）

壳框架在往前翻页时，会在页面 iframe 加载完成后发送之前保存的状态。页面须监听此消息并据此恢复 UI。

```javascript
window.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'restoreState') {
    var state = e.data.state;
    // 根据 state 恢复页面 UI...
  }
});
```

### 6.3 完整参考模板（选择题页面）

```html
<script>
  var myState = { answered: false, selected: null };

  function saveMyState() {
    window.parent.postMessage({ type: 'saveState', state: myState }, '*');
  }

  function onOptionClick(option) {
    myState.answered = true;
    myState.selected = option;
    // 更新 UI：高亮选项、显示反馈...
    saveMyState();
  }

  function restoreFromState(state) {
    if (!state.answered) return;
    myState = state;
    // 根据 state.selected 恢复 UI：
    // 高亮已选选项、显示正误反馈、禁用按钮...
  }

  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'restoreState') {
      restoreFromState(e.data.state);
    }
  });
</script>
```

### 6.4 注意事项

- **何时上报**：每次用户交互导致页面"看起来不同了"时都应 `saveState`。多次上报没有副作用，壳只保留最新一次。
- **⚠️ 必须即时上报，不能只在提交时上报**：翻页时壳框架会**立即销毁**当前页面（替换 iframe 内容），页面没有机会在被销毁前保存状态。因此**填空题必须在每次 `input` 事件时就调用 `saveState`**（保存当前输入值），选择题必须在每次选择时就调用，不能等到点击"提交"按钮才保存。否则用户填写了内容但未提交就翻页，翻回来时内容会丢失。
- **state 须可序列化**：不要在 state 中放 DOM 元素、函数等不可序列化的值。用基本类型（字符串、数字、布尔、数组、纯对象）。
- **restoreState 须完整恢复 UI**：包括禁用已点击的按钮、显示反馈文字、跳过入场动画等。恢复后的页面外观应与用户离开时一致。**restore 函数中不要调用带有"防重复执行"守卫的原始交互处理函数**，应直接恢复 UI 或先重置守卫标记再调用。
- **非互动页不需要实现**：纯展示页面（概念讲解、封面、小结等）无需添加这两个协议。
- **动画页**：如有入场动画，`restoreFromState` 中应跳过动画、直接显示动画终态。
- 规划时对含互动/题目的页注明「须支持状态保存与恢复」。

### 6.5 拖拽/连线交互的防误翻页规范（必做）

壳框架在演示模式下会监听 iframe 内的点击事件，在非互动区域点击时自动翻页。为防止拖拽或连线操作松手时误触发翻页，**含拖拽/连线交互的页面必须遵守以下规范**：

#### 规则 1：拖拽进行时添加 `.dragging` 类

在 `mousedown`/`touchstart` 开始拖拽时，给被拖拽的元素（或 `document.body`）添加 `dragging` 类；在 `mouseup`/`touchend` 结束拖拽时移除。壳框架会检测 `.dragging` 类来判断是否有拖拽进行中，从而阻止翻页。

```javascript
el.addEventListener('mousedown', function(e) {
  el.classList.add('dragging');
  // ... 拖拽逻辑
});
document.addEventListener('mouseup', function() {
  el.classList.remove('dragging');
});
```

也可以使用 `data-dragging` 属性替代 `.dragging` 类，效果相同。

#### 规则 2：为拖拽元素和放置区添加交互标记

拖拽元素应设置 `draggable="true"` 属性或 `data-interactive` 属性，放置目标区域也应添加 `data-interactive` 属性。壳框架会识别这些标记，避免在这些元素上触发翻页。

```html
<div class="drag-item" draggable="true" data-interactive>拖拽项</div>
<div class="drop-zone" data-interactive>放置区</div>
```

#### 规则 3：连线交互的 canvas/svg 须添加标记

连线交互通常使用 `<canvas>` 或 `<svg>` 元素。壳框架已自动识别这两个标签为交互元素。如果连线使用普通 `<div>` 实现，须添加 `data-interactive` 属性。

#### 完整拖拽模板

```javascript
var dragItems = document.querySelectorAll('.drag-item');
dragItems.forEach(function(item) {
  item.addEventListener('mousedown', function(e) {
    e.preventDefault();
    item.classList.add('dragging');
    // ... 开始拖拽
  });
  item.addEventListener('touchstart', function(e) {
    item.classList.add('dragging');
    // ... 开始拖拽
  }, { passive: false });
});
document.addEventListener('mouseup', function() {
  document.querySelectorAll('.dragging').forEach(function(el) {
    el.classList.remove('dragging');
  });
});
document.addEventListener('touchend', function() {
  document.querySelectorAll('.dragging').forEach(function(el) {
    el.classList.remove('dragging');
  });
});
```


## 七、数据收集 SDK 接入规范（仅当本课件需要数据收集时）

> 本节仅适用于「需要采集学习数据」的课件（练习课、答题闯关、需要看作答报告等）。**纯讲解类、纯展示类课件无需接入数据收集 SDK，跳过本节即可。** 是否需要数据收集，由 `data-collect` 技能决定。
>
> **若本课件需要数据收集，则第一页必须包含身份采集 UI**（详见 7.3）。

数据收集 SDK 用于把学生作答、互动数据上报到平台，让教师查看作答报告。SDK 全局类名 `MuskCollect`，主要方法：

- `save(collection, data)`：上报一条数据（写）
- `query(collection)`：拉取已上报数据（读）

`instanceId`（实例 ID）会自动从顶层 URL 参数解析，AI 无需关心。

### 7.1 SDK 由壳框架自动注入，禁止手动引入

壳框架已在每个子页 `srcdoc` 的 `<head>` 同步注入 `musk-collect.js`。

- ✅ 在 `<template class="page-shared">` 或 `<template class="page-data">` 的 `<script>` 中**直接** `new MuskCollect()` 即可使用。
- ❌ **禁止**在任何位置手写 `<script src=".../musk-collect.js">`，重复加载浪费带宽且可能产生竞态。

#### 反例：不要假定 `window.muskCollect` 是预置实例

shell **只注入 SDK 的类**（`window.MuskCollect`，首字母大写），**不会自动创建实例**。实例必须自己 `new`：

```js
// ❌ 错误：window.muskCollect（小写驼峰）从未被赋值，永远是 undefined
//        if 短路保护 → save 静默失败 → 控制台无报错 → 服务端 0 数据
if (window.muskCollect) {
  await window.muskCollect.save('answers', { qid: 1, answer: 'A' })
}

// ✅ 正确：自己实例化
const collect = new MuskCollect()
await collect.save('answers', { qid: 1, answer: 'A' })
```

> 注意区分：`window.MuskCollect`（大写，SDK 提供的**类**）vs 自己起名的实例变量（如 `collect`、`sdk`）。**不存在** `window.muskCollect`、`window.sdk` 这样的"全局预置实例"。

### 7.2 渲染模式守卫（重要）

壳框架向每个子页注入了全局变量 `window.__CW_MODE__`，取值：

| 取值 | 含义 |
|---|---|
| `'main'` | 主框架渲染（学生当前正在看/答题的页面） |
| `'presentation'` | 演示模式渲染（全屏放映同一页） |
| `'thumbnail'` | 左侧缩略图列表渲染（每页都会渲染一份用于侧栏预览） |

**写类操作**（`save`、修改服务端状态等）**必须**做缩略图守卫，否则缩略图渲染时也会上报，造成数据污染：

```js
const collect = new MuskCollect()

async function submitAnswer(qid, answer) {
  if (window.__CW_MODE__ === 'thumbnail') return  // ← 缩略图不上报
  await collect.save('answers', { qid, answer })
}
```

**读类操作**（`query` 渲染答题历史等）**不需要**守卫，让缩略图也能展示真实数据，保证侧栏预览准确。

### 7.3 身份信息：第一页采集，后续页复用

**职责契约**（必须遵守）：

| 角色 | 职责 |
|---|---|
| **第一页** | 设计身份采集 UI（形式自由：表单、卡片、引导页、弹层均可，由 AI 按课件主题决定），让用户输入姓名/班级等必要信息；采集完成后写入 `window.parent.sessionStorage[STUDENT_KEY]` |
| **后续页** | 从 `window.parent.sessionStorage[STUDENT_KEY]` 读取身份，**禁止**重复采集 |
| **缩略图守卫** | 第一页 UI **可以渲染**（保证侧栏视觉一致），但**不能**触发提交写入（避免缩略图污染缓存） |

**为什么用 `window.parent.sessionStorage`？**

子页 srcdoc 切换会重建文档，`window.sessionStorage` 会丢；`window.parent.sessionStorage` 属于 host 主框架，所有子页共享、关闭 tab 自动清空，是跨页共享的最佳容器。

#### 第一页参考实现

UI 部分由 AI 按课件主题自由设计，下面只给出"查缓存 → 采集 → 写缓存"的流程模板：

```js
const STUDENT_KEY = 'musk-student-info'

async function ensureStudentInfo() {
  // 已采集 → 直接复用
  const cached = window.parent.sessionStorage.getItem(STUDENT_KEY)
  if (cached) return JSON.parse(cached)

  // 未采集 → 用你设计的 UI 让用户填，返回 { name, class, ... }
  const info = await collectFromUI() // ← 由你实现 UI 与提交逻辑

  window.parent.sessionStorage.setItem(STUDENT_KEY, JSON.stringify(info))
  return info
}

if (window.__CW_MODE__ !== 'thumbnail') {
  ensureStudentInfo().then(info => {
    // ... 后续业务（如初始化页面、跳转下一页等）
  })
}
```

#### 后续页读取（含 fallback）

```js
const STUDENT_KEY = 'musk-student-info'
const cached = window.parent.sessionStorage.getItem(STUDENT_KEY)
const info = cached ? JSON.parse(cached) : null

if (!info) {
  // fallback：用户跳过第一页直接进来
  // 用 HTML 元素提示"请回到第一页完成身份信息填写"，禁用本页交互
  showStudentInfoMissingHint()
  return
}

const collect = new MuskCollect()
await collect.save('answer', { ...info, qid: 1, answer: 'A' })
```

#### 注意事项

- 身份采集 UI **禁止**用 `alert`/`prompt`/`confirm`（演示模式下会强制退出全屏）
- 缩略图模式（`window.__CW_MODE__ === 'thumbnail'`）下不要触发写入

### 7.4 自检 checklist

提交前对照检查：

- [ ] 没有手写 `<script src=".../musk-collect.js">`
- [ ] 用 `const collect = new MuskCollect()` 创建实例，**没有**假定 `window.muskCollect` / `window.sdk` 等小写驼峰是预置实例
- [ ] 所有 `collect.save()` 调用前都有 `if (window.__CW_MODE__ === 'thumbnail') return`
- [ ] 第一页有身份采集 UI，采集结果写入 `window.parent.sessionStorage`
- [ ] 后续页从 `window.parent.sessionStorage` 读取身份信息，未重复采集
- [ ] 后续页对"sessionStorage 为空"的异常情况有 fallback 提示
- [ ] 身份采集用 HTML 元素实现，没有用 `alert`/`prompt`/`confirm`
---

## 八、壳框架提供的能力（AI 无需实现）

以下功能由壳框架 JS 自动处理，AI **不需要也不应该**在输出 HTML 中实现：

- 壳布局：左侧缩略图侧栏 + 右侧工具栏与主区预览
- 三处统一 16:9 画布（960×540）+ scale 适配（缩略图 / 主区 / 演示模式）
- 缩略图页码显示、选中高亮、点击切换
- 演示模式（播放按钮、全屏、ESC退出）
- 键盘翻页（←↑ 上一页、→↓空格 下一页）
- 鼠标滚轮翻页
- 点击非互动区域翻页
- 焦点管理（focusout + setInterval 双重保障）
- 窗口 resize 时重算 scale（带防抖）
- 状态保存与恢复（saveState / restoreState 协议）
- 退出演示时同步主区状态
- 自动为每页注入 base CSS（960×540）
- 自动将 `<template>` 内容包装为完整 HTML 文档
- 加载占位元素自动移除
- 响应式适配（窄屏缩小侧栏等）

---

## 九、步骤 0-T —— 字体样式选择

进入封面版式选择、复杂度评估和页面分批前，必须先确定整份互动课件的字体样式。该决策属于首次生成原版课件的一部分，不属于模板后处理。

执行方式：

1. 读取 `typography-guide.md`。
2. 根据课时内容、学科、年级、素材风格、封面图角色和用户已选模板，选择 1 套 `selectedTypographyPreset`。模板只作为参考，不建立强绑定。
3. 输出内部字体决策记录，至少包含：`selectedTypographyPreset`、字体类别、选择理由、资源加载方式、fallback 栈是否可用。
4. 在创建 HTML 骨架时，把字体资源和 CSS 变量写入唯一的 `page-shared`：
   - `CW_TYPOGRAPHY_DECISION`
   - `--cw-courseware-title-font`
   - `--cw-courseware-body-font`
   - `--cw-courseware-label-font`
   - `--cw-courseware-note-font`
   - `--cw-courseware-latin-accent-font`
5. 若所选 preset 在 `typography-guide.md` 中有已上传字体 URL，必须用这些真实 URL 在 `page-shared` 声明 `@font-face`；若未来新增字体没有真实 URL，禁止写假链接，只写 fallback 栈。
6. 生成页面时，组件框外标题、正文、标签和注记应使用这些变量。组件内部如题框、按钮、反馈层可以使用原本更合适的可读字体，但模板后处理不得再改变它们。

硬规则：

- 不调用 `ask_user` 选择字体，不新增字体表单字段。
- 一份课件只选一个主 preset；不要逐页随机换字体。
- 像素体、西文手绘体只能做标题/标签/英文点缀，不能用于中文长正文、题目正文、公式和计算步骤。
- 数学公式、代码、化学式等内容使用清晰系统字体或专用渲染，不套装饰字体。
- Phase 7 模板后处理必须保留 `CW_TYPOGRAPHY_DECISION` 和 `--cw-courseware-*` 变量；模板字体只能作为 fallback。

---

## 十、步骤 0-A —— 封面图角色与封面版式选择

进入复杂度评估和页面分批前，必须先处理第 1 页封面。封面版式涉及标题字号、标题位置、说明文字位置、页脚位置和封面图位置，属于首次生成的页面结构，不能留到 Phase 7 模板注入时修改。

执行方式：

1. 确认已完成步骤 0-T，并已选择字体 preset。
2. 读取 `cover-layout-guide.md`。
3. 根据 Phase 3 素材清单与大纲第 1 页设计，判断封面图片角色：
   - `none`：无封面主视觉图。
   - `full-bleed-background`：生图铺满整页，作为封面主视觉背景。
   - `side-visual`：生图作为左侧/右侧局部主视觉。
   - `inline-card`：生图作为下方/局部卡片图。
4. 按 `cover-layout-guide.md` 从 7 种版式中选择一个 `data-cover-layout`，并确定该版式的 `coverImageSlot`。
5. 输出一行封面版式决策记录，至少包含：封面页码、`data-cover-visual`、`data-cover-layout`、`coverImageSlot.slotId`、`targetPx`、`aspectRatio`、选择理由、图片是否需要避让文字区。
6. 若第 1 页封面图在 Phase 3 已生成，必须核对该图片是否按同一 `coverImageSlot` 的目标比例生成；若明显不匹配，禁止用裁切硬塞，必须改用 `contain` 保护主体、换兼容版式，或重新按 slot prompt 生图。
7. 生成第 1 页封面 HTML 时必须把上述决策写入 `page-root` 和封面图片媒体层：

```html
<div data-cw-role="page-root"
     data-cover-visual="side-visual"
     data-cover-layout="cover-05-left-visual-right-title">
  <div data-cw-role="media-block"
       data-cover-role="cover-visual"
       data-cover-slot="cover-05-left-visual">
    <img src="..." alt="">
  </div>
</div>
```

硬规则：

- 若 `data-cover-visual="full-bleed-background"`，模板背景后续不能覆盖封面图；图片必须放入独立 `cover-visual` 媒体层。
- 若 `data-cover-visual="side-visual"` 或 `inline-card`，模板背景仍可用于封面，封面图作为 `media-block` 内容资产被保护。
- 若 `data-cover-visual="none"`，封面完全使用模板背景与页面视觉系统。
- `coverImageSlot` 是图片容器的真实大小约束。封面生图 prompt、素材清单、HTML 媒体层 `data-cover-slot` 必须三者一致。
- 版式一旦确定，Phase 7 禁止修改 `data-cover-layout`，禁止移动标题、说明、页脚或封面图位置。

---

## 十一、步骤 0 —— 复杂度评估（基于已确认大纲）

进入本流程时，对话历史中已包含经用户确认的完整课件大纲（由 outline-guidance.md 生成）。大纲中包含逐页设计表格，每页有页码、页面类型、教学内容、教学活动设计、交互设计等信息。

### 8.1 从大纲中提取关键信息

从对话历史中已确认的大纲提取以下信息，作为后续 HTML 生成的依据：

| 信息 | 来源 | 用途 |
|------|------|------|
| 课件基本参数 | Phase 1 信息确认（课时内容、年级、册次、教材版本、已确认的具体页数等） | HTML `<title>`、文件命名和页数校验 |
| `lockedPageCount` | Phase 1 信息确认后形成的页数锁记录 | HTML 总页数、分批计划、发布硬校验 |
| 教学目标 | 大纲中「■ 学习目标与重难点」模块 | 验收时核对覆盖度 |
| 逐页设计表格 | 大纲中「■ 逐页课件设计」表格（页码/页面类型/教学内容/教学活动设计/交互设计） | 驱动每页 HTML 生成 |
| 教材内容分析 | 大纲中「■ 教材内容分析」模块 | 确保内容引用准确 |
| 素材清单 | Phase 3 素材准备的产出（图片 URL、音频 URL、题目内容等） | 嵌入对应页面，严禁用 base64 替代 |

### 8.1.1 页数锁核对（步骤 0 的第一动作）

在页面分类、复杂度评估、封面版式选择和骨架创建之前，必须先完成页数锁核对：

1. 从对话历史读取 `Page Count Lock: selectedPageRange=...; lockedPageCount=N; ...`。
2. 统计已确认大纲「■ 逐页课件设计」表格行数，必须等于 `N`。
3. 检查页码必须是 `1..N` 连续单页整数。
4. 若大纲行数少于或多于 `N`，或页码不连续，禁止继续 HTML 生成，必须回到大纲阶段补齐/修复。
5. 分批计划必须覆盖 `1..N` 全部页码。不得只选择“核心内容页”“重点页”“先做 8 页版本”进入生成。

该核对结果必须作为内部记录保留，后续 `Page Implementation Ledger`、首次发布、模板发布都以同一个 `lockedPageCount` 为准。

### 8.2 页面分类：强互动页 vs 普通页

逐页扫描大纲的**交互设计**列，判断每页属于强互动页还是普通页。

**强互动页的判定准则**（满足任一即为强互动）：

1. **学生需要动手操作的探究活动**——如拖拽学具/器材、拖拽排序/匹配/分类、涂抹/划线、连线配对等，学生通过操作完成学习任务
2. **需要 Canvas/SVG/3D 动态渲染的可视化**——如几何图形变换、实验模拟、物理现象动画、数据图表生成等，超出了 CSS 动画的表现力
3. **游戏化的练习机制**——如闯关答题、计时挑战、积分排名、卡片翻转配对等，将练习包装成小游戏形式
4. **需要实时判定和差异化反馈的互动练习**——如拖拽到正确/错误位置后给出不同的动画和音效反馈，而非简单的"显示答案"

**不是强互动的典型情况**：
- 点击按钮展开/收起内容、逐步显示、切换标签页
- 纯播放音频/视频
- 简单的"点击显示答案"
- 静态信息展示（哪怕布局很精美）

**关键词辅助**：交互设计列包含"拖拽/拖放/Canvas/3D/闯关/游戏/连线/配对/排序/模拟/涂抹/划线/计时挑战"等关键词时，大概率为强互动页。

> 每份课件通常有 2-5 页被判定为强互动页。如果一份课件没有任何页面命中以上准则，则全部按普通页处理。

### 8.3 强互动页交互剧本设计（步骤 0 的必需产出）

识别出强互动页后，**必须先逐页输出交互剧本，再进入步骤 1 生成代码**。交互剧本是步骤 0 的正式产出物，不可跳过。

**执行方式**：对每个强互动页，按以下五个维度输出一段交互剧本文本：

1. **交互元素与操作方式**——哪些元素可操作，如何操作（拖拽/点击/输入等）
2. **过程反馈**——操作中的实时视觉效果（跟随移动、悬停高亮、放大阴影等）
3. **结果反馈**——正确与错误须有差异化反馈（正确：弹性动画+粒子+音效；错误：抖动+提示音+正确答案）
4. **完成态**——全部完成后的庆祝/总结效果（庆祝动画+得分面板+鼓励语）
5. **技术标注**——推荐使用的技术（anime.js 弹性动画、Web Audio API 合成音效、Canvas/SVG 绘图等）

**输出格式示例**：

```
■ 强互动页交互剧本

第5页「发生装置选择」：
(1) 元素：左侧2个药品卡片（高锰酸钾/过氧化氢），右侧2个装置图（固体加热型/固液不加热型）
(2) 过程反馈：卡片跟随手指平滑移动+轻微放大+阴影，悬停装置区时边框发光
(3) 结果反馈：正确→卡片弹性缩放吸附+绿色粒子扩散+叮音效；错误→卡片抖动弹回原位+嗡音效
(4) 完成态：全部匹配后显示总结面板「装置选择逻辑：反应物状态+反应条件」+庆祝动画
(5) 技术：anime.js弹性动画 + Web Audio API合成音效 + mousedown/mousemove自定义拖拽

第12页「拖拽分类游戏」：
(1) ...
```

**⚠️ 流程强制**：步骤 0 结束时必须输出完整的交互剧本，之后步骤 1 中生成强互动页代码时须严格按照交互剧本实现，不得简化。

### 8.4 强互动页的生成质量要求

强互动页应追求**游戏级的交互体验**，而非表单级的功能实现：
- 所有拖拽/点击操作必须有即时视觉反馈（动画、颜色变化、缩放），禁止"点击后静默变化"
- 正确/错误判定必须有差异化反馈（动画 + Web Audio API 音效均不同）
- 完成态必须有仪式感（庆祝动画、得分面板、鼓励语等）
- 善用 anime.js 实现弹性动画和粒子效果
- 强互动页的 JS 代码量应 >= 100 行
- 强互动页在生成过程中可按需调用 `generate_image` 和 `generate_voice` 补充生成交互所需的图片和音频素材（如游戏背景图、角色插画等），不受 Phase 3 素材清单限制；其中 `generate_image` 只能在模型已判断确需额外图片素材时调用，调用前必须读取 `image-generation-guide.md`，对每条图片描述做命中式 prompt 增强，命中后按固定映射追加风格，不命中不套风格

### 8.5 通用生成规则

- **严格按大纲生成**：每页内容必须与大纲逐页设计表格中的教学内容和教学活动设计完全对应，不得偏离、遗漏或自行添加。
- **交互按大纲实现**：大纲中标注了交互设计的页，须实现对应功能。
- **内容引用准确**：教材内容、公式、定义等须与大纲中教材内容分析模块一致，禁止篡改或凭空编写。
- **禁止使用方向键（↑↓←→）和空格键作为交互手段**：壳框架在放映模式下会拦截这些按键用于翻页。交互应基于**点击、触摸、拖拽**等方式。

**步骤 0 产出物检查**：进入步骤 1 之前，确认以下两项均已完成：
- [ ] 所有页面已分类（强互动 / 普通）
- [ ] 每个强互动页已输出五维度交互剧本

---

## 十二、步骤 1 —— 骨架创建与分批注入

### 9.1 核心原则：骨架 + 按页面分类分批注入

> **正确做法**：先创建包含注入标记的 **HTML 骨架文件**，然后按页面分类（强互动/普通）进行分批，每批通过 `edit_file` 将 `<template>` 标签**注入到骨架文件的标记位置**。每批内容只输出一次，直接到位，无需额外的组装步骤。

**优势**：
- 强互动页独占批次，获得完整的输出 Token 预算和注意力
- 普通页集中生成，高效紧凑
- 注入标记 `<!-- CW_PAGES -->` 是 18 字符的固定短字符串，匹配稳定可靠，不受文件大小影响
- `edit_file` 的原子性保证注入失败时不会破坏已有内容

### 9.2 创建骨架文件并记录 resourceId

在生成任何页面内容之前，先用 `create_file` 创建课件的 HTML 骨架文件。**创建成功后立即记录该文件的 `resourceId`**——后续所有 `edit_file` 操作都依赖此 ID。骨架包含完整的 HTML 外层结构、共享资源声明和注入标记 `<!-- CW_PAGES -->`：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>课件标题</title>
</head>
<body>

<div id="cw-loading" style="display:flex;align-items:center;justify-content:center;height:100%;font-family:system-ui,sans-serif;font-size:18px;color:#999;">
  加载课件中...
</div>

<template class="page-shared">
  <!-- 必须填入 typography-guide.md 选定的字体资源、CW_TYPOGRAPHY_DECISION 与 --cw-courseware-* 字体变量 -->
</template>

<!-- CW_PAGES -->

<script src="https://musk-test.fbcontent.cn/pub-musk-ai-studio/user/upload/admin/HgSiredEejFXx94ofdiCZ8.js"></script>

</body>
</html>
```

**关键说明**：
- `<!-- CW_PAGES -->` 是页面注入标记，后续每批生成的 `<template>` 标签都会插入到此标记之前。
- 壳框架 `<script>` 标签位于标记之后，确保所有页面注入完成后壳 JS 仍在最末尾。
- 骨架文件很短（~20 行），Token 消耗极低。
- **记录 resourceId**：`create_file` 返回的 resourceId 是后续第一次 `edit_file` 的操作目标，必须记录。

### 9.2.1 壳协议硬闸门

`create_file` 只能创建上方短骨架，页面内容必须后续用 `edit_file` 注入到 `<!-- CW_PAGES -->`。以下情况必须立即判定为“未生成合格互动课件”，禁止进入验收、模板替换或 `publish_resource`：

- 一次性创建了包含全部页面的完整 HTML，而不是“骨架 + 分批注入”。
- 页面写成 `<template data-id="p1">`、`<template data-id="1">`，但缺少 `class="page-data"`。
- HTML 中 `<template class="page-data">` 数量为 0，或数量少于 `lockedPageCount`。
- 页面被放进自写的 `#cw-root`、`.slide`、`.page`、自定义翻页容器、iframe/srcdoc、普通网页主容器中。
- 壳框架 `<script src="https://musk-test.fbcontent.cn/pub-musk-ai-studio/user/upload/admin/HgSiredEejFXx94ofdiCZ8.js"></script>` 缺失、被移动到页面前、被替换或被包进模板内。
- `<!-- CW_PAGES -->` 注入标记被删除，导致后续无法继续增量注入。

出现上述任一情况时，不能把工具返回的文件当作课件继续修饰；必须重新按 9.2 创建骨架，并按 9.4 逐批注入标准 `<template class="page-data">`。

### 9.3 分批策略：强互动独占 + 普通页打包

按第九节的页面分类结果，将页面装入批次。

分批前先建立覆盖计划：`plannedPages = 1..lockedPageCount`。所有批次页码的并集必须等于 `plannedPages`，交集必须为空。若分批结果只覆盖 1-8 页、漏掉后续讲解/练习/总结页，或把多页大纲合并成单页，必须立即重做分批计划。

#### 分批规则

1. **每个强互动页单独一个批次，一批仅含这一页**——禁止将多个强互动页合并到同一批次，也禁止与普通页混合。这保证每个强互动页获得完整的输出 Token 预算和注意力，产出游戏级的丰富交互代码。
2. **相邻强互动页之间的所有普通页打包为一个批次**——一次性生成。
3. **第一个强互动页之前的普通页**打包为第一批。
4. **最后一个强互动页之后的普通页**打包为最后一批。
5. **无强互动页的课件**：全部页面归入一批生成。
6. **强互动页生成时可按需调用素材工具**：如发现需要额外的图片或音频素材，可在生成过程中调用 `generate_image`、`generate_voice` 等工具补充生成，不受 Phase 3 素材清单限制；补调 `generate_image` 前必须读取 `image-generation-guide.md`，对每条图片描述逐条判断是否命中，命中后按固定映射增强 prompt，不命中保持原始图片需求。

#### 分批示例

**示例：20 页课件，第 5、11、17 页为强互动**

```
Batch 1: 第 1-4 页（封面+导入+新授×2）      ← 普通页打包
Batch 2: 第 5 页（拖拽匹配小游戏）           ← 强互动，独占
Batch 3: 第 6-10 页（新授×3+过渡+讲解）      ← 普通页打包
Batch 4: 第 11 页（实验模拟 Canvas 动画）    ← 强互动，独占
Batch 5: 第 12-16 页（讲解×3+例题+讨论）     ← 普通页打包
Batch 6: 第 17 页（闯关答题游戏）            ← 强互动，独占
Batch 7: 第 18-20 页（总结+作业+结束）       ← 普通页打包
```

→ 共 **7 批**：4 批普通页打包 + 3 批强互动独占。

### 9.4 分批生成并注入（逐批串行，跟踪 resourceId）

> **⚠️ `edit_file` 每次执行后会创建新文件（新 resourceId），原文件保持不变。因此每批注入后必须记录新文件的 resourceId，下一批须使用最新的 resourceId。各批次必须严格串行，禁止并行注入。**

每批生成完成后，**使用最新 resourceId 调用 `edit_file`** 将本批 `<template>` 标签注入：

```
edit_file:
  resourceId: <当前最新的 resourceId>
  editItems:
    - oldString: "<!-- CW_PAGES -->"
      newString: "<template class=\"page-data\" data-id=\"1\" data-name=\"封面\">
  <style>
    body { display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#667eea,#764ba2); color:#fff; text-align:center; }
    h1 { font-size:42px; margin-bottom:16px; }
  </style>
  <div>
    <h1>少年闰土</h1>
    <p>部编版 · 小学语文六年级上册</p>
  </div>
</template>

<!-- CW_PAGES -->"
```

即：将标记替换为「本批 `<template>` 标签 + 标记」。**标记始终保留在末尾**，供下一批继续注入。

**注入后立即更新 resourceId**：`edit_file` 执行成功后会返回新文件，**必须将新文件的 resourceId 记录下来**，替换之前保存的 resourceId。下一批注入、后续修改、验收读取等所有操作都必须使用这个最新的 resourceId。

**注入过程示意（含 resourceId 链式追踪）**：

```
创建骨架（create_file）→ 得到 resourceId_A
  ↓
第1批注入（edit_file, resourceId_A）→ 得到 resourceId_B
  ↓
（如有更多批次）第2批注入（edit_file, resourceId_B）→ 得到 resourceId_C → ...
  ↓
完成 → 最终课件 = 最后一个 resourceId 对应的文件（标记保留，供后续增页使用）
```

> 若无强互动页，只有一次注入：create_file → resourceId_A → edit_file → resourceId_B（完成）。

**常见错误**：多个批次同时对同一个 resourceId 调用 `edit_file`，导致分叉出多个文件，每个文件只包含一个批次的页面。**必须等上一批注入完成、拿到新 resourceId 后，才能开始下一批注入。**

**Page Implementation Ledger（必做）**：从第 1 批开始维护页面实现台账，格式至少包含：页码、页面标题、所属批次、是否已注入、当前最新 resourceId 后的 `<template class="page-data">` 计数。每批成功后立即更新台账；只有当 1..`lockedPageCount` 全部标记为 `DONE`，且最新 HTML 中 `page-data` 计数等于 `lockedPageCount` 时，才允许进入步骤 2 验收。

### 9.5 每批生成时须携带的上下文

每批生成的输入**不能只有本页大纲**，须包含完整的课件语境：

| 必传信息 | 说明 |
|----------|------|
| 课件基本信息 | 课题、学科、年级、教材版本、配色风格 |
| 教学目标 | 大纲中的学习目标 |
| 本批各页的完整大纲 | 逐页设计表格中对应页面的所有字段 |
| 本批在整体中的位置 | 第几页到第几页、前一页标题、后一页标题 |
| 相关原文/素材 | 本批页面需要用到的课文原文段落、知识点定义、背景资料等（从 Phase 1 检索结果中摘取） |
| Phase 3 素材 | 本批页面对应的图片 URL、音频 URL、题目内容等（从 Phase 3 素材清单中匹配页码） |
| **强互动页交互剧本** | 若本批为强互动页，须携带步骤 0 中为该页输出的五维度交互剧本全文，代码实现须严格按照剧本，不得简化或省略剧本中描述的任何反馈效果 |

### 9.6 生成与注入规则

- **串行注入、跟踪 resourceId**：各批次必须严格串行执行。每次 `edit_file` 后记录新 resourceId，下一次操作使用最新 resourceId。禁止多批次并行注入同一 resourceId。
- **标记唯一性**：`<!-- CW_PAGES -->` 在整个文件中只出现一次，禁止在页面内容中使用此字面量。
- **顺序保证**：每批 `<template>` 的 `data-id` 须接续上一批末尾，保证最终文件中所有页按 data-id 升序排列。
- **原子性**：`edit_file` 保证注入失败时不会破坏已有内容；如注入失败，排查 `oldString` 是否精确匹配后重试。
- **页数一致**：总页数必须与 Phase 1 的 `lockedPageCount` 完全一致，不得多页、少页、合并、拆页或只生成核心页。每一行逐页大纲都必须对应一个且仅一个 `<template class="page-data">`。
- **内容一致**：每页内容须与大纲中的「必须出现的具体内容」逐条对应，不得遗漏、替换或大幅偏离。
- **引用准确**：课文原文、公式、定义等须与 Phase 1 检索到的原始材料一致，禁止篡改或凭空编写。
- **交互实现**：大纲中标注了交互设计的页，须实现对应功能，并支持状态保存与恢复（`saveState` 上报 + `restoreState` 监听，供往回翻页时恢复用户离开时的状态）。
- **强互动页须严格按照交互剧本实现**：步骤 0 中为每个强互动页输出的五维度交互剧本是该页代码的设计蓝图，代码须逐条实现剧本中描述的操作方式、过程反馈、结果反馈、完成态和技术方案，禁止简化或跳过。
- **内容充实**：须按大纲填充实质内容，禁止只做版式骨架不填文字。
- **标准页面标签**：每页必须用 `<template class="page-data" data-id="数字" data-name="页名">` 包裹，禁止使用 `<template data-id="p1">`、`<template data-id="1">` 或其他缺少 `class="page-data"` 的写法。
- **输出语义钩子**：每页必须按 3.5 节输出 `data-cw-role` 结构；有卡片/题框/面板时必须包含 `component-shell`；有按钮时必须包含 `button-skin`；交互页必须包含 `interactive-root`，有反馈浮层的页必须包含 `feedback-layer`。
- **禁止自写课件壳**：不得创建 `#cw-root`、缩略图栏、演示模式、键盘翻页、自定义页面切换、父级 iframe/srcdoc 或普通网页展示容器；壳功能全部交给云端壳脚本。
- **`<template>` 内不要写** `<!DOCTYPE>`/`<html>`/`<head>`/`<body>`——壳框架会自动包装。
- **`<template>` 内的 `<script>` 中不可出现字面量 `</template>`**，如需要用 `<\/template>` 替代。
- **禁止**在页面内容中使用 `<!-- CW_PAGES -->` 字面量（会干扰注入标记匹配）。

---

## 十一、步骤 2 —— 验收与交付

### 10.1 逐页验收

全部批次注入完毕后，**逐页核对**：

| 验收项 | 标准 |
|--------|------|
| 页数锁一致性 | HTML 文件中的 `<template class="page-data">` 总数 = `lockedPageCount` = 大纲逐页表行数 |
| 内容一致性 | 每页实际内容与大纲「必须出现的具体内容」逐条对应 |
| 引用准确性 | 原文引用、定义、公式等与检索资料一致 |
| 交互完整性 | 标注了交互的页已实现 saveState 上报和 restoreState 监听，恢复后 UI 与离开时一致 |
| 内容充实度 | 讲解页有要点 ≥2 + 例证 ≥1；练习页有题干+答案；无「仅标题+一句话」的空壳页 |
| 无凑页 | 不存在两页讲同一件事且无递进 |
| data-id 连续性 | 所有页的 data-id 从 1 开始连续递增，无重复无跳号 |
| 壳脚本完整性 | 壳框架 `<script src="https://musk-test.fbcontent.cn/pub-musk-ai-studio/user/upload/admin/HgSiredEejFXx94ofdiCZ8.js"></script>` 存在且位于所有页面模板之后 |
| 注入链路完整性 | `<!-- CW_PAGES -->` 标记仍保留在壳脚本之前，供后续新增页面继续使用 |
| 禁止普通网页壳 | 不存在自写 `#cw-root`、自定义翻页容器、父级 iframe/srcdoc 或把页面直接堆在普通 HTML 主容器里的结构 |

- 不通过项须指明页码与缺失项，**对该批次重新生成并注入**。
- 只要壳协议项不通过，即使文件能在浏览器打开，也必须判定为普通 HTML，不是合格互动课件；禁止交付和发布。
- 若 `Page Implementation Ledger` 未覆盖 1..`lockedPageCount`，或最新 HTML 的 `page-data` 计数少于 `lockedPageCount`，不得说“核心内容已完成”，也不得进入发布；必须回到步骤 1 继续补页。
- 全部通过后交付。

### 10.2 修改个别页

若验收不通过或交付后用户要求修改某几页：

- **不要**尝试在 HTML 文件中匹配大段 `<template>` 内容做替换（大段 HTML 难以精确匹配）。
- **正确做法**：用 `edit_file`（使用**最新 resourceId**）匹配需修改的页面中**短小、唯一的片段**（如特定的文字内容或属性值）进行精准替换。如果修改范围较大，可对该页的 `<template>` 整体替换——以 `<template class="page-data" data-id="N"` 开头到 `</template>` 结尾作为匹配依据。
- **更新 resourceId**：`edit_file` 修改后会生成新文件，记得更新 resourceId。

### 10.3 首次交付

- **文件命名**：生成的 `.html` 文件名须与 `<title>` 标签中的课件标题保持一致（如 `<title>少年闰土</title>` 对应文件名 `少年闰土.html`），避免用户看到的文件名与课件标题不符产生误解。
- **保留注入标记**：交付的 HTML 文件中 `<!-- CW_PAGES -->` 标记**必须保留**，不得删除。该标记不影响壳框架运行，且为后续用户要求新增页面提供了注入点——新页面可直接通过 `edit_file` 注入到标记位置，无需重建文件。
- **发布前硬校验**：调用 `publish_resource` 前必须重新读取最新 HTML，并确认 `<template class="page-data">` 数量等于 `lockedPageCount` 且等于大纲逐页表行数，`data-id` 从 1 连续到 `lockedPageCount`，壳脚本存在、`<!-- CW_PAGES -->` 保留，且不存在自写 `#cw-root` / 父级 iframe/srcdoc / 普通网页容器。任一项不通过时禁止发布，必须回到步骤 1 修复。
- **首次发布必须调用 `publish_resource`**：使用**最近一次 `edit_file` 返回的最新 resourceId** 单独调用 `publish_resource`，把原版互动课件发布给用户。
- **首次发布完成后必须立刻进入模板后处理**：使用 Phase 1 已确认的 `selectedTemplateId`，不得再次调用 `ask_user` 询问版面满意度，不得在发布后直接结束。
- 首次发布说明「直接浏览器打开即可，无需其他文件或服务器」。

### 10.4 发布后版面替换

原版互动课件首次发布后，必须使用 Phase 1 已确认的模板选择继续生成模板版：

1. 不重新走大纲与整课件生成流程，直接基于**当前最新 resourceId 对应的 HTML 文件**进行后置替换。
2. 模板替换必须覆盖**全部页面**，覆盖范围同样是 1..`lockedPageCount`；禁止只替换封面、目录或部分普通页；二次发布前必须逐页校验 `data-cw-template` 和 `data-cw-variant`。
3. 普通页必须替换 `page-shared` 和每个 `page-root` 的页面级视觉；`title-block` 只改已有标题文字的颜色/文字阴影并继承原版字体变量；`content-block`、`media-block`、`component-shell`、`button-skin`、`feedback-layer` 只做保护识别，不改组件内联样式、组件结构、组件框内字体或组件框内文字颜色。
4. 模板禁止新增原课件没有的可见文字；模板示例中的题签、徽章、印章、任务牌、英文栏头、等级文字不能复制进课件。
5. 模板必须保护 `media-block` 内部文字颜色，并**禁止**修改内容图片本身的色相、亮度、对比度、透明度、混合模式和原始素材 URL；禁止为了贴模板色系而对图片直接加滤镜，也禁止把图片组件改成新相框/贴纸结构。
6. 互动页也必须完成模板化，但只允许替换 `page-shared`、`page-root`、组件外标题/正文/辅助文字颜色、文字阴影和页面背景，并继承原版字体变量；**禁止**重排 `interactive-root` 内部 DOM、禁止改组件结构/形状、组件框内字体、组件框内文字颜色、按钮文字颜色、反馈层文字颜色、壳脚本、页数和 `data-id`。
7. 互动页模板化时，必须保留按钮、选项按钮、切换按钮的原有文字颜色和事件绑定关系；禁止修改 `onclick`、事件监听目标、函数名、节点 `id`、关键 `class` 与脚本查询选择器，禁止出现“按钮调用的函数名与脚本定义不一致”的情况。
8. 若模板背景没有生效，只能修复模板 CSS 顺序、模板背景锁、`page-root` 模板标记和 `page-root` 自身背景属性冲突；禁止以“深度固化”“视觉重构”“霓虹强化”“控制台风格”等理由改组件或页面子节点。
9. 替换完成后，必须再次调用 `publish_resource`，向用户重新发布模板版互动课件。
10. 最终交付说明必须让用户知道有两个版本：原版互动课件和模板版互动课件。
11. 若用户仍要求换版面，继续基于**最新一次 edit_file 返回的新 resourceId** 迭代，禁止回退到旧版本。

### 10.5 用户沟通规范

在整个生成过程中（包括进度汇报、错误说明、交付描述），与用户沟通时须遵守以下规则：

1. **禁止暴露 resourceId**：`resourceId` 是内部文件操作标识，用户无需知道其存在。禁止在任何面向用户的输出中提及 resourceId、文件 ID、资源 ID 等技术标识符。进度汇报时说「正在生成第 X 批页面」「已完成注入」等自然表述即可。
2. **文件称呼与 `<title>` 一致**：在整个工作流中（包括骨架创建、注入进度、验收报告、交付说明），提及课件文件时统一使用 `<title>` 标签中的课件标题作为名称。例如课件标题为「少年闰土」，则说「正在为《少年闰土》生成第 2 批页面」「《少年闰土》课件已生成完毕」，而不是说「文件 xxx.html」或「resourceId xxx 的文件」。
3. **不暴露内部流程细节**：分批策略、权重计算、装箱过程等是生成端的内部逻辑，用户只需知道「课件正在生成中」和最终结果。除非用户主动询问，否则不必解释为什么分了几批、每批包含哪些页等实现细节。

### 10.6 输出物检查清单

生成最终 HTML 前逐项确认：

- [ ] 只有**一个 .html 文件**，无外部依赖（除云端 JS）
- [ ] 所有 `<template>` 在 `<script src="...">` **之前**
- [ ] 存在且只存在一个 `<template class="page-shared">`
- [ ] 每页用 `<template class="page-data" data-id="序号" data-name="页名">` 包裹
- [ ] 不存在 `<template data-id="p1">`、`<template data-id="1">` 等缺少 `class="page-data"` 的页面标签
- [ ] 不存在自写 `#cw-root`、自定义翻页容器、父级 iframe/srcdoc 或普通网页展示容器
- [ ] 壳框架脚本存在且位于所有 `<template class="page-data">` 之后
- [ ] `<template>` 内**未写** `<!DOCTYPE>`/`<html>`/`<head>`/`<body>`
- [ ] `<template>` 内的 `<script>` 中未出现字面量 `</template>`
- [ ] 每页内容在 960×540 画布内不溢出、无滚动条
- [ ] **未使用** `100vh`，一律用 `100%`
- [ ] 第 1 页已写 `data-cover-layout` 和 `data-cover-visual`；若有封面图，已写 `data-cover-slot`，且图片槽位与 `cover-layout-guide.md` 的 `coverImageSlot` 一致
- [ ] 若封面图来自 `generate_image`，该条 prompt 已包含封面图片槽位的目标尺寸、目标比例和横竖方向；没有生成竖图后用 `object-fit: cover` 裁进横向槽位
- [ ] **未使用** `alert()`/`confirm()`/`prompt()`，反馈信息用 HTML 弹层实现
- [ ] `<template class="page-data">` 数量 = `lockedPageCount` = 大纲逐页表行数
- [ ] `Page Implementation Ledger` 已覆盖 1..`lockedPageCount`，没有缺页、跳号、重复页
- [ ] 每页 `data-name` 与规划中的页标题对应
- [ ] 每页包含 3.5 节要求的 `data-cw-role` 最小语义钩子
- [ ] 若调用过 `generate_image`，已按 `image-generation-guide.md` 做逐条命中式 prompt 检查，命中图片按固定映射追加风格，未命中的图片没有被强行套风格
- [ ] 若进入模板版发布，全部页面都已有 `data-cw-template` 和 `data-cw-variant`，不存在“只换了部分页面”的情况
- [ ] 若页面存在卡片、题框、面板、按钮，则已挂上 `component-shell` / `button-skin`
- [ ] 模板没有新增原课件不存在的题签、徽章、印章、英文栏头、任务牌或等级文字
- [ ] 模板没有改变组件 DOM、尺寸、圆角、阴影、边框粗细、布局、位置、内联 `style` 和可见文案；唯一可变的是 `page-root` 自身背景属性
- [ ] 若模板背景修复过，没有出现“深度固化/视觉重构/霓虹强化/控制台风格”等子节点重做设计
- [ ] 模板未对内容图片直接加 `filter` / `hue-rotate` / `mix-blend-mode` / 半透明染色遮罩
- [ ] 互动页按钮、选项和交互节点的事件绑定关系与原版一致，未改函数名、`onclick`、关键 `id` 和脚本选择器
- [ ] 整体风格统一、配色协调
- [ ] HTML 文件通过**骨架 + 增量注入**方式生成，所有页面均已注入到 `<!-- CW_PAGES -->` 标记位置
- [ ] 原版互动课件使用最新 resourceId 单独调用了 `publish_resource`
- [ ] 原版发布后已按 Phase 1 选定模板立刻进入后置模板替换，没有再次询问版面满意度
- [ ] 模板版互动课件同样使用最新 resourceId 单独调用了 `publish_resource`

---

## 十二、禁止事项清单

| 禁止 | 原因 |
|------|------|
| 手写壳的 CSS/JS（缩略图、演示模式、键盘翻页、焦点管理等） | 壳框架 JS 已提供全部功能。 |
| 读取或修改壳框架 JS 文件 | AI 不需要了解壳的实现。 |
| 在 `<template>` 内写 `<!DOCTYPE>`/`<html>`/`<head>`/`<body>` | 壳框架会自动包装。 |
| 在课件 HTML 的 `<head>` 中引入 CSS/JS 库期望各页继承 | 各页 iframe 是独立文档，不继承父文档的样式和脚本。须通过 `<template class="page-shared">` 声明共享资源。 |
| 使用了 CSS 框架工具类但未通过 `page-shared` 引入该框架 | 工具类无对应 CSS 定义则全部失效，页面变成裸 HTML。 |
| 用 `<template data-id="p1">` 或 `<template data-id="1">` 代替 `<template class="page-data">` | 壳框架不会把它识别为课件页，最终会变成普通 HTML 或空课件。 |
| 创建 `#cw-root`、自定义翻页容器、父级 iframe/srcdoc 或普通网页展示容器 | 这会绕过云端课件壳，导致平台不能按互动课件识别、缩略图和播放模式也会异常。 |
| 在 `create_file` 阶段一次性写完整课件页面 | 正确流程是先短骨架，再通过 `edit_file` 分批注入；一次性写完整页面容易丢失壳协议和 resourceId 链路。 |
| 将 15-18 页等已确认页数范围压缩成 8 页核心课件 | 违反 `lockedPageCount`，会导致大纲、HTML、原版发布和模板发布数量不一致。 |
| 使用 `100vh` | 在 iframe 中会取外层视口高度，导致错乱。 |
| 在 `<style>` 或 `page-shared` 中对 `html`、`body` 或根容器设置 `overflow: hidden` | 壳框架已取消滚动裁切，AI 不得重新加上此限制。 |
| 在 `<script>` 中使用 `alert()`、`confirm()`、`prompt()` | 原生弹窗会导致浏览器强制退出全屏，演示模式会被意外中断。答题反馈、提示信息等须用 HTML 元素（如 `<div>` 弹层）实现。 |
| 在 `<template>` 内的 `<script>` 中出现字面量 `</template>` | 会提前闭合标签。如确需此字符串，用 `<\/template>` 替代。 |
| 使用方向键（↑↓←→）和空格键作为交互手段 | 壳框架在放映模式下会拦截这些按键用于翻页。交互应基于点击、触摸、拖拽等方式。 |
| 在页面内容中使用 `<!-- CW_PAGES -->` 字面量 | 会干扰注入标记匹配。 |
| 删除、伪造或复用 `data-cw-role` 语义钩子 | 会导致发布后版面替换误判结构边界，误伤互动或内容布局。 |
| 模板替换时漏掉部分页面 | 用户会看到同一份课件中风格割裂，违背整套模板化目标。 |
| 对内容图片直接加 `filter`、`hue-rotate`、`mix-blend-mode`、大面积染色遮罩 | 会破坏教学素材原意，导致图片颜色失真。 |
| 在模板替换阶段重排 `data-cw-role="interactive-root"` 内部 DOM | 交互脚本、命中区域、状态恢复都可能失效。 |
| 在模板替换阶段改写按钮的 `onclick`、事件函数名、关键 `id` 或脚本选择器 | 按钮外观虽更新，但交互调用链会断裂，出现点击无效。 |
| 在互动页替换阶段修改按钮以外的交互主体组件结构 | 容易导致点击、拖拽、判定、反馈逻辑失效。 |
| 将强互动页与其他页面（包括其他强互动页）放在同一批次 | 每个强互动页必须单独一批（一批仅一页），禁止合并多个强互动页或与普通页混合。 |
| 跳过骨架直接生成完整 HTML | 必须先创建含 `<!-- CW_PAGES -->` 标记的骨架，再分批注入。 |
| 多批次并行注入同一 resourceId | `edit_file` 每次生成新文件，并行注入会导致分叉。必须串行：注入→记录新 resourceId→下一批注入。 |
| 向用户暴露 resourceId、文件 ID 或内部流程细节 | resourceId 是内部操作标识；分批策略、权重计算等是内部逻辑。进度汇报用自然表述，文件称呼用 `<title>` 中的课件标题。 |
| 把 `publish_resource` 与 `create_file` / `edit_file` 放在同一轮并行调用 | 发布拿不到最新 resourceId，用户会看到旧版本或发布失败。 |
| 手动引入 `musk-collect.js` SDK（任何位置） | 壳框架已自动在每个子页 srcdoc 的 `<head>` 注入 SDK，重复加载浪费带宽且可能产生竞态。子页内直接 `new MuskCollect()` 即可。 |
| 假定 `window.muskCollect` / `window.collect` / `window.sdk` 等小写驼峰名是 shell 预置的 SDK 实例 | shell 只注入 SDK 类（PascalCase `window.MuskCollect`），实例必须 AI 自己 `new MuskCollect()`。否则 `if (window.muskCollect)` 永远 false，save 静默失败：前端无报错但服务端 0 数据。 |
| `collect.save()` 等写类操作未做 `if (window.__CW_MODE__ === 'thumbnail') return` 守卫 | 缩略图也会执行业务代码，无守卫将导致数据被重复上报，污染作答记录。 |
