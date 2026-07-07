# 互动课件模板索引

> 本文件由 SKILL 的 Phase 2.5 读取，列出当前所有可用的视觉模板。AI 根据下方表格调用 `ask_user`，让用户单选模板，再据此装载模板资源进入 Phase 4。

---

## 可用模板清单

| ID | 中文名 | 风格关键词 | 适合题材 | 不适合题材 | 路径 |
|----|------|----------|----------|-----------|------|
| `yuppies-hand-drawn` | Yuppies 手绘风 | 现代极简、手绘插画、柔和色块（粉/黄/紫）、教育友好 | 人文社会 / 阅读理解 / 综合实践 / 艺术鉴赏 | 严肃数理推导 / 商务正式 | `templates/Yuppies手绘风/` |

---

## AI 在 Phase 2.5 的操作步骤

1. 读取本文件，从上表获取所有可用模板
2. 调用 `ask_user`，把每个模板做成一个单选选项，**选项末尾必须追加保底项**：
   - `Yuppies 手绘风（现代极简手绘插画风，适合人文社会/阅读理解类）`
   - `不使用模板，AI 自由发挥`
3. 设置 `allowCustomAnswer=False`
4. 记录用户选定的**模板 ID**（如 `yuppies-hand-drawn`）或 `"none"`
5. 把选定结果传递到 Phase 3 和 Phase 4

---

## AI 在 Phase 4 的模板装载顺序（仅当选定了某个模板时）

按以下顺序读取选定模板下的入口文件：

```
1. templates/<模板路径>/template.md       ← 风格说明书，必读
2. templates/<模板路径>/tokens.json       ← 颜色/字体 token
3. templates/<模板路径>/shared.css        ← 必须完整写入 <template class="page-shared"> 的 <style>
4. templates/<模板路径>/layouts/*.html    ← 按页面用途选用版式骨架
5. templates/<模板路径>/examples/sample.html  ← 完整样张，作为视觉参考
```

> **【重要变更】不再约束 `picture_gen` 风格**：模板只控制 HTML 版面（配色、字体、布局），课件内容插图由 AI 根据题目自由生成，与模板风格无关。

详细的模板使用规则见 `html-guide.md` 中"〇、关于模板的硬性规则"章节。
