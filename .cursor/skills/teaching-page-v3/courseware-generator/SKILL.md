---
name: teaching-page-courseware-generator-v3
description: >-
  K12 多页课件 HTML 全流程（v3）：① 素材（spec/outline/manifest）→ ② 生成 index.html+壳
  → ③ test 验收。960×540、逐题测验。单页见 html-authoring/SKILL.md。
---

# 多页课件生成

**产物**：`pages/<slug>/index.html` + `courseware-shell.js`  
**验收**：`test-html/SKILL.md`  
**流程图**：`workflow.md`

---

## 目录结构

```
courseware-generator/
├── SKILL.md                 ← 本文件（唯一入口）
├── workflow.md              ← 调用流程图（Read/Write/复制顺序）
├── manifest.md              ← Step 1：spec、素材清单规则
├── outline-guidance.md      ← Step 1：大纲生成（多页专用）
├── assets/
│   └── courseware-shell.js  ← 静态壳脚本，复制到产物目录（只复制不 Read）
└── references/
    ├── html.md              ← Step 2 必读
    ├── typography.md        ← Step 2：字体 preset
    ├── cover.md             ← Step 2：封面版式
    └── quiz.md              ← 含练习时必读
```

---

## 总流程

```
Step 1  素材    spec + outline.md + assets-manifest.md
   ↓
Step 2  内容    index.html + courseware-shell.js
   ↓
Step 3  验收    浏览器手测 + 验证结论卡
```

**禁止**：跳过 Step 1 直接写 HTML；未通过 Step 3 即宣称交付。

---

## Step 1：生成素材

Read `manifest.md`，按其中流程执行：

1. 整理 spec 四字段
2. Read `outline-guidance.md` → Write `pages/<slug>/outline.md` → **用户确认**
3. Write `pages/<slug>/assets-manifest.md`

---

## Step 2：生成内容

### 必读顺序

| 顺序 | 文件 | 何时 |
|------|------|------|
| 1 | `references/html.md` | 始终 |
| 2 | `references/typography.md` | 选定字体 preset |
| 3 | `references/cover.md` | 生成第 1 页封面前 |
| 4 | `references/quiz.md` | outline 含练习页时 |
| — | `pages/<slug>/outline.md` + `assets-manifest.md` | 对照生成 |

### 执行

```
1. 按 references/html.md §四 流程生成 index.html
2. 复制 assets/courseware-shell.js → pages/<slug>/courseware-shell.js
3. 对照 outline 逐页验收（references/html.md §八）
```

### 硬要点

- 画布 960×540；`<script src="./courseware-shell.js">`
- 互动页 `saveState` / `restoreState`；练习页 `cwScore`（见 references/quiz.md）
- 禁止手写壳代码

---

## Step 3：验收

见 `test-html/SKILL.md`（必读 `test-html/guide.md`）。未通过 core-loop / must-cover 不得宣称交付。

---

## 交付物

```
pages/<slug>/
├── index.html
├── courseware-shell.js
├── outline.md
└── assets-manifest.md
```

本地预览：`cd pages/<slug> && python3 -m http.server 8765`

---

## SCORM（壳内置）

练习页须 `postMessage({type:'cwScore', id, raw, max})`，详见 `references/quiz.md`。
