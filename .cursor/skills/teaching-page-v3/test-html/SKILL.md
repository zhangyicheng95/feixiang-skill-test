---
name: teaching-page-test-html-v3
description: >-
  验收阶段细则（v3）：浏览器手测、must-cover、验证结论卡。被 html-authoring /
  courseware-generator 的 Step 3 引用。
---

# 验收阶段（细则）

**被引用自**：

- 单页 Step 3 → `html-authoring/SKILL.md`
- 多页 Step 3 → `courseware-generator/SKILL.md`

**被测产物**：`pages/<slug>/index.html`

---

## 本目录文件

| 文件 | 路径 |
|------|------|
| 验收纪律 | `test-html/guide.md` |
| 断言模板 | `test-html/references/test-templates.md` |

## 工作流程

```
1. Read test-html/guide.md
2. 从 spec / core-loop / forbid / require 抽 must-cover
3. browser_navigate → pages/<slug>/index.html
4. 逐项手测 → 验证结论卡
5. 未通过 → 回 html-authoring 或 courseware-generator Step 2 修复
```

## 多页额外项

- 壳加载、缩略图预览
- 键盘/点击翻页
- saveState 恢复（往前翻页）

## 闸门

- core-loop 未测通 → 不得交付
- multi 壳未加载 → 不得交付

## 验证结论卡

```
## 验证结论
- 状态：✓ / ⚠ / ✗
- 需求覆盖：N/M 项
- 下一步：修复 / 补测 / 交付
```
