# 静态验收细则（Agent 执行，无运行时依赖）

> 本文是 `SKILL.md` 的附件：服务端无 Playwright、也无 Python/Node 脚本时，**Agent 回读 HTML 并按本清单逐项检查**。
> 不调用外部程序；只用 Read / Grep 与推理。每条结果写入结论卡，**不要默默省略**。

## 何时走静态主路径

1. **服务端无 Playwright**：静态验收是强制主路径。
2. **生成后第一步**：无论后续是否补动态，必须先完成静态硬门槛。
3. **用户只要求验收**：回读产物 → 本清单 A→H → 结论卡。

静态通过 ≠ 可交互通过；静态硬门槛失败 = **不得交付**。

---

## Agent 执行纪律

1. **先 Read 全文**（或分段 Read 大文件），记录路径与大致行数/字节感。
2. **再 Grep 模式**（占位符、依赖、forbid 等），命中处回读上下文确认，避免注释误报。
3. **逐节勾选** A→H；某条无法判定写 `# skipped: <原因>`，计入「未验证项」。
4. **禁止**只看标题/按钮存在就通过；**禁止**无动态证据写「完全通过」。

### 常用 Grep 模式（按需）

| 目的 | 模式示例 |
|---|---|
| 结构 | `<html`, `</html>`, `<head`, `<body`, `<!DOCTYPE` |
| 占位 | `\{\{`, `\}\}`, `\$\{`, `TODO`, `FIXME` |
| 假数据 | `>undefined<`, `>null<`, `>NaN<` |
| 本地依赖 | `file://`, `\.\./\.\./`, `pages/.*/index\.html`, `courseware-shell\.js` |
| 空事件 | `onclick=""`, `onclick=''` |
| 弹窗 | `alert\(`, `confirm\(`, `prompt\(` |
| 滚动 | `overflow:\s*(auto\|scroll)` |
| 多页 | `page-data`, `page-shared`, `artifact-spec`, `COURSEWARE_SHELL` |
| DOM 查询 | `getElementById\(['"]([^'"]+)['"]` → 核对 HTML 中是否有对应 id |

---

## 静态 must-cover 清单

| 来源 | Agent 怎么验 |
|---|---|
| **① delivery** | 文件可回读、非空、首尾完整、单文件无本地运行依赖 |
| **② 文档结构** | doctype/html/head/body；charset、title；标签闭合 |
| **③ artifact-spec** | 抽出 JSON 文本，确认可解析、字段齐全、与 DOM 一致 |
| **④ 语法格式** | style/script 成对；括号引号平衡；无截断 |
| **⑤ 占位与假数据** | Grep 占位模式；排除注释与 JS 源码合法用法 |
| **⑥ forbid（可静态）** | 禁路径、禁双壳、禁虚构 URL |
| **⑦ require（可静态）** | 声明的 id/class 存在；getElementById 目标齐全 |
| **⑧ 多页契约** | page-data 数、data-id、壳注入、outline 对齐 |

**须标动态未验证**：点击反馈、拖拽、翻页、cwScore、视口溢出、HTTP 加载、SCORM 下载。

---

## A. 文件与交付完整性（硬门槛）

```text
□ 工具确认路径可 Read；内容非空
□ 存在 <!DOCTYPE html>（允许前有 HTML 注释，但 doctype 须在 body 之前）
□ 文件以 </html> 结束；末尾非半截标签、非未闭合的 "url": "、function (
□ 顶层仅一组 <html>、<head>、<body>（Grep 计数各为 1）
□ <meta charset="utf-8"> 或 charset=UTF-8
□ <title>…</title> 非空
□ 无 file://、pages/<slug>/index.html 兄弟依赖、.cursor/skills 路径
□ 无 <script src="…courseware-shell.js"> 外链（壳须 create_file 注入）
```

---

## B. 标签闭合与 HTML 结构

### B.1 void 元素（无需闭合）

`area base br col embed hr img input link meta param source track wbr`

### B.2 Agent 标签栈检查步骤

1. Grep `<div`, `</div>`, `<span`, `</span>`, `<section`, `</section>`, `<template`, `</template>`，数量应成对或 template 自闭合合理。
2. 每个 `<style>` 有 `</style>`；每个 `<script>` 有 `</script>`（计数相等）。
3. 多页：每个 `<template class="page-data">` 到 `</template>` 片段内再查一层 div/span/svg。
4. SVG：`<g>`, `<path>`, `<text>` 等成对或自闭合（`<path …/>`, `<circle …/>`）。
5. 发现开标签多于闭标签 → **硬失败**，写明标签名与大致行号。

### B.3 非法嵌套

- `<head>` 内无 `div/p/h1` 等正文块（`script/link/style/meta/title` 除外）。
- `page-data` 内无完整第二套 `html/head/body`。
- 互动控件 `id` 在激活 DOM 中唯一；Grep `id="` 查重复。

### B.4 DOM 查询一致性

1. Grep `getElementById\(['"](\w[^'"]*)['"]` 与 `querySelector\(['"]#(\w[^'"]*)`。
2. 每个命中 id 在 HTML 中存在 `id="…"` 或运行时创建逻辑（如同一脚本内 `createElement` 且 append）。
3. 缺 id → **硬失败**。

---

## C. CSS 与脚本语法格式

### C.1 `<style>`

```text
□ <style> 与 </style> 数量相等
□ 每个 style 块内 { 与 } 数量相等（字符串内括号可疑时回读该段）
□ 无 @import 指向本地或壳外路径
```

### C.2 `<script>`（非 artifact-spec）

```text
□ <script> 与 </script> 数量相等
□ 非 JSON 的 script 块内 () [] {} 成对（从块首读到块尾，字符串内括号不计）
□ 字符串 ' " ` 成对
□ 用户内容中的 </script> 写成 <\/script>
□ 无 document.write 拼接半截 HTML
```

### C.3 `artifact-spec` JSON

1. Grep `id="artifact-spec"`，Read 该 `<script type="application/json">` 内文本。
2. 确认：**恰好 1 个**；无 `//` 注释、无尾逗号、无 Markdown 代码块包裹。
3. 必含字段：`mode`, `slug`, `requirements`, `require`, `forbid`, `coreLoop`, `assets`。
4. 多页另含 `outline`，且 `outline.length` 等于 `template.page-data` 个数。
5. `assets` 中 `source=generate_images` 的 `url` 非 example.com / placeholder。
6. 无法解析 → **硬失败**。

> 旧产物若只有 `<!-- spec: ... -->` 而无 JSON，按 v0.1.3 合同判 **未通过**，结论写明缺 artifact-spec。

---

## D. 占位、空实现与可见假数据

在**去掉注释后**的正文区 Grep（或命中后 Read 确认非注释）：

| 模式 | 判定 |
|---|---|
| `{{` `}}` | 硬失败 |
| `${`（非 CSS `var`） | 硬失败 |
| `TODO` `FIXME` | 硬失败 |
| 可见文本 `undefined` `null` `NaN` | 硬失败（JS 源码 `!== null` 等合法） |
| `onclick=""` | 硬失败 |
| `href="#"` 作为唯一主操作 | WARN，动态必测 |

---

## E. 依赖与素材真实性

```text
□ 核心 CSS/JS/数据已内联
□ 外链 img/audio/video 在 artifact-spec.assets 有记录，或注释/manifest 声明自绘
□ 无 ../../../、./courseware-shell.js
□ 多页：有 COURSEWARE_SHELL_INJECTED 或 __CW_SHELL_MAIN__
□ 多页：无 LLM 内联整份 courseware-shell.js 源码
```

---

## F. 多页课件静态契约

`mode === "courseware"` 或存在 `page-data` 时：

```text
□ 仅一个 <template class="page-shared">
□ page-data 数量 = outline.length
□ data-id 从 1 连续递增
□ 各 page-data 有 data-name
□ 核心容器无 overflow:auto|scroll（Grep + 回读）
□ 练习页脚本含 cwScore 或 postMessage（嗅探，动态再验）
□ coverImageSlot 对应页引用该 url
```

---

## G. 单页静态契约

```text
□ 主容器存在（#app、main、.page-root 等）
□ mathDesign：artifact-spec.mathDesign 与样式 palette 一致（若声明）
□ 打印页：含 @page 或 print 媒体查询（若用户要求）
```

---

## H. forbid / require 转静态断言

| 用户约束 | Agent 操作 |
|---|---|
| 禁止滚动 | Grep `overflow:\s*(auto\|scroll)` 于主容器 |
| 禁止弹窗 | Grep `alert(` 等 |
| 固定 N 题 | 数 `.question` / `data-qid` / spec 题量 |
| 必须含文案 | Grep 该字符串（非注释） |
| 禁止 emoji | Grep 常见 emoji Unicode 或 spec forbid |

无法静态验 → 结论卡 `# skipped: 需动态`。

---

## I. 推荐执行顺序

```
1. Read 产物（记录路径、行数）
2. Grep 结构 / 占位 / 依赖 / 多页标记
3. 逐项 A→H 勾选，记录通过/失败/跳过
4. 从 artifact-spec + 用户消息列 must-cover 静态表
5. 输出结论卡
6. Playwright/浏览器可用时再补动态（见 test-templates.md）
```

---

## J. 结论卡静态块（必填）

```text
- 静态检查：
  - 文件完整性：通过/失败 <原因>
  - 标签与结构：通过/失败 <未闭合标签或缺 id>
  - 语法格式：通过/失败 <script/style/json>
  - artifact-spec：通过/失败 <字段或页数>
  - 占位与依赖：通过/失败 <命中>
  - 多页契约：通过/跳过/失败
  - forbid/require 静态项：N/M
```

---

## K. 反面教材

```text
❌ 只 Grep 了 h1/button，没查 artifact-spec 和标签成对
❌ page-data 少一页仍标通过
❌ 注释里的 TODO 误报或未排除注释导致漏报
❌ 无 Playwright 却写「完全通过」
```

---

## L. 与 Playwright 的分工

| 能力 | Agent 静态 | Playwright |
|---|---|---|
| 标签闭合 | ✓ | — |
| JSON/spec | ✓ | — |
| 本地依赖 | ✓ | — |
| 占位符 | ✓ | — |
| 点击/翻页 | — | ✓ |
| 视口溢出 | 部分 | ✓ |
| 资源加载 | — | ✓ |

**服务端**：静态硬门槛全过 → 「静态通过，动态未验证」；禁止无动态写「完全通过」。
