# 截图分类与处理（v50）

## 目标

老师手动上传截图、整页扫描、半页拼图、答案截图等情况非常常见。v47/v48/v49 实测中常见失败：

- 整页截图被压缩成题内小图，看不清；
- 文字截图被堆到正文开头当"图片墙"；
- 答案/解析截图被丢到附录，正文里没有解析；
- 半页区域被当成单题图，bbox 错位；
- 图片型 PDF 的逐页图被当题内图；
- **v49 新增**：阻塞要图后用户补的全是 A4 整页扫描，Agent 直接当题内图复用 9 次。

v50 在进入重排前必须先对每张图片**显式分类**并写进 `imageLedger`。任何未分类图片都应阻塞，不进入 HTML。

---

## 七分类总表（v50 完整）

| 分类 ID | 类型 | 含义 | 是否可作 question-figure | 是否需要 OCR | 是否需要 bbox | 后续处理 |
|---|---|---|:---:|:---:|:---:|---|
| `full-page-source` | 整页源 | 整页试卷/教案/讲义截图，含多题或卷头 | ❌ | 是（整页 OCR） | 否（用于裁剪源） | 仅放 `.source-pages` 校验附录；用于 bbox 裁剪 |
| `region-source` | 区域源 | 半页/多题区域截图，含 ≥2 题 | ❌ | 是 | 否（用于裁剪源） | 同 `full-page-source` |
| `single-question-figure` | 单题图 | 单题题内图（几何/统计/电路/光路/装置） | ✅ | 否 | 是（如需校验位置） | 紧贴对应题目；满足最小可读宽度（见 figure-cropping.md） |
| `text-screenshot` | 文字截图 | 文字段落（题干/正文/阅读语篇）截图 | ❌ | 是 | 否 | OCR 成可编辑 `<p>`/题干，不再保留 `<img>` |
| `table-screenshot` | 表格截图 | 表格截图 | ❌ | 是（表结构识别） | 否 | 转 `<table>`；识别失败才保留 `<img>` 并标注"需复核" |
| `answer-explanation-screenshot` | 答案解析截图 | 含逐题答案/解析/参考答案区 | ❌ | 是 | 否 | OCR 成 `.answer-area` / `.explanation`，不能只放图 |
| `decorative-photo` | 装饰照片 | 阅读理解氛围插图、人像、风景、AI 配图 | ❌（仅装饰） | 否 | 否 | 仅在阅读理解/英语/语文阅读使用；必须 `figcaption` 标注；不计入原图保真 |
| `unknown` | 未分类 | 工具无法分类 | ❌ | — | — | **阻塞**；不允许进入 HTML |

**注意**：`source-page` 与 `source-region` 是 v48 的简称，对应到 v50 的 `full-page-source` 与 `region-source`。两套命名等价；guard 与 imageLedger 字段使用 `source-page` 与 `source-region` 简称。

---

## 自动分类启发式（v50 新增）

Agent 在 Phase 1.3 二阶段补图判定时，没有 bbox 工具的情况下，必须按以下启发式判定每张图：

### 步骤 1：拉取图像基础属性

| 属性 | 来源 |
|---|---|
| naturalWidth × naturalHeight | 图片资源元数据（HTTP HEAD 或 Pillow `Image.open` 后 `.size`） |
| 长宽比 ratio = min(w,h)/max(w,h) | 计算得出 |
| 文件大小 | HTTP Content-Length |

### 步骤 2：A4 整页 / 半页 判定

| ratio 区间 | 文件特征 | 推断分类 |
|---|---|---|
| 0.62 ≤ ratio ≤ 0.78 | 短边 ≥ 800 px | A4 整页（约 1:1.414） → `source-page` |
| 0.62 ≤ ratio ≤ 0.78 | 短边 400-800 px | A4 整页缩略 → `source-page`（标注 `notes="低分辨率，OCR 不可靠"`） |
| 0.45 ≤ ratio ≤ 0.62 | 短边 ≥ 600 px | A4 半页（含多题） → `source-region` |
| 0.40 ≤ ratio ≤ 0.95 | 短边 200-600 px 且 OCR 出 1 个题号 | 单题区域 → `single-question-figure` 候选 |
| ratio > 0.95（接近正方形） | 任意尺寸 | 单一图形 → `single-question-figure` 候选 |
| ratio < 0.40（细长） | 短边小 | 长条图（数轴/温度曲线） → `single-question-figure` 候选 |

### 步骤 3：内容启发式（基于 OCR 输出）

| OCR 信号 | 推断 |
|---|---|
| OCR 出 ≥3 个题号 | `source-page` 或 `source-region`，**绝不**是 question-figure |
| OCR 出"参考答案"/"答案与解析"/"参考解答" | `answer-explanation-screenshot` |
| OCR 出整段 ≥80 字文本，且无图形 | `text-screenshot` |
| OCR 出表头 + 多行单元格 | `table-screenshot` |
| OCR 极少（<20 字）但视觉有几何线条/坐标轴/电路符号 | `single-question-figure` |
| 既有几何线条又有 OCR 出 ≥3 个题号 | `source-page`（多题区域） |

### 步骤 4：兜底

任何 ratio 在 0.62-0.78、短边 ≥ 600 px 的图，**默认** `source-page`，除非 OCR 明确显示只有 1 个题号且图像主体是几何/统计/电路图。

---

## 强制规则（v50）

1. **整页/半页截图不得压缩成题内小图**：若仅作为 `<img>` 缩在题目右栏，视为分类失败。
2. **v50 强化：source-page src 与 question-figure src 不允许重叠**。同一 URL 同时出现在 `.source-pages img` 和 `.question-figure img`，guard 直接报 `sourcePageIdentity` 失败。
3. **v50 强化：同一 src 被 ≥3 个 question-figure 引用**：guard 报 `fakeCropping-src-reused`，立即阻塞。
4. **v50 强化：A4 比例图（0.62-0.78）+ 限制 max-height < 250px**：guard 报 `fakeCropping-shrink-fullpage`，立即阻塞。
5. **文字截图必须先转写**：OCR 成 `<p>`/题干/选项；如果 OCR 置信度 < 0.85，必须保留原图作为校验，并在 `imageLedger.notes` 中标注"需复核"。
6. **表格截图优先 `<table>`**：表头、单元格内容、跨行跨列必须保留；识别失败再用 `<img>` 兜底。
7. **答案截图必须落入答案区**：`.answer-area` / `.explanation` 必须包含 OCR 文本；只放图视为答案缺失。
8. **单题图必须满足最小可读宽度**：见 `figure-cropping.md`，不可读则阻塞。
9. **未分类图片阻塞**：`type=unknown` 的图片不得进入 HTML。
10. **整页校验图必须放在附录**：不得放在正文开头打乱阅读顺序，不得作为整页正文交付。
11. **同一截图不得作为多个题目的 figure 重复使用**：必须用 `tools/question-figure-cropper` 真正裁出题内 bbox。
12. **decorative-photo 不计入原图保真**：guard 的 `--require-real-images` 不会通过 AI 装饰图。

---

## imageLedger 字段（v50）

```jsonc
{
  "imageId": "img-001",
  "sourcePage": 2,
  "type": "source-page",          // 七分类之一
  "naturalWidth": 1654,
  "naturalHeight": 2339,
  "ratio": 0.707,                  // min/max 长宽比
  "ocrHtml": null,
  "tableHtml": null,
  "imageUrl": "https://.../upload-2.png",
  "bbox": null,
  "finalHtmlTarget": "appendix-source-pages",  // 此 source-page 只去附录
  "validationSnippet": "图中阴影部分由四个半径为4cm的扇形组成",
  "ocrConfidence": 0.94,
  "notes": null
}
```

**关键字段说明**：

- `naturalWidth/Height/ratio`：分类的物理依据，不能省略；
- `finalHtmlTarget`：明确写出该图最终归宿（`appendix-source-pages` / `question-3-figure` / `passage-2-text` / `answer-area-question-7` 等），guard 会校验；
- `validationSnippet`：用来在生成后跑 `--require-text-snippet` 验证转写完整。每张图至少 1 个唯一片段，长度 12-30 字。
- `notes`：低置信度、需要人工复核、识别失败回退等情况必须在这里说明。

---

## Agent 处理流程（v50）

```plain
进入 Phase 1.3 / 或 Phase 1.2 处理截图
  ↓
对每张图片：
  ├── 拉取 naturalWidth/Height (HTTP HEAD 或工具)
  ├── 计算 ratio = min/max
  ├── 调用 convert_to_text 拿 OCR
  ├── 按"步骤 2 + 步骤 3"启发式分类 → type
  ├── 若 type=source-page/source-region:
  │     - 标记 finalHtmlTarget="appendix-source-pages"
  │     - 不进入 .question-figure
  │     - 若需要拆题内图，必须再用 bbox 工具或要求用户按题号补图
  ├── 若 type=text-screenshot/table-screenshot/answer-explanation-screenshot:
  │     - 跑 OCR/表格识别
  │     - 填 ocrHtml / tableHtml
  │     - finalHtmlTarget="passage-X" / "table-X" / "answer-area-X"
  ├── 若 type=single-question-figure:
  │     - 走 figure-cropping 流程 (满足最小宽度)
  │     - finalHtmlTarget="question-X-figure"
  ├── 若 type=decorative-photo:
  │     - 标注 figcaption "AI 辅助插图"
  │     - 限制场景为语文/英语阅读
  │     - 不计入 expectedImages
  └── 若 type=unknown:
        阻塞，不进入 HTML
  ↓
聚合 imageLedger 草稿，校验：
  ├── 每张图都已分类
  ├── text/table/answer 都有 OCR 结果或 notes
  ├── question-figure 都有真实 URL 与 bbox（或单题图清晰）
  ├── 没有 source-page 与 question-figure 共用 src
  ├── 没有 src 被 ≥3 个 question-figure 引用
  ├── 答案/解析片段已落入 answers[]
  └── 总图片数 = 源文档已知图片数 ± 0
  ↓
判定下一步：
  ├── 全部 source-page/source-region → 走 Phase 3.fullpage 或继续阻塞
  ├── 含真实 question-figure 但仍缺题号图 → 阻塞，列出缺图题号
  ├── 含 unknown → 阻塞
  └── 全部就绪 → 进入 Phase 2/3
```

---

## 阻塞文案（v50）

### 通用阻塞文案

```plain
当前不生成 HTML：截图分类未完成。
- 共 N 张图片，其中 M 张被分类为 unknown。
- 未完成 OCR 转写：x、y、z（编号）。
- 未完成 bbox 裁剪：a、b（编号）。
请先补齐分类、OCR 与裁剪，再回到 magazine-layout 流程。
```

### 二阶段补图：全是整页扫描时

```plain
当前不生成精美 A4 重排：补充的 N 张图均为原卷整页扫描（A4 比例 1:1.41，短边 ≥ 800 px）。

按 magazine-layout v50 截图分类：
- 类型：source-page / source-region
- 不可作 question-figure：原卷整页若被 max-height 缩成 80-200px，会导致打印模糊（v49 真实失败模式）

已识别图形依赖题号：第 2、3、7 题（对称轴 / 进度条 / 统计图）
其中真实题图覆盖率：0%（无任一单题清晰图）

您可以选择：
① 按题号截题图（一题一图，建议短边 ≥ 600px）后重新上传
② 回复"我只要原卷整页打印版"，会出 Phase 3.fullpage HTML（非设计师级重排，仅适合临时打印）
③ 回复"我只要文字版（不含原图形条件）"，会出明确标注的 text-only 降级版
```

---

## 自检

- [ ] 所有图片在 `imageLedger` 中都有 `type`。
- [ ] 没有 `type=unknown` 的图片。
- [ ] 所有 `text-screenshot/table-screenshot/answer-explanation-screenshot` 都有 OCR/转写结果。
- [ ] 所有 `single-question-figure` 都有 `bbox` 和真实 URL。
- [ ] 整页/半页截图只出现在附录，没有冒充题内图。
- [ ] 没有 source-page src 与 question-figure src 共用。
- [ ] 没有 src 被 ≥3 个 question-figure 引用。
- [ ] 没有 A4 比例图被 max-height < 250px 缩小。
- [ ] `validationSnippet` 都来自工具 OCR，不来自用户 prompt。
- [ ] `finalHtmlTarget` 字段都明确写出每张图的归宿。
