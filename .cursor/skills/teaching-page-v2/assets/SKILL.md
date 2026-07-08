---
name: teaching-page-assets
description: >-
  素材阶段细则：spec、outline.md、assets-manifest.md。被 html-authoring /
  courseware-generator 的 Step 1 引用；单独新建任务也可先 Read 本 Skill。
---

# 素材阶段（细则）

**被引用自**：

- 单页 Step 1 → `html-authoring/SKILL.md`
- 多页 Step 1 → `courseware-generator/SKILL.md`

---

## 路由

| 模式 | 后续 |
|------|------|
| `single` | `html-authoring/SKILL.md` Step 2 |
| `multi` | `courseware-generator/SKILL.md` Step 2 |

## 本目录文件

| 文件 | 路径 |
|------|------|
| 大纲指南（multi） | `assets/outline-guidance.md` |

## spec 四字段

```
requirements=用户硬要求
require=必含元素
forbid=禁止项
core-loop=互动闭环
```

## multi 大纲

Read `assets/outline-guidance.md` → Write `pages/<slug>/outline.md` → 用户确认。

## 素材清单

Write `pages/<slug>/assets-manifest.md`；真实 URL，禁止 base64 大图。

## 自检

```
□ spec 四字段
□ multi：outline 已确认
□ assets-manifest 已 Write
```
