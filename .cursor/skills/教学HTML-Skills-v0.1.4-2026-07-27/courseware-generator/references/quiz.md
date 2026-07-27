# 选择题互动模板（单选 / 多选）

> 路径：`courseware-generator/references/quiz.md`

课件「练习」页含选择题时，须实现完整闭环并 `postMessage` 保存状态。

## 核心规则：同页逐题，禁止滚动堆题

**多道题（如单选 10 道）占课件 1 个 `page-data` 页，但 UI 一次只显示 1 道题。**

| 要求 | 说明 |
|------|------|
| 同页 | 全部题目在同一个 `<template class="page-data">` 内 |
| 逐题显示 | 做完当前题 → 点「下一题」→ **切换 DOM 加载下一道** |
| 禁止 | 把 10 道题纵向堆在同一屏内靠滚动做完 |
| 进度 | 须显示 `第 n / N 题` 或进度条 |
| 导航 | 「上一题」「下一题」；**先「确认答案」再出解析**，末题后为「查看结果」 |
| 逐题反馈 | **每题做完须立即显示正确答案 + 解析**（`.tip` 或 `.explain`），再进入下一题 |
| 结果 | 全部做完后在本页内切到结果视图（得分 + 重做） |

多选题题组较多时（如 5 道多选），同样遵守**同页逐题、不滚动**。

## 单选题（Single Choice）

- 每题 **只能选一个**
- 未选题时「确认答案」禁用
- **流程**：选题 → **确认答案** → 显示对错 + 解析 → **下一题**
- 已确认题回看时保持对错色与解析
- 数据结构：`QUESTIONS = [{ stem, options:[{k,text}], ans:'B', explain:'…' }, ...]`

## 多选题（Multiple Choice）

- 每题 **可选多个**；题干注明多选
- 同页逐题切换，禁止一屏堆多题
- **每题提交后**显示应选项 + 解析，再「下一题」
- 判分：选对 + 选错 + 漏选（`missed`）

## 状态保存（`postMessage`）

```javascript
{
  phase: 'quiz' | 'result',  // 答题中 / 结果页
  index: 0,                  // 当前题号 0-based
  answers: {},               // 单选: {0:'B'}  多选: {0:{A:true,C:true}}
  revealed: {}               // 单选: {0:true} 已确认并出解析的题
}
```

## 成绩上报 SCORM（`cwScore`）

练习页判分后，除 `saveState` 外**必须**再向 `window.parent` 发一条 `cwScore`，
壳会聚合各练习页成绩写入 `cmi.score.*` 与 `cmi.success_status`（部署到 LMS 时自动上报；
普通打开时无副作用）。

```javascript
// 判分得到 ok（答对数）/ total（总题数）后：
window.parent.postMessage({
  type: 'cwScore',
  id: (window.__CW_PAGE__ && window.__CW_PAGE__.id) || 0, // 本练习页 id，用于跨页聚合
  raw: ok,
  max: total
}, '*');
```

- 每个练习页用**各自的 `id`**上报，壳按 id 聚合：总分 = Σraw / Σmax。
- 单选卷在进入结果页时报一次；多选卷在提交判分后报一次。
- 重做后可再次上报（同 id 覆盖）。

## 共用纪律

```
□ 同页多题 = 逐题切换，不滚动堆题
□ 每题：确认 → 对错 + 解析 → 下一题
□ 每个选项有 click，选中后 UI 变化
□ 上一题 / 下一题 / 重做
□ saveState / restoreState
□ 判分后发送 cwScore（id + raw + max）供 SCORM 成绩上报
□ 结果页含得分与简要总结（逐题解析已在答题时出现）
```

## 与课件分页

- **课件翻页**（壳 sidebar）：不同教学活动（讲解 / 拖拽 / 单选卷 / 多选卷）
- **卷内切题**：同一 `page-data` 内的 JS 切换，不是新建 `page-data`
