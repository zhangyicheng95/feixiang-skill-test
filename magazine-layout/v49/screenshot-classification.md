# 截图分类与处理（v48）

## 目标

老师手动上传截图、整页扫描、半页拼图、答案截图等情况非常常见。v47 把它们一律按“图片块”处理，结果常出现：

- 整页截图被压缩成题内小图，看不清；
- 文字截图被堆到正文开头当“图片墙”；
- 答案/解析截图被丢到附录，正文里没有解析；
- 半页区域被当成单题图，bbox 错位；
- 图片型 PDF 的逐页图被当题内图。

v48 在进入重排前必须先对每张图片**显式分类**并写进 `imageLedger`。任何未分类图片都应阻塞，不进入 HTML。

## 七类图片分类

| 类型 | 含义 | 后续处理 |
|---|---|---|
| `source-page` | 整页试卷/教案/讲义截图，包含多题 | 不直接当题内图；必须 OCR + bbox 拆出题号级结构与题内图，原页只放 `.source-pages` 校验附录或裁剪来源 |
| `source-region` | 半页/多题区域截图 | 与 `source-page` 同等处理；只有当区域 = 1 题时才能做单题 figure |
| `question-figure` | 单题题内图（几何图、统计图、电路图、光路图、实验装置图） | 紧贴对应题目；必须满足最小可读宽度（见 `figure-cropping.md`） |
| `text` | 文字段落截图（题干/正文/阅读语篇） | 必须 OCR 成可编辑 `<p>`/题干，不再保留为 `<img>`；台账中 `validationSnippet` 取该截图的关键句 |
| `table` | 表格截图 | 必须转成 `<table>`；只有识别失败才保留 `<img>` 并标注“需复核” |
| `answer` | 答案/解析截图（含逐题答案、解析、参考答案区） | 必须 OCR 成 `.answer-area` / `.explanation` 文本；不能只放图也不能只保留选项字母 |
| `photo` | 装饰照片、人像、风景、AI 配图 | 仅在阅读理解、英语阅读、语文阅读等氛围场景使用；不计入原图保真，必须 `figcaption` 标注 |
| `unknown` | 工具无法分类 | **阻塞**；不允许把未分类图片直接写入 HTML |

## 强制规则

1. **整页/半页截图不得压缩成题内小图**：若仅作为 `<img>` 缩在题目右栏，视为分类失败。
2. **文字截图必须先转写**：OCR 成 `<p>`/题干/选项；如果 OCR 置信度 < 0.85，必须保留原图作为校验，并在 `imageLedger.notes` 中标注“需复核”。
3. **表格截图优先 `<table>`**：表头、单元格内容、跨行跨列必须保留；识别失败再用 `<img>` 兜底。
4. **答案截图必须落入答案区**：`.answer-area` / `.explanation` 必须包含 OCR 文本；只放图视为答案缺失。
5. **单题图必须满足最小可读宽度**：见 `figure-cropping.md`，不可读则阻塞。
6. **未分类图片阻塞**：`type=unknown` 的图片不得进入 HTML。
7. **整页校验图必须放在附录**：不得放在正文开头打乱阅读顺序，不得作为整页正文交付。
8. **同一截图不得重复使用**：例如把整页 `source-page` 同时作为附录和题内 figure，必须用 `tools/question-figure-cropper` 真正裁出题内 bbox。

## imageLedger 字段（v48）

```jsonc
{
  "imageId": "img-001",
  "sourcePage": 2,
  "type": "text",
  "ocrHtml": "<p>第 2 题阅读语篇正文……</p>",
  "tableHtml": null,
  "imageUrl": "https://.../upload-2.png",
  "bbox": null,
  "finalHtmlTarget": "passage-section-2",
  "validationSnippet": "因为雪豹是高山生态系统的关键物种",
  "ocrConfidence": 0.94,
  "notes": null
}
```

- `validationSnippet`：用来在生成后跑 `--require-text-snippet` 验证转写完整。每张图片至少 1 个唯一片段，长度 12-30 字。
- `notes`：低置信度、需要人工复核、识别失败回退等情况必须在这里说明。

## Agent 处理流程

```plain
进入 Layer 1
  ↓
对每张图片：
  ├── 图像分辨率检查（短边 < 600px → notes="低分辨率，OCR 不可靠"）
  ├── 模型/规则分类 → type
  ├── 若 type=text/table/answer → 跑 OCR/表格识别 → 填 ocrHtml/tableHtml
  ├── 若 type=question-figure → 走 figure-cropping 流程
  ├── 若 type=source-page/source-region → 标记为校验附录候选；
  │     若需要拆题内图，必须再用 bbox 裁出 question-figure
  ├── 若 type=photo → 标注 figcaption，限制使用场景
  └── 若 type=unknown → 阻塞，不进入 HTML
  ↓
聚合 imageLedger，校验：
  ├── 每张图片都已分类
  ├── text/table/answer 都有 OCR 结果或 notes
  ├── question-figure 都有真实 URL 与 bbox
  ├── 总图片数 = 源文档已知图片数 ± 0
  └── 答案/解析片段已落入 answers[]
  ↓
进入 Layer 2
```

## 阻塞文案

```plain
当前不生成 HTML：截图分类未完成。
- 共 N 张图片，其中 M 张被分类为 unknown。
- 未完成 OCR 转写：x、y、z（编号）。
- 未完成 bbox 裁剪：a、b（编号）。
请先补齐分类、OCR 与裁剪，再回到 magazine-layout 流程。
```

## 自检

- [ ] 所有图片在 `imageLedger` 中都有 `type`。
- [ ] 没有 `type=unknown` 的图片。
- [ ] 所有 `text/table/answer` 截图都有 OCR/转写结果。
- [ ] 所有 `question-figure` 都有 `bbox` 和真实 URL。
- [ ] 整页/半页截图只出现在附录，没有冒充题内图。
- [ ] `validationSnippet` 都来自工具 OCR，不来自用户 prompt。
