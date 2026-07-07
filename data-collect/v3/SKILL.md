---
name: data-collect
description: 当用户需要生成 **多人参与、数据持久化** 的交互式 HTML 时使用。典型场景：收集信息、答题测验、投票、签到、问卷调查、互评打分、多人游戏、排行榜、统计报告。不适用于：纯前端演示、无需保存数据的静态页面。
---

更新时间：2026-04-23

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
理解需求 → 追问收集指标（不清楚时用 ask_user） → create_instance → create 生成 HTML × N → bind_resources → 返回链接说明
```

## 数据模型

| 概念 | 谁管 | 说明 |
|---|---|---|
| **instanceId** | AI 通过 create_instance 获取 | 数据收集空间标识，硬编码在 HTML 中 |
| **docId** | SDK 自动管理 | 参与者唯一 ID（UUID），同设备始终一致，作为记录主键 |
| **collection** | AI 代码定义 | 表名，小写英文 |
| **data** | AI 代码定义 | 任意 JSON，用户身份信息也存这里 |

- 同一 `(instanceId, collection, docId)` 再次 save 是覆盖更新，不是新增
- 固定内容（题目、选项、规则）写死在 HTML 中，只有用户产生的动态数据通过 SDK 存取

## 工具调用顺序

```
1. create_instance()              → 获得 instanceId
2. create 生成 HTML_1             → 收集页，内嵌 new MuskCollect('instanceId')
3. create 生成 HTML_2（可选）      → 报告页，同一个 instanceId
4. bind_resources(instanceId, [   → 绑定所有资源
     {"resourceId": xxx, "role": "collect", "name": "填写页"},
     {"resourceId": yyy, "role": "report",  "name": "报告页"}
   ])
```

## MuskCollect SDK

```html
<script src="https://www.feixianglaoshi.biz/fedebug/musk-workbench-web/feature/app-center/musk-collect/musk-collect.js"></script>
```

初始化：`var sdk = new MuskCollect('inst_xxx')`，instanceId 硬编码。

- **instanceId**：通过 `create_instance` 获取，标识一次活动的数据空间，硬编码在 HTML 中。
- **docId**：SDK 内部自动生成（格式 `instanceId-uuid`），持久化到 localStorage，同设备 + 同页面始终一致，AI 无需关心。

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

**使用示例：**

```javascript
var sdk = new MuskCollect('inst_xxx');

sdk.save('votes', { name: '小明', choice: 'A' });
sdk.get('votes').then(function(data) { console.log(data); });
sdk.query('votes').then(function(list) { console.log(list); });
```

## 核心规则

1. **docId 由 SDK 自动管理**，身份信息（昵称、学号等）存 `data`
2. **身份表单文案贴合场景**，禁止出现技术术语
3. **报告视图展示身份从 `data` 取**，不展示 docId

## 页面生成

推荐按角色生成**独立的多个 HTML**，各自承担不同职责：

- **收集页**：身份收集 + 业务交互 + 提交反馈，给参与者使用
- **报告页**：数据统计 + 明细列表 + 刷新按钮，给发起者使用

所有页面使用相同的 instanceId，共享数据。生成完毕后，调用 bind_resources 将每个页面的 resourceId 和角色标签（collect / report）写入 instance 记录。

如果场景简单（如签到），也可合并为单 HTML，通过 URL 参数 `?view=report` 切换视图。
