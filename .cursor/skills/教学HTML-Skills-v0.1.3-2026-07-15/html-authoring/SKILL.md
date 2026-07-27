---
name: teaching-page-html-authoring
description: 生成或修改 K12 单文件教学 HTML。用于教学动画、互动练习、小游戏、教学海报、A4 打印材料及已有单页 HTML 修改；先建立体验命题、教学视觉主角、互动原型与状态叙事，再按通用或数学链路完成自包含资源、正确性、交互反馈和桌面/小屏视口闭环；含 generate_images 与共用 test-html 验收。多页翻页课件使用 teaching-page-courseware-generator。
version: v0.1.6.1
source_version: teaching-page-v3 + teaching-page-html-authoring-v0.2.0
---

# 单页教学 HTML

本 skill 负责用一个完整 HTML 完成主要体验的教学产物，包括教学动画、互动练习、小游戏、教学海报、可打印 A4 练习册/试卷/字帖，以及已有单页 HTML 的定向修改。它不负责多页翻页课件；如果用户需要缩略图、翻页、演示壳或多页 PPT 式结构，应改用 `teaching-page-courseware-generator`。

## 新建与编辑入口

先根据用户自然语言判断本轮是新建还是编辑。用户要求生成、创建、再做一份、另外生成、从头生成或明确不要沿用旧产物时，按新建执行，不调用 `read_attachment`。用户要求修改、替换、删除、增加、调整、保持其他内容不变或基于某个版本继续时，按编辑执行；根据系统上下文列出的历史产物名称和 attachment ID 判断目标，再调用 `read_attachment` 并传入对应 `attachment_id`，把返回的完整 HTML 作为唯一源文件。不得编造 ID、改用未列出的附件或根据聊天摘要猜测旧 HTML。无法从用户指令确定目标时先提问；用户要求编辑但 `read_attachment` 不可用时报告能力阻塞。

编辑时先合并用户本轮指令与源 HTML 中已有的 `artifact-spec`（含 `experienceDesign`）。用户要求局部修改时采用最小改动原则，未点名的 DOM、CSS、JS、素材 URL、交互和文案必须保留；用户明确要求整体调整时可以扩大改动范围，但仍须在读取到的源 HTML 上完成。编辑结果也必须作为完整 HTML 调用 `create_file` 生成新产物，禁止覆盖旧文件、只输出差异片段或省略未修改内容。若 `read_attachment` 失败、返回空内容或非完整 HTML，停止编辑并说明失败，不得降级为凭空重建。

## 产物契约

```text
<slug>.html
```

单页产物不复制 `courseware-shell.js`，不写任何会触发课件壳注入的占位符，也不生成额外 manifest。页面结构、业务 CSS、业务 JS、展示数据、初始化配置、需求 spec 和素材记录全部写进同一个 HTML；核心体验直接打开文件即可运行，不依赖同目录或本机上的 CSS、JS、JSON、图片、字体、音频或其他 HTML。

## 滚动使用原则

单页 HTML 的滚动策略按产物类型判断。教学互动、小游戏、模拟器、答题练习这类需要连续操作的页面，应让核心任务、主要控件和当前反馈尽量在首屏可见，避免学生为了完成一个动作在页面上下寻找按钮和结果。长文档、阅读材料、资料汇编、A4 打印预览、长表格或说明型页面可以滚动，但滚动结构必须清晰，导航、标题、当前任务和关键操作不能被长内容淹没。

不要把滚动当作内容组织的唯一方案。内容超量时优先考虑 Tabs、Accordion、步骤分页、题目分页、锚点目录或拆成多页课件；如果选择滚动，要保证结构可扫读、返回路径清楚、核心操作可达。不要用隐藏滚动条、裁切内容或过深嵌套滚动制造“看起来能放下”的假象。

页面横向几何必须形成闭包。内容根容器使用 `max-width:100%`，Grid/Flex 子项允许收缩（必要时 `min-width:0`），有页面内边距时不再用 `100vw` 扩张内部内容；绝对定位的光环、纹理等纯装饰放在独立装饰层内并受容器边界约束，不能扩大文档滚动宽度。裁切只允许作用于不承载教学信息和操作的装饰层，不能用来遮住内容溢出。SVG、Canvas 或 CSS 教学主图在小屏要通过完整 `viewBox`、等比缩放、标签简化或布局重排保留全部关键节点与关系路径，不能用固定像素画布、`cover` 或裁切容器丢失主图一侧。写入前分别按 1440px 桌面和 390px 小屏推演，预期 `document.documentElement.scrollWidth <= window.innerWidth`，且核心主图的语义边界完整可见。

## 文件职责

```text
html-authoring/
├── SKILL.md                         # 本入口：路由、阶段、硬门槛
├── experience-design.md             # 体验命题、教学视觉主角、原型与状态叙事
├── content-guide.md                 # 非数学/通用单页内容指南
├── style-guide.md                   # 非数学/通用视觉指南
├── references/
│   └── image-generation.md          # 仅准备调用 generate_images 时读取
└── math-design/
    ├── workflow.md                  # 数学场景的视觉、布局、色板选择权威
    ├── color-palettes-a.md          # 小学数学色板
    ├── color-palettes-b.md          # 初高中数学色板
    └── visual-impact.md             # 数学演示区多色强化
```

需求、素材、单文件写入和回读规则在本入口对应步骤中定义；动态/静态验收细节由共用 `teaching-page-test-html` 定义。生图规范只读本目录 `references/image-generation.md`，禁止跨读 courseware-generator。

## 执行总流程

```text
Step 1  输入整理：spec + experienceDesign + assets（写入 artifact-spec）
Step 2  路由生成：通用链路或数学链路
Step 3  交付验收：静态回读 + 条件浏览器/Playwright（teaching-page-test-html）
```

禁止跳过 Step 1 直接写 HTML。禁止未验收就宣称交付。

## 必读文件闸门

进入任何步骤前，先按当前阶段读取对应文件；未读取完必读文件，不允许进入该阶段的执行动作。

```text
Step 1 / Step 2 前必读：
- 所有单页：experience-design.md
- 非数学、学科不明、普通单页：content-guide.md + style-guide.md
- 数学单页互动：math-design/workflow.md
- 数学 workflow 命中色板后：对应的 color-palettes-a.md 或 color-palettes-b.md 片段
- 数学演示需要强化视觉时：math-design/visual-impact.md
- 准备调用 generate_images 时：references/image-generation.md

Step 3 前必读：
- `teaching-page-test-html`
```

`style-guide.md` 是通用链路的强制视觉规范，不是可选参考；非数学单页在写 HTML 前必须先读。数学任务不要用 `style-guide.md` 替代 `math-design/workflow.md`，但可以复用其中不影响数学准确性的通用组件原则。

## Step 1：输入整理

判断为编辑时，先从 `read_attachment` 返回的源 HTML 读取既有 `artifact-spec`，再仅按用户本轮明确指令更新契约；不要把未要求变化的既有约束、素材、`experienceDesign` 和 core-loop 丢弃。判断为新建时，按下述规则从用户需求建立新契约。

先整理：

```text
requirements=用户硬要求逐条记录
require=必须出现的元素、交互、素材或打印页
forbid=明确禁止项
core-loop=单页内可完成的互动闭环，例如 点击开始→观察动画→提交→反馈→重置
```

生成前必须把用户原始需求转成可验收的契约，而不是只提炼主题。契约至少包含：明确数量，例如题量、页面数、选项数、角色数；明确模式，例如练习、挑战、演示、打印；明确交互动词和对象，例如拖动分数块到数轴、点击骰子生成题目、输入答案后判定；明确格式约束，例如 A4、横屏、移动端、960×540；明确禁止项，例如用户明确要求不能滚动、不能使用弹窗、不能出现虚构图片路径。用户多轮补充时，以所有消息合并后的最终要求为准，不能只看最后一句。

确定 `slug`。先按 `experience-design.md` 形成体验命题、教学视觉主角、原型、教学可视化、状态叙事、素材策略与响应策略，再把它们写入 `experienceDesign`。把 spec 与素材记录写入最终 HTML `<head>` 中唯一的 `<script type="application/json" id="artifact-spec">`；字段至少包含 `mode`、`slug`、`requirements`、`require`、`forbid`、`coreLoop`、`experienceDesign` 和 `assets`。JSON 必须可解析，不含注释、尾逗号、未展开变量或 Markdown；用户内容出现 script 结束标签时写成 `<\/script>`。单页任务通常不需要用户确认；如果缺失信息会导致 core-loop 无法定义，可以一次性提问。

文件读取、配色选择、尺寸计算和布局推导是内部准备，不要向用户输出逐项工作记录。只把最终选择写入 `artifact-spec`；读取完成且没有真实阻塞时，必须继续到 `create_file`，不能用“已分析”“准备生成”或纯文本方案代替产物。

单页输入补充规则：`mode=single`；`core-loop` 必须描述单页内可完成的闭环，例如“点击开始→观察动画→提交答案→反馈→重置”；无互动时写明“无互动闭环”；单页产物不复制 `courseware-shell.js`。核心教学对象、题目数据和判定逻辑必须内联；无外部素材时在 `assets` 写明 CSS/SVG/Canvas 自绘。稳定 HTTPS 资源只能在用户没有禁止外部资源时作为非核心增强，记录真实 URL、用途、`core:false` 和 fallback。禁止虚构 URL、本机/Skill 内部/相对运行路径和大体积 base64 音视频。

### 素材与生图（Step 1）

1. **是否生图**：语文/历史情境插画、海报主视觉、真实景物/人物、用户明确要求 AI 配图 → 可列入 `assets` 并在 Step 2 调用 `generate_images`；数学几何、实验结构、流程图、UI 图标、关系图解 → 优先 SVG/CSS/Canvas 自绘。
2. **自包含优先**：用户要求自包含或 `forbid` 禁止外部资源 → `experienceDesign.assetPlan` 写 `SELF_DRAWN_ONLY`，**Step 1/2 均不得**调用 `generate_images`。
3. **生图前必读**：准备调用 `generate_images` 前，必须完整 Read `references/image-generation.md`，对 `imageDescriptions` 每条做命中式风格增强与槽位约束；不命中不套风格库。
4. **大纲阶段不写完整 prompt**：Step 1 只在 `assets` 记录用途、槽位意向、是否待生图；完整 prompt 在调用工具前按 image-generation 组装。

需要 AI 配图且未被自包含约束禁止时：先 Read `references/image-generation.md`，再调用服务端工具 **`generate_images`**（参数 `imageDescriptions: string[]`），把返回的真实 URL 逐条写入 `artifact-spec.assets`（含 `source`、`fallback`、`prompt`、`styleHit`、`imageSlot` 等）。当前会话工具清单无 `generate_images` 时降级自绘，禁止虚构 URL。

用户要求“自包含”“不依赖外部资源”或在 `forbid` 中写出同义限制时，素材策略立即切换为 `SELF_DRAWN_ONLY`：不要调用图片搜索或 `generate_images`，不使用远程字体、音频、视频、CDN，也不接受工具返回的 OSS/HTTPS 临时地址。图片生成结果的 URL 仍是外部依赖，不能当作已内联素材或稳定 fallback。`artifact-spec.assets` 只能记录内联 SVG、Canvas、CSS 或字面数据自绘，不得记录远程 URL。

自包含检查扫的是**资源引用**，不是任意 `http` 字面量：禁止 `src`/`href`/`srcset`/`poster`、CSS `url()`、`@import`、`@font-face` 与 `assets[].url` 中的远程地址。允许 SVG/XML 命名空间，例如 `xmlns="http://www.w3.org/2000/svg"` 与 `createElementNS('http://www.w3.org/2000/svg', …)`——它们不发起网络请求，不得因此判失败。

`experienceDesign` 不是视觉形容词清单。它必须让后续代码能够回答：首屏最先看到并操作什么、抽象知识通过什么可观察机制被看懂、交互前后哪些视觉状态发生变化、完成后如何形成阶段感，以及在小视口下保留什么并压缩什么。色板和布局仍由对应学科链路选择，但不能替代这份体验设计；通用色板**禁止学科锁色**（见 `style-guide.md`）。

`game-challenge` 的开始状态是教学体验的一部分，不是空白等待页。写入前必须确认首屏除标题、说明和开始按钮之外，至少还存在一种与任务绑定的可见主角：完整关卡路线/节点、一道真实题型预览、可操作教具，或把五关知识点直接组织成可扫读的挑战地图。不能让一个居中的小启动卡悬在超过半屏的空白舞台中；若出现这种结构，先补足任务地图或题型预览再写入。

## 核心机制契约

单页 HTML 的质量首先取决于核心机制是否真实存在。任何小游戏、测验、模拟器、计算器、拖拽分类、排序匹配，都不能只生成静态界面或按钮空壳；入口、状态变化、判断、反馈、重置必须能在同一页面内闭合。

常见品类的最低闭环如下：

| 品类 | 必须形成的闭环 |
|---|---|
| 数字/计算游戏 | 生成或选择题目→选择操作或填写答案→判定→反馈→新题或重置 |
| 拖拽/分类/排序 | 实际拖动或选择对象→目标区状态变化→提交或检查→命中/拒绝反馈→重置 |
| 测验/问答 | 出题→作答→判定→显示正确答案或解析→下一题或重试 |
| 模拟器/动画 | 开始→暂停或步进→实时状态显示→重置，不用纯 CSS 无限动画冒充模拟 |
| 计算器/生成器 | 输入或选择参数→执行计算/生成→结果可见→异常输入有反馈 |

触发词要按功能理解：用户说“模拟、观察、动态、变化、实验、演示”，通常需要可控状态；用户说“答题、测验、闯关、挑战”，通常需要判定和结果；用户说“拖、放、分类、配对、排序”，通常需要对象位置或归属真实变化。这些需求可以叠加，不要因为命中了某一类就忽略另一类。

### 状态、正确性与可验证交互合同

实现前先列出核心 `state`、允许的状态迁移和不会被破坏的正确性约束。HTML 中只保留一个可信状态源；题面、图示、公式、分数、进度、反馈和按钮可用性都通过 `render(state)` 或等价的统一渲染函数派生，避免各自修改 DOM 后互相失真。

数学、科学和规则型任务必须先在数据层验证答案、等价关系、单位、边界条件和非法操作。非法操作不得改变核心状态，并给出就近可见的原因；正确操作要同步更新视觉主角、数值/文字解释和进度。每个核心动作都使用语义明确的原生 `button`、`input`、`select`，或具备键盘与可访问语义的 SVG 热点；为主操作保留稳定的 `id` 或 `data-action`。重置必须恢复数据、视觉、反馈、进度和焦点，而不是只清空一处文字。

写入前检查所有自写 `<script>` 的字符串、模板文本、括号与 DOM 引用是否闭合，初始化后核心内容是否可见。任何“开始、提交、检查、下一题、重置、热点、拖拽”入口都必须能走完“操作 → 状态变化 → 可见反馈”的闭环；自检不能替代写后回读和真实浏览器验证。

## Step 2：选择生成链路

先判断产物是否属于多页翻页课件；若是，转 `teaching-page-courseware-generator`。否则在已形成的 `experienceDesign` 基础上继续判断数学链路。

| 场景 | 读取文件 | 执行重点 |
|---|---|---|
| 非数学、学科不明、普通单页 | `content-guide.md` + `style-guide.md` | 内容组织、交互完整性、通用视觉、打印材料 |
| 数学单页互动 | `math-design/workflow.md`，再按 workflow 读取对应色板段落和 `visual-impact.md` | 数学布局、色板、Stage 居中、按钮尺寸、禁误导方格 |

非数学任务不要读取 `math-design/`。数学任务以 `math-design/workflow.md` 为视觉和布局权威；`style-guide.md` 的装饰网格不适用于数学坐标、函数、统计图背景。

### 通用链路要求

生成 `<slug>.html` 前必须先读取 `content-guide.md` 和 `style-guide.md`。信息量少时使用单页布局；并列模块较多时用 Tabs；大量条目用 Tabs + Accordion；打印材料使用 A4 `<section class="page">`。每个用户显式提出的数值、模式、分类或难度都应有对应控件，不要合并成不可见的默认值。

交互要求是硬门槛：每个按钮、可点击对象和 SVG 热点都要绑定事件并产生可见反馈。模拟器或实时动画必须有开始、暂停、重置和状态显示。答题、拖拽、匹配、分类、排序等判定类任务必须有提交或检查答案、重置、结果反馈。不要用普通卡片或无键盘语义的 `<div>` 冒充核心控件。

内容组织不能把所有材料纵向堆成长页。并列主题用 Tabs 承载，十个以上同类条目用 Accordion、分页或分组列表承载，过程型内容按“情境→操作→反馈→总结”组织。教学页需要有讲解节奏：先让学生知道当前任务，再给操作入口，最后给反馈或结论；不要把视觉装饰、知识点、控件和结果区混在一个无层级区域。

交互粒度要跟用户表达一致。用户点名的每个值、模式、角色、分类、难度、题型、单位或阶段，都应能被看见或操作；如果为了体验做了默认合并，要在 spec 注释中说明取舍，并保证不丢失用户硬要求。所有入口都要通向实际功能，不能出现“开始”“提交”“重置”“下一题”等无效果按钮。

### 生图（Step 2，按需）

- **Step 1 未列入且非 SELF_DRAWN_ONLY**：生成过程中若强互动页/海报确需补图，可再调用 `generate_images`；每次调用前必须再 Read `references/image-generation.md`。
- **调用顺序**：定槽位 → 命中式增强 prompt → `generate_images` → URL 追加进 `artifact-spec.assets` → HTML 引用该 URL。
- **数学链路**：默认不自绘以外的生图；用户明确要求氛围插画且不影响准确性时例外，且通常不命中第四节风格库。

### 数学链路要求

生成数学单页前必须先读取 `math-design/workflow.md`。按 workflow 判断 pool、palette 和 layout，只读取命中的色板段落，不全量加载色板文件。把选择结果写入 `artifact-spec.mathDesign`：

```json
"mathDesign": {"palette":"<id>","layout":"<L1|L2|L3>","pool":"<A|B>","keyword":"<词>"}
```

数学场景默认禁止整页或整图方格背景；只有用户明确要求坐标网格、方格纸、网格线时才允许绘制完整方格，且方格、坐标轴、刻度、标签、曲线必须共用同一坐标变换。Stage 主体必须居中，controls 不靠滚动条解决超量控件。

数学演示的视觉选择要服务于概念表达。坐标、函数、几何、统计图的辅助线、刻度、标签、曲线、点位必须来自同一数据关系，不能用装饰性网格或随机图形制造“看起来像数学”的效果。小学数学优先使用明确对象、颜色分组和大尺寸操作控件；初高中数学优先保证坐标关系、公式可读性、推导步骤和结果区稳定。舞台、控件与反馈按互动原型选择位置，不为随机化而机械切换布局。

## 需求落实红线

生成前后都要按以下红线自查：UI 文案承诺了某个功能，就必须有对应实现；页面出现了入口，就必须能触发状态变化；用户要求了数量，就必须数得上；流程写成 A→B→C，就不能只做 A 和 C；用户给了具体教学场景，就不能替换成泛化的几何块、随机装饰或无关插图。

打印类产物也属于 HTML 交付，不应降低契约。A4、页眉页脚、题区、答题区、留白、分页、打印样式需要能在浏览器打印预览中保持可读；如果同时需要屏幕互动和打印，交互区与打印区应有清晰边界。

## Step 2 自检

```text
□ 单个 <slug>.html 已准备为完整最终内容
□ head 内含可解析的 artifact-spec JSON
□ artifact-spec.assets 已记录外部素材或声明自绘
□ artifact-spec.experienceDesign 已写明体验命题、视觉主角、原型、教学可视化、状态叙事和响应策略
□ spec 四字段已整理，mode=single
□ core-loop 每步可触发
□ require 项全部出现
□ forbid 项未出现
□ 每个按钮和可点击元素都有可见反馈
□ 核心数据只有一个可信状态源，视觉、数值与反馈同步渲染
□ 学科答案、等价关系、边界条件与非法操作已在数据层检查
□ 核心操作具备原生或等价可访问语义及稳定定位标识
□ 滚动策略符合产物类型，核心操作和反馈可达
□ 1440px 与 390px 下内容盒、Grid/Flex 子项和绝对定位装饰都不会扩大文档滚动宽度，核心 SVG/Canvas 主图的关键节点与关系路径完整可见
□ 无 {{placeholder}}、${data.xxx}、TODO 等未展开模板
□ 没有本机、同目录或 Skill 内部运行依赖
□ 未写入课件壳占位符 / courseware-shell / template.page-data / __CW_
□ 若调用过生图：已 Read references/image-generation.md；已命中增强；source=generate_images；含 imageSlot/prompt；无虚构 URL
□ SELF_DRAWN_ONLY 时未调用 generate_images，且无远程资源引用（SVG xmlns 除外）
```

数学任务还要检查：

```text
□ 已按 workflow 选定 palette 和 layout
□ artifact-spec.mathDesign 与选择结果一致
□ Stage 主体居中
□ 未明确要求网格时，没有整图方格背景
□ controls 未靠滚动隐藏关键控件
```

## Step 3：交付验收

读取 `teaching-page-test-html`。调用 `create_file` 前先检查完整 HTML：以 `<!DOCTYPE html>` 开始；只有一组 `html/head/body`；包含 UTF-8 charset 和 title；style、script、字符串、括号闭合；`artifact-spec` 可解析（含 `experienceDesign`）；所有数据和核心资源已内联；DOM 查询与实际 id/class 一致；无 `{{placeholder}}`、`${data.xxx}`、TODO、空事件函数、可见的 `undefined/null/NaN` 或本地运行依赖。JavaScript 中的用户可见中文文案引用按钮名或术语时使用中文引号 `“”`，禁止在双引号字符串内部直接写未转义的 ASCII 双引号；较长 UI 文案优先放入 `application/json` 数据块后解析。`mode=single` 的完整 HTML 还必须确认不含 `courseware-shell`、`template.page-data`、`__CW_` 或任何 shell/runtime 注入占位符。用户要求自包含或禁止外部资源时，按资源引用扫描远程 `http(s):`（`src`/`href`/`srcset`/`poster`、CSS `url()`、`@import`、`@font-face`、`assets[].url`），**排除** SVG/XML 命名空间 URI；任一真实资源引用命中都必须先替换素材再写入。同时复核页面几何：按 1440px 与 390px 预期 `scrollWidth <= innerWidth`，核心主图语义边界完整。

静态检查通过后，使用 `create_file` 一次性写入完整 `<slug>.html`，不能用对话代码块代替文件。不要使用 ADK `read_file` 回读最终 HTML；`read_file` 只用于读取 skill/reference 文件。写后真实性证据以 `create_file` 返回为准，必须确认返回中包含并满足：

```text
key=courseware:html:<task_id>
bytes>0
sha256=<非空>
redis_verify_match=true
has_artifact_spec=true
shell_injected=false
```

`mode=single` 时 `shell_injected=true` 是硬失败，必须移除壳相关内容后重新写入。没有 create_file 写后回读证据、`redis_verify_match` 不是 true、bytes 为空、`artifact-spec` 缺失或单页被注入 shell 时，不得说“已生成”。若运行时未返回 `redis_verify_match` / `has_artifact_spec`，只能写“完整性待外部验证”，不得臆造为 true；但 `bytes`、`sha256`、`shell_injected=false` 仍须满足。

浏览器或 Playwright 可用时，再打开工具实际可访问的产物地址，按 `teaching-page-test-html` 覆盖 core-loop、require、forbid、按钮反馈与溢出。动态工具不可用时只能写“静态通过，动态未验证”；用户明确要求运行证据时，不得用静态检查代替。

未通过时回到 Step 2 修复后复测。`create_file`、写后回读证据或 schema 能力不可用时停止并说明最小继续条件，不退回通用生成。最终必须输出验证结论卡。
