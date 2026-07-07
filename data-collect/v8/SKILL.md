---
name: data-collect
description: 当用户需要生成 **多人参与、数据持久化** 的交互式 HTML 时使用。典型场景：收集信息、答题测验、投票、签到、问卷调查、互评打分、多人游戏、排行榜、统计报告。不适用于：纯前端演示、无需保存数据的静态页面。
---

更新时间：2026-04-24

# 数据收集应用生成

生成带后端数据存取的交互式 HTML。框架只管存取，业务逻辑由前端代码实现。

## 何时触发

用户意图涉及以下任一场景：
- 需要**收集**多人提交的数据（问卷、报名、签到、投票）
- 需要**答题/测验**并记录成绩
- 需要**统计/汇总**多人数据并展示报告
- 需要**互评/排行榜**等跨用户数据共享
- 需要**多人参与的游戏**并保存状态

**不触发**：纯前端动画/演示、单人本地游戏、无需持久化的静态展示。

## 工作流程

```
理解需求 → 追问收集指标（不清楚时用 continue_ask）
         → create_instance 获得 instanceId
         → create 生成 HTML × N（内嵌 mock 数据，从 URL 参数读取 instanceId）
         → bind_resources 写入资源信息
         → 向用户展示带 instanceId 的访问链接
```

## 数据模型

| 概念 | 谁管 | 说明 |
|---|---|---|
| **instanceId** | AI 通过 create_instance 获取 | 数据收集空间标识，通过 URL 参数传递 |
| **docId** | SDK 自动管理 | 参与者唯一 ID（UUID），同设备始终一致，作为记录主键 |
| **collection** | AI 代码定义 | 表名，小写英文 |
| **data** | AI 代码定义 | 任意 JSON，用户身份信息也存这里 |

- 同一 `(instanceId, collection, docId)` 再次 save 是覆盖更新，不是新增
- 固定内容（题目、选项、规则）写死在 HTML 中，只有用户产生的动态数据通过 SDK 存取

## 工具调用顺序

```
1. create_instance()              → 获得 instanceId
2. create 生成 HTML_1             → 收集页（从 URL 参数读取 instanceId）
3. create 生成 HTML_2（可选）      → 报告页（同上）
4. bind_resources(instanceId, [   → 将资源信息写入 instance 记录
     {"resourceId": xxx, "role": "collect", "name": "填写页"},
     {"resourceId": yyy, "role": "report",  "name": "报告页"}
   ])
5. 向用户展示访问链接              → 每个链接带 ?instanceId=xxx
```

**修改 HTML 后**：如果用户要求修改已生成的 HTML（如改题目、调样式），修改会产生新的 resourceId，需要重新调用 bind_resources 更新资源信息。

## 两种模式

HTML 通过 URL 参数区分预览和真实模式：

```javascript
var instanceId = new URLSearchParams(location.search).get('instanceId');

if (instanceId) {
  // 真实模式：只使用后端数据，禁止混入 mock 数据
  var sdk = new MuskCollect(instanceId);
  sdk.query('submissions').then(function(list) { render(list); });
} else {
  // 预览模式：展示内嵌 mock 数据
  render(MOCK_DATA);
}
```

**严格边界**：
- 真实模式（有 instanceId）：**只展示后端返回的数据，即使为空也不能混入 mock 数据**。数据为空时正常显示"暂无数据"或数值为 0。
- 预览模式（无 instanceId）：展示内嵌 mock 数据，仅用于预览排版效果。

**MOCK_DATA 要求**：AI 生成时需内嵌 3~5 条贴合场景的 mock 数据，确保预览时页面看起来是有真实数据的完整效果。

## MuskCollect SDK

SDK地址（必须引用，不能编造）：

```html
<script src="https://www.feixianglaoshi.biz/fedebug/musk-workbench-web/feature/app-center/musk-collect/musk-collect.js?v=1.1.1"></script>
```

初始化：`var sdk = new MuskCollect(instanceId)`，instanceId 从 URL 参数获取。

| 方法 | 参数 | 返回值 | 说明 |
|---|---|---|---|
| `new MuskCollect(instanceId)` | `instanceId`: String（必填） | `MuskCollect` 实例 | 创建 SDK 实例 |
| `sdk.save(collection, data)` | `collection`: String, `data`: Object | `Promise<Boolean>` | 存储数据，相同 docId 会覆盖更新 |
| `sdk.get(collection)` | `collection`: String | `Promise<CollectData>` | 获取当前用户在该集合下的数据 |
| `sdk.query(collection)` | `collection`: String | `Promise<Array<CollectData>>` | 查询该集合下所有参与者的数据 |

**CollectData 结构：**

```json
{
  "collection": "submissions",
  "docId": "inst_xxx-a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
  "data": { ... },
  "createdAt": 1713350400000,
  "updatedAt": 1713350400000
}
```

## 核心规则

1. **docId 由 SDK 自动管理**，身份信息（昵称、学号等）存 `data`
2. **身份表单文案贴合场景**，禁止出现技术术语
3. **报告视图展示身份从 `data` 取**，不展示 docId
4. **instanceId 不硬编码在 HTML 中**，从 URL 参数读取
5. **无 instanceId 时展示 mock 数据**，确保预览有完整效果
6. **有 instanceId 时禁止混入 mock 数据**，即使后端数据为空也只展示真实状态

## 页面生成

推荐按角色生成**独立的多个 HTML**，各自承担不同职责：

- **收集页**：身份收集 + 业务交互 + 提交反馈，给参与者使用
- **报告页**：数据统计 + 明细列表 + 刷新按钮，给发起者使用

所有页面使用相同的 instanceId，共享数据。生成完毕后调用 bind_resources 将每个页面的 resourceId 和角色标签写入 instance 记录。

如果场景简单（如签到），也可合并为单 HTML，通过 URL 参数 `?view=report` 切换视图。

## 对话结束

生成完成后，向用户展示访问链接，每个链接带上真实的 instanceId 参数：

```
访问链接：
- [填写页]：HTML链接?instanceId=inst_xxx
  用途：发给参与者填写，支持手机/平板/电脑。
- [报告页]：HTML链接?instanceId=inst_xxx
  用途：发起者查看汇总数据，数据实时更新。
```
