---
name: teaching-page-courseware-generator
version: v0.1.1
source_version: teaching-page-v3
description: K12 多页翻页课件 HTML 生成 skill。用于用户需要 PPT 式多页课件、翻页演示、带缩略图预览、练习页状态保存或成绩消息的场景；流程包括整理 spec、生成并确认 outline.md、写 assets-manifest.md、按 page-data 模板生成 index.html、复制 courseware-shell.js，并通过本地浏览器或 Playwright 验收壳加载、翻页、状态恢复、cwScore 和 core-loop。
---

# 多页课件生成

本 skill 负责生成“一个 HTML 文件承载多页课件”的翻页型产物。它不是单页互动页面生成器；如果用户要的是教学动画、小游戏、海报、单页练习或 A4 打印材料，应改用 `../html-authoring-v0.1.1/SKILL.md`。多页课件的核心差异是：页面内容写在多个 `<template class="page-data">` 中，运行时由 `courseware-shell.js` 提供缩略图、主预览、翻页、状态恢复和打包入口。

## 产物契约

每个任务输出到 `pages/<slug>/`：

```text
pages/<slug>/
├── index.html
├── courseware-shell.js
├── outline.md
└── assets-manifest.md
```

`index.html` 是课件内容，`courseware-shell.js` 从本 skill 的 `assets/` 复制过去，不要手写或内联壳代码。`outline.md` 是生成依据和验收依据，`assets-manifest.md` 记录真实外部素材或声明自绘。

## 最高约束：每页不滚动

多页课件中的每一个 `template.page-data` 都是一张 960×540 的课件页，必须在这一页内完整呈现当前教学任务，不允许依赖页面滚动、局部滚动容器或隐藏滚动条承载核心内容。内容超量时必须拆页、精简、改成逐步展示或同页状态切换；不能用滚动兜底。

这个约束高于普通布局偏好。不得用 `overflow:auto`、固定高度滚动面板或隐藏滚动条来放超量内容；也不得用 `overflow:hidden` 裁掉内容后声称通过。验收时每个 iframe 页都必须满足 `scrollWidth <= clientWidth` 且 `scrollHeight <= clientHeight`，初始态、反馈态、解析展开、题目切换和动画结束态都要检查。

## 文件职责

```text
courseware-generator-v0.1.1/
├── SKILL.md                 # 本入口：路由、阶段、硬门槛
├── workflow.md              # Read/Write/复制/验收的流程图
├── outline-guidance.md      # 如何把教学需求拆成逐页大纲
├── style-guide.md           # 多页课件视觉指南，Step 2 前必读
├── assets/courseware-shell.js
└── references/
    ├── html.md              # 多页 HTML 结构、template、状态协议
    ├── typography.md        # 字体 preset 和 fallback
    ├── cover.md             # 封面版式
    └── quiz.md              # 逐题练习、反馈、cwScore
```

## 执行总流程

```text
Step 1  输入整理：spec + outline.md + assets-manifest.md
Step 2  内容生成：index.html + courseware-shell.js
Step 3  本地验收：浏览器人工检查或本地 Playwright
```

禁止跳过 Step 1 直接写 HTML。禁止在 Step 3 未通过时宣称交付。

## 必读文件闸门

进入任何步骤前，先按当前阶段读取对应文件；未读取完必读文件，不允许进入该阶段的执行动作。

```text
Step 1 前必读：
- 本文件 § Step 1
- outline-guidance.md

Step 2 前必读：
- references/html.md
- style-guide.md
- references/typography.md
- pages/<slug>/outline.md
- pages/<slug>/assets-manifest.md

按页型补读：
- 第 1 页封面：references/cover.md
- 练习、测验、选择题：references/quiz.md

Step 3 前必读：
- ../test-html-v0.1.1/SKILL.md
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

多页输入补充规则：`mode=courseware`；必须生成 `outline.md`；`outline.md` 逐页列出页码、页类型、内容要点、交互设计；每个互动页都要标注自己的 `core-loop`；练习页要说明题型、题量、反馈方式和是否上报分数。封面需要图片时，在 `assets-manifest.md` 记录 `coverImageSlot`；无外部素材时写明 CSS/SVG/Canvas 自绘。

多页课件必须内容先行。生成 HTML 前，要先把教学目标、页数、页型、每页信息量、互动页闭环、练习题量、素材来源写成可验收的大纲。用户多轮补充时，以全部消息合并后的最终要求为准；页数、题量、年级、学科、展示比例、禁止项和必须出现的素材都不能在大纲阶段丢失。

随后确定 `slug`，创建 `pages/<slug>/`，写入 `outline.md` 和 `assets-manifest.md`。`outline.md` 必须逐页列出页码、页类型、内容要点、交互设计，页码连续且总行数等于课件页数。每个互动页都要有可验收的 core-loop；练习页要写明题型、题量、反馈方式，含成绩时说明会发送 `cwScore`。

多页课件默认需要用户确认大纲后再进入 Step 2，因为页数、页序和内容取舍会显著影响最终产物。若用户已经给出完整逐页结构，可以按该结构继续，并在回复中说明采用用户给定大纲。

## 课件内容契约

`outline.md` 是内容源和验收源，不是过程备忘。每一页都要能回答“这页教什么、学生看什么、学生做什么、完成后得到什么反馈”。封面、导入、讲解、例题、互动、练习、总结这些页型可以组合，但不能出现只有标题、只有装饰、或只有按钮没有学习任务的空页。

每页以 960×540 为设计画布。信息量超出时必须拆成多页、精简内容或改成逐步展示，不允许局部滚动或整页滚动。讲解页要有清楚的阅读顺序，例题页要保留题干、步骤和结论，互动页要有入口、状态、反馈和重置，练习页要能完成题目并得到结果。

素材契约也要在大纲阶段确定。外部图片、音频、字体或数据必须写入 `assets-manifest.md`；没有真实素材时，明确声明使用 CSS/SVG/Canvas 自绘。不要写虚构路径、占位链接或无法本地加载的资源。

## Step 2：生成多页 HTML

按需读取参考文件：

| 顺序 | 文件 | 何时读取 |
|---|---|---|
| 1 | `references/html.md` | 始终读取，决定多页 HTML 结构 |
| 2 | `style-guide.md` | 始终读取，决定课件页视觉、色板、结构和组件 |
| 3 | `references/typography.md` | 选择字体 preset 和 fallback |
| 4 | `references/cover.md` | 生成第 1 页封面前 |
| 5 | `references/quiz.md` | outline 含练习、测验、选择题时 |
| 6 | `pages/<slug>/outline.md` + `assets-manifest.md` | 对照生成内容 |

生成要求：

- `index.html` 必须包含 `<!DOCTYPE html>`、`<template class="page-shared">`、多个 `<template class="page-data" data-id="N" data-name="...">`，以及最后的 `<script src="./courseware-shell.js"></script>`。
- `data-id` 从 1 连续递增；`template.page-data` 数量必须等于 `outline.md` 页数。
- 每页内容以 960×540 为设计画布；内容超量时拆页、精简或逐步展示，不使用滚动容器堆内容。
- 共享 CSS 写入 `page-shared`，不要把每页 iframe 需要的 CSS 只放在外层 `<head>`。
- `page-shared` 必须落实 `style-guide.md` 中的色板变量、基础组件、字号密度和 960×540 防溢出规则。
- 互动页必须实现 `saveState` 和 `restoreState`，用户离开再返回时状态可恢复。
- 练习页按 `references/quiz.md` 实现逐题显示、确认后反馈、结果页和 `cwScore`。
- 复制 `assets/courseware-shell.js` 到产物目录，且与 `index.html` 同级。

壳契约是硬约束：`courseware-shell.js` 只从本 skill 的 `assets/` 复制，不手写、不拆改、不内联。内容页只通过 `template.page-data` 和页面脚本提供自身内容、状态保存与互动逻辑。不要在内容页中实现另一套翻页、缩略图或打包入口，也不要用会打断课件壳的弹窗、冲突快捷键或全局事件。

多页模板不是普通长网页。每个 `template.page-data` 都应是一张可独立预览的课件页，依赖的共享样式放在 `page-shared`，页内脚本只处理本页互动。`data-name` 要能表达页的教学作用，不能全部写成“第 N 页”或空泛标题。

练习页的默认交互是“同一页内逐题切换”，不是把多道题纵向堆满一屏。每题需要先选择或作答，再确认答案，显示对错与解析，然后进入下一题。末题后展示结果和重做入口。

互动页的最低闭环是：入口可见→用户操作→状态变化→反馈可见→离开再返回状态可恢复→重置或继续。答题、分类、匹配、拖拽、排序、模拟等页型都不能只做静态示意图。若页面承诺“练习、挑战、闯关、实验、观察变化”，就必须有真实的判定、状态或时间变化。

## Step 2 自检

```text
□ index.html 已写入 pages/<slug>/
□ courseware-shell.js 已复制到同目录
□ spec 四字段已整理，mode=courseware
□ page-data 数量 = outline 页数，data-id 连续
□ page-shared 包含共享 CSS 和画布背景
□ page-shared 已落实 style-guide.md 的色板、组件、字号和防溢出规则
□ 每个 page-data 在 960×540 内无横向/纵向滚动
□ 第 1 页符合封面规则
□ 所有互动页有 saveState / restoreState
□ 练习页有确认、反馈、下一题/结果、重做和 cwScore
□ 每页都能对应 outline.md 的页型、内容和交互
□ 每个可点击入口都有可见效果
□ 素材来自 assets-manifest.md 或已声明 CSS/SVG/Canvas 自绘
```

## Step 3：本地验收

读取 `../test-html-v0.1.1/SKILL.md`。在产物目录启动本地 HTTP 服务：

```bash
cd pages/<slug> && python3 -m http.server 8765
```

用浏览器或本地 Playwright 打开 `http://127.0.0.1:8765/index.html`。验收必须覆盖：页面能打开，壳加载成功，缩略图和主预览出现，点击和键盘翻页可用，页数与 outline 一致，每个课件页在 960×540 内无横向/纵向滚动，互动页状态可恢复，练习页能发送 `cwScore`，如果壳提供 SCORM 包按钮则点击后不报错，`core-loop / require / forbid` 全部覆盖。

验收时要按 `outline.md` 逐页核对，而不是只看壳是否能翻页。页数、页序、页名、页型、关键内容、互动入口、练习题量和素材来源都要对齐；任何一页出现空内容、模板占位、按钮无效、整页溢出或互动状态无法恢复，都应回到 Step 2 修复。

未通过时回到 Step 2 修复后复测。最终必须输出验证结论卡，不能只说“已完成”。
