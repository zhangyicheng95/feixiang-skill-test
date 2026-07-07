# 质量门禁（v63·防撒谎模式）

> 14 项硬基线自检 + 4 项 subtype 专项自检。
> `create_html_deliverable` 之前必须**逐条对照、列出实际计数、在响应里完整贴出**。
> 任一未过 → 停止交付、重写 HTML（**不允许**绕过、降级声明、含糊词）。
>
> v63 升级原因：v62 实测大模型在自检时**撒谎**（HTML 14 题、自检写"27 题 vs 27 ✅"）。v63 把"自我报告 ✅" 模式改成"模型必须列出 grep / 实际计数对照"模式，杜绝撒谎。

---

## 1. 14 项硬基线自检（所有 subtype 通用）

每项**必须列出实际证据**（grep 命中数 / 实际计数 / 实际字符串），不能只写「✅ 已通过」。

| # | 检查项 | 通过条件 + 必须列出的证据 | 反撒谎红线 |
|---|---|---|---|
| 1 | **MathJax 标准 CDN** | 写 grep 结果："`cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js` 命中 1 次" | 不能只写 ✅ |
| 2 | **Paged.js 标准 CDN** | "`unpkg.com/pagedjs@0.4.3` 命中 1 次"；列 MathJax/Paged.js 各自的 `<script src>` 行号，前者 < 后者 | 同上 |
| 3 | **PagedConfig.before + typesetPromise** | "grep `PagedConfig` 命中 1，grep `typesetPromise` 命中 1" | 同上 |
| 4 | **无 Tailwind / 飞象代理** | "grep `tailwind\|metis-online\|metis-misc` 命中 0" | 同上 |
| 5 | **不手动切页** | "grep `<section class=\"page\">\|<section class='page'>` 命中 0；grep `height:\s*297mm` 命中 0" | 同上 |
| 6 | **顶层容器无固定宽度**（v63 新） | "grep `body\|main\|container.*max-width:\s*\d+(px\|mm)` 命中 0（除 100%/none/auto）" | 必须列实际 grep 结果 |
| 7 | **普通题块无 break-inside avoid** | "grep `\(question\|section\|card\|page\|point-card\|question-group\|question-item\|answer-area\).*break-inside:\s*avoid` 命中 0" | 同上 |
| 8 | **print-color-adjust: exact** | "grep `-webkit-print-color-adjust:\s*exact` 命中 ≥ 1；`@media print` 块内含 `\(\\*\|html\|body\)` 全局设置" | 同上 |
| 9 | **@page margin ≤ 12mm** | 列 `@page` 内 `margin` 实际值 | 必须列字符串 |
| 10 | **题量保真**（必须计数对照） | "**HTML 实际**：grep 题块（`<div class=\"...question\\|q-item\\|work-question\"\|^<li>` 任一）= **N1**；**源**：quality.questionCount = **N2**；**N1 ≥ N2**（必须列两个具体数字）" | 严禁含糊词如「完整保留 ✅」 |
| 11 | **图片保真**（必须计数对照） | "**HTML 实际**：grep `<img\\s` = **M1**；**源**：imageLedger 中 role!=unknown 个数 = **M2**；**M1 ≥ M2**" | 同上 |
| 12 | **答案保真**（必须计数对照） | "**HTML 实际**：grep 答案块（`answer-tag\|answer-section\|参考答案\|【答案】`）实数 = **K1**；**源**：quality.answerCount = **K2**；**K1 ≥ K2** 或 **K2 = 0**" | 同上 |
| 13 | **分数选项 ≤ 2 列** | "grep `\.options.*repeat\\(4\|grid-template-columns:\s*repeat\\(4` 命中 0（短文本/纯数字 ≤ 3 位选项例外）" | 同上 |
| 14 | **打印按钮 + 一致性**（v63 新） | "grep `class=\"no-print\".*window.print()` 命中 1；grep `box-shadow\|linear-gradient\|filter:\|background-image:\s*url\|position:\s*fixed` 命中 0（除 `.no-print` 内）" | 同上 |

---

## 2. 4 项 subtype 专项自检

按 subtype 增补，未列出的 subtype 仅做 14 项基线。

### 2.1 exam_paper（试卷）

| 检查项 | 通过条件 |
|---|---|
| 含 `.exam-info` 学校/班级/姓名/学号 信息表 | 有 `<table class="exam-info">` 或等价结构 |
| 题型分组完整 | source-package 中识别到的所有题型分组（选择/填空/解答）都在 HTML 中出现 |
| 每题有题号 | `.question / .work-question` 内含 `.work-qnum` 或题号文本（如 "1." / "2."） |
| 答题区与题干同 DOM 父节点 | 选择题 `.option-box` 与文字必须在同一 `.option-item` 内 |

### 2.2 dictation_sheet（默写纸）

| 检查项 | 通过条件 |
|---|---|
| 不强求题量保真 | 默写纸允许补充书写格 |
| 含 `.dictation-tianzige / .dictation-fourline / .dictation-line` 任一 | 至少有一种书写格元素 |
| spacious 密度 | density 必须为 `spacious`，行高 ≥ 1.55，段距 ≥ 4mm |

### 2.3 teacher_lesson_plan（教案）

| 检查项 | 通过条件 |
|---|---|
| 含 ≥ 2 个教学环节区块 | source-package 中至少识别到 2 个 stage（教学目标/教学过程 等），HTML 中也至少有 2 个对应区块 |
| 教师专属语义块保留 | `【问题】/【师生活动】/【设计意图】/【追问】/【新知】` 出现在原文时必须保留为可读文本，不能简化掉 |
| 信息卡（学科/年级/课时） | 含 ≥ 2 个信息项 |

### 2.4 magazine_article（杂志风）

| 检查项 | 通过条件 |
|---|---|
| 含封面或大标题区 | 有 `<header>` / `<.cover>` / `<h1>` 引出主标题 |
| AI 配图必须有 figcaption "AI 辅助插图" | 任何不在 imageLedger 中的图必须 `<figcaption>AI 辅助插图</figcaption>` |
| 不应被用作试卷 | HTML 中不允许出现 `.work-question` 或 `<table class="exam-info">` |

---

## 3. 自检写入响应模板（v63 强制·完整粘贴）

```plain
[Agent v63 硬自检 14 项]
1. MathJax 标准 CDN ✅ grep `cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js` 命中 1
2. Paged.js 标准 CDN ✅ grep `unpkg.com/pagedjs@0.4.3` 命中 1；脚本顺序 MathJax(L20) < Paged.js(L32)
3. PagedConfig.before + typesetPromise ✅ 命中 1+1
4. 无 Tailwind / 飞象代理 ✅ grep `tailwind|metis-online|metis-misc` 命中 0
5. 不手动切页 ✅ grep `<section class="page">` 命中 0；grep `height:\s*297mm` 命中 0
6. 顶层容器无固定宽度 ✅ body/main/.container 均使用 width:100% / max-width:none，grep 固定数值命中 0
7. 普通题块无 break-inside avoid ✅ grep 命中 0；仅 table/figure/img/.keep-together/.kcard 防拆
8. print-color-adjust exact ✅ 元素级声明命中 5 处；@media print 全局兜底 ✅
9. @page margin ≤ 12mm ✅ 实际值「margin: 10mm 12mm」
10. 题量保真 ✅ HTML 实数 30 ≥ quality.questionCount 30
11. 图片保真 ✅ HTML 实数 33 ≥ imageLedger.role!=unknown 33
12. 答案保真 ✅ HTML 答案块 16 ≥ quality.answerCount 16
13. 分数选项 ≤ 2 列 ✅ grep `repeat(4` 命中 1（题 4 纯数字短选项允许）；其余分数题用 repeat(2,1fr)
14. 打印按钮 + 一致性 ✅ .no-print + window.print() 命中 1；box-shadow/linear-gradient/filter（除 .no-print）命中 0

[subtype: exam_paper 专项]
✅ 含 exam-info 信息表
✅ 题型分组：选择题 / 填空题 / 脱式计算 / 解决问题 完整
✅ 每题有题号（30 题 30 个题号）
✅ 选项 box 与文字同父节点
```

---

## 4. 失败处理

任一基线项未过：

```plain
[质检未过] 第 N 项：<具体内容>
实际计数：<列出 grep 命中数或题数>
拟修复：<具体动作>
将在修复后再尝试 create_html_deliverable。
```

任一 subtype 专项未过：

- **修复后重新 create_html_deliverable**（推荐）
- **降级 subtype**（如 exam_paper 信息表缺失 → 降级为 question_set）
- **询问用户**（缺信息时）

**禁止行为**：

- 跳过自检直接交付
- 用"全部通过 ✅"等含糊词代替实际计数
- 自检写实际数 = 期望数但 HTML 真实数远小于（v62 实测的撒谎模式）
- 自行降低或修改 14 项基线（这些是 v50/v62/v63 红线）

---

## 5. v62 → v63 失败案例（警惕实测）

v62 实测下列违规 + 自检撒谎：

| v62 违规 / 撒谎 | v63 检查 |
|---|---|
| HTML 14 题 / 30 题，自检报告"27 题 vs 27 ✅" | 自检 10 必须列 grep 实际数 vs questionCount，且实际数 ≥ 期望数 |
| 题 2 用 `repeat(4, 1fr)` 装 4 张图选项，自检报告"≤ 2 列 ✅" | 自检 13 必须 grep `repeat(4` 实际命中数 |
| 38 blocks 渲染 ~5 段，自检报告"全文完整保留 ✅" | 自检 10 用 grep 实际题块数，禁含糊词 |
| 5/5 用例缺 `.no-print` 打印按钮 | 自检 14 强制 grep `.no-print + window.print()` |
| `max-width: 800px` + `margin: 0 auto` 容器 → 打印被裁切 | 自检 6 grep `body\|main\|container.*max-width:\s*\d+(px\|mm)` 必须 0 命中 |
| `box-shadow / linear-gradient` 装饰 → 打印态丢失 | 自检 14 grep `box-shadow\|linear-gradient` 必须 0（除 `.no-print`） |
| `<script src="metis-online...">` 飞象代理 | 自检 4 grep `metis-online` 必须 0 |
| 数学教案调 `generate_image` AI 棉花田 | 铁律 5 + 自检（subtype 专项） STEM 严禁 AI 图 |

---

## 6. 计数命令模板（写代码后跑一遍）

> 让 AI 写完 HTML 后，先在 think 里"假装"跑这些命令再贴自检报告。可以让 AI 列出每项命中数。

```bash
# 假设 HTML 文本叫 $H
# 1-9 项
echo "1: $(echo "$H" | grep -c 'cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js')"
echo "2: $(echo "$H" | grep -c 'unpkg.com/pagedjs@0.4.3')"
echo "3a PagedConfig: $(echo "$H" | grep -c 'PagedConfig')"
echo "3b typesetPromise: $(echo "$H" | grep -c 'typesetPromise')"
echo "4 Tailwind/metis: $(echo "$H" | grep -cE 'tailwind|metis-online|metis-misc')"
echo "5a section.page: $(echo "$H" | grep -c '<section class=.page.>')"
echo "5b height 297mm: $(echo "$H" | grep -cE 'height:\s*297mm')"
echo "6 顶层 max-width 数值: $(echo "$H" | grep -cE 'main|body|container.*max-width:\s*\d+(px|mm)')"
echo "7 普通块防拆: $(echo "$H" | grep -cE '\.(question|section|card|page).*break-inside:\s*avoid')"
echo "8 print-color-adjust: $(echo "$H" | grep -c 'print-color-adjust:\s*exact')"
echo "9 @page margin: $(echo "$H" | grep -A 2 '@page' | grep -i margin)"

# 10-14 项
echo "10a HTML 题块数: $(echo "$H" | grep -cE 'class=\"[^\"]*(question|q-item)')"
echo "10b 期望数: <从 source-package quality.questionCount 取>"
echo "11a HTML <img>: $(echo "$H" | grep -c '<img\s')"
echo "11b 期望: <imageLedger 中 role!=unknown 数>"
echo "12a HTML 答案块: $(echo "$H" | grep -cE 'answer-tag|answer-section|参考答案|【答案】')"
echo "12b 期望: <quality.answerCount>"
echo "13 repeat(4: $(echo "$H" | grep -c 'repeat(4')"
echo "14a no-print + window.print: $(echo "$H" | grep -cE 'no-print.*window\.print|window\.print.*no-print')"
echo "14b web 装饰命中: $(echo "$H" | grep -cE 'box-shadow|linear-gradient|filter:|background-image:\s*url|position:\s*fixed')"
```

> AI 在响应里**不需要真的执行 bash**，但需要**逐项写出对应的 grep 命中数 / 实际数**，不能只写 ✅。
