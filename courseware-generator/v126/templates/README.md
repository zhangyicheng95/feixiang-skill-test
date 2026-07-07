# 互动课件模板索引

> 本文件用于 Phase 6 的模板选择环节。只有在基础互动课件已经首次发布，且用户明确要求更换版面时，才读取并向用户展示这些模板。

---

## 当前可选模板

### 1. `retro-zine`

- 中文展示名：`复古印刷风`
- 读取文件：`templates/retro-zine.md`
- 代码资产：
  `templates/assets/retro-zine/tokens.css`
  `templates/assets/retro-zine/page-shared.css`
  `templates/assets/retro-zine/component-snippets.html`
- 风格关键词：纸张感、温暖底色、印刷纹理、森林绿强调色
- 适合页面：封面、目录、讲解页、总结页、知识卡片页
- 版面特点：页面背景和强调色具有复古印刷气质，但不新增模板题签文案
- 替换策略：全部页面都要换成复古印刷风；普通页替换页面背景和组件框外文字颜色，交互页替换纸张背景和组件外文字视觉；不移动、不重排、不改造模型已生成的组件，不改变组件框内文字颜色，不删除标题横杠
- 视觉变体：完整沉淀原开源 10 页来源范式：`slide-01-hero` / `slide-02-split-mission` / `slide-03-statement` / `slide-04-info-grid` / `slide-05-visual-target` / `slide-06-editorial` / `slide-07-numbered-values` / `slide-08-collage` / `slide-09-form-note` / `slide-10-closing`，另有互动页安全变体 `native-interaction-shell`

### 2. `8-bit-orbit`

- 中文展示名：`像素霓虹风`
- 读取文件：`templates/8-bit-orbit.md`
- 代码资产：
  `templates/assets/8-bit-orbit/tokens.css`
  `templates/assets/8-bit-orbit/page-shared.css`
  `templates/assets/8-bit-orbit/component-snippets.html`
- 风格关键词：像素感、霓虹边框、深色宇宙背景、电子仪表盘
- 适合页面：封面、目录、练习页、闯关页、反馈页、总结页
- 版面特点：页面背景和强调色具有像素霓虹气质，但不新增任务牌、徽章或等级文字
- 替换策略：全部页面都要换成像素霓虹风；普通页替换页面背景和组件框外文字颜色，交互页替换霓虹背景和组件外文字视觉；不移动、不重排、不改造模型已生成的组件，不改变组件框内文字颜色，不删除标题横杠
- 视觉变体：完整沉淀原开源 10 页来源范式：`slide-01-hero` / `slide-02-mission-brief` / `slide-03-core-systems` / `slide-04-analytics-core` / `slide-05-resource-allocation` / `slide-06-roadmap` / `slide-07-platform-vitals` / `slide-08-quote` / `slide-09-access-tiers` / `slide-10-closing-cta`，另有互动页安全变体 `native-interaction-shell`

---

## 向用户展示时的规则

1. 必须使用 `ask_user` 做**单选**。
2. 只能展示本文件中列出的真实模板选项，不得临时编造新模板名。
3. 模板选项的用户可见文案建议使用中文展示名：
   - `复古印刷风`
   - `像素霓虹风`
4. 若用户要换版面但未明确选哪套模板，必须再次使用 `ask_user`，不能由模型自行代选。
5. 用户选定模板后，必须继续读取对应的模板说明书，再执行后置版面替换。

---

## 模板使用边界

- 模板只负责页面视觉系统和颜色层。
- 模板不接管壳逻辑，不改页数，不改互动协议。
- 模板不是抽象文案，必须优先复用对应模板目录下的真实代码资产；禁止完全脱离模板代码重新“猜一套差不多的样式”。
- 模板应用一旦开始，必须覆盖全部页面；二次发布前必须逐页校验 `data-cw-template` 和 `data-cw-variant`，禁止只替换部分页面。
- 模板根据 AI 教案/大纲页面意图选择 `data-cw-variant` 视觉变体；每套模板必须优先使用 `slide-01-*` 到 `slide-10-*` 的原开源 10 页来源范式。视觉变体只改变页面背景、组件框外文字颜色、标题/正文/辅助文字字体族、组件框外标题/正文/辅助文字颜色和文字阴影，**不控制组件位置、组件样式或组件框内文字颜色**。
- 强互动页优先保留原始 `v69` 互动结构，但仍必须继承模板的背景和组件外文字视觉。
- 模板禁止新增原课件没有的可见文字；模板示例中的题签、徽章、印章、任务牌、英文栏头不能复制到课件里。
- 模板禁止修改内容图片本身的颜色、滤镜、透明度、原始素材和图片组件结构。
- 模板不得改变按钮文字颜色；并且**禁止**改写原有按钮事件绑定、函数名、节点 `id`、关键 `class`、脚本选择器、按钮结构、尺寸、圆角、边框粗细和阴影。

## 模板代码资产包含什么

- `tokens.css`：颜色、字体栈和页面级主题变量。
- `page-shared.css`：基于 `data-cw-template="<slug>"` 和 `data-cw-variant="<slide-xx-*>"` 的页面背景、字体族、标题/正文/辅助文字颜色和变量级颜色适配代码；不得直接重写组件角色样式、位置、尺寸、边框、圆角、阴影或媒体结构。
- `component-snippets.html`：只提供页面根节点模板标记和视觉变体说明；不提供可复制的新组件、标题、媒体、按钮或反馈片段。

## 模板代码资产不包含什么

- 不包含壳逻辑、翻页逻辑、缩略图逻辑、全屏逻辑。
- 不包含互动脚本重写，不包含事件名、函数名、`onclick`、`id`、脚本选择器改写。
- 不包含内容图片重绘或素材改色。
- 不包含新增教学文案、英文题签、徽章、印章、任务牌或等级文字。
- 不包含组件结构替换、组件样式改造、按钮形状重做或图片组件重做。
