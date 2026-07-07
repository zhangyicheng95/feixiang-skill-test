---
name: stroke-order
description: 生成汉字笔顺教学内容时自动启用。通过 CDN 加载 cnchar 查询笔画数据，用标准笔画名称和笔顺规则校正 cnchar 偏差，与 lookup-table 交叉验证，不确定时标记待人工确认。严禁 AI 硬编码笔画数据。当涉及笔顺、笔画、识字写字、笔顺演示、写字课件时启用。
---

更新时间：2026-04-15

# 汉字笔顺规范

> 版本 8.0.0 ｜ 2026-04-15

## 一、核心原则

1. **AI 不是数据源**：严禁硬编码任何笔画数据。AI 曾把"可"的正确顺序改错、把"到"的错误顺序判为正确、lookup-table 的"写"数据也曾全部写错。**任何来源的笔顺数据（包括 cnchar、lookup-table、AI 记忆）都可能有误。**
2. **cnchar 是主数据源**：通过 CDN 运行时查询，覆盖全量汉字。
3. **规则做校正**：用 32 种标准笔画名称和 fixName 修正 cnchar 的已知命名偏差。
4. **lookup-table 做交叉验证**：当 cnchar 修正后的数据与 lookup-table 不一致时，标记冲突供人工确认。
5. **人是最终权威**：AI 和工具都不完全可靠，最终以教材和用户确认为准。

## 二、标准笔画名称（32 种）

输出的每个笔画名称**必须**在以下名称之内。

| 基本（6） | 点、横、竖、撇、捺、提 |
|---------|----------------|
| 折类（5） | 横折、竖折、撇折、横撇、撇点 |
| 钩类（12）| 竖钩、弯钩、斜钩、卧钩、竖弯钩、横钩、横折钩、横折弯钩、横撇弯钩、横折折折钩、竖折折钩、横斜钩 |
| 提类（2） | 竖提、横折提 |
| 弯折组合（7）| 竖弯、横折弯、横折折撇、竖折撇、竖折折、横折折、横折折折 |

> 写的第4笔是竖折折钩（#20，例字：与），不要与横折折折钩（#21，例字：奶）混淆。

## 三、笔顺规则

供**校验 cnchar 输出是否合理**使用。AI 不得用这些规则自行推断笔顺。

| 规则 | 例字 |
|------|------|
| 从上到下 | 三 |
| 从左到右 | 阳 |
| 先横后竖 | 十 |
| 先撇后捺 | 人 |
| 先外后内 | 问 |
| 先外后内再封口 | 国 |
| 先中间后两边 | 小 |
| 点在正上/左上先写，右上后写 | 门 / 发 |
| 左上包围先外后里 | 庆 |
| 左下包围先里后外 | 近 |

**口诀**：先横后竖先撇后捺，先上后下先左后右，先写中间后写两边，先外后内多为下包上。

## 四、生成代码时必须包含的完整脚本

```html
<script src="https://cdn.jsdelivr.net/npm/cnchar@3.2.6/cnchar.min.js"></script>
<script>
(function() {
  var urls = [
    'https://cdn.jsdelivr.net/npm/cnchar-order@3.2.6/cnchar.order.min.js',
    'https://unpkg.com/cnchar-order@3.2.6/cnchar.order.min.js',
    'https://fastly.jsdelivr.net/npm/cnchar-order/cnchar.order.min.js'
  ];
  function tryLoad(i) {
    if (i >= urls.length) { window._cncharFail = true; if (window._onReady) window._onReady(); return; }
    var s = document.createElement('script');
    s.src = urls[i];
    s.onload = function() { window._cncharOK = true; if (window._onReady) window._onReady(); };
    s.onerror = function() { tryLoad(i + 1); };
    document.head.appendChild(s);
  }
  tryLoad(0);
})();
</script>
<script>
// ======== 笔顺数据层 ========

// 33 种标准笔画名称
var STD = ['点','横','竖','撇','捺','提','横折','竖折','撇折','横撇','撇点',
  '竖钩','弯钩','斜钩','卧钩','竖弯钩','横钩','横折钩','横折弯钩',
  '横撇弯钩','横折折折钩','竖折折钩','横斜钩','竖提','横折提','竖弯','横折弯',
  '横折折撇','竖折撇','竖折折','横折折','横折折折'];

// lookup-table 数据（交叉验证用，AI 从 lookup-table.md 提取本次涉及的字）
// 注意：lookup-table 本身也可能有误，不作为唯一权威
var REFERENCE = {
  // '写': ['点','横钩','横','竖折折钩','横'],
  // '竹': ['撇','横','竖','撇','横','竖钩'],
};

// === cnchar 命名偏差修正 ===
var SHUZHE = '山牙出屯区匹臣互击岁岸岗仙灵峰崖炭密幽';
var HZWG = '九几凡亿殳尤仇乱匕矿吃乞';
var WOGOU = '心必思想念忘志忍急息恩感意总怎愿忠恋态您悠慧';
var HENGGOU = '写皮安家字宝它宁宽宫官完定实客密寒穴究空容';
var HZHEWAN = '没沿船朵';
var SZZP = '专传转砖';
var HPWG = '那都邮邻部郑郊阳阴队陈';

function fixName(raw, char) {
  var n = raw;
  if (n.indexOf('|') !== -1) n = resolvePair(n, char);
  if (n === '点2') return '点';
  if ((n === '竖弯' || n === '撇折') && SHUZHE.indexOf(char) !== -1) return '竖折';
  if (n === '横斜钩' && HZWG.indexOf(char) !== -1) return '横折弯钩';
  return n;
}

function resolvePair(pair, char) {
  if (pair.indexOf('横撇') !== -1 && pair.indexOf('横钩') !== -1)
    return HENGGOU.indexOf(char) !== -1 ? '横钩' : '横撇';
  if (pair.indexOf('斜钩') !== -1 && pair.indexOf('卧钩') !== -1)
    return WOGOU.indexOf(char) !== -1 ? '卧钩' : '斜钩';
  if (pair.indexOf('横折弯') !== -1 && pair.indexOf('横折折') !== -1)
    return HZHEWAN.indexOf(char) !== -1 ? '横折弯' : '横折折';
  if (pair.indexOf('竖折撇') !== -1 && pair.indexOf('竖折折') !== -1)
    return SZZP.indexOf(char) !== -1 ? '竖折撇' : '竖折折';
  if (pair.indexOf('横撇弯钩') !== -1 && pair.indexOf('横折折折钩') !== -1)
    return HPWG.indexOf(char) !== -1 ? '横撇弯钩' : '横折折折钩';
  return pair.split('|')[0];
}

// === setOrder 修正（经用户/教材验证，严禁 AI 自行添加） ===
function applyFixes() {
  if (!cnchar || !cnchar.setOrder) return;
  var fixes = {
    '吃': 'fcjsjo',      // 6画: 竖横折横撇横横折弯钩
    '亿': 'sfo',          // 3画: 撇竖横折弯钩
    '说': 'kpksfcjsu',    // 9画: 点横折提点撇竖横折横撇竖弯钩
    '到': 'jnkjfifg',     // 8画: 横撇折点横竖提竖竖钩
    '话': 'kpsjjfcj',     // 8画: 点横折提撇横横竖横折横
    '山': 'fbf',          '牙': 'jbgs',
    '出': 'bffbf',
    '九': 'so',           '几': 'so',           '凡': 'sok',
    // 以下修正必须经用户对照教材确认后才能添加
  };
  for (var c in fixes) {
    if (fixes.hasOwnProperty(c)) cnchar.setOrder(c, fixes[c]);
  }
}

// === 数据查询：cnchar 为主，REFERENCE 交叉验证 ===
function getStrokeData(char) {
  var ref = REFERENCE[char] || null;

  if (!window._cncharOK) {
    // cnchar 不可用：如有 REFERENCE 则用之，否则报错
    if (ref) return { char:char, count:ref.length, strokes:ref, source:'reference' };
    return { char:char, count:0, strokes:[], source:'error', error:'cnchar-order 未加载' };
  }

  // cnchar 查询 + 修正
  try {
    var raw = cnchar.stroke(char, 'order', 'name');
    if (!raw || !raw[0] || raw[0].length === 0) {
      if (ref) return { char:char, count:ref.length, strokes:ref, source:'reference' };
      return null;
    }
    var strokes = [];
    for (var i = 0; i < raw[0].length; i++) strokes.push(fixName(raw[0][i], char));

    // 校验：每个名称必须在标准名称之内
    for (var j = 0; j < strokes.length; j++) {
      if (STD.indexOf(strokes[j]) === -1) {
        if (ref) return { char:char, count:ref.length, strokes:ref, source:'reference',
          warning:'cnchar 含非标准名「'+strokes[j]+'」，已使用 lookup-table 数据' };
        return { char:char, count:0, strokes:[], source:'error',
          error:'含非标准笔画名: '+strokes[j] };
      }
    }

    // 交叉验证：与 REFERENCE 对比
    if (ref) {
      var match = strokes.length === ref.length &&
        strokes.every(function(s,i){ return s === ref[i]; });
      if (match) {
        return { char:char, count:strokes.length, strokes:strokes, source:'confirmed' };
      } else {
        // 冲突：两个来源不一致，都可能有误
        return { char:char, count:strokes.length, strokes:strokes, source:'conflict',
          cncharResult: strokes, referenceResult: ref,
          warning:'cnchar 与 lookup-table 数据不一致，请人工确认' };
      }
    }

    return { char:char, count:strokes.length, strokes:strokes, source:'cnchar' };
  } catch(e) {
    if (ref) return { char:char, count:ref.length, strokes:ref, source:'reference' };
    return { char:char, count:0, strokes:[], source:'error', error:e.message };
  }
}

// === 初始化 ===
window._onReady = function() {
  applyFixes();
  initApp();
};
setTimeout(function() { if (!window._cncharOK && !window._cncharFail) initApp(); }, 3000);

function initApp() {
  var chars = [/* AI 填入 */];
  chars.forEach(function(char) {
    var data = getStrokeData(char);
    if (!data || data.source === 'error') {
      renderError(char, data ? data.error : '无数据');
    } else {
      renderStrokeInfo(char, data);
      // data.source 可能的值：
      // 'confirmed' — cnchar 与 lookup-table 一致（高可信）
      // 'cnchar'    — 仅 cnchar 数据（lookup-table 无此字）
      // 'reference' — 仅 lookup-table 数据（cnchar 不可用或异常）
      // 'conflict'  — 两源不一致（⚠ 需人工确认）
    }
  });
}
</script>
```

## 五、AI 生成规则

1. **原样复制**第四节脚本块
2. **填充 REFERENCE**：从 [lookup-table.md](lookup-table.md) 提取本次涉及的字（注意 lookup-table 也可能有误，是参考不是权威）
3. **填充 chars 数组**
4. **实现 renderStrokeInfo**：根据 `data.source` 显示不同标识：
   - `confirmed` → ✓ 双源一致
   - `cnchar` → 仅 cnchar 数据
   - `reference` → 仅 lookup-table
   - `conflict` → ⚠ 数据冲突，需人工确认（同时展示两版数据）
5. **绝不硬编码笔画数据**

## 六、纯文本模式

```
查 lookup-table.md
  ├─ 找到 → 输出并注明"来自 lookup-table，可能存在误差"
  └─ 未找到 → 「如需笔顺数据，可要求生成教学网页（通过 cnchar 查询）。」
```

## 七、自检清单

```
□ 1. 脚本块是否完整包含（含 STD 32种名称）？
□ 2. REFERENCE 是否从 lookup-table 提取了本次涉及的字？
□ 3. 代码中有无硬编码的笔画数据？→ 有则删除
□ 4. 所有数据是否通过 getStrokeData() 获取？
□ 5. conflict 状态是否展示了两版数据供人工确认？
□ 6. 每个字的数据来源标识是否显示？
```

## 八、已知 cnchar 错误（经用户验证）

| 字 | cnchar 原问题 | 修正编码 | 正确笔顺 |
|----|-----------|--------|--------|
| 吃 | 7画(拆分横折弯钩) | fcjsjo | 竖→横折→横→撇→横→横折弯钩(6画) |
| 亿 | 4画(拆分横折弯钩) | sfo | 撇→竖→横折弯钩(3画) |
| 说 | 7画(合并笔画) | kpksfcjsu | 点→横折提→点→撇→竖→横折→横→撇→竖弯钩(9画) |
| 到 | 7画(缺笔+顺序错) | jnkjfifg | 横→撇折→点→横→竖→提→竖→竖钩(8画) |
| 话 | 9画(多笔) | kpsjjfcj | 点→横折提→撇→横→横→竖→横折→横(8画) |
| 山 | 竖弯→竖折 | fbf | 竖→竖折→竖(3画) |
| 牙 | 撇折→竖折 | jbgs | 横→竖折→竖钩→撇(4画) |
| 出 | 竖弯→竖折 | bffbf | 竖折→竖→竖→竖折→竖(5画) |
| 九 | 横斜钩→横折弯钩 | so | 撇→横折弯钩(2画) |

> **教训**：可 的 cnchar 数据正确，AI 错误修改。到 的 cnchar 数据和 AI 修正都错。
> 写 的 lookup-table 数据曾全部写错。**结论：任何来源都需交叉验证，人是最终权威。**
