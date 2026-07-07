# 课件 HTML 生成指南

AI 只编写页面内容片段；缩略图、播放、翻页、键盘控制、iframe 渲染等由云端壳脚本提供。禁止手写课件壳。

## 标准骨架

`create_file` 只能创建短骨架。页面内容后续通过 `edit_file` 注入 `<!-- CW_PAGES -->`。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>课件标题</title>
</head>
<body>
<div id="cw-loading" style="display:flex;align-items:center;justify-content:center;height:100%;font-family:system-ui,sans-serif;font-size:18px;color:#999;">加载课件中...</div>

<template class="page-shared">
  <style>
    :root {
      --cw-courseware-title-font: system-ui, sans-serif;
      --cw-courseware-body-font: system-ui, sans-serif;
      --cw-courseware-label-font: system-ui, sans-serif;
    }
  </style>
</template>

<!-- CW_PAGES -->

<script src="https://musk-test.fbcontent.cn/pub-musk-ai-studio/user/upload/admin/HgSiredEejFXx94ofdiCZ8.js"></script>
</body>
</html>
```

硬规则：

- 父文档不能有 `<div id="cw-root">`、自写翻页脚本、iframe/srcdoc 或普通网页容器。
- 固定壳脚本只能出现 1 次，放在所有 `page-data` 后面。
- `page-shared` 只能出现 1 次。
- `page-shared` 中默认只放字体、共享 CSS 和确有必要的共享资源；不要随意引入无关外部 JS。
- 禁止把页面内容一次性写进父文档普通 DOM，所有页面都必须是 `page-data`。

## 页面结构

每页一个模板：

```html
<template class="page-data" data-id="1" data-name="封面">
  <style>
    .cover-page { min-height: 100%; width: 100%; padding: 32px 40px; box-sizing: border-box; }
  </style>
  <div class="cover-page" data-cw-role="page-root">
    <header data-cw-role="title-block">
      <h1>标题</h1>
    </header>
    <main data-cw-role="content-block">
      内容
    </main>
  </div>
</template>
```

必须遵守：

- `data-id` 从 1 连续到 `lockedPageCount`。
- 每页必须且只能有 1 个 `data-cw-role="page-root"`。
- `page-root` 必须能填满 960x540 画布：至少有 `min-height:100%`、`width:100%`、合理 padding 或布局。
- 每页必须有主 `title-block` 和主 `content-block`，封面可按封面版式调整。
- 同一个元素不能写重复属性，例如不能同时出现两个 `data-cw-role`。
- 不要使用 `100vh`；使用 `100%`。
- 不要在 `html`、`body` 或根容器上写 `overflow:hidden` 来裁切内容。

## 样式隔离规则

每个 `page-data` 会被壳脚本渲染到独立 iframe 中，页面之间不会互相继承 `<style>`。

这条是硬规则：

- 如果第 6 页定义了 `.qa-page`，第 7 页不会继承它。
- 多页共用的 `.qa-page`、`.lang-page`、`.card` 等样式，必须放在 `page-shared`。
- 若样式只放在单页 `<template>` 内，则同类页面每一页都要自带对应 `<style>`。
- 发布前要检查所有页面：不能出现“某页使用 class，但该 class 只在其他页模板里定义”的情况。

推荐做法：

- 通用字体、标题横杠、基础卡片、通用页面类放 `page-shared`。
- 只属于某一页的细节样式放该页 `<style>`。
- 批量页面如“精读品悟 1-4”要么每页复制必要 `<style>`，要么把 `.qa-page` 共用样式放 `page-shared`。

## 语义钩子

模板后处理依赖这些钩子保护结构：

| 钩子 | 使用场景 |
| --- | --- |
| `page-root` | 每页最外层可视容器，必需 |
| `title-block` | 标题区，必需 |
| `content-block` | 主内容区，必需 |
| `component-shell` | 卡片、题框、信息框 |
| `media-block` | 图片、图表、音频 |
| `button-skin` | 按钮、选项、可点击块 |
| `interactive-root` | 拖拽、选择、闯关等互动主体 |
| `feedback-layer` | 反馈、提示、解析 |

模板阶段会保护 `component-shell`、`media-block`、`button-skin`、`interactive-root`、`feedback-layer` 内部。组件框内文字颜色、组件样式和事件绑定必须保持原样。

## 封面页

生成第 1 页前读取 `cover-layout-guide.md`，从 7 种封面版式中选 1 种。

封面要求：

- `page-root` 写入 `data-cover-layout` 和 `data-cover-visual`。
- 如果有封面图，图片放进独立 `media-block`，并写 `data-cover-role="cover-visual"`、`data-cover-slot="<slotId>"`。
- 封面图不能写成 `page-root` 的内联 `background-image`。
- 如果图片比例与槽位不匹配，优先 `object-fit: contain` 保护主体，或重新按槽位比例生图；不要用 `cover` 大面积裁切主体。

## 互动页

互动页可以使用简单内联事件或本页 `<script>`。必须保证：

- 事件目标在本页模板内。
- 函数名、选择器、按钮节点在模板后处理时不会被改名或替换。
- 拖拽、排序、选择等复杂互动放在 `interactive-root` 内。
- 装饰层如果覆盖在互动区上方，必须 `pointer-events:none`。

## 生成步骤

1. 核对 `lockedPageCount` 与已确认逐页大纲行数一致。
2. 创建标准骨架。
3. 建立 `Page Implementation Ledger`：列出 1..N 页码，初始 `TODO`。
4. 按连续页码分批注入页面。每批最多 3-6 页；强互动页可单独一批。
5. 每批成功后记录新 `resourceId`，后续只能基于最新 `resourceId`。
6. 若 `edit_file` 失败，使用最近一次成功的 `resourceId` 重试当前批，禁止跳到下一批。
7. 全部页面完成后 `read_file` 做发布前校验。

## 发布前校验

发布原版前必须读取最新 HTML，逐项确认：

- `<template class="page-shared"` = 1。
- `<template class="page-data"` = `lockedPageCount`。
- `data-id` 连续，无重复、无缺页。
- 固定壳脚本 URL = 1。
- `&lt;template class=&quot;page-data&quot;` = 0。
- `<div id="cw-root"` / `#cw-root` / `iframe srcdoc` = 0。
- 每个页面都有 `page-root`、`title-block`、`content-block`。
- 多页复用 class 的样式在 `page-shared` 中，或每页自带 `<style>`。

任一项失败，禁止 `publish_resource`，必须继续修复。
