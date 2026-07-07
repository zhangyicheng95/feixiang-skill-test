# Teaching Page Harness 版本

## 当前架构（v2 · MVP · 自包含）

```
teaching-page-v2/
├── SKILL.md
├── feixiang-style.md
├── assets/
│   ├── SKILL.md                  ①
│   └── courseware-shell.js
├── html-authoring/
│   ├── SKILL.md                  ② single
│   ├── guide.md
│   └── math-design/
├── courseware-generator/
│   ├── SKILL.md                  ② multi
│   ├── guide.md
│   ├── outline-guidance.md
│   ├── content-guide.md
│   └── style-guide.md
└── test-html/
    ├── SKILL.md                  ③
    ├── guide.md
    └── references/

pages/<slug>/                     产物
```

## Workflow

```
① assets → ② html-authoring | courseware-generator → ③ test-html
```

## 变更

- **2026-07-07**：v2 自包含，规范迁入 teaching-page-v2/，不再 Read 仓库根目录 Skill
- **2026-07-07**：MVP 三步编排 + 多页/单页
- **2026-07-07**：v1 冻结

## v1

`teaching-page-v1/` 冻结归档，v2 不再依赖。
