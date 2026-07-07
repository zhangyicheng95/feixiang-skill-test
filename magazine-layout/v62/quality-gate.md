# 质量门禁（v62）

> 12 项硬基线自检 + 4 项 subtype 专项自检。
> `create_html_deliverable` 之前必须逐条对照、并在响应里**完整贴出**「已自检 12 项」清单。
> 任一未过停止交付、重写 HTML（不允许"绕过"或"降级声明"）。
>
> v62 升级原因：v61 实测 HTML 在打印预览中大量元素消失，根因是大模型选择性忽略了「Tailwind / 飞象代理 MathJax / 脚本顺序 / 手动切页 / print-color-adjust」5 项约束。v62 把这 5 项独立加成第 1-5 项硬自检（与原 8 项合并去重）。

---

## 1. 12 项硬基线自检（所有 subtype 通用）

| # | 检查项 | 通过条件（精确判定） | 失败动作 |
|---|---|---|---|
| 1 | **MathJax 标准 CDN** | 全文 grep `cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js` 命中 1 次；**不含** `metis-online` / `metis-misc` 字样 | 改用标准 CDN |
| 2 | **Paged.js 0.4.3 标准 CDN** | 全文 grep `unpkg.com/pagedjs@0.4.3/dist/paged.polyfill.js` 命中 1 次；MathJax `<script src>` 在 Paged.js `<script src>` **之前** | 调整脚本顺序 |
| 3 | **PagedConfig.before** | 含 `window.PagedConfig = { before: async () => { ... await window.MathJax.typesetPromise() ... } }` | 补充 PagedConfig |
| 4 | **不引 Tailwind / 飞象代理脚本** | 全文 grep `tailwind` / `metis-online` / `metis-misc` 命中 0 次 | 删除这些 `<script src>` 与 Tailwind 类（用纯 CSS 重写） |
| 5 | **不手动切页** | 全文 grep `<section class="page">` 命中 0 次；不含 `style="height: 297mm"` 等固定 A4 高度 | 改为顺序流 + Paged.js 自动分页 |
| 6 | **普通题块无 break-inside avoid** | `.question / .question-group / .question-item / .answer-area / .point-card / .section / .card / .page` 任一选择器都不能加 `break-inside: avoid` 或 `page-break-inside: avoid`；只允许 `table / figure / img / .keep-together / .kcard` 防拆 | 删除该 CSS 规则 |
| 7 | **print-color-adjust: exact** | 所有有 `background-color` 的 class 显式 `-webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;`，并在 `@media print { html, body, * { print-color-adjust: exact !important } }` 兜底 | 补充 print-color-adjust 声明 |
| 8 | **@page margin ≤ 12mm** | CSS `@page` 中 `margin` 不超过 `12mm`（如 `10mm 12mm`） | 改为 `10mm 12mm` 或更紧 |
| 9 | **题量保真** | source-package 的 `quality.questionCount` ≤ HTML 内 `.work-question / .lesson-question / .q-item` 数量；贴出实际数 vs 期望数 | 补全题目或停止交付 |
| 10 | **图片保真** | `imageLedger` 中 `role!=unknown` 的图全部出现在 HTML 中（贴出 `n/total`）；`<img src>` 全部来自 `imageLedger[i].url` 或 `dataUriLines.join('')`；学科为 math/physics/chemistry/biology/geography 时 `<img>` **不允许** AI 生成图 | 补全图片，删除 AI 图 |
| 11 | **答案/解析完整** | 若 source-package 的 `quality.answerCount > 0`，HTML 必须保留每条答案与解析（不只选项字母）；含 `.answer / .explain` 等可识别块 | 补全答案 |
| 12 | **分数选项 ≤ 2 列** | 含 `\frac / \dfrac / <img> / 长表达式` 的 `.options / .work-options` 不使用 `grid-template-columns: repeat(4, 1fr)`；改 `repeat(2, 1fr)` 或 `1fr` | 改 2 列或 1 列 |

---

## 2. 4 项 subtype 专项自检

按 subtype 增补，未列出的 subtype 仅做 12 项基线。

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
| AI 配图必须有 figcaption "AI 辅助插图" | 任何不在 imageLedger 中的图必须 `<figcaption>AI 辅助插图</figcaption>` 标注来源 |
| 不应被用作试卷 | HTML 中不允许出现 `.work-question` 或 `<table class="exam-info">` |

---

## 3. 自检写入响应模板（v62 强制）

```plain
[Agent v62 硬自检 12 项]
1. MathJax 标准 CDN ✅ cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js
2. Paged.js 0.4.3 ✅ unpkg.com/pagedjs@0.4.3，顺序：MathJax → PagedConfig → Paged.js
3. PagedConfig.before + typesetPromise ✅
4. 无 Tailwind / 飞象代理脚本 ✅ grep 无 metis-online/metis-misc/tailwind
5. 不手动切页 ✅ 顺序流 + Paged.js 自动分页
6. 普通题块无 break-inside avoid ✅ 仅 table/figure/img/.keep-together/.kcard 防拆
7. print-color-adjust exact ✅ .kcard 等 + @media print 兜底
8. @page margin ≤ 12mm ✅ 10mm 12mm
9. 题量保真 ✅ HTML 30 题 vs quality.questionCount=30
10. 图片保真 ✅ 12/12 张图全部到位（来源 imageLedger.url）；学科 math，无 AI 图
11. 答案/解析完整 ✅ 16 条答案逐条出现
12. 分数选项 ≤ 2 列 ✅ 含 \dfrac 选项使用 repeat(2, 1fr)

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
拟修复：<具体动作>
将在修复后再尝试 create_html_deliverable。
```

任一 subtype 专项未过：

- **修复后重新 create_html_deliverable**（推荐）
- **降级 subtype**（如 exam_paper 信息表缺失 → 降级为 question_set）
- **询问用户**（缺信息时）

**禁止行为**：

- 跳过自检直接交付
- 自检写"全部通过"但实际未做
- 自行降低或修改 12 项基线（这些是 v50/v62 红线）

---

## 5. v61 → v62 失败案例（警惕）

v61 实测下列违规直接导致打印预览大量元素消失。任何一项命中即视为不合格：

| v61 违规模式 | v62 检查 |
|---|---|
| `<script src="https://metis-online.fbcontent.cn/metis-misc/blER0Bn7vsa2JER9IEssf8.js"></script>` | 第 1 项检测到 metis-online 即否决 |
| `<script src="https://metis-online.fbcontent.cn/metis-misc/zgLDUdmazTYc0B4K6Cor.js"></script>`（Tailwind 代理） | 第 4 项检测到 metis-online 即否决 |
| MathJax 在 Paged.js 之后加载、缺 PagedConfig.before | 第 2、3 项检测顺序与 typesetPromise |
| `<section class="page">` 手动切页 | 第 5 项 grep 即否决 |
| `.card { background-color: var(--primary-light) }` 无 print-color-adjust | 第 7 项强制声明 |
| 数学教案调 `generate_image` 生成插图 | 第 10 项 STEM 学科严禁 AI 图 |
| 大模型主动简化题量（23 题 → 4 题） | 第 9 项 HTML 题数 ≥ quality.questionCount |
