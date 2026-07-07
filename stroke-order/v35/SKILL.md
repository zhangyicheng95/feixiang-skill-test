---
name: stroke-order
description: 生成汉字笔顺教学内容时必须加载此 skill。提供 7818 字权威笔顺 JSON 数据库（小学部编版教材字 3 轮教研审核 + 字典全库扩展字自动映射 + 6 类部件系统性错误修正）与通用加载器 stroke-loader.js。严禁 AI 硬编码笔画数据、严禁引入 cnchar/HanziWriter 等运行时笔顺库。触发场景：笔顺、笔画、识字写字、笔顺演示、写字课件、笔画数、田字格、生字卡片、描红、笔顺动画。
---

更新时间：2026-04-21

# 汉字笔顺数据标准（v10.3 · 权威数据库版）

## 核心原则

1. **AI 严禁硬编码笔画数据**（如 `['撇','横',...]`）——AI 的笔顺记忆已多次出错。
2. **唯一数据源**：CDN 上的 `stroke-data.json`，覆盖 7818 字。
3. **唯一查询入口**：`getStrokeData(char)` 返回 `{char, count, strokes, source}`。
4. **禁引任何第三方笔顺库**：cnchar、cnchar-draw、HanziWriter、chinese-stroke 全部禁用。

## 生成代码时必做（照抄 URL，不要改）

在 HTML `<head>` 中注入：

```html
<script src="https://musk-test.fbcontent.cn/pub-musk-ai-studio/skills/stroke-order/v35/templates/stroke-loader.js"></script>
```

使用方式（监听数据就绪事件）：

```html
<script>
window.addEventListener('stroke-data-ready', function() {
  var chars = [/* AI 填入本次要展示的字符，如 ['学','字','彭'] */];
  chars.forEach(function(ch) {
    var d = window.getStrokeData(ch);
    // d = { char:'学', count:8, strokes:['点',...,'横'], source:'db' }
    // source: 'db' 正常 / 'missing' 字表外 / 'loading' 未就绪 / 'error' 网络错
    renderCard(ch, d);  // 由 LLM 自由实现 UI
  });
});
</script>
```

## 32 种标准笔画名称（唯一合法集合）

- 基本(6)：点、横、竖、撇、捺、提
- 折类(5)：横折、竖折、撇折、横撇、撇点
- 钩类(12)：竖钩、弯钩、斜钩、卧钩、竖弯钩、横钩、横折钩、横折弯钩、横撇弯钩、横折折折钩、竖折折钩、横斜钩
- 提类(2)：竖提、横折提
- 弯折组合(7)：竖弯、横折弯、横折折撇、竖折撇、竖折折、横折折、横折折折

loader 内置白名单校验，非法名称返回 `source: 'invalid'`。

## 禁忌清单

| # | 禁止 | 后果 |
|---|---|---|
| 1 | 代码中出现 `['撇','横',...]` 这种笔画数组字面量 | 数据源失控 |
| 2 | 引入 cnchar / cnchar-order / cnchar-draw | 数据冲突 |
| 3 | 引入 HanziWriter | 加载 `{char}.json` 污染 |
| 4 | 除 `getStrokeData()` 外获取笔画数据 | 绕过校验 |
| 5 | `source !== 'db'` 时用 AI 记忆补全 | 复活原 bug |
| 6 | 笔画数据塞进 `<template>` 或 `<script type="application/json">` | 等价硬编码 |

## 生成后自检（LLM 生成完 HTML 再内部检查一遍）

1. 只引入了 `stroke-loader.js`，无 cnchar/HanziWriter
2. `chars` 数组只含汉字字符
3. 代码里**搜不到任何**笔画名称字符串字面量
4. 所有笔画数据通过 `getStrokeData()`
5. 数据缺失/错误分支显示"暂无数据"，不猜

## 纯文本对话模式

当用户仅对话询问笔顺（不生成代码），固定回复：
「笔顺需要通过代码查询权威数据库。请要求我生成教学网页。」**严禁凭记忆输出任何字的笔顺**。

## 正确示范（完整可运行）

```html
<script src="https://musk-test.fbcontent.cn/pub-musk-ai-studio/skills/stroke-order/v35/templates/stroke-loader.js"></script>
<script>
window.addEventListener('stroke-data-ready', function() {
  ['学','写','字','彭','窿','铅'].forEach(function(ch) {
    var d = window.getStrokeData(ch);
    if (d.source === 'db') {
      // 正确使用：d.count 与 d.strokes 由权威数据库提供
      document.body.innerHTML += '<div>' + ch + '(' + d.count + '画):' + d.strokes.join('/') + '</div>';
    } else {
      document.body.innerHTML += '<div>' + ch + ': 该字暂未收录</div>';
    }
  });
});
</script>
```

## 数据库已覆盖的系统性修正（LLM 自动享用，无需关心细节）

- 穴字头第3笔 → 横钩（空/穿/窗/窿…）
- 阝部件第1笔 → 横撇弯钩（那/随/郎…）
- 殳/朵/㕣部件 → 横折弯（没/般/股/段/朵/船/铅…）
- 风字族/气字族 → 横斜钩（风/气/飞/飘…）
- 学字族连续两HP → 首 HP 为横钩（学/受/侵/授/浸/脖）
- OVERRIDE 硬覆盖 25 字（鼎/写/凹/凸/虫/互/今/小/东/山/牙/出/了/子/到/话/说/吃/亿/少/手/没 等）

## 关联资源

- `assets/stroke-data.json`（203KB CDN 资源，运行时加载，**不进 LLM context**）
- `templates/stroke-loader.js`（加载器，暴露 `getStrokeData`）
- `templates/stroke-snippet.html`（即拿即用模板）
