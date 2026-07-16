---
name: teaching-page-courseware-generator
description: K12 单文件多页翻页课件 HTML 生成 skill。用于 PPT 式课件、翻页演示、缩略图预览、练习页状态保存、成绩消息、下载或 SCORM；含封面槽位与生图 prompt 命中式增强（generate_images）；沿用 spec、outline、page-data 和验收流程，由 LLM 生成页面模板与业务逻辑，并通过 create_file 注入官方课件壳、写入和回读验证。
version: v0.1.4.2
source_version: teaching-page-v3 + feixiang-imagegen-v158
---

# 多页课件生成

本 skill 负责生成“一个 HTML 文件承载多页课件”的翻页型产物。它不是单页互动页面生成器；如果用户要的是教学动画、小游戏、海报、单页练习或 A4 打印材料，应停止本 skill，改由独立的 `teaching-page-html-authoring` skill 执行（不要读取或复用对方文件）。多页课件的核心差异是：页面内容写在多个 `<template class="page-data">` 中，运行时由 create_file 注入的官方课件壳提供缩略图、主预览、翻页、状态恢复和打包入口。

## 产物契约

```text
<slug>.html
```

最终只交付一个完整 HTML。逐页 outline、素材记录、共享样式、页面模板和业务逻辑全部写入同一个 HTML，不生成独立 `outline.md`、`assets-manifest.md` 或运行文件。LLM 不读取、不输出当前版本 `assets/courseware-shell.js` 源码；最终 HTML 必须在 `</body>` 前保留 `<!-- COURSEWARE_SHELL_INJECTED_BY_CREATE_FILE -->`，由 create_file 在写入前读取当前发布版本官方壳并注入。不要手写、简化、复写或凭记忆重建课件壳。

## 最高约束：每页不滚动

多页课件中的每一个 `template.page-data` 都是一张 960×540 的课件页，必须在这一页内完整呈现当前教学任务，不允许依赖页面滚动、局部滚动容器或隐藏滚动条承载核心内容。内容超量时必须拆页、精简、改成逐步展示或同页状态切换；不能用滚动兜底。

这个约束高于普通布局偏好。不得用 `overflow:auto`、固定高度滚动面板或隐藏滚动条来放超量内容；也不得用 `overflow:hidden` 裁掉内容后声称通过。验收时每个 iframe 页都必须满足 `scrollWidth <= clientWidth` 且 `scrollHeight <= clientHeight`，初始态、反馈态、解析展开、题目切换和动画结束态都要检查。

## 文件职责

```text
courseware-generator/
├── SKILL.md                 # 本入口：路由、阶段、硬门槛
├── workflow.md              # Read/Write/create_file/验收的流程图
├── outline-guidance.md      # 如何把教学需求拆成逐页大纲
├── style-guide.md           # 多页课件视觉指南，Step 2 前必读
├── assets/courseware-shell.js
└── references/
    ├── html.md              # 多页 HTML 结构、template、状态协议
    ├── typography.md        # 字体 preset 和 fallback
    ├── cover.md             # 封面版式与 coverImageSlot
    ├── image-generation.md  # 本 skill 独立生图指南（generate_images）
    └── quiz.md              # 逐题练习、反馈、cwScore
```

生成内容与生图规范只使用本目录文件，**禁止**读取 `html-authoring/` 或其他生成 skill 的 reference。  
Step 3 验收**共用**包内 `teaching-page-test-html`（可按需补读其 `guide.md`）。

## 执行总流程

```text
Step 1  输入整理：spec + outline + assets（写入 artifact-spec）
Step 2  内容生成：页面模板 + 壳注入占位符 → create_file 注入官方壳 → 单个 HTML
Step 3  交付验收：静态回读 + 条件浏览器/Playwright
```

禁止跳过 Step 1 直接写 HTML。禁止在 Step 3 未通过时宣称交付。

## 必读文件闸门

进入任何步骤前，先按当前阶段读取对应文件；未读取完必读文件，不允许进入该阶段的执行动作。

```text
Step 1 前必读：
- outline-guidance.md
- 若需要封面图或页内插图/AI 配图：references/cover.md（定槽位）+ references/image-generation.md（生图前）

Step 2 前必读：
- references/html.md
- style-guide.md
- references/typography.md
- 当前任务的 artifact-spec + outline + assets

按页型补读：
- 第 1 页封面：references/cover.md
- 练习、测验、选择题：references/quiz.md
- Step 2 强互动页临时补图：references/image-generation.md

Step 3 前必读：
- `teaching-page-test-html`
```

`style-guide.md` 是多页课件的强制视觉规范，不是可选参考；写 `page-shared` 和各个 `template.page-data` 前必须先读，并把色板、字号、组件、页型结构和防溢出要求落实到实际 HTML。

## Step 1：输入整理与大纲确认

先读取 `outline-guidance.md`。从用户需求整理四字段：

```text
requirements=用户硬要求逐条记录
require=必须出现的页型、互动、素材或练习
forbid=明确禁止项
core-loop=各互动页闭环，例如 P6 选题→确认→解析→下一题
```

多页输入补充规则：`mode=courseware`；必须形成逐页 `outline`，列出页码、页类型、内容要点、交互设计；每个互动页都要标注自己的 `core-loop`；练习页要说明题型、题量、反馈方式和是否上报分数。封面需要图片时，在 `assets` 记录 `coverImageSlot`；无外部素材时写明 CSS/SVG/Canvas 自绘。

多页课件必须内容先行。生成 HTML 前，要先把教学目标、页数、页型、每页信息量、互动页闭环、练习题量、素材来源写成可验收的大纲。用户多轮补充时，以全部消息合并后的最终要求为准；页数、题量、年级、学科、展示比例、禁止项和必须出现的素材都不能在大纲阶段丢失。

大纲里可用自然语言说明图片用途与画面主体，**不要**在大纲阶段写完整生图 prompt，也**不要**提前套用 `references/image-generation.md` 的风格库；是否增强 prompt 仅在真正调用 `generate_images` 前按单张图命中判断。

随后确定 `slug`，把 `mode`、`slug`、`requirements`、`require`、`forbid`、`coreLoop`、`assets` 和 `outline` 写入最终 HTML `<head>` 中唯一的 `<script type="application/json" id="artifact-spec">`。JSON 必须可解析，不含注释、尾逗号、未展开变量或 Markdown；用户内容出现 script 结束标签时写成 `<\/script>`。`outline` 必须逐页列出页码、页类型、内容要点、交互设计，页码连续且总项数等于课件页数。每个互动页都要有可验收的 core-loop；练习页要写明题型、题量、反馈方式，含成绩时说明会发送 `cwScore`。

多页课件默认需要用户确认大纲后再进入 Step 2，因为页数、页序和内容取舍会显著影响最终产物。若用户已经给出完整逐页结构，可以按该结构继续，并在回复中说明采用用户给定大纲。

## 课件内容契约

`artifact-spec.outline` 是内容源和验收源，不是过程备忘。每一页都要能回答“这页教什么、学生看什么、学生做什么、完成后得到什么反馈”。封面、导入、讲解、例题、互动、练习、总结这些页型可以组合，但不能出现只有标题、只有装饰、或只有按钮没有学习任务的空页。

每页以 960×540 为设计画布。信息量超出时必须拆成多页、精简内容或改成逐步展示，不允许局部滚动或整页滚动。讲解页要有清楚的阅读顺序，例题页要保留题干、步骤和结论，互动页要有入口、状态、反馈和重置，练习页要能完成题目并得到结果。

素材契约也要在大纲阶段确定。外部图片、音频、字体或数据必须写入 `artifact-spec.assets`，只能作为非核心增强，记录真实 HTTPS URL、用途、`core:false` 和 fallback；没有真实素材时，明确声明使用 CSS/SVG/Canvas 自绘。不要写虚构路径、本机/Skill 内部/相对运行路径、占位链接或大体积 base64 音视频。

### Step 1 生图与素材准备（v0.1.3）

确认大纲后、写 HTML 前，按页识别图片需求并准备素材：

1. **是否生图**：封面氛围图、语文/历史情境插画、真实景物/人物主视觉、用户明确要求 AI 配图 → 可调用 `generate_images`；数学几何、实验结构、流程图、UI 图标 → 优先 SVG/CSS/Canvas 自绘。
2. **封面先定槽位**：第 1 页需要封面图时，先读 `references/cover.md`，确定 `data-cover-layout` / `data-cover-visual` / `coverImageSlot`，再读 `references/image-generation.md`。
3. **生图前必读**：准备调用 `generate_images` 前，必须完整读取 `references/image-generation.md`，对每条 `imageDescriptions` 做命中式风格增强；不命中不套风格库。
4. **记录资产**：生图返回的真实 URL（或可嵌入资源）写入 `artifact-spec.assets`，含用途、页码、`source`、`fallback`、封面则含 `coverImageSlot` 与最终 `prompt`/`styleHit`。
5. **工具不可用**：改为自绘并在 `assets` 声明，禁止虚构 URL。
6. **并行**：多张图、音频等无依赖时可并行准备。

## Step 2：生成多页 HTML

按需读取参考文件：

| 顺序 | 文件 | 何时读取 |
|---|---|---|
| 1 | `references/html.md` | 始终读取，决定多页 HTML 结构 |
| 2 | `style-guide.md` | 始终读取，决定课件页视觉、色板、结构和组件 |
| 3 | `references/typography.md` | 选择字体 preset 和 fallback |
| 4 | `references/cover.md` | 生成第 1 页封面前 |
| 5 | `references/quiz.md` | outline 含练习、测验、选择题时 |
| 6 | 当前任务的 `artifact-spec.outline` + `assets` | 对照生成内容 |
| 7 | create_file 壳注入占位符 | 组装最终单文件前放置在 `</body>` 前 |
| 临时 | `references/image-generation.md` | 强互动页生成中需补调 `generate_images` 时 |

生成要求：

- `<slug>.html` 必须包含 `<!DOCTYPE html>`、唯一的 `artifact-spec`、`<template class="page-shared">`、多个 `<template class="page-data" data-id="N" data-name="...">`，以及 `</body>` 前的 `<!-- COURSEWARE_SHELL_INJECTED_BY_CREATE_FILE -->`。
- `data-id` 从 1 连续递增；`template.page-data` 数量必须等于 `artifact-spec.outline` 页数。
- 每页内容以 960×540 为设计画布；内容超量时拆页、精简或逐步展示，不使用滚动容器堆内容。
- 共享 CSS 写入 `page-shared`，不要把每页 iframe 需要的 CSS 只放在外层 `<head>`。
- `page-shared` 必须落实 `style-guide.md` 中的色板变量、基础组件、字号密度和 960×540 防溢出规则。
- 互动页必须实现 `saveState` 和 `restoreState`，用户离开再返回时状态可恢复。
- 练习页按 `references/quiz.md` 实现逐题显示、确认后反馈、结果页和 `cwScore`。
- 不读取、不输出 `assets/courseware-shell.js` 源码；把壳注入占位符放到全部 template 之后、`</body>` 之前。create_file 会把占位符替换为官方壳 `<script>`，并在回读结果中验证 `window.__CW_SHELL_MAIN__`。
- **强互动页可按需补调 `generate_images`**：不受 Step 1 素材清单条数限制，但每次调用前必须再读 `references/image-generation.md` 做命中式增强；返回 URL 追加进 `artifact-spec.assets`。
- 封面图必须按 `coverImageSlot` 放入独立 `.cover-visual`，带 `data-cover-slot`；禁止 `page-root` 内联 `background-image` 冒充封面主视觉。比例明显不符时用 `contain` 或按 slot 重生成，禁止裁切主体伪装适配。

壳契约是硬约束：LLM 只生成内容页和业务逻辑，不手写、不拆改、不远程引用、不复写 `courseware-shell.js`。最终写入 Redis 的 HTML 必须由 create_file 注入官方壳，回读结果中不得再存在壳注入占位符，且必须包含 `window.__CW_SHELL_MAIN__` 与自执行调用。内容页只通过 `template.page-data` 和页面脚本提供自身内容、状态保存与互动逻辑。不要在内容页中实现另一套翻页、缩略图或打包入口，也不要用会打断课件壳的弹窗、冲突快捷键或全局事件。

多页模板不是普通长网页。每个 `template.page-data` 都应是一张可独立预览的课件页，依赖的共享样式放在 `page-shared`，页内脚本只处理本页互动。`data-name` 要能表达页的教学作用，不能全部写成“第 N 页”或空泛标题。

练习页的默认交互是“同一页内逐题切换”，不是把多道题纵向堆满一屏。每题需要先选择或作答，再确认答案，显示对错与解析，然后进入下一题。末题后展示结果和重做入口。

互动页的最低闭环是：入口可见→用户操作→状态变化→反馈可见→离开再返回状态可恢复→重置或继续。答题、分类、匹配、拖拽、排序、模拟等页型都不能只做静态示意图。若页面承诺“练习、挑战、闯关、实验、观察变化”，就必须有真实的判定、状态或时间变化。

## Step 2 自检

```text
□ 单个 <slug>.html 已准备为 create_file 可写入内容
□ HTML 含 `<!-- COURSEWARE_SHELL_INJECTED_BY_CREATE_FILE -->`
□ LLM 未输出 courseware-shell.js 源码
□ spec 四字段已整理，mode=courseware
□ page-data 数量 = artifact-spec.outline 页数，data-id 连续
□ page-shared 包含共享 CSS 和画布背景
□ page-shared 已落实 style-guide.md 的色板、组件、字号和防溢出规则
□ 每个 page-data 在 960×540 内无横向/纵向滚动
□ 第 1 页符合封面规则
□ 所有互动页有 saveState / restoreState
□ 练习页有确认、反馈、下一题/结果、重做和 cwScore
□ 每页都能对应 artifact-spec.outline 的页型、内容和交互
□ 每个可点击入口都有可见效果
□ 素材来自 artifact-spec.assets 或已声明 CSS/SVG/Canvas 自绘
□ 若调用过生图：已按 references/image-generation.md 命中增强；封面含 coverImageSlot；source=generate_images；无虚构 URL
□ 没有本机、同目录或 Skill 内部真实运行依赖
```

## Step 3：交付验收

读取 `teaching-page-test-html`，按其中 must-cover、硬门槛和动态验收要求执行。`teaching-page-test-html` 是验收标准来源，不生成内容。

### Step 3.1 create_file 前静态验收

调用 `create_file` 前，先对当前准备提交的 HTML 字符串做静态验收：只有一组 doctype/html/head/body；包含 UTF-8 charset 和 title；style、script、字符串、括号闭合；`artifact-spec` 可解析；所有核心数据和资源已内联；DOM 查询与真实 id/class 一致；无模板占位、空事件函数、可见的 `undefined/null/NaN` 或本地运行依赖；`page-data` 数量等于 `artifact-spec.outline` 页数；存在 `page-shared`；存在且只存在一个 `COURSEWARE_SHELL_INJECTED_BY_CREATE_FILE` 壳注入占位符；未输出 `courseware-shell.js` 源码。

### Step 3.2 create_file 写入与回读证据

静态检查通过后，使用 `create_file` 一次性写入完整 `<slug>.html`。create_file 会读取当前发布版本 `assets/courseware-shell.js` 并替换壳注入占位符，再写入中转区并执行写后回读。

不要使用 `read_file` 回读最终 HTML。ADK 的 `read_file` 只用于读取 skill/reference 文件，不能用于读取 create_file 写入的 Redis 中转产物。写后真实性证据以 `create_file` 返回为准，必须确认返回中包含并满足：

```text
key=courseware:html:<task_id>
bytes>0
sha256=<非空>
redis_verify_match=true
shell_injected=true
has_shell_main=true
placeholder_removed=true
has_artifact_spec=true
has_page_shared=true
page_data_count 与 artifact-spec.outline 页数一致
```

如果 create_file 调用失败、未返回回读证据、`redis_verify_match` 不是 true、占位符未移除或缺少 `window.__CW_SHELL_MAIN__`，任务未交付，应回到 Step 2 修复或报告能力阻塞。

浏览器或 Playwright 可用时，打开工具实际可访问的产物地址。验收必须覆盖：页面能打开，壳加载成功，缩略图和主预览出现，点击和键盘翻页可用，页数与 `artifact-spec.outline` 一致，每个课件页在 960×540 内无横向/纵向滚动，互动页状态可恢复，练习页能发送 `cwScore`，如果环境支持下载则检查 SCORM 包入口，`core-loop / require / forbid` 全部覆盖。动态工具不可用时只能写“静态通过，动态未验证”。

验收时要按 `artifact-spec.outline` 逐页核对，而不是只看壳是否能翻页。页数、页序、页名、页型、关键内容、互动入口、练习题量和素材来源都要对齐；任何一页出现空内容、模板占位、按钮无效、整页溢出或互动状态无法恢复，都应回到 Step 2 修复。

未通过时回到 Step 2 修复后复测。`create_file`、写后回读证据、官方壳注入或 schema 能力不可用时停止并说明最小继续条件，不退回通用生成。最终必须输出验证结论卡，不能只说“已完成”。
