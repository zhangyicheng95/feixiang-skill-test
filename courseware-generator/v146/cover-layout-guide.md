# 互动课件封面版式指南

> 本文件用于第 1 页封面首次生成，并可在 Phase 3 准备封面图素材前读取一次以确定封面图片槽位。它沉淀设计稿最上方 7 列封面排版范式：文字大小、文字相对位置、图片槽位大小、图片相对位置和封面图角色。Phase 3 只读取图片槽位时，不要求已选择字体 preset；Phase 4 生成封面 HTML 前，必须已按 `typography-guide.md` 选择字体 preset。本文件只规定字号、字重、行高、位置和图片槽位，不重新选择字体家族。Phase 7 模板注入只能读取已生成封面的标记做视觉适配，禁止重新选择版式、移动标题或移动图片。

---

## 一、使用时机

本文件有两个固定使用时机：

- **Phase 3 封面图生图前**：只用于判断封面图角色、选择封面版式和确定 `coverImageSlot`，并把图片槽位传给 `image-generation-guide.md`。此时不处理字体家族。
- **Phase 4 生成第 1 页封面 HTML 前**：完整使用本文件的封面版式、文字层级、图片槽位和相对位置，并结合 `typography-guide.md` 已选字体 preset 生成封面结构。

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
3. 字体家族由 `typography-guide.md` 的 `--cw-courseware-*` 变量提供；本文件只给字号、字重、行高和相对位置建议。
4. 本文件不参与 Phase 7 模板后处理；模板后处理不得重排封面标题、图片、文字安全区，也不得重新选择封面字体。
5. 所有位置都使用相对比例描述，不能写成依赖当前截图缩放比例的绝对坐标。
6. 封面 HTML 必须按本文件的图片槽位生成固定区域；禁止用 `flex: 1`、自动填充、随内容撑开等模糊布局替代图片槽位。

---

## 二、画布与比例坐标

互动课件画布固定为 `960×540`。设计稿可按 `1920×1080` 理解；落到互动课件时等比缩放 0.5。研发模式中读到的字号也按这个比例折算，例如设计稿标题 `190px / line-height 200px`，在互动课件中约为 `95px / line-height 100px`。

比例坐标写法：

| 字段 | 含义 | 换算 |
|---|---|---|
| `x` | 左上角横向比例 | `left = x * 960px` |
| `y` | 左上角纵向比例 | `top = y * 540px` |
| `w` | 宽度比例 | `width = w * 960px` |
| `h` | 高度比例 | `height = h * 540px` |

生成 HTML 时推荐用百分比表达：

```css
.cover-copy {
  position: absolute;
  left: 17%;
  top: 36%;
  width: 66%;
}
```

封面文字层级：

> 字体家族使用 `typography-guide.md` 已选 preset 中的 `--cw-courseware-title-font` / `--cw-courseware-body-font` / `--cw-courseware-label-font`。下表只规定字号、行高和字重；除非字体可读性不足，不要把封面强制改回 `PingFang SC`。

| 层级 | 设计来源 | 960×540 建议 |
|---|---|---|
| 超大标题 | 研发模式读数 `PingFang SC Medium, 190px/200px` | `font-size: 72px-95px; line-height: 1.05; font-weight: 500;` |
| 大标题 | 多数字段标题 | `font-size: 44px-64px; line-height: 1.08; font-weight: 500-600;` |
| 中标题 | 长中文标题、英文标题 | `font-size: 30px-44px; line-height: 1.12; font-weight: 500-600;` |
| 副标题 | 课题说明、年级册别 | `font-size: 15px-24px; line-height: 1.35; font-weight: 400-500;` |
| 页眉/页脚信息 | 年级、教材、讲次、作者 | `font-size: 8px-13px; line-height: 1.4; font-weight: 400;` |

防溢出规则：

- 标题少于 7 个中文字符时可用超大标题。
- 标题 7-12 个中文字符时使用大标题并允许换行。
- 标题超过 12 个中文字符时优先使用中标题，最多 2 行；仍溢出时缩小到 `28px`，不得挤压图片。
- 字距保持 `letter-spacing: 0`，不要使用负字距。

---

## 三、封面图片角色

第 1 页必须在 `page-root` 上写明封面图角色：

| `data-cover-visual` | 含义 | 模板背景关系 |
|---|---|---|
| `none` | 无封面生图或无主视觉图 | Phase 7 可完整使用模板背景 |
| `full-bleed-background` | 生图铺满整页作为封面背景 | Phase 7 禁用该页模板背景，只保留模板字体、颜色、遮罩和弱装饰 |
| `side-visual` | 生图作为左侧/右侧主视觉，不铺满整页 | Phase 7 保留模板背景，同时保护封面图 |
| `inline-card` | 生图作为下方/局部卡片图或内容图 | Phase 7 保留模板背景，同时保护封面图 |

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
  x: .031,
  y: .198,
  w: .938,
  h: .660,
  targetPx: "900x357",
  aspectRatio: "2.52:1",
  promptHint: "超宽横向图片，主体完整落在画面中央，不含文字，不带边框"
}
```

硬规则：

1. `coverImageSlot` 必须进入素材清单，并在生成第 1 页 HTML 时复用同一个 slot。
2. 封面生图 prompt 必须明确目标比例和方向，例如 `2.52:1 超宽横向封面卡片图`、`16:9 横向整页背景图`、`0.66:1 竖向主体图`。
3. 生图 prompt 禁止要求生成课件标题、中文题名、公式、页脚文字或按钮文案；这些文字由 HTML 放入文字槽位。
4. 如果封面图已生成但比例明显不匹配当前 `coverImageSlot`，不得用裁切掩盖问题；必须改选兼容槽位、使用 `contain` 保护主体，或重新按 slot 比例生成图片。
5. HTML 中的封面图片容器必须写 `data-cover-slot="<slotId>"`，便于后续检查。

| 版式 | 可用图片槽位 | `data-cover-visual` | 槽位比例位置 | 960×540 目标像素 | 目标比例 | 生图方向要求 |
|---|---|---|---|---|---|---|
| `cover-01-center-stack` | `cover-full-bleed` | `full-bleed-background` | `x=0 y=0 w=1 h=1` | `960×540` | `1.78:1` | 16:9 横向整页背景，主体避开标题安全区 |
| `cover-02-left-top-stack` | `cover-full-bleed` | `full-bleed-background` | `x=0 y=0 w=1 h=1` | `960×540` | `1.78:1` | 16:9 横向整页背景，左上留文字安全区 |
| `cover-03-left-lower-stack` | `cover-full-bleed` | `full-bleed-background` | `x=0 y=0 w=1 h=1` | `960×540` | `1.78:1` | 16:9 横向整页背景，左中下留文字安全区 |
| `cover-04-right-lower-stack` | `cover-full-bleed` | `full-bleed-background` | `x=0 y=0 w=1 h=1` | `960×540` | `1.78:1` | 16:9 横向整页背景，右下留文字安全区 |
| `cover-05-left-visual-right-title` | `cover-05-left-visual` | `side-visual` | `x=0 y=0 w=.52 h=1` | `499×540` | `0.92:1` | 近方形或轻竖向左栏主视觉，主体完整 |
| `cover-06-organic-visual-left-text-right` | `cover-06-organic-visual` | `side-visual` | `x=.04 y=0 w=.34 h=.92` | `326×497` | `0.66:1` | 竖向主体图，适合圆形/胶囊遮罩，主体不要贴边 |
| `cover-07-top-title-image-card` | `cover-07-image-card` | `inline-card` | `x=.031 y=.198 w=.938 h=.660` | `900×357` | `2.52:1` | 超宽横向卡片图，主体横向展开，不能生成竖图 |

---

## 四、7 种封面版式

### 4.1 `cover-01-center-stack` 居中标题型

对应设计稿第 1 列。标题在画面中心，副标题在标题下方，页脚信息在下方居中。适合无图封面、模板背景封面、或有足够留白的整图背景封面。

| 区域 | 比例位置 | 对齐 | 字体建议 |
|---|---|---|---|
| 标题区 | `x=.17 y=.36 w=.66 h=.20` | 居中 | 超大标题或大标题 |
| 副标题 | 标题区内，标题下方 `12-18px` | 居中 | 副标题 |
| 页脚 | `x=.22 y=.74 w=.56 h=.08` | 居中 | 页脚信息 |
| 封面图槽位 | `slotId=cover-full-bleed; x=0 y=0 w=1 h=1; target=960×540; ratio=1.78:1` | 铺满 | `object-fit: cover`，prompt 要求 16:9 横向背景 |

使用限制：

- 若整图背景中人物或核心主体位于画面中央，不选本版式，避免标题压住主体。
- 标题超过两行时改用 `cover-02-left-top-stack` 或 `cover-07-top-title-image-card`。

### 4.2 `cover-02-left-top-stack` 左上标题型

对应设计稿第 2 列。标题和说明靠左上区域，底部保留页脚。适合留白在左上、信息感强、公式/知识标题类封面。

| 区域 | 比例位置 | 对齐 | 字体建议 |
|---|---|---|---|
| 页眉小字 | `x=.05 y=.08 w=.28 h=.04` | 左对齐 | 页眉信息 |
| 标题区 | `x=.05 y=.22 w=.52 h=.26` | 左对齐 | 大标题 |
| 副标题 | 标题区内，标题下方 `10-14px` | 左对齐 | 副标题 |
| 页脚 | `x=.05 y=.86 w=.42 h=.06` | 左对齐 | 页脚信息 |
| 封面图槽位 | 若有图：`slotId=cover-full-bleed; x=0 y=0 w=1 h=1; target=960×540; ratio=1.78:1` | 铺满/背景 | prompt 要求 16:9 横向背景，左上留文字安全区 |

使用限制：

- 图片左上有关键人物脸部、器物细节时不选。
- 标题不可贴边；左侧安全边距不小于 `5%`。

### 4.3 `cover-03-left-lower-stack` 左中下标题型

对应设计稿第 3 列。标题位于左侧中下部，适合背景图上方或右侧有视觉主体、左下有暗色/浅色留白的封面。

| 区域 | 比例位置 | 对齐 | 字体建议 |
|---|---|---|---|
| 页眉小字 | `x=.05 y=.08 w=.30 h=.04` | 左对齐 | 页眉信息 |
| 标题区 | `x=.06 y=.44 w=.48 h=.24` | 左对齐 | 大标题或中标题 |
| 副标题 | 标题区内，标题下方 `8-12px` | 左对齐 | 副标题 |
| 页脚 | `x=.06 y=.86 w=.38 h=.06` | 左对齐 | 页脚信息 |
| 封面图槽位 | `slotId=cover-full-bleed; x=0 y=0 w=1 h=1; target=960×540; ratio=1.78:1` | 铺满 | prompt 要求 16:9 横向背景，左中下留文字安全区 |

使用限制：

- 左侧中下部有主体时不选。
- 背景图复杂时必须加文字安全区，不得直接压文字。

### 4.4 `cover-04-right-lower-stack` 右下标题型

对应设计稿第 4 列。标题位于右侧中下部，适合视觉主体在左侧、动态感强的整图背景封面。

| 区域 | 比例位置 | 对齐 | 字体建议 |
|---|---|---|---|
| 页眉小字 | `x=.05 y=.08 w=.30 h=.04` | 左对齐 | 页眉信息 |
| 标题区 | `x=.54 y=.44 w=.40 h=.26` | 右对齐 | 大标题或中标题 |
| 副标题 | 标题区内，标题下方 `8-12px` | 右对齐 | 副标题 |
| 页脚 | `x=.06 y=.86 w=.38 h=.06` | 左对齐 | 页脚信息 |
| 封面图槽位 | `slotId=cover-full-bleed; x=0 y=0 w=1 h=1; target=960×540; ratio=1.78:1` | 铺满 | prompt 要求 16:9 横向背景，右侧留文字安全区 |

使用限制：

- 右侧有主体、人脸、车体或关键图像信息时不选。
- 长中文标题优先分两行，避免压到画面边缘。

### 4.5 `cover-05-left-visual-right-title` 左图右文分栏型

对应设计稿第 5 列。左侧为主视觉图片或图案，右侧为标题区。适合人物/场景图作为局部主视觉，不适合全图铺底。

| 区域 | 比例位置 | 对齐 | 字体建议 |
|---|---|---|---|
| 左侧主视觉槽位 | `slotId=cover-05-left-visual; x=0 y=0 w=.52 h=1; target≈499×540; ratio≈0.92:1` | 铺满左栏 | prompt 要求近方形/轻竖向主视觉，主体完整 |
| 右侧标题区 | `x=.58 y=.20 w=.34 h=.34` | 左对齐 | 中标题或大标题 |
| 右侧副标题 | 标题区内，标题下方 `10-14px` | 左对齐 | 副标题 |
| 页脚 | `x=.58 y=.84 w=.32 h=.06` | 左对齐 | 页脚信息 |

使用限制：

- 必须把图片放在 `cover-visual`，不能当 `page-root background`。
- 左图右文之间保持明显分区，不把文字压在图片上。

### 4.6 `cover-06-organic-visual-left-text-right` 左侧异形图右文型

对应设计稿第 6 列。左侧图片使用圆形、胶囊形或有机圆角遮罩，右侧放标题。适合单主体、人物、物体、食品、实验器物等视觉主体。

| 区域 | 比例位置 | 对齐 | 字体建议 |
|---|---|---|---|
| 左侧异形主视觉槽位 | `slotId=cover-06-organic-visual; x=.04 y=0 w=.34 h=.92; target≈326×497; ratio≈0.66:1` | 左侧靠上 | prompt 要求竖向主体图，适合圆角/椭圆遮罩 |
| 右侧标题区 | `x=.50 y=.30 w=.40 h=.28` | 左对齐 | 中标题或大标题 |
| 右侧副标题 | 标题区内，标题下方 `10-14px` | 左对齐 | 副标题 |
| 页脚 | `x=.50 y=.82 w=.34 h=.06` | 左对齐 | 页脚信息 |

使用限制：

- 遮罩只作用于图片容器，不得裁掉主体头部、器物关键部位。
- 模板背景保留，图片作为局部主视觉。

### 4.7 `cover-07-top-title-image-card` 上文下图卡片型

对应设计稿第 7 列。顶部为标题信息，下方为大图卡片。适合历史文化、文学阅读、实验场景等需要展示图片但标题不能压图的封面。

| 区域 | 比例位置 | 对齐 | 字体建议 |
|---|---|---|---|
| 顶部标题区 | `x=.05 y=.055 w=.90 h=.085` | 左对齐 | 中标题，建议 `30-36px`，不能使用封面英雄大字 |
| 下方图片卡片槽位 | `slotId=cover-07-image-card; x=.031 y=.198 w=.938 h=.660; target≈900×357; ratio≈2.52:1` | 居中 | 圆角 `14-18px`，prompt 必须要求超宽横向卡片图 |
| 左下小字/页脚 | `x=.06 y=.885 w=.70 h=.055` | 左对齐 | 作者、册次、课时、教材等小字信息 |

使用限制：

- 图片卡片内部保护原图，不加滤镜、不改色。
- 本版式图片槽位来自设计稿研发模式：`1800×713`，左右各 `60px`，上 `214px`，下 `153px`；折算到 960×540 为约 `900×357`。封面生图必须按 `2.52:1` 超宽横向构图生成，禁止生成竖图后裁切。
- 标题长、图片主体复杂、需要避免文字压图时优先选本版式。
- 本版式的标题区只放主标题。作者、册次、教材、课时、短副标题等小字必须放在左下小字/页脚区域，禁止放在标题下方挤占图片上方间距。
- 顶部标题区底部到图片卡片顶部必须至少保留 `24px` 视觉间距；若标题两行后会挤到图片，必须缩小标题字号或改选其他封面版式，禁止上移图片卡片。
- 封面标题不得继承普通页面标题的左竖杠、下划线、编号装饰或 `padding-left`。若共享 CSS 有 `[data-cw-role="title-block"] h1 { border-left: ... }` 一类规则，必须在封面局部重置。

推荐落位代码：

```css
.cover-page[data-cover-layout="cover-07-top-title-image-card"] {
  position: relative;
  width: 960px;
  height: 540px;
  min-height: 100%;
}

.cover-page[data-cover-layout="cover-07-top-title-image-card"] .cover-copy {
  position: absolute;
  left: 5%;
  top: 5.5%;
  width: 90%;
  height: 8.5%;
  z-index: 2;
}

.cover-page[data-cover-layout="cover-07-top-title-image-card"] .cover-copy h1 {
  margin: 0;
  font-size: 32px;
  line-height: 1.15;
  border-left: 0 !important;
  padding-left: 0 !important;
}

.cover-page[data-cover-layout="cover-07-top-title-image-card"] .cover-copy p {
  display: none;
}

.cover-page[data-cover-layout="cover-07-top-title-image-card"] .cover-visual[data-cover-slot="cover-07-image-card"] {
  position: absolute;
  left: 3.1%;
  top: 19.8%;
  width: 93.8%;
  height: 66%;
  border-radius: 18px;
  overflow: hidden;
}

.cover-page[data-cover-layout="cover-07-top-title-image-card"] .cover-footer,
.cover-page[data-cover-layout="cover-07-top-title-image-card"] .cover-meta {
  position: absolute;
  left: 6%;
  top: 88.5%;
  width: 70%;
  font-size: 13px;
  line-height: 1.4;
  z-index: 2;
}
```

禁止写成：

```css
.cover-card {
  flex: 1;
  margin: 20px 0;
}
```

---

## 五、版式选择规则

1. 若 `data-cover-visual="none"`：优先选 `cover-01-center-stack` 或 `cover-02-left-top-stack`。
2. 若 `data-cover-visual="full-bleed-background"`：只能从 `cover-01-center-stack`、`cover-02-left-top-stack`、`cover-03-left-lower-stack`、`cover-04-right-lower-stack` 中选择，并根据图片主体避让文字区。
3. 若 `data-cover-visual="side-visual"`：优先选 `cover-05-left-visual-right-title` 或 `cover-06-organic-visual-left-text-right`。
4. 若 `data-cover-visual="inline-card"`：优先选 `cover-07-top-title-image-card`。
5. 若图片主体复杂、没有安全留白，不得使用整图背景版式，改用局部图版式。
6. 若标题过长，不得强行使用超大居中标题；优先使用左上型、右侧分栏型或上文下图型。
7. 版式一旦用于首次生成封面，Phase 7 模板注入不得修改 `data-cover-layout`，只允许根据 `data-cover-visual` 决定模板背景是否启用。

---

## 六、生成检查清单

- [ ] 第 1 页 `page-root` 已写 `data-cover-layout` 和 `data-cover-visual`。
- [ ] 若有封面图，素材清单已记录 `coverImageSlot`，封面图 prompt 已包含 slot 目标尺寸、目标比例和横竖方向。
- [ ] 若有封面图，HTML 媒体层已写 `data-cover-slot="<slotId>"`，且该 slot 与素材清单、prompt 一致。
- [ ] 使用了 7 种封面版式之一，没有自由发明第 8 种封面结构。
- [ ] 所有文字和图片位置均按比例落位，没有使用依赖当前浏览器截图缩放的坐标。
- [ ] 图片槽位按 `x/y/w/h` 固定落位，没有用 `flex: 1`、自动填充或内容撑开代替。
- [ ] 若封面图是整图背景，图片在独立 `cover-visual` 媒体层中，不是 `page-root background-image`。
- [ ] 若封面图是局部图，模板背景仍可保留，图片受 `media-block` 保护。
- [ ] 标题、图片、页脚均在 960×540 画布内，不溢出、不遮挡主体。
- [ ] 没有为了套模板背景移动封面图片或标题位置。
