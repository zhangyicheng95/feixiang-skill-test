# 课件 HTML 样式与格式规范

AI **只负责编写每页的教学内容 HTML 片段**，壳功能（缩略图、主区预览、演示模式、键盘翻页、焦点管理等）由云端框架 JS 自动提供，**禁止手写壳代码**。最终交付一个 `.html` 文件，浏览器打开即可使用。

---

## 一、硬性规则

1. **不要读取、修改或手写壳代码**：缩略图渲染、主区预览、演示模式、键盘/鼠标翻页、焦点管理等功能全部由壳框架 JS 提供，AI 不需要了解其实现，也禁止自行实现。
2. **最终只交付一个 `.html` 文件**。
3. **每页内容写在 `<template>` 标签中**，由壳框架 JS 在浏览器中自动读取并渲染。

---

## 二、HTML 文件结构（必须严格遵循）

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
<div id="cw-loading" style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui,sans-serif;font-size:18px;color:#999;">
  加载课件中...
</div>

<!-- ========== 可选：所有页面共享的外部资源 ========== -->
<template class="page-shared">
  <!-- 此处内容会自动注入到每页 iframe 的 <head> 中 -->
  <!-- 例如：Tailwind CSS、Google Fonts、图标库等 -->
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
<script src="https://musk-online.fbcontent.cn/pub-musk-ai-studio/user/upload/admin/Di29JPbhajeiBoKTNU9MWc.js"></script>

</body>
</html>
```

### 关键说明

- `<title>` 标签的内容会显示在课件界面的工具栏中，请设置为课件标题。
- 每页用一个 `<template class="page-data">` 标签包裹：
  - `data-id`：页码序号（从 1 开始，决定页面顺序）。
  - `data-name`：页面名称（显示在缩略图侧边栏）。
- `<template>` 标签按 `data-id` 顺序排列。
- `<template class="page-shared">`（可选）：声明所有页面共享的外部资源，其内容会自动注入到**每页 iframe 的 `<head>` 中**。用于引入 CSS 框架（如 Tailwind CDN）、Google Fonts、图标库等。只需声明一次，所有页面自动生效。详见第三节。
- `<script src="...">` 为壳框架 JS 的云端地址，**直接复制上方模板中的完整地址即可，不要修改此 URL**。此标签必须放在所有 `<template>` 标签之后、`</body>` 之前。
- `<div id="cw-loading">` 为可选占位元素，壳框架加载后会自动移除。
- **不要**在 `<template class="page-data">` 标签内写 `<!DOCTYPE>`、`<html>`、`<head>`、`<body>` 标签。壳框架会自动将内容包装为完整的 HTML 文档用于 iframe 渲染。

### `<template>` 内可以包含

- `<style>` 标签 — 该页的样式（仅作用于该页，不会影响其他页）。可用原生 CSS，也可使用通过 `page-shared` 引入的 CSS 框架工具类。
- HTML 元素 — 该页的可视内容。
- `<script>` 标签 — 该页的互动逻辑（如动画、题目交互等）。
- **注意**：`<script>` 中不可出现字面量 `</template>`（会提前闭合标签）。如确需此字符串，用 `<\/template>` 替代。

> **⚠️ 外部资源的正确引入方式：** 每页在独立 iframe 中渲染，不继承父文档的样式和脚本。要使用 Tailwind 等 CSS 框架，必须通过 `<template class="page-shared">` 声明（见第三节），壳框架会自动注入到每页 `<head>` 中。**不要**在课件 HTML 的 `<head>` 中引入——那样只在父文档生效，各页 iframe 内无效。

---

## 三、共享外部资源（`page-shared`）

每页在独立 iframe 中渲染，是全新的 HTML 文档，**不继承课件 HTML 父文档的样式和脚本**。如果需要所有页面共用外部资源（CSS 框架、字体、JS 库等），须通过 `<template class="page-shared">` 声明，壳框架会自动将其内容注入到每页 `<head>` 中。

### 使用示例

```html
<template class="page-shared">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4/fonts/remixicon.css" rel="stylesheet">
</template>
```

### 规则

- 只需声明**一次**，放在所有 `<template class="page-data">` **之前**。
- 内容可以是 `<script>`、`<link>`、`<style>` 等任何合法的 `<head>` 子元素。
- 声明后，每页 `<template class="page-data">` 内可以直接使用对应的工具类、字体、图标等。
- 如果**不使用**任何外部资源，可以省略此标签，每页用 `<style>` 写原生 CSS 即可。
- **禁止**在课件 HTML 的 `<head>` 中引入外部资源来期望各页继承——这样做无效，资源只会加载在父文档中。

---

## 四、单页内容规范

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

- 标题须**放大**（建议 ≥ 40px），处于**大致居中**位置（避免贴边，允许略偏），不得溢出画布。

### 4.4 通用排版建议

- 标题 `font-size: 28px–36px`，正文 `16px–20px`，要点列表行距 `1.5–1.8`。
- 优先使用 flexbox/grid 做对齐与分区，避免绝对定位导致不同内容量时溢出。
- 配色建议使用教育课件常见方案：白底深文字、左侧色块装饰、圆角卡片等；每页可有轻微差异但整体风格统一。

---

## 五、互动页状态管理（必做）

含动画或题目交互的页面，须支持**状态保存与恢复**。壳框架的翻页规则：

| 翻页方向 | 行为 |
|----------|------|
| **往后翻**（→ 下一页） | 下一页始终以**全新初始态**加载。 |
| **往前翻**（← 上一页） | 如果上一页之前保存过状态，壳框架会自动**恢复到用户离开时的状态**（如已选的答案、已展开的解析、已完成的动画）。 |

### 5.1 页面 → 壳：保存状态（`saveState`）

每当页面内发生有意义的状态变化（用户答题、展开解析、动画完成等），页面应主动将当前状态上报给壳框架。`state` 对象的结构由页面自行定义，须能被 `JSON.stringify` 序列化。

```javascript
window.parent.postMessage({
  type: 'saveState',
  state: { /* 页面自定义的状态数据 */ }
}, '*');
```

### 5.2 壳 → 页面：恢复状态（`restoreState`）

壳框架在往前翻页时，会在页面 iframe 加载完成后发送之前保存的状态。页面须监听此消息并据此恢复 UI。

```javascript
window.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'restoreState') {
    var state = e.data.state;
    // 根据 state 恢复页面 UI...
  }
});
```

### 5.3 完整参考模板（选择题页面）

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

### 5.4 注意事项

- **何时上报**：每次用户交互导致页面"看起来不同了"时都应 `saveState`。多次上报没有副作用，壳只保留最新一次。
- **⚠️ 必须即时上报，不能只在提交时上报**：翻页时壳框架会**立即销毁**当前页面（替换 iframe 内容），页面没有机会在被销毁前保存状态。因此**填空题必须在每次 `input` 事件时就调用 `saveState`**（保存当前输入值），选择题必须在每次选择时就调用，不能等到点击"提交"按钮才保存。否则用户填写了内容但未提交就翻页，翻回来时内容会丢失。
- **state 须可序列化**：不要在 state 中放 DOM 元素、函数等不可序列化的值。用基本类型（字符串、数字、布尔、数组、纯对象）。
- **restoreState 须完整恢复 UI**：包括禁用已点击的按钮、显示反馈文字、跳过入场动画等。恢复后的页面外观应与用户离开时一致。**restore 函数中不要调用带有"防重复执行"守卫的原始交互处理函数**，应直接恢复 UI 或先重置守卫标记再调用。
- **非互动页不需要实现**：纯展示页面（概念讲解、封面、小结等）无需添加这两个协议。
- **动画页**：如有入场动画，`restoreFromState` 中应跳过动画、直接显示动画终态。
- 规划时对含互动/题目的页注明「须支持状态保存与恢复」。

---

## 六、壳框架提供的能力（AI 无需实现）

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

## 七、骨架创建与增量注入（必做）

课件页数多时须分批生成。采用**骨架 + 增量注入**模式：先创建包含注入标记的 HTML 骨架，每批生成后通过 `multi_edit` 将 `<template>` 标签注入到标记位置。

### 正确流程

```
创建骨架（create）→ 生成 HTML 文件，含 <!-- CW_PAGES --> 注入标记 → 记录 resourceId_A
  ↓
批次1 → multi_edit(resourceId_A) 注入第1–3页 → 得到新文件 resourceId_B
  ↓
批次2 → multi_edit(resourceId_B) 注入第4–7页 → 得到新文件 resourceId_C
  ↓
批次3 → multi_edit(resourceId_C) 注入第8–10页 → 得到新文件 resourceId_D
  ↓
验收 → 基于 resourceId_D（最终文件）逐页核对 → 交付
```

> **⚠️ `multi_edit` 每次执行会创建新文件（新 resourceId），原文件不变。每批注入后必须记录新 resourceId，下一批使用最新 resourceId。各批次严格串行，禁止并行注入同一 resourceId。**

### 骨架文件模板

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>课件标题</title>
</head>
<body>

<div id="cw-loading" style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui,sans-serif;font-size:18px;color:#999;">
  加载课件中...
</div>

<template class="page-shared">
  <!-- 按需填入共享资源 -->
</template>

<!-- CW_PAGES -->

<script src="https://musk-online.fbcontent.cn/pub-musk-ai-studio/user/upload/admin/Di29JPbhajeiBoKTNU9MWc.js"></script>

</body>
</html>
```

### 增量注入方法

每批生成后，用 `multi_edit`（**使用最新 resourceId**）将标记替换为「本批 `<template>` 标签 + 标记」：

```
multi_edit:
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

标记始终保留在末尾，供下一批继续注入。**全部注入完成后标记必须保留**——不影响壳框架运行，且为后续新增页面提供注入点。

**注入后更新 resourceId**：`multi_edit` 成功后会创建新文件，**必须记录新文件的 resourceId**，后续所有操作（下一批注入、修改、验收读取）均使用最新 resourceId。

### 注入规则

| 规则 | 说明 |
|------|------|
| **resourceId 链式追踪** | 每次 `multi_edit` 后记录新 resourceId，下一次操作使用最新 resourceId。禁止多批次并行注入同一 resourceId |
| 标记唯一性 | `<!-- CW_PAGES -->` 在整个文件中只出现一次，禁止在页面内容中使用此字面量 |
| 顺序保证 | 每批 `<template>` 的 `data-id` 须接续上一批末尾，保证最终文件中所有页按 data-id 升序排列 |
| 原子性 | `multi_edit` 保证注入失败时不会破坏已有内容；如注入失败，排查 `oldString` 是否精确匹配后重试 |

### 修改个别页时

用 `multi_edit`（**使用最新 resourceId**）匹配需修改页面中**短小、唯一的片段**进行精准替换。如果修改范围较大，可对该页的 `<template>` 整体替换（以 `<template class="page-data" data-id="N"` 到 `</template>` 为匹配范围）。修改后同样会生成新文件，须更新 resourceId。

---

## 八、禁止事项清单

| 禁止 | 原因 |
|------|------|
| 手写壳的 CSS/JS（缩略图、演示模式、键盘翻页、焦点管理等） | 壳框架 JS 已提供全部功能。 |
| 读取或修改壳框架 JS 文件 | AI 不需要了解壳的实现。 |
| 在 `<template>` 内写 `<!DOCTYPE>`/`<html>`/`<head>`/`<body>` | 壳框架会自动包装。 |
| 在课件 HTML 的 `<head>` 中引入 CSS/JS 库期望各页继承 | 各页 iframe 是独立文档，不继承父文档的样式和脚本。须通过 `<template class="page-shared">` 声明共享资源。 |
| 使用了 CSS 框架工具类但未通过 `page-shared` 引入该框架 | 工具类无对应 CSS 定义则全部失效，页面变成裸 HTML。 |
| 使用 `100vh` | 在 iframe 中会取外层视口高度，导致错乱。 |
| 在 `<script>` 中使用 `alert()`、`confirm()`、`prompt()` | 原生弹窗会导致浏览器强制退出全屏，演示模式会被意外中断。答题反馈、提示信息等须用 HTML 元素（如 `<div>` 弹层）实现，禁止使用原生弹窗。 |
| 一次性生成全部页面 | 须分批生成，逐批注入骨架文件。 |
| 跳过骨架直接生成完整 HTML | 必须先创建含 `<!-- CW_PAGES -->` 标记的骨架，再分批注入。 |
| 多批次并行注入同一 resourceId | `multi_edit` 每次生成新文件，并行注入会导致分叉。必须串行：注入→记录新 resourceId→下一批注入。 |

---

## 九、输出物检查清单

生成最终 HTML 前逐项确认：

- [ ] 只有**一个 .html 文件**，无外部依赖（除云端 JS）
- [ ] 所有 `<template>` 在 `<script src="...">` **之前**
- [ ] 每页用 `<template class="page-data" data-id="序号" data-name="页名">` 包裹
- [ ] `<template>` 内**未写** `<!DOCTYPE>`/`<html>`/`<head>`/`<body>`
- [ ] `<template>` 内的 `<script>` 中未出现字面量 `</template>`
- [ ] 每页内容在 960×540 画布内不溢出、无滚动条
- [ ] **未使用** `100vh`，一律用 `100%`
- [ ] 封面标题居中放大
- [ ] 含互动/题目的页已实现 `saveState` 上报和 `restoreState` 监听
- [ ] **未使用** `alert()`/`confirm()`/`prompt()`，反馈信息用 HTML 弹层实现
- [ ] `<template>` 数量与规划的总页数一致
- [ ] 每页 `data-name` 与规划中的页标题对应
- [ ] 整体风格统一、配色协调
- [ ] HTML 文件通过**骨架 + 增量注入**方式生成，所有页面均已注入到 `<!-- CW_PAGES -->` 标记位置
