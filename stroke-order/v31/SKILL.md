---
name: stroke-order
description: 生成汉字笔顺教学内容时必须加载此 skill。通过 CDN 提供 2838 字教研校验过的权威笔顺数据库（JSON 格式，覆盖部编版小学语文全部会写字与认读字），以及通用 JS 加载器 stroke-loader.js，严禁 AI 硬编码任何笔画数据、严禁引入 cnchar / cnchar-draw / HanziWriter 等运行时笔顺库。当用户请求涉及笔顺、笔画、识字写字、笔顺演示、写字课件、笔画数、田字格、生字卡片等教学内容时启用。
---

更新时间：2026-04-20

# 飞象老师汉字笔顺数据标准（v10.0.0 · 权威数据库版）

> **2026-04-20 发布**
> **根本变更**：从"运行时 cnchar 查询 + 手工修正"架构，升级为"预构建权威 JSON 数据库 + 运行时加载"。
> 数据源已经 3 轮教研审核，覆盖系统性数据集错误修正（阝部件、殳/朵部件、学字族、穴字头等 6 类共性问题）。

## 核心原则（硬约束）

1. **AI 不是数据源**：严禁硬编码任何字的笔画数组（如 `['撇','横',...]`），AI 的笔顺记忆已多次被证明不可靠。
2. **唯一数据源**：`assets/stroke-data.json`，2838 字全部经过 3 轮教研审核 + 系统性数据错误修正。
3. **唯一查询接口**：`getStrokeData(char)` 由 `templates/stroke-loader.js` 提供，输出标准化 `{ char, count, strokes, source }` 结构。
4. **32 标准笔画白名单**：loader 内置校验，非法笔画名自动拦截。
5. **禁止引入任何第三方笔顺库**：cnchar、cnchar-draw、HanziWriter、chinese-stroke 等一律禁止。飞象老师渲染引擎自己处理动画，AI 只需提供结构化数据。

## 触发判定（**任一**满足必须启用）

**硬触发**（遇到立即启用）：

- 用户请求包含："笔顺"、"笔画"、"第几笔"、"怎么写"、"笔画数"、"一笔一画"、"笔顺动画"
- 用户请求包含：识字写字、生字卡、田字格、描红、笔顺演示、写字课件、写字教学
- 要求生成汉字笔顺分步展示、笔画分解、笔顺练习题、笔画测验

**软触发**（上下文匹配时启用）：

- 学段为小学（尤其一、二年级语文课件）
- 涉及部编版小学语文会写字、生字学习、汉字书写
- 教学内容含"识记"、"认读"、"会写字"、"要求会写"

**生成中途补判定**：如 LLM 生成过程中发现需要展示任一字的笔画，立即加载本 skill 的脚本块，**禁止**凭记忆填写任何笔画数组。

---

## 一、资源 URL（已部署，固定不变）

```
数据文件：https://musk-test.fbcontent.cn/pub-musk-ai-studio/skills/stroke-order/v31/assets/stroke-data.json
加载器 ：https://musk-test.fbcontent.cn/pub-musk-ai-studio/skills/stroke-order/v31/templates/stroke-loader.js
```

> 所有 URL 是已验证真实可访问的部署地址。**不要**改写为占位域名或其他 CDN。

---

## 二、32 种标准笔画名称（白名单）

输出的每个笔画名称**必须**在以下名称之内。loader 内部做校验，非法名称会返回 error。

| 类别 | 名称 |
|------|------|
| 基本（6） | 点、横、竖、撇、捺、提 |
| 折类（5） | 横折、竖折、撇折、横撇、撇点 |
| 钩类（12）| 竖钩、弯钩、斜钩、卧钩、竖弯钩、横钩、横折钩、横折弯钩、横撇弯钩、横折折折钩、竖折折钩、横斜钩 |
| 提类（2） | 竖提、横折提 |
| 弯折组合（7）| 竖弯、横折弯、横折折撇、竖折撇、竖折折、横折折、横折折折 |

---

## 三、生成代码时必须包含的完整脚本

**原样复制**以下代码块到生成的 HTML 的 `<head>` 中（URL 不要改写）：

```html
<script src="https://musk-test.fbcontent.cn/pub-musk-ai-studio/skills/stroke-order/v31/templates/stroke-loader.js"></script>
<script>
  // 加载器会自动从 CDN 拉取 stroke-data.json 并暴露 window.getStrokeData
  // 页面准备好后通过 window.addEventListener('stroke-data-ready', ...) 开始渲染
</script>
```

**然后在业务代码里这样使用**：

```html
<script>
window.addEventListener('stroke-data-ready', function() {
  var chars = [/* AI 填入本次要展示的字符数组，不含任何笔画数据 */];
  chars.forEach(function(ch) {
    var d = window.getStrokeData(ch);
    // d = { char: '学', count: 8, strokes: ['点','点','撇','点','横钩','横撇','弯钩','横'], source: 'db' }
    //   或 = { char: 'X', count: 0, strokes: [], source: 'missing', error: '...' }
    renderStroke(ch, d);
  });
});

function renderStroke(char, data) {
  if (data.source === 'db') {
    // 正常展示 data.count 和 data.strokes
  } else {
    // 数据库未收录，显示"暂无数据"，不得用 AI 记忆填充
  }
}
</script>
```

---

## 四、AI 生成规则（禁忌清单）

### 严禁行为

| 禁止行为 | 后果 |
|---------|------|
| ❌ 在生成的代码中硬编码任何笔画数组（如 `['撇','横','竖','撇','捺']`） | 笔顺失控、用 AI 记忆 |
| ❌ 引入 cnchar / cnchar-order / cnchar-draw | 运行时查询不稳定，与数据库冲突 |
| ❌ 引入 HanziWriter、chinese-stroke 等第三方笔顺库 | 数据源不一致 |
| ❌ 调用除 `getStrokeData()` 以外的任何途径获取笔画数据 | 绕过校验机制 |
| ❌ 在 `data.source !== 'db'` 时用 AI 记忆数据填充 | 复活原 bug |
| ❌ 将笔画数据写死在 `<template>`、`<script type="application/json">` 等静态标签内 | 等价于硬编码 |

### 必须遵守

1. **代码中不得出现任何笔画名称字符串**，除非是作为变量赋值的结果（由 loader 查询后返回）
2. **chars 数组**只包含汉字字符（如 `['学', '写', '字']`），**禁止**包含 `[{char:'学', strokes:[...]}]` 这种预填充结构
3. **加载等待**：所有对 `getStrokeData` 的调用必须在 `stroke-data-ready` 事件之后
4. **错误兜底**：data.source === 'missing' / 'error' 时，UI 显示"暂无数据"，不得用 AI 猜

---

## 五、纯文本模式（不生成代码时）

当用户仅以对话询问笔顺（不生成教学 HTML）时：

```
固定回复："笔顺数据需要通过代码查询我们的权威笔顺数据库（2838 字教研校验版）。
请要求我生成教学网页，就能看到准确的笔顺了。"
```

**严禁 AI 在纯文本模式下凭记忆输出任何字的笔顺数据。**

---

## 六、自检清单（生成完 HTML 后必须逐项对照）

```
□ 1. 代码中是否只加载了 stroke-loader.js，没有 cnchar / HanziWriter 等第三方库
□ 2. chars 数组是否只包含汉字字符（不含预填充的笔画数据）
□ 3. 代码中是否完全没有硬编码的笔画名称字符串（搜索 "点","横","竖","撇","捺","提","横折"...）
□ 4. 所有笔画数据的获取是否都通过 getStrokeData()
□ 5. 是否用 stroke-data-ready 事件包裹了渲染逻辑
□ 6. 数据缺失/错误分支是否显示"暂无数据"而非 AI 猜测
```

---

## 七、数据库已覆盖的典型错误修正（用户无需关心，自动生效）

以下是 v10 数据库相对于裸 cnchar 已修正的 6 类共性问题（共修正 ≈ 100 字）：

| 编号 | 共性问题 | 代表字 |
|-----|---------|-------|
| A | 穴字头第 3 笔（应为横钩，数据集默认横撇） | 空、穿、窗、窿、突… |
| B | 阝（耳刀）第 1 笔（应为横撇弯钩，数据集默认横折折折钩） | 那、随、隙、郎… |
| C | 殳/朵 部件（应为横折弯，数据集默认横折折） | 没、般、股、段、朵… |
| D | 风/气字族的横斜钩（应为横斜钩，数据集默认横折弯钩） | 风、气、飞、飘… |
| E | 学字族连续两 HP（第一个应为横钩，数据集默认双横撇） | 学、受、侵、授、浸、脖 |
| F | 铅字 "㕣" 部件第 2 笔（应为横折弯，数据集默认横折折） | 铅 |

此外，还针对 21 个"数据集笔画数与笔顺长度不一致"的字做了 OVERRIDE 硬覆盖（如鼎、写、互、没、虫、凹、凸 等）。

---

## 八、典型案例对照

### ❌ 严重不合规（AI 硬编码，v9 时代常见）

```html
<!-- AI 凭记忆填数据，经常出错 -->
<script>
var data = [
  { char: '彭', strokes: ['横','竖','横','竖','横折','横','点','撇','横','撇','撇','撇'] },
  // ↑ 第9笔应为"提"，AI 写成了"横"——错！
];
</script>
```

### ❌ 严重不合规（引入 cnchar）

```html
<!-- 运行时 cnchar 查询不稳定，且有数据集 bug -->
<script src="https://cdn.jsdelivr.net/npm/cnchar@3.2.6/cnchar.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/cnchar-order@3.2.6/cnchar.order.min.js"></script>
```

### ✅ 合规（v10 权威数据库）

```html
<script src="https://musk-test.fbcontent.cn/pub-musk-ai-studio/skills/stroke-order/v31/templates/stroke-loader.js"></script>
<script>
window.addEventListener('stroke-data-ready', function() {
  var chars = ['彭', '窿', '学', '铅'];  // 只含字符，不含任何笔画数据
  chars.forEach(function(ch) {
    var d = window.getStrokeData(ch);
    renderStroke(ch, d);  // d.strokes 是权威数据
  });
});
function renderStroke(ch, d) {
  if (d.source !== 'db') return showMissing(ch);
  // 实际渲染逻辑（UI 自由发挥）
}
</script>
```

---

## 九、相关文件

- `assets/stroke-data.json` — 2838 字权威笔顺数据（203 KB）
- `templates/stroke-loader.js` — 加载器 + getStrokeData 接口
- `templates/stroke-snippet.html` — 即拿即用模板
- `lookup-table.md` — 32 种标准笔画名称速查表
- `reference/implementation-guide.md` — 工程集成指引
- `test-prompts.md` — 测试用例（历史 bug 基准）

---

## 十、FAQ

**Q：某个字 data.source === 'missing'，AI 可以补充吗？**
A：**绝对不可以**。这是数据库还没收录该字（2838 字范围外）。UI 显示"暂无数据"，建议用户换一个会写字字表内的字。

**Q：如果用户反馈某字笔顺错误怎么办？**
A：这是数据库级别的 bug。产品经理通过 3 轮审核流水线（`generate.py` + `ai_fill.py` + `apply.py`）修复后重新上传 skill，AI 不参与直接修改。

**Q：为什么不再用 cnchar？**
A：运行时 cnchar 查询有 7 类系统性错误（阝、殳/朵、学字族等），且每个错误修复需要在 JS 里维护一长串 `setOrder` 调用。预构建 JSON 数据库一次性解决所有问题，LLM 端代码极简化，也更容易扩展字表。

**Q：数据更新频率？**
A：随 skill 版本升级。每次数据库有改动都会 bump 版本号（v30 → v31），旧版本 URL 继续可用（永久兼容）。

---

## 版本记录

| 版本 | 日期 | 核心变更 |
|------|------|--------|
| v1-v9 | 2026-04 | 基于 cnchar 运行时查询 + 手工 setOrder 修正 |
| **v10** | **2026-04-20** | **架构重构：预构建 2838 字权威 JSON 数据库；三轮教研审核；6 类共性问题修正** |
