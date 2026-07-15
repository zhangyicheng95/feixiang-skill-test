---

## name: courseware-generator
description: 生成多页 PPT 式互动课件（HTML格式）。当用户提出课件生成、教学PPT、多页演示、带缩略图与播放模式的课件等需求时使用。主流程负责生成原版互动课件：专业大纲生成（课标研读→教材梳理→学情分析→目标拟定→逐页设计）→ 用户确认修改 → 原版素材准备（含生图 prompt 命中式增强、封面图槽位约束）→ 原版 HTML 分批生成（含封面排版、字体选择、template 标签页面结构、960×540 画布、壳框架集成）→ 发布原版课件。首次 ask_user 可记录用户后续想使用的模板意向，但本 skill 禁止承载、读取或执行模板替换规则；原版发布后如用户确认开始替换模板，交由独立 courseware-template-applier skill 处理。不适用于教学动画、教学游戏、单页动画、精美排版等非互动课件场景。

更新时间：2026-06-12

# 互动课件生成技能

> **称谓约束（重要）**：本功能对外统一称为「**互动课件**」。在与用户沟通、回复、向用户展示的任何文字内容中，禁止使用「多页课件」「多页 PPT 课件」等旧称谓，统一使用「互动课件」。技能文档内部出现的"多页"仅为页面数量描述，不属于产品称谓。

本技能指导 AI 完成多页 PPT 式互动课件的**原版生成流程**：先通过专业教研流程生成高质量课件大纲，经用户确认后，再将大纲转化为 HTML 互动课件并发布原版课件。模板替换是独立后处理流程，不在本 skill 内展开。

---

## 技能文件说明

本技能由六个文件组成，请按流程顺序读取：


| 文件                                                         | 用途                                                                                          | 何时读取                              |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------- |
| **SKILL.md**（本文件）                                          | 总览与导航，说明整体流程和文件职责                                                                           | 首先读取                              |
| **[outline-guidance.md](outline-guidance.md)**             | 课件**大纲**生成指南：信息确认→课标研读→教材梳理→学情分析→目标拟定→逐页大纲设计                                                | Phase 1 执行，生成专业教学大纲               |
| **[image-generation-guide.md](image-generation-guide.md)** | 课件**生图提示词增强**指南：只在准备调用 `generate_image` 时读取；按单张图片描述判断是否命中设计老师给出的类型→风格映射；封面图必须先带上封面图片槽位尺寸和比例 | Phase 3 准备图片素材前；强互动页补图前           |
| **[typography-guide.md](typography-guide.md)**             | 课件**字体样式**指南：设计老师给出的字体体系；Phase 4 原版 HTML 生成前由模型自主选择 1 套字体 preset，写入 `page-shared` 并贯穿原版课件   | Phase 4 生成 HTML 前                 |
| **[cover-layout-guide.md](cover-layout-guide.md)**         | 课件**封面版式**指南：设计老师给出的 7 种封面排版；用于封面生图前确定图片槽位，也用于首次生成第 1 页封面结构                                 | Phase 3 封面图生图前；Phase 4 生成第 1 页封面前 |
| **[html-guide.md](html-guide.md)**                         | 课件**HTML生成**完整指南：`<template>` 标签用法、960×540 画布规则、壳框架约束、互动状态管理、复杂度评估、骨架创建→分批生成页面→验收交付         | Phase 4 执行，将大纲转化为 HTML            |


---

## 工作流程

```
Phase 1: 大纲生成
  读取 outline-guidance.md → 按其工作流执行：
  信息确认 → SOP获取 → 课标研读 → 教材梳理 → 学情分析 → 目标拟定 → 逐页大纲设计
  → 调用 create_lesson_design 输出课件大纲
     ↓
Phase 2: 大纲确认与修改
  调用 ask_user 向用户展示大纲并询问修改需求
  → 若有修改：根据用户反馈调整大纲 → 重新调用 create_lesson_design → 再次 ask_user
  → 循环直至用户确认无修改
     ↓
Phase 3: 素材准备
  根据已确认大纲中各页的教学内容和交互设计，准备所需素材：
  图片（调用 generate_image 前读取 image-generation-guide.md 做逐条命中判断；封面图先读取 cover-layout-guide.md 确定槽位）
  → 音频（generate_voice）→ 知识搜索（search_knowledge）等
     ↓
Phase 4: HTML 课件生成
  读取 typography-guide.md、cover-layout-guide.md、html-guide.md → 基于已确认的大纲和素材：
  选择原版字体 preset → 确定第 1 页封面版式和图片槽位
  →
  评估各页生成复杂度 → 创建 HTML 骨架 → 按复杂度分批生成页面 → 逐批注入骨架
     ↓
Phase 5: 验收与交付
  逐页核对大纲 → 发布并交付原版 .html 文件
     ↓
Phase 6: 模板替换分流
  调用 ask_user 询问是否开始替换模板
  → 不替换：结束，仅保留原版互动课件
  → 替换：调用 courseware-template-applier，由独立 skill 基于原版课件生成模板版
```

---

## Phase 1 详细说明：大纲生成

1. 读取 **outline-guidance.md**，按其定义的完整工作流执行。
2. 该流程包含信息确认机制（9 项课件信息 + 1 项模板意向）、SOP 获取、专家推理等步骤，生成专业的逐页课件大纲。
3. 流程结束时调用 `create_lesson_design` 输出大纲。
4. **⚠️ 重要变更**：outline-guidance.md 原始流程中的 `terminate` 调用在本技能中**不执行**。`create_lesson_design` 完成后，直接进入 Phase 2，不终止任务。
5. 模板意向只记录为 `selectedTemplateId`，不得影响原版大纲、原版生图 prompt、原版 HTML 风格或页面结构。原版生图、字体和封面排版只受 `image-generation-guide.md`、`typography-guide.md`、`cover-layout-guide.md` 约束。

---

## Phase 2 详细说明：大纲确认与修改循环

**⚠️ 前置条件：Phase 2 的入口条件是 Phase 1 已成功调用 `create_lesson_design` 生成了大纲文件。如果大纲文件尚未生成，禁止进入 Phase 2。**

大纲文件生成后，进入用户确认循环：

1. 调用 `ask_user`，向用户展示大纲，并设置一个**单选确认字段**，选项固定为：
  - `大纲很棒，直接开始制作`
  - `需要微调（请在下方补充意见）`
  - 设置 `allowCustomAnswer=False`**，不提供自定义选项
   系统自动追加的补充意见输入框用于承接用户的修改说明，无需额外设计其他问题字段。
2. **用户选择 `需要微调（请在下方补充意见）`**：
  - 根据补充意见修改对应的大纲内容
  - 重新调用 `create_lesson_design` 生成更新后的大纲
  - 再次调用 `ask_user` 进入确认循环
3. **用户选择 `大纲很棒，直接开始制作`**：
  - 结束循环，进入 Phase 3

```
create_lesson_design → ask_user → 有修改？
                                        ├─ 需要微调 → 修改大纲 → create_lesson_design → ask_user（循环）
                                        └─ 直接开始制作 → 进入 Phase 3
```

---

## Phase 3 详细说明：素材准备

大纲确认后、HTML 生成前，根据大纲中各页的教学内容和交互设计，提前准备所需的各类素材。

### 3.1 素材准备内容

遍历已确认大纲的逐页设计表格，按以下类别识别并准备素材：


| 素材类别 | 使用工具               | 适用场景                        |
| ---- | ------------------ | --------------------------- |
| 图片   | `generate_image`   | 导入页情境图、知识点示意图、实验配图、课文插图等    |
| 音频   | `generate_voice`   | 课文朗读、语音讲解、英语发音示范等           |
| 题目   | `search_papers`    | 练习页需要的试题、测验题目等              |
| 教学素材 | `search_web`       | 教学方法、教学实践案例、背景知识等           |
| 知识资源 | `search_knowledge` | 补充知识点、教学参考（**数学和语文场景推荐搜索**） |


### 3.2 素材准备规则

1. **多个素材可并行准备**：图片生成、语音生成、知识搜索、题目搜索之间无依赖关系，可在同一轮中并行调用，提升效率。
2. **【关键】图片和 generate_voice 生成的音频必须获取 URL，严禁使用 base64 编码**（Web Audio API 通过代码生成音效不涉及此问题）。
3. **记录素材清单**：每个生成/检索到的素材记录其 URL（或内容）和对应的页码，形成素材清单，供 Phase 4 生成 HTML 时引用。
4. **素材与大纲对应**：只准备大纲中明确需要的素材，不多生成无关素材。
5. **题目搜索**：大纲中标注为练习页/例题页的页面，通过 `search_papers` 搜索合适的题目；通过 `search_web` 搜索教学方法和教学实践等前置知识。
6. **生图 prompt 命中式增强**：准备调用 `generate_image` 前必须读取 `image-generation-guide.md`。该指南不决定是否生图，只在模型已经形成图片需求时逐条判断 `imageDescriptions` 是否命中设计老师给出的内容类型。命中后按固定映射追加画风提示词，不命中保持原图片需求。
7. **封面图先定槽位**：若第 1 页需要封面图，调用 `generate_image` 前先读取 `cover-layout-guide.md`，并按 `image-generation-guide.md` 写入对应槽位的尺寸、比例和构图要求；具体规则不在本文件展开。

---

## Phase 4 详细说明：HTML 课件生成

1. 读取 **typography-guide.md**，由模型根据课题、学科、年级、素材气质和封面需求自主选择 1 套字体 preset。字体选择不调用 `ask_user`，必须把该 preset 的 `@font-face`、`CW_TYPOGRAPHY_DECISION` 注释和 `--cw-courseware-`* 字体变量写入唯一 `<template class="page-shared">`，贯穿原版整份课件。
2. 读取 **cover-layout-guide.md**，为第 1 页确定封面版式和图片槽位；具体规则只按该文件执行。
3. 读取 **html-guide.md**。
4. 禁止额外读取 `interaction-design`、`html-authoring`、`math-design`、`character-visual` 或任何模板相关 skill；HTML 交互、壳协议和分批生成规则只以本 skill 的 `html-guide.md` 为准。`typography-guide.md`、`cover-layout-guide.md` 只提供原版字体和封面版式约束，不属于模板替换。
5. 从 html-guide.md 的**步骤 0（页面分类）**开始执行：
  - 根据大纲中各页的交互设计列，将页面分为**强互动页**（详细交互剧本）和**普通页**（简短交互标签）
  - 强互动页独占批次单独生成（追求游戏级交互体验），普通页打包生成
  - 创建 HTML 骨架 → 分批生成 → 逐批注入
6. **使用 Phase 3 中准备的素材 URL**：生成 HTML 时，将图片和音频的 URL 嵌入对应页面，不要自行创建 base64 内容。封面图按 `cover-layout-guide.md` 已确定的槽位使用。**强互动页在生成过程中可按需调用 `generate_image`、`generate_voice` 补充素材；若补调 `generate_image`，同样必须先按 `image-generation-guide.md` 做逐条命中式增强。**

---

## Phase 5 详细说明：验收与交付

按 html-guide.md 步骤 2 的验收流程执行：逐页核对大纲 → 发布并交付**原版** `.html` 文件。

---

## Phase 6 详细说明：模板替换分流

原版互动课件发布成功后，必须立即调用一次 `ask_user`，询问用户是否开始替换模板。该 ask_user 只负责分流，不在本 skill 内执行模板替换。

### 6.1 分流表单

使用 `SINGLE_CHOICE` 字段，固定提供以下选项：

- `开始替换为已选模板`
- `先不替换，只保留原版课件`
- `更换模板后再替换`

若 Phase 1 的 `selectedTemplateId` 为 `no-template` 或缺失，则将第一个选项改为 `选择模板并开始替换`。

### 6.2 用户选择后的处理

- 选择 `先不替换，只保留原版课件`：结束任务，只交付原版互动课件。
- 选择 `开始替换为已选模板`：调用 `courseware-template-applier` skill，并把以下上下文传递给它：
  - 原版互动课件的最新 HTML 文件 URL 或内部可编辑文件标识
  - 原版互动课件标题
  - Phase 1 记录的 `selectedTemplateId`
  - 已确认的具体页数
- 选择 `更换模板后再替换` 或 `选择模板并开始替换`：先通过 `ask_user` 补选模板，再调用 `courseware-template-applier`。

### 6.3 边界

- 本 skill 禁止读取、粘贴、改写任何模板 CSS、模板页面范式、字体方案或模板后处理规则。
- 本 skill 禁止在原版 HTML 生成阶段提前套用模板色彩、字体、背景或组件颜色。
- 模板替换必须基于已发布的原版课件另行生成模板版，原版课件必须保留。

---

## 核心原则

- **专业大纲先行**：通过课标研读、教材分析、学情分析等专业教研流程生成大纲，而非简单规划。
- **用户确认闭环**：大纲生成后必须经用户确认，确保课件内容符合教学需求。
- **大纲驱动生成**：HTML 课件严格按照已确认的大纲生成，不得偏离大纲内容。
- **分批生成**：按复杂度权重分批生成页面，保证生成质量。
- **壳框架驱动**：AI 只负责编写 `<template>` 内的教学内容，壳功能由云端 JS 提供，禁止手写壳代码。
- **最终交付一个 `.html` 文件**：浏览器打开即可使用。
- **模板后处理独立**：本 skill 只生成原版互动课件；模板版由独立 skill 在用户确认后生成，避免主流程指令过长导致遵循下降。

---

## 使用说明

1. 收到课件生成需求后，按 Phase 1 → 2 → 3 → 4 → 5 → 6 顺序执行。
2. outline-guidance.md 负责「教什么」——通过专业教研流程确定教学内容和页面规划（Phase 1）。
3. image-generation-guide.md 负责「怎么写生图 prompt」——只在准备调用 `generate_image` 时生效，按单张图片命中式增强；封面图必须带槽位比例。
4. typography-guide.md 负责「用什么字体」——素材准备完成后、HTML 生成前由模型自主选择 1 套字体 preset，写入 `page-shared`，不询问用户。
5. cover-layout-guide.md 负责「封面怎么排」——封面生图前确定图片槽位，HTML 生成前确定第 1 页封面版式。
6. html-guide.md 负责「怎么做 + 怎么写」——将大纲和素材转化为 HTML 页面，同时规范 HTML 代码的格式与样式（Phase 4）。
7. courseware-template-applier 负责「要不要换模板 + 怎么换模板」——只在原版课件发布后、用户确认开始替换时加载。

