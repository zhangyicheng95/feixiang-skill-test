# `8-bit-orbit` 模板实现说明书

## 中文展示名

`像素霓虹风`

## 读取顺序（必须）

1. 先读取 `assets/8-bit-orbit/tokens.css`
2. 再读取 `assets/8-bit-orbit/page-shared.css`
3. 再读取 `assets/8-bit-orbit/component-snippets.html`
4. 最后按本文件的映射规则，把代码资产安全应用到课件里

## 这套模板的真实代码资产

- `tokens.css`
  作用：提供深色宇宙底色、霓虹高亮、像素阴影和基础间距变量；字体栈优先继承原版课件 `--cw-courseware-*` 决策，模板像素字体只作为 fallback
- `page-shared.css`
  作用：提供 `page-root` 页面背景、组件框外文字颜色和模板专用文字变量；不直接重写标题结构、组件、按钮、组件框内文字颜色或媒体框样式
- `component-snippets.html`
  作用：只提供页面根节点模板标记和变体选择说明；不提供可复制的新组件、标题、媒体、按钮或反馈片段

## 使用方式（必须）

- 不要凭本文件的文字描述重新发明一套“类似像素霓虹风”的样式。
- 必须优先复用 `tokens.css` + `page-shared.css` 中已经写好的真实模板代码。
- 按钮、卡片、反馈框是组件保护区，组件框内文字颜色必须保持原课件生成结果；不得替换按钮、卡片、反馈框的 DOM、尺寸、圆角、阴影、边框粗细、文字颜色或文案。
- 若模板代码已覆盖目标样式，不再额外手写第二套平行样式。
- 根据 AI 教案/大纲页面意图，在每一个 `page-root` 上添加一个 `data-cw-template="8-bit-orbit"` 和 `data-cw-variant` 视觉变体；视觉变体只改变页面背景、组件框外标题/正文/辅助文字颜色、文字阴影和页面氛围，字体继承原版 `--cw-courseware-*` 决策，**不得移动或重排模型已生成的组件位置，也不得改变组件样式或组件框内文字颜色**。
- 模板 CSS 必须追加到原课件共享 CSS 之后，禁止替换原有 `<style>`；原课件标题横杠、按钮样式、组件样式、图片样式和字体决策必须保留。
- 模板示例中的任务牌、徽章、英文栏头、等级文字只代表来源模板视觉，不是课件内容。若原课件没有对应文字，禁止新增到页面中。
- `tokens.css` 与 `page-shared.css` 必须完整复制到最终 HTML，不能手写短版；最终 CSS 必须保留 `CW_TEMPLATE_ASSET` 与全部 `CW_TEMPLATE_VARIANT` 标记。
- 第 1 页若已有 `data-cover-visual="full-bleed-background"`，说明封面生图是整页主视觉；此时本模板不得用像素背景覆盖封面图，只能应用标题颜色、文字阴影、独立遮罩和弱装饰，并继承原版字体变量。若封面是 `side-visual` 或 `inline-card`，模板背景可保留，但封面图必须作为 `media-block` 保护。
- `8-bit-orbit` 的原版 10 页提供深蓝、粉色、青色、薰衣草等多背景像素视觉配方；这些配方必须作为候选集保留，但一份课件不必全部使用，按页面教学功能选择即可。
- 字体样式不在 Phase 7 重新选择。若原版 HTML 已有 `CW_TYPOGRAPHY_DECISION` 与 `--cw-courseware-*` 变量，本模板必须继承它们；像素字体只在原版变量缺失时作为 fallback，禁止把中文正文强行改成像素体。
- 变体选择必须按页面功能确定性映射，不是随机混色；同类页面可以复用同一个候选配方。
- `slide-02-mission-brief`、`slide-06-roadmap` 的粉色大底可用于导入/目标/任务说明/步骤流程页；只在页面功能匹配时使用。
- `slide-03-core-systems`、`slide-08-quote` 的青色大底可用于概念模块/知识卡/中心问题/关键结论页；只在页面功能匹配时使用。
- `slide-05-resource-allocation`、`slide-09-access-tiers` 的薰衣草大底可用于数据对比/分层任务/选项组页；不得因此改造原组件为进度条、套餐卡或新按钮样式。
- `slide-01-hero`、`slide-04-analytics-core`、`slide-07-platform-vitals`、`slide-10-closing-cta` 的深蓝像素星空/网格可用于封面、数据快照、关键数值、结束页。

## 10 页来源范式沉淀表（只套视觉，不套结构）

> 原开源模板 `8-bit-orbit` 是 10 页。本 skill 必须把 10 页都作为可选视觉配方沉淀；套用时按 AI 教案页面意图选择其中一页的背景、组件框外颜色、字体和文字层级配色。**禁止**按原模板页码改课件页码，禁止把原模板组件位置、卡片、按钮、图表结构搬进课件，禁止改变组件框内文字颜色。

| `data-cw-variant` | 原版来源页 | 原版页面信息 | 可迁移视觉资产 | 标题/正文/辅助文字固定搭配 | 禁止迁移 |
|---|---|---|---|---|---|
| `slide-01-hero` | Slide 1 Hero | 封面、大标题、subtitle、标签 | 深蓝像素网格、彩色星点、CRT 氛围、青色大标题和黄色像素阴影 | 标题：`Tektur` / 青色 `#5EDCF4` / 黄色+深蓝 shadow；正文：`Chakra Petch` / 白色 72%；辅助：`Space Mono` / 粉色 `#F0A6CA` | 不新增徽章/英文标签，不把组件强行居中，不改封面原有素材位置 |
| `slide-02-mission-brief` | Slide 2 Mission Brief | 任务说明、导入、课程目标 | 粉色网格背景、深蓝标题、深蓝正文 | 标题：`Tektur` / 深蓝 `#0F1B3D`；正文：`Chakra Petch` / 深蓝 75%；辅助：`Space Mono` / 黄色 `#F4D03F` | 不复制 Mission Brief 文案，不强行左右分栏，不新增像素头像 |
| `slide-03-core-systems` | Slide 3 Core Systems | 概念模块、知识卡、功能点 | 青色网格背景、深蓝标题、青色辅助标签 | 标题：`Tektur` / 深蓝；正文：`Chakra Petch` / 深蓝 75%；辅助：`Space Mono` / 青色 | 不把课件组件改成四宫格，不新增模块图标或角标 |
| `slide-04-analytics-core` | Slide 4 Analytics Core | 数据快照、指标、柱状图 | 深蓝网格背景、青色标题、粉色辅助文字 | 标题：`Tektur` / 青色；正文：`Chakra Petch` / 白色 82%；辅助：`Space Mono` / 粉色或黄色 | 不把普通内容强行改成柱状图，不新增数据轴/动画 |
| `slide-05-resource-allocation` | Slide 5 Resource Allocation | 横向占比、分配、对比 | 薰衣草网格背景、深蓝标题、黄色辅助标签 | 标题：`Tektur` / 深蓝；正文：`Chakra Petch` / 深蓝 72%；辅助：`Space Mono` / 黄色 | 不把已有内容强行改成横向进度条 |
| `slide-06-roadmap` | Slide 6 Development Roadmap | 步骤、流程、时间线 | 粉色网格背景、深蓝标题、青色步骤强调 | 标题：`Tektur` / 深蓝；正文：`Chakra Petch` / 深蓝 70%；辅助：`Space Mono` / 黄色，步骤强调用青色 | 不重排为左右时间线，不新增时间节点 |
| `slide-07-platform-vitals` | Slide 7 Platform Vitals | 指标卡、状态、关键数值 | 深蓝网格背景、青色标题和数值、粉色小标签 | 标题：`Tektur` / 青色 / 深蓝 shadow；正文：`Chakra Petch` / 白色 78%；辅助：`Space Mono` / 粉色或黄色 | 不新增指标卡，不改原卡片布局和数值组件 |
| `slide-08-quote` | Slide 8 Quote | 中心问题、引文、关键结论 | 青色网格背景、深蓝正文、黄色分割强调 | 标题/重点：`Tektur` / 深蓝；正文：`Chakra Petch` / 深蓝；辅助：`Space Mono` / 深蓝 70%；强调：黄色 | 不移动正文，不新增引号装饰压住内容 |
| `slide-09-access-tiers` | Slide 9 Access Tiers | 分层选项、能力等级、套餐卡 | 薰衣草网格背景、深蓝标题、粉色辅助标签 | 标题：`Tektur` / 深蓝；正文：`Chakra Petch` / 深蓝 72%；辅助：`Space Mono` / 粉色 | 不改选项卡 DOM、按钮、事件或卡片样式 |
| `slide-10-closing-cta` | Slide 10 Closing CTA | 总结、结束、行动号召 | 深蓝网格背景、青色大标题、黄色像素阴影 | 标题：`Tektur` / 青色 / 黄色+深蓝 shadow；正文：`Chakra Petch` / 白色 72%；辅助：`Space Mono` / 黄色 | 不新增按钮逻辑、导航文案、badge |

### 互动页专用变体

| `data-cw-variant` | 来源 | 适用页面 | 可迁移视觉资产 | 禁止迁移 |
|---|---|---|---|---|
| `native-interaction-shell` | 基于 8-bit 深色页的安全抽象 | 强互动页、练习页、闯关页 | 深蓝网格背景、组件外青色标题、黄色强调色 | 不改 `interactive-root` 内部 DOM / 事件 / 状态协议 / 组件样式 / 组件框内文字颜色 |

### 旧变体别名（兼容）

`page-shared.css` 已保留旧别名：`hero-cover`、`mission-brief`、`core-systems`、`panel-grid`、`analytics-core`、`resource-allocation`、`metric-bars`、`roadmap`、`process-timeline`、`platform-vitals`、`quote-focus`、`access-tiers`、`tier-cards`、`closing-cta`。新生成或后处理时优先使用 `slide-01-*` 到 `slide-10-*` 的规范名称。

> 匹配原则：根据页面“教学功能”选择视觉配方，而不是照搬原模板截图的位置布局。若不确定，普通概念讲解页用 `slide-03-core-systems`，数据对比页用 `slide-05-resource-allocation`，强互动页用 `native-interaction-shell`。

> 完整范式原则：10 页来源范式是完整候选集，不是每份课件的必用清单。按页面功能确定性选择；同类页面可以复用同一变体。禁止随机选色，也禁止使用未沉淀的临时变体。

## 颜色差异说明

`8-bit-orbit` 的原版 10 页包含几组固定背景色，模板注入时必须把这些来源页差异保留为可选配方：

- 深蓝像素星空/网格：`slide-01-hero`、`slide-04-analytics-core`、`slide-07-platform-vitals`、`slide-10-closing-cta`、`native-interaction-shell`。
- 粉色像素网格：`slide-02-mission-brief`、`slide-06-roadmap`。
- 青色像素网格：`slide-03-core-systems`、`slide-08-quote`。
- 薰衣草像素网格：`slide-05-resource-allocation`、`slide-09-access-tiers`。

当用户指定“slide-06”时，只有当前选中模板就是 `8-bit-orbit` 时，才表示粉色 `slide-06-roadmap`；如果当前选中模板是 `retro-zine`，`slide-06` 表示复古印刷风的纸张底 editorial。禁止跨模板误用编号。

二次发布前可在覆盖表中记录本模板的 `backgroundFamily` 分布作为排查信息：`dark-grid`、`pink-grid`、`cyan-grid`、`lavender-grid`、`native-dark`。它不作为发布硬闸门；是否需要更多颜色变化取决于页面功能和用户要求。

## 视觉定位

- 深色宇宙背景、像素格、霓虹描边
- 青蓝、亮紫、荧光绿、像素黄做高亮
- 游戏 HUD、任务面板、分数牌只作为颜色和氛围参考，不改变已生成组件结构

## 适合的页面类型

- 封面页
- 目录页
- 练习页
- 游戏化互动页
- 反馈页
- 总结页

## 普通页替换建议

- `page-root`：使用深色背景 + 像素网格或星空点阵
- `title-block`：只允许按所选 `slide-xx-*` 配方改标题颜色和文字阴影，并继承原版标题字体变量；不得改标题结构、字号、行高、横杠、边距和下划线，不新增任务牌文案
- `content-block`：只改组件框外正文颜色并继承原版正文字体变量，不拆分/重排内容，禁止让颜色规则穿透到组件框内
- `component-shell`：组件框内文字颜色保持原样；禁止直接给组件新增背景、边框、阴影、圆角、padding、文字颜色或改变 DOM
- `button-skin`：按钮文字颜色保持原样；不改按钮结构、尺寸、圆角、阴影、边框粗细或事件
- `media-block`：不直接套样式；禁止给内容图片本身加变色滤镜，禁止改成新霓虹相框结构，禁止新增大边框/底色
- `feedback-layer`：文字颜色和显示逻辑保持原样，不改显示结构

## 交互页替换边界

- 可以给互动页页面背景和组件外文字套像素霓虹色彩
- 互动页标题结构、标题横杠、字号、行高和边距默认保持原样；只允许按模板配方改组件外标题颜色和文字阴影，并继承原版标题字体变量
- 互动页中的按钮、选项按钮、提交按钮保持原按钮文字颜色，不能换组件样式
- 互动区外围的题框、卡片框、得分框内部文字颜色保持原样，不能换结构、圆角、阴影、背景、padding 或边框粗细
- 必须保留原按钮节点的 `onclick`、函数名、`id`、关键 `class` 与脚本查询关系，不改按钮文字颜色
- 禁止把交互热点变成只剩装饰的假按钮
- 禁止给题图、插图、结束图直接加 `hue-rotate`、发光染色或其他图片改色滤镜
- 禁止用大面积发光遮罩覆盖拖拽或点击目标

## 页面映射建议

- 封面：使用 `slide-01-hero` 的宇宙背景视觉和强调色；不新增像素徽章或英文栏头，不强行重排标题
- 导入 / 课程目标 / 任务说明：使用 `slide-02-mission-brief`
- 目录 / 概念模块 / 知识卡：使用 `slide-03-core-systems`
- 数据快照 / 指标：使用 `slide-04-analytics-core`
- 数据 / 对比 / 实验结果 / 横向占比：使用 `slide-05-resource-allocation`
- 流程 / 步骤 / 解题链路：使用 `slide-06-roadmap`
- 关键数值 / 状态卡：使用 `slide-07-platform-vitals`
- 中心问题 / 关键结论 / 引文：使用 `slide-08-quote`
- 分层任务 / 选项组 / 能力等级：使用 `slide-09-access-tiers`
- 强互动 / 练习：使用 `native-interaction-shell`，保留原互动主体，只替换页面背景和组件外标题/正文/辅助文字配方
- 普通总结：使用 `slide-07-platform-vitals`；若是分层复盘或任务清单，可使用 `slide-09-access-tiers`
- 真正结束页：使用 `slide-10-closing-cta`

## 与当前 skill 的对应关系

- 这套模板明确包含：10 页来源范式的页面背景、组件框外页面文字颜色、组件框外标题/正文/辅助文字颜色、文字阴影、颜色系统和继承原版字体变量的 fallback 机制。
- 这套模板明确不包含：新增教学文案、英文任务牌、徽章、等级文字、标题横杠删除、标题结构重写、组件结构替换、组件形状改造、组件框内文字颜色修改、按钮样式替换、媒体框改造、互动脚本、事件绑定改写、壳逻辑、页数重排、图片本体改色。
