---
name: courseware-generator
description: >-
  生成多页 PPT 式互动课件（HTML格式）。最高优先级：当用户要“互动课件/课件生成/多页课件”时，只能加载 courseware-generator；
  即使主题是数学、鸡兔同笼、方程、几何、文学人物、祥林嫂、角色立绘或课文插图，也严禁同轮加载 math-design、
  interaction-design、html-authoring、character-visual、illustration-plan、illustration-anchor、illustration-render
  或任何其他 skill。首次业务动作必须是真实 ask_user 表单，确认 9 项课件信息并让用户单选模板；ask_user 成功前禁止
  SOP、搜索、专家咨询和 create_lesson_design。用户确认课件页数范围后必须收口为 lockedPageCount，后续大纲逐页表、
  create_lesson_design、HTML page-data 数、原版发布、模板版发布全部必须等于 lockedPageCount。HTML 必须使用标准壳协议：
  每页为未转义的 <template class="page-data">，保留壳脚本和 <!-- CW_PAGES --> 注入标记；若出现 HTML 转义后的 template、
  #cw-root、iframe/srcdoc、自写翻页壳，或 page-data 数量不等于 lockedPageCount，禁止 publish_resource。模板选择只用于后置套模板：
  原版大纲、原版生图 prompt、原版 HTML 背景/字体/按钮/页面风格均不得提前使用模板风格；必须先发布原版互动课件，
  再基于原版注入模板并二次发布模板版。不适用于教学游戏、单页动画、精美排版等非互动课件场景。
---

更新时间：2026-06-08

# 互动课件生成技能

> **称谓约束（重要）**：本功能对外统一称为「**互动课件**」。在与用户沟通、回复、向用户展示的任何文字内容中，禁止使用「多页课件」「多页 PPT 课件」等旧称谓，统一使用「互动课件」。技能文档内部出现的"多页"仅为页面数量描述，不属于产品称谓。

本技能指导 AI 完成多页 PPT 式互动课件的完整生成流程：先通过专业教研流程生成高质量课件大纲，经用户确认后，再将大纲转化为 HTML 互动课件。

---

## 运行安全闸门（必须优先遵守）

以下规则优先级高于本技能内其他流程描述，用于防止流程提前停止、工具参数非法或其他技能干扰：

1. **只执行本技能主流程**：互动课件生成必须以 `courseware-generator` 为唯一主流程。即使课题是数学内容（如鸡兔同笼、方程、几何、计算、数学广角）、文学人物（如祥林嫂、林黛玉、孙悟空）或课文插图需求，也禁止加载、读取或复用 `math-design`、`interaction-design`、`character-visual`、`illustration-plan`、`illustration-anchor`、`illustration-render` 或其他技能；这些技能不适用于互动课件完整生成流程，禁止在 Phase 1/2/3/4/5/6/7 中读取或套用其页面布局、字体、组件、排版、交互代码、动画约束或生图决策表。
2. **加载技能这一轮只能调用 `call_skill(courseware-generator)`**：选择本技能时，同一轮 tool_call 只能有 `call_skill(courseware-generator)` 一个工具。禁止同轮并发调用 `math-design`、`interaction-design`、`character-visual`、`illustration-plan`、`insert_courseware_design_sop`、搜索、专家咨询、`ask_user` 或 `create_lesson_design`。
3. **Phase 1 的第一个业务工具调用必须单独调用 `ask_user`**：除读取/提取附件信息、读取本技能文件外，不得把 `ask_user` 与 `insert_courseware_design_sop`、搜索、专家咨询或大纲生成工具放在同一轮 tool_call 中并行调用。
4. **真实工具调用不可用正文替代**：首次信息确认必须产生 `tool_call.name="ask_user"`，参数必须包含 `formFields`。禁止在 assistant 正文、过程输出、Markdown 表格中写 `[SINGLE_CHOICE]`、`[MULTIPLE_CHOICE]`、`[OPEN_ENDED]` 来模拟表单；这种输出不会渲染选项，必须视为失败并立刻重试真实 `ask_user`。
5. **如已误提前调用 SOP，必须回滚到信息确认**：若 `insert_courseware_design_sop` 已在用户确认 9 项课件字段和模板选择之前被调用，该 SOP 结果暂时作废，下一步只能调用合法的首次信息确认 `ask_user`。用户确认后必须重新按确认信息调用 `insert_courseware_design_sop`。
6. **`ask_user` 表单必须先通过合法性自检**：首次信息确认表单只能包含 9 项课件信息字段 + 1 项模板选择字段，禁止 `OPEN_ENDED`，禁止 `课件标题`、`课件学科`、`适用年级`、`学科ID`、`学段ID`、`年级ID`、`学期ID`、`学期`、`课件页数`、`建议页数范围`、`教学难点`、`互动需求`、`目标学生`、`视觉模板选择`、`其他需求/风格备注` 等旧字段或伪字段。所有 `SINGLE_CHOICE` 字段的 `options` 至少 2 个且必须是真实候选项；9 项课件信息字段允许自定义必须通过 `allowCustomAnswer=true`，模板选择字段必须 `allowCustomAnswer=false`，只能使用 `templates/README.md` 中已有模板，禁止临时编造模板；禁止使用兜底类选项。
7. **首次 `ask_user` 字段名固定**：字段 label 必须且只能为 `课时内容`、`年级`、`册次`、`教材版本`、`教学重点`、`课时数`、`授课类型`、`课件页数范围`、`班级学情`、`版面模板`。除宿主工具自动追加的补充问题外，不得新增第 11 个字段。
8. **学科推断必须服从课时内容**：`鸡兔同笼`、`数学广角`、方程、几何、计算等内容必须推断为数学，禁止默认成语文。该学科只用于后续工具参数，首次确认表单中不得新增 `课件学科` 字段。
9. **`ask_user` 失败或表单不合规后只能重试 `ask_user`**：若工具返回“参数不合法”“options 至少需要 2 个选项”等错误，或返回结果中存在 `OPEN_ENDED`、旧字段、字段缺失、模板选择缺失、默认学科错误，或上一条 assistant 消息只是普通文本表格而没有 `ask_user` 工具记录，下一步必须修正表单参数并再次调用 `ask_user`；禁止继续 SOP、检索、专家咨询、生成大纲、生成 HTML 或结束任务。
10. **SOP 返回值必须被锁定复用**：`insert_courseware_design_sop` 返回的 `expertId` 是唯一有效专家 ID。后续 `consult_courseware_design_expert` 必须原样使用该 `expertId`，禁止自行改成 `1`、`2` 或其他 ID。若传错，必须用正确 `expertId` 重试当前专家任务。
11. **没有 `create_lesson_design` 成功就禁止结束**：在 Phase 1 尚未成功调用 `create_lesson_design` 生成课件大纲前，禁止空输出、禁止 `STOP` 式结束、禁止 `terminate`、禁止宣称任务完成。若发现流程中断风险，必须回到当前 Phase 的下一步继续执行。
12. **误加载其他技能后的恢复规则**：若本轮或上一轮已经误加载 `math-design`、`interaction-design`、`character-visual`、`illustration-plan` 或任何其他技能，必须立即忽略这些技能的全部内容，回到 `courseware-generator` 当前阶段继续。若尚未完成 Phase 1 信息确认，下一步只能重试合法的 9 项课件字段 + 1 项模板选择 `ask_user`；若已进入 HTML 生成，下一步只能按本技能壳协议重建/修复骨架。禁止继续读取其他技能文件，禁止读取或复用单页模拟器、人物立绘技能或插图技能中的 HTML、生图 prompt、头像门禁、重试规则。
13. **页数锁是发布硬闸门**：首次信息确认后必须生成并记住 `lockedPageCount`。若用户选择 `15-18页`，必须在该范围内确定一个具体整数（如 16 或 17），并在后续所有阶段使用同一个整数。禁止在 HTML 阶段自行“精简为 8 页核心内容”、合并多页、删除练习页、删除总结页或只实现重点页。若大纲逐页表、HTML `<template class="page-data">` 数量、模板覆盖表任一处不等于 `lockedPageCount`，禁止 `publish_resource`，只能继续补齐缺失页。
14. **壳协议是发布硬闸门**：任何首次发布或二次发布前，最新 HTML 必须满足：存在且只存在一个 `<template class="page-shared">`；每页均由未转义的 `<template class="page-data" data-id="数字" data-name="页名">` 包裹；`<template class="page-data">` 数量等于 `lockedPageCount` 且等于大纲逐页表行数；`data-id` 从 1 连续递增；壳脚本位于所有页面之后；`<!-- CW_PAGES -->` 注入标记保留。若出现 `<template data-id="p1">`、`&lt;template class=&quot;page-data&quot;`、`&lt;!-- CW_PAGES --&gt;`、自写 `#cw-root` 翻页容器、外层 iframe/srcdoc 包裹、缺少 `page-data`、缺少壳脚本、`page-data` 数量为 0 或少于 `lockedPageCount`，必须视为未生成合格互动课件，禁止 `publish_resource`，只能按本技能壳协议重新创建骨架并分批注入/补齐。
15. **参考文件读取失败恢复**：如果 `read_file` 读取 `templates/README.md`、`html-guide.md`、`typography-guide.md`、`cover-layout-guide.md`、`image-generation-guide.md` 或模板资产返回“未找到指定文件”或 `resourceId=0` 失败，禁止凭记忆自由生成，禁止继续调用搜索、SOP、`create_file` 或 `publish_resource`。下一步只能回到当前阶段的硬闸门：Phase 1 重试合法 `ask_user`；Phase 3 只用本文件中的命中式生图规则；Phase 4 必须使用下方“最小壳骨架协议”。若 `templates/README.md` 读取失败，版面模板字段只能提供两个固定选项：`复古印刷风`（value=`retro-zine`）和 `像素霓虹风`（value=`8-bit-orbit`），禁止新增、兜底或空 options。
16. **原版阶段禁止模板污染**：`selectedTemplateId` 在 Phase 1-5 只是记录字段，不能影响大纲主题、页面类型、图片 prompt、封面图风格、字体 preset、按钮样式、页面背景或组件颜色。禁止在原版大纲、原版生图 prompt、原版 HTML 中使用 `8-bit`、`pixel art`、`neon`、`retro-zine`、`复古印刷风`、`像素霓虹风` 等模板风格词来“匹配用户选择的模板”。模板风格只允许 Phase 7 后置注入。

### 最小壳骨架协议（读取指南失败时也必须执行）

`create_file` 只能创建如下短骨架，不得创建 `#cw-root`、自写翻页脚本、完整课件页面、iframe/srcdoc 或普通网页容器：

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
    :root { --cw-courseware-title-font: system-ui, sans-serif; --cw-courseware-body-font: system-ui, sans-serif; }
  </style>
</template>
<!-- CW_PAGES -->
<script src="https://musk-test.fbcontent.cn/pub-musk-ai-studio/user/upload/admin/HgSiredEejFXx94ofdiCZ8.js"></script>
</body>
</html>
```

发布前必须读取最新资源并做字面量计数：`<template class="page-data"` 必须等于 `lockedPageCount`，`&lt;template class=&quot;page-data&quot;` 必须等于 0，`#cw-root` 必须等于 0，`iframe srcdoc` 必须等于 0。

---

## 技能文件说明

本技能由主流程文档与模板代码资产组成，请按流程顺序读取：

| 文件 | 用途 | 何时读取 |
|------|------|----------|
| **SKILL.md**（本文件） | 总览与导航，说明整体流程和文件职责 | 首先读取 |
| **[outline-guidance.md](outline-guidance.md)** | 课件**大纲**生成指南：信息确认→课标研读→教材梳理→学情分析→目标拟定→逐页大纲设计 | Phase 1 执行，生成专业教学大纲 |
| **[html-guide.md](html-guide.md)** | 课件**HTML生成**完整指南：`<template>` 标签用法、960×540 画布规则、壳框架约束、互动状态管理、复杂度评估、骨架创建→分批生成页面→验收交付 | Phase 4 执行，将大纲转化为 HTML |
| **[image-generation-guide.md](image-generation-guide.md)** | 课件**生图提示词增强**指南：只在模型已经准备调用 `generate_image` 时读取；若是封面图，必须先拿到 `coverImageSlot` 并写入目标尺寸/比例；随后逐条判断图片描述是否命中设计稿左侧内容类型，命中后按左侧内容类型 → 右侧固定风格一一映射增强 prompt，不命中不套风格 | Phase 3 准备图片素材前；Phase 4 强互动页临时补图前 |
| **[typography-guide.md](typography-guide.md)** | 课件**字体样式**指南：沉淀设计老师字体体系，说明字体不是模型自带而必须由浏览器加载；Phase 4 首次生成前由模型自主选择 1 套字体 preset，写入 `page-shared` 并贯穿原版和模板版 | Phase 4 生成 HTML 前，素材准备完成后、封面版式选择前 |
| **[cover-layout-guide.md](cover-layout-guide.md)** | 课件**封面版式**指南：沉淀设计老师 7 种封面排版，按 960×540 画布比例确定标题、说明、页脚、封面图片槽位大小和封面图位置；用于封面生图前确定 `coverImageSlot`，也用于第一次生成第 1 页封面，禁止 Phase 7 重排 | Phase 3 判断需要封面生图前；Phase 4 生成 HTML 前 |
| **[template-postprocess-guide.md](template-postprocess-guide.md)** | 课件**发布后版面替换**指南：首次发布原版→按首次确认的模板选择→批次 0 注入共享模板层→按连续页码分批套模板→批次/全量覆盖校验→二次发布模板版 | Phase 6 / Phase 7 执行，首次原版发布完成后自动读取 |
| **[templates/README.md](templates/README.md)** | 当前可选模板索引：模板名称、风格摘要、适用页面与替换边界 | Phase 1 首次信息确认前读取，用于模板选择字段；Phase 7 执行时可再次核对 |
| **[templates/retro-zine.md](templates/retro-zine.md)** | `retro-zine` 模板实现说明书：说明复古印刷风应读取哪些代码资产，以及页面映射和交互页替换边界 | Phase 7 执行，用户选择 `复古印刷风` 后读取 |
| **`templates/assets/retro-zine/`** | `retro-zine` 真实模板代码资产：`tokens.css`、`page-shared.css`、`component-snippets.html` | Phase 7 执行，读取 `templates/retro-zine.md` 后继续读取 |
| **[templates/8-bit-orbit.md](templates/8-bit-orbit.md)** | `8-bit-orbit` 模板实现说明书：说明像素霓虹风应读取哪些代码资产，以及页面映射和交互页替换边界 | Phase 7 执行，用户选择 `像素霓虹风` 后读取 |
| **`templates/assets/8-bit-orbit/`** | `8-bit-orbit` 真实模板代码资产：`tokens.css`、`page-shared.css`、`component-snippets.html` | Phase 7 执行，读取 `templates/8-bit-orbit.md` 后继续读取 |

---

## 工作流程

```
Phase 1: 大纲生成
  读取 outline-guidance.md → 按其工作流执行：
  信息确认（9 项课件字段 + 1 项模板选择 ask_user 硬闸门） → 将课件页数范围收口为 lockedPageCount → 记录 selectedTemplateId → SOP获取 → 课标研读 → 教材梳理 → 学情分析 → 目标拟定 → 按 lockedPageCount 逐页大纲设计
  → 调用 create_lesson_design 输出课件大纲
     ↓
Phase 2: 大纲确认与修改
  调用 ask_user 向用户展示大纲并询问修改需求
  → 若有修改：根据用户反馈调整大纲 → 重新调用 create_lesson_design → 再次 ask_user
  → 循环直至用户确认无修改
     ↓
Phase 3: 素材准备
  根据已确认大纲中各页的教学内容和交互设计，准备所需素材：
  图片（调用 generate_image 前按 image-generation-guide.md 做逐条命中判断与 prompt 增强）→ 音频（generate_voice）→ 知识搜索（search_knowledge）等
     ↓
Phase 4: HTML 课件生成
  读取 typography-guide.md、cover-layout-guide.md 与 html-guide.md → 基于已确认的大纲和素材：
  先核对 lockedPageCount 与逐页大纲行数 → 自主选择 1 套字体 preset 并写入 page-shared → 判断封面图角色并选择 7 种封面版式之一 → 评估各页生成复杂度 → 创建 HTML 骨架 → 按复杂度分批生成全部页面 → 逐批注入骨架 → 逐页覆盖表确认无缺页
     ↓
Phase 5: 验收与首次交付
  读取最新 HTML 并确认 page-data 数量 = lockedPageCount → 逐页核对大纲 → 调用 publish_resource 首次发布原版互动课件
     ↓
Phase 6: 按首次模板选择进入后置套版
  首次发布完成后不得再次询问版面满意度；直接读取 templates/README.md 与 template-postprocess-guide.md
  → 使用 Phase 1 已确认的 selectedTemplateId
     ↓
Phase 7: 模板替换与二次交付
  读取 template-postprocess-guide.md → 读取所选模板的代码资产与 10 页来源范式 → 追加共享模板层 → 按连续页码只给 page-root 补模板标识和页级视觉变体 → 做覆盖表与结构指纹校验
  → 调用 publish_resource 二次发布模板版互动课件；最终对话中同时保留原版课件和模板版课件两个发布卡片
```

---

## Phase 1 详细说明：大纲生成

1. 读取 **outline-guidance.md**，按其定义的完整工作流执行。
2. **信息确认是 Phase 1 的第一道硬闸门**：除读取附件/提取附件信息、读取 `templates/README.md` 以获取真实模板选项外，第一次对外业务工具必须是 `ask_user`，向用户展示 9 项课件信息确认表单和 1 项模板选择。即使用户输入看起来足够明确，也必须让用户确认预填值和模板。
3. **正文不是表单**：禁止输出 Markdown 表格让用户“勾选”。如果准备输出 `| 字段 | 预填建议/候选项 |`、`[SINGLE_CHOICE]`、`[MULTIPLE_CHOICE]` 这类文本，必须立刻停止正文输出，改为真实调用 `ask_user` 工具。
4. **禁止跳过信息确认**：在用户确认 9 项课件字段和模板选择之前，禁止调用 `insert_courseware_design_sop`、`search_curriculum_standards`、`search_textbook`、`search_web`、`consult_courseware_design_expert`、`create_lesson_design`，也禁止开始课件大纲规划。
5. **禁止把信息确认与后续工具并发调用**：Phase 1 首次 `ask_user` 必须作为单独 tool_call 发出。只有收到用户确认结果后，才能进入 SOP 获取和教研分析。
6. **信息确认失败必须原地修复**：如 `ask_user` 参数不合法，或表单包含 `OPEN_ENDED`、旧 ID 字段、字段缺失、默认学科错误，或上一条输出只是文本表格而不是工具表单，必须立刻修正表单并重试 `ask_user`。在信息确认成功之前，不得继续执行任何后续流程。
7. 该流程包含信息确认机制（9 项课件字段 + 模板选择）、SOP 获取、专家推理等步骤，生成专业的逐页课件大纲。
8. **页数必须锁定**：用户确认 `课件页数范围` 后，必须在进入 SOP 前选择一个具体整数并记录为 `lockedPageCount`。`lockedPageCount` 必须落在用户选择范围内；若未能确定，默认取所选范围中间偏上的整数。后续大纲、HTML、模板覆盖和发布说明都必须使用这个数，不能再改成“核心 8 页”或其他页数。
9. 模板选择只记录为 `selectedTemplateId`，不得影响大纲、素材准备或原版 HTML 课件生成；模板只在首次发布原版后进入 Phase 7 后置注入。
10. 流程结束时调用 `create_lesson_design` 输出大纲。调用前必须确认逐页设计表格行数 = `lockedPageCount`；若不一致，必须重新执行逐页设计，不得交付不一致的大纲。
11. **⚠️ 重要变更**：outline-guidance.md 原始流程中的 `terminate` 调用在本技能中**不执行**。`create_lesson_design` 完成后，直接进入 Phase 2，不终止任务。

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

3. **生图 prompt 只做命中式增强，但封面图必须先定槽位**：准备调用 `generate_image` 前必须读取 `image-generation-guide.md`。若该图片是第 1 页封面图，还必须先读取 `cover-layout-guide.md`，根据大纲第 1 页和素材角色预判 `data-cover-visual`、`data-cover-layout` 与 `coverImageSlot`，再把 slot 的 `targetPx`、`aspectRatio`、方向和安全构图写进该条 `imageDescriptions`。该指南不决定是否生图；只能在模型已根据大纲判断确需生图并形成初始图片描述后，逐条判断每个图片描述是否命中设计稿左侧内容类型。命中后必须按左侧内容类型 → 右侧固定风格的一一映射追加 prompt，不能自由另选风格；不命中保持原始图片需求。豆包工作流下优先使用中文提示词，禁止为了套风格把整套课件所有图片统一改成同一种画风。

4. **记录素材清单**：每个生成/检索到的素材记录其 URL（或内容）和对应的页码，形成素材清单，供 Phase 4 生成 HTML 时引用。封面图素材必须额外记录 `coverImageSlot`，包括 `slotId`、`targetPx`、`aspectRatio`、`data-cover-visual`、`data-cover-layout`，供 Phase 4 复用。

5. **素材与大纲对应**：只准备大纲中明确需要的素材，不多生成无关素材；禁止为了触发生图风格新增图片需求。

6. **题目搜索**：大纲中标注为练习页/例题页的页面，通过 `search_papers` 搜索合适的题目；通过 `search_web` 搜索教学方法和教学实践等前置知识。

---

## Phase 4 详细说明：HTML 课件生成

1. 读取 **html-guide.md**。
2. **先做页数锁核对**：进入 HTML 生成前必须从对话历史中提取 `lockedPageCount` 和已确认大纲逐页表。若逐页表行数不等于 `lockedPageCount`，或大纲页码不是 1..N 连续，禁止创建 HTML，必须回到 Phase 1/2 修正大纲。
3. 在创建 HTML 骨架和生成第 1 页封面前，必须读取 **typography-guide.md**，由模型根据课时内容、学科、年级、素材风格和封面需求自主选择 1 套字体 preset。该选择不调用 `ask_user`，不新增表单字段；必须使用 `typography-guide.md` 中已上传的真实静态字体 URL，把 `CW_TYPOGRAPHY_DECISION` 注释、该 preset 及依赖字体的 `@font-face` 和 `--cw-courseware-*` 字体变量写入唯一 `page-shared`，并贯穿原版整份课件。若新增字体没有可用资源 URL，只能使用 fallback 栈，禁止伪造字体链接。
4. 在创建 HTML 骨架和生成第 1 页封面前，必须读取 **cover-layout-guide.md**，根据 Phase 3 素材判断 `data-cover-visual`（`none` / `full-bleed-background` / `side-visual` / `inline-card`），并从 7 种封面版式中确定一个 `data-cover-layout` 和 `coverImageSlot`。封面标题位置、字号、图片槽位大小、图片位置属于首次生成结构，必须在原版课件生成时完成，禁止留到 Phase 7 模板注入时重排；禁止用 `flex: 1` 或自动填充代替设计稿图片槽位。
5. **禁止读取 `interaction-design`、`math-design` 或其他单页设计技能**。互动页的操作方式、反馈和动画只能来自已确认的大纲、步骤 0 的强互动页交互剧本与 `html-guide.md`；如需缓动函数或时长变量，可在 `page-shared` 中自行声明少量通用 CSS 变量，但不得套用其他技能的页面结构、组件样式或单页模拟器代码。
6. **禁止压缩大纲页**：HTML 必须逐页实现已确认大纲中的每一行。禁止把多页大纲压缩成“核心内容页”，禁止合并大纲中的相邻页，禁止跳过拓展练习、总结、作业、结束页等看似非核心但已列入大纲的页面。
7. 从 html-guide.md 的**步骤 0-T（字体样式选择）**、**步骤 0-A（封面图角色与封面版式选择）**和**步骤 0（页面分类）**开始执行：
   - 根据大纲中各页的交互设计列，将页面分为**强互动页**（详细交互剧本）和**普通页**（简短交互标签）
   - 强互动页独占批次单独生成（追求游戏级交互体验），普通页打包生成
   - 创建 HTML 骨架 → 分批生成全部页面 → 逐批注入
   - 每批成功后维护 `Page Implementation Ledger`，标记本批已覆盖的页码
8. **使用 Phase 3 中准备的素材 URL**：生成 HTML 时，将图片和音频的 URL 嵌入对应页面，不要自行创建 base64 内容。封面图片必须按 `cover-layout-guide.md` 放入独立 `cover-visual` / `media-block`，媒体层必须带 `data-cover-slot="<slotId>"`，并按 `coverImageSlot` 固定尺寸落位；禁止写成 `page-root` 内联 `background-image`。若封面图比例明显不匹配槽位，禁止用 `object-fit: cover` 裁切主体来伪装适配，必须使用 `contain` 保护主体、换兼容版式或重新按 slot prompt 生图。**强互动页在生成过程中可按需调用 `generate_image`、`generate_voice` 补充素材**；若补调 `generate_image`，也必须先读取 `image-generation-guide.md` 并逐条做命中式 prompt 增强，命中后按固定映射追加风格，不命中的图片需求不得追加该风格库。
9. **创建骨架前必须自检壳协议**：`create_file` 只能创建 `html-guide.md` 规定的短骨架，页面必须后续通过 `edit_file` 注入 `<!-- CW_PAGES -->`；禁止一次性创建含全部页面的完整 HTML，禁止创建 `#cw-root`、自定义翻页壳、父级 iframe/srcdoc 或普通网页容器。若 `create_file` 或 `edit_file` 产物缺少 `page-data`，或 `page-data` 数量少于 `lockedPageCount`，必须立即修复，不能进入 Phase 5。
10. **分批完成条件**：只有当 `Page Implementation Ledger` 中 1..`lockedPageCount` 全部为 `DONE`，且最新 HTML 中 `<template class="page-data">` 数量等于 `lockedPageCount` 时，Phase 4 才算完成。否则必须继续补页，禁止宣称“核心内容已完成”。

---

## Phase 5 详细说明：验收与首次交付

1. 按 html-guide.md 步骤 2 的验收流程执行：逐页核对大纲，并先完成壳协议硬校验。
2. **发布前必须读取最新 HTML 做硬计数**：调用 `publish_resource` 前必须先读取最近一次 `edit_file` 返回的最新 HTML，统计 `<template class="page-data">` 数量，并列出 `data-id` 覆盖表。若数量不等于 `lockedPageCount`，或 `data-id` 不是 1..N 连续，禁止发布；必须回到 Phase 4 补齐缺页。
3. 验收全部通过后，**必须调用 `publish_resource` 发布当前最新版本的 HTML 文件**，让用户先拿到一份完整可用的原版互动课件。
4. **⚠️ 首次发布不可跳过**：即使用户已在 Phase 1 选择模板，也必须先把原版互动课件完整发布给用户，不能直接把发布动作挪到模板替换之后。
5. **⚠️ 首次发布后不可直接结束**：一旦原版 `publish_resource` 完成，下一步动作必须立刻进入 Phase 6，按 Phase 1 已确认的 `selectedTemplateId` 执行模板后处理；禁止再次询问版面满意度，禁止停在“已发布完成”的状态不继续套模板。

---

## Phase 6 详细说明：按首次模板选择进入后置套版

**⚠️ 前置条件：Phase 6 的入口条件是 Phase 5 已完成首次 `publish_resource`，用户已经拿到了完整原版互动课件，并且 Phase 1 已记录 `selectedTemplateId`。若尚未首次发布，禁止进入 Phase 6。**

首次发布后，不再询问用户是否满意当前版面，也不再二次询问模板。模板已经在 Phase 1 首次信息确认中确定。

1. 读取 `templates/README.md`，核对 `selectedTemplateId` 是否仍属于真实可用模板。
2. 若 `selectedTemplateId` 缺失或不是本文件列出的模板，必须调用一次 `ask_user` 只补选模板；该异常补选不得改变已确认的大纲和原版课件。
3. 若 `selectedTemplateId` 有效，直接进入 Phase 7。

---

## Phase 7 详细说明：模板替换与二次交付

1. 在 Phase 5 已发布原版互动课件且 Phase 1 已确认模板后自动执行。
2. 读取 `template-postprocess-guide.md`，再根据 `selectedTemplateId` 读取对应模板说明书（`templates/retro-zine.md` 或 `templates/8-bit-orbit.md`）。
3. 按模板说明书要求继续读取对应的真实模板代码资产：`tokens.css`、`page-shared.css`、`component-snippets.html`。
4. 严格按上述文件定义的替换边界，在**已发布的最新 HTML 文件**上进行后置版面替换。
5. **Phase 7 必须像 Phase 4 分批生成课件一样分步执行**，禁止把“注入模板”当成一次性自由改造。固定顺序如下：
   - **Step 7.1 建立页面清单**：先 `read_file` 最新 HTML，逐页列出所有 `<template data-id ...>` / `data-cw-role="page-root"`，形成页码、`data-id`、`data-name`、页面标题、页面类型、拟用 `data-cw-variant` 的清单。`data-cw-variant` 必须优先来自选中模板 `slide-01-*` 到 `slide-10-*` 的 10 页来源范式；强互动页可使用 `native-interaction-shell`。
   - **Step 7.2 注入共享模板层**：只把 `tokens.css` 与 `page-shared.css` 追加进唯一的 `page-shared` 样式层末尾，禁止替换、删除或重写原有共享 CSS。原课件已有的标题横杠、按钮形状、卡片阴影、圆角、边框、布局规则必须原样保留。成功后记录新的 `resourceId`，并立即以该 `resourceId` 继续。
   - **Step 7.3 按连续页码分批套模板**：按页面清单从第 1 页开始顺序处理，每批最多 3-5 页，必须是连续页码，例如 1-4、5-8、9-12。禁止跳页、倒序、跨批重复处理，禁止先处理后面页面再回头补前面页面。
   - **Step 7.4 每批只做本批页面的模板标识**：为本批所有 `page-root` 增加 `data-cw-template="<selectedTemplateId>"` 与 `data-cw-variant="<visualVariant>"`。默认不修改页面内部 DOM；视觉适配优先通过模板 CSS 在 `page-root` 上设置页面背景、页面级变量、标题/正文/辅助文字颜色和文字阴影完成，字体必须继承原版 `--cw-courseware-*` 变量。若某页 `page-root` 的内联 `style` 已有 `background` / `background-image` / `background-color` / `background-size` / `background-position` 且挡住模板背景，只允许删除这些 `page-root` 背景属性并保留其他内联样式原样；但第 1 页若 `data-cover-visual="full-bleed-background"`，必须优先保护独立 `cover-visual` 媒体层，禁止删除、替换或遮盖封面主视觉图。禁止改任何子节点或保护区样式。**组件框内文字颜色必须保持原课件生成结果不变**：模板文字颜色只能作用于 `component-shell`、`interactive-root`、`media-block`、`button-skin`、`feedback-layer` 外部的标题和正文，禁止让 `content-block` 或 `page-root` 的颜色规则穿透到组件框内部。
   - **Step 7.5 每批成功后必须锁定最新版本**：每次 `edit_file` 成功返回新 `resourceId` 后，下一批的 `read_file`、`edit_file` 和最终 `publish_resource` 都只能基于这个最新 `resourceId`。
   - **Step 7.6 每批结束必须做批次覆盖表**：列出本批页码、标题、`data-cw-template`、`data-cw-variant`、是否完成；本批有任一页缺失时，禁止进入下一批，必须继续基于最新成功 `resourceId` 修复本批。
   - **Step 7.7 全部批次完成后做全量覆盖表**：逐页列出整份课件所有页面的模板覆盖情况。只要出现 `NO_TEMPLATE`、`NO_VARIANT`、页数不一致或页码缺口，禁止二次发布。
   - **Step 7.8 做结构指纹对比**：以首次发布版本为基准，对比每页 `title-block`、`content-block`、`component-shell`、`media-block`、`button-skin`、`interactive-root`、`img` 的数量、顺序和保护区内联 `style` 字符串；除 `page-root` 自身背景属性可按规则清理外，任一页面数量变化、顺序变化、保护区 `style` 变化或标题横杠等原有共享 CSS 被删除，禁止发布。
6. **模板替换必须覆盖全部页面**：普通页、讲解页、练习页、总结页、强互动页都必须进入模板替换流程，禁止只替换部分页面。
7. **模板覆盖必须可验证**：二次发布前必须逐页列出 `page-root` 覆盖表，确认每一页都有 `data-cw-template="<selectedTemplateId>"` 和 `data-cw-variant="<visualVariant>"`。若任一页面缺失，禁止调用 `publish_resource`，必须继续基于最新 `resourceId` 修复。
8. **resourceId 必须单调前进**：模板替换过程中只要某次 `edit_file` 成功返回了新的 `resourceId`，后续所有 `read_file`、`edit_file`、`publish_resource` 都必须基于这个最新 `resourceId`。禁止回退到更早的 `resourceId` 继续修复，否则会丢失前一批已成功套用的页面模板。
9. **失败修复不能丢成功批次**：若某批 `edit_file` 失败，失败调用不会产生新版本；继续修复时必须使用“最近一次成功 `edit_file` 返回的 resourceId”，并且重试当前失败批次，禁止跳到下一批或回退到本轮模板替换开始前的旧版本。修复完成后必须重新生成本批覆盖表和全量覆盖表。
10. **根据 AI 教案/大纲页面意图匹配视觉变体**：在 `page-root` 上补 `data-cw-variant="<visualVariant>"`，优先从选中模板完整沉淀的 10 页来源范式中选择，只选择背景、组件外标题/正文/辅助文字颜色、文字阴影和页面氛围；字体继承原版 `--cw-courseware-*` 决策，不允许模板约束或重排模型已生成的组件位置。
11. **禁止新增模板文案**：模板里的示例题签、徽章、英文栏头、印章文字只表示原版视觉来源，不能写进课件。严禁新增 `ANCIENT PROBLEM`、`CLASSROOM ZINE`、`MISSION`、`READY`、`LEVEL` 等原课件没有的可见文字。
12. **替换深度按页面类型区分**：
   - 普通页：必须替换页面背景、组件外页面文字颜色、组件外标题/正文/辅助文字颜色、文字阴影和页面级装饰，并继承原版字体变量；但不得为了贴合模板截图移动组件、重排卡片、改组件形状、删除标题横杠或强行改成图表/时间线。组件框内文字颜色必须保持原样。
   - 互动页：也必须替换为模板风格，但只允许替换页面背景、组件外标题/正文/辅助文字颜色、文字阴影和外层色彩变量，并继承原版字体变量；禁止改动互动主体结构、组件样式、按钮样式、组件框内字体和组件框内文字颜色。
13. 模板替换时必须优先复用代码资产里的真实模板专用变量和页面级样式，禁止只根据模板说明书的文案自由发挥整套样式，禁止手写第二套会命中组件角色或组件内部文字的模板 CSS。
14. 替换时必须保留原有的壳框架、页面数量、互动逻辑、状态管理、组件位置、组件结构、组件形状、组件尺寸、组件文案、组件框内文字颜色、标题装饰线和素材引用，只允许修改受控的页面背景与组件外文字视觉层。
15. **模板修复不能变成视觉重构**：若发现模板背景、字体或颜色未生效，只能修复模板 CSS 顺序、模板资产完整性、`page-root` 模板标记、`page-root` 自身背景属性冲突和变体映射。禁止以“深度固化”“视觉重构”“霓虹强化”“控制台风格”“发光边框”等名义修改组件、按钮、图片框、媒体框、反馈框或页面子节点样式。
16. **模板不能改内容图片本身**：图片、插图、题图、结束图等内容素材只允许随页面背景整体呈现，禁止改图片本身颜色、滤镜、混合模式、透明度遮罩，禁止为了贴模板色系而替换原图，也禁止把图片组件改成新卡片/新相框结构。
17. **模板不能改交互绑定关系**：必须保留原按钮文字颜色、`onclick`、事件监听目标、函数名、节点 `id`、`class`、`data-*` 标识和脚本查询关系；禁止把原按钮事件名替换成新的函数名，禁止出现“按钮调用 A，脚本只定义 B”的情况。
18. 替换完成后，**必须再次调用 `publish_resource`**，把模板版互动课件重新发给用户；最终用户应看到两份课件：原版互动课件和模板版互动课件。
19. 若用户继续要求更换版面或微调视觉，可重复执行 Phase 6 → Phase 7；但每一轮都必须基于**最近一次 edit_file 返回的最新文件版本**进行修改。

---

## 核心原则

- **专业大纲先行**：通过课标研读、教材分析、学情分析等专业教研流程生成大纲，而非简单规划。
- **课件信息、页数锁与模板选择确认先行**：生成大纲前必须先让用户确认 9 项课件信息和 1 项模板选择；不能因为模型能推断年级、页数、教材版本或模板偏好就跳过确认。用户确认页数范围后必须立即收口为 `lockedPageCount`，后续不得改变。
- **用户确认闭环**：大纲生成后必须经用户确认，确保课件内容符合教学需求。
- **大纲驱动生成**：HTML 课件严格按照已确认的大纲生成，不得偏离大纲内容。
- **禁止核心页压缩**：大纲有多少页，HTML 就必须生成多少个 `page-data`。禁止把 16 页大纲压缩成 8 页“核心内容”，禁止合并讲解页、练习页、拓展页、总结页和作业页。
- **分批生成**：按复杂度权重分批生成页面，保证生成质量。
- **壳框架驱动**：AI 只负责编写 `<template>` 内的教学内容，壳功能由云端 JS 提供，禁止手写壳代码。
- **page-data 是课件成立条件**：没有 `<template class="page-data">` 的 HTML 只是普通网页，不是合格互动课件；即使工具创建或发布成功，也必须判定为未完成，回到骨架 + 分批注入流程修复。
- **page-data 数量必须等于 lockedPageCount**：只要少一页、多一页、跳号或重复页码，都不是合格互动课件；禁止发布，必须补齐或修复。
- **首次交付必须完整**：先发布一份完整可用的原版互动课件，再按首次确认的模板进入后置替换。
- **生图 prompt 命中式增强**：`image-generation-guide.md` 只在 `generate_image` 调用前生效；按单张图片需求判断，命中设计稿左侧内容类型才按左侧内容类型 → 右侧固定风格一一映射追加 prompt，不命中保持原始素材需求。第 1 页封面图还必须先按 `cover-layout-guide.md` 确定 `coverImageSlot`，并在 prompt 中写明目标尺寸和比例。
- **字体样式首次生成前确定**：Phase 4 必须读取 `typography-guide.md`，由模型自主选择 1 套字体 preset 并写入 `page-shared`。字体不是模型自带能力，本批字体必须使用指南中已上传的真实静态 URL；新增无资源字体只能走 fallback 栈，不新增用户表单字段。
- **封面版式首次生成时确定**：第 1 页封面必须在 Phase 4 创建 HTML 前按 `cover-layout-guide.md` 确定 `data-cover-visual`、`data-cover-layout` 和 `coverImageSlot`。封面文字位置、字号、图片槽位大小、图片位置只在原版生成时确定，Phase 7 禁止重排。
- **模板前置选择、后置应用**：模板在首次信息确认时由用户选择，但只记录为 `selectedTemplateId`；不能影响大纲、素材准备或原版课件生成。模板只能在原版 `publish_resource` 成功后注入。
- **模板不触发生图**：`selectedTemplateId` 不决定图片是否命中，也不能把非命中图强行改成模板风格；模板后处理禁止重新生图、替换图片、筛选图片或给图片改色。
- **模板代码优先**：选定模板后，必须优先复用模板资产目录中的真实 CSS/HTML 代码，而不是只根据文案描述自行猜样式。
- **模板继承原版字体决策**：Phase 7 不重新选择字体，不用模板字体覆盖原版 `CW_TYPOGRAPHY_DECISION` 与 `--cw-courseware-*` 变量；模板字体栈只能作为原版字体变量缺失时的 fallback。
- **模板注入也必须分批推进**：模板后处理不是一次性美化，必须像分批生成页面一样，先注入共享模板层，再按连续页码分批套模板，每批校验通过后才能进入下一批。
- **共享 CSS 只能追加不能替换，且必须最后生效**：模板 CSS 必须追加到原有 `page-shared` 样式层中所有原课件 CSS 之后，作为最终模板层生效；禁止把模板资产插在原课件 `:root`、`[data-cw-role="page-root"]`、`page-root::before` 背景规则之前。禁止覆盖整段 `<style>`，禁止删除原课件标题横杠、按钮、卡片、图片容器和互动区原有样式。
- **模板背景不能被原课件底色盖住**：二次发布前必须检查模板资产标记之后是否还存在未限定模板的 `[data-cw-role="page-root"] { background/background-color/background-image... }` 或 `[data-cw-role="page-root"]::before { background... }` 规则；若存在，必须把模板 CSS 移到这些规则之后，或追加模板背景锁。像素霓虹风不得出现原水墨/米灰/浅灰底色残留。
- **page-root 内联背景只清背景，不动组件**：若原课件把背景图或底色写在 `page-root` 的内联 `style` 中，模板替换时只允许移除该 `page-root` 上的背景相关属性，保留其他布局属性；禁止顺手改里面的卡片、按钮、图片框、标题、媒体框、反馈框。
- **视觉变体不控位置**：模板可根据 AI 教案/大纲页面意图选择 `data-cw-variant`，但只改变 10 页来源范式中的背景、组件外文字颜色、文字阴影和页面氛围，字体继承原版 `--cw-courseware-*` 决策；不移动、不重排、不重新规划模型已生成的组件位置。
- **模板不新增内容**：模板示例中的英文题签、徽章、印章、编号、口号都不是教学内容；如果原课件没有对应文字，禁止新增到页面里。
- **组件框内字体颜色保持不变**：模板不能把原组件改成模板截图里的卡片、按钮、相框、徽章或贴纸。原组件的 DOM、class、尺寸、圆角、阴影、边框粗细、布局、标题横杠、可见文案和组件框内文字颜色都必须保留；组件框外标题/正文/辅助文字必须跟随当前页 `data-cw-variant` 的模板配方。禁止通过 `page-root { color: ... }`、`content-block { color: ... }` 或深层后代选择器把模板文字颜色继承/穿透到 `component-shell`、`interactive-root`、`media-block`、`button-skin`、`feedback-layer` 内部。
- **失败修复不得升级为重做设计**：模板不生效时，禁止输出“已深度固化/视觉重构/升级为控制台风格”并改动页面子节点；必须回到模板资产顺序、模板背景锁、`page-root` 背景冲突和覆盖表检查。
- **resourceId 不可回退**：模板替换是分批增量修改，一旦某批成功返回新 `resourceId`，后续必须沿着新 `resourceId` 继续；禁止回到旧 `resourceId` 处理“剩余页面”，否则前面成功套模板的页面会丢失。
- **发布后必须自动套模板**：首次原版 `publish_resource` 后必须立刻按 `selectedTemplateId` 进入模板后处理；禁止再次询问版面满意度。
- **模板覆盖全部页面**：一旦用户选择模板，整份课件的所有页面都必须完成模板化；二次发布前必须逐页校验 `data-cw-template` / `data-cw-variant`，缺一页都不能发布。
- **图片内容不可染色**：模板只改图片外框和容器，不改图片素材本身的颜色与滤镜。
- **交互绑定不可改名**：模板替换不得改变按钮文字颜色、反馈层文字颜色、事件目标、函数名、节点选择器和状态脚本引用。
- **最终交付两个课件版本**：完整流程必须发布两次，先发布原版互动课件，再发布模板版互动课件；两次都只发布对应版本的入口 HTML 文件，浏览器打开即可使用。

---

## 使用说明

1. 收到课件生成需求后，按 Phase 1 → 2 → 3 → 4 → 5 顺序执行，先完成原版互动课件的生成与首次发布；Phase 1 已确认的模板只记录，不参与原版生成。
2. outline-guidance.md 负责「教什么」——通过专业教研流程确定教学内容和页面规划（Phase 1）。
3. Phase 3 负责「用什么」——根据大纲准备图片、音频、题目等素材；调用 `generate_image` 前须按 `image-generation-guide.md` 做逐条命中式 prompt 增强。若是封面图，先按 `cover-layout-guide.md` 确定 `coverImageSlot`，再把槽位比例写入 prompt。
4. typography-guide.md 负责「用什么字体」——素材准备完成后、HTML 生成前由模型自主选择 1 套字体 preset，写入 `page-shared`，不询问用户（Phase 4 前置步骤）。
5. cover-layout-guide.md 负责「封面怎么排」——素材准备完成后、HTML 生成前确定第 1 页封面图角色与 7 种封面版式之一（Phase 4 前置步骤）。
6. html-guide.md 负责「怎么做 + 怎么写」——将大纲、素材、字体样式和封面版式转化为 HTML 页面，同时规范 HTML 代码的格式与样式（Phase 4）。
7. 首次发布后，必须直接读取 `template-postprocess-guide.md` 和 `templates/README.md`，按 Phase 1 的 `selectedTemplateId` 执行模板后处理（Phase 6 / Phase 7），不再询问版面满意度，也不重新选择字体。
8. 一旦进入模板后处理，默认目标是让**全部页面**都换成所选模板的视觉体系；互动页也要换模板，但只换页面背景和组件外标题/正文/辅助文字颜色、文字阴影，并继承原版字体变量，不改互动主体、组件样式和组件框内文字颜色。
9. 完整交付必须包含两个发布结果：原版互动课件与模板版互动课件。
10. 模板后处理始终遵守两条硬约束：图片素材不改色，交互绑定不改名。
