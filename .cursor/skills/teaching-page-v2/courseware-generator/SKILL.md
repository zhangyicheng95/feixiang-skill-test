---
name: teaching-page-v2-courseware-generator
description: >-
  Teaching Page v2 第 ② 步（多页）：生成本目录规范下的多页 PPT 式课件。
  multi 模式路由后调用。
---

# 第 ② 步（multi）：多页课件生成

> **规范（生成前必读）**：
> - [guide.md](guide.md)
> - [content-guide.md](content-guide.md)
> - [style-guide.md](style-guide.md)
> - 含选择题时：[quiz-patterns.md](quiz-patterns.md)
>
> 大纲已在 ① 步：`pages/<slug>/outline.md`

## 前置

- ① 步完成：`outline.md`（已确认）、`assets-manifest.md`
- `mode: multi`

## 执行顺序

```
1. Read guide.md
2. Read content-guide.md — 从「步骤 0 复杂度评估」起
3. Read style-guide.md — 编写时对照
4. Read outline.md + assets-manifest.md
5. Write pages/<slug>/index.html（骨架 → 分批注入）
6. 复制 ../assets/courseware-shell.js → pages/<slug>/
7. → test-html 验收
```

## HTML 要点

- `<template class="page-data">`；`data-id` 从 1 连续
- 视口 960×540；壳：`<script src="./courseware-shell.js"></script>`
- 素材 URL 来自 manifest；禁止 base64
- 练习页须含互动闭环；**同页多题须逐题切换、禁止滚动堆题**，见 [quiz-patterns.md](quiz-patterns.md)
- `page-shared` 须声明 `--canvas-bg` 画布底色（见 [feixiang-style.md](../feixiang-style.md) §4.6、[style-guide.md](style-guide.md) §4.1）
- 选择题：**选题 → 确认答案 → 对错 + 解析 → 下一题**（`explain` 字段 + `revealed` 状态）

## 本地壳

```
Read  ../assets/courseware-shell.js
Write pages/<slug>/courseware-shell.js
```

下载按钮会打包为**单文件 HTML**（导出模式：**无顶栏**，**保留缩略图侧栏**），双击即可播放。

## 补充自检

```
□ 已 Read guide + content-guide + style-guide
□ 逐页对照 outline，无遗漏
□ index.html 与 courseware-shell.js 同目录
□ 互动页 postMessage 状态已接
□ 若有单选/多选：符合 quiz-patterns.md（逐题、确认出解析、saveState）
□ page-shared 含 --canvas-bg，html/body/.page-container 已应用
```

## 下一步

→ [../test-html/SKILL.md](../test-html/SKILL.md)
