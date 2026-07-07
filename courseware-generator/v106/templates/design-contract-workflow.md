# 模板设计契约编译指南

> 本文件由 SKILL 的 Phase 4 读取。目标不是直接生成 HTML，而是先把「所选模板」压缩成一份**壳兼容设计契约**，后续页面生成只依赖这份契约，不再反复通读模板原文件。

---

## 一、为什么必须先编译设计契约

当前互动课件的问题不在于“模板文件不够多”，而在于模型在写每页时同时处理了四件事：

1. 教学内容组织
2. 模板视觉理解
3. 互动组件实现
4. 飞象壳兼容约束

这会带来三个直接后果：

- 模板原文件过长，反复读取会吃掉上下文，导致内容自我压缩
- 每页都重新理解模板，风格容易漂移，最终不像原模板
- 为了贴模板去重包 DOM，互动组件和壳约束容易被误伤

因此必须改成更接近 AnyGen 的方式：

**先读模板原文件 → 编译一份简明、稳定、壳兼容的设计契约 → 后续只按契约写课件**

---

## 二、设计契约的工作原则

### 原则 1：模板原文件只是输入，不是后续逐页生成的直接依据

`template.md`、`tokens.json`、`shared.css`、`layouts/*.html` 只在 Phase 4 编译契约时集中读取一次。

Phase 5 开始后，AI 应优先依赖：

- `designContractSummary`
- `shellCompatibilityChecklist`
- `pageTypeMap`
- `layoutMap`
- `placeholderBindingPlan`

只有当契约缺字段、或某个 layout 细节缺失时，才回读模板原文件局部片段。

### 原则 2：壳兼容优先于模板还原

互动课件运行在飞象壳内。任何模板规则如果与壳冲突，必须优先服从壳。

### 原则 3：交互协议优先于模板布局

交互页的 DOM、事件、状态恢复协议是课件可用性的底线。模板只能接管视觉，不得接管交互协议。

### 原则 4：一套课件只编译一次契约

同一份互动课件只允许有一份当前生效的设计契约。禁止：

- 第 3 页按一种理解写模板
- 第 7 页又重新理解一遍模板
- 第 10 页再换一种解释

### 原则 5：内容保量优先于版式还原

模板的职责是提高稳定的视觉质量，不是拿来压缩教学内容。

- 先确认每页必须保留的教学信息单元，再选 layout
- 若 layout 无法承载这些信息，优先减弱装饰、降低卡片密度、回退更宽松骨架
- 禁止为了“更像模板”而删减题干、步骤、例子、提示语、反馈语

---

## 三、编译输入

Phase 4 必须同时读取下列输入：

| 输入 | 作用 |
|------|------|
| `templates/README.md` | 确认模板 ID、模板路径、适用题材 |
| `templates/<模板路径>/template.md` | 风格语义、layout 适用场景、禁忌 |
| `templates/<模板路径>/tokens.json` | 颜色、字体、间距等 token |
| `templates/<模板路径>/shared.css` | 全局视觉变量与壳层样式 |
| `templates/<模板路径>/layouts/*.html` | 静态页可用版式骨架 |
| `templates/<模板路径>/references/*.html` | 仅供视觉提炼的互动参考稿 |
| 已确认的大纲 | 决定每页内容和页类型 |
| `html-guide.md` 中的壳规则 | 决定哪些模板能力必须降级或禁用 |

---

## 四、设计契约必须产出的字段

编译完成后，必须在上下文中明确记录下列产物：

| 字段 | 必须包含的内容 |
|------|---------------|
| `designContractId` | 课件唯一契约标识，例如 `retro-zine-shell-v1` |
| `designContractSummary` | 模板的精简设计说明，只保留后续真正会用到的视觉与版式规则 |
| `shellCompatibilityChecklist` | 壳兼容检查项，后续每页都要遵守 |
| `pageTypeMap` | 每一页属于哪类页面：静态页 / 轻互动页 / 强互动页 |
| `layoutMap` | 每一页对应使用哪个 layout 或 `native-interaction` |
| `contentPreservationPlan` | 每页必须保留的教学内容单元，以及装不下时的回退方案 |
| `placeholderBindingPlan` | 每页占位符、素材、微调口子如何绑定 |
| `forbiddenRules` | 当前课件绝对不能出现的做法 |
| `microAdjustmentPolicy` | 允许调整什么，不允许调整什么 |

---

## 五、壳兼容检查项（最高优先级）

编译契约时，必须先生成下面这份检查清单，并在后续每页执行时持续遵守。

### 5.1 根容器与视口

- 课件画布固定为 `960×540`
- 禁止在 `html`、`body`、页面根容器上使用 `100vh`
- 禁止在 `html`、`body`、页面根容器上使用 `position: fixed`
- 禁止在 `html`、`body`、页面根容器上使用整体 `transform` / `scale` / `zoom`
- 禁止自行实现整页滚动容器来替代壳行为

### 5.2 壳行为冲突

- 禁止自行实现全屏按钮、翻页器、缩略图侧栏、预览容器
- 禁止在页面级监听并劫持全局 `wheel` / `keydown` / `ArrowLeft` / `ArrowRight` / `PageUp` / `PageDown` / `Space`
- 若交互组件内部确实需要键盘事件，只能绑定到组件局部，不得接管整页导航
- 禁止注入会影响壳生命周期的全局脚本

### 5.3 样式安全

- 壳脚本 URL 固定，不能被模板替换
- `shared.css` 必须 inline 到 `page-shared`，不能用相对路径引用
- 禁止在 `page-shared` 里引入外部字体或外部 CDN 样式
- 禁止把模板样式写成依赖真实浏览器窗口宽高的响应式系统

### 5.4 装饰层与操作层

- 装饰层必须 `pointer-events:none`，或天然不挡操作
- 装饰层 `z-index` 必须低于互动操作层
- 互动区域优先保证可点击、可拖拽、可连线，不得被模板边框/阴影/贴纸挤压

### 5.5 内容安全区

设计契约里必须明确“内容安全区”思维：

- 标题区
- 正文区
- 图片区
- 交互舞台区
- 弱装饰区

模板可以压视觉，但不能侵占交互舞台区。

### 5.6 内容保量底线

- 必须把大纲确认过的题干、知识点、关键步骤、例子、提示语、反馈语完整映射到页面占位符
- 禁止因为模板留白较大、卡片数量固定、标题区较高而删减上述内容
- 若单页静态 layout 承载不足，应优先切换到更宽松的静态骨架，而不是缩成“只有标题和两三句”
- 若交互页信息过多，保留原生互动组件可用性优先于模板造型完整度

---

## 六、页面分型规则

在编译契约时，必须先给每页做分型。推荐使用三类：

### A 类：静态展示页

例如：

- 封面
- 导入
- 概念讲解
- 例题拆解
- 总结

模板介入深度：

- 可以高度遵循模板 layout
- 可以直接继承模板的卡片、分栏、装饰和标题结构

### B 类：轻互动页

例如：

- 单选题
- 多选题
- 点击判断
- 翻牌
- 简单反馈题

模板介入深度：

- 仍使用 v69 原生互动结构
- 模板只提供背景层、标题区、主题色、弱装饰
- 不允许把原生互动组件改造成模板卡片拼盘

### C 类：强互动页

例如：

- 拖拽
- 连线
- 排序
- Canvas
- 游戏化舞台

模板介入深度：

- 只允许模板接管背景基调、标题区、辅助 HUD、弱装饰
- 主舞台完全由 v69 原生互动协议主导
- 若模板 layout 与互动舞台冲突，直接放弃该 layout，仅保留视觉 token

---

## 七、设计契约摘要应如何写

编译后的 `designContractSummary` 不应继续抄整份模板，而应写成一份短而稳的执行摘要。

建议至少包含以下字段：

```yaml
designContractId: retro-zine-shell-v1
templateId: retro-zine
templatePath: templates/复古印刷风/
canvas:
  width: 960
  height: 540
visualCore:
  tone: 温暖纸张 + 深绿强调 + 油墨线框
  titleFont: var(--ff-title)
  bodyFont: var(--ff-body)
  primaryVars:
    - var(--c-primary)
    - var(--c-accent)
    - var(--c-surface)
shellRules:
  - 保留固定壳脚本
  - 禁止自定义翻页/全屏
  - 禁止根容器 100vh / fixed / zoom
  - 装饰层 pointer-events:none
pageTypes:
  1: static-cover
  2: static-intro
  3: static-concept
  4: native-interaction
layoutMap:
  1: cover
  2: intro
  3: concept
  4: native-interaction
interactiveTheming:
  titleBar: yes
  backgroundShell: yes
  replaceNativeDom: no
contentPreservationPlan:
  3:
    mustKeep:
      - 概念定义
      - 1 个直观例子
      - 2 条辨析提示
    ifOverflow:
      - 减少装饰贴纸
      - concept 三卡改双列
      - 仍装不下则回退为模板视觉变量 + v69 标准静态结构
  4:
    mustKeep:
      - 题干
      - 全部选项
      - 正误反馈
    ifOverflow:
      - 保留 native-interaction
      - 删除额外 HUD 文案
forbiddenRules:
  - 不得重写原生互动组件 DOM
  - 不得新增整页翻页逻辑
  - 不得把图片作为整页背景
  - 不得引入外部字体
```

要求：

- **短**
- **稳定**
- **可执行**
- **以壳兼容为前提**

---

## 八、Phase 4 的标准执行顺序

```
1. 读取 templates/README.md
2. 读取本文件
3. 读取所选模板的 template.md / tokens.json / shared.css / layouts / references
4. 先生成 shellCompatibilityChecklist
5. 再生成 designContractSummary
6. 再做 pageTypeMap
7. 再做 contentPreservationPlan
8. 再做 layoutMap
9. 再准备素材
10. 再创建空课件骨架与占位符
```

**注意顺序不能反**：

- 不是“先生成 page-data，再看看模板怎么套”
- 不是“先写页面，再补壳兼容”
- 不是“先定 layout，再逼内容塞进去”
- 而是“先契约，后骨架，最后填内容”

---

## 九、Phase 5 的使用方式

进入 Phase 5 后：

- 优先使用 `designContractSummary`
- 优先使用 `pageTypeMap`
- 优先使用 `contentPreservationPlan`
- 优先使用 `layoutMap`
- 优先使用 `placeholderBindingPlan`

不要再把 `template.md` 当成长 prompt 反复喂给每一页。

**唯一例外**：如果某个静态 layout 的局部结构需要查一个 class 名，或契约里漏了某个 token，才回读模板原文件的局部片段。

---

## 十、失败信号与回退策略

如果出现以下任一信号，说明当前流程又退回“直接拿模板文件硬生成”了，必须回到 Phase 4 重编契约：

- 同一份课件里不同页风格解释不一致
- 模板元素越来越少，最后只剩颜色
- 互动页为了贴模板而丢失点击/拖拽
- 页面开始大量复用同一个 layout 导致内容被压扁
- 某些页面只剩标题和几句短文，原本该有的步骤/例子/反馈消失
- 模型开始把模板原文件里的长段说明原样搬进页面

正确回退方式：

1. 停止继续填页
2. 回到 Phase 4
3. 重新生成更短、更明确的 `designContractSummary`
4. 重新确认 `pageTypeMap` / `contentPreservationPlan` / `layoutMap`
5. 再继续 Phase 5

---

## 十一、底线结论

对飞象互动课件来说，模板系统真正该承担的是：

- 视觉 token
- 版式骨架
- 背景壳
- 标题区
- 非阻挡装饰

而不该承担的是：

- 壳行为
- 页面导航
- 原生互动组件协议
- 生图画风

一句话记忆：

**模板先编译成壳兼容设计契约，再生成课件；静态页先保内容再贴模板，互动页跟协议走，模板只包背景壳。**
