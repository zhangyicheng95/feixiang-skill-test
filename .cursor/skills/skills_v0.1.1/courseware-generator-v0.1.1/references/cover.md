# 封面版式指南

> 路径：`references/cover.md`  
> Step 2 生成第 1 页封面前必读。7 种固定坐标版式；字体变量见 `references/typography.md`。  
> 若第 1 页需要外链/生成封面图，在 **Step 1** 定 `coverImageSlot`（见 §三）。

---

## 一、使用时机

- **素材阶段（若第 1 页需要封面图）**：先据本文件选版式、定 `coverImageSlot`（目标像素/比例/方向），再去取图（真实 URL / 生成 URL，禁止 base64）。
- **生成第 1 页封面 HTML 前**：完整套用本文件的版式坐标 + `references/typography.md` 已选字体 preset。

硬边界：

1. 封面根容器必须是 `.cover-page`，固定 `960×540`，**不是**普通页的 `min-height:100%`。
2. 所有位置用 `960×540` 画布内的**固定 px 坐标**，禁止百分比、`clamp()`、`flex` 自适应、`aspect-ratio`、`transform:scale()`。
3. 必须复制第四节 7 个版式之一的固定 CSS/HTML，只替换 `{{...}}` 字段值，禁止自由重写结构、移动槽位。
4. 封面标题不得继承普通页标题的左竖杠/下划线/编号装饰。
5. 有封面图时图片放独立媒体层 `.cover-visual`，禁止写成 `page-root` 的 `background-image`。

---

## 二、画布与坐标换算

画布固定 `960×540`；设计稿按 `1920×1080` 理解，落地等比缩放 0.5（设计稿 `x/2 = left`，`y/2 = top`，宽高同理）。

封面文字层级（只规定字号/行高/字重，字体家族用 `--cw-courseware-*`）：

| 层级 | 960×540 换算 |
|---|---|
| 超大标题 | `font-size:95px; line-height:100px; font-weight:500;` |
| 150px 大标题 | `font-size:75px; line-height:85px; font-weight:500;` |
| 140px 大标题 | `font-size:70px; line-height:75px; font-weight:500;` |
| 100px 中标题 | `font-size:50px; line-height:50px; font-weight:500;` |
| 副标题 | `font-size:18px/28px` 或 `45px/45px`（视版式） |
| 页眉/页脚信息 | `font-size:13px/25px` 或 `18px/25px`（视版式） |

防溢出：优先用版式固定字号；仅标题实际溢出 `.cover-copy` 时才等比缩小 `.cover-title` 字号，不移动 `.cover-copy`/`.cover-meta`/`.cover-visual`；标题最多 2 行；`letter-spacing:0`，不用负字距。

---

## 三、封面图片角色与槽位

第 1 页 `page-root` 必须写 `data-cover-visual`：

| `data-cover-visual` | 含义 |
|---|---|
| `none` | 无封面图 |
| `full-bleed-background` | 生图/图片铺满整页作背景 |
| `side-visual` | 图片作左/右侧主视觉，不铺满 |
| `inline-card` | 图片作下方/局部卡片图 |

若有封面图，记录 `coverImageSlot`（进素材清单，生成时复用同一 slot）：

```text
coverImageSlot = {
  layout: "cover-07-top-title-image-card",
  slotId: "cover-07-image-card",
  visual: "inline-card",
  left:"30px", top:"107px", width:"900px", height:"357px",
  targetPx:"900x357", aspectRatio:"2.52:1",
  promptHint: "超宽横向图，主体居中，不含文字/边框"
}
```

| 版式 | 图片槽位 | `data-cover-visual` | 固定槽位 | 目标像素 | 比例 |
|---|---|---|---|---|---|
| `cover-01-center-stack` | `cover-full-bleed` | full-bleed-background | `0,0,960,540` | 960×540 | 1.78:1 |
| `cover-02-left-top-stack` | `cover-full-bleed` | full-bleed-background | `0,0,960,540` | 960×540 | 1.78:1 |
| `cover-03-left-lower-stack` | `cover-full-bleed` | full-bleed-background | `0,0,960,540` | 960×540 | 1.78:1 |
| `cover-04-right-lower-stack` | `cover-full-bleed` | full-bleed-background | `0,0,960,540` | 960×540 | 1.78:1 |
| `cover-05-left-visual-right-title` | `cover-05-left-visual` | side-visual | `0,0,480,540` | 480×540 | 0.89:1 |
| `cover-06-organic-visual-left-text-right` | `cover-06-organic-visual` | side-visual | 遮罩`38,0,415,540`；源图`415×709`上移`-85px` | 415×709 | 0.59:1 |
| `cover-07-top-title-image-card` | `cover-07-image-card` | inline-card | `30,107,900,357` | 900×357 | 2.52:1 |

图片保护：`cover-visual` 内图片禁止滤镜/染色/换图/裁主体；要文字可读加独立半透明遮罩层，不改图片颜色。`full-bleed` 用 `object-fit:cover`；`side-visual`/`inline-card` 优先保主体完整，比例不符时用 `contain` 或按 slot 比例重取图。

---

## 四、固定代码版式合同

选一个 `data-cover-layout`，复制对应 CSS + HTML，只替换 `{{...}}`。

**无封面图**：`data-cover-visual="none"`，省略整个 `.cover-visual` 块（含 overlay）。  
**有封面图**：按版式表设置 `data-cover-visual` 并插入对应 `.cover-visual` 结构（见各版式 HTML 注释）。

字段归位：`{{title}}` 只放主标题；`{{subtitle}}` 短副题；`{{eyebrow}}` 顶部小字；`{{meta}}` 教材版本/年级/册次/作者（**只进 `.cover-meta`**，禁止混入标题/副标题）；`{{coverImageUrl}}`/`{{coverAlt}}` 封面图。

### 4.2 公共 CSS（必复制）

```css
.cover-page {
  position: relative;
  width: 960px; height: 540px;
  min-width: 960px; max-width: 960px;
  min-height: 540px; max-height: 540px;
  flex-shrink: 0; color: #111;
}
.cover-page * { box-sizing: border-box; }
.cover-title {
  margin: 0; font-family: var(--cw-courseware-title-font);
  font-weight: 500; letter-spacing: 0;
  border: 0 !important; padding: 0 !important; text-decoration: none !important;
}
.cover-subtitle, .cover-eyebrow, .cover-meta {
  margin: 0; font-family: var(--cw-courseware-body-font); letter-spacing: 0;
}
.cover-visual { position: absolute; z-index: 0; }
.cover-visual img { display: block; width: 100%; height: 100%; }
.cover-full-bleed img { object-fit: cover; }
.cover-local img { object-fit: contain; }
.cover-image-card img { object-fit: cover; }
.cover-overlay { position: absolute; inset: 0; pointer-events: none; }
.cover-copy, .cover-meta { position: absolute; z-index: 2; }
```

### 4.3 `cover-01-center-stack` 居中标题型（无图/背景避中）

```css
.cover-page[data-cover-layout="cover-01-center-stack"] .cover-copy { left:163px; top:184px; width:634px; height:135px; text-align:center; }
.cover-page[data-cover-layout="cover-01-center-stack"] .cover-title { font-size:95px; line-height:100px; }
.cover-page[data-cover-layout="cover-01-center-stack"] .cover-subtitle { margin-top:16px; font-size:45px; line-height:45px; font-weight:400; letter-spacing:.25px; }
.cover-page[data-cover-layout="cover-01-center-stack"] .cover-meta { left:211px; top:400px; width:538px; height:25px; text-align:center; font-size:25px; line-height:25px; font-weight:500; letter-spacing:.25px; }
.cover-page[data-cover-layout="cover-01-center-stack"] .cover-visual { left:0; top:0; width:960px; height:540px; }
```

```html
<!-- 无图：data-cover-visual="none"，不写 .cover-visual -->
<div class="cover-page" data-cw-role="page-root" data-cover-layout="cover-01-center-stack" data-cover-visual="none">
  <header class="cover-copy" data-cw-role="title-block">
    <h1 class="cover-title">{{title}}</h1>
    <p class="cover-subtitle">{{subtitle}}</p>
  </header>
  <footer class="cover-meta">{{meta}}</footer>
</div>
<!-- 有 full-bleed 图时：改 data-cover-visual="full-bleed-background"，在 header 前插入 .cover-visual.cover-full-bleed + img + overlay -->
```

### 4.4 `cover-02-left-top-stack` 左上标题型

```css
.cover-page[data-cover-layout="cover-02-left-top-stack"] .cover-eyebrow { position:absolute; left:48px; top:43px; width:269px; height:25px; font-size:13px; line-height:25px; letter-spacing:.25px; }
.cover-page[data-cover-layout="cover-02-left-top-stack"] .cover-copy { left:48px; top:119px; width:499px; height:140px; text-align:left; }
.cover-page[data-cover-layout="cover-02-left-top-stack"] .cover-title { font-size:75px; line-height:85px; }
.cover-page[data-cover-layout="cover-02-left-top-stack"] .cover-subtitle { margin-top:12px; font-size:18px; line-height:28px; font-weight:500; letter-spacing:.5px; }
.cover-page[data-cover-layout="cover-02-left-top-stack"] .cover-meta { left:48px; top:464px; width:403px; height:25px; text-align:left; font-size:13px; line-height:25px; letter-spacing:.25px; }
.cover-page[data-cover-layout="cover-02-left-top-stack"] .cover-visual { left:0; top:0; width:960px; height:540px; }
```

```html
<div class="cover-page" data-cw-role="page-root" data-cover-layout="cover-02-left-top-stack" data-cover-visual="full-bleed-background">
  <div class="cover-visual cover-full-bleed" data-cover-slot="cover-full-bleed">
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

### 4.5 `cover-03-left-lower-stack` 左中下标题型（主体在右/上）

```css
.cover-page[data-cover-layout="cover-03-left-lower-stack"] .cover-eyebrow { position:absolute; left:48px; top:43px; width:288px; height:25px; font-size:13px; line-height:25px; letter-spacing:.25px; }
.cover-page[data-cover-layout="cover-03-left-lower-stack"] .cover-copy { left:58px; top:238px; width:461px; height:130px; text-align:left; }
.cover-page[data-cover-layout="cover-03-left-lower-stack"] .cover-title { font-size:75px; line-height:85px; }
.cover-page[data-cover-layout="cover-03-left-lower-stack"] .cover-subtitle { margin-top:10px; font-size:18px; line-height:28px; font-weight:500; letter-spacing:.5px; }
.cover-page[data-cover-layout="cover-03-left-lower-stack"] .cover-meta { left:58px; top:464px; width:365px; height:25px; text-align:left; font-size:13px; line-height:25px; letter-spacing:.25px; }
.cover-page[data-cover-layout="cover-03-left-lower-stack"] .cover-visual { left:0; top:0; width:960px; height:540px; }
```

```html
<div class="cover-page" data-cw-role="page-root" data-cover-layout="cover-03-left-lower-stack" data-cover-visual="full-bleed-background">
  <div class="cover-visual cover-full-bleed" data-cover-slot="cover-full-bleed">
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

### 4.6 `cover-04-right-lower-stack` 右下标题型（主体在左）

```css
.cover-page[data-cover-layout="cover-04-right-lower-stack"] .cover-eyebrow { position:absolute; left:48px; top:43px; width:288px; height:25px; font-size:13px; line-height:25px; letter-spacing:.25px; }
.cover-page[data-cover-layout="cover-04-right-lower-stack"] .cover-copy { left:518px; top:238px; width:384px; height:140px; text-align:right; }
.cover-page[data-cover-layout="cover-04-right-lower-stack"] .cover-title { font-size:75px; line-height:85px; }
.cover-page[data-cover-layout="cover-04-right-lower-stack"] .cover-subtitle { margin-top:10px; font-size:18px; line-height:28px; font-weight:500; letter-spacing:.5px; }
.cover-page[data-cover-layout="cover-04-right-lower-stack"] .cover-meta { left:58px; top:464px; width:365px; height:25px; text-align:left; font-size:13px; line-height:25px; letter-spacing:.25px; }
.cover-page[data-cover-layout="cover-04-right-lower-stack"] .cover-visual { left:0; top:0; width:960px; height:540px; }
```

```html
<div class="cover-page" data-cw-role="page-root" data-cover-layout="cover-04-right-lower-stack" data-cover-visual="full-bleed-background">
  <div class="cover-visual cover-full-bleed" data-cover-slot="cover-full-bleed">
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

```css
.cover-page[data-cover-layout="cover-05-left-visual-right-title"] .cover-visual { left:0; top:0; width:480px; height:540px; }
.cover-page[data-cover-layout="cover-05-left-visual-right-title"] .cover-copy { left:557px; top:108px; width:326px; height:184px; text-align:left; }
.cover-page[data-cover-layout="cover-05-left-visual-right-title"] .cover-title { font-size:70px; line-height:75px; }
.cover-page[data-cover-layout="cover-05-left-visual-right-title"] .cover-subtitle { margin-top:12px; font-size:18px; line-height:28px; font-weight:500; letter-spacing:.5px; }
.cover-page[data-cover-layout="cover-05-left-visual-right-title"] .cover-meta { left:557px; top:454px; width:307px; height:25px; text-align:left; font-size:13px; line-height:25px; letter-spacing:.25px; }
```

```html
<div class="cover-page" data-cw-role="page-root" data-cover-layout="cover-05-left-visual-right-title" data-cover-visual="side-visual">
  <div class="cover-visual cover-local" data-cover-slot="cover-05-left-visual">
    <img src="{{coverImageUrl}}" alt="{{coverAlt}}">
  </div>
  <header class="cover-copy" data-cw-role="title-block">
    <h1 class="cover-title">{{title}}</h1>
    <p class="cover-subtitle">{{subtitle}}</p>
  </header>
  <footer class="cover-meta">{{meta}}</footer>
</div>
```

### 4.8 `cover-06-organic-visual-left-text-right` 左异形图右文型（竖向主体）

```css
.cover-page[data-cover-layout="cover-06-organic-visual-left-text-right"] .cover-visual { left:38px; top:0; width:415px; height:540px; border-radius:0 0 120px 120px; overflow:hidden; transform:rotate(0.17deg); }
.cover-page[data-cover-layout="cover-06-organic-visual-left-text-right"] .cover-visual img { width:415px; height:709px; object-fit:cover; transform:translateY(-85px); }
.cover-page[data-cover-layout="cover-06-organic-visual-left-text-right"] .cover-copy { left:480px; top:162px; width:384px; height:151px; text-align:left; }
.cover-page[data-cover-layout="cover-06-organic-visual-left-text-right"] .cover-title { font-size:75px; line-height:85px; }
.cover-page[data-cover-layout="cover-06-organic-visual-left-text-right"] .cover-subtitle { margin-top:12px; font-size:18px; line-height:28px; font-weight:500; letter-spacing:.5px; }
.cover-page[data-cover-layout="cover-06-organic-visual-left-text-right"] .cover-meta { left:480px; top:443px; width:326px; height:25px; text-align:left; font-size:13px; line-height:25px; letter-spacing:.25px; }
```

```html
<div class="cover-page" data-cw-role="page-root" data-cover-layout="cover-06-organic-visual-left-text-right" data-cover-visual="side-visual">
  <div class="cover-visual cover-local" data-cover-slot="cover-06-organic-visual">
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

```css
.cover-page[data-cover-layout="cover-07-top-title-image-card"] .cover-copy { left:48px; top:30px; width:864px; height:50px; text-align:left; }
.cover-page[data-cover-layout="cover-07-top-title-image-card"] .cover-title { font-size:50px; line-height:50px; }
.cover-page[data-cover-layout="cover-07-top-title-image-card"] .cover-subtitle,
.cover-page[data-cover-layout="cover-07-top-title-image-card"] .cover-eyebrow { display:none; }
.cover-page[data-cover-layout="cover-07-top-title-image-card"] .cover-visual { left:30px; top:107px; width:900px; height:357px; border-radius:40px; overflow:hidden; }
.cover-page[data-cover-layout="cover-07-top-title-image-card"] .cover-meta { left:58px; top:478px; width:672px; height:25px; text-align:left; font-size:18px; line-height:25px; letter-spacing:.25px; }
```

```html
<div class="cover-page" data-cw-role="page-root" data-cover-layout="cover-07-top-title-image-card" data-cover-visual="inline-card">
  <header class="cover-copy" data-cw-role="title-block">
    <h1 class="cover-title">{{title}}</h1>
    <p class="cover-subtitle"></p>
  </header>
  <div class="cover-visual cover-image-card" data-cover-slot="cover-07-image-card">
    <img src="{{coverImageUrl}}" alt="{{coverAlt}}">
  </div>
  <footer class="cover-meta">{{meta}}</footer>
</div>
```

---

## 五、版式选择规则

1. `data-cover-visual="none"` → 优先 `cover-01` 或 `cover-02`。
2. `full-bleed-background` → 只从 `cover-01/02/03/04` 选，按图片主体避让文字区。
3. `side-visual` → 优先 `cover-05` 或 `cover-06`。
4. `inline-card` → 优先 `cover-07`。
5. 图片主体复杂、无安全留白 → 不用整图背景版式，改局部图版式。
6. 标题过长 → 不用超大居中标题，优先左上型/右侧分栏型/上文下图型。

---

## 六、生成检查清单

- [ ] 第 1 页 `page-root` 已写 `data-cover-layout` + `data-cover-visual`。
- [ ] 用的是第四节 7 个固定版式之一，未自由发明第 8 种。
- [ ] `{{title}}` 只含主标题；教材/年级/册次/作者全在 `.cover-meta`。
- [ ] `.cover-copy`/`.cover-meta`/`.cover-visual` 的 `left/top/width/height` 与本文件坐标一致。
- [ ] 所有文字/图片用固定 px 坐标，无百分比/`clamp()`/`flex` 自适应。
- [ ] 有封面图时图片在独立 `.cover-visual` 媒体层，非 `page-root background-image`；素材清单已记 `coverImageSlot`。
- [ ] 封面标题无普通页左竖杠/下划线/编号装饰。
- [ ] 标题、图片、页脚均在 960×540 内不溢出。
