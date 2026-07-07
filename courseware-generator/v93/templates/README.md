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

## 三、Phase 4 流程【skeleton + multi_edit 填槽】

**仅当用户选了具体模板时执行**：

```
1. read templates/<选定模板>/template.md       # 占位符表 + layout 决策树
2. read templates/<选定模板>/skeleton.html     # 拿到完整骨架

3. create 课件.html
   content = 步骤 2 read 的字符串【原样复制】
   仅替换 <title>{{COURSEWARE_TITLE}}</title> 中的占位符

4. 对大纲每一页（逐页串行）：
   4a. 按「layout 决策树」选 1 个 layout
   4b. read templates/<选定模板>/layouts/<选定 layout>.html
   4c. reasoning：准备该页所有占位符的【键 → 真值】映射
   4d. multi_edit（一次调用 = 注入 + 全部占位符替换）：
       editItems:
         # 第 1 项：先把 CW_PAGES 替换为 layout 原样（含 {{XXX}}）
         - oldString: "<!-- CW_PAGES -->"
           newString: "<layout 原样字符串>\n\n<!-- CW_PAGES -->"
         # 第 2~N+1 项：替换刚注入的占位符
         - oldString: "{{DATA_ID}}"
           newString: "3"
         - oldString: "{{TITLE}}"
           newString: "化繁为简"
         - ...

5. 自检：
   - <template class="page-data"> 数量 = 大纲页数
   - 没有 {{XXX}} 残留
   - 壳脚本 URL = HgSiredEejFXx94ofdiCZ8
```

> **关键变化**：AI **只输出键值对**，HTML 结构永远来自 layout 文件。`multi_edit` 工具做精确替换，AI 完全不重写 HTML。

**不需要也禁止读取**：`shared.css`（已在 skeleton 中）、`tokens.json`（仅供参考）。

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
