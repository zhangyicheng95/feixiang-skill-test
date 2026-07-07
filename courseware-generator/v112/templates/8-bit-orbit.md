# `8-bit-orbit` 模板实现说明书

## 中文展示名

`像素霓虹风`

## 读取顺序（必须）

1. 先读取 `templates/assets/8-bit-orbit/tokens.css`
2. 再读取 `templates/assets/8-bit-orbit/page-shared.css`
3. 再读取 `templates/assets/8-bit-orbit/component-snippets.html`
4. 最后按本文件的映射规则，把代码资产安全应用到课件里

## 这套模板的真实代码资产

- `tokens.css`
  作用：提供深色宇宙底色、霓虹高亮、像素风字体栈、像素阴影和基础间距变量
- `page-shared.css`
  作用：提供 `page-root`、`title-block`、`content-block`、`component-shell`、`button-skin`、`media-block`、`feedback-layer` 的真实样式
- `component-snippets.html`
  作用：提供 HUD 面板、像素按钮、反馈框、标题栏、媒体框和视觉变体的可复用结构示例

## 使用方式（必须）

- 不要凭本文件的文字描述重新发明一套“类似像素霓虹风”的样式。
- 必须优先复用 `tokens.css` + `page-shared.css` 中已经写好的真实模板代码。
- 需要替换按钮、卡片、反馈框时，优先参考 `component-snippets.html` 中的现成类名和结构。
- 若模板代码已覆盖目标样式，不再额外手写第二套平行样式。
- 根据 AI 教案/大纲页面意图，在 `page-root` 上添加一个 `data-cw-variant` 视觉变体；视觉变体只改变背景、标题、装饰、卡片、按钮、反馈和媒体框皮肤，**不得移动或重排模型已生成的组件位置**。

## 视觉变体全集（只套视觉，不套结构）

| `data-cw-variant` | 来源范式 | 适用页面 | 允许改变 | 禁止改变 |
|---|---|---|---|---|
| `hero-cover` | 原模板 Slide 1 hero | 封面、章节开场、闯关开场 | 深蓝网格、彩色星点、hero 大标题、黄色像素阴影、徽章 | 不把其他组件强行居中，不改页内组件顺序 |
| `metric-bars` | 原模板 Slide 5 horizontal bars | 数据、对比、进度、分布、实验结果 | 浅薰衣草网格、深蓝文字、像素条/进度条皮肤 | 不把普通内容强行改成条形图 |
| `process-timeline` | 原模板 Slide 6 timeline | 步骤、流程、路线、发展过程、解题链路 | 粉色网格、像素节点、路线感标题和组件框 | 不把已有组件重排成左右时间线 |
| `panel-grid` | 原模板 feature/grid 面板 | 概念讲解、知识卡、练习面板 | HUD 面板、像素角标、霓虹边框 | 不强制几列布局 |
| `quote-focus` | 原模板 quote/statement | 中心问题、关键结论、名言引用 | 青色网格底、强调框、像素阴影 | 不移动正文位置 |
| `tier-cards` | 原模板 tier/cards | 分层任务、选项组、能力等级 | 重点卡黄色描边、分级感面板 | 不改选项或卡片事件绑定 |
| `closing-cta` | 原模板 closing CTA | 总结、结束页、任务完成页 | hero 氛围、badge、彩色像素点 | 不添加壳外导航/按钮逻辑 |
| `native-interaction-shell` | 原模板互动/游戏壳抽象 | 强互动页、练习页、闯关页 | 背景壳、按钮皮肤、反馈皮肤、组件框 | 不改 `interactive-root` 内部 DOM / 事件 / 状态协议 |

> 匹配原则：根据页面“教学功能”选择视觉变体，而不是照搬原模板截图的位置布局。若不确定，普通讲解页用 `panel-grid`，强互动页用 `native-interaction-shell`。

## 视觉定位

- 深色宇宙背景、像素格、霓虹描边
- 青蓝、亮紫、荧光绿、像素黄做高亮
- 信息面板像游戏 HUD、任务面板、分数牌

## 适合的页面类型

- 封面页
- 目录页
- 练习页
- 游戏化互动页
- 反馈页
- 总结页

## 普通页替换建议

- `page-root`：使用深色背景 + 像素网格或星空点阵
- `title-block`：改成游戏关卡牌头或任务标题栏
- `content-block`：使用 HUD 面板、像素描边卡片、分区仪表盘
- `component-shell`：统一换成像素描边卡、任务面板框、分数牌外框
- `button-skin`：普通按钮和选项按钮都换成像素按钮、发光按钮或游戏面板按钮
- `media-block`：给图片和图表加霓虹描边与暗色底座，但禁止给内容图片本身加变色滤镜
- `feedback-layer`：正确/错误状态用明显的电子提示面板区分

## 交互页替换边界

- 可以把按钮、卡片、反馈框做成像素按钮或发光面板
- 可以给互动区外层加关卡框、得分牌、计数面板视觉
- 必须把互动页中的按钮、选项按钮、提交按钮换成像素霓虹按钮组件
- 必须把互动区外围的题框、卡片框、得分框换成像素组件框
- 必须保留原按钮节点的 `onclick`、函数名、`id`、关键 `class` 与脚本查询关系，只换视觉皮肤
- 禁止把交互热点变成只剩装饰的假按钮
- 禁止给题图、插图、结束图直接加 `hue-rotate`、发光染色或其他图片改色滤镜
- 禁止用大面积发光遮罩覆盖拖拽或点击目标

## 页面映射建议

- 封面：使用 `hero-cover` 的主标题、像素徽章、宇宙背景视觉
- 目录 / 任务清单：使用 `panel-grid` 或 `tier-cards`
- 数据 / 对比 / 实验结果：使用 `metric-bars`
- 流程 / 步骤 / 解题链路：使用 `process-timeline`
- 讲解 / 知识卡：使用 `panel-grid`
- 强互动 / 练习：使用 `native-interaction-shell`，保留原互动主体，只统一替换按钮组件与组件框
- 总结 / 结束：使用 `closing-cta`

## 与当前 skill 的对应关系

- 这套模板明确包含：字体样式、颜色系统、标题牌头、内容面板、组件框样式、按钮样式、反馈框样式、图片容器样式。
- 这套模板明确不包含：互动脚本、事件绑定改写、壳逻辑、页数重排、图片本体改色。
