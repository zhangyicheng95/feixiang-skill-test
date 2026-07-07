---
name: courseware-generator
description: 生成多页 PPT 式互动课件（HTML格式）。当用户提出课件生成、教学PPT、多页演示、带缩略图与播放模式的课件等需求时使用。涵盖专业大纲生成（课标研读→教材梳理→学情分析→目标拟定→逐页设计）→ 用户确认修改 → HTML分批生成（template标签页面结构、960×540画布、壳框架集成）。不适用于教学游戏、单页动画、精美排版等非互动课件场景。
---

更新时间：2026-05-28

# 互动课件生成技能

> **称谓约束（重要）**：本功能对外统一称为「**互动课件**」。在与用户沟通、回复、向用户展示的任何文字内容中，禁止使用「多页课件」「多页 PPT 课件」等旧称谓，统一使用「互动课件」。技能文档内部出现的"多页"仅为页面数量描述，不属于产品称谓。

本技能指导 AI 完成多页 PPT 式互动课件的完整生成流程：先通过专业教研流程生成高质量课件大纲，经用户确认后，再将大纲转化为 HTML 互动课件。

---

## 🚨 四条不可违反的红线（最高优先级）

### 红线 1：必须执行信息确认（Phase 1 第一步）

收到课件生成需求后，**第一个动作就是按 outline-guidance.md 的「信息确认机制」用 `ask_user` 把 9 项字段展示给用户确认**（课时内容 / 年级 / 册次 / 教材版本 / 学科 / 教学重点 / 授课类型 / 课件页数范围 / 班级学情）。

- ❌ **禁止直接生成大纲、禁止跳过信息确认**
- ❌ **禁止假设"用户已提供足够信息"**——即使从用户输入中提取到值，也必须展示预填值让用户核实
- 例外：仅在用户的二次/后续输入触发"修改大纲"等场景时跳过；首次输入**永远先做信息确认**

### 红线 2：模板选择是强制门禁，未完成选择禁止进入后续生成

当 Phase 2 用户确认大纲后，**下一个动作必须是模板选择 `ask_user`**。不能跳过，不能默认，不能一边生成一边再补问。

| ❌ 严禁 | 后果 |
|--------|------|
| 大纲确认后直接进入素材准备 / HTML 生成 | 用户没有真正选择风格，模型会按默认思路滑过去 |
| 不调用 `ask_user`，自行假设用户想要哪套模板 | 风格不可控，且无法保证符合模板契约 |
| 保留 `不使用模板，AI 自由发挥` 之类的保底选项 | 模型容易走回自由生成老路径，继续绕开模板体系 |
| 在未记录模板 ID 和模板路径前调用 `generate_image` / `create_file` / `edit_file` | 后续页面结构和视觉规范都会失去锚点 |

**强制执行顺序**：

```
Phase 2 用户确认大纲
  ↓
Phase 3 模板选择 ask_user（必须完成）
  ↓
记录 selectedTemplateId + selectedTemplatePath
  ↓
Phase 4 设计契约编译 + 页面分型 + 素材准备 + 空课件框架搭建
```

**硬闸门要求**：
- ✅ Phase 3 必须用 `ask_user` 做**单选**
- ✅ 只允许展示当前模板库里的真实模板选项
- ✅ 用户未完成模板选择前，禁止进入 Phase 4 / Phase 5 / Phase 6
- ✅ 若上下文中不存在 `selectedTemplateId` 和 `selectedTemplatePath`，AI 必须立即回到模板选择，而不是继续生成

### 红线 3：选定模板后，必须先编译“壳兼容设计契约”，再生成整份课件

当 Phase 3 用户选定了某个模板（如 `retro-zine`）后，**下一个关键动作不是直接生成 HTML，而是先读取 `templates/design-contract-workflow.md`，把模板原文件编译成一份壳兼容设计契约**。

**核心原因**：

- 模板原文件太长，反复读取会吃掉 token，导致内容被压缩
- 模型每页都重新理解模板，会出现风格漂移
- 互动课件运行在飞象壳内，若不先做壳兼容约束，模板极易与壳或互动协议冲突

| 必做动作 | 在哪做 | 不做的后果 |
|---------|-------|-----------|
| 读取 `templates/design-contract-workflow.md`，先编译 `designContractSummary` / `shellCompatibilityChecklist` / `pageTypeMap` / `layoutMap` | Phase 4 开始时 | 后续页面仍会一边读模板一边即兴生成，风格漂移且 token 过长 |
| 把 `templates/<模板路径>/shared.css` **完整复制**到课件 HTML 的 `<template class="page-shared"><style>` 中 | Phase 4 创建骨架时 | 整份课件用不上模板字体/配色变量，视觉上像没装模板 |
| 静态展示页按契约优先使用 `templates/<模板路径>/layouts/`；交互页一律使用 v69 原生互动结构并继承模板背景壳 | Phase 4 / Phase 5 | 模板误伤互动，或内页风格回到默认课件样式 |
| 颜色 / 字体 全部走 CSS 变量（`var(--c-primary)` / `var(--ff-title)` 等）禁止硬编码 | 每页生成时 | 配色字体飘忽不统一 |
| 骨架末尾必须引用**壳框架 JS**（见 html-guide.md §3.1 固定 URL），禁止用其他 CDN 脚本替代 | Phase 4 创建骨架时 | 缩略图/全屏演示/翻页全部失效 |

**设计契约的工作边界**：

```
┌─ 设计契约【管】的事 ───────────────────────────────┐
│  • 模板视觉 token（颜色 / 字体 / 间距 / 装饰语义）   │
│  • 静态页 layout 选型                                 │
│  • 交互页的背景壳 / 标题区 / 弱装饰                   │
│  • 壳兼容约束（safe area / 禁止 fixed / 禁止自定义翻页）│
└──────────────────────────────────────────────────┘
┌─ 设计契约【不管】的事 ─────────────────────────────┐
│  • generate_image 的画风（AI 完全自由生图）           │
│  • 飞象壳框架 JS 的实现                               │
│  • 飞象原生互动组件的 DOM / 事件 / 状态协议           │
└──────────────────────────────────────────────────┘
```

**AI 的微调自由度**：
- ✅ 调整 layout 内元素的位置、大小、间距
- ✅ 增减 layout 内元素（如 concept.html 的 3 卡 → 2 卡或 4 卡）
- ✅ 缩放 generate_image 生成的图片以避免覆盖文字
- ✅ 调整文字字号以适应内容长短
- ✅ 把图片移到画面空余位置
- ✅ 根据壳兼容检查结果减弱装饰或改用 `native-interaction`

**强互动页与设计契约的关系**：
- ✅ 强互动页（拖拽/Canvas/游戏化）**不受 layout 严格约束**
- ✅ 强互动页只需要：使用设计契约规定的 CSS 变量配色 + 背景壳 + 标题区
- ✅ 主交互区域继续使用 v69 原生互动结构，不强制套现成 layout
- ✅ 即使模板提供 `exercise.html`，也只把它当视觉参考，不作为生产互动页骨架
- 📌 **不要因为遵守模板而简化强互动设计**——契约只管视觉风格和壳兼容，互动复杂度仍按 html-guide.md § 8.4 要求执行

### 🚨 红线 4：页数一致 + 禁止跳过分批注入（极致命）

**v69 SKILL § 9.6 明确要求"页数一致：总页数必须与 Phase 1 规划完全一致，不得多页、少页、合并或拆页"。AI 经常违反这条，必须强制遵守：**

| ❌ 严禁 | 后果 |
|--------|------|
| 把大纲的 N 页（如 12 页）压缩成更少的页数（如 5 页）| 课件内容残缺 |
| 直接在 `create_file` 时塞入完整 HTML（不留 `<!-- CW_PAGES -->` 标记）| 跳过分批注入流程 |
| 跳过 `edit_file` 多次注入 → 一次性输出所有页 | AI Token 不够，导致每页都被简化 |
| 选了模板就把页数与 layout 种类对齐（layout 有 8 种 → 只生成 8 页）| 误把"版式数量"当成"页数上限" |

**正确流程（必须严格执行）**：

```
1. create_file → 创建只含骨架的 HTML（含 <!-- CW_PAGES --> 标记）
   → 记录 resourceId_A
2. edit_file（resourceId_A）→ 注入第 1 批普通页（如 1-5 页）
   → 得到 resourceId_B
3. edit_file（resourceId_B）→ 注入第 2 批（如 6-10 页 或 强互动页独占）
   → 得到 resourceId_C
4. ...继续直到所有大纲页面都注入
5. 最终页数 = 大纲页数（如 12）
```

**当模板装载耗费上下文较多时，AI 不允许"自我降级"**——即使第一次 `create_file` 失败，**也必须重新走骨架 + 分批流程**，不能改成"一次性塞入完整 HTML"。

**判定标准**：交付前自检 `<template class="page-data">` 数量 = 大纲规划页数；不等的话**强制重新生成补足缺失页**。

**AI 必须保证（排版底线）**：
- ❌ **元素不能重叠**（图片不能盖文字、装饰不能盖正文）
- ❌ **内容不能溢出** 960×540 画布
- ❌ **不能修改** 配色变量、字体变量、关键 class 名

**关于 generate_image 生成的图片**：
- ✅ AI 调用 `generate_image` 时 prompt 完全自由，画风不受模板约束
- ✅ 生成的图片以 `<img>` 元素放在 layout 的图片占位区（如 `.image-slot`、`.it-image-slot`、`.fm-side-img`）
- ✅ 必须用 `object-fit:contain` 或限制尺寸避免溢出
- ❌ **不要**把 generate_image 的图作为整页背景
- ❌ **不要**在 `<head>` 里放 metis-lectio / anime 等脚本替代壳框架

**关于交互页**：
- ✅ 交互页必须保留 v69 原生互动组件的完整 `<script>` / `saveState` / `restoreState`
- ✅ 模板只能提供背景壳 helper class，不能替换原生互动组件骨架
- ❌ 禁止为了贴模板，重包 DOM 结构导致点击、拖拽、反馈或状态恢复失效

---

## 技能文件说明

本技能由四个文件 + 一个模板库目录组成，请按流程顺序读取：

| 文件 | 用途 | 何时读取 |
|------|------|----------|
| **SKILL.md**（本文件） | 总览与导航，说明整体流程和文件职责 | 首先读取 |
| **[outline-guidance.md](outline-guidance.md)** | 课件**大纲**生成指南：信息确认→课标研读→教材梳理→学情分析→目标拟定→逐页大纲设计 | Phase 1 执行，生成专业教学大纲 |
| **[templates/README.md](templates/README.md)** | 课件**模板库索引**：列出当前可选模板（复古印刷风、像素霓虹风等），说明模板目录结构与装载流程 | Phase 3 执行，向用户呈现可选模板 |
| **[templates/design-contract-workflow.md](templates/design-contract-workflow.md)** | 模板**设计契约编译指南**：把所选模板压缩成一份壳兼容设计契约，输出 `designContractSummary / shellCompatibilityChecklist / pageTypeMap / layoutMap` | Phase 4 执行，先做契约后做骨架 |
| **[html-guide.md](html-guide.md)** | 课件**HTML生成**完整指南：`<template>` 标签用法、960×540 画布规则、壳框架约束、互动状态管理、复杂度评估、骨架创建→分批生成页面→验收交付，以及**按设计契约生成的硬性规则** | Phase 5 执行，将大纲转化为 HTML |

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
Phase 3: 模板选择（强制门禁）
  读取 templates/README.md → 列出所有可用模板
  调用 ask_user 让用户从模板库中单选一种风格模板
  → 记录用户选定的模板 ID 和模板路径，传递给 Phase 4 和 Phase 5
     ↓
Phase 4: 设计契约编译 + 页面分型 + 素材准备 + 空课件框架搭建
  读取 templates/design-contract-workflow.md
  读取所选模板的 template.md / tokens.json / shared.css / layouts
  先编译一份壳兼容设计契约，再给每页做分型与 layout 选型
  然后准备素材（generate_image / generate_voice / search_knowledge ...）
  最后根据 designContractSummary + pageTypeMap 搭出含壳、page-shared、全部 page-data 的空课件框架
     ↓
Phase 5: HTML 内容填充
  读取 html-guide.md → 基于已确认的大纲、素材和 Phase 4 产出的设计契约：
  只向 Phase 4 已搭好的 page-data 占位符中填内容，并根据图片/互动做少量版面微调
     ↓
Phase 6: 验收与交付
  逐页核对大纲、按模板规范自检 → 交付最终 .html 文件
```

---

## Phase 1 详细说明：大纲生成

1. 读取 **outline-guidance.md**，按其定义的完整工作流执行。
2. **【必做，对应红线 1】Phase 1 的第一个 tool_call 必须是信息确认机制**：用 `ask_user` 把 9 项字段（课时内容 / 年级 / 册次 / 教材版本 / 学科 / 教学重点 / 授课类型 / 课件页数范围 / 班级学情）预填后展示给用户确认。即使用户首次输入已经提供了部分字段（例如"做一份鸡兔同笼的课件"），仍然必须用 `ask_user` 走完确认表单。详见 outline-guidance.md「信息确认机制」§ ②。
3. 信息确认通过后，按 outline-guidance.md 继续执行：SOP 获取（`insert_courseware_design_sop`）→ 课标研读 → 教材梳理 → 学情分析 → 目标拟定 → 逐页课件大纲设计 → 调用 `create_lesson_design` 输出大纲。
4. **⚠️ 重要变更**：outline-guidance.md 原始流程中的 `terminate` 调用在本技能中**不执行**。`create_lesson_design` 完成后，直接进入 Phase 2，不终止任务。

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
   - 结束循环，进入 Phase 3 模板选择

```
create_lesson_design → ask_user → 有修改？
                                        ├─ 需要微调 → 修改大纲 → create_lesson_design → ask_user（循环）
                                        └─ 直接开始制作 → 进入 Phase 3
```

---

## Phase 3 详细说明：模板选择（强制门禁）

**⚠️ 前置条件**：Phase 2 已经获得用户对大纲的确认。

模板选择决定了课件的整体视觉风格（配色、字体、版式、装饰），**不约束生图画风**。本阶段必须严格按下面流程执行，而且**这是进入后续生成阶段前的硬闸门**：

### 3.1 读取模板索引

读取 `templates/README.md`，了解当前所有可用模板（每个模板的 ID、名称、风格关键词、适合题材）。

### 3.2 用 `ask_user` 让用户选择模板

调用 `ask_user`，提供**单选**字段，选项构成规则：
- 把 `templates/README.md` 表格里的每个模板做成一个选项，标签为"中文名（风格关键词 / 适合题材）"
- 设置 `allowCustomAnswer=False`
- **禁止**追加"不使用模板，AI 自由发挥"、"默认风格"、"稍后再选"之类的保底项
- **禁止**让用户跳过选择

示例选项（具体内容随 templates/README.md 动态变化）：
- `复古印刷风（纸张拼贴风，适合语文/英语/综合实践）`
- `像素霓虹风（电玩科技风，适合信息科技/互动练习）`

> **可选优化**：如果大纲题材明显适合某个模板（例如综合实践 / 人文主题 + 复古印刷风，或信息科技 / 课堂竞赛 + 像素霓虹风），可在 `ask_user` 的提示语里给出推荐建议，但最终选择权交给用户。

**⚠️ 强制要求**：
- Phase 2 用户一旦确认大纲，**下一个 tool_call 必须是这个模板选择 `ask_user`**
- 在模板选择完成之前，**禁止**调用 `generate_image`、`generate_voice`、`search_web`、`create_file`、`edit_file`
- 如果对话上下文里没有 `selectedTemplateId` / `selectedTemplatePath`，说明 Phase 3 未完成，AI 必须立刻回到模板选择

### 3.3 记录用户选择

把用户选择的**模板 ID**（如 `retro-zine`）保留到上下文中，传递给 Phase 4 和 Phase 5。

同时必须记录该模板在 `templates/README.md` 表格中对应的**实际目录路径**（如 `retro-zine` → `templates/复古印刷风/`，`8-bit-orbit` → `templates/像素霓虹风/`）。Phase 4 / Phase 5 读取文件时一律使用这个目录路径，**不要直接把模板 ID 当作文件夹名**。

### 3.4 进入 Phase 4

- 模板选择完成后，进入 Phase 4 的第一个动作必须是读取 `templates/design-contract-workflow.md`
- 再读取该模板在 `templates/README.md` 中对应路径下的 `template.md / tokens.json / shared.css / layouts`
- 先把这些原始模板文件编译成一份**壳兼容设计契约**，后续生成优先依赖契约，不再按页重复通读模板原文件

---

## Phase 4 详细说明：设计契约编译 + 页面分型 + 素材准备 + 空课件框架搭建

大纲确认且模板选择完成后、HTML 生成前，**必须先把所选模板编译成一份壳兼容设计契约**。只有在契约完成后，才能继续准备素材和搭空课件框架。这样做是为了避免模型在 Phase 5 继续反复读模板原文件，造成 token 过长、风格漂移或与壳冲突。

### 4.1 先编译壳兼容设计契约（Phase 4 第一步）

执行顺序：

```
1. 读取 templates/design-contract-workflow.md
2. 读取所选模板的 template.md / tokens.json / shared.css / layouts
3. 先生成 shellCompatibilityChecklist
4. 再生成 designContractSummary
5. 再生成 pageTypeMap（静态页 / 轻互动页 / 强互动页）
6. 再生成 layoutMap（第 N 页用哪个 layout 或 native-interaction）
```

**Phase 4 必须产出下列契约字段**：

| 字段 | 说明 |
|------|------|
| `designContractId` | 当前课件唯一契约标识，例如 `retro-zine-shell-v1` |
| `designContractSummary` | 模板精简执行摘要，供 Phase 5 直接使用 |
| `shellCompatibilityChecklist` | 壳兼容清单，后续每页都要遵守 |
| `pageTypeMap` | 第 N 页属于静态页 / 轻互动页 / 强互动页 |
| `layoutMap` | 第 N 页对应的 layout 或 `native-interaction` |
| `forbiddenRules` | 当前课件绝对不能出现的做法 |

**壳兼容底线**：

- 禁止自定义翻页、全屏、缩略图、主预览器
- 禁止在 `html` / `body` / 根容器上使用 `100vh`、`position:fixed`、整体 `transform/zoom`
- 禁止让模板装饰层压住互动操作层
- 禁止让模板修改 v69 原生互动组件协议

### 4.2 素材准备内容

遍历已确认大纲的逐页设计表格，按以下类别识别并准备素材：

| 素材类别 | 使用工具 | 适用场景 |
|---------|---------|---------|
| 图片 | `generate_image` | 导入页情境图、知识点示意图、实验配图、课文插图等 |
| 音频 | `generate_voice` | 课文朗读、语音讲解、英语发音示范等 |
| 题目 | `search_papers` | 练习页需要的试题、测验题目等 |
| 教学素材 | `search_web` | 教学方法、教学实践案例、背景知识等 |
| 知识资源 | `search_knowledge` | 补充知识点、教学参考（**数学和语文场景推荐搜索**） |

### 4.3 素材准备规则

1. **多个素材可并行准备**：图片生成、语音生成、知识搜索、题目搜索之间无依赖关系，可在同一轮中并行调用，提升效率。

2. **【关键】图片和 generate_voice 生成的音频必须获取 URL，严禁使用 base64 编码**（Web Audio API 通过代码生成音效不涉及此问题）。

3. **记录素材清单**：每个生成/检索到的素材记录其 URL（或内容）和对应的页码，形成素材清单，供 Phase 5 生成 HTML 时引用。

4. **素材与大纲对应**：只准备大纲中明确需要的素材，不多生成无关素材。

5. **题目搜索**：大纲中标注为练习页/例题页的页面，通过 `search_papers` 搜索合适的题目；通过 `search_web` 搜索教学方法和教学实践等前置知识。

6. **【重要】图片生成完全自由，不受模板约束**：
   - `picture_gen` 的 prompt 由 AI 根据**题目实际内容**自由编写
   - 例如："鸡兔同笼" → 直接画鸡和兔；"光合作用" → 直接画叶子和光
   - **禁止**为了"匹配模板风格"在 prompt 里加抽象画风后缀，避免插图变成纯装饰而失去题目表达力
   - 模板风格只通过 HTML/CSS 体现（配色、字体、版面），与生图无关

### 4.4 先搭空课件框架（Phase 4 必做）

**目标**：在模型正式写每页内容之前，先把互动课件的稳定框架搭好，避免 Phase 5 再反复读模板、重写壳和 page-data 导致出错。

执行顺序：

```
1. 先读取 pageTypeMap，再做 layoutMap 落地
   - A 类：静态展示页（封面、导入、概念讲解、例题拆解、总结）→ 可以使用模板 layouts
   - B / C 类：轻互动页、强互动页 → 一律使用 v69 原生互动结构
   - 先读取当前模板目录下实际存在的 layouts，再只给 A 类页面做匹配
   - 第 1 页封面 → 优先 cover.html
   - 情境导入 / 生活实例 → 若模板提供则用 intro.html
   - 概念讲解 / 要点并列 → 优先 concept.html
   - 公式呈现 / 例题讲解 / 方法对比 → 只有模板提供对应 layout 时才使用
   - 课堂小结 / 末页 → 优先 summary.html
   - B / C 类交互页不要直接套 template layout（即使模板提供 exercise.html 也只作视觉参考）
   - 若模板缺少所需静态 layout：使用 v69 标准结构，但必须套模板变量、背景层、标题区和基础装饰
   - B / C 类交互页只允许模板接管背景壳，不允许模板改写互动组件 DOM / script / 状态协议

2. 创建课件外层 HTML 骨架
   - 正确壳脚本（HgSired）固定写在所有 template 之后、</body> 之前
   - <template class="page-shared"><style> 内完整写入 shared.css
   - 保留唯一注入标记 <!-- CW_PAGES -->

3. 逐页注入「空 page-data」
   - A 类静态页：复制对应 layout 的完整 <template class="page-data"> 块
   - B 类交互页：创建“模板背景壳 + v69 原生互动组件”的空 page-data
   - 必须写死 data-id="页码"、data-name="页面名"
   - A 类静态页必须保留 layout 中所有 class / data-* / script
   - B 类交互页必须保留 v69 原生互动组件的 DOM / class / data-* / script，不允许被模板卡片重新包裹
   - 将 layout 或原生组件中的原始占位符改为【带页码前缀】的占位符：
     例：{{title}} → {{P3_TITLE}}
     例：{{question_text}} → {{P6_QUESTION_TEXT}}
     例：{{image_url}} → {{P2_IMG_URL}}
   - 每页占位符必须唯一，禁止跨页复用 {{title}} 这种通用占位符

4. 输出「占位符填充清单」
   - 每页列出所有占位符及其来源
   - 图片 / 音频 / 题目素材必须绑定到具体占位符
   - 若某页需要版面微调，使用预留占位符（如 {{P2_IMAGE_STYLE}} / {{P6_OPTION_GRID_CLASS}}）记录，禁止改 class 结构
   - 若某页是 B / C 类交互页，必须在清单里标注「native-interaction」以及所使用的背景壳类名（如 `rz-native-shell` / `bo-native-shell`）
   - 若某页因模板缺少对应静态 layout 而回退到 v69 标准结构，也必须在清单里标注「回退原因 + 继承的模板视觉变量」
```

**Phase 4 产物必须包含**：

| 产物 | 说明 |
|------|------|
| 空课件 HTML resourceId | 已含壳、page-shared、全部 page-data、唯一 `<!-- CW_PAGES -->` |
| 设计契约摘要 | `designContractSummary + shellCompatibilityChecklist` |
| 页面分型表 | 第 N 页 → 静态页 / 轻互动页 / 强互动页 |
| 页面 layout 映射表 | 第 N 页 → 使用哪个 layout |
| 占位符填充清单 | `{{P1_TITLE}} = ...`、`{{P2_IMG_URL}} = ...` |
| 素材绑定表 | 每个图片/音频/题目 URL 绑定到哪个页、哪个占位符 |

**禁止**：
- ❌ Phase 4 只准备素材、不搭空框架
- ❌ Phase 4 跳过设计契约，直接把模板原文件硬塞进后续生成
- ❌ 在 Phase 5 再重新决定每页 layout
- ❌ 在 Phase 5 再重写 page-data 外壳、data-id、class、script
- ❌ 使用通用占位符（如 `{{TITLE}}`、`{{QUESTION_TEXT}}`）横跨多页

---

## Phase 5 详细说明：HTML 内容填充

### Phase 5.0 装载设计契约（必须先于任何页面填充动作完成）

**⚠️ 这是 Phase 5 的强制前置步骤。如果你跳过本步骤直接开始写 HTML，整份课件会退回“边读模板边即兴生成”的旧路径，违反红线 3。**

**若 Phase 4 已按模板搭好空课件框架**，Phase 5 不再重新创建骨架、不再重新复制 shared.css、不再重新决定每页 layout。Phase 5 只读取 Phase 4 产出的「设计契约摘要 + 空课件 HTML resourceId + 占位符填充清单 + 素材绑定表」，然后把内容填入对应占位符。

执行下方动作，每个动作都必须完成，缺一不可：

```
☐ 动作 1：确认 Phase 4 已输出空课件 HTML resourceId
         （若没有，必须回到 Phase 4 先搭空框架，禁止在 Phase 5 临时重建）

☐ 动作 2：读取 Phase 4 的 designContractSummary + shellCompatibilityChecklist
         （后续生成优先依赖契约，不再按页重复通读模板原文件）

☐ 动作 3：读取 Phase 4 的占位符填充清单
         （每个占位符都应带页码前缀，如 {{P6_QUESTION_TEXT}}）

☐ 动作 4：使用 edit_file / multi_edit 替换占位符
         （只替换 {{P*_...}}，禁止改 template / class / script / data-id）

☐ 动作 5：根据图片、互动情况替换少量版面微调占位符
         例：{{P2_IMAGE_STYLE}}、{{P6_OPTION_GRID_CLASS}}
         （禁止直接改 layout class 结构）
```

### Phase 5.1 读取 html-guide.md 与 interaction-design

1. 读取 **html-guide.md**。
2. 读取 **interaction-design** 技能，获取动画与交互的设计参考（缓动、时长、交互模式、代码模板）。
3. 把 interaction-design 中的共享 CSS 变量（缓动函数等）也写入 `<template class="page-shared">` 的 `<style>` 中。
   - 若 Phase 4 已经把模板的 shared.css 写进去，则**追加** interaction-design 的变量到同一个 `<style>` 块下面，二者并存。

### Phase 5.2 填充空课件框架

从 html-guide.md 的**步骤 0（页面分类）**开始执行，但如果 Phase 4 已搭好模板空框架，则本阶段不再重建 page-data，只做内容填充：
- 普通模板页：根据 Phase 4 的占位符填充清单，替换对应 `{{P*_...}}`
- 原生互动页：只替换题干、选项、答案标记、反馈文案、资源 URL 和少量舞台占位符，**禁止改 v69 原生互动组件的 DOM / script / data-* 协议**
- 图片页：只替换图片 URL、caption、预留 style/class 占位符
- 强互动页：若 Phase 4 已生成强互动空容器，则只填入互动内容；若必须补写强互动代码，仍须保留外层 page-data、data-id、原生互动协议与模板背景壳

**由于 Phase 3 已强制完成模板选择（红线 3）**：

**操作方式**：
1. 使用 Phase 4 的空课件 HTML resourceId 作为修改目标
2. 使用 Phase 4 的 designContractSummary 与占位符填充清单作为唯一内容来源
3. 按页或按批调用 `edit_file` / `multi_edit` 替换占位符
4. 每次只替换 `{{P*_...}}` 和预留微调占位符，禁止替换整段 page-data
5. 占位符替换完成后，若出现图片遮挡/内容溢出，只能通过预留微调占位符调整尺寸、行高、卡片数量等，禁止重写 layout 结构
6. 对 B / C 类交互页，只允许修改模板背景壳的标题、背景、弱装饰，不允许把互动组件重新塞进模板卡片阵列或复杂分栏
7. 除非契约缺字段，否则不要重新读取完整模板原文件

**自检**：每生成一页都问自己：
- 这一页的 `data-id` 是否仍存在且正确？
- 这一页是否仍保留原 layout 或原生互动组件的关键 class 和 script？
- 这一页是否已经没有 `{{P*_...}}` 占位符残留？
- 这一页是否没有 LaTeX 公式语法？
- 如果是交互页，模板是否只作用于背景壳，而没有改动互动组件协议？

### Phase 5.3 注入素材

使用 Phase 4 中准备的素材 URL：生成 HTML 时，将图片和音频的 URL 填入 Phase 4 预留的素材占位符，不要自行创建 base64 内容。**强互动页在生成过程中可按需调用 `generate_image`、`generate_voice` 补充素材**，`picture_gen` 的 prompt 完全自由，不需要追加任何模板风格后缀。

---

## Phase 6 详细说明：验收与交付

按 html-guide.md 步骤 2 的验收流程执行：逐页核对大纲 → **若选定了模板，按模板规范自检（详见 html-guide.md "关于模板的硬性规则" § 自检 checklist）** → 交付最终 `.html` 文件。

---

## 核心原则

- **专业大纲先行**：通过课标研读、教材分析、学情分析等专业教研流程生成大纲，而非简单规划。
- **用户确认闭环**：大纲生成后必须经用户确认，确保课件内容符合教学需求。
- **风格用户可控**：用户在 Phase 3 必须选择模板，决定课件视觉风格。
- **设计契约先行**：Phase 4 先把模板编译成壳兼容设计契约，Phase 5 只按契约填页，不再边读模板边即兴生成。
- **大纲驱动生成**：HTML 课件严格按照已确认的大纲生成，不得偏离大纲内容。
- **模板约束视觉**：若选定模板，颜色/字体/版式由设计契约决定，AI 不自由发挥配色；但交互页只继承模板背景壳，互动组件本体仍走 v69 原生协议；`generate_image` 的画风仍由题目内容自由决定。
- **壳兼容优先**：任何模板规则一旦与飞象壳冲突，必须优先服从壳兼容检查项。
- **分批生成**：按复杂度权重分批生成页面，保证生成质量。
- **壳框架驱动**：AI 只负责编写 `<template>` 内的教学内容，壳功能由云端 JS 提供，禁止手写壳代码。
- **最终交付一个 `.html` 文件**：浏览器打开即可使用。

---

## 使用说明

1. 收到课件生成需求后，按 Phase 1 → 2 → 3 → 4 → 5 → 6 顺序执行。
2. outline-guidance.md 负责「教什么」——通过专业教研流程确定教学内容和页面规划（Phase 1）。
3. templates/README.md 负责「长什么样」——列出可用模板供用户在 Phase 3 选择。
4. templates/design-contract-workflow.md 负责「先定契约」——把模板压缩成壳兼容设计契约，先解决模板、互动、壳三者的边界问题（Phase 4）。
5. Phase 4 还负责「用什么」——根据大纲准备图片、音频、题目等素材。**图片生成完全自由**，由 AI 根据题目内容自由编写 prompt，不受模板约束。
6. html-guide.md 负责「怎么做 + 怎么写」——将大纲和素材转化为 HTML 页面，同时规范 HTML 代码的格式与样式，并强制遵守已选设计契约（Phase 5）。
