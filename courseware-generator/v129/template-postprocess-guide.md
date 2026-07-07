# 互动课件发布后版面替换指南

> 本文件是 courseware-generator 技能的 Phase 7 子流程。仅在基础互动课件已经首次发布，且用户明确表示要更换版面时读取。

---

## 一、适用场景

仅当同时满足以下条件时，才进入本流程：

1. 互动课件已经按原始 `v69` 流程完整生成。
2. 该课件已经完成首次 `publish_resource`，用户已经拿到了基础版本。
3. 用户明确表示「内容没问题，但想换版面模板」。

若用户对内容本身不满意、要求改页数、改教学逻辑、改互动玩法，则**不要**进入本流程，应回到原有页面修改流程。

---

## 二、目标

本流程的目标不是重做互动课件，而是对**同一份已发布 HTML 文件**进行受控的视觉替换：

- 保留壳框架接入方式
- 保留页数、`data-id`、`data-name`
- 保留原始教学内容与素材引用
- 保留交互逻辑、事件绑定、状态保存恢复
- 对**全部页面**替换页面级视觉系统
- 对组件只做保护性识别：保留原组件结构、形状、尺寸、圆角、阴影、边框粗细、布局、事件、标题横杠、文案和组件框内文字颜色
- 对互动页只替换安全的模板层：页面背景、组件外页面文字颜色和外层页面氛围；互动区内部文字颜色保持原样
- 保证最终 HTML 中每一个被使用的 `data-cw-variant` 都有对应模板 CSS 规则，禁止出现“页面打了模板标记但没有匹配样式”的假套版
- 若原 `page-root` 内联背景与模板背景冲突，只允许清理 `page-root` 自身的背景相关属性；禁止把模板修复升级成组件、按钮、媒体框、图片框或反馈框的视觉重构

---

## 三、固定流程

```text
首次 publish_resource 完成
  ↓
立刻 ask_user：用户是否满意当前版面？
  ├─ 满意 → 结束
  └─ 不满意
       ↓
     读取 templates/README.md
       ↓
     ask_user：单选一个模板
       ↓
     读取对应模板说明书
       ↓
     读取对应模板代码资产
       ↓
     Step A：读取最新 HTML，建立全量页面清单
       ↓
     Step B：只注入 tokens.css / page-shared.css 共享模板层
       ↓
     Step C：从第 1 页开始按连续页码分批套模板
       ↓
     Step D：每批完成后校验本批覆盖表并锁定最新 resourceId
       ↓
     Step E：全部批次完成后校验全量覆盖表
       ↓
     publish_resource：二次发布新版课件
```

### 3.1 模板资产完整性硬闸门

批次 0 不是“参考模板后手写一段类似 CSS”，而是**完整注入选中模板的真实代码资产**：

1. 必须把选中模板的 `tokens.css` 和 `page-shared.css` 从文件头到文件尾完整追加到原课件唯一的 `page-shared` `<style>` 末尾，且必须位于所有原课件 CSS 规则之后，成为最终生效的模板层。
2. 禁止摘抄、压缩、改写、只复制部分变体，禁止只复制当前觉得会用到的 2-3 个 `slide-xx-*` 规则。
3. 注入后必须检查模板资产标记：
   - 最终 HTML 中必须包含选中模板 `tokens.css` 的 `CW_TEMPLATE_ASSET` 标记。
   - 最终 HTML 中必须包含选中模板 `page-shared.css` 的 `CW_TEMPLATE_ASSET` 标记。
   - 最终 HTML 中必须包含选中模板说明书列出的全部 `CW_TEMPLATE_VARIANT` 标记，包括 `slide-01-*` 到 `slide-10-*` 和 `native-interaction-shell`。
4. 建立两张集合并做包含校验：
   - `usedVariants`：全量页面清单里实际使用的所有 `data-cw-variant`。
   - `definedVariants`：最终共享 CSS 中真实存在的 `CW_TEMPLATE_VARIANT` / `data-cw-variant` 规则。
   - `usedVariants - definedVariants` 必须为空；否则就是假套版，禁止进入下一批或发布。
5. 即使当前课件暂时不用某个来源范式，也必须完整保留该模板的 10 页来源范式 CSS。后续页面映射可能会选择任一范式，不能让某些范式缺规则。
6. 若最终文件中某页有 `data-cw-template` / `data-cw-variant`，但背景、标题字体、标题颜色或正文颜色仍被原页 CSS 明显覆盖，优先修正模板共享 CSS 的安全选择器；若是 `page-root` 内联背景造成冲突，只允许删除 `page-root` 的 `background` / `background-image` / `background-color` / `background-size` / `background-position`。禁止通过改组件 DOM、改组件 class、删原页组件样式或重写组件外观来“修好视觉”。
7. 模板资产标记之后禁止再出现未限定模板的页面背景规则，例如 `[data-cw-role="page-root"] { background... }`、`background-color`、`background-image`、`[data-cw-role="page-root"]::before { background... }`。若原课件样式中存在这类规则，必须保证模板 `tokens.css` / `page-shared.css` 位于它们之后；否则会出现原课件米灰、浅灰、水墨底图覆盖像素风/复古风背景的假套版。

---

### 3.2 变体编号与颜色差异硬闸门

`slide-01`、`slide-06` 等编号只在**当前选中的模板内部**有意义，不能跨模板解释：

1. 若当前模板是 `retro-zine`，用户说“换成 slide-06”，只能表示 `retro-zine` 的 `slide-06-editorial`，不是 `8-bit-orbit` 的粉色 `slide-06-roadmap`。
2. 若用户想使用另一套模板的某个 slide，必须先让用户确认切换 `selectedTemplateId`，不能在同一页混用不同模板的 CSS。
3. 每套模板的 10 页来源范式不等于 10 种完全不同背景色；有些模板本来就是统一色系，不同 slide 主要差异可能是文字配方、纹理、强调色，而不是大面积换色。
4. 当用户要求把某页改成指定 `slide-xx` 时，执行前必须列出本页当前变体与目标变体的视觉差异表，至少包含：当前 `data-cw-variant`、目标 `data-cw-variant`、背景 token、标题颜色 token、正文颜色 token、预计是否有明显换色。
5. 若当前变体与目标变体使用同一背景 token 或同一主视觉色系，必须明确说明“这次只会有轻微字体/强调色差异，不会明显换背景色”；禁止回复“已换成完全不同版面”或“强烈冲击力”等夸大描述。
6. 若用户的真实目标是“明显换颜色”，应在当前模板内推荐视觉差异明显的变体；例如 `retro-zine` 中绿色整页底是 `slide-03-statement`，深暖纸底是 `slide-05-visual-target`，黑色底是 `slide-10-closing`。推荐前仍需遵守页面类型与内容承载边界。

### 3.3 完整 10 页来源范式使用硬闸门

“沉淀模板版面”指把开源模板每一页的**安全视觉配方**都沉淀出来：页面背景、纹理/网格/星点等纯背景层、组件外标题/正文/辅助文字字体族、组件外标题/正文/辅助文字颜色、文字阴影。它不包含原模板的组件位置、两栏结构、图表 DOM、按钮形状、媒体框结构、组件框内文字颜色或任何模板文案。

1. 每套模板的 `slide-01-*` 到 `slide-10-*` 都必须作为独立候选配方存在，不能把 10 页压缩成一种“主皮肤”。
2. 模板注入时必须按 AI 教案页面功能选择不同来源范式；禁止为了“统一”而让全部普通页都使用同一背景色或同一 `data-cw-variant`。
3. “不随机”只表示不能随手乱选；正确做法是**确定性映射**：封面用 hero，导入/目标用 mission，概念用 core/info，数据/对比用 analytics/resource，步骤/流程用 roadmap/numbered，关键问题用 quote/statement，分层任务用 access/form，总结/结束用 closing。
4. 若选中的模板本身像 `8-bit-orbit` 一样有多组固定背景色，必须保留这些背景差异并在合适页面使用；禁止把它统一改成深蓝或暖纸底。
5. 二次发布前的覆盖表必须增加 `backgroundFamily`：例如 `dark-grid`、`pink-grid`、`cyan-grid`、`lavender-grid`、`paper`、`green-field`、`black-closing`。若页面类型明显多样但 `backgroundFamily` 只有一种，视为模板应用失败，禁止发布。
6. 课件页数少于 10 页时，可按页面功能选择子集；课件页数达到或超过 10 页时，应优先覆盖该模板主要背景组和尽量覆盖 10 个来源范式。强互动页为保护交互可使用 `native-interaction-shell`，但不能因此让全部非互动页只剩一种背景。

## 四、替换边界

### 4.1 允许修改

- `<template class="page-shared">` 中追加模板 `tokens.css` 与 `page-shared.css`；只能追加到原有 `<style>` 末尾且必须在所有原课件 CSS 之后，不能替换、删除或重写原课件共享 CSS
- `data-cw-role="page-root"` 的 `data-cw-template`、`data-cw-variant`、页面背景、组件外页面文字颜色和页面级氛围变量
- `page-root` 内联 `style` 中与模板背景冲突的背景属性：仅限 `background`、`background-image`、`background-color`、`background-size`、`background-position`、`background-repeat`；其他内联布局属性必须保持原样
- 基于选中模板 10 页来源范式的安全文字配方：组件框外标题/正文/辅助文字的字体族、颜色、文字阴影；只能通过 `title-block`、`content-block` 中不属于组件保护区的文字节点生效，禁止改字号、行高、边距、布局和 DOM
- 若原页面已有标题/正文容器但缺少 `title-block` / `content-block` 语义钩子，可只给现有容器补 `data-cw-role` 语义属性；禁止新增节点、换 class、换标签或调整样式
- `page-root` 上的模板专用颜色变量，如 `--cw-template-title-color`、`--cw-template-body-color`；禁止用根级 `color` 或会影响组件文字的全局变量让组件框内文字跟随模板变色
- `pointer-events: none` 的纯背景纹理；装饰只能作为页面背景，不得包裹或覆盖组件

### 4.2 禁止修改

- 壳框架 `<script src="...">` 的 URL、位置和调用方式
- 页面数量、`data-id`、`data-name`
- 原课件 `<template class="page-shared">` 中已有 CSS，包括标题横杠、按钮形状、卡片阴影、圆角、边框、图片尺寸和布局规则
- 任何原课件没有的可见文字，包括模板示例里的英文题签、徽章、印章、章节编号和口号；严禁新增 `ANCIENT PROBLEM`、`CLASSROOM ZINE`、`MISSION`、`READY`、`LEVEL` 等模板文案
- `data-cw-role="interactive-root"` 内部 DOM 层级、交互节点命名、事件逻辑
- 任意内容图片、题图、插图、结束图本身的颜色、滤镜、混合模式、透明度遮罩和素材 URL
- 组件、按钮、选项块、切换控件、图片容器、反馈块的原有 DOM 层级、节点类型、可见文案、文字颜色、`onclick`、事件监听目标、函数名、节点 `id`、关键 `class`、`data-*` 标识与脚本查询关系
- 组件原有的尺寸、圆角、阴影、边框粗细、布局方式、位置、交互热区、内联 `style` 和视觉装饰
- 每页标题的原有结构、字号、下划线/横杠、`border-bottom`、`display`、`margin`、`padding`；标题允许按模板页级配方修改字体族、颜色和文字阴影，但不得改变标题 DOM、字号、行高、位置或装饰线
- 直接给 `component-shell`、`media-block`、`button-skin`、`interactive-root`、`feedback-layer` 写新的组件外观或文字颜色规则；直接给 `title-block` 写布局/尺寸/边框类规则。尤其禁止新增或覆盖 `display`、`position`、`width`、`height`、`margin`、`padding`、`gap`、`flex`、`grid`、`border`、`border-width`、`border-style`、`border-radius`、`box-shadow`、`transform`、`overflow`、`object-fit`、`clip-path`、`font-size`、`line-height`、`color`
- 以“深度固化”“视觉重构”“霓虹强化”“控制台风格”“发光边框”“适配模板截图”为理由改写页面子节点；这些都属于重做设计，不属于模板修复
- `saveState` / `restoreState` 协议
- 已生成的图片、音频 URL 与题目内容
- 任何会影响缩略图、主区预览、演示模式的自定义翻页、全屏、键盘监听逻辑

---

## 五、替换规则

1. **始终基于最新版本**：若 HTML 经历过多次 `edit_file`，必须使用最近一次返回的新 `resourceId` 继续替换。
   - 只要某次 `edit_file` 成功返回了新的 `resourceId`，后续所有 `read_file`、`edit_file`、`publish_resource` 都必须基于这个最新 `resourceId`。
   - 禁止在“处理剩余页面”或“修复失败页面”时回退到更早的 `resourceId`；这会丢失前一批已成功套用的模板标记。
   - 若一次 `edit_file` 失败，它不会产生新版本；此时继续修复仍必须基于最近一次成功的 `resourceId`。
   - `resourceId` 只能沿着成功批次单调前进，不能从“注入共享层版本”或“模板替换开始前版本”重新分叉。
2. **先读取选中模板的说明书**：用户选定模板后，必须先读取对应的模板说明文件（如 `templates/retro-zine.md` / `templates/8-bit-orbit.md`）。
3. **继续读取真实模板代码资产**：在模板说明文件指定的顺序下，继续读取该模板的 `tokens.css`、`page-shared.css`、`component-snippets.html`。
4. **模板替换时必须优先复用这些代码资产**：禁止只根据说明文字自由发挥整套样式。
   - `tokens.css` 与 `page-shared.css` 必须完整复制；不得只手写某几个变体或把模板 CSS 重新概括成短版。
   - 复制后必须保留资产文件头、`CW_TEMPLATE_ASSET` 和全部 `CW_TEMPLATE_VARIANT` 注释标记，作为后续校验依据。
5. **模板替换必须像课件生成一样分批推进**：禁止一次性宣称“全量套模板完成”。必须先注入共享模板层，再按连续页码分批处理页面。
   - 每批最多 3-5 页，必须从第 1 页开始连续推进，例如 1-4、5-8、9-12、13-15。
   - 禁止跳过前几页先处理后几页，禁止倒序处理，禁止跨批重复覆盖，禁止在某批失败后直接进入下一批。
   - 每一批只处理本批页码对应的页面根节点和本批必要的颜色适配。
   - 每一批成功后必须记录本批结束后的最新 `resourceId`，下一批只能基于该 `resourceId`。
6. **模板替换必须覆盖全部页面**：封面、目录、讲解页、练习页、总结页、互动页都要进入替换流程，禁止只替换部分页面。
   - 不能只凭 `edit_file` 的标题或解释写“全量替换完成”。
   - 必须在二次发布前逐页列出覆盖表，格式至少包含：页码、页面标题、`data-cw-template`、`data-cw-variant`、是否缺失。
   - 覆盖表中只要出现 `NO_TEMPLATE` 或 `NO_VARIANT`，必须继续修复，禁止发布。
7. **优先替换共享视觉层**：能通过 `page-shared` 和页面外层容器完成的改动，不要深入改单页内部结构。
8. **先铺模板代码，再改单页**：
   - 把 `tokens.css` 与 `page-shared.css` 追加进当前 HTML 唯一的 `page-shared` 样式层末尾，并确认其后不再出现原课件的全局 `page-root` 背景、背景图或 `::before` 遮罩规则。
   - 必须完整追加，不得删减未使用变体；批次 0 后立刻检查全部 `CW_TEMPLATE_VARIANT` 标记是否仍在最终 HTML 中。
   - 如果检查发现 `CW_TEMPLATE_ASSET` 之后还有 `--bg-color`、`background-color: var(--bg-color)`、`background-image` 或 `page-root::before` 遮罩等原课件背景规则，说明模板层被插早了，必须把模板资产移动到这些规则之后或追加模板背景锁；禁止继续分批套页或发布。
   - 禁止替换整个 `<style>`，禁止删除原有共享 CSS，禁止让原来的 `border-bottom`、按钮规则、组件规则、图片规则消失。
   - 为全部页面根节点补上 `data-cw-template="<selectedTemplateId>"`，不是“需要套版的页面”，而是每一个 `page-root`。
   - 根据 AI 教案/大纲页面意图，为页面根节点补一个 `data-cw-variant="<visualVariant>"`；优先从选中模板 `slide-01-*` 到 `slide-10-*` 的 10 页来源范式中选择。该字段只选择背景、组件外文字颜色、字体族和文字层级配色，不能改变组件位置、组件框内文字颜色、标题 DOM、标题横杠或组件样式。
   - 若原页面把背景图或底色写在 `page-root style="..."` 中，且模板背景被挡住，只能从这个 `page-root` 的 `style` 删除背景属性；禁止改它的子节点、组件框、媒体框、按钮或标题样式。
   - 不要按 `component-snippets.html` 新增可见文字或替换组件结构；只能给已有页面根节点和组件外文字节点接入页面级模板类。
9. **按页面意图匹配视觉变体，而不是套结构版式**：
   - 每套模板必须以原开源模板的 10 页来源范式为完整候选集；不得只凭 2-3 个泛化风格覆盖所有页面。
   - 封面/章节开场匹配 hero 类视觉变体。
   - 导入/目标/任务说明匹配 mission/split/brief 类视觉变体。
   - 数据/对比/实验结果匹配 metric/chart 类视觉变体。
   - 步骤/流程/解题链路匹配 process/timeline 类视觉变体。
   - 概念讲解/知识卡/目录匹配 panel/grid/info 类视觉变体。
   - 阅读分析/方法讲解匹配 editorial/article 类视觉变体。
   - 总结/结束匹配 closing 类视觉变体。
   - 强互动页匹配 native-interaction-shell 类视觉变体。
10. **普通页做完整页面级视觉替换，但不重排模型输出**：
   - 普通展示页、讲解页、总结页允许替换页面背景、组件外页面文字颜色、标题/正文/辅助文字字体族、组件外标题/正文/辅助文字颜色和文字阴影。
   - 普通页中的组件是保护区；不得把原组件改成模板截图里的纸片卡、像素卡、相框、贴纸、徽章或印章，也不得改变组件框内文字颜色。
   - 普通页中的图片不改图片本身颜色与素材，也不得把图片组件改成新的卡片结构或加新边框/底色。
   - 禁止为了贴合原模板截图而移动组件、重排卡片、强制拆分两栏、强行改成图表或时间线。
11. **互动页做轻量模板替换，但不能漏替换**：
   - 互动页必须替换页面背景、组件外标题/正文/辅助文字颜色、字体族和页面氛围；互动主体、按钮、反馈层内部文字颜色保持原样。
   - 互动页禁止拆动 `interactive-root` 内部 DOM，禁止把交互主体改成新的结构。
   - 互动页中的按钮必须复用原按钮节点并完整保留其事件绑定属性；禁止修改按钮结构、尺寸、圆角、阴影、文字颜色、事件函数名和脚本选择器，禁止用模板按钮样式覆盖原按钮样式。
12. **禁止对内容图片染色**：不允许对 `<img>`、题图、插图直接添加 `filter`、`hue-rotate`、`saturate`、`mix-blend-mode`、半透明遮罩等改色手段。
13. **禁止新增模板文案**：模板资产中的题签、徽章、印章、编号示例只能作为颜色和字体参考，不能复制到课件可见内容中。若原页面没有相同含义的文字，不得新增。
14. **装饰不遮挡操作**：新增装饰层若覆盖互动区上方，必须加 `pointer-events: none`，且不能包含可见文字。
15. **保持 960×540 兼容**：替换后仍须满足 `html-guide.md` 的画布规则，禁止引入 `100vh`、自定义全屏容器、根级 `overflow: hidden`。

---

## 六、强制分批替换流水线

> 本节是 Phase 7 的执行顺序，必须逐条完成；不得把多个批次合并成一次模糊的“整体替换”。

1. **读取最新 HTML 并建立页面清单**
   - 先做壳协议入口检查：最新 HTML 必须使用 `<template class="page-data" data-id="数字" data-name="页名">` 作为每页容器，且壳框架脚本存在、`<!-- CW_PAGES -->` 保留。若 `<template class="page-data">` 数量为 0，或页面写成 `<template data-id="p1">` / `<template data-id="1">`，说明当前文件不是合格互动课件，禁止进入模板替换，必须回到 `html-guide.md` 重新修复课件骨架。
   - 统计全部 `<template class="page-data" ...>` 与 `data-cw-role="page-root"` 数量，二者必须一致。
   - 禁止基于自写 `#cw-root`、自定义翻页容器、父级 iframe/srcdoc 或普通网页主容器建立页面清单；这些都不是可套模板的互动课件壳结构。
   - 按页面实际顺序列出：页码、`data-id`、`data-name`、页面标题、页面类型、拟用 `data-cw-variant`。
   - 同时建立结构指纹：逐页记录 `title-block`、`content-block`、`component-shell`、`media-block`、`button-skin`、`interactive-root`、`img` 的数量和顺序；记录受保护节点及其子节点的内联 `style` 字符串；记录原有共享 CSS 中标题横杠、按钮、组件、图片相关规则是否存在。
   - 页面清单生成后，后续批次必须按该清单的连续页码推进。
2. **批次 0：注入共享模板层**
   - 只注入 `tokens.css` 和 `page-shared.css`。
   - 必须追加到原有 `page-shared` 的 `<style>` 末尾，且在最终 HTML 中必须位于所有原课件背景规则之后；禁止替换整个 `<style>`，禁止删除原有 CSS。
   - 禁止在批次 0 修改任何单页 DOM、组件、按钮、标题或图片。
   - 批次 0 后必须确认原有共享 CSS 仍存在；若标题横杠 `border-bottom`、按钮基础规则、组件基础规则或图片尺寸规则被删，必须回退本批并重做。
   - 批次 0 后必须从 `CW_TEMPLATE_ASSET` 标记向后扫描；若后面还有未限定模板的 `page-root` 背景、背景图或 `::before` 遮罩规则，必须先调整 CSS 顺序或追加模板背景锁，再进入批次 1。
   - 成功后记录 `resourceId_after_shared`，后续全部批次从这个版本继续。
3. **批次 1-N：按连续页码套模板**
   - 每批最多 3-5 页，页码必须连续。
   - 每批开始前先 `read_file` 最近一次成功的 `resourceId`。
   - 本批只给本批页面的 `page-root` 补 `data-cw-template`、`data-cw-variant`；`data-cw-variant` 必须来自选中模板的 10 页来源范式或 `native-interaction-shell`。
   - 本批不得修改页面内部标签、组件节点、按钮节点、图片节点、标题节点或脚本；仅当 `page-root` 自身内联背景挡住模板时，可删除 `page-root` 内联 `style` 中的背景属性，其他内联样式和所有子节点样式不得改变。
   - 本批不得改动未进入本批的页面。
   - 本批成功后记录 `resourceId_after_batch_N`。
4. **每批完成后立即校验本批**
   - 逐页列出本批覆盖表：页码、标题、`data-cw-template`、`data-cw-variant`、完成状态。
   - 本批出现 `NO_TEMPLATE`、`NO_VARIANT`、页码缺失或页码越界时，禁止进入下一批。
   - 对比本批结构指纹；若任一页 `title-block`、`component-shell`、`media-block`、`button-skin`、`interactive-root`、`img` 数量、顺序或保护区内联 `style` 变化，禁止进入下一批。唯一例外是 `page-root` 自身背景属性按规则被清理。
   - 修复本批时仍必须基于最近一次成功 `resourceId`，不得回到旧版本。
5. **全量覆盖表**
   - 所有批次完成后，再读取最新 `resourceId`。
   - 逐页列出全部页面的覆盖表，确认页数等于页面清单，且每页都有 `data-cw-template` / `data-cw-variant`。
   - 逐页对比全量结构指纹，确认模板替换前后的组件数量、媒体数量、按钮数量、标题数量、图片数量和保护区内联 `style` 完全一致。唯一例外是 `page-root` 自身背景属性按规则被清理。
   - 只有全量覆盖表无缺失，才能进入最终检查。
6. **最终安全检查**
   - 重新检查壳协议：`<template class="page-data">` 数量等于页面清单页数，`data-id` 连续，壳脚本存在且位于页面之后，`<!-- CW_PAGES -->` 保留，不存在自写 `#cw-root` / 父级 iframe/srcdoc / 普通网页展示容器。
   - 检查原有共享 CSS 是否被完整保留；特别是标题横杠、按钮基础样式、组件基础样式、图片尺寸/圆角规则不能减少或消失。
   - 检查选中模板共享 CSS 是否完整保留；`tokens.css`、`page-shared.css` 的 `CW_TEMPLATE_ASSET` 标记和全部 `CW_TEMPLATE_VARIANT` 标记不能减少或消失。
   - 检查模板背景是否最终生效：`CW_TEMPLATE_ASSET` 标记之后不得再出现未限定模板的 `page-root` 背景、背景图或 `::before` 遮罩规则；若像素霓虹风页面出现米灰/浅灰/水墨底，视为原课件背景覆盖模板，禁止发布。
   - 检查 `usedVariants - definedVariants` 是否为空；任何页面使用了没有 CSS 定义的 `data-cw-variant`，都必须继续修复，禁止发布。
   - 检查所有 `media-block`，确认没有给内容图片本身加滤镜、替换原图或改造成新相框结构。
   - 检查每页组件位置、尺寸、圆角、阴影、边框粗细、DOM 层级、内联 `style` 和可见文案，确认没有为了匹配模板截图或“修复模板没生效”而改动模型原本输出的组件。
   - 检查 `component-shell`、`interactive-root`、`media-block`、`button-skin`、`feedback-layer` 内部文字颜色，确认模板替换前后保持一致；组件框外标题/正文/辅助文字必须跟随对应 `data-cw-variant`。
   - 检查互动页，确认只换了页面背景和组件外文字视觉，没有改 `interactive-root`、组件框内文字颜色，且按钮事件目标、函数名、节点选择器与原版一致。
   - 重新做一次缩略图 / 主区 / 演示模式兼容检查。
7. **二次发布**
   - 只在全量覆盖表和最终安全检查都通过后，才调用 `publish_resource`。
   - `publish_resource` 必须使用最新一次成功 `edit_file` 返回的 `resourceId`。

---

## 七、发布要求

- 替换完成后，必须再次调用 `publish_resource`，把新版课件发给用户。
- 禁止在 `create_file` / `edit_file` 同一轮并行调用 `publish_resource`。
- 用户只应看到**二次发布后的最新成品**，不要同时发布多个中间版本。
- 二次发布前必须确认：首次发布后的满意度询问已执行，模板替换覆盖了全部页面，覆盖表无缺失，组件框外文字已跟随模板，且没有新增模板文案、改动组件样式或改动组件框内文字颜色。
- 若 `edit_file` 失败过一次，必须重新 `read_file` 最近一次成功返回的最新 `resourceId`，再继续修复并重新生成覆盖表；不能沿用失败前的判断，也不能回退到旧 `resourceId`。
- 若任一批次尚未完成或尚未通过批次覆盖表，禁止调用 `publish_resource`。
- 若结构指纹对比不一致，或原有共享 CSS 被删除/覆盖，禁止调用 `publish_resource`。
- 若壳协议检查不通过，或最新 HTML 没有 `<template class="page-data">`，禁止调用 `publish_resource`；这不是模板问题，必须先回到 HTML 生成流程修复课件结构。

---

## 八、失败回退策略

若某套模板在替换后出现以下任一问题，应停止继续加深替换并回退到更轻的视觉改造：

- 互动区点击、拖拽、排序、输入异常
- 按钮或选项外观变了，但点击后不再触发原有函数
- 翻页后状态恢复失败
- 缩略图、预览、演示模式表现不一致
- 页面内容溢出明显增加
- 标题、正文、图片被装饰压住
- 图片颜色、明暗、对比度与原素材明显不一致
- 只替换了部分页面，导致整份课件风格割裂

回退时优先保留：

1. 交互可用性
2. 壳兼容性
3. 内容可读性
4. 模板风格完整度
