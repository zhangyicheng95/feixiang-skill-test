# 多页课件体验设计

本文件接收已经成立的 `contentOutline`，把“教什么、按什么顺序”丰富成逐页可生成、可验收的学习体验。它不能越过内容大纲先决定页面，也不能用互动或视觉包装掩盖内容断裂。

## 1. 输入与输出

输入是 `outline-guidance.md` 第一遍形成的逐页内容骨架，至少包含 `id / type / teachingPurpose / content / contentFlow`。输出包含两部分：课程级 `experienceDesign.continuityContract` 与 `visualDesign`，以及在原页面对象上补充的 `task / visual / interaction / layout`。

体验设计发现以下问题时，返回大纲阶段修改内容，而不是自行补洞：页面没有必要的教学贡献；前页 output 无法供给后页 input；单页内容超过固定画布；需要改变页数、教学目标或题量。

## 2. 建立跨页连续性契约

先把跨页一致性中必须稳定和允许变化的部分写清：

```json
"continuityContract": {
  "knowledgeThread": "全课持续建立、验证或迁移的同一个知识模型",
  "visualInvariant": "跨页稳定的对象身份、颜色语义、状态含义或连接规则",
  "progressionRule": "每页如何继承已有结果并增加新的理解或证据",
  "handoffMode": "representational",
  "allowedVariation": "可以变化的页面结构、对象位置、尺度、视角和互动形式"
}
```

`representational` 是默认承接方式：前页结果在下一页以相同知识对象、视觉身份、状态表示或结论重新出现。只有运行时已经确认支持跨页共享状态时才使用 `stateful`；否则不能承诺学生在前页的选择、输入或参数会自动成为后页状态。

连续性不等于复制页面。对象身份、颜色语义、状态含义和连接规则保持稳定；结构、位置、尺度、视角与操作形式可以变化；知识关系必须随着课程推进发生增加、验证、纠正、应用或压缩。

## 3. 形成视觉方向

```json
{
  "paletteIntent": "明暗、活跃度和对比需求",
  "paletteAnchors": ["背景", "正文", "主色", "信号色"],
  "imageLanguage": "图片与自绘图形共享的线条、质感和构图方向",
  "stableTokens": "全课稳定的字体角色、描边、圆角区间和颜色语义"
}
```

色彩、字体和图像语言不得由学科名称直接决定。色板与风格参考只是兼容选项，最终选择服务当前学习任务、内容气质和投屏可读性。`visualInvariant` 只锁定语义身份，不锁死整套色板和构图。

## 4. 为每页丰富生产卡

在每个内容骨架对象上补充 `task / visual / interaction / layout`。封面和纯讲解页也要有 task；无交互页把 `interaction.type` 写为 `NONE`，不要虚构点击行为。

```json
{
  "task": {
    "question": "从本页 content 提炼的单一问题",
    "action": {
      "verb": "observe|click|choose|input|drag|sort|adjust",
      "target": "学生实际操作或观察的对象"
    },
    "outcome": "contentFlow.output 在页面上的可见表现",
    "continuity": {
      "inherits": "contentFlow.input 如何在本页被重新呈现或调用",
      "advances": "contentFlow.advance 如何转成学生真实经历",
      "handsOff": "本页交给下一页的可见结果",
      "mode": "representational|stateful"
    }
  },
  "visual": {
    "object": "承担核心知识关系的视觉主角",
    "nonTextCue": "隐藏标题后仍能辨认关系的非文字线索",
    "stateMap": [
      {
        "stateField": "业务状态字段",
        "visualVariable": "count|length|position|scale|connection|direction|stage",
        "labelOrValue": "同步更新的标签、数值或公式",
        "invariant": "任何状态都不能破坏的关系"
      }
    ],
    "continuity": {
      "reuses": "本页继承 visualInvariant 的具体方式",
      "evolves": "视觉对象在本页发生的状态、关系、尺度或视角变化"
    }
  },
  "interaction": {
    "type": "NONE|ASSESSMENT|GUIDED_EXPLORATION|OPEN_PRODUCTION",
    "decision": "学生作出的真实决定；NONE 写无",
    "completion": "完成条件和页面可见信号",
    "reset": "恢复到什么状态；NONE 写不适用"
  },
  "layout": {
    "structure": "从 layout-grammar 选择或组合的宏观结构",
    "zones": {"title": 48, "main": 360, "action": 48, "gapsAndPadding": 64},
    "readingPath": "主要阅读路径",
    "actionPlacement": "操作、变化和反馈的位置关系",
    "criticalStates": ["initial", "longestFeedback", "completion"]
  }
}
```

`zones` 数值单位统一为 px，四项之和不得超过 540；示例只演示核算方式，不是默认比例。

## 5. 对齐内容推进与体验推进

逐页核对下面的翻译关系：

| 内容骨架 | 体验设计 | 页面证据 |
|---|---|---|
| `contentFlow.input` | `task.continuity.inherits` | 前页结果、已有模型或问题在本页真实出现 |
| `contentFlow.advance` | `task.action` + `task.continuity.advances` | 学生通过观察、操作、判断或表达完成推进 |
| `contentFlow.output` | `task.outcome` + `task.continuity.handsOff` | 页面留下下一页可以直接调用的结果 |

随后检查相邻页：`P(n).contentFlow.output` 应能供给 `P(n+1).contentFlow.input`，`P(n).task.continuity.handsOff` 应在 `P(n+1).task.continuity.inherits` 中真实出现。文字不必相同，但知识对象、状态、证据或结论必须相同。第一页 inherits 来自课程起点；最后一页 handsOff 对应最终学习证据或迁移任务。

## 6. 让动作承诺与实现一致

| 动词 | 页面必须真的发生 |
|---|---|
| 观察 | 对象、关系或状态出现可辨认变化；不能据此宣称学生已掌握 |
| 点击 / 选择 | 目标被选中并触发与该目标相关的结果，不是装饰按钮 |
| 判断 | 正确与错误路径都可达，错误不推进并说明原因 |
| 排序 | 对象顺序真实改变，完成条件来自最终顺序 |
| 拖拽 / 匹配 | 对象位置或连接真实改变，并可恢复或重置 |
| 输入 / 表达 | 真实保存学生输入，并提供核对标准 |
| 调整 | 参数变化同步改变对应的视觉关系、数值和说明 |

每个互动页只选一种类型。`ASSESSMENT` 的决定影响对错与推进；`GUIDED_EXPLORATION` 让操作产生有效观察结果，按新路径去重记录进度，不冒充对错判定；`OPEN_PRODUCTION` 保留真实产出并给出核对标准，不自动宣称正确。

## 7. 显式映射状态与视觉

核心视觉先识别对象、变量和关系，再用数量、长度、位置、尺度、连接、方向或阶段表达。数值、公式、图形、标签和反馈必须从同一状态派生；若状态变化只改颜色或一行数字，知识关系通常没有真正被可视化。

生成前至少推演三种状态：`initial` 检查入口和任务是否清楚，`longestFeedback` 检查最长文本、错误提示或参数极值是否仍完整，`completion` 检查结果、进度和继续动作是否共存。交互页还要保证 reset 后视觉、数值、标签和状态一起恢复。

## 8. 页面节奏

构图随学习动作变化。相邻页面不得复制同一“宏观结构 × 阅读路径 × 操作位置”；六页左右至少使用四种宏观结构。保持稳定的是 `continuityContract.visualInvariant` 与 `visualDesign.stableTokens`，变化的是视觉主角位置、内容组织和动作入口。

## 9. 生成前检查

```text
□ 输入的 contentOutline 已先通过内容依赖检查
□ continuityContract 区分了稳定语义和允许变化
□ 每页生产卡没有静默改变 teachingPurpose、content 或 contentFlow
□ contentFlow 三字段分别映射到 inherits / advances / handsOff
□ 每页 handsOff 在下一页 inherits 中真实出现
□ representational / stateful 与实际运行时能力一致
□ visual.continuity 同时说明复用什么、推进什么
□ task 动词与 interaction 的真实实现一致
□ stateMap 让图形、数值、公式、标签和反馈同源
□ initial / longestFeedback / completion 都能放入 960×540
□ 相邻页面改变构图，同时保持统一视觉语义
```
