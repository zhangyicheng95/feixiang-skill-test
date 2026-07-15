---
name: teaching-page-test-html
description: 单文件教学 HTML 验收 skill。用于检查 html-authoring 或 courseware-generator 生成的一个 HTML；强制回读真实产物并覆盖 must-cover、core-loop、require、forbid、按钮反馈、单文件依赖和布局，多页额外检查内联壳、翻页、状态恢复、cwScore 与可用时的打包入口。也作为两个生成 skill 的 Step 3 共用入口。浏览器或 Playwright 不可用时必须标记动态未验证。
metadata:
  version: v0.1.3
  source_version: teaching-page-v3 + feixiang-imagegen-v158
---

# HTML 验收

本 skill 是 `html-authoring` 与 `courseware-generator` 的 **共用 Step 3 交付闸门**，也可在用户只要求验收已有 HTML 时单独加载。它不生成页面，只判断页面是否可以交付。验收失败时，应回到对应生成 skill 修复，再重新验收。

本 skill **不读取** 生成侧的生图等 reference；生成侧也 **不各自复制** 本验收合同。

## 被测产物

单页和多页都只接收工具确认的一个最终 HTML：

```text
<slug>.html
```

多页课件的页面模板、共享样式和官方壳必须已经内联在这个 HTML 中，不依赖 sibling shell、outline 或 manifest。

## 工具边界

文件读取是强制能力，用于确认产物真实存在、非空且未被截断。浏览器人工检查和本地 Playwright 是条件能力：可用时打开工具实际可访问的产物地址；不可用时必须写「动态未验证」，不得假装点击或观察过页面。如果用户明确要求运行证据而动态工具不可用，应说明能力阻塞。

## 验收输入

从以下位置抽取 must-cover：

- 用户原始需求；
- HTML 中的 `<script type="application/json" id="artifact-spec">`；
- `artifact-spec.assets`；
- 多页课件的 `artifact-spec.outline`。

must-cover 至少包含四类：`core-loop`、`require`、`forbid`、`delivery`。多页课件额外包含 `shell`、`pages`、`navigation`、`state`、`quiz-score`、`scorm-package`。

抽取 must-cover 时不能只看页面里的显式 spec，也不能只看用户最后一句。要从全部用户消息中识别四类信号：交互动词和对象；声明式约束；核心体验闭环；交付可达性。

`forbid` 项按全局约束处理。`require` 项不能只用元素存在代替，需确认在实际操作中发挥作用。

## 硬门槛

以下任一项失败，都不能声明交付：最终文件无法回读、为空或被截断；doctype/html/head/body 不唯一；UTF-8 charset、title 或可解析的 `artifact-spec` 缺失；核心 CSS/JS/数据未内联；存在真实的本机、同目录或 Skill 内部运行依赖；存在模板占位、空事件函数或可见的 `undefined/null/NaN`；动态工具已运行但主内容不可见、核心闭环无法走完、禁止项出现或关键入口无反馈；多页课件缺少内联壳、页数不匹配、无法翻页或任一 page-data 产生滚动；练习页要求成绩但无法产生可捕获成绩消息。

核心闭环标准是「用户能完成任务并看到结果」：游戏能开始→操作→判定→反馈→重置；测验能作答→确认→对错/解析→继续；拖拽能改变归属并检查；模拟器能控制运行并看到状态变化。

## 人工验收流程

1. 浏览器能力可用时，打开工具实际可访问的产物地址。
2. 先确认页面可打开、无阻断性脚本错误、主内容可见。
3. 按 must-cover 逐项操作，不只看元素是否存在。
4. 记录通过或失败；失败写清现象与回修位置。
5. 输出验证结论卡。

单页重点看：核心互动、按钮反馈、素材真实性、横向溢出、滚动是否影响核心任务。  
多页重点看：壳加载、缩略图、翻页、页数对齐 outline、每页 960×540 无滚动、状态恢复、`cwScore`。

## 本地 Playwright 验收

需要自动化时读取 `references/test-templates.md` 与 `guide.md`。脚本应打开工具实际可访问的产物 URL，覆盖真实行为。

最低检查项：

```text
□ body 或主容器可见
□ 视口宽度 375 / 768 / 1280 下无横向溢出，核心操作可达（单页）
□ core-loop 端到端触发，并出现反馈或状态变化
□ forbid 项全局不存在
□ 每个关键按钮点击后有可见反馈
□ 外部图片和音频能加载，或 artifact-spec.assets 声明自绘和 fallback
□ 若 assets 含 source=generate_images：url 非虚构；多页封面含 coverImageSlot；未要求图内可见文字作为教学正文
```

多页课件额外检查：

```text
□ .cw-root 和 .cw-main-iframe 可见
□ 缩略图 iframe 数量大于 0
□ template.page-data 数量与 artifact-spec.outline 页数一致
□ 每个 page-data iframe 内 scrollWidth <= clientWidth 且 scrollHeight <= clientHeight
□ 翻页后当前页变化
□ 互动页离开再返回后状态恢复
□ 有练习页时捕获到 cwScore message
□ 如果有 SCORM 包按钮，点击后没有页面级错误
```

## 品类补盲

游戏/闯关：新题、重置、得分、失败反馈。测验：确认反馈、解析、下一题、结果、重做。拖拽/分类：真实移动、拒错、检查、复位。动画/模拟：开始、暂停、重置、实时状态。课件：960×540 不溢出不滚动、缩略图与主预览一致、翻页后状态可恢复。

## 失败处理

默认先判断页面实现是否缺失。不要为了通过验收删除 must-cover。连续失败时增加诊断证据后再结论。基础设施失败如实写入结论卡。

## 结论卡

```text
## 验证结论
- 状态：完全通过 / 静态通过，动态未验证 / 未通过
- 产物：<工具确认的最终路径或资源标识>
- 静态检查：<结构、依赖、spec、需求覆盖>
- 动态检查：<已执行场景，或明确写未执行及原因>
- 未验证项：无 / <列出风险>
- 下一步：交付 / 修复后复测 / 补充动态能力
```

只有静态和要求的动态检查都真实执行且通过后，才可以写「完全通过」。没有动态工具时只能写「静态通过，动态未验证」；静态硬门槛失败时写「未通过」。
