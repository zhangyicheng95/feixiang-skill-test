---
name: teaching-page-v2-test-html
description: >-
  Teaching Page v2 第 ③ 步：HTML 验收。生成或修改 HTML 后必须执行；
  浏览器手测 must-cover 清单。
---

# 第 ③ 步：测试与验收

> **详细纪律**：[guide.md](guide.md)（must-cover、失败处理）
>
> 断言模板（按需）：[references/test-templates.md](references/test-templates.md)
>
> 环境：[../local-harness.md](../local-harness.md)

## 何时执行

- ② 步 Write 完成后
- 用户反馈 bug → 先复现再修再回归

## 工作流程

```
1. Read guide.md（must-cover 章节）
2. 抽 must-cover 清单（交互 / 约束 / core-loop / 可达性）
3. browser_navigate 打开 pages/<slug>/index.html
4. 逐项手测，记录 ✓/✗
5. 输出验证结论卡
6. 未通过 → 回 ② 修复
```

## must-cover 四类来源

| 来源 | 手测项 |
|---|---|
| ① 动词+名词 | 操作后状态变化 |
| ② 声明式约束 | 全页扫描 forbid/require |
| ③ core-loop | **第一条**：端到端走通 |
| ④ 可达性 | multi 壳加载、翻页 |

**spec 优先**：`<!-- spec: ... -->` 逐条转测试项。

## 验证结论卡（必填）

```
## 验证结论
- 状态：✓ 完全通过 / ⚠ 部分通过 / ✗ 未通过
- 需求覆盖：N/M 项已验证
  - [1] <条目>：✓ / ✗
- 下一步：修复页面 / 补测 / 完成交付
```

### 闸门

- core-loop 未测通 → 不得交付
- multi 壳未加载 → 不得交付

## 失败处理

默认 HTML 有问题；连续失败 ≥2 次换诊断（snapshot 看 DOM）。

## 回退

→ [../html-authoring/SKILL.md](../html-authoring/SKILL.md) 或 [../courseware-generator/SKILL.md](../courseware-generator/SKILL.md)
