---
name: courseware-generator
description: 生成多页 PPT 式互动课件（HTML格式）。当用户提出课件生成、教学PPT、多页演示、带缩略图与播放模式的课件等需求时使用。调用本技能的这一轮只能调用 call_skill(courseware-generator) 一个工具，禁止同轮调用其他技能、insert_courseware_design_sop、搜索、专家咨询或大纲生成；读取 SKILL.md 后，除附件读取外，下一轮业务动作只能单独 ask_user 确认 9 项课件信息；ask_user 成功前禁止 SOP、检索、专家咨询和 create_lesson_design；严禁与 math-design、interaction-design 等单页设计技能混用。HTML 必须使用标准壳协议：每页为 <template class="page-data">，保留壳脚本和 <!-- CW_PAGES --> 注入标记；不符合壳协议禁止 publish_resource。涵盖专业大纲生成（课标研读→教材梳理→学情分析→目标拟定→逐页设计）→ 用户确认修改 → HTML分批生成（template标签页面结构、960×540画布、壳框架集成）。不适用于教学游戏、单页动画、精美排版等非互动课件场景。
---

更新时间：2026-06-06

# 互动课件生成技能

> **称谓约束（重要）**：本功能对外统一称为「**互动课件**」。在与用户沟通、回复、向用户展示的任何文字内容中，禁止使用「多页课件」「多页 PPT 课件」等旧称谓，统一使用「互动课件」。技能文档内部出现的"多页"仅为页面数量描述，不属于产品称谓。

本技能指导 AI 完成多页 PPT 式互动课件的完整生成流程：先通过专业教研流程生成高质量课件大纲，经用户确认后，再将大纲转化为 HTML 互动课件。

---

## 运行安全闸门（必须优先遵守）

以下规则优先级高于本技能内其他流程描述，用于防止流程提前停止、工具参数非法或其他技能干扰：

1. **只执行本技能主流程**：互动课件生成必须以 `courseware-generator` 为唯一主流程。`math-design`、`interaction-design` 等单页设计技能不适用于互动课件完整生成流程，禁止在 Phase 1/2/3/4/5/6/7 中读取或套用其页面布局、字体、组件、排版、交互代码或动画约束。
2. **加载技能这一轮只能调用 `call_skill(courseware-generator)`**：选择本技能时，同一轮 tool_call 只能有 `call_skill(courseware-generator)` 一个工具。禁止同轮并发调用 `math-design`、`interaction-design`、`insert_courseware_design_sop`、搜索、专家咨询、`ask_user` 或 `create_lesson_design`。
3. **Phase 1 的第一个业务工具调用必须单独调用 `ask_user`**：除读取/提取附件信息、读取本技能文件外，不得把 `ask_user` 与 `insert_courseware_design_sop`、搜索、专家咨询或大纲生成工具放在同一轮 tool_call 中并行调用。
4. **如已误提前调用 SOP，必须回滚到信息确认**：若 `insert_courseware_design_sop` 已在用户确认 9 项字段之前被调用，该 SOP 结果暂时作废，下一步只能调用合法的 9 项信息确认 `ask_user`。用户确认后必须重新按确认信息调用 `insert_courseware_design_sop`。
5. **`ask_user` 表单必须先通过合法性自检**：信息确认表单只能包含 9 项指定字段，禁止 `OPEN_ENDED`，禁止 `课件标题`、`学科ID`、`学段ID`、`年级ID`、`学期ID`、`建议页数范围`、`其他需求/风格备注` 等旧字段。所有 `SINGLE_CHOICE` 字段的 `options` 至少 2 个且必须是真实候选项；禁止使用兜底类选项，允许自定义必须通过 `allowCustomAnswer=true`。
6. **学科推断必须服从课时内容**：`鸡兔同笼`、`数学广角`、方程、几何、计算等内容必须推断为数学，禁止默认成语文。若误把数学内容确认为语文，必须重问信息确认。
7. **`ask_user` 失败或表单不合规后只能重试 `ask_user`**：若工具返回“参数不合法”“options 至少需要 2 个选项”等错误，或返回结果中存在 `OPEN_ENDED`、旧字段、字段缺失、默认学科错误，下一步必须修正表单参数并再次调用 `ask_user`；禁止继续 SOP、检索、专家咨询、生成大纲、生成 HTML 或结束任务。
8. **SOP 返回值必须被锁定复用**：`insert_courseware_design_sop` 返回的 `expertId` 是唯一有效专家 ID。后续 `consult_courseware_design_expert` 必须原样使用该 `expertId`，禁止自行改成 `1`、`2` 或其他 ID。若传错，必须用正确 `expertId` 重试当前专家任务。
9. **没有 `create_lesson_design` 成功就禁止结束**：在 Phase 1 尚未成功调用 `create_lesson_design` 生成课件大纲前，禁止空输出、禁止 `STOP` 式结束、禁止 `terminate`、禁止宣称任务完成。若发现流程中断风险，必须回到当前 Phase 的下一步继续执行。
10. **误加载其他技能后的恢复规则**：若本轮或上一轮已经误加载 `math-design`、`interaction-design` 或其他单页设计技能，必须立即忽略这些技能的全部内容，回到 `courseware-generator` 当前阶段继续。若尚未完成 Phase 1 信息确认，下一步只能重试合法 9 项 `ask_user`；若已进入 HTML 生成，下一步只能读取 `html-guide.md` 并按壳协议重建/修复骨架。禁止继续读取其他技能文件，禁止读取或复用单页模拟器 HTML。
11. **壳协议是发布硬闸门**：任何首次发布或二次发布前，最新 HTML 必须满足：存在且只存在一个 `<template class="page-shared">`；每页均由 `<template class="page-data" data-id="数字" data-name="页名">` 包裹；`<template class="page-data">` 数量等于大纲页数；`data-id` 从 1 连续递增；壳脚本位于所有页面之后；`<!-- CW_PAGES -->` 注入标记保留。若出现 `<template data-id="p1">`、自写 `#cw-root` 翻页容器、外层 iframe/srcdoc 包裹、缺少 `page-data`、缺少壳脚本或 `page-data` 数量为 0，必须视为未生成合格互动课件，禁止 `publish_resource`，只能按 `html-guide.md` 重新创建骨架并分批注入。

---

## 技能文件说明

本技能由主流程文档与模板代码资产组成，请按流程顺序读取：

| 文件 | 用途 | 何时读取 |
|------|------|----------|
| **SKILL.md**（本文件） | 总览与导航，说明整体流程和文件职责 | 首先读取 |
| **[outline-guidance.md](outline-guidance.md)** | 课件**大纲**生成指南：信息确认→课标研读→教材梳理→学情分析→目标拟定→逐页大纲设计 | Phase 1 执行，生成专业教学大纲 |
| **[html-guide.md](html-guide.md)** | 课件**HTML生成**完整指南：`<template>` 标签用法、960×540 画布规则、壳框架约束、互动状态管理、复杂度评估、骨架创建→分批生成页面→验收交付 | Phase 4 执行，将大纲转化为 HTML |
| **[template-postprocess-guide.md](template-postprocess-guide.md)** | 课件**发布后版面替换**指南：首次发布→版面满意度询问→模板选择→批次 0 注入共享模板层→按连续页码分批套模板→批次/全量覆盖校验→二次发布 | Phase 6 / Phase 7 执行，仅在用户要求更换版面时读取 |
| **[templates/README.md](templates/README.md)** | 当前可选模板索引：模板名称、风格摘要、适用页面与替换边界 | Phase 6 执行，向用户展示真实可选模板 |
| **[templates/retro-zine.md](templates/retro-zine.md)** | `retro-zine` 模板实现说明书：说明复古印刷风应读取哪些代码资产，以及页面映射和交互页替换边界 | Phase 7 执行，用户选择 `复古印刷风` 后读取 |
| **`templates/assets/retro-zine/`** | `retro-zine` 真实模板代码资产：`tokens.css`、`page-shared.css`、`component-snippets.html` | Phase 7 执行，读取 `templates/retro-zine.md` 后继续读取 |
| **[templates/8-bit-orbit.md](templates/8-bit-orbit.md)** | `8-bit-orbit` 模板实现说明书：说明像素霓虹风应读取哪些代码资产，以及页面映射和交互页替换边界 | Phase 7 执行，用户选择 `像素霓虹风` 后读取 |
| **`templates/assets/8-bit-orbit/`** | `8-bit-orbit` 真实模板代码资产：`tokens.css`、`page-shared.css`、`component-snippets.html` | Phase 7 执行，读取 `templates/8-bit-orbit.md` 后继续读取 |

---

## 工作流程

```
Phase 1: 大纲生成
  读取 outline-guidance.md → 按其工作流执行：
  信息确认（9 项字段 ask_user 硬闸门） → SOP获取 → 课标研读 → 教材梳理 → 学情分析 → 目标拟定 → 逐页大纲设计
  → 调用 create_lesson_design 输出课件大纲
     ↓
Phase 2: 大纲确认与修改
  调用 ask_user 向用户展示大纲并询问修改需求
  → 若有修改：根据用户反馈调整大纲 → 重新调用 create_lesson_design → 再次 ask_user
  → 循环直至用户确认无修改
     ↓
Phase 3: 素材准备
  根据已确认大纲中各页的教学内容和交互设计，准备所需素材：
  图片（generate_image）→ 音频（generate_voice）→ 知识搜索（search_knowledge）等
     ↓
Phase 4: HTML 课件生成
  读取 html-guide.md → 基于已确认的大纲和素材：
  评估各页生成复杂度 → 创建 HTML 骨架 → 按复杂度分批生成页面 → 逐批注入骨架
     ↓
Phase 5: 验收与首次交付
  逐页核对大纲 → 调用 publish_resource 首次发布基础互动课件
     ↓
Phase 6: 发布后版面满意度确认
  首次发布完成后立即调用 ask_user 询问用户是否满意当前课件版面
  → 若满意：流程结束
  → 若不满意：读取 templates/README.md，调用 ask_user 让用户单选模板
     ↓
Phase 7: 模板替换与二次交付
  读取 template-postprocess-guide.md → 读取所选模板的代码资产与 10 页来源范式 → 追加共享模板层 → 按连续页码只给 page-root 补模板标识和页级视觉变体 → 做覆盖表与结构指纹校验
  → 调用 publish_resource 二次发布替换版面后的最终 .html 文件
```

---

## Phase 1 详细说明：大纲生成

1. 读取 **outline-guidance.md**，按其定义的完整工作流执行。
2. **信息确认是 Phase 1 的第一道硬闸门**：除读取附件/提取附件信息外，第一次对外业务工具必须是 `ask_user`，向用户展示 9 项课件信息确认表单。即使用户输入看起来足够明确，也必须让用户确认预填值。
3. **禁止跳过信息确认**：在用户确认 9 项字段之前，禁止调用 `insert_courseware_design_sop`、`search_curriculum_standards`、`search_textbook`、`search_web`、`consult_courseware_design_expert`、`create_lesson_design`，也禁止开始课件大纲规划。
4. **禁止把信息确认与后续工具并发调用**：Phase 1 首次 `ask_user` 必须作为单独 tool_call 发出。只有收到用户确认结果后，才能进入 SOP 获取和教研分析。
5. **信息确认失败必须原地修复**：如 `ask_user` 参数不合法，或表单包含 `OPEN_ENDED`、旧 ID 字段、字段缺失、默认学科错误，必须立刻修正表单并重试 `ask_user`。在信息确认成功之前，不得继续执行任何后续流程。
6. 该流程包含信息确认机制（9 项字段）、SOP 获取、专家推理等步骤，生成专业的逐页课件大纲。
7. 流程结束时调用 `create_lesson_design` 输出大纲。
8. **⚠️ 重要变更**：outline-guidance.md 原始流程中的 `terminate` 调用在本技能中**不执行**。`create_lesson_design` 完成后，直接进入 Phase 2，不终止任务。

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

| 素材类别 | 使用工具 | 适用场景 |
|---------|---------|---------|
| 图片 | `generate_image` | 导入页情境图、知识点示意图、实验配图、课文插图等 |
| 音频 | `generate_voice` | 课文朗读、语音讲解、英语发音示范等 |
| 题目 | `search_papers` | 练习页需要的试题、测验题目等 |
| 教学素材 | `search_web` | 教学方法、教学实践案例、背景知识等 |
| 知识资源 | `search_knowledge` | 补充知识点、教学参考（**数学和语文场景推荐搜索**） |

### 3.2 素材准备规则

1. **多个素材可并行准备**：图片生成、语音生成、知识搜索、题目搜索之间无依赖关系，可在同一轮中并行调用，提升效率。

2. **【关键】图片和 generate_voice 生成的音频必须获取 URL，严禁使用 base64 编码**（Web Audio API 通过代码生成音效不涉及此问题）。

3. **记录素材清单**：每个生成/检索到的素材记录其 URL（或内容）和对应的页码，形成素材清单，供 Phase 4 生成 HTML 时引用。

4. **素材与大纲对应**：只准备大纲中明确需要的素材，不多生成无关素材。

5. **题目搜索**：大纲中标注为练习页/例题页的页面，通过 `search_papers` 搜索合适的题目；通过 `search_web` 搜索教学方法和教学实践等前置知识。

---

## Phase 4 详细说明：HTML 课件生成

1. 读取 **html-guide.md**。
2. **禁止读取 `interaction-design`、`math-design` 或其他单页设计技能**。互动页的操作方式、反馈和动画只能来自已确认的大纲、步骤 0 的强互动页交互剧本与 `html-guide.md`；如需缓动函数或时长变量，可在 `page-shared` 中自行声明少量通用 CSS 变量，但不得套用其他技能的页面结构、组件样式或单页模拟器代码。
3. 从 html-guide.md 的**步骤 0（页面分类）**开始执行：
   - 根据大纲中各页的交互设计列，将页面分为**强互动页**（详细交互剧本）和**普通页**（简短交互标签）
   - 强互动页独占批次单独生成（追求游戏级交互体验），普通页打包生成
   - 创建 HTML 骨架 → 分批生成 → 逐批注入
4. **使用 Phase 3 中准备的素材 URL**：生成 HTML 时，将图片和音频的 URL 嵌入对应页面，不要自行创建 base64 内容。**强互动页在生成过程中可按需调用 `generate_image`、`generate_voice` 补充素材**。
5. **创建骨架前必须自检壳协议**：`create_file` 只能创建 `html-guide.md` 规定的短骨架，页面必须后续通过 `edit_file` 注入 `<!-- CW_PAGES -->`；禁止一次性创建含全部页面的完整 HTML，禁止创建 `#cw-root`、自定义翻页壳、父级 iframe/srcdoc 或普通网页容器。若 `create_file` 或 `edit_file` 产物缺少 `page-data`，必须立即修复，不能进入 Phase 5。

---

## Phase 5 详细说明：验收与首次交付

1. 按 html-guide.md 步骤 2 的验收流程执行：逐页核对大纲，并先完成壳协议硬校验。
2. 验收全部通过后，**必须调用 `publish_resource` 发布当前最新版本的 HTML 文件**，让用户先拿到一份完整可用的基础互动课件。
3. **⚠️ 首次发布不可跳过**：即使后续计划支持换版面，也必须先把基础互动课件完整发布给用户，不能直接把发布动作挪到模板替换之后。
4. **⚠️ 首次发布后不可直接结束**：一旦 `publish_resource` 完成，下一步动作必须立刻进入 Phase 6，调用 `ask_user` 询问用户是否满意当前版面；禁止停在“已发布完成”的状态不继续追问。

---

## Phase 6 详细说明：发布后版面满意度确认

**⚠️ 前置条件：Phase 6 的入口条件是 Phase 5 已完成首次 `publish_resource`，用户已经拿到了完整互动课件。若尚未首次发布，禁止进入 Phase 6。**

首次发布后，调用 `ask_user` 询问用户对当前课件版面是否满意。**这一询问是强制动作，不得省略。** 该确认环节必须分两步执行：

1. **先询问是否满意当前版面**，设置一个**单选确认字段**，选项固定为：
   - `当前版面很好，直接结束`
   - `想换一套版面模板`
   - 设置 `allowCustomAnswer=False`，不提供自定义选项
2. **用户选择 `当前版面很好，直接结束`**：
   - 流程结束，不再进入模板替换
3. **用户选择 `想换一套版面模板`**：
   - 读取 `templates/README.md`
   - 再调用一次 `ask_user`，向用户展示真实可用的模板选项，并要求用户**单选一个模板**
   - 记录用户选中的 `selectedTemplateId`
   - 进入 Phase 7

---

## Phase 7 详细说明：模板替换与二次交付

1. 仅在用户于 Phase 6 明确要求换版面时执行。
2. 读取 `template-postprocess-guide.md`，再根据 `selectedTemplateId` 读取对应模板说明书（`templates/retro-zine.md` 或 `templates/8-bit-orbit.md`）。
3. 按模板说明书要求继续读取对应的真实模板代码资产：`tokens.css`、`page-shared.css`、`component-snippets.html`。
4. 严格按上述文件定义的替换边界，在**已发布的最新 HTML 文件**上进行后置版面替换。
5. **Phase 7 必须像 Phase 4 分批生成课件一样分步执行**，禁止把“注入模板”当成一次性自由改造。固定顺序如下：
   - **Step 7.1 建立页面清单**：先 `read_file` 最新 HTML，逐页列出所有 `<template data-id ...>` / `data-cw-role="page-root"`，形成页码、`data-id`、`data-name`、页面标题、页面类型、拟用 `data-cw-variant` 的清单。`data-cw-variant` 必须优先来自选中模板 `slide-01-*` 到 `slide-10-*` 的 10 页来源范式；强互动页可使用 `native-interaction-shell`。
   - **Step 7.2 注入共享模板层**：只把 `tokens.css` 与 `page-shared.css` 追加进唯一的 `page-shared` 样式层末尾，禁止替换、删除或重写原有共享 CSS。原课件已有的标题横杠、按钮形状、卡片阴影、圆角、边框、布局规则必须原样保留。成功后记录新的 `resourceId`，并立即以该 `resourceId` 继续。
   - **Step 7.3 按连续页码分批套模板**：按页面清单从第 1 页开始顺序处理，每批最多 3-5 页，必须是连续页码，例如 1-4、5-8、9-12。禁止跳页、倒序、跨批重复处理，禁止先处理后面页面再回头补前面页面。
   - **Step 7.4 每批只做本批页面的模板标识**：为本批所有 `page-root` 增加 `data-cw-template="<selectedTemplateId>"` 与 `data-cw-variant="<visualVariant>"`。默认不修改页面内部 DOM；视觉适配优先通过模板 CSS 在 `page-root` 上设置 `--primary-color`、`--accent-color`、页面背景、标题/正文/辅助文字字体族、标题/正文/辅助文字颜色和文字阴影完成，不得直接重写组件、按钮、图片容器、标题 DOM、标题横杠或布局样式。
   - **Step 7.5 每批成功后必须锁定最新版本**：每次 `edit_file` 成功返回新 `resourceId` 后，下一批的 `read_file`、`edit_file` 和最终 `publish_resource` 都只能基于这个最新 `resourceId`。
   - **Step 7.6 每批结束必须做批次覆盖表**：列出本批页码、标题、`data-cw-template`、`data-cw-variant`、是否完成；本批有任一页缺失时，禁止进入下一批，必须继续基于最新成功 `resourceId` 修复本批。
   - **Step 7.7 全部批次完成后做全量覆盖表**：逐页列出整份课件所有页面的模板覆盖情况。只要出现 `NO_TEMPLATE`、`NO_VARIANT`、页数不一致或页码缺口，禁止二次发布。
   - **Step 7.8 做结构指纹对比**：以首次发布版本为基准，对比每页 `title-block`、`content-block`、`component-shell`、`media-block`、`button-skin`、`interactive-root`、`img` 的数量和顺序；任一页面数量变化、顺序变化或标题横杠等原有共享 CSS 被删除，禁止发布。
6. **模板替换必须覆盖全部页面**：普通页、讲解页、练习页、总结页、强互动页都必须进入模板替换流程，禁止只替换部分页面。
7. **模板覆盖必须可验证**：二次发布前必须逐页列出 `page-root` 覆盖表，确认每一页都有 `data-cw-template="<selectedTemplateId>"` 和 `data-cw-variant="<visualVariant>"`。若任一页面缺失，禁止调用 `publish_resource`，必须继续基于最新 `resourceId` 修复。
8. **resourceId 必须单调前进**：模板替换过程中只要某次 `edit_file` 成功返回了新的 `resourceId`，后续所有 `read_file`、`edit_file`、`publish_resource` 都必须基于这个最新 `resourceId`。禁止回退到更早的 `resourceId` 继续修复，否则会丢失前一批已成功套用的页面模板。
9. **失败修复不能丢成功批次**：若某批 `edit_file` 失败，失败调用不会产生新版本；继续修复时必须使用“最近一次成功 `edit_file` 返回的 resourceId”，并且重试当前失败批次，禁止跳到下一批或回退到本轮模板替换开始前的旧版本。修复完成后必须重新生成本批覆盖表和全量覆盖表。
10. **根据 AI 教案/大纲页面意图匹配视觉变体**：在 `page-root` 上补 `data-cw-variant="<visualVariant>"`，优先从选中模板完整沉淀的 10 页来源范式中选择，只选择背景、颜色变量、标题/正文/辅助文字字体族、标题/正文/辅助文字颜色、文字阴影和页面氛围，不允许模板约束或重排模型已生成的组件位置。
11. **禁止新增模板文案**：模板里的示例题签、徽章、英文栏头、印章文字只表示原版视觉来源，不能写进课件。严禁新增 `ANCIENT PROBLEM`、`CLASSROOM ZINE`、`MISSION`、`READY`、`LEVEL` 等原课件没有的可见文字。
12. **替换深度按页面类型区分**：
   - 普通页：必须替换页面背景、页面文字颜色、标题/正文/辅助文字字体族、标题/正文/辅助文字颜色、文字阴影、页面级装饰和整体色彩变量，但不得为了贴合模板截图移动组件、重排卡片、改组件形状、删除标题横杠或强行改成图表/时间线。
   - 互动页：也必须替换为模板风格，但只允许替换页面背景、标题/正文/辅助文字字体族、标题/正文/辅助文字颜色、按钮颜色变量、反馈颜色变量和外层色彩变量；禁止改动互动主体结构、组件样式和按钮样式。
13. 模板替换时必须优先复用代码资产里的真实颜色变量和页面级样式，禁止只根据模板说明书的文案自由发挥整套样式，禁止手写第二套会命中组件角色的模板 CSS。
14. 替换时必须保留原有的壳框架、页面数量、互动逻辑、状态管理、组件位置、组件结构、组件形状、组件尺寸、组件文案、标题装饰线和素材引用，只允许修改受控的页面视觉层与颜色变量层。
15. **模板不能改内容图片本身**：图片、插图、题图、结束图等内容素材只允许随页面背景整体呈现，禁止改图片本身颜色、滤镜、混合模式、透明度遮罩，禁止为了贴模板色系而替换原图，也禁止把图片组件改成新卡片/新相框结构。
16. **模板不能改交互绑定关系**：按钮换色时必须保留原有 `onclick`、事件监听目标、函数名、节点 `id`、`class`、`data-*` 标识和脚本查询关系；禁止把原按钮事件名替换成新的函数名，禁止出现“按钮调用 A，脚本只定义 B”的情况。
17. 替换完成后，**必须再次调用 `publish_resource`**，把替换版面后的新版互动课件重新发给用户。
18. 若用户继续要求更换版面或微调视觉，可重复执行 Phase 6 → Phase 7；但每一轮都必须基于**最近一次 edit_file 返回的最新文件版本**进行修改。

---

## 核心原则

- **专业大纲先行**：通过课标研读、教材分析、学情分析等专业教研流程生成大纲，而非简单规划。
- **课件信息确认先行**：生成大纲前必须先让用户确认 9 项课件信息；不能因为模型能推断年级、页数或教材版本就跳过确认。
- **用户确认闭环**：大纲生成后必须经用户确认，确保课件内容符合教学需求。
- **大纲驱动生成**：HTML 课件严格按照已确认的大纲生成，不得偏离大纲内容。
- **分批生成**：按复杂度权重分批生成页面，保证生成质量。
- **壳框架驱动**：AI 只负责编写 `<template>` 内的教学内容，壳功能由云端 JS 提供，禁止手写壳代码。
- **page-data 是课件成立条件**：没有 `<template class="page-data">` 的 HTML 只是普通网页，不是合格互动课件；即使工具创建或发布成功，也必须判定为未完成，回到骨架 + 分批注入流程修复。
- **首次交付必须完整**：先发布一份完整可用的基础互动课件，再决定是否进入版面替换。
- **模板后置应用**：模板只在用户明确要求换版面后介入，不能与内容生成并行耦合。
- **模板代码优先**：选定模板后，必须优先复用模板资产目录中的真实 CSS/HTML 代码，而不是只根据文案描述自行猜样式。
- **模板注入也必须分批推进**：模板后处理不是一次性美化，必须像分批生成页面一样，先注入共享模板层，再按连续页码分批套模板，每批校验通过后才能进入下一批。
- **共享 CSS 只能追加不能替换**：模板 CSS 必须追加到原有 `page-shared` 样式层末尾，禁止覆盖整段 `<style>`，禁止删除原课件标题横杠、按钮、卡片、图片容器和互动区原有样式。
- **视觉变体不控位置**：模板可根据 AI 教案/大纲页面意图选择 `data-cw-variant`，但只改变 10 页来源范式中的背景、颜色、字体族、文字颜色、文字阴影和页面氛围，不移动、不重排、不重新规划模型已生成的组件位置。
- **模板不新增内容**：模板示例中的英文题签、徽章、印章、编号、口号都不是教学内容；如果原课件没有对应文字，禁止新增到页面里。
- **组件只做变量级颜色适配**：模板不能把原组件改成模板截图里的卡片、按钮、相框、徽章或贴纸。原组件的 DOM、class、尺寸、圆角、阴影、边框粗细、布局、标题横杠和可见文案都必须保留；需要适配时优先只改 `page-root` 上的颜色变量，不直接给 `component-shell`、`media-block`、`button-skin` 写新外观。
- **resourceId 不可回退**：模板替换是分批增量修改，一旦某批成功返回新 `resourceId`，后续必须沿着新 `resourceId` 继续；禁止回到旧 `resourceId` 处理“剩余页面”，否则前面成功套模板的页面会丢失。
- **发布后必须追问版面满意度**：首次 `publish_resource` 后必须立刻 `ask_user`，确认是否进入模板替换。
- **模板覆盖全部页面**：一旦用户选择模板，整份课件的所有页面都必须完成模板化；二次发布前必须逐页校验 `data-cw-template` / `data-cw-variant`，缺一页都不能发布。
- **图片内容不可染色**：模板只改图片外框和容器，不改图片素材本身的颜色与滤镜。
- **交互绑定不可改名**：模板替换按钮颜色和反馈颜色时，事件目标、函数名、节点选择器和状态脚本引用必须原样保留。
- **最终交付一个 `.html` 文件**：每次发布都只发布当前最新的入口 HTML 文件，浏览器打开即可使用。

---

## 使用说明

1. 收到课件生成需求后，按 Phase 1 → 2 → 3 → 4 → 5 顺序执行，先完成基础互动课件的生成与首次发布。
2. outline-guidance.md 负责「教什么」——通过专业教研流程确定教学内容和页面规划（Phase 1）。
3. Phase 3 负责「用什么」——根据大纲准备图片、音频、题目等素材。
4. html-guide.md 负责「怎么做 + 怎么写」——将大纲和素材转化为 HTML 页面，同时规范 HTML 代码的格式与样式（Phase 4）。
5. 首次发布后，只有当用户明确表示要更换版面时，才读取 `template-postprocess-guide.md` 和 `templates/README.md` 执行模板后处理（Phase 6 / Phase 7）。
6. 一旦进入模板后处理，默认目标是让**全部页面**都换成所选模板的视觉体系；互动页也要换模板，但只换页面背景、标题/正文/辅助文字字体族、标题/正文/辅助文字颜色、按钮颜色和反馈颜色，不改互动主体和组件样式。
7. 模板后处理始终遵守两条硬约束：图片素材不改色，交互绑定不改名。
