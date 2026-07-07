---
name: stroke-order
description: 生成汉字笔顺教学内容时自动启用。通过 CDN 加载 cnchar 运行时查询笔画数据，经标准化修正和校验后输出结构化笔画信息（笔画数+逐笔名称）供飞象老师渲染。内置32种标准笔画名称、笔顺规则、cnchar偏差修正。严禁AI硬编码笔画数据。当涉及笔顺、笔画、识字写字、笔顺演示、写字课件时启用。
---

更新时间：2026-04-15

# 汉字笔顺规范

> 版本 7.0.0 ｜ 2026-04-15

## 一、铁律

**严禁 AI 在代码中硬编码任何汉字的笔画名称、笔画数、笔顺。** 所有数据必须来自 VERIFIED 或 cnchar 运行时查询。

## 二、32 种标准笔画名称

输出的每个笔画名称**必须**在以下 32 种之内，出现任何其他名称（如"口""儿""横撇点"等）即为错误。

| 基本（6） | 点、横、竖、撇、捺、提 |
|---------|----------------|
| 折类（5） | 横折、竖折、撇折、横撇、撇点 |
| 钩类（12）| 竖钩、弯钩、斜钩、卧钩、竖弯钩、横钩、横折钩、横折弯钩、横撇弯钩、横折折折钩、竖折折钩、横斜钩 |
| 提类（2） | 竖提、横折提 |
| 弯折组合（7）| 竖弯、横折弯、横折折撇、竖折撇、竖折折、横折折、横折折折 |

## 三、笔顺规则

以下规则用于理解和校验笔画顺序是否合理。

### 一般规则

| 规则 | 例字 | 笔顺 |
|------|------|------|
| 从上到下 | 三 | 一→二→三 |
| 从左到右 | 阳 | 先写左部再写右部 |
| 先横后竖 | 十 | 横→竖 |
| 先撇后捺 | 人 | 撇→捺 |
| 先外后内 | 问 | 门框→口 |
| 先外后内再封口 | 国 | 竖→横折→内部→底横 |
| 先中间后两边 | 小 | 竖钩→左点→右点 |

### 补充规则

| 规则 | 例字 |
|------|------|
| 点在正上或左上，先写点 | 门（点→竖→横折钩） |
| 点在右上，后写点 | 发（先主体后右上点） |
| 右上包围，先外后里 | 句 |
| 左上包围，先外后里 | 庆、厅 |
| 左下包围，先里后外 | 近、这 |
| 缺口朝上的三面包围，先里后外 | 凶 |
| 缺口朝下的三面包围，先外后里 | 同 |
| 四面包围，先外后里再封口 | 国 |

### 口诀

**独体字**：先横后竖，先撇后捺；先上后下，先左后右；先写中间，后写两边；右上有点，点要后写；先内后外，多为下包上。

**复合字**：横竖交叉先横，撇捺交叉先撇；从上到下为主，从左到右为辅；下包上时先内，上包下时先外；三框首横末折，大口最后封底。

## 四、生成代码时必须包含的完整脚本

AI 可修改 VERIFIED 内容，**不得修改函数逻辑**。

```html
<!-- 第一步：加载 cnchar -->
<script src="https://cdn.jsdelivr.net/npm/cnchar@3.2.6/cnchar.min.js"></script>
<!-- 第二步：动态加载 cnchar-order（多源级联） -->
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
// ============================================================
// 笔顺数据层
// ============================================================

var STD = ['点','横','竖','撇','捺','提','横折','竖折','撇折','横撇','撇点',
  '竖钩','弯钩','斜钩','卧钩','竖弯钩','横钩','横折钩','横折弯钩','横撇弯钩',
  '横折折折钩','竖折折钩','横斜钩','竖提','横折提','竖弯','横折弯','横折折撇',
  '竖折撇','竖折折','横折折','横折折折'];

// 教研校验数据（AI 从 lookup-table.md 提取本次涉及的字）
var VERIFIED = {
  // '竹': ['撇','横','竖','撇','横','竖钩'],
};

// === cnchar 偏差修正 ===

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

// === setOrder 修正（必须在 cnchar-order 加载后执行） ===
function applyFixes() {
  if (!cnchar || !cnchar.setOrder) return;
  var fixes = {
    '吃': 'fcjsjo',      // 6画: 竖横折横撇横横折弯钩
    '亿': 'sfo',          // 3画: 撇竖横折弯钩
    '说': 'kpksfcjsu',    // 9画: 点横折提点撇竖横折横撇竖弯钩
    '到': 'jfisekfg',     // 8画: 横竖提撇横撇点竖竖钩
    '话': 'kpsjjfcj',     // 8画: 点横折提撇横横竖横折横
    '山': 'fbf',          // 竖折修正
    '牙': 'jbgs',         // 竖折修正
    '出': 'bffbf',
    '九': 'so',           // 横折弯钩修正
    '几': 'so',
    '凡': 'sok',
  };
  for (var c in fixes) {
    if (fixes.hasOwnProperty(c)) cnchar.setOrder(c, fixes[c]);
  }
}

// === 唯一数据查询入口 ===
function getStrokeData(char) {
  if (VERIFIED[char]) {
    return { char: char, count: VERIFIED[char].length, strokes: VERIFIED[char], source: 'verified' };
  }
  if (!window._cncharOK) {
    return { char: char, count: 0, strokes: [], source: 'error',
      error: 'cnchar-order 未加载' };
  }
  try {
    var raw = cnchar.stroke(char, 'order', 'name');
    if (!raw || !raw[0] || raw[0].length === 0) return null;
    var strokes = [];
    for (var i = 0; i < raw[0].length; i++) {
      strokes.push(fixName(raw[0][i], char));
    }
    // 校验：每个名称必须在 32 标准名之内
    for (var j = 0; j < strokes.length; j++) {
      if (STD.indexOf(strokes[j]) === -1) {
        console.error(char + ' 第' + (j+1) + '笔「' + strokes[j] + '」不在标准32种之内');
        return { char: char, count: 0, strokes: [], source: 'error',
          error: '含非标准笔画名: ' + strokes[j] };
      }
    }
    return { char: char, count: strokes.length, strokes: strokes, source: 'cnchar' };
  } catch(e) {
    return { char: char, count: 0, strokes: [], source: 'error', error: e.message };
  }
}

// === 初始化（等 cnchar-order 加载后执行） ===
window._onReady = function() {
  applyFixes();  // 先修正 cnchar 已知错误
  initApp();     // 再查询数据
};
// 超时兜底
setTimeout(function() { if (!window._cncharOK && !window._cncharFail) { initApp(); } }, 3000);

function initApp() {
  var chars = [/* AI 填入本次请求的字 */];
  chars.forEach(function(char) {
    var data = getStrokeData(char);
    if (!data || data.source === 'error') {
      renderError(char, data ? data.error : '无数据');
      return;
    }
    renderStrokeInfo(char, data);
  });
}
</script>
```

## 五、AI 生成代码的规则

1. **原样复制**第四节的完整脚本块
2. **修改 VERIFIED**：从 [lookup-table.md](lookup-table.md) 提取本次涉及的字
3. **修改 chars 数组**：填入本次请求的字
4. 业务渲染代码（renderStrokeInfo / renderError）由 AI 根据飞象老师的 UI 需求实现
5. **绝不在 renderStrokeInfo 或其他任何位置硬编码笔画数据**

## 六、纯文本模式

用户仅对话询问笔顺时：

```
查 lookup-table.md
  ├─ 找到 → 逐笔输出
  └─ 未找到 → 「该字暂未收录教研校验数据，如需笔顺动画可要求生成教学网页。」
```

## 七、自检清单

```
□ 1. 完整脚本块是否原样包含？
□ 2. VERIFIED 是否从 lookup-table 提取了本次涉及的字？
□ 3. 代码中有无任何硬编码的中文笔画名称（VERIFIED 和 STD 以外的位置）？→ 有则删除
□ 4. 所有数据是否通过 getStrokeData() 获取？
□ 5. renderStrokeInfo 中是否有 AI 自行编写的笔画数据？→ 有则删除
□ 6. chars 数组是否正确填入本次请求的字？
□ 7. data.source === 'error' 时是否显示错误提示？
```
