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
  作用：提供 `page-root`、`title-block`、`content-block`、`component-shell`、`button-skin`、`media-block`、`feedback-layer` 的真实样式
- `component-snippets.html`
  作用：提供标题题签、纸片卡片、偏移卡片、按钮、反馈框和视觉变体的可复用结构示例

## 使用方式（必须）

- 不要凭本文件的文字描述重新发明一套“类似复古印刷风”的样式。
- 必须优先复用 `tokens.css` + `page-shared.css` 中已经写好的真实模板代码。
- 需要替换按钮、卡片、反馈框时，优先参考 `component-snippets.html` 中的现成类名和结构。
- 若模板代码已覆盖目标样式，不再额外手写第二套平行样式。
- 根据 AI 教案/大纲页面意图，在 `page-root` 上添加一个 `data-cw-variant` 视觉变体；视觉变体只改变背景、标题、装饰、卡片、按钮、反馈和媒体框皮肤，**不得移动或重排模型已生成的组件位置**。

## 视觉变体全集（只套视觉，不套结构）

| `data-cw-variant` | 来源范式 | 适用页面 | 允许改变 | 禁止改变 |
|---|---|---|---|---|
| `hero-cover` | 原模板 Slide 1 hero title | 封面、章节开场 | 暖纸底、绿色超大标题、章编号签条、印章感 | 不把其他组件强行居中，不改页内组件顺序 |
| `statement-focus` | 原模板 Slide 3 statement | 中心观点、关键问题、结论页 | 大字声明、短句强调、留白和纸张纹理 | 不删减正文或改变内容顺序 |
| `info-grid` | 原模板 Slide 4 info grid | 概念卡、事实卡、对比卡、目录 | 纸张卡片、黑色分割线、绿色强调 | 不强制固定 2×2 网格 |
| `visual-feature` | 原模板 Slide 5 full visual | 图片/图示/实验现象页 | 相框、贴纸底板、图注样式 | 不改图片本身颜色、滤镜或 URL |
| `editorial-columns` | 原模板 Slide 6 editorial | 课文分析、方法讲解、段落阅读 | 报刊栏头、分栏感、首字母/重点短语皮肤 | 不强行把内容拆成两栏 |
| `numbered-points` | 原模板 Slide 7 numbers | 步骤、要点、规则、价值观 | 大号编号、纸片卡、绿色数字 | 不重排步骤组件 |
| `collage` | 原模板 Slide 8 collage | 活动片段、能力卡、复习模块 | 拼贴纸片、胶带、轻旋转、压贴感 | 不绝对定位覆盖互动区 |
| `form-note` | 原模板 Slide 9 RSVP/form | 课堂记录、反思、出口单、填空提示 | 表单线、手写注记、纸卡 | 不改输入框事件或答案逻辑 |
| `closing` | 原模板 Slide 10 closing | 总结、结束页 | 感谢页大标题、短分割线、手写脚注 | 不添加壳外导航逻辑 |
| `native-interaction-shell` | 原模板互动外壳抽象 | 强互动页、练习页 | 纸张背景壳、题签、按钮、组件框和反馈皮肤 | 不改 `interactive-root` 内部 DOM / 事件 / 状态协议 |

> 匹配原则：根据页面“教学功能”选择视觉变体，而不是照搬原模板截图的位置布局。若不确定，普通讲解页用 `info-grid`，阅读分析页用 `editorial-columns`，强互动页用 `native-interaction-shell`。

## 视觉定位

- 纸张底色、轻纹理、旧报刊题签
- 暖棕、深墨绿、暗红作为强调色
- 信息组织方式偏向栏目、侧注、卡片、标签签条

## 适合的页面类型

- 封面页
- 目录页
- 讲解页
- 对比分析页
- 总结页

## 普通页替换建议

- `page-root`：使用暖纸底 + 轻纹理 + 边缘装饰线
- `title-block`：做成报刊题签或印刷栏头
- `content-block`：改为双栏、侧注、拼贴卡片或纸片压贴式布局
- `component-shell`：统一换成纸片卡、印刷边框、便签框、题框
- `button-skin`：普通按钮和选项按钮都换成复古纸签按钮或印章式按钮
- `media-block`：使用相框式边线或贴纸底板，但禁止给内容图片本身加滤镜或改色
- `feedback-layer`：使用浅纸卡 + 深色描边

## 交互页替换边界

- 可以把互动页标题区改成题签式抬头
- 可以给互动面板外层加纸板边框、印章角标、暖色反馈态
- 必须把互动页中的按钮、选项按钮、提交按钮换成复古印刷风按钮组件
- 必须把互动区外围的题框、卡片框、提示框换成复古组件框
- 必须保留原按钮节点的 `onclick`、函数名、`id`、关键 `class` 与脚本查询关系，只换视觉皮肤
- 禁止把拖拽项、按钮、题目结构改造成完全不同的 DOM 层级
- 禁止给题图、插图、结束图直接加暖色滤镜或纸张染色层
- 禁止让装饰纸片压住互动操作区

## 页面映射建议

- 封面：使用 `hero-cover` 的大标题、纸张底、章编号签条视觉
- 目录 / 概念卡：使用 `info-grid`
- 观点 / 关键问题：使用 `statement-focus`
- 图片 / 实验现象：使用 `visual-feature`
- 课文分析 / 方法讲解：使用 `editorial-columns`
- 步骤 / 要点：使用 `numbered-points`
- 活动片段 / 复习卡：使用 `collage`
- 课堂记录 / 出口单：使用 `form-note`
- 强互动 / 练习：使用 `native-interaction-shell`，保留原互动主体，只统一替换按钮组件与组件框
- 总结 / 结束：使用 `closing`

## 与当前 skill 的对应关系

- 这套模板明确包含：字体样式、颜色系统、标题题签、内容布局、组件框样式、按钮样式、反馈框样式、图片容器样式。
- 这套模板明确不包含：互动脚本、事件绑定改写、壳逻辑、页数重排、图片本体改色。
