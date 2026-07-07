# 题内图裁剪与最小可读宽度（v48）

## 目标

v47 实测中频繁出现“整页截图被压缩成题内小图，看不清”的情况。问题根源是：

- 没有真正用 bbox 把题内图从原页图里裁出来，而是把整页图整张放进 `<figure class="question-figure">` 后用 CSS 缩到 42mm。
- 没有限制最小打印宽度，导致几何图、电路图、统计图里的字、刻度、标签全部模糊。
- 题内图与原页图共用一个 URL，导致打印 PDF 中 `<img>` 数量虚高、实际图形不可读。

v48 强制：题内图必须**先裁剪、后嵌入**；嵌入时必须满足最小打印宽度。

## 必备输入

进入裁剪流程的题内图必须同时具备：

| 字段 | 含义 | 缺失语义 |
|---|---|---|
| `pageImage.url` | 来源页图（高分辨率 PNG） | 无图，阻塞 |
| `pageImage.width / height / dpi` | 页图实际像素与分辨率 | 没有，阻塞 |
| `bbox.{x,y,width,height,unit}` | 题内图在该页的位置 | 没有，阻塞 |
| `questionId` | 关联题号 | 没有，标记孤立图 |

`bbox.unit` 必须是 `px`（基于该 pageImage 像素）或 `pdf-pt`（PDF 1/72 inch）。其它单位必须由 Layer 1 转换为这两种之一。

## 裁剪规则

1. **真实裁剪不缩放**：必须把 bbox 区域裁出独立 PNG/JPEG，不要在 `<img>` 上靠 CSS 缩。
2. **保留原始像素**：裁剪后 PNG 的 `naturalWidth/naturalHeight` 必须等于 bbox 像素值；不要降采样。
3. **白底裁剪**：图像周围如有阴影，必须先做 5px padding，再裁；目的是避免边缘黑线。
4. **写回素材包**：裁剪后图片以 `figure.url` 写回 `figures[]`，并标注 `kind: "original_crop"`。
5. **同一题的多个图片**：每张独立裁剪，分别绑定到题目下不同 `<figure>`。

## 最小可读宽度

题内图打印时不可读 = 整张交付不可用。最小可读宽度（mm）按内容复杂度分档：

| 图片内容 | 最小打印宽度 | 备注 |
|---|---:|---|
| 简单几何图（仅基本图形 + 1-2 个标签） | 35 mm | 默认值；正文双栏可接受 |
| 含刻度/坐标轴的几何图、统计图、坐标系 | 60 mm | 必须能看清刻度数字 |
| 电路图、光路图 | 60 mm | 元件、节点必须清晰 |
| 实验装置图（多设备） | 80 mm | 含细节、文字标注 |
| 表格图（识别失败兜底） | 等于题目栏宽 | 优先转 `<table>`，本档为兜底 |
| 含密集文字的统计图（柱状图、折线图、饼图带数据标签） | 80 mm | 数据标签必须可读 |
| 长条形图（如温度曲线、数轴） | 100 mm，单栏 | 必要时占整行 |

## 自动化判断

在 `tools/question-figure-cropper` 中按以下顺序：

1. 计算裁剪后的图像 `naturalWidth`。
2. 计算最小可读宽度 `minPrintWidthMm` × （150 dpi / 25.4 mm/inch） ≈ 5.9 px/mm。
3. 若 `naturalWidth / 5.9 < minPrintWidthMm`，则标记 `tooSmall=true`。
4. `tooSmall=true` 的图片**禁止**进入 HTML，必须返回阻塞或要求重新提供更高分辨率页图。

## HTML 中的实现要求

```html
<li class="question question-with-figure">
  <div class="question-main">
    <div class="question-body">12. 如图所示……</div>
    <div class="answer-area"></div>
  </div>
  <figure class="question-figure" data-min-print-width-mm="60">
    <img src="https://.../fig-012-crop.png"
         alt="第 12 题 几何图"
         width="600" height="420"
         loading="lazy" />
    <figcaption>第 12 题图</figcaption>
  </figure>
</li>
```

CSS 必须按 `data-min-print-width-mm` 设定下限：

```css
.question-figure[data-min-print-width-mm="35"] { min-width: 35mm; }
.question-figure[data-min-print-width-mm="60"] { min-width: 60mm; }
.question-figure[data-min-print-width-mm="80"] { min-width: 80mm; }
.question-figure[data-min-print-width-mm="100"] {
  min-width: 100mm;
  display: block;
  grid-column: 1 / -1;
}

@media print {
  .question-figure img {
    image-rendering: -webkit-optimize-contrast;
  }
}
```

## 与 source-page 的关系（v50 强化）

整页截图 (`source-page`) 与题内图 (`question-figure`) 必须**身份完全隔离**：

| 维度 | source-page | question-figure |
|---|---|---|
| 用途 | 校验附录、裁剪源 | 紧贴对应题目的视觉条件 |
| 自然尺寸 | 长宽比 0.62-0.78（A4 比例），短边 ≥ 800 px | 长宽比不限，短边 200-900 px |
| 位置 | `<section class="source-pages">` 内（**文末附录**） | `<figure class="question-figure">` 内（题目正文） |
| URL 来源 | 用户原始上传 / pageImage manifest | 必须**裁剪后的新 URL**，不与 source-page 重叠 |
| max-width 限制 | `width: 100%` 全页打印 | 按 figure-cropping 最小可读宽度 |
| max-height 限制 | 不限 | 不允许 < 250px（约 56mm @300dpi）让 A4 比例图被缩成米粒大小 |
| 复用次数 | 单张原页用一次（一份附录） | 任一 src 不允许被 ≥3 个 question-figure 引用 |

### 三条硬性禁令

1. **禁令 A（identity）**：任一题的 `<figure class="question-figure">` 中 `<img src>` 不得与 `<section class="source-pages">` 中 `<img src>` 完全相同。
2. **禁令 B（no-fake-crop）**：任一 `<img src>` 在 `<figure class="question-figure">` 中出现 ≥3 次视为伪裁剪集中爆发——v49 真实失败模式（4 张原卷扫描 → 9 个题循环复用）。
3. **禁令 C（no-shrink）**：长宽比 0.62-0.78（A4 比例）+ 短边 ≥ 800 px 的图，不允许在 HTML 中以 `style="max-height: <250px"` 或类似方式缩小到题图大小。

### Guard 实现

`tools/magazine-layout-guard` 的 `sourcePageIdentity` / `fakeCropping` 两项检查覆盖以上三条。无 guard 环境下 Agent 必须按"手工自检 13 条" #4 #5 #6 自查。

## 阻塞与降级语义

| 现象 | 处理 |
|---|---|
| `bbox` 缺失 | 阻塞，不能用整页图替代 |
| `tooSmall=true` | 阻塞，要求重提高分辨率页图或重新裁剪 |
| 裁剪图与原页图同 URL | 阻塞，未真正裁剪 |
| 用户明确说“题内图先用整页图代替” | 仍需要写明非保真，且 `kind="original_full_page"`；不能默认使用 |

## 自检

- [ ] 每张题内图都有真实 bbox 与裁剪后 URL。
- [ ] 裁剪后 PNG `naturalWidth × naturalHeight` 等于 bbox 像素。
- [ ] 没有 `figure.url == pageImage.url` 的情况。
- [ ] 没有 `tooSmall=true` 的图片进入 HTML。
- [ ] 含刻度/电路/装置等关键内容的图都达到对应最小宽度。
