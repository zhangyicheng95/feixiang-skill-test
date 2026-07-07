# 质量门禁（v60）

> 8 项基线自检 + 4 项 subtype 专项自检。
> `create_html_deliverable` 之前必须逐条对照、并在响应里贴出"已自检"。
> 任一未过停止交付。

---

## 1. 8 项基线自检（所有 subtype 通用）

| # | 检查项 | 通过条件 | 失败动作 |
|---|---|---|---|
| 1 | **MathJax 标准链路** | `<script src>` 包含 `cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js`，且 `PagedConfig.before` 调用了 `await window.MathJax.typesetPromise()` | 改用标准 CDN |
| 2 | **Paged.js 0.4.3** | 使用 `https://unpkg.com/pagedjs@0.4.3/dist/paged.polyfill.js`；MathJax 必须在 Paged.js 之前加载 | 调整脚本顺序 |
| 3 | **@page margin ≤ 12mm** | CSS `@page` 中 `margin` 不超过 `12mm`（如 `10mm 12mm`） | 改为 `10mm 12mm` 或更紧 |
| 4 | **普通题块无 `break-inside: avoid`** | `.question / .question-group / .question-item / .answer-area / .point-card / .section / .card / .page` 任一 CSS 选择器都不能加 `break-inside: avoid` 或 `page-break-inside: avoid`；只允许 `table / figure / img / .keep-together / .kcard` 防拆 | 删除该 CSS 规则 |
| 5 | **题量与图片无丢失** | source-package 的 `quality.questionCount` ≤ HTML 内题块数；`imageLedger` 中 `role != unknown` 的图全部出现在 HTML 中 | 补全题目/图片或停止交付 |
| 6 | **答案/解析完整** | 若 source-package 的 `quality.answerCount > 0`，HTML 必须保留每条答案与解析（不只是选项字母） | 补全答案 |
| 7 | **分数选项不用 4 列 grid** | 含 `\frac / \dfrac / <img> / 长表达式` 的 `.options/.work-options` 不使用 `grid-template-columns: repeat(4, 1fr)`；改 2 列或单列 | 改 `repeat(2, 1fr)` 或 `1fr` |
| 8 | **未用 generate_image 替学科原图** | 学科为 math/physics/chemistry/biology/geography 时，HTML 中所有 `<img>` 必须来自 source-package 的 imageLedger 或用户上传资源；杂志风 / 语文 / 英语的 AI 配图必须有 figcaption 标注 "AI 辅助插图" | 删除 AI 图，改用 imageLedger 真图 |

---

## 2. 4 项 subtype 专项自检

按 subtype 增补，未列出的 subtype 仅做基线 8 项。

### 2.1 exam_paper（试卷）

| 检查项 | 通过条件 |
|---|---|
| 含 `.exam-info` 学校/班级/姓名/学号 信息表 | 有 `<table class="exam-info">` 或等价结构 |
| 题型分组完整 | source-package 中识别到的所有题型分组（选择/填空/解答）都在 HTML 中出现 |
| 每题有题号 | `.work-question` 内必须含 `.work-qnum` 或 `data-num` |
| 答题区与题干同 DOM 父节点 | 选择题 `.option-box` 与文字必须在同一 `.option-item` 内 |

### 2.2 dictation_sheet（默写纸）

| 检查项 | 通过条件 |
|---|---|
| 不强求题量保真 | mineru 输出的词表数 ≠ HTML 题量 时不算失败（默写纸允许补充书写格） |
| 含 `.dictation-tianzige / .dictation-fourline / .dictation-line` 任一 | 至少有一种书写格元素 |
| spacious 密度 | density 必须为 `spacious`，行高 ≥ 1.55，段距 ≥ 4mm |

### 2.3 teacher_lesson_plan（教案）

| 检查项 | 通过条件 |
|---|---|
| 含 `.lesson-stage` ≥ 2 个 | source-package 中至少识别到 2 个 stage（教学目标 / 教学过程 等），HTML 中也至少有 2 个 stage 块 |
| 封面含 LESSON / 教案 标识 | `.cover-eyebrow` 含 "LESSON" 或 "教案" |
| 教师专属语义块保留 | `【问题】/【师生活动】/【设计意图】/【追问】/【新知】` 出现在原文时必须保留为可读文本（不要简化掉） |
| 信息卡 lesson-info | 含至少 2 个 lesson-info-cell（学科/年级/课时/单元 等） |

### 2.4 magazine_article（杂志风）

| 检查项 | 通过条件 |
|---|---|
| 含 `.mag-cover / .mag-title` | 必须有大幅封面 |
| 双栏正文（除非用户明确要单栏） | `.mag-body[data-cols="double"]` 或 `column-count: 2` |
| AI 配图必须有 figcaption "AI 辅助插图" | 任何 `data:image/...;base64,...` 来源不在 imageLedger 中的图必须标注来源 |
| 不应被用作试卷 | HTML 中不允许出现 `.work-question` 或 `<table class="exam-info">` |

---

## 3. 自检写入响应模板

```plain
[Agent 手工自检 8 项 + 专项]
1. MathJax 标准链路 ✅ cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js
2. Paged.js 0.4.3 ✅ 顺序：MathJax → PagedConfig → Paged.js
3. @page margin ≤ 12mm ✅ 10mm 12mm
4. 普通题块无 break-inside: avoid ✅ 仅 figure / img / .keep-together / .kcard 防拆
5. 题量/图片无丢失 ✅ 30 题、12 张图（imageLedger）全部到位
6. 答案/解析完整 ✅ 16 条答案逐条出现
7. 分数选项 ≤ 2 列 ✅ 含 \dfrac 选项使用 repeat(2, 1fr)
8. 未用 generate_image 替原图 ✅ 学科 math，所有 img 来自 imageLedger

[subtype: exam_paper 专项]
✅ 含 exam-info 信息表
✅ 题型分组：选择题 / 填空题 / 解答题 完整
✅ 每题有题号（30 题 30 个 .work-qnum）
✅ 选项 box 与文字同父节点
```

---

## 4. 失败处理

任一基线项未过：

```plain
[质检未过] 第 N 项：<具体内容>
将在修复后再尝试 create_html_deliverable。
原因：<...>
拟修复：<...>
```

任一 subtype 专项未过：可以选择：

- **修复后重新 create_html_deliverable**（推荐）
- **降级 subtype**（如 exam_paper 信息表缺失 → 降级为 question_set）
- **询问用户**（缺信息时）

**禁止行为**：

- 跳过自检直接交付
- 自检写"全部通过"但实际未做
- 修改 8 项基线（这些是 v50 红线）
