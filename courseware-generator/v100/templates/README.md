# 互动课件模板索引

> 本文件由 SKILL 的 Phase 2.5 读取，列出当前所有可用的视觉模板。

---

## 可用模板清单

| ID | 中文名 | 学科适配 | 风格关键词 | 内置 layouts | 互动页支持 | 路径 |
|----|------|---------|----------|-------------|-----------|------|
| `math-explorer` | 数学探索风 | 初中/高中数学（含物理、化学等理科） | 学术现代、深蓝+暖橙、网格背景 | `cover / intro / concept / formula / example / exercise / compare / summary` | 内置标准练习页 | `templates/数学探索风/` |
| `retro-zine` | 复古印刷风 | 语文、英语、人文主题、项目式学习、班会、综合实践 | 温暖纸张、深绿强调、油墨线框、拼贴手作感 | `cover / intro / concept / summary` | 不内置练习页，练习页与强互动页沿用 v69 标准互动结构 | `templates/复古印刷风/` |
| `8-bit-orbit` | 像素霓虹风 | 信息科技、编程主题、课堂竞赛、游戏化任务、互动练习 | 深蓝暗底、青粉黄霓虹、像素边框、CRT 质感 | `cover / concept / exercise / summary` | 内置标准练习页 | `templates/像素霓虹风/` |

> 后文若出现 `templates/<模板路径>/...`，实际应取本表「路径」列的目录，不要把模板 ID 直接当作文件夹名。
>
> 如果选中的模板没有某类 layout（如 `exercise.html`、`formula.html`），则：
> 1. 普通讲解页继续优先使用该模板已提供的 layouts；
> 2. 练习页、强互动页或缺失版式页回退到 v69 标准互动结构；
> 3. 回退页仍必须继承该模板的 `shared.css` 变量、标题区与基础装饰，禁止退回默认白底样式。

---

## AI 在 Phase 2.5 的操作步骤

1. 读取本文件，从上表获取所有可用模板
2. 结合大纲学科推荐模板
3. 调用 `ask_user` 单选模板 + 保底项「不使用模板，AI 自由发挥」
4. 记录用户选定的模板 ID、模板中文名、模板路径或 `"none"`

---

## AI 在 Phase 3 / Phase 4 的模板使用顺序（仅当选定了某个模板时）

```
Phase 3:
1. templates/<模板路径>/template.md        ← 读取 layout 决策树、占位符规则、禁忌
2. templates/<模板路径>/shared.css         ← 完整写入 page-shared
3. templates/<模板路径>/layouts/*.html     ← 按大纲页型选择可用 layout，搭空 page-data
4. 输出：空课件 HTML resourceId + 页面 layout 映射表 + 占位符填充清单

Phase 4:
1. 不再重新选择 layout，不再重写 page-data
2. 只根据 Phase 3 的占位符填充清单替换 {{P*_...}}
3. 若模板缺失对应 layout，则保留 Phase 3 已确定的 v69 标准互动结构，只替换内容和微调占位符
```

**当前模板包不包含**：`svg-snippets.md`、`svg/`、`examples/`。不要尝试读取这些路径。

---

## 模板的工作模型

```
┌─ 模板【管】的事 ─────────────────────────────────┐
│  ✅ HTML 版面骨架（layouts/）                    │
│  ✅ CSS 配色 / 字体 / 版式（shared.css 一份搞定） │
│  ✅ 空课件框架规则（Phase 3 先固定壳和 page-data）│
└────────────────────────────────────────────────┘
┌─ 模板【不管】的事 ───────────────────────────────┐
│  ❌ generate_image 画风                          │
│  ❌ 壳框架 JS（由 html-guide §3.1 固定 URL 提供） │
└────────────────────────────────────────────────┘
```

详细规则见 `html-guide.md`「〇、关于模板的硬性规则」。
