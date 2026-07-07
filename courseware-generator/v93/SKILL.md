---
name: courseware-generator
description: 生成多页 PPT 式互动课件（HTML格式）。当用户提出课件生成、教学PPT、多页演示、带缩略图与播放模式的课件等需求时使用。涵盖专业大纲生成（课标研读→教材梳理→学情分析→目标拟定→逐页设计）→ 用户确认修改 → 模板选择 → HTML分批生成（template标签页面结构、960×540画布、壳框架集成）。不适用于教学游戏、单页动画、精美排版等非互动课件场景。
---

更新时间：2026-05-20

# 互动课件生成技能

> **称谓约束（重要）**：本功能对外统一称为「**互动课件**」。在与用户沟通、回复、向用户展示的任何文字内容中，禁止使用「多页课件」「多页 PPT 课件」等旧称谓。技能文档内部出现的"多页"仅为页面数量描述，不属于产品称谓。

本技能指导 AI 完成多页 PPT 式互动课件的完整生成流程：通过专业教研流程生成高质量课件大纲 → 用户确认 → **选择视觉模板** → **基于模板骨架填槽生成 HTML**。

---

## 🚨 四条不可违反的红线（最高优先级）

### 红线 1：必须执行信息确认（Phase 1 第一步）

收到课件生成需求后，**第一个动作就是按 outline-guidance.md 的「信息确认机制」用 `ask_user` 展示 9 项字段让用户确认**（课时内容 / 年级 / 册次 / 教材版本 / 学科 / 教学重点 / 授课类型 / 课件页数范围 / 班级学情）。

- ❌ 禁止直接生成大纲、禁止跳过信息确认
- ❌ 禁止假设"用户已提供足够信息"——即使从用户输入提取到值，也必须展示让用户核实

### 红线 2：必须执行模板选择（Phase 2.5）

大纲确认后、素材准备前，**必须读取 `templates/README.md` 并调用 `ask_user` 让用户选择视觉模板**。用户选定模板 ID 后，整份课件 HTML 的「壳 / 全局 CSS / 版面骨架」全部来自模板包，AI 不再凭记忆默写。

### 红线 3：HTML 生成必须走「skeleton + multi_edit 填槽」流程（Phase 4）

**禁止从零开始凭记忆写整份 HTML，也禁止在 reasoning 里把整段 layout 替换好再注入**。当用户选了模板（`math-explorer` 等，非 `none`），AI 的工作是「**给模板填值**」，HTML 结构永远来自模板文件：

```
1) read templates/<选定模板>/skeleton.html
   ↓
2) create 课件.html
   content = 上一步 read 的字符串【原样】，只改 <title>{{COURSEWARE_TITLE}}</title>
   ↓
3) 对大纲【每一页】，逐页串行执行：
   3a) read templates/<选定模板>/layouts/<选定 layout>.html  → 拿到该版式（含 {{XXX}}）
   3b) multi_edit（一次调用包含 N+1 个 editItems）：
       第 1 个 editItem：先把 <!-- CW_PAGES --> 替换为「该 layout 字符串原样 + 新的 <!-- CW_PAGES -->」
       第 2~N+1 个 editItem：把刚注入的所有 {{XXX}} 替换为该页真值
```

**核心约束**：
- ✅ AI **只输出键值对**（每个 `{{XXX}}` 对应的真值），不输出任何 HTML 结构
- ✅ HTML 结构永远是 read 出来的字符串，由 multi_edit 工具做精确替换
- ❌ **禁止**修改 layout 内的 `class` / `<script>` / `data-*` 属性
- ❌ **禁止**省略 layout 内任何 `<div>` 块
- ❌ **禁止**在 reasoning 里把 layout 的 {{XXX}} 提前替换，再把整段当 newString 注入
- ❌ **禁止**在 page-data 内再写一份 `<style>`（样式已在 skeleton 的 page-shared 中）

当用户选了 `none`（不使用模板）：按 html-guide.md 的传统流程（自行写骨架 + 分批注入），但壳脚本 URL 仍须严格遵守 html-guide § 3.1 固定 URL。

### 红线 4：页数一致 + 禁止跳过分批注入

**总页数必须与 Phase 1 大纲完全一致**：

| ❌ 严禁 | 后果 |
|--------|------|
| 把大纲的 N 页压缩成更少的页数 | 课件内容残缺 |
| 一次 `edit_file` 注入所有页面 | Token 不足导致页面被简化 |
| 跳过 `<!-- CW_PAGES -->` 标记，把 HTML 直接写在 create_file 里 | 后续无法继续注入 |
| 把 layout 种类（8 种）当成页数上限 | 大纲 16 页就要 16 次注入（分批可合并） |

**交付前必须自检**：成品文件里 `<template class="page-data">` 的数量 = 大纲页数；不等则补足缺失页。

---

## 技能文件说明

本技能由四部分组成：

| 文件 | 用途 | 何时读取 |
|------|------|----------|
| **SKILL.md**（本文件） | 总览与导航 | 首先读取 |
| **[outline-guidance.md](outline-guidance.md)** | 大纲生成指南（信息确认→课标研读→教材梳理→学情分析→目标拟定→逐页大纲设计） | Phase 1 |
| **[templates/README.md](templates/README.md)** | 模板库索引（可选模板清单） | Phase 2.5 |
| **[html-guide.md](html-guide.md)** | HTML 生成完整指南（`<template>` 用法、960×540 画布、壳框架约束、互动状态管理、骨架/分批/验收） | Phase 4 |

---

## 工作流程

```
Phase 1: 大纲生成
  读取 outline-guidance.md → 信息确认 → 课标研读 → 教材梳理 → 学情分析
  → 目标拟定 → 逐页大纲设计 → create_lesson_design 输出大纲
     ↓
Phase 2: 大纲确认与修改循环
  ask_user 展示大纲 → 用户「确认」或「修改」
  → 修改：调整后再 create_lesson_design + ask_user
  → 确认：进入 Phase 2.5
     ↓
Phase 2.5: 模板选择【新增】
  read templates/README.md → ask_user 让用户挑模板 → 记录选定模板 ID
     ↓
Phase 3: 素材准备
  按大纲准备图片（generate_image）、音频（generate_voice）、
  题目（search_papers）、知识（search_knowledge）等
     ↓
Phase 4: HTML 课件生成【skeleton + 填槽流程】
  若选了模板：
    read template.md / skeleton.html →
    create_file 课件.html（原样复制 skeleton） →
    对每页：read 对应 layout → 替换占位符 → edit_file 注入
  若选了 none：
    按 html-guide.md 传统流程（自写骨架 + 分批注入）
     ↓
Phase 5: 验收与交付
  逐页核对大纲、自检 page-data 数量、自检无占位符残留、交付 .html
```

---

## Phase 1 详细说明：大纲生成

1. 读取 **outline-guidance.md**，按其定义的完整工作流执行
2. 该流程包含信息确认机制（9 项字段）、SOP 获取、专家推理等步骤
3. 流程结束时调用 `create_lesson_design` 输出大纲
4. **⚠️ 重要变更**：outline-guidance.md 原始流程中的 `terminate` 调用在本技能中**不执行**。`create_lesson_design` 完成后直接进入 Phase 2

---

## Phase 2 详细说明：大纲确认与修改循环

**⚠️ 前置条件：Phase 1 已成功调用 `create_lesson_design` 生成了大纲文件。**

1. 调用 `ask_user`，向用户展示大纲，单选确认字段：
   - `大纲很棒，直接开始制作`
   - `需要微调（请在下方补充意见）`
   - `allowCustomAnswer=False`
2. 用户选「需要微调」→ 根据补充意见修改 → 重新 `create_lesson_design` → 再次 `ask_user`（循环）
3. 用户选「直接开始制作」→ 进入 Phase 2.5

---

## Phase 2.5 详细说明：模板选择【新增】

**⚠️ 前置条件：Phase 2 已确认大纲。**

### 操作步骤

1. **读取 `templates/README.md`**，拿到可用模板清单
2. **结合大纲学科**给用户推荐 1 个模板（如数学课件 → 推荐 `math-explorer`）
3. **调用 `ask_user`**，把每个模板做成一个单选选项 + 保底项：
   - 例：`数学探索风（学术现代风，适合数理化）`
   - 例：`不使用模板，AI 自由发挥`
   - `allowCustomAnswer=False`
4. **记录选定模板 ID**（`math-explorer` 或 `none`），传递给 Phase 3 / Phase 4
5. 若用户选了具体模板（非 `none`）：**立即 read `templates/<选定模板>/template.md`**，了解占位符表与 layout 决策树

---

## Phase 3 详细说明：素材准备

大纲与模板确认后，根据大纲中各页的教学内容和交互设计准备素材。

### 3.1 素材准备内容

| 素材类别 | 使用工具 | 适用场景 |
|---------|---------|---------|
| 图片 | `generate_image` | 导入页情境图、知识点示意图、实验配图、课文插图等 |
| 音频 | `generate_voice` | 课文朗读、语音讲解、英语发音示范等 |
| 题目 | `search_papers` | 练习页需要的试题、测验题目等 |
| 教学素材 | `search_web` | 教学方法、教学实践案例、背景知识等 |
| 知识资源 | `search_knowledge` | 补充知识点、教学参考（**数学和语文场景推荐搜索**） |

### 3.2 素材准备规则

1. **多个素材可并行准备**
2. **图片和音频必须获取 URL，严禁 base64**
3. **记录素材清单**：URL + 页码，供 Phase 4 引用
4. **`generate_image` 的 prompt 完全自由**，不需要追加模板风格后缀（模板不约束生图画风）
5. **题目搜索**：练习页/例题页通过 `search_papers` 搜索

---

## Phase 4 详细说明：HTML 课件生成【skeleton + 填槽】

### 路径 A：选了模板（`math-explorer` 等）

**严格按以下顺序执行，不得跳步：**

```
4.0 装载模板（强制前置）
   ☐ read templates/<选定模板>/template.md   # 占位符表 + layout 决策树（如未读）
   ☐ read templates/<选定模板>/skeleton.html # 完整骨架字符串

4.1 创建骨架文件
   ☐ create 课件.html
       content = 步骤 4.0 read 的 skeleton.html【原样复制】
       仅替换 <title>{{COURSEWARE_TITLE}}</title> 中的 {{COURSEWARE_TITLE}}
   ☐ 记录 resourceId

4.2 读取 html-guide.md 与 interaction-design
   ☐ read html-guide.md
   ☐ read interaction-design 技能（互动设计参考）
   ☐ 注意：模板的 shared.css 已在 skeleton.html 中，禁止再写一份

4.3 按 html-guide § 步骤 0 做页面分类（强互动 vs 普通页）

4.4 逐页串行执行「multi_edit 注入 + 填槽」
   对大纲每一页（按 data-id 顺序，串行处理）：
     1) 按 template.md「layout 决策树」选 1 个 layout
     2) read templates/<选定模板>/layouts/<layout>.html
     3) reasoning：根据大纲准备该页所有 {{XXX}} 的真值（仅准备值，不动 HTML）
        - 文字占位符 → 大纲字段
        - 图片占位符 → Phase 3 准备的 URL
        - exercise 的 {{CA}}/{{CB}}/{{CC}}/{{CD}}：正确填 "1"、其余填 "0"
     4) multi_edit（一次调用 = 注入 + 全部占位符填值）：
        editItems:
          # 第 1 项：把 CW_PAGES 替换为 layout 原样字符串（占位符未替换）
          - oldString: "<!-- CW_PAGES -->"
            newString: "<layout 字符串原样（含 {{XXX}}）>\n\n<!-- CW_PAGES -->"
          # 第 2~N+1 项：把刚注入的占位符替换为真值
          - oldString: "{{DATA_ID}}"
            newString: "3"
          - oldString: "{{TITLE}}"
            newString: "化繁为简"
          - oldString: "{{QUESTION_TEXT}}"
            newString: "..."
          # ... 该 layout 的全部占位符
   记录新 resourceId（每次 multi_edit 后更新），进入下一页

4.5 强互动页例外
   若某页的教学需求没有命中任何 layout（如拖拽匹配、Canvas 动画、闯关游戏），
   按 html-guide § 八「强互动页」处理：自由写 HTML 但仍套 <template class="page-data">，
   使用 shared.css 的 CSS 变量。此时该页用 multi_edit 单项注入即可。

4.6 自检
   ☐ <template class="page-data"> 数量 = 大纲页数
   ☐ 没有任何 {{XXX}} 占位符残留（强互动页除外）
   ☐ 壳脚本 <script src="...HgSired..."> 仍在 </body> 前
   ☐ <!-- CW_PAGES --> 标记仍保留在尾部
```

**为什么逐页处理而不是按批合并？**
- multi_edit 的 oldString 必须在文件中唯一存在；如果一次注入两页（都含 `{{TITLE}}`），后续替换会冲突
- **逐页处理**：每页处理完后所有占位符已替换为真值，下一页注入时新的 `{{TITLE}}` 仍是唯一的

**multi_edit 的 editItems 是按顺序串行执行的**：第 1 项把 `<!-- CW_PAGES -->` 替换为含占位符的 layout 后，第 2~N+1 项才能在新文本中匹配到 `{{XXX}}`。

### 路径 B：选了 `none`（不使用模板）

按 html-guide.md 的传统流程执行：自写骨架（必须含 html-guide § 3.1 的固定壳 URL）+ 分批注入。

### 通用规则

- **使用 Phase 3 准备的素材 URL**，禁止 base64
- **`picture_gen` 的 prompt 完全自由**，不受模板约束
- 强互动页生成过程中可按需补充调用 `generate_image` / `generate_voice`

---

## Phase 5 详细说明：验收与交付

按 html-guide.md 步骤 2 的验收流程执行：

1. 逐页核对大纲与生成结果一一对应
2. 自检 page-data 数量 = 大纲页数
3. 自检无 `{{XXX}}` 占位符残留
4. 自检壳脚本 URL 正确（`HgSiredEejFXx94ofdiCZ8`）
5. 交付最终 `.html` 文件

---

## 核心原则

- **专业大纲先行**：通过教研流程确定教学内容（Phase 1）
- **用户确认闭环**：大纲与模板均需用户确认（Phase 2 / 2.5）
- **模板填槽生成**：骨架与版面来自模板文件，AI 只填占位符（Phase 4 路径 A）
- **大纲驱动生成**：HTML 严格按大纲生成，页数一致
- **壳框架驱动**：壳脚本固定 URL，禁止替换或省略
- **最终交付一个 `.html` 文件**：浏览器打开即可使用

---

## 使用说明

1. 收到课件生成需求后，按 Phase 1 → 2 → 2.5 → 3 → 4 → 5 顺序执行
2. **Phase 2.5 是新增的强制步骤**，不可跳过
3. **Phase 4 路径 A 是新流程**：模型不再凭记忆写整份 HTML，而是 read skeleton → 复制 → 填槽
4. 选了 `none` 才走传统流程（路径 B）
