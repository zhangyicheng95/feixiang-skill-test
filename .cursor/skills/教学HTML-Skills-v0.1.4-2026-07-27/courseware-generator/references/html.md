# HTML 结构与生成规范

> 路径：`courseware-generator/references/html.md`  
> Step 2 必读。视觉（字体/封面/配色）见 `references/typography.md`、`references/cover.md`；练习见 `references/quiz.md`。

AI **只负责编写每页的教学内容 HTML 片段**；缩略图、主区预览、演示模式、键盘翻页、焦点管理等由 create_file 注入的官方 `courseware-shell.js` 提供，**禁止手写或输出壳代码**。最终交付一个 `<slug>.html`，浏览器打开即可使用。

---

## 一、硬性规则

1. **禁止手写或输出壳代码**（缩略图、翻页、演示模式等由 create_file 注入的官方 `courseware-shell.js` 提供）。
2. **交付物**：单个 `<slug>.html`。
3. **每页一个** `<template class="page-data" data-id="N" data-name="页名">`。
4. **禁止**在 `<template>` 内写 `<!DOCTYPE>`/`<html>`/`<head>`/`<body>`。
5. **禁止** `alert()`/`confirm()`/`prompt()`；禁止 `100vh`；禁止 `html/body` 或根容器设 `overflow:hidden`。
6. **禁止**用方向键/空格做交互（壳会拦截用于翻页）。
7. **禁止**在课件 HTML 的 `<head>` 中引入 CSS/JS 库并期望各页 iframe 继承——须通过 `<template class="page-shared">` 声明共享资源。
8. **严禁**用 base64 编码替代 Phase 3 / Step 1 已获取的真实素材 URL。

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
  <!-- 共享 CSS：字体变量、--canvas-bg、通用组件类；外部 CSS/字体/图标库也写在这里 -->
</template>

<template class="page-data" data-id="1" data-name="封面">…</template>
<template class="page-data" data-id="2" data-name="…">…</template>

<!-- COURSEWARE_SHELL_INJECTED_BY_CREATE_FILE -->
</body>
</html>
```

### 结构要点

- `<title>` 会显示在课件界面工具栏中，请设置为课件标题；文件名宜与标题一致。
- 每页用一个 `<template class="page-data">`：
  - `data-id`：页码序号（从 1 开始，决定顺序）。
  - `data-name`：页面名称（显示在缩略图侧栏）。
- `<template>` 按 `data-id` 升序排列；数量必须等于 `artifact-spec.outline` 页数。
- `page-shared` 内容注入**每页 iframe 的 `<head>`**；外部 CSS/字体必须写在这里，不要写在 HTML `<head>`。
- 壳注入占位符放在**所有 template 之后**、`</body>` 之前；不要读取或输出 `assets/courseware-shell.js` 源码。
- `<div id="cw-loading">` 为可选占位，壳加载后会自动移除。
- `artifact-spec` 是验收与编辑的契约源，须可解析 JSON，见 `SKILL.md` Step 1。

---

## 三、`<template>` 与 `page-shared` 规范

### 3.1 `<template class="page-data">` 内可包含

- `<style>` — 该页样式（仅作用于该页）。
- HTML 元素 — 该页可视内容。
- `<script>` — 该页互动逻辑。
- **注意**：`<script>` 中不可出现字面量 `</template>`（用 `<\/template>` 替代）。

### 3.2 共享外部资源（`page-shared`）

每页在独立 iframe 中渲染，**不继承父文档**的样式和脚本。共用资源须通过 `page-shared` 声明一次，壳会自动注入到每页 `<head>`。

```html
<template class="page-shared">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap" rel="stylesheet">
  <style>
    :root { --stage-base: #eef1f5; --canvas-bg: ...; }
    /* CW_TYPOGRAPHY_DECISION + --cw-courseware-* 字体变量见 references/typography.md */
  </style>
</template>
```

规则：

- 放在所有 `page-data` **之前**；内容可以是 `<script>`、`<link>`、`<style>` 等合法 `<head>` 子元素。
- 声明后，各页可直接使用对应工具类、字体、图标。
- 不使用外部资源时可省略，每页用 `<style>` 写原生 CSS 即可。
- 使用了 CSS 框架工具类却未在 `page-shared` 引入该框架 → 页面会变成裸 HTML。

---

## 四、画布与布局

每页在壳注入的 **960×540** 固定画布（16:9）内渲染。壳会为每页注入 base CSS：`box-sizing:border-box`；`html, body { width:960px; height:540px; }`。壳会检测溢出，但**首选防溢出手段仍是布局调整与拆页**，不要依赖滚动兜底。

### 4.1 根容器与边距

- 页面根容器用 `min-height: 100%`（非 `height: 100%`）；封面页例外见 `references/cover.md`。
- **禁止 `100vh`**：iframe 内取外层视口，一律用 `%`。
- 推荐内边距：上下 30px、左右 40px。
- 内容须落在 960×540 内；过多则拆页或精简。

### 4.2 防溢出通则

- 初始态、反馈态、解析展开、题目切换、动画终态**全部**须校验不溢出。
- **禁止**对 `html`、`body` 或根容器设 `overflow: hidden`。
- 优先 flexbox/grid 分区；避免绝对定位导致不同内容量时溢出。

### 4.3 通用排版建议

- 标题 28–36px，正文 16–20px，列表行距 1.5–1.8。
- `page-shared` 声明 `--canvas-bg`：

```css
:root {
  --stage-base: #eef1f5;
  --canvas-bg: color-mix(in srgb, var(--bg, #fff) 50%, var(--stage-base) 50%);
}
html, body, .page-container { background: var(--canvas-bg); }
```

字体与封面版式分别见 `references/typography.md`、`references/cover.md`。

### 4.4 配色与圆角（每份课件自选一套，全课件统一）

| 维度 | 规则 |
|------|------|
| 配色 | 自选 1 套教育课件配色，写入 `page-shared` 的 `:root` 变量；详见 `style-guide.md` |
| 圆角 | 全课件统一一个值（如 12–16px）；禁止直角与圆角混用 |
| 描边 | 用 `border` 定义边界，避免纯阴影堆叠；不加 emoji |

---

## 五、内容量上限（防溢出）

> 第六节为**最低**标准；本节为**最高**上限。规划与生成须同时满足。

### 5.1 基础空间参数

| 参数 | 值 |
|------|-----|
| 画布 | 960 × 540 px |
| 推荐内边距 | 上下 30px、左右 40px |
| 可用内容区 | 880 × 480 px |
| 页标题占用 | ≈ 56px（含下边距） |
| 标题后剩余高度 | ≈ 424px |

### 5.2 文字容量速查（18px 正文基准）

| 布局方式 | 每行字数 | 可用行数 | 安全字数上限 |
|---------|---------|---------|------------|
| 单栏满宽（880px） | ~48字 | ~14行 | **≤ 400字** |
| 双栏（每栏 ~420px） | ~23字/栏 | ~14行/栏 | **≤ 200字/栏** |
| 卡片内（宽 ~400px） | ~20字 | 视高度 | **≤ 80字/卡** |

> 安全字数 ≈ 理论容量 × 60%，已扣段间距与装饰。

### 5.3 各页类型内容预算

#### 封面页

| 元素 | 上限 |
|------|------|
| 主标题/副标题/封面图 | 设计版式按 `references/cover.md`；非设计版式保持简洁，副标题 1–2 行 |

#### 目录页

| 元素 | 上限 |
|------|------|
| 页标题 | 1 行，≤ 10字 |
| 目录条目 | ≤ **8条**，每条标题 ≤ **16字** |
| 条目描述（可选） | 每条 ≤ 10字 |

#### 讲解/精读页 — 纯展示

| 元素 | 上限 |
|------|------|
| 页标题 | 1 行，≤ 18字 |
| 正文总量 | ≤ **350字** |

常见组合（总量不超限）：要点式 ≤5条×50字+总结≤100字；引用+分析式；双栏对比式各 ≤160字。

#### 例题页

| 元素 | 上限 |
|------|------|
| 页标题 | 1 行，≤ 18字 |
| 题干 | ≤ **100字** |
| 解题步骤 | ≤ **4步**，每步 ≤ **60字** |
| 易错提示（可选） | ≤ **60字** |
| 总文字量 | ≤ **400字** |

含 LaTeX 公式时，独立公式块按 2–3 行文字从总量扣减。

#### 讲解/精读页 — 含交互（点击展开等）

| 元素 | 上限 |
|------|------|
| 页标题 | 1 行 |
| 初始可见内容 | ≤ **250字** |
| 展开/揭示内容 | ≤ **100字** |

**空间预留**：初始态 ≤ 内容区 70%（≈300px），展开增量 ≤ 30%（≈124px）。

#### 练习页

规划时页型标「练习」，按实际交互查子类型；成绩上报见 `references/quiz.md`。

**选择题**

| 元素 | 上限 |
|------|------|
| 题干 | ≤ **80字**（≤3行） |
| 选项 | ≤ **4个**，每项 ≤ **35字** |
| 反馈/解析区 | ≤ **80字** |

须同时校验答题前、答题后两种状态。

**填空题**

| 元素 | 上限 |
|------|------|
| 说明文字 | ≤ 60字 |
| 填空区 | ≤ **4个空**，周围文字 ≤ 180字 |
| 反馈/答案区 | ≤ 60字 |

每个输入框按 40px 高估算。

**拖拽/排序题**

| 元素 | 上限 |
|------|------|
| 指导语 | ≤ 40字 |
| 可拖拽项 | ≤ **6个**，每项标签 ≤ **15字** |
| 放置区 | ≤ **4个**，标签 ≤ 10字 |

须同时校验初始态与完成态。

#### 分析/讨论页

| 元素 | 上限 |
|------|------|
| 页标题 | 1 行 |
| 分析要点 | ≤ 3条，每条 ≤ 60字 |
| 辅助说明 | ≤ 100字 |
| 总文字量 | ≤ **300字** |

#### 小结/结束页

| 元素 | 上限 |
|------|------|
| 页标题 | 1 行 |
| 总结要点 | 2–5条，每条 ≤ **40字** |
| 结语 | ≤ 30字 |

### 5.4 交互状态空间预算通则

| 规则 | 说明 |
|------|------|
| 展开类 | 初始 ≤70% 高度 + 展开增量 ≤30% |
| 逐步展示类 | 全部步骤展示后的**终态**必须不溢出 |
| 输入类 | 每输入框 40px + 反馈区 ≥60px |
| 多状态通则 | 列出所有 UI 状态，每个均在 480px 内容区高度内 |

### 5.5 特殊元素空间估算

含以下元素时从该页文字预算**扣减**：

| 元素 | 估算高度 | 文字扣减 |
|------|---------|---------|
| 引用/原文框 | ≈80–120px | ≈100字 |
| 表格（3–5行） | ≈140–200px | ≈150字 |
| 全宽图片/示意图 | ≤200px | 每 100px ≈120字 |
| LaTeX 独立公式块 | ≈50–80px | 按 2–3 行计 |
| 卡片网格（2×2） | ≈280–320px | 仅剩 ≈100–140px 给标题说明 |

---

## 六、页型最低标准

| 页类型 | 最低要求 |
|--------|---------|
| 封面 | 标题 + 副标题（学科/年级/教材版本） |
| 目录 | 各节标题，可含页码或图标 |
| 讲解/精读 | 核心内容 + 要点 ≥2 或例证 ≥1；**禁止**仅「标题+一句笼统话」 |
| 分析/讨论 | 分析框架或讨论问题 + 要点/示例 ≥2 |
| 例题 | 题干 + 完整解答过程 + 可选思路/易错点 |
| 练习 | 题干 + 答案（或选项）；有空间须有解析或提示 |
| 小结/结束 | 归纳要点 ≥2 条；**禁止**空白 |

---

## 七、互动状态（必做）

含答题或展开交互的页须实现 `saveState` / `restoreState`。壳翻页规则：

| 方向 | 行为 |
|------|------|
| 往后翻（→下一页） | 下一页以**全新初始态**加载 |
| 往前翻（←上一页） | 若曾保存状态，**恢复到离开时状态** |

### 7.1 页面 → 壳：保存状态

```javascript
window.parent.postMessage({ type: 'saveState', state: myState }, '*');
```

- `state` 须可被 `JSON.stringify` 序列化（勿放 DOM、函数）。
- **每次选择/每次 input 即 saveState**，不能等「提交」才保存；翻页会立即销毁 iframe。
- 选择题每次选择即上报；填空题每次 `input` 事件上报。

### 7.2 壳 → 页面：恢复状态

```javascript
window.addEventListener('message', function (e) {
  if (e.data && e.data.type === 'restoreState') restoreUI(e.data.state);
});
```

- `restoreFromState` 须完整恢复 UI（高亮、反馈、禁用按钮、跳过入场动画等）。
- restore 中**不要**直接调用带「防重复执行」守卫的原始处理函数；应直接改 UI 或先重置守卫。
- 纯展示页无需实现。

练习页成绩另见 `references/quiz.md` 的 `cwScore`。

### 7.3 选择题参考模板

```javascript
var myState = { answered: false, selected: null };

function saveMyState() {
  window.parent.postMessage({ type: 'saveState', state: myState }, '*');
}

function onOptionClick(option) {
  myState.answered = true;
  myState.selected = option;
  saveMyState();
}

window.addEventListener('message', function (e) {
  if (e.data && e.data.type === 'restoreState') {
  if (!e.data.state.answered) return;
    myState = e.data.state;
    // 恢复高亮、反馈、禁用状态...
  }
});
```

### 7.4 拖拽/连线防误翻页（必做）

演示模式下壳会在非互动区点击时翻页。含拖拽/连线页须：

**规则 1**：拖拽进行中给元素或 `document.body` 加 `.dragging`（或 `data-dragging`）；`mouseup`/`touchend` 移除。

```javascript
el.addEventListener('mousedown', function () { el.classList.add('dragging'); });
document.addEventListener('mouseup', function () {
  document.querySelectorAll('.dragging').forEach(function (n) { n.classList.remove('dragging'); });
});
```

**规则 2**：拖拽项设 `draggable="true"` 或 `data-interactive`；放置区加 `data-interactive`。

**规则 3**：连线用 `<canvas>`/`<svg>` 时壳已识别；若用 `<div>` 实现须加 `data-interactive`。

---

## 八、数据收集 SDK（可选）

仅当课件需要学习数据上报（练习报告、作答采集等）时适用；纯讲解/展示课可跳过。是否需要由业务侧 `data-collect` 等技能决定。**若需要，第 1 页须含身份采集 UI。**

SDK 全局类名 `MuskCollect`：`save(collection, data)` / `query(collection)`。

### 8.1 由壳自动注入，禁止手动引入

- ✅ 在 `page-shared` 或 `page-data` 的 `<script>` 中直接 `new MuskCollect()`。
- ❌ 禁止手写 `<script src=".../musk-collect.js">`。

```javascript
// ❌ window.muskCollect 等小写驼峰从未被赋值
// ✅
const collect = new MuskCollect();
await collect.save('answers', { qid: 1, answer: 'A' });
```

### 8.2 渲染模式守卫

壳注入 `window.__CW_MODE__`：`'main'` | `'presentation'` | `'thumbnail'`。

**写操作**（`save` 等）必须：

```javascript
if (window.__CW_MODE__ === 'thumbnail') return;
await collect.save('answers', { qid, answer });
```

读操作（`query`）无需守卫。

### 8.3 身份信息：第一页采集，后续页复用

| 角色 | 职责 |
|------|------|
| 第 1 页 | 设计身份采集 UI，写入 `window.parent.sessionStorage[STUDENT_KEY]` |
| 后续页 | 从 `window.parent.sessionStorage` 读取，**禁止**重复采集 |
| 缩略图 | UI 可渲染，**不得**触发写入 |

```javascript
const STUDENT_KEY = 'musk-student-info';
const cached = window.parent.sessionStorage.getItem(STUDENT_KEY);
if (!cached && window.__CW_MODE__ !== 'thumbnail') {
  const info = await collectFromUI(); // 用 HTML 元素实现，禁止 alert/prompt/confirm
  window.parent.sessionStorage.setItem(STUDENT_KEY, JSON.stringify(info));
}
```

后续页 `sessionStorage` 为空时须提示回到第 1 页并禁用交互。

### 8.4 SDK 自检

```
□ 未手写 musk-collect.js
□ 使用 new MuskCollect()，未假定 window.muskCollect 预置实例
□ 所有 save 前有 thumbnail 守卫
□ 第 1 页采集身份写入 parent.sessionStorage；后续页读取不重复采集
□ 身份 UI 不用 alert/prompt/confirm
```

---

## 九、复杂度评估与强互动页

进入 Step 2 前，对照已确认的 `artifact-spec.outline` 做复杂度评估（规划用，不替代大纲）。

### 9.1 复杂度权重参考

| 权重 | 页型 |
|------|------|
| 1 | 封面、目录、小结 |
| 2 | 纯展示讲解/分析 |
| 4 | 选择/填空/点击展开（须 saveState） |
| 6 | 拖拽/复杂动画/Canvas 模拟 |

### 9.2 强互动页判定（满足任一即为强互动）

1. 学生动手探究：拖拽学具、排序/匹配/分类、涂抹/划线、连线等
2. Canvas/SVG/3D 动态可视化，超出 CSS 动画表现力
3. 游戏化练习：闯关、计时、积分、翻牌配对等
4. 实时判定 + 差异化反馈（正确/错误动画与反馈不同）

**非强互动**：点击展开、标签切换、纯播放音视频、简单「显示答案」、静态展示。

关键词辅助：拖拽、Canvas、3D、闯关、游戏、连线、配对、排序、模拟、涂抹、计时挑战等。

每份课件通常 2–5 页强互动；若无命中则全部按普通页处理。

### 9.3 强互动页交互剧本（生成前必产出）

对每个强互动页，生成代码前先写五维剧本：

1. **交互元素与操作方式**
2. **过程反馈**（跟随、悬停、阴影等）
3. **结果反馈**（正确/错误须差异化）
4. **完成态**（庆祝、得分、总结）
5. **技术标注**（anime.js、Web Audio、Canvas 等）

生成时须按剧本实现，不得简化反馈。强互动页 JS 宜 ≥100 行；可按需补调 `generate_images`（见 `references/image-generation.md`），不受 Step 1 素材条数限制。

### 9.4 通用生成规则

- **严格按 outline**：不得偏离、遗漏或擅自加页。
- 教材原文、公式、定义与大纲/检索资料一致。
- 交互基于点击、触摸、拖拽，不用方向键/空格。

---

## 十、生成流程

```
1. Read references/typography.md → 选字体 preset，写入 page-shared（含 CW_TYPOGRAPHY_DECISION）
2. Read references/cover.md → 第 1 页选封面版式
3. Read 当前 artifact-spec.outline + assets
4. 评估强互动页并写交互剧本（§九）
5. Write 完整 <slug>.html（artifact-spec + page-shared + 全部 page-data 一次到位）
6. 在 </body> 前放置 <!-- COURSEWARE_SHELL_INJECTED_BY_CREATE_FILE -->，由 create_file 注入官方壳
7. 对照 artifact-spec.outline 逐页验收（§十二）
```

**页数较多时**：仍须一次组装完整 HTML 再 `create_file`；不要拆成多文件或省略 `artifact-spec`。

每批/每页生成须携带：课件基本信息、教学目标、本页完整大纲行、前后页标题、本页素材 URL、强互动页剧本全文。

---

## 十一、交付自检

```
□ template 数量 = artifact-spec.outline 页数；data-id 从 1 连续递增
□ page-shared 含 --canvas-bg + 字体变量 + CW_TYPOGRAPHY_DECISION
□ 第 1 页封面按 references/cover.md
□ HTML 含 <!-- COURSEWARE_SHELL_INJECTED_BY_CREATE_FILE -->，且未输出 courseware-shell.js 源码
□ create_file 回读：redis_verify_match、shell_injected=true、has_shell_main、placeholder_removed
□ 互动页 saveState/restoreState（含即时上报）；练习页 cwScore（见 references/quiz.md）
□ 拖拽/连线页有 .dragging 或 data-interactive 防误翻页
□ 每页 960×540 内无溢出；未用 100vh；未对 html/body 设 overflow:hidden
□ 未用 alert/confirm/prompt；未用方向键/空格作交互
□ 对照 outline 无漏页、无空壳、无凑页；讲解页要点≥2或例证≥1
□ 需数据收集时：MuskCollect 自检（§8.4）通过
```

逐页验收表：

| 验收项 | 标准 |
|--------|------|
| 页数一致性 | page-data 总数 = outline 页数 |
| 内容一致性 | 与 outline「教学内容/交互设计」逐条对应 |
| 引用准确性 | 原文、公式与资料一致 |
| 交互完整性 | saveState + restoreState，恢复后 UI 一致 |
| 内容充实度 | 无「仅标题+一句话」空壳 |
| data-id | 从 1 连续递增，无跳号 |

---

## 十二、壳自动提供（勿实现）

缩略图、主区预览、演示模式、键盘/滚轮翻页、点击非互动区翻页、焦点管理、状态恢复协议、960×540 注入与 scale 适配、加载占位移除、下载与 SCORM 打包、`window.__CW_MODE__`、子页 MuskCollect SDK 注入（若平台启用）。

create_file 注入后的官方壳须保留：主 iframe 基准 960×540；`_fitMain` 在首屏、切页、resize、fullscreenchange 后生效；缩略图结构 `.cw-thumb > .cw-thumb-inner > iframe`，inner 960×540 + `THUMB_SCALE`。主舞台、页码、标题、缩略图 active、next/prev 与键盘翻页须同步。不要在内容页覆盖壳结构或再实现一套翻页/缩略图。

---

## 十三、禁止事项清单

| 禁止 | 原因 |
|------|------|
| 手写壳 CSS/JS | 由官方壳提供 |
| 读取/输出/修改 `courseware-shell.js` 源码 | LLM 只写内容与占位符 |
| 在 `page-data` 内写 doctype/html/head/body | 壳自动包装 |
| 在 HTML `<head>` 引库期望 iframe 继承 | 须用 `page-shared` |
| 用框架类但未在 `page-shared` 引入 | 工具类失效 |
| `100vh` | iframe 视口错乱 |
| `html/body` 或根容器 `overflow:hidden` | 与壳滚动策略冲突 |
| `alert`/`confirm`/`prompt` | 打断演示全屏 |
| `<script>` 内字面量 `</template>` | 提前闭合标签 |
| 方向键/空格作交互 | 壳用于翻页 |
| base64 替代真实素材 URL | 体积与契约违规 |
| 虚构 URL / 本机路径 | 运行失败 |
| 手写 `musk-collect.js` | 壳已注入 |
| 假定 `window.muskCollect` 等小写预置实例 | 须 `new MuskCollect()` |
| `save` 无 `__CW_MODE__ === 'thumbnail'` 守卫 | 缩略图污染数据 |
