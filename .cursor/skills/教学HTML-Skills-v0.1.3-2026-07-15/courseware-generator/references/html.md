# HTML 结构与生成规范

> 路径：`courseware-generator/references/html.md`  
> Step 2 必读。视觉（字体/封面/配色）见 `references/typography.md`、`references/cover.md`；练习见 `references/quiz.md`。

---

## 一、硬性规则

1. **禁止手写或输出壳代码**（缩略图、翻页、演示模式等由 create_file 注入的官方 `courseware-shell.js` 提供）。
2. **交付物**：单个 `<slug>.html`。
3. **每页一个** `<template class="page-data" data-id="N" data-name="页名">`。
4. **禁止**在 `<template>` 内写 `<!DOCTYPE>`/`<html>`/`<head>`/`<body>`。
5. **禁止** `alert()`/`confirm()`/`prompt()`；禁止 `100vh`；禁止 `html/body` 设 `overflow:hidden`。
6. **禁止**用方向键/空格做交互（壳会拦截用于翻页）。

---

## 二、文件结构（必须遵循）

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>课件标题</title>
  <script type="application/json" id="artifact-spec">{"mode":"courseware","slug":"...","requirements":[],"require":[],"forbid":[],"coreLoop":"...","assets":[],"outline":[]}</script>
</head>
<body>

<div id="cw-loading">加载课件中...</div>

<template class="page-shared">
  <!-- 共享 CSS：字体变量、--canvas-bg、通用组件类 -->
</template>

<template class="page-data" data-id="1" data-name="封面">…</template>
<template class="page-data" data-id="2" data-name="…">…</template>

<!-- COURSEWARE_SHELL_INJECTED_BY_CREATE_FILE -->
</body>
</html>
```

要点：

- `page-shared` 内容注入**每页 iframe 的 head**；外部 CSS/字体必须写在这里，不要写在 HTML `<head>`。
- 壳注入占位符放在**所有 template 之后**、`</body>` 之前；不要读取或输出 `assets/courseware-shell.js` 源码。
- `<template>` 内 `<script>` 不可出现字面量 `</template>`（用 `<\/template>`）。

---

## 三、画布与布局

- 固定画布 **960×540**；根容器 `min-height:100%`（封面页例外，见 `references/cover.md`）。
- `page-shared` 声明 `--canvas-bg`：

```css
:root {
  --stage-base: #eef1f5;
  --canvas-bg: color-mix(in srgb, var(--bg, #fff) 50%, var(--stage-base) 50%);
}
html, body, .page-container { background: var(--canvas-bg); }
```

- 推荐内边距：上下 30px、左右 40px。
- 内容须落在 960×540 内；过多则拆页或精简，不靠滚动堆内容。

### 配色与圆角（每份课件自选一套，全课件统一）

| 维度 | 规则 |
|------|------|
| 配色 | 自选 1 套教育课件配色（主色 + 辅色 + 纸面色），写入 `page-shared` 的 `:root` 变量 |
| 圆角 | 全课件统一一个值（如 12–16px），卡片/按钮一致；禁止直角与圆角混用 |
| 描边 | 用 `border` 定义边界，避免纯阴影堆叠；不加 emoji |

字体与封面版式分别见 `references/typography.md`、`references/cover.md`。

---

## 四、生成流程

```
1. Read references/typography.md → 选字体 preset，写入 page-shared
2. Read references/cover.md → 第 1 页选封面版式
3. Read 当前任务的 artifact-spec.outline + assets
4. Write 完整 `<slug>.html`（所有 page-data 一次到位）
5. 在 `</body>` 前放置 `<!-- COURSEWARE_SHELL_INJECTED_BY_CREATE_FILE -->`，由 create_file 注入官方壳
6. 对照 artifact-spec.outline 逐页验收
```

**页数较多时**：可先写入骨架（`page-shared` + 前几页），再追加剩余 `<template>`；不要依赖外部平台的增量注入机制。

### 复杂度参考（规划用）

| 权重 | 页型 |
|------|------|
| 1 | 封面、目录、小结 |
| 2 | 纯展示讲解/分析 |
| 4 | 选择/填空/点击展开（须 saveState） |
| 6 | 拖拽/复杂动画 |

---

## 五、互动状态（必做）

含答题或展开交互的页须实现 `saveState` / `restoreState`：

```javascript
// 状态变化时
window.parent.postMessage({ type: 'saveState', state: myState }, '*');

// 恢复
window.addEventListener('message', function (e) {
  if (e.data && e.data.type === 'restoreState') restoreUI(e.data.state);
});
```

- 选择题：**每次选择**即 saveState，不能等「提交」才保存。
- 纯展示页无需实现。

练习页成绩另见 `references/quiz.md` 的 `cwScore`。

---

## 六、页型最低标准

| 页类型 | 最低要求 |
|--------|---------|
| 封面 | 标题 + 副标题/学科年级 |
| 目录 | 各节标题 |
| 讲解 | 核心内容 + 要点 ≥2 或例证 ≥1 |
| 例题 | 题干 + 完整解答 |
| 练习 | 题干 + 答案/选项 + 解析 |
| 小结 | 要点 ≥2 条 |

---

## 七、内容量上限（防溢出）

| 参数 | 值 |
|------|-----|
| 画布 | 960×540 |
| 可用区 | 880×480（含 padding） |
| 讲解页正文 | ≤ 350 字 |
| 例题总文字 | ≤ 400 字 |
| 选择题题干 | ≤ 80 字；选项 ≤ 4 个 |
| 目录条目 | ≤ 8 条 |
| 含展开交互 | 初始 ≤70% 高度，展开增量 ≤30% |

---

## 八、交付自检

```
□ template 数量 = artifact-spec.outline 页数；data-id 从 1 连续递增
□ page-shared 含 --canvas-bg + 字体变量 + CW_TYPOGRAPHY_DECISION
□ 第 1 页封面按 references/cover.md 固定版式
□ HTML 含 `<!-- COURSEWARE_SHELL_INJECTED_BY_CREATE_FILE -->`，且未输出 courseware-shell.js 源码
□ create_file 回读结果已注入官方壳，保留 window.__CW_SHELL_MAIN__ 与自执行调用
□ 互动页 saveState/restoreState；练习页 cwScore
□ 对照 outline 无漏页、无空壳页
```

---

## 九、壳自动提供（勿实现）

缩略图、主区预览、演示模式、键盘/滚轮翻页、焦点管理、状态恢复协议、960×540 注入、下载与 SCORM 打包。

create_file 注入后的官方壳必须保留尺寸和同步机制：主 iframe 基准为 960×540；首屏、切页、resize 和 fullscreenchange 后继续走 `_fitMain`；缩略图保持 `.cw-thumb > .cw-thumb-inner > iframe`，外层固定宽高并裁切，inner 为 960×540 且在 inner 层使用 `THUMB_SCALE` 缩放。主舞台、页码、标题、缩略图 active 状态、next/prev 和键盘翻页必须同步。不要在内容页覆盖这些壳结构。
