---
name: teaching-page-assets
description: >-
  Teaching Page v2 第 ① 步：确认需求、抽取 spec、准备素材清单。
  在生成 HTML 之前必须执行。
---

# 第 ① 步：素材与需求确认

> 多页大纲结构见 [../courseware-generator/outline-guidance.md](../courseware-generator/outline-guidance.md)（MVP 可简化）。

## 工作流程

```
1. 解析用户原文 → 验收要点 + 模式确认
2. 互动类 → 声明最小 core-loop
3. multi → 生成大纲 → 用户确认 → Write outline.md
4. 准备素材 → Write assets-manifest.md
5. 创建 pages/<slug>/
```

## spec 字段

```
requirements=用户硬要求逐条
require=必含元素
forbid=禁止项
core-loop=互动类闭环
```

## 核心玩法闭环

| 品类 | 最小闭环 |
|---|---|
| 选择题/闯关 | 出题 → 作答 → 反馈 → 下一题或重置 |
| 拖拽配对 | 真拖拽 → 检查按钮 → 反馈 → 重置 |
| 模拟/动画 | 开始 / 暂停 / 重置 |

## multi 大纲

**Read** [../courseware-generator/outline-guidance.md](../courseware-generator/outline-guidance.md) 了解结构；写入 `pages/<slug>/outline.md` 逐页设计表，用户确认后继续。

## 素材清单

写入 `pages/<slug>/assets-manifest.md`；图片/音频须真实 URL，禁止 base64 大图。

## 自检

```
□ spec 四字段已整理
□ 互动类 core-loop 已声明
□ multi：outline 已确认
□ assets-manifest 已 Write
```

## 下一步

- single → [../html-authoring/SKILL.md](../html-authoring/SKILL.md)
- multi → [../courseware-generator/SKILL.md](../courseware-generator/SKILL.md)
