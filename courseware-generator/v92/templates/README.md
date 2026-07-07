# 互动课件模板索引

> 本文件由 SKILL 的 Phase 2.5 读取，列出当前所有可用的视觉模板。

---

## 一、可用模板清单

| ID | 中文名 | 学科适配 | 风格关键词 | 路径 |
|----|--------|----------|------------|------|
| `math-explorer` | 数学探索风 | 初中/高中数学（含物理、化学等理科） | 学术现代、深蓝+暖橙、网格背景 | `templates/数学探索风/` |
| `none` | 不使用模板 | 通用 | AI 自由发挥配色与版式 | — |

> 后续将扩展更多学科模板。所有模板都遵守相同结构：`skeleton.html` + `layouts/` + `shared.css` + `template.md`。

---

## 二、Phase 2.5 操作步骤

1. 读取本文件，取得可用模板清单（**仅 ID + 中文名 + 学科适配**，无需读模板内部文件）
2. 结合大纲学科推荐 1 个模板，调用 `ask_user`：
   - 例：`数学探索风（学术现代风，适合数理化）`
   - 例：`不使用模板，AI 自由发挥`
   - `allowCustomAnswer=False`
3. 记录用户选定的 ID（`math-explorer` 或 `none`），传递给 Phase 3 / Phase 4
4. 若用户选了具体模板（非 `none`）→ 立即 `read templates/<选定模板>/template.md`

---

## 三、Phase 4 装载顺序【新流程：skeleton + 填槽】

**仅当用户选了具体模板时执行**：

```
1. read templates/<选定模板>/template.md
   ← 看「layout 决策树 + 占位符表 + 致命禁忌」

2. read templates/<选定模板>/skeleton.html
   ← 拿到完整骨架字符串（已含壳脚本 + 完整 shared.css + <!-- CW_PAGES -->）

3. create_file 课件.html
   ← content = 步骤 2 read 的字符串【原样复制，禁止增删任何字符】
   ← 仅把 <title>{{COURSEWARE_TITLE}}</title> 中的占位符换为课件实际标题
   ← 记录 resourceId

4. 对大纲每一页：
   4a. 按 template.md 「layout 决策树」选 1 个 layout
   4b. read templates/<选定模板>/layouts/<选定 layout>.html
   4c. 在 reasoning 中把 layout 里的所有 {{XXX}} 替换为该页真实内容
       - 文字占位符 → 大纲字段
       - 图片占位符 → Phase 3 generate_image 的 URL
       - exercise 的 {{CA}}/{{CB}}/{{CC}}/{{CD}} → 正确选项填 "1"、其余填 "0"
   4d. 把【替换后的整段 page-data 块】作为本页输出

5. 分批 edit_file 注入（每批 1-5 页）：
   edit_file:
     oldString = "<!-- CW_PAGES -->"
     newString = "<本批所有页（占位符已替换）>\n\n<!-- CW_PAGES -->"

6. 自检：
   - <template class="page-data"> 数量 = 大纲页数
   - 没有任何 {{XXX}} 残留
   - 壳脚本 URL 仍为 HgSiredEejFXx94ofdiCZ8
```

> **关键变化**：模型不再凭记忆默写 HTML，而是 read → 替换占位符 → edit_file 注入。

**不需要也禁止读取**：`shared.css`（已 inline 在 skeleton.html 中）、`tokens.json`（仅参考用，无需读）。

---

## 四、模板的工作边界

```
┌─ 模板【管】的事 ─────────────────────────────────────┐
│  ✅ 整份 .html 的壳脚本 + 全局 CSS（skeleton.html）    │
│  ✅ 每页的版面骨架 + class 命名（layouts/）            │
│  ✅ 配色 / 字体 / 装饰 / Tailwind 兼容                │
└────────────────────────────────────────────────────┘
┌─ 模板【不管】的事 ───────────────────────────────────┐
│  ❌ generate_image 画风（AI 自由生图）               │
│  ❌ 课件内容插图主题                                  │
│  ❌ 强互动页的具体 JS 实现                            │
└────────────────────────────────────────────────────┘
```

详细规则见 `templates/数学探索风/template.md` 与 `html-guide.md`「〇、关于模板的硬性规则」。
