# 互动课件模板索引

> Phase 2.5 由本文件驱动：列出所有可选视觉模板，让用户挑一个。

---

## 一、可用模板清单

| ID | 中文名 | 学科适配 | 风格关键词 | 路径 |
|----|--------|----------|------------|------|
| `math-explorer` | 数学探索风 | 初中/高中数学（含物理、化学等理科） | 学术现代、深蓝+暖橙、网格背景 | `templates/数学探索风/` |
| `none` | 不使用模板 | 通用 | AI 自由发挥配色与版式 | — |

> 后续将扩展更多学科模板，每个模板都遵守相同的「skeleton.html + layouts/」结构。

---

## 二、Phase 2.5 操作步骤

1. 读取本文件，取得可用模板清单（**仅 ID + 中文名 + 学科适配**，无需读模板内部文件）
2. 结合大纲学科推荐 1 个模板，调用 `ask_user`：
   - 选项 1：`数学探索风（学术现代风，适合数理化）`
   - 选项 2：`不使用模板，AI 自由发挥`
   - `allowCustomAnswer=False`
3. 记录用户选择的 ID（`math-explorer` 或 `none`），传递给 Phase 4

---

## 三、Phase 4 模板装载顺序（仅当选了模板时）

新版采用 **skeleton + layout 填槽**流程：

```
1. read templates/<选定模板>/template.md   ← 占位符表 + layout 决策树
2. read templates/<选定模板>/skeleton.html ← 拿到完整骨架字符串
3. create_file 课件.html                   ← content 直接用步骤 2 的字符串原样复制
4. 对大纲每一页：
   4a. 决定该页使用哪个 layout
   4b. read templates/<选定模板>/layouts/<选定 layout>.html
   4c. 在 reasoning 中把 layout 里的 {{占位符}} 全部替换为真实内容
   4d. edit_file: oldString="<!-- CW_PAGES -->", newString="<已替换占位符的 layout 内容>\n\n<!-- CW_PAGES -->"
5. 自检：page-data 数量 = 大纲页数
```

> **关键**：模型不再凭记忆写 HTML，而是 read → 替换占位符 → edit_file 注入。

---

## 四、模板的工作边界

```
┌─ 模板【管】的事 ──────────────────────────────────┐
│  ✅ 整份 .html 的「壳」+ 全局 CSS（skeleton.html） │
│  ✅ 每页的版面骨架（layouts/）                    │
│  ✅ 配色 / 字体 / 装饰 / Tailwind 兼容             │
└────────────────────────────────────────────────┘
┌─ 模板【不管】的事 ────────────────────────────────┐
│  ❌ generate_image 画风（AI 自由生图）            │
│  ❌ 课件内容插图主题（鸡、兔、叶子...）            │
│  ❌ 强互动页的具体 JS 实现                        │
└────────────────────────────────────────────────┘
```

详细规则见各模板的 `template.md` 与 `html-guide.md` § 「关于模板的硬性规则」。
