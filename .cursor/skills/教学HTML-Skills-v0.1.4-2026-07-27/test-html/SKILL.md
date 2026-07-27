---
name: teaching-page-test-html
description: 单文件教学 HTML 验收 skill。用于检查 html-authoring 或 courseware-generator 生成的一个 HTML；Agent 回读产物并按 static-checks.md 做静态验收（标签闭合、语法格式、artifact-spec、依赖、占位）与 must-cover；多页额外检查内联壳、翻页、状态恢复、cwScore。服务端无 Playwright 时以纯 Markdown 静态清单为主路径。浏览器或本地 Playwright 可用时补动态验证。
version: v0.1.5
source_version: teaching-page-v3
---

# HTML 验收

本 skill 是 `html-authoring` 与 `courseware-generator` 的 **共用 Step 3 交付闸门**，也可在用户只要求验收已有 HTML 时单独加载。它不生成页面，只判断页面是否可以交付。验收失败时，应回到对应生成 skill 修复，再重新验收。

本 skill **不读取** 生成侧的生图等 reference；生成侧也 **不各自复制** 本验收合同。

## 目录结构

```text
test-html/
├── SKILL.md                      ← 本文件（纪律与决策主干）
├── guide.md                      ← 验收流程
└── references/
    ├── static-checks.md          ← 静态清单（Agent 主路径，必读）
    └── test-templates.md         ← 本地 Playwright 模板（条件能力）
```

## 被测产物

单页和多页都只接收工具确认的一个最终 HTML：

```text
<slug>.html
```

多页课件的页面模板、共享样式和官方壳必须已经内联在这个 HTML 中，不依赖 sibling shell、outline 或 manifest。

## 工具边界

| 能力 | 优先级 | 说明 |
|---|---|---|
| **文件回读（Read）** | 强制 | 确认产物真实存在、非空、未截断 |
| **模式搜索（Grep）** | 强制 | 占位符、依赖、forbid、结构计数 |
| **静态清单** | 强制 | `references/static-checks.md`；**无 Python/Node 脚本** |
| **浏览器 / Playwright** | 条件 | 可用时补动态；不可用时标「动态未验证」 |

**服务端策略**：无 Playwright 时，Agent 按 static-checks 完成静态硬门槛；全过才可写「静态通过，动态未验证」；禁止无动态写「完全通过」。

## 验收输入（must-cover）

从以下位置抽取 must-cover（纪律同 test-html v16）：

- 用户原始需求（**全部消息**，不只最后一句）；
- HTML 中的 `<script type="application/json" id="artifact-spec">`；
- `artifact-spec.assets`；
- 多页课件的 `artifact-spec.outline`。

must-cover 至少包含四类：`core-loop`、`require`、`forbid`、`delivery`。多页课件额外包含 `shell`、`pages`、`navigation`、`state`、`quiz-score`、`scorm-package`。

| 来源 | 静态可验 | 须动态验 |
|---|---|---|
| delivery / 结构 / spec | ✓ | — |
| forbid（禁路径、禁占位、禁双壳） | 部分 ✓ | 禁滚动、禁弹窗等 |
| require（id/class、assets 声明） | 部分 ✓ | 交互是否真生效 |
| core-loop | 嗅探函数/事件 | 端到端操作与反馈 |
| 布局 960×540 / 无溢出 | CSS 嗅探 | 视口实测 |
| cwScore / 翻页 / SCORM | 代码嗅探 | 消息与点击 |

`forbid` 项按全局约束处理。`require` 项不能只用元素存在代替，需确认在实际操作中发挥作用（动态阶段）。

## 静态验收（主路径）

**动手前 Read `references/static-checks.md`**。推荐顺序：

1. Read 工具确认的最终 HTML，记录路径与行数。
2. Grep 结构、占位、依赖、多页标记（见 static-checks「常用 Grep 模式」）。
3. 按 static-checks 的 A→H 逐项勾选并记录证据。
4. 从 artifact-spec + 用户消息列静态 must-cover 表。
5. 静态硬门槛失败 →「未通过」；全过且无动态工具 →「静态通过，动态未验证」。

### 静态硬门槛（任一项失败不得交付）

```text
□ 文件可回读、非空；含 <!DOCTYPE html>；以 </html> 结束，无明显截断
□ 顶层 html/head/body 各一；UTF-8 charset；title 非空
□ 标签闭合：style/script/template 成对；主要 div/span/svg 开闭平衡
□ JS/CSS 括号与引号平衡；artifact-spec JSON 可解析且无尾逗号/注释
□ 无 {{}}、${}、TODO、可见 undefined/null/NaN、空 onclick
□ 无 file://、pages/ 兄弟路径、未注入的 courseware-shell.js 外链
□ artifact-spec 字段齐全；assets 与 DOM 一致；generate_images url 非占位
□ 多页：page-data 数 = outline 页数；data-id 连续；page-shared 存在；壳已注入
□ getElementById / #id 查询目标在 HTML 或脚本创建逻辑中存在
```

细则见 **`references/static-checks.md`**。

## 动态验收（条件能力）

浏览器或本地 Playwright 可用时，在静态通过后再执行。读取 `references/test-templates.md` 与 `guide.md`。

最低检查项：

```text
□ body 或主容器可见
□ 视口宽度 375 / 768 / 1280 下无横向溢出，核心操作可达（单页）
□ core-loop 端到端触发，并出现反馈或状态变化
□ forbid 项全局不存在
□ 每个关键按钮点击后有可见反馈
□ 外部图片和音频能加载，或 artifact-spec.assets 声明自绘和 fallback
□ 若 assets 含 source=generate_images：url 非虚构；多页封面含 coverImageSlot
```

多页课件额外检查：

```text
□ .cw-root 和 .cw-main-iframe 可见
□ 缩略图 iframe 数量大于 0
□ template.page-data 数量与 artifact-spec.outline 页数一致
□ 每个 page-data iframe 内无滚动
□ 翻页后当前页变化；状态恢复；cwScore；SCORM 按钮无报错
```

## 品类补盲

游戏/闯关：新题、重置、得分、失败反馈。测验：确认反馈、解析、下一题、结果、重做。拖拽/分类：真实移动、拒错、检查、复位。动画/模拟：开始、暂停、重置、实时状态。课件：960×540 不溢出不滚动、缩略图与主预览一致、翻页后状态可恢复。

## 失败处理

默认先判断页面实现是否缺失。静态失败修 HTML，不修验收标准。不要为了通过删除 must-cover。连续失败时增加诊断证据后再结论。

## 结论卡

```text
## 验证结论
- 状态：完全通过 / 静态通过，动态未验证 / 未通过
- 产物：<路径>
- 静态检查：
  - 文件完整性：通过/失败 <原因>
  - 标签与结构：通过/失败 <未闭合标签或缺 id>
  - 语法格式：通过/失败 <script/style/json>
  - artifact-spec：通过/失败 <字段或页数>
  - 占位与依赖：通过/失败 <命中>
  - 多页契约：通过/跳过/失败
  - forbid/require 静态项：N/M
- 动态检查：<已执行场景，或明确写未执行及原因>
- 未验证项：无 / <列出风险>
- 下一步：交付 / 修复后复测 / 补充动态能力
```

只有静态和要求的动态检查都真实执行且通过后，才可以写「完全通过」。
