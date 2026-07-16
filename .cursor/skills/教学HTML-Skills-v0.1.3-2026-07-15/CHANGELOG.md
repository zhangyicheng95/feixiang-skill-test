# 教学 HTML Skills v0.1.3

> 基于 `教学HTML-Skills-v0.1.2-2026-07-14` 复制增强。  
> 目录：`.cursor/skills/教学HTML-Skills-v0.1.3-2026-07-15/`

## 架构原则

| 内容 | 策略 |
|---|---|
| 生图规范 | **各自独立**：`html-authoring` / `courseware-generator` 各有一份 `references/image-generation.md`，禁止互相读取 |
| 验收 | **共用**：两边 Step 3 都读 `test-html/SKILL.md` |
| 多页入口目录 | `courseware-generator/`（由 `teaching-page-courseware-generator-v0.1.3/` 改名） |

## 相对 v0.1.2 的变更

### 生图

1. `courseware-generator/references/image-generation.md` — 多页 + 封面槽位 + `generate_images`
2. `html-authoring/references/image-generation.md` — 单页独立副本
3. 服务生图工具名：**`generate_images`**

### 验收

- Step 3 **共用** `test-html/`

## 入口

| 场景 | 入口 |
|---|---|
| 单页生成 | `html-authoring/SKILL.md` |
| 多页课件生成 | `courseware-generator/SKILL.md` |
| 验收（Step 3 或单独验收） | `test-html/SKILL.md` |
