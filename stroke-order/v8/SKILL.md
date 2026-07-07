---
name: stroke-order
description: 生成汉字笔顺教学内容时自动启用。通过 CDN 加载 cnchar 运行时查询笔画数据，经标准化修正和校验后输出结构化笔画信息（笔画数+逐笔名称）供飞象老师渲染。严禁 AI 从记忆中硬编码任何笔画数据。当涉及笔顺、笔画、识字写字、笔顺演示、写字课件时启用。
---

更新时间：2026-04-15

# 汉字笔顺规范

> 版本 6.0.0 ｜ 2026-04-15

## 一、铁律：所有笔画数据必须来自运行时查询

**严禁 AI 在代码中硬编码任何汉字的笔画名称、笔画数、笔顺。**

以下写法全部**禁止**：

```javascript
// ❌ 禁止！AI 从记忆中硬编码
const data = { '语': {count:6, strokes:['点','横折提','撇','横','竖','口']} };
const data = { '说': {count:7, strokes:['点','横折提','点','撇','竖','横折','儿']} };
// "口""儿"不是笔画名称，是汉字！这就是硬编码的证据
```

唯一正确的方式：**通过 `getStrokeData(char)` 运行时查询**。该函数内部调用 cnchar API 或读取 VERIFIED 数据，AI 不接触具体笔画数据。

## 二、生成代码时必须包含的完整脚本

以下是 AI 生成 HTML 时**必须原样包含**的脚本块。AI 可以修改 VERIFIED 的内容（按 lookup-table 填入本次涉及的字），但不得修改函数逻辑。

```html
<script src="https://cdn.jsdelivr.net/npm/cnchar/cnchar.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/cnchar-order/cnchar.order.min.js"></script>
<script>
// ============================================================
// 笔顺数据层 —— AI 不得修改以下函数逻辑
// ============================================================

// 32 种标准笔画名称（校验用）
const STD = ['点','横','竖','撇','捺','提','横折','竖折','撇折','横撇','撇点',
  '竖钩','弯钩','斜钩','卧钩','竖弯钩','横钩','横折钩','横折弯钩','横撇弯钩',
  '横折折折钩','竖折折钩','横斜钩','竖提','横折提','竖弯','横折弯','横折折撇',
  '竖折撇','竖折折','横折折','横折折折'];

// 教研校验数据（AI 从 lookup-table.md 提取本次涉及的字填入）
const VERIFIED = {
  // '竹': ['撇','横','竖','撇','横','竖钩'],
  // '牙': ['横','竖折','竖钩','撇'],
};

// cnchar 已知数据错误修正（笔画数/顺序错误，需 setOrder 覆盖）
// 字母编码参考: j横 f竖 s撇 l捺 k点 i提 c横折 n撇折 m撇点
// g竖钩 t弯钩 y斜钩|卧钩 u竖弯钩 e横撇|横钩 r横折钩 o横斜钩|横折弯钩
// h竖提 p横折提 b竖弯 v横折折|横折弯 a横折折撇 x竖折折|竖折撇
// w横折折折钩|横撇弯钩 z竖折折钩 q横折折折
(function applyOverrides() {
  const fixes = {
    '吃': 'fcrsjou',    // 6画: 竖横折横撇横横折弯钩(非7画)
    '亿': 'sfo',        // 3画: 撇竖横折弯钩(非4画)
    '山': 'fbf',        // 竖→竖折→竖(cnchar误用竖弯)
    '牙': 'jbgs',       // 横→竖折→竖钩→撇(cnchar误用撇折)
    '出': 'bffbf',      // 竖折竖竖竖折竖
    '九': 'so',         // 撇→横折弯钩
    '几': 'so',         // 撇→横折弯钩
    '凡': 'sok',        // 撇→横折弯钩→点
  };
  if (typeof cnchar !== 'undefined' && cnchar.setOrder) {
    Object.entries(fixes).forEach(([c, o]) => cnchar.setOrder(c, o));
  }
})();

// 按字判定表
const SHUZHE = '山牙出屯区匹臣互击岁岸岗仙灵峰崖炭密幽';
const HZWG = '九几凡亿殳尤仇乱匕矿';
const WOGOU = '心必思想念忘志忍急息恩感意总怎愿忠恋态您悠慧';
const HENGGOU = '写皮安家字宝它宁宽宫官完定实客密寒穴究空容';
const HZHEWAN = '没沿船朵';
const SZZP = '专传转砖';
const HPWG = '那都邮邻部郑郊阳阴队陈';

function fixName(raw, char) {
  let n = raw;
  if (n.includes('|')) n = resolvePair(n, char);
  if (n === '点2') return '点';
  if ((n === '竖弯' || n === '撇折') && SHUZHE.includes(char)) return '竖折';
  if (n === '横斜钩' && HZWG.includes(char)) return '横折弯钩';
  return n;
}

function resolvePair(pair, char) {
  if (pair.includes('横撇') && pair.includes('横钩'))
    return HENGGOU.includes(char) ? '横钩' : '横撇';
  if (pair.includes('斜钩') && pair.includes('卧钩'))
    return WOGOU.includes(char) ? '卧钩' : '斜钩';
  if (pair.includes('横折弯') && pair.includes('横折折'))
    return HZHEWAN.includes(char) ? '横折弯' : '横折折';
  if (pair.includes('竖折撇') && pair.includes('竖折折'))
    return SZZP.includes(char) ? '竖折撇' : '竖折折';
  if (pair.includes('横撇弯钩') && pair.includes('横折折折钩'))
    return HPWG.includes(char) ? '横撇弯钩' : '横折折折钩';
  return pair.split('|')[0];
}

// 唯一的数据查询入口
function getStrokeData(char) {
  // 优先级1：教研校验
  if (VERIFIED[char]) {
    return { char, count: VERIFIED[char].length, strokes: VERIFIED[char], source: 'verified' };
  }
  // 优先级2：cnchar 查询 + 修正
  try {
    const raw = cnchar.stroke(char, 'order', 'name');
    if (!raw || !raw[0] || raw[0].length === 0) return null;
    const strokes = raw[0].map(n => fixName(n, char));
    // 校验：每个名称必须在 32 标准名之内
    const invalid = strokes.filter(n => !STD.includes(n));
    if (invalid.length > 0) {
      console.warn(char + ' 含非标准笔画名: ' + invalid.join(','));
    }
    return { char, count: strokes.length, strokes, source: 'cnchar' };
  } catch(e) { return null; }
}
</script>
```

## 三、AI 如何使用此脚本

AI 生成 HTML 时：
1. **原样复制**上方完整脚本块
2. **仅修改 VERIFIED 对象**：从 [lookup-table.md](lookup-table.md) 提取本次请求涉及的字填入
3. 在业务代码中**只通过 `getStrokeData(char)` 获取笔画数据**
4. 将返回的 `{ count, strokes }` 传给飞象老师的渲染逻辑

```javascript
// ✅ 正确用法：运行时查询
const chars = ['竹', '吃', '语', '说', '亿', '到'];
chars.forEach(char => {
  const data = getStrokeData(char);
  if (!data) { /* 该字无数据 */ return; }
  // data.count = 笔画数
  // data.strokes = ['撇','横','竖',...] 逐笔名称数组
  // data.source = 'verified' 或 'cnchar'
  // → 将 data 传给飞象老师的渲染逻辑
});
```

## 四、纯文本模式

用户仅对话询问笔顺（不生成代码）时：

```
查 lookup-table.md
  ├─ 找到 → 逐笔输出
  └─ 未找到 → 拒绝：「该字暂未收录教研校验数据，如需笔顺动画可要求生成教学网页。」
```

## 五、标准笔画名称（32 种）

| 类别 | 名称 |
|------|------|
| 基本（6） | 点、横、竖、撇、捺、提 |
| 折类（5） | 横折、竖折、撇折、横撇、撇点 |
| 钩类（12） | 竖钩、弯钩、斜钩、卧钩、竖弯钩、横钩、横折钩、横折弯钩、横撇弯钩、横折折折钩、竖折折钩、横斜钩 |
| 提类（2） | 竖提、横折提 |
| 弯折组合（7） | 竖弯、横折弯、横折折撇、竖折撇、竖折折、横折折、横折折折 |

**校验规则**：`getStrokeData` 返回的每个笔画名称都会与 STD 数组比对。如果出现"口""儿"等非笔画名称，说明代码没有正确调用 cnchar API。

## 六、自检清单

### 代码生成

```
□ 1. 完整脚本块是否原样包含（CDN + STD + VERIFIED + fixes + fixName + getStrokeData）？
□ 2. VERIFIED 是否从 lookup-table.md 提取了本次涉及的字？
□ 3. 代码中是否存在任何 AI 硬编码的笔画名称？
     → 搜索代码中的中文笔画名（横、竖、撇...），
       如果出现在 VERIFIED 和 STD 以外的位置就是硬编码 → 删除
□ 4. 所有笔画数据是否都通过 getStrokeData() 获取？
□ 5. 是否有 console.warn 输出非标准笔画名？→ 有则代码有误
```

### 纯文本

```
□ 1. 该字在 lookup-table.md 中？不在则拒绝
□ 2. 笔画总数 = 列举数？
□ 3. 每个名称在 32 种之内？
```
