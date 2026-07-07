---
name: teaching-page-v2
description: >-
  K12 教学页面 MVP Harness（三步：素材 → 生成 → 验收）。规范全部在本目录内，
  不引用仓库外 Skill。用户要教学页面、互动课件、单页游戏、多页 PPT 课件、
  课堂演示、答题页时使用。
---

# Teaching Page v2（MVP Harness）

在 **Cursor Agent** 中完成「素材 → 生成 → 验收」三步闭环。
**所有规范只读 `teaching-page-v2/` 目录内文件**；产物写入 `pages/<slug>/`。

## 路由（第 0 步，命中即停）

| 用户意图 | 模式 | 第 ② 步 | 产出 |
|---|---|---|---|
| 多页 / 课件 / PPT / 翻页 / 缩略图 / ≥2 页 | `multi` | [courseware-generator/SKILL.md](courseware-generator/SKILL.md) | `index.html` + `courseware-shell.js` |
| 其他（单页动画、游戏、海报、练习） | `single` | [html-authoring/SKILL.md](html-authoring/SKILL.md) | 1 个 `index.html` |

需求模糊时默认 `single`；明确页数 ≥2 或「课件」→ `multi`。

## 主流程（必须按序，不可跳步）

```
第 0 步  路由 single / multi
   ↓
第 ① 步  Read assets/SKILL.md
   ↓
第 ② 步  Read html-authoring/SKILL.md 或 courseware-generator/SKILL.md
   ↓
第 ③ 步  Read test-html/SKILL.md
   ↓
交付    告知打开路径 + 验证结论卡
```

**禁止**：Read 本目录外的 Skill；未做 ① 直接写 HTML；未做 ③ 就宣称交付。

## 本目录规范索引

| 步骤 | 入口 | 详细规范 |
|---|---|---|
| ① 素材 | [assets/SKILL.md](assets/SKILL.md) | — |
| ② single | [html-authoring/SKILL.md](html-authoring/SKILL.md) | [html-authoring/guide.md](html-authoring/guide.md)、[math-design/](html-authoring/math-design/) |
| ② multi | [courseware-generator/SKILL.md](courseware-generator/SKILL.md) | [guide.md](courseware-generator/guide.md)、outline / content / style |
| ③ 验收 | [test-html/SKILL.md](test-html/SKILL.md) | [test-html/guide.md](test-html/guide.md) |
| 视觉 | [feixiang-style.md](feixiang-style.md) | 飞象平涂描边风 |
| 环境 | [local-harness.md](local-harness.md) | Cursor 工具映射 |

## 产物目录

```
pages/<slug>/
├── index.html
├── courseware-shell.js     # multi：从 assets/courseware-shell.js 复制
├── outline.md              # multi
└── assets-manifest.md
```

## 交付自检

```
□ 已 Write 到 pages/<slug>/
□ ① spec + 素材清单已落盘
□ ② 互动类 core-loop 已实现；multi 壳脚本同目录
□ ③ 验证结论卡 ✓ 或已说明人工补测
□ 已告知浏览器打开方式
```

## 附加参考

- [workflow.md](workflow.md) — 逐步细节
- [local-harness.md](local-harness.md) — Cursor 适配
- [../VERSIONS.md](../VERSIONS.md) — 版本记录
