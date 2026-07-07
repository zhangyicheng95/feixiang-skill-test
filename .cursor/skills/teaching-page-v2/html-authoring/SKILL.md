---
name: teaching-page-v2-html-authoring
description: >-
  Teaching Page v2 第 ② 步（单页）：生成本目录规范下的单页教学 HTML。
  single 模式路由后调用。
---

# 第 ② 步（single）：单页 HTML 生成

> **规范（生成前必读）**：[guide.md](guide.md)
>
> 数学附件（仅数学路由）：[math-design/](math-design/)
>
> 视觉补充：[../feixiang-style.md](../feixiang-style.md) · 环境：[../local-harness.md](../local-harness.md)

## 前置

- ① 步完成：`assets-manifest.md`、spec 草稿
- `mode: single`

## 执行顺序

```
1. Read guide.md（全文）
2. 学科路由（guide §学科路由）
   - 数学 → Read math-design/workflow.md → 色板 → visual-impact.md
   - 非数学 → 仅 guide.md，禁止读 math-design
3. Read pages/<slug>/assets-manifest.md
4. Write pages/<slug>/index.html
5. 过 guide 交付自检 + 下方补充自检
```

## 产物

| 项 | 要求 |
|---|---|
| 路径 | `pages/<slug>/index.html` |
| spec | `<head>` 内 `<!-- spec: ... -->` |
| 数学 | 首行 palette 注释 |
| 素材 | 来自 manifest |

## 补充自检

```
□ 已 Read guide.md（数学另读 math-design）
□ 已 Write index.html
□ core-loop 每步可触发
□ 每个按钮有事件且有效
```

## 下一步

→ [../test-html/SKILL.md](../test-html/SKILL.md)
