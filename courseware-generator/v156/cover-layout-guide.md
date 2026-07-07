# 互动课件封面版式指南

> 本文件用于第 1 页封面首次生成，并可在 Phase 3 准备封面图素材前读取一次以确定封面图片槽位。它沉淀设计稿最上方 7 列封面排版范式：文字大小、文字固定位置、图片槽位大小、图片固定位置和封面图角色。Phase 3 只读取图片槽位时，不要求已选择字体 preset；Phase 4 生成封面 HTML 前，必须已按 `typography-guide.md` 选择字体 preset。本文件只规定字号、字重、行高、位置和图片槽位，不重新选择字体家族。模板替换 skill 只能读取已生成封面的标记做视觉适配，禁止重新选择版式、移动标题或移动图片。

---

## 一、使用时机

本文件有两个固定使用时机：

- **Phase 3 封面图生图前**：只用于判断封面图角色、选择封面版式和确定 `coverImageSlot`，并把图片槽位传给 `image-generation-guide.md`。此时不处理字体家族。
- **Phase 4 生成第 1 页封面 HTML 前**：完整使用本文件的封面版式、文字层级、图片槽位和固定坐标，并结合 `typography-guide.md` 已选字体 preset 生成封面结构。

```text
Phase 3 判断第 1 页需要封面生图
  ↓
读取本文件，预判 data-cover-visual / data-cover-layout / coverImageSlot
  ↓
把 coverImageSlot 传给 image-generation-guide.md 形成封面图 prompt
  ↓
调用 generate_image，得到与槽位比例匹配的封面图素材
  ↓
Phase 4 创建 HTML 骨架和生成第 1 页封面前
  ↓
读取 typography-guide.md，确定字体 preset
  ↓
复用或补定 data-cover-visual / data-cover-layout / coverImageSlot
  ↓
生成第 1 页封面 HTML，按 coverImageSlot 固定落位
  ↓
继续按 html-guide.md 做复杂度评估、骨架创建和分批注入
```

硬边界：

1. 本文件不决定是否生图；但一旦模型判断第 1 页需要封面图，必须先用本文件确定图片槽位 `coverImageSlot`，再调用 `image-generation-guide.md` 生成 prompt。
2. 封面生图 prompt 必须包含 `coverImageSlot` 的目标像素、目标比例、横竖方向和构图安全要求；不能先生成一张任意比例图片，再用 `object-fit: cover` 硬塞进槽位。
3. 字体家族由 `typography-guide.md` 的 `--cw-courseware-*` 变量提供；本文件只给字号、字重、行高和固定位置。
4. 本文件不参与模板替换阶段重新排版；模板替换不得重排封面标题、图片、文字安全区，也不得重新选择封面字体。
5. 所有位置都使用互动课件 `960×540` 画布内的固定 px 坐标；不得写成百分比、`clamp()`、`flex` 自适应、依赖当前浏览器截图缩放的坐标。
6. 封面 HTML 必须按本文件的图片槽位生成固定区域；禁止用 `flex: 1`、自动填充、随内容撑开等模糊布局替代图片槽位。
7. 本文件不是自然语言建议，而是封面版式代码合同。生成第 1 页时必须复制第四节给出的固定 CSS/HTML 骨架之一，只替换字段值，禁止自由重写结构、移动槽位、把页脚信息放到别的位置。

---

## 二、画布与绝对坐标

互动课件画布固定为 `960×540`。设计稿可按 `1920×1080` 理解；落到互动课件时等比缩放 0.5。研发模式中读到的字号也按这个比例折算，例如设计稿标题 `190px / line-height 200px`，在互动课件中约为 `95px / line-height 100px`。

固定 px 坐标成立的前提：

1. 封面根容器必须是 `.cover-page`，并且固定显示尺寸为 `width:960px; height:540px; min-width:960px; max-width:960px; min-height:540px; max-height:540px; flex-shrink:0;`。
2. 封面页是普通页 `min-height:100%` 规则的例外；封面根容器不能写成 `height:auto`、`min-height:100%`、`width:100%`、`aspect-ratio`、`transform:scale()` 或任何响应式尺寸。
3. 所有封面文字和图片槽位都以 `.cover-page` 的 `960×540` 坐标系为唯一参照；如果根容器不是 `960×540`，禁止使用本文件的固定 px 槽位。

坐标写法：

| 字段 | 含义 | 换算 |
|---|---|---|
| `left` | 左上角横向坐标 | 设计稿 `x / 2` |
| `top` | 左上角纵向坐标 | 设计稿 `y / 2` |
| `width` | 容器宽度 | 设计稿 `width / 2` |
| `height` | 容器高度 | 设计稿 `height / 2` |

生成 HTML 时必须用固定 px 表达：

```css
.cover-copy {
  position: absolute;
  left: 163px;
  top: 184px;
  width: 634px;
  height: 135px;
}
```

封面文字层级：

> 字体家族使用 `typography-guide.md` 已选 preset 中的 `--cw-courseware-title-font` / `--cw-courseware-body-font` / `--cw-courseware-label-font`。下表只规定字号、行高和字重；除非字体可读性不足，不要把封面强制改回 `PingFang SC`。

| 层级 | 设计来源 | 960×540 固定换算 |
|---|---|---|
| 超大标题 | 研发模式读数 `PingFang SC Medium, 190px/200px` | `font-size: 95px; line-height: 100px; font-weight: 500;` |
| 150px 大标题 | 研发模式读数 `150px/170px` | `font-size: 75px; line-height: 85px; font-weight: 500;` |
| 140px 大标题 | 研发模式读数 `140px/150px` | `font-size: 70px; line-height: 75px; font-weight: 500;` |
| 100px 中标题 | 研发模式读数 `100px/100px` | `font-size: 50px; line-height: 50px; font-weight: 500;` |
| 副标题 | 研发模式读数 `35px/55px` 或 `90px/90px` | 视版式固定为 `18px/28px` 或 `45px/45px` |
| 页眉/页脚信息 | 研发模式读数 `25px/50px` 或 `35px/50px` | 视版式固定为 `13px/25px` 或 `18px/25px` |

防溢出规则：

- 优先使用各版式固定字号；只有标题实际溢出本版式 `.cover-copy` 固定框时，才允许等比缩小字号。
- 缩小字号只能改 `.cover-title` 的 `font-size/line-height`，不能移动 `.cover-copy`、`.cover-meta`、`.cover-visual`，不能挤压图片。
- 标题最多 2 行；仍溢出时应换封面版式或压缩标题文案，不得移动图片槽位。
- 字距保持 `letter-spacing: 0`，不要使用负字距。

---

## 三、封面图片角色

第 1 页必须在 `page-root` 上写明封面图角色：

| `data-cover-visual` | 含义 | 模板背景关系 |
|---|---|---|
| `none` | 无封面生图或无主视觉图 | 模板替换可完整使用模板背景 |
| `full-bleed-background` | 生图铺满整页作为封面背景 | 模板替换禁用该页模板背景，只保留模板字体、颜色、遮罩和弱装饰 |
| `side-visual` | 生图作为左侧/右侧主视觉，不铺满整页 | 模板替换保留模板背景，同时保护封面图 |
| `inline-card` | 生图作为下方/局部卡片图或内容图 | 模板替换保留模板背景，同时保护封面图 |

若有封面图片，必须把图片放入独立媒体层，禁止写成 `page-root` 的内联 `background-image`：

```html
<div class="cover-page"
     data-cw-role="page-root"
     data-cover-layout="cover-01-center-stack"
     data-cover-visual="full-bleed-background">
  <div class="cover-visual"
       data-cw-role="media-block"
       data-cover-role="cover-visual"
       data-cover-slot="cover-full-bleed"
       data-cover-visual-role="full-bleed-background">
    <img src="..." alt="">
  </div>
  <header class="cover-copy" data-cw-role="title-block">
    <h1>课件标题</h1>
    <p>副标题</p>
  </header>
</div>
```

图片保护：

- `cover-visual` 内的图片是内容素材，禁止滤镜、染色、换图、裁掉主体。
- 若需要让文字可读，只能添加独立的半透明遮罩层或文字安全区，不能直接改图片颜色。
- `full-bleed-background` 图片使用 `object-fit: cover`；`side-visual` / `inline-card` 必须优先保证主体完整。只有图片实际比例与 `coverImageSlot` 目标比例基本一致时才可用 `object-fit: cover`；否则用 `contain` 保主体，或重新按槽位比例生图，禁止裁掉主体来填满区域。

### 3.1 封面图片槽位协议（必须执行）

`coverImageSlot` 是封面图的真实容器，不是装饰建议。模型只要判断第 1 页需要生图，就必须先确定将要使用的版式和图片槽位，再把槽位信息写进 `imageDescriptions`。

记录格式：

```text
coverImageSlot = {
  layout: "cover-07-top-title-image-card",
  slotId: "cover-07-image-card",
  visual: "inline-card",
  left: "30px",
  top: "107px",
  width: "900px",
  height: "357px",
  targetPx: "900x357",
  aspectRatio: "2.52:1",
  promptHint: "超宽横向图片，主体完整落在画面中央，不含文字，不带边框"
}
```

硬规则：

1. `coverImageSlot` 必须进入素材清单，并在生成第 1 页 HTML 时复用同一个 slot。
2. 封面生图 prompt 必须明确目标尺寸、比例和方向，例如 `目标 900×357，2.52:1 超宽横向封面卡片图`、`目标 960×540，16:9 横向整页背景图`、`目标 415×709，0.59:1 竖向主体图`。
3. 生图 prompt 禁止要求生成课件标题、中文题名、公式、页脚文字或按钮文案；这些文字由 HTML 放入文字槽位。
4. 如果封面图已生成但比例明显不匹配当前 `coverImageSlot`，不得用裁切掩盖问题；必须改选兼容槽位、使用 `contain` 保护主体，或重新按 slot 比例生成图片。
5. HTML 中的封面图片容器必须写 `data-cover-slot="<slotId>"`，便于后续检查。

| 版式 | 可用图片槽位 | `data-cover-visual` | 固定槽位 | 960×540 目标像素 | 目标比例 | 生图方向要求 |
|---|---|---|---|---|---|---|
| `cover-01-center-stack` | `cover-full-bleed` | `full-bleed-background` | `left=0 top=0 width=960 height=540` | `960×540` | `1.78:1` | 16:9 横向整页背景，主体避开标题安全区 |
| `cover-02-left-top-stack` | `cover-full-bleed` | `full-bleed-background` | `left=0 top=0 width=960 height=540` | `960×540` | `1.78:1` | 16:9 横向整页背景，左上留文字安全区 |
| `cover-03-left-lower-stack` | `cover-full-bleed` | `full-bleed-background` | `left=0 top=0 width=960 height=540` | `960×540` | `1.78:1` | 16:9 横向整页背景，左中下留文字安全区 |
| `cover-04-right-lower-stack` | `cover-full-bleed` | `full-bleed-background` | `left=0 top=0 width=960 height=540` | `960×540` | `1.78:1` | 16:9 横向整页背景，右下留文字安全区 |
| `cover-05-left-visual-right-title` | `cover-05-left-visual` | `side-visual` | `left=0 top=0 width=480 height=540` | `480×540` | `0.89:1` | 近方形/轻竖向左栏主视觉，主体完整 |
| `cover-06-organic-visual-left-text-right` | `cover-06-organic-visual` | `side-visual` | 可见遮罩 `left=38 top=0 width=415 height=540`；内部源图 `415×709` 向上偏移 `-85px` | `415×709` | `0.59:1` | 竖向主体图，适合圆形/胶囊遮罩，主体不要贴边 |
| `cover-07-top-title-image-card` | `cover-07-image-card` | `inline-card` | `left=30 top=107 width=900 height=357` | `900×357` | `2.52:1` | 超宽横向卡片图，主体横向展开，不能生成竖图 |

---

## 四、固定代码版式合同

生成第 1 页封面时，必须先选择一个 `data-cover-layout`，然后**复制本节对应的 CSS 块和 HTML 骨架**。模型只能替换 `{{...}}` 字段，不能重写结构，不能改槽位坐标，不能把教材版本/年级/作者等小字移动到标题下方。

### 4.0 字段填充规则

| 字段 | 含义 | 必须放入的槽位 |
|---|---|---|
| `{{title}}` | 课题主标题，只放课题本身，如 `出师表` | `.cover-title` |
| `{{subtitle}}` | 短副标题，如单元主题、课型、英文副题。没有就留空，不得放教材版本 | `.cover-subtitle` |
| `{{eyebrow}}` | 顶部小字，如单元、课时、章节编号。没有就留空 | `.cover-eyebrow` |
| `{{meta}}` | 教材版本、年级、册次、作者、课时等信息，如 `统编版语文 · 九年级下册 · 诸葛亮` | `.cover-meta` |
| `{{coverImageUrl}}` | 封面图 URL | `.cover-visual img[src]` |
| `{{coverAlt}}` | 图片替代文本 | `.cover-visual img[alt]` |

硬规则：

1. `{{title}}` 永远只放主标题，不拼接教材、年级、作者。
2. 教材版本、年级、作者、课时等信息必须进入 `.cover-meta`；对于 `cover-07-top-title-image-card`，`.cover-meta` 固定在左下，绝不能放在标题下面。
3. `.cover-title` 必须重置普通页标题装饰：`border:0; padding:0; text-decoration:none;`。封面标题不得出现普通页标题左竖杠、横线、编号装饰。
4. 若某版式不需要 `{{subtitle}}` 或 `{{eyebrow}}`，保留元素但置空或 `display:none`，不得移动其他槽位补位。
5. 图片槽位是固定容器，不是建议。禁止用 `flex:1`、`margin:auto`、自动高度、随内容撑开等写法替代。

### 4.1 7 个版式槽位登记表（验收基准）

生成和验收第 1 页封面时，以此表作为字段和位置的唯一基准。表中坐标均为互动课件 `960×540` 画布内的绝对 px，必须逐项落到 CSS 的 `left/top/width/height`。

| layout | title 槽位 | subtitle 槽位 | eyebrow 槽位 | meta 槽位 | image 槽位 | 标题字体层级 |
|---|---|---|---|---|---|---|
| `cover-01-center-stack` | `.cover-copy left=163 top=184 width=634 height=135; center` | 标题下 `16px` | 不用，留空 | `.cover-meta left=211 top=400 width=538 height=25; center` | `cover-full-bleed left=0 top=0 width=960 height=540` | 超大标题 `95px/100px` |
| `cover-02-left-top-stack` | `.cover-copy left=48 top=119 width=499 height=140; left` | 标题下 `12px` | `.cover-eyebrow left=48 top=43 width=269 height=25; left` | `.cover-meta left=48 top=464 width=403 height=25; left` | `cover-full-bleed left=0 top=0 width=960 height=540` | 大标题 `75px/85px` |
| `cover-03-left-lower-stack` | `.cover-copy left=58 top=238 width=461 height=130; left` | 标题下 `10px` | `.cover-eyebrow left=48 top=43 width=288 height=25; left` | `.cover-meta left=58 top=464 width=365 height=25; left` | `cover-full-bleed left=0 top=0 width=960 height=540` | 大标题 `75px/85px` |
| `cover-04-right-lower-stack` | `.cover-copy left=518 top=238 width=384 height=140; right` | 标题下 `10px` | `.cover-eyebrow left=48 top=43 width=288 height=25; left` | `.cover-meta left=58 top=464 width=365 height=25; left` | `cover-full-bleed left=0 top=0 width=960 height=540` | 大标题 `75px/85px` |
| `cover-05-left-visual-right-title` | `.cover-copy left=557 top=108 width=326 height=184; left` | 标题下 `12px` | 不用，留空 | `.cover-meta left=557 top=454 width=307 height=25; left` | `cover-05-left-visual left=0 top=0 width=480 height=540` | 标题 `70px/75px` |
| `cover-06-organic-visual-left-text-right` | `.cover-copy left=480 top=162 width=384 height=151; left` | 标题下 `12px` | 不用，留空 | `.cover-meta left=480 top=443 width=326 height=25; left` | `cover-06-organic-visual visible left=38 top=0 width=415 height=540; source image=415×709 offsetY=-85` | 标题 `75px/85px` |
| `cover-07-top-title-image-card` | `.cover-copy left=48 top=30 width=864 height=50; left` | 禁用，必须空 | 禁用，必须空 | `.cover-meta left=58 top=478 width=672 height=25; left` | `cover-07-image-card left=30 top=107 width=900 height=357` | 中标题 `50px/50px` |

字段归位强校验：

- `{{meta}}` 必须包含教材版本、年级/册次、作者/课时等小字信息，且只能进入 `.cover-meta`。若生成结果中 `.cover-subtitle` 包含 `统编版`、`人教版`、`九年级`、`上册`、`下册`、`作者` 等信息，视为槽位错误。
- `cover-07-top-title-image-card` 的 `.cover-copy` 只允许出现主标题；`.cover-subtitle` 和 `.cover-eyebrow` 必须为空或隐藏。图片顶部固定为 `top:107px`，不能为了放副标题上移图片。
- 各版式的 `.cover-copy`、`.cover-meta`、`.cover-visual` 必须按表中固定 px 槽位落位。允许为适配长标题微调字号，不允许改变坐标、宽高、对齐方式。
- 封面标题不得继承普通页标题样式。若 `.cover-title` 或封面 `h1` 出现 `border-left`、`padding-left`、`border-bottom`、标题横杠、编号角标，视为不合格。

### 4.2 必须复制的公共 CSS

将以下 CSS 放进第 1 页 `<template class="page-data" data-id="1">` 内的 `<style>`，或放进 `page-shared` 后确保只作用于 `.cover-page`：

```css
.cover-page {
  position: relative;
  width: 960px;
  height: 540px;
  min-width: 960px;
  max-width: 960px;
  min-height: 540px;
  max-height: 540px;
  flex-shrink: 0;
  background: #EDEDEB;
  color: #111;
}
.cover-page * { box-sizing: border-box; }
.cover-title {
  margin: 0;
  font-family: var(--cw-courseware-title-font);
  font-weight: 500;
  letter-spacing: 0;
  border: 0 !important;
  padding: 0 !important;
  text-decoration: none !important;
}
.cover-subtitle,
.cover-eyebrow,
.cover-meta {
  margin: 0;
  font-family: var(--cw-courseware-body-font);
  letter-spacing: 0;
}
.cover-visual {
  position: absolute;
  z-index: 0;
  background: #EDEDEB;
}
.cover-visual img {
  display: block;
  width: 100%;
  height: 100%;
}
.cover-full-bleed img { object-fit: cover; }
.cover-local img { object-fit: contain; }
.cover-image-card img { object-fit: cover; }
.cover-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.cover-copy,
.cover-meta {
  position: absolute;
  z-index: 2;
}
```

### 4.3 `cover-01-center-stack` 居中标题型

固定槽位：标题居中，副标题在标题下，教材/作者等信息在底部居中。适合无图、模板背景或主体避开中心的 16:9 背景图。

```css
.cover-page[data-cover-layout="cover-01-center-stack"] .cover-copy {
  left: 163px;
  top: 184px;
  width: 634px;
  height: 135px;
  text-align: center;
}
.cover-page[data-cover-layout="cover-01-center-stack"] .cover-title {
  font-size: 95px;
  line-height: 100px;
}
.cover-page[data-cover-layout="cover-01-center-stack"] .cover-subtitle {
  margin-top: 16px;
  font-size: 45px;
  line-height: 45px;
  font-weight: 400;
  letter-spacing: .25px;
}
.cover-page[data-cover-layout="cover-01-center-stack"] .cover-meta {
  left: 211px;
  top: 400px;
  width: 538px;
  height: 25px;
  text-align: center;
  font-size: 25px;
  line-height: 25px;
  font-weight: 500;
  letter-spacing: .25px;
}
.cover-page[data-cover-layout="cover-01-center-stack"] .cover-visual {
  left: 0;
  top: 0;
  width: 960px;
  height: 540px;
}
```

```html
<div class="cover-page" data-cw-role="page-root" data-cover-layout="cover-01-center-stack" data-cover-visual="full-bleed-background">
  <div class="cover-visual cover-full-bleed" data-cw-role="media-block" data-cover-role="cover-visual" data-cover-slot="cover-full-bleed" data-cover-visual-role="full-bleed-background">
    <img src="{{coverImageUrl}}" alt="{{coverAlt}}">
    <div class="cover-overlay" style="background:rgba(255,255,255,.18);"></div>
  </div>
  <header class="cover-copy" data-cw-role="title-block">
    <h1 class="cover-title">{{title}}</h1>
    <p class="cover-subtitle">{{subtitle}}</p>
  </header>
  <footer class="cover-meta">{{meta}}</footer>
</div>
```

### 4.4 `cover-02-left-top-stack` 左上标题型

固定槽位：页眉左上，标题左上偏中，教材/作者等信息在左下。适合信息型封面或左上有留白的 16:9 背景图。

```css
.cover-page[data-cover-layout="cover-02-left-top-stack"] .cover-eyebrow {
  position: absolute;
  left: 48px;
  top: 43px;
  width: 269px;
  height: 25px;
  font-size: 13px;
  line-height: 25px;
  letter-spacing: .25px;
}
.cover-page[data-cover-layout="cover-02-left-top-stack"] .cover-copy {
  left: 48px;
  top: 119px;
  width: 499px;
  height: 140px;
  text-align: left;
}
.cover-page[data-cover-layout="cover-02-left-top-stack"] .cover-title {
  font-size: 75px;
  line-height: 85px;
}
.cover-page[data-cover-layout="cover-02-left-top-stack"] .cover-subtitle {
  margin-top: 12px;
  font-size: 18px;
  line-height: 28px;
  font-weight: 500;
  letter-spacing: .5px;
}
.cover-page[data-cover-layout="cover-02-left-top-stack"] .cover-meta {
  left: 48px;
  top: 464px;
  width: 403px;
  height: 25px;
  text-align: left;
  font-size: 13px;
  line-height: 25px;
  letter-spacing: .25px;
}
.cover-page[data-cover-layout="cover-02-left-top-stack"] .cover-visual {
  left: 0;
  top: 0;
  width: 960px;
  height: 540px;
}
```

```html
<div class="cover-page" data-cw-role="page-root" data-cover-layout="cover-02-left-top-stack" data-cover-visual="full-bleed-background">
  <div class="cover-visual cover-full-bleed" data-cw-role="media-block" data-cover-role="cover-visual" data-cover-slot="cover-full-bleed" data-cover-visual-role="full-bleed-background">
    <img src="{{coverImageUrl}}" alt="{{coverAlt}}">
    <div class="cover-overlay" style="background:rgba(255,255,255,.12);"></div>
  </div>
  <p class="cover-eyebrow">{{eyebrow}}</p>
  <header class="cover-copy" data-cw-role="title-block">
    <h1 class="cover-title">{{title}}</h1>
    <p class="cover-subtitle">{{subtitle}}</p>
  </header>
  <footer class="cover-meta">{{meta}}</footer>
</div>
```

### 4.5 `cover-03-left-lower-stack` 左中下标题型

固定槽位：页眉左上，标题左侧中下，教材/作者等信息左下。适合视觉主体在右侧或上方的背景图。

```css
.cover-page[data-cover-layout="cover-03-left-lower-stack"] .cover-eyebrow {
  position: absolute;
  left: 48px;
  top: 43px;
  width: 288px;
  height: 25px;
  font-size: 13px;
  line-height: 25px;
  letter-spacing: .25px;
}
.cover-page[data-cover-layout="cover-03-left-lower-stack"] .cover-copy {
  left: 58px;
  top: 238px;
  width: 461px;
  height: 130px;
  text-align: left;
}
.cover-page[data-cover-layout="cover-03-left-lower-stack"] .cover-title {
  font-size: 75px;
  line-height: 85px;
}
.cover-page[data-cover-layout="cover-03-left-lower-stack"] .cover-subtitle {
  margin-top: 10px;
  font-size: 18px;
  line-height: 28px;
  font-weight: 500;
  letter-spacing: .5px;
}
.cover-page[data-cover-layout="cover-03-left-lower-stack"] .cover-meta {
  left: 58px;
  top: 464px;
  width: 365px;
  height: 25px;
  text-align: left;
  font-size: 13px;
  line-height: 25px;
  letter-spacing: .25px;
}
.cover-page[data-cover-layout="cover-03-left-lower-stack"] .cover-visual {
  left: 0;
  top: 0;
  width: 960px;
  height: 540px;
}
```

```html
<div class="cover-page" data-cw-role="page-root" data-cover-layout="cover-03-left-lower-stack" data-cover-visual="full-bleed-background">
  <div class="cover-visual cover-full-bleed" data-cw-role="media-block" data-cover-role="cover-visual" data-cover-slot="cover-full-bleed" data-cover-visual-role="full-bleed-background">
    <img src="{{coverImageUrl}}" alt="{{coverAlt}}">
    <div class="cover-overlay" style="background:linear-gradient(90deg,rgba(255,255,255,.56),rgba(255,255,255,0));"></div>
  </div>
  <p class="cover-eyebrow">{{eyebrow}}</p>
  <header class="cover-copy" data-cw-role="title-block">
    <h1 class="cover-title">{{title}}</h1>
    <p class="cover-subtitle">{{subtitle}}</p>
  </header>
  <footer class="cover-meta">{{meta}}</footer>
</div>
```

### 4.6 `cover-04-right-lower-stack` 右下标题型

固定槽位：页眉左上，标题右侧中下，教材/作者等信息左下。适合主体在左侧、文字需避开左侧画面的背景图。

```css
.cover-page[data-cover-layout="cover-04-right-lower-stack"] .cover-eyebrow {
  position: absolute;
  left: 48px;
  top: 43px;
  width: 288px;
  height: 25px;
  font-size: 13px;
  line-height: 25px;
  letter-spacing: .25px;
}
.cover-page[data-cover-layout="cover-04-right-lower-stack"] .cover-copy {
  left: 518px;
  top: 238px;
  width: 384px;
  height: 140px;
  text-align: right;
}
.cover-page[data-cover-layout="cover-04-right-lower-stack"] .cover-title {
  font-size: 75px;
  line-height: 85px;
}
.cover-page[data-cover-layout="cover-04-right-lower-stack"] .cover-subtitle {
  margin-top: 10px;
  font-size: 18px;
  line-height: 28px;
  font-weight: 500;
  letter-spacing: .5px;
}
.cover-page[data-cover-layout="cover-04-right-lower-stack"] .cover-meta {
  left: 58px;
  top: 464px;
  width: 365px;
  height: 25px;
  text-align: left;
  font-size: 13px;
  line-height: 25px;
  letter-spacing: .25px;
}
.cover-page[data-cover-layout="cover-04-right-lower-stack"] .cover-visual {
  left: 0;
  top: 0;
  width: 960px;
  height: 540px;
}
```

```html
<div class="cover-page" data-cw-role="page-root" data-cover-layout="cover-04-right-lower-stack" data-cover-visual="full-bleed-background">
  <div class="cover-visual cover-full-bleed" data-cw-role="media-block" data-cover-role="cover-visual" data-cover-slot="cover-full-bleed" data-cover-visual-role="full-bleed-background">
    <img src="{{coverImageUrl}}" alt="{{coverAlt}}">
    <div class="cover-overlay" style="background:linear-gradient(270deg,rgba(255,255,255,.56),rgba(255,255,255,0));"></div>
  </div>
  <p class="cover-eyebrow">{{eyebrow}}</p>
  <header class="cover-copy" data-cw-role="title-block">
    <h1 class="cover-title">{{title}}</h1>
    <p class="cover-subtitle">{{subtitle}}</p>
  </header>
  <footer class="cover-meta">{{meta}}</footer>
</div>
```

### 4.7 `cover-05-left-visual-right-title` 左图右文分栏型

固定槽位：左侧主视觉固定 `480×540`，右侧标题区固定在 `left=557 top=108 width=326 height=184`，教材/作者等信息固定右下。适合局部图，不铺满背景。

```css
.cover-page[data-cover-layout="cover-05-left-visual-right-title"] .cover-visual {
  left: 0;
  top: 0;
  width: 480px;
  height: 540px;
}
.cover-page[data-cover-layout="cover-05-left-visual-right-title"] .cover-copy {
  left: 557px;
  top: 108px;
  width: 326px;
  height: 184px;
  text-align: left;
}
.cover-page[data-cover-layout="cover-05-left-visual-right-title"] .cover-title {
  font-size: 70px;
  line-height: 75px;
}
.cover-page[data-cover-layout="cover-05-left-visual-right-title"] .cover-subtitle {
  margin-top: 12px;
  font-size: 18px;
  line-height: 28px;
  font-weight: 500;
  letter-spacing: .5px;
}
.cover-page[data-cover-layout="cover-05-left-visual-right-title"] .cover-meta {
  left: 557px;
  top: 454px;
  width: 307px;
  height: 25px;
  text-align: left;
  font-size: 13px;
  line-height: 25px;
  letter-spacing: .25px;
}
```

```html
<div class="cover-page" data-cw-role="page-root" data-cover-layout="cover-05-left-visual-right-title" data-cover-visual="side-visual">
  <div class="cover-visual cover-local" data-cw-role="media-block" data-cover-role="cover-visual" data-cover-slot="cover-05-left-visual" data-cover-visual-role="side-visual">
    <img src="{{coverImageUrl}}" alt="{{coverAlt}}">
  </div>
  <header class="cover-copy" data-cw-role="title-block">
    <h1 class="cover-title">{{title}}</h1>
    <p class="cover-subtitle">{{subtitle}}</p>
  </header>
  <footer class="cover-meta">{{meta}}</footer>
</div>
```

### 4.8 `cover-06-organic-visual-left-text-right` 左侧异形图右文型

固定槽位：左侧异形视觉可见遮罩 `left=38 top=0 width=415 height=540`，内部源图按设计稿折算为 `415×709` 并向上偏移 `-85px`，右侧标题 `left=480 top=162 width=384 height=151`，教材/作者等信息固定右下。适合人物、物体、实验器材等竖向主体。

```css
.cover-page[data-cover-layout="cover-06-organic-visual-left-text-right"] .cover-visual {
  left: 38px;
  top: 0;
  width: 415px;
  height: 540px;
  border-radius: 0 0 120px 120px;
  overflow: hidden;
  transform: rotate(0.17deg);
}
.cover-page[data-cover-layout="cover-06-organic-visual-left-text-right"] .cover-visual img {
  width: 415px;
  height: 709px;
  object-fit: cover;
  transform: translateY(-85px);
}
.cover-page[data-cover-layout="cover-06-organic-visual-left-text-right"] .cover-copy {
  left: 480px;
  top: 162px;
  width: 384px;
  height: 151px;
  text-align: left;
}
.cover-page[data-cover-layout="cover-06-organic-visual-left-text-right"] .cover-title {
  font-size: 75px;
  line-height: 85px;
}
.cover-page[data-cover-layout="cover-06-organic-visual-left-text-right"] .cover-subtitle {
  margin-top: 12px;
  font-size: 18px;
  line-height: 28px;
  font-weight: 500;
  letter-spacing: .5px;
}
.cover-page[data-cover-layout="cover-06-organic-visual-left-text-right"] .cover-meta {
  left: 480px;
  top: 443px;
  width: 326px;
  height: 25px;
  text-align: left;
  font-size: 13px;
  line-height: 25px;
  letter-spacing: .25px;
}
```

```html
<div class="cover-page" data-cw-role="page-root" data-cover-layout="cover-06-organic-visual-left-text-right" data-cover-visual="side-visual">
  <div class="cover-visual cover-local" data-cw-role="media-block" data-cover-role="cover-visual" data-cover-slot="cover-06-organic-visual" data-cover-visual-role="side-visual">
    <img src="{{coverImageUrl}}" alt="{{coverAlt}}">
  </div>
  <header class="cover-copy" data-cw-role="title-block">
    <h1 class="cover-title">{{title}}</h1>
    <p class="cover-subtitle">{{subtitle}}</p>
  </header>
  <footer class="cover-meta">{{meta}}</footer>
</div>
```

### 4.9 `cover-07-top-title-image-card` 上文下图卡片型

固定槽位：顶部只放主标题，下方图片卡片 `900×357`，教材/作者/年级等信息固定左下。此版式对应设计稿第 7 列，研发模式读取图片槽位为 `1800×713`，左右 `60px`，上 `214px`，下 `153px`；折算到互动课件为 `900×357`，比例约 `2.52:1`。

```css
.cover-page[data-cover-layout="cover-07-top-title-image-card"] .cover-copy {
  left: 48px;
  top: 30px;
  width: 864px;
  height: 50px;
  text-align: left;
}
.cover-page[data-cover-layout="cover-07-top-title-image-card"] .cover-title {
  font-size: 50px;
  line-height: 50px;
}
.cover-page[data-cover-layout="cover-07-top-title-image-card"] .cover-subtitle,
.cover-page[data-cover-layout="cover-07-top-title-image-card"] .cover-eyebrow {
  display: none;
}
.cover-page[data-cover-layout="cover-07-top-title-image-card"] .cover-visual {
  left: 30px;
  top: 107px;
  width: 900px;
  height: 357px;
  border-radius: 40px;
  overflow: hidden;
}
.cover-page[data-cover-layout="cover-07-top-title-image-card"] .cover-meta {
  left: 58px;
  top: 478px;
  width: 672px;
  height: 25px;
  text-align: left;
  font-size: 18px;
  line-height: 25px;
  letter-spacing: .25px;
}
```

```html
<div class="cover-page" data-cw-role="page-root" data-cover-layout="cover-07-top-title-image-card" data-cover-visual="inline-card">
  <header class="cover-copy" data-cw-role="title-block">
    <h1 class="cover-title">{{title}}</h1>
    <p class="cover-subtitle"></p>
  </header>
  <div class="cover-visual cover-image-card" data-cw-role="media-block" data-cover-role="cover-visual" data-cover-slot="cover-07-image-card" data-cover-visual-role="inline-card">
    <img src="{{coverImageUrl}}" alt="{{coverAlt}}">
  </div>
  <footer class="cover-meta">{{meta}}</footer>
</div>
```

严禁把 `cover-07` 写成下面这些形式：

```html
<!-- 错：教材信息放在标题下面，挤占标题与图片间距 -->
<h1>出师表</h1><p>统编版语文 · 九年级下册</p>

<!-- 错：图片卡片随内容撑开 -->
<div class="cover-card" style="flex:1;margin:20px 0"></div>

<!-- 错：普通页标题装饰污染封面 -->
<h1 style="border-left:4px solid currentColor;padding-left:12px">出师表</h1>
```

---

## 五、版式选择规则

1. 若 `data-cover-visual="none"`：优先选 `cover-01-center-stack` 或 `cover-02-left-top-stack`。
2. 若 `data-cover-visual="full-bleed-background"`：只能从 `cover-01-center-stack`、`cover-02-left-top-stack`、`cover-03-left-lower-stack`、`cover-04-right-lower-stack` 中选择，并根据图片主体避让文字区。
3. 若 `data-cover-visual="side-visual"`：优先选 `cover-05-left-visual-right-title` 或 `cover-06-organic-visual-left-text-right`。
4. 若 `data-cover-visual="inline-card"`：优先选 `cover-07-top-title-image-card`。
5. 若图片主体复杂、没有安全留白，不得使用整图背景版式，改用局部图版式。
6. 若标题过长，不得强行使用超大居中标题；优先使用左上型、右侧分栏型或上文下图型。
7. 版式一旦用于首次生成封面，模板替换不得修改 `data-cover-layout`，只允许根据 `data-cover-visual` 决定模板背景是否启用。

---

## 六、生成检查清单

- [ ] 第 1 页 `page-root` 已写 `data-cover-layout` 和 `data-cover-visual`。
- [ ] 第 1 页使用的是第四节固定 CSS/HTML 骨架之一，而不是模型自由写出的相似结构。
- [ ] 若有封面图，素材清单已记录 `coverImageSlot`，封面图 prompt 已包含 slot 目标尺寸、目标比例和横竖方向。
- [ ] 若有封面图，HTML 媒体层已写 `data-cover-slot="<slotId>"`，且该 slot 与素材清单、prompt 一致。
- [ ] 使用了 7 种封面版式之一，没有自由发明第 8 种封面结构。
- [ ] `{{title}}` 只包含课题主标题，教材版本、年级、册次、作者、课时等信息全部在 `.cover-meta`，没有混入 `.cover-title` 或 `.cover-subtitle`。
- [ ] `.cover-copy`、`.cover-meta`、`.cover-visual` 的 `left/top/width/height` 与 4.1 槽位登记表一致，没有为了内容或图片临时移动槽位。
- [ ] 所有文字和图片位置均按固定 px 坐标落位，没有使用百分比、`clamp()`、`flex` 自适应或依赖当前浏览器截图缩放的坐标。
- [ ] 图片槽位按 `left/top/width/height` 固定落位，没有用 `flex: 1`、自动填充或内容撑开代替。
- [ ] 若封面图是整图背景，图片在独立 `cover-visual` 媒体层中，不是 `page-root background-image`。
- [ ] 若封面图是局部图，模板背景仍可保留，图片受 `media-block` 保护。
- [ ] `cover-07-top-title-image-card` 的标题区只放主标题，`.cover-meta` 在左下，图片卡片保持 `left=30px top=107px width=900px height=357px`，教材信息没有放到标题下面。
- [ ] 封面标题没有继承普通页面标题的左竖杠、下划线、编号、横杠或 `padding-left` 装饰。
- [ ] 标题、图片、页脚均在 960×540 画布内，不溢出、不遮挡主体。
- [ ] 没有为了套模板背景移动封面图片或标题位置。
