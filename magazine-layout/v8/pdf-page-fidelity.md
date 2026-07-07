# PDF 原页保真层

## 目标

上传 PDF、扫描卷、截图卷时，必须先保证“原卷看得见”。文字重排是增强层，不是替代层。

## 失败条件

以下任一情况直接判定失败，不能交付：

- HTML 中没有真实 `<img>`、`<object>`、`<embed>` 或 `<iframe>`，却声称保留了原图。
- 使用“[此处保留原卷图形]”“图略”“占位”“原图见附件”等文字冒充原图。
- 只保留 OCR 文本，丢失几何图、统计图、表格、选项图。
- 无法完整提取题目时，只交付前几题或摘要。

## 保真层优先级

按可用能力选择，优先级从高到低：

1. 后端将 PDF 每页转为 PNG/JPEG，HTML 用 `<img>` 嵌入每页。
2. 如果已有页面截图或上传图片资源，HTML 用 `<img>` 直接嵌入。
3. 如果不能转图，但有原 PDF URL，HTML 用 `<object>` 或 `<iframe>` 嵌入 PDF。
4. 如果以上都做不到，必须告知“当前无法完整保留原卷图形”，不能生成伪保真结果。

## 推荐 HTML：PDF 嵌入兜底

当只有 PDF URL，没有逐页图片时，至少输出原 PDF 兜底层：

```html
<section class="source-pdf-section keep-together">
  <h2>原卷保真层</h2>
  <p class="source-note">以下为原始 PDF，确保图形、表格、题量不丢失；下方文字重排仅作为辅助阅读。</p>
  <object class="source-pdf" data="原PDF资源URL" type="application/pdf">
    <iframe class="source-pdf" src="原PDF资源URL" title="原始试卷 PDF"></iframe>
  </object>
</section>
```

## 推荐 HTML：逐页图片保真

如果后端已将 PDF 转成每页图片：

```html
<section class="source-pages">
  <h2>原卷保真层</h2>
  <figure class="source-page keep-together">
    <img src="page-1.png" alt="原卷第 1 页" />
    <figcaption>原卷第 1 页</figcaption>
  </figure>
  <figure class="source-page keep-together">
    <img src="page-2.png" alt="原卷第 2 页" />
    <figcaption>原卷第 2 页</figcaption>
  </figure>
</section>
```

## 推荐后端转图命令

`OCRmyPDF` 只增加 OCR 文本层，不负责转 HTML 图片。需要另加 PDF 转图工具。

可选方案：

```bash
pdftoppm -png -r 160 input.pdf page
```

```bash
pdftocairo -png -r 160 input.pdf page
```

```bash
gs -dSAFER -dBATCH -dNOPAUSE -sDEVICE=png16m -r160 -sOutputFile=page-%03d.png input.pdf
```

这些命令产出的 `page-1.png`、`page-2.png` 等图片再上传为资源，供 Agent 嵌入 HTML。

## Agent 执行规则

- 如果上传资源是 PDF，且工具上下文里能拿到 PDF URL，必须至少用 `<object>`/`<iframe>` 嵌入原 PDF。
- 如果工具上下文里只有 resourceId，没有 URL，必须通过可用工具读取/引用资源；无法拿到 URL 时，不得写占位文字冒充保留。
- OCR 文本只能用于“重排辅助层”，不能替代原页保真层。
- 重排层题量无法确认时，仍可交付原页保真层，但必须说明重排层不完整，不能声称完整复现。

## 自检

- [ ] HTML 中至少出现一个真实原卷资源标签：`<img>`、`<object>`、`<embed>` 或 `<iframe>`。
- [ ] 没有“此处保留”“图略”“占位”等伪保真文字。
- [ ] 原 PDF 或原页图片先出现，再出现文字重排增强层。
- [ ] 原页保真层与文字重排层职责分明。
