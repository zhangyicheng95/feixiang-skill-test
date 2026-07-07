# 互动课件模板索引

> 本文件由 SKILL 的 Phase 3 读取，列出当前所有可用的视觉模板。模板选定后，Phase 4 必须继续读取 `templates/design-contract-workflow.md`，先把模板编译成壳兼容设计契约，再开始生成互动课件。

---

## 可用模板清单

| ID | 中文名 | 学科适配 | 风格关键词 | 内置 layouts | 互动页支持 | 路径 |
|----|------|---------|----------|-------------|-----------|------|
| `retro-zine` | 复古印刷风 | 语文、英语、人文主题、项目式学习、班会、综合实践 | 温暖纸张、深绿强调、油墨线框、拼贴手作感 | `cover / intro / concept / summary` | 互动页一律使用 v69 原生互动结构，仅继承背景层 / 标题区 / 主题色 | `templates/复古印刷风/` |
| `8-bit-orbit` | 像素霓虹风 | 信息科技、编程主题、课堂竞赛、游戏化任务、互动练习 | 深蓝暗底、青粉黄霓虹、像素边框、CRT 质感 | `cover / concept / exercise / summary` | 互动页一律使用 v69 原生互动结构，仅继承背景层 / 标题区 / 主题色；`exercise.html` 只作视觉参考 | `templates/像素霓虹风/` |

> 后文若出现 `templates/<模板路径>/...`，实际应取本表「路径」列的目录，不要把模板 ID 直接当作文件夹名。
>
> 如果选中的模板没有某类 layout（如 `exercise.html`、`intro.html`），则：
> 1. 普通讲解页继续优先使用该模板已提供的 layouts；
> 2. 练习页、拖拽页、连线页、翻牌页、排序页、强互动页或缺失版式页，一律使用 v69 原生互动结构；
> 3. 这些回退页仍必须继承该模板的 `shared.css` 变量、背景层、标题区与少量无干扰装饰，禁止退回默认白底样式；
> 4. 模板只能包“背景壳”，不能包住或改写飞象原生互动组件本体。

---

## AI 在 Phase 3 的操作步骤

1. 读取本文件，从上表获取所有可用模板
2. 结合大纲学科推荐模板
3. 调用 `ask_user` **强制单选**模板，不提供跳过或自由发挥选项
4. 记录用户选定的模板 ID、模板中文名、模板路径
5. 若未记录模板 ID 与模板路径，禁止进入后续生成阶段

---

## AI 在 Phase 4 / Phase 5 的模板使用顺序

```
Phase 4:
1. templates/design-contract-workflow.md   ← 先编译壳兼容设计契约
2. templates/<模板路径>/template.md        ← 读取 layout 决策树、占位符规则、禁忌
3. templates/<模板路径>/tokens.json        ← 提取 token
4. templates/<模板路径>/shared.css         ← 完整写入 page-shared
5. templates/<模板路径>/layouts/*.html     ← 仅供静态展示页选择 layout；交互页不要直接套 template layout
6. 输出：designContractSummary + shellCompatibilityChecklist + pageTypeMap + 空课件 HTML resourceId + 页面 layout 映射表 + 占位符填充清单

Phase 5:
1. 不再重新选择 layout，不再重写 page-data
2. 不再按页重复通读模板原文件，优先依赖 Phase 4 的 designContractSummary
3. 只根据 Phase 4 的占位符填充清单替换 {{P*_...}}
4. 所有交互页都保留 Phase 4 已确定的 v69 原生互动结构，只替换内容和少量微调占位符
```

**当前模板包不包含**：`svg-snippets.md`、`svg/`、`examples/`。不要尝试读取这些路径。

---

## 模板的工作模型

```
┌─ 模板【管】的事 ─────────────────────────────────┐
│  ✅ HTML 版面骨架（layouts/）                    │
│  ✅ CSS 配色 / 字体 / 版式（shared.css 一份搞定） │
│  ✅ 设计契约输入（Phase 4 先编译契约再固定壳和 page-data）│
│  ✅ 交互页的背景壳 / 标题区 / 非阻挡装饰          │
└────────────────────────────────────────────────┘
┌─ 模板【不管】的事 ───────────────────────────────┐
│  ❌ generate_image 画风                          │
│  ❌ 壳框架 JS（由 html-guide §3.1 固定 URL 提供） │
│  ❌ 飞象原生互动组件的 DOM / 状态 / 事件协议       │
└────────────────────────────────────────────────┘
```

详细规则见 `templates/design-contract-workflow.md` 与 `html-guide.md`「〇、关于模板的硬性规则」。
