# `retro-zine` 模板实现说明书

## 中文展示名

`复古印刷风`

## 读取顺序（必须）

1. 先读取 `templates/assets/retro-zine/tokens.css`
2. 再读取 `templates/assets/retro-zine/page-shared.css`
3. 再读取 `templates/assets/retro-zine/component-snippets.html`
4. 最后按本文件的映射规则，把代码资产安全应用到课件里

## 这套模板的真实代码资产

- `tokens.css`
  作用：提供复古纸张底色、森林绿强调色、标题/正文/手写注记字体栈、圆角和基础阴影变量
- `page-shared.css`
  作用：提供 `page-root` 页面背景、页面文字颜色和 `--primary-color` / `--accent-color` 等变量级颜色适配；不直接重写标题、组件、按钮或媒体框样式
- `component-snippets.html`
  作用：只提供页面根节点模板标记和变体选择说明；不提供可复制的新组件、标题、媒体、按钮或反馈片段

## 使用方式（必须）

- 不要凭本文件的文字描述重新发明一套“类似复古印刷风”的样式。
- 必须优先复用 `tokens.css` + `page-shared.css` 中已经写好的真实模板代码。
- 需要适配按钮、卡片、反馈框时，只允许接入颜色变量或文字颜色；不得替换按钮、卡片、反馈框的 DOM、尺寸、圆角、阴影、边框粗细或文案。
- 若模板代码已覆盖目标样式，不再额外手写第二套平行样式。
- 根据 AI 教案/大纲页面意图，在每一个 `page-root` 上添加一个 `data-cw-template="retro-zine"` 和 `data-cw-variant` 视觉变体；视觉变体只改变页面背景、标题/正文/辅助文字字体族、标题/正文/辅助文字颜色、文字阴影、颜色变量和页面氛围，**不得移动或重排模型已生成的组件位置，也不得改变组件样式**。
- 模板 CSS 必须追加到原课件共享 CSS 之后，禁止替换原有 `<style>`；原课件标题横杠、按钮样式、组件样式、图片样式必须保留。
- 模板示例中的题签、印章、编号、英文栏头只代表来源模板视觉，不是课件内容。若原课件没有对应文字，禁止新增到页面中。

## 10 页来源范式沉淀表（只套视觉，不套结构）

> 原开源模板 `retro-zine` 是 10 页。本 skill 必须把 10 页都作为可选视觉配方沉淀；套用时按 AI 教案页面意图选择其中一页的背景、颜色、字体和文字层级配色。**禁止**按原模板页码改课件页码，禁止把原模板组件位置、卡片、贴纸、表单、按钮、相框结构搬进课件。

| `data-cw-variant` | 原版来源页 | 原版页面信息 | 可迁移视觉资产 | 标题/正文/辅助文字固定搭配 | 禁止迁移 |
|---|---|---|---|---|---|
| `slide-01-hero` | Slide 1 Hero | 封面、品牌名、subtitle、日期 | 暖纸底、绿色大标题、黑色辅助文字 | 标题：`Bebas Neue` / 绿色 `#008F4D`；正文：`Space Grotesk` / 黑色 `#1A1A1A`；辅助：`Space Grotesk` / 绿色或黑色 | 不新增题签/日期/英文栏头，不居中重排原有组件 |
| `slide-02-split-mission` | Slide 2 Split Mission | 导入说明、使命/目标、右侧大数字 | 暖纸底 + 深暖纸色搭配、绿色小标题、黑色大标题 | 标题：`Bebas Neue` / 黑色；正文：`Space Grotesk` / 黑色；辅助/强调：`Bebas Neue` / 绿色，手写注记：`Caveat` / 黑色 | 不强制左右分栏，不新增 340% 之类数据 |
| `slide-03-statement` | Slide 3 Statement | 中心观点、关键问题、引用 | 绿色整页底、米白大字、手写署名感 | 标题/重点：`Bebas Neue` / 米白 `#F4EFE6`；正文：米白；辅助：`Caveat` / 米白 | 不删减正文，不新增引用线或作者文字 |
| `slide-04-info-grid` | Slide 4 Info Grid | 事实卡、概念卡、对比卡 | 暖纸底、绿色标题、黑色正文 | 标题：`Bebas Neue` / 绿色；正文：`Caveat` 或 `Space Grotesk` / 黑色；辅助：`Bebas Neue` / 绿色 | 不强制 2×2 网格，不把原组件改成新卡片 |
| `slide-05-visual-target` | Slide 5 Full Visual | 图示/目标/实验现象页 | 深暖纸底、绿色/米白视觉强调 | 标题：`Bebas Neue` / 米白；正文/注记：`Caveat` / 米白；辅助：`Space Grotesk` / 黑色 | 不改图片本身颜色、滤镜、URL、位置或图片组件结构 |
| `slide-06-editorial` | Slide 6 Editorial | 阅读分析、方法讲解、长文 | 暖纸底、绿色标题、黑色正文、报刊感 | 标题：`Bebas Neue` / 绿色；正文：`Space Grotesk` / 黑色；辅助：`Bebas Neue` / 黑色 | 不强行分两栏，不新增首字下沉，不改段落顺序 |
| `slide-07-numbered-values` | Slide 7 Numbers | 步骤、要点、编号原则 | 暖纸底、绿色编号/标题、黑色说明 | 标题/编号：`Bebas Neue` / 绿色；正文：`Caveat` / 黑色；辅助：`Bebas Neue` / 黑色 | 不新增编号，不重排步骤组件 |
| `slide-08-collage` | Slide 8 Collage | 活动片段、能力模块、复习块 | 暖纸底、绿色/米白/深暖纸/黑色四组强调色 | 标题：`Bebas Neue` / 绿色或黑色；正文：`Caveat` / 黑色或米白；辅助：绿色 | 不加贴纸/胶带文案，不旋转或改造组件 |
| `slide-09-form-note` | Slide 9 RSVP/Form | 课堂记录、反思、出口单、填空提示 | 暖纸底、米白便签感、绿色标题、黑色手写线感 | 标题：`Bebas Neue` / 绿色；正文/注记：`Caveat` / 黑色；辅助：`Bebas Neue` / 绿色 | 不改输入框事件、答案逻辑、表单结构或输入样式 |
| `slide-10-closing` | Slide 10 Closing | 总结、结束、感谢页 | 黑色底、米白大标题、绿色辅助文字 | 标题：`Bebas Neue` / 暖纸色 `#C8B99A`；正文：暖纸色；辅助：`Caveat` 或 `Space Grotesk` / 绿色 | 不添加壳外导航逻辑，不新增社交链接 |

### 互动页专用变体

| `data-cw-variant` | 来源 | 适用页面 | 可迁移视觉资产 | 禁止迁移 |
|---|---|---|---|---|
| `native-interaction-shell` | 基于 retro-zine 纸张页的安全抽象 | 强互动页、练习页 | 暖纸背景、绿色标题、黑色正文、原变量级按钮/反馈颜色 | 不改 `interactive-root` 内部 DOM / 事件 / 状态协议 / 组件样式 |

### 旧变体别名（兼容）

`page-shared.css` 已保留旧别名：`hero-cover`、`split-mission`、`statement-focus`、`info-grid`、`visual-feature`、`editorial-columns`、`numbered-points`、`collage`、`form-note`、`closing`。新生成或后处理时优先使用 `slide-01-*` 到 `slide-10-*` 的规范名称。

> 匹配原则：根据页面“教学功能”选择视觉配方，而不是照搬原模板截图的位置布局。若不确定，普通讲解页用 `slide-04-info-grid`，阅读分析页用 `slide-06-editorial`，强互动页用 `native-interaction-shell`。

## 视觉定位

- 纸张底色、轻纹理、旧报刊色彩感
- 暖棕、深墨绿、暗红作为强调色
- 信息组织方式只作为颜色和页面氛围参考，不改变已生成组件结构

## 适合的页面类型

- 封面页
- 目录页
- 讲解页
- 对比分析页
- 总结页

## 普通页替换建议

- `page-root`：使用暖纸底 + 轻纹理 + 页面级颜色
- `title-block`：只允许按所选 `slide-xx-*` 配方改标题字体族、颜色和文字阴影；不得改标题结构、字号、行高、横杠、边距和下划线，不新增题签文案
- `content-block`：只改正文字体族、文字颜色和页面级色彩变量，不拆分/重排内容
- `component-shell`：只允许通过 `page-root` 颜色变量自然适配；禁止直接给组件新增背景、边框、阴影、圆角、padding 或改变 DOM
- `button-skin`：只允许通过原课件已有变量自然换色；不改按钮结构、尺寸、圆角、阴影、边框粗细或事件
- `media-block`：不直接套样式；禁止给内容图片本身加滤镜或改色，禁止改成新相框/贴纸结构，禁止新增大边框/底色
- `feedback-layer`：只允许通过原课件已有变量自然换色，不改显示逻辑

## 交互页替换边界

- 可以给互动页页面背景和外层颜色变量套复古色彩
- 互动页标题结构、标题横杠、字号、行高和边距默认保持原样；只允许按模板配方改标题字体族、颜色和文字阴影
- 互动页中的按钮、选项按钮、提交按钮只能通过原变量自然换色，不能换组件样式
- 互动区外围的题框、卡片框、提示框只能通过原变量自然换色，不能换结构、圆角、阴影、背景、padding 或边框粗细
- 必须保留原按钮节点的 `onclick`、函数名、`id`、关键 `class` 与脚本查询关系，只换颜色变量
- 禁止把拖拽项、按钮、题目结构改造成完全不同的 DOM 层级
- 禁止给题图、插图、结束图直接加暖色滤镜或纸张染色层
- 禁止让装饰纸片压住互动操作区

## 页面映射建议

- 封面：使用 `slide-01-hero` 的纸张底和绿色强调色；不新增章编号签条、印章或英文栏头，不强行重排标题
- 导入 / 目标 / 任务说明：使用 `slide-02-split-mission`
- 观点 / 关键问题：使用 `slide-03-statement`
- 目录 / 概念卡 / 事实卡 / 对比卡：使用 `slide-04-info-grid`
- 图片 / 实验现象 / 目标页：使用 `slide-05-visual-target`
- 课文分析 / 方法讲解 / 阅读分析：使用 `slide-06-editorial`
- 步骤 / 要点 / 编号原则：使用 `slide-07-numbered-values`
- 活动片段 / 复习卡：使用 `slide-08-collage`
- 课堂记录 / 出口单 / 反思：使用 `slide-09-form-note`
- 强互动 / 练习：使用 `native-interaction-shell`，保留原互动主体，只替换页面背景、标题/正文/辅助文字配方和颜色变量
- 总结 / 结束：使用 `slide-10-closing`

## 与当前 skill 的对应关系

- 这套模板明确包含：10 页来源范式的页面背景、页面文字颜色、标题/正文/辅助文字字体族、标题/正文/辅助文字颜色、颜色系统、`--primary-color` / `--accent-color` 等变量级颜色适配。
- 这套模板明确不包含：新增教学文案、英文题签、徽章、印章文字、标题横杠删除、标题结构重写、组件结构替换、组件形状改造、按钮样式替换、媒体框改造、互动脚本、事件绑定改写、壳逻辑、页数重排、图片本体改色。
