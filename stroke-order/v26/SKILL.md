---
name: stroke-order
description: 生成汉字笔顺教学内容时自动启用。通过 CDN 加载 cnchar 查询笔画数据，用 fixName 修正命名偏差、setOrder 覆盖已知错误，32 种标准笔画名称白名单校验，输出结构化数据（笔画数+逐笔名称）供飞象老师渲染。严禁 AI 硬编码任何笔画数据，严禁引入 HanziWriter 等第三方笔顺库。当涉及笔顺、笔画、识字写字、笔顺演示、写字课件时启用。
---

更新时间：2026-04-17

# 汉字笔顺规范

> 版本 9.0.0 ｜ 2026-04-17

## 一、核心原则

1. **AI 不是数据源**：严禁硬编码任何笔画数据。AI 的笔顺知识不可靠，已多次出错。
2. **cnchar 是唯一数据源**：通过 CDN 运行时查询，覆盖全量汉字。
3. **三层修正防护**：setOrder（覆盖已知错误） → fixName（修正命名偏差） → STD 校验（非法名称拦截）。
4. **setOrder 编码由用户提供**：严禁 AI 自行推断笔顺编码。AI 只做"笔画名称 → 字母"的机械转换。
5. **人是最终权威**：发现错误时用户提供正确笔顺，以教材为准。

### 职责边界（严禁越界）

本 Skill **只负责提供笔画数和逐笔名称的结构化数据**，不负责笔顺动画、SVG 绘制等任何视觉渲染。

**AI 生成代码时的禁止事项**：

| 禁止行为 | 后果 |
|---------|------|
| ❌ 引入 cnchar-draw 库 | 动画数据与笔画名称来自不同源 |
| ❌ 引入 HanziWriter 库 | 会加载 `{char}.json` 字典，笔画名称被替换 |
| ❌ 引入 chinese-stroke 等其他笔顺库 | 数据源不一致 |
| ❌ 调用 `defaultCharDataLoader` 或类似 API | 获取非 cnchar-order 的笔顺数据 |
| ❌ 自主添加除 cnchar、cnchar-order 之外的任何 `<script>` 标签 | 引入不受控数据源 |
| ❌ 自行在代码中硬编码笔画数组（如 `['撇','横',...]`）| 数据源失控 |
| ❌ 从 getStrokeData 以外的任何途径获取笔画数据 | 绕过校验机制 |

**唯一允许加载的两个脚本**：

```html
<script src="https://cdn.jsdelivr.net/npm/cnchar@3.2.6/cnchar.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/cnchar-order@3.2.6/cnchar.order.min.js"></script>
```

如果用户要求笔顺动画，飞象老师自己的渲染引擎会处理动画。AI 只需提供正确的 `{ count, strokes }` 数据。

## 二、标准笔画名称（32 种）

输出的每个笔画名称**必须**在以下名称之内。

| 类别 | 名称 |
|------|------|
| 基本（6） | 点、横、竖、撇、捺、提 |
| 折类（5） | 横折、竖折、撇折、横撇、撇点 |
| 钩类（12）| 竖钩、弯钩、斜钩、卧钩、竖弯钩、横钩、横折钩、横折弯钩、横撇弯钩、横折折折钩、竖折折钩、横斜钩 |
| 提类（2） | 竖提、横折提 |
| 弯折组合（7）| 竖弯、横折弯、横折折撇、竖折撇、竖折折、横折折、横折折折 |

## 三、笔顺规则（供人工审核参考）

以下规则供用户/教师审核 cnchar 输出时参考，用于判断笔画顺序是否合理。**AI 不得用这些规则自行推断笔顺**。

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

// 32 种标准笔画名称（校验用白名单）
var STD = ['点','横','竖','撇','捺','提','横折','竖折','撇折','横撇','撇点',
  '竖钩','弯钩','斜钩','卧钩','竖弯钩','横钩','横折钩','横折弯钩',
  '横撇弯钩','横折折折钩','竖折折钩','横斜钩','竖提','横折提','竖弯','横折弯',
  '横折折撇','竖折撇','竖折折','横折折','横折折折'];

// === cnchar 命名偏差修正字表 ===
// 竖弯保留列表（真正使用竖弯的字，其余默认转为竖折）
var SHUWAN_KEEP = '四西酉酒晒洒栖茜硒牺';
// 撇折→竖折（cnchar 用"撇折"代替"竖折"的字，且该字无合法撇折）
var SHUZHE_PIE = '牙';
// 横斜钩保留列表（真正使用横斜钩的字，其余默认转为横折弯钩）
var HXGOU_KEEP = '风飞气岚凤夙佩飘飏飐飑飒飓飔飕飖飗飙飚飜飝飍飂飃飅';
var WOGOU = '心必思想念忘志忍急息恩感意总怎愿忠恋态您悠慧';
var HENGGOU = '写皮安家字宝它宁宽宫官完定实客密寒穴究空容';
var HZHEWAN = '没沿船朵';
var SZZP = '专传转砖';
var HPWG = '那都邮邻部郑郊阳阴队陈';

function fixName(raw, char) {
  var n = raw;
  if (n.indexOf('|') !== -1) n = resolvePair(n, char);
  if (n === '点2') return '点';
  if (n === '竖弯' && SHUWAN_KEEP.indexOf(char) === -1) return '竖折';
  if (n === '撇折' && SHUZHE_PIE.indexOf(char) !== -1) return '竖折';
  if (n === '横斜钩' && HXGOU_KEEP.indexOf(char) === -1) return '横折弯钩';
  // cnchar 非标准复合名称 → 标准名称
  if (n === '竖折折撇') return SZZP.indexOf(char) !== -1 ? '竖折撇' : '竖折折';
  if (n === '横竖折') return HZHEWAN.indexOf(char) !== -1 ? '横折弯' : '横折折';
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

// === setOrder 修正（编码必须来自用户/教材验证，严禁 AI 自行添加） ===
function applyFixes() {
  if (!cnchar || !cnchar.setOrder) return;
  // 字母编码: j横 f竖 s撇 l捺 k点 i提 c横折 n撇折 m撇点
  //          g竖钩 t弯钩 y斜钩|卧钩 u竖弯钩 e横撇|横钩
  //          r横折钩 o横斜钩|横折弯钩 h竖提 p横折提
  //          b竖弯 v横折折|横折弯 a横折折撇 x竖折折|竖折撇
  //          w横折折折钩|横撇弯钩 z竖折折钩 q横折折折
  var fixes = {
    '吃': 'fcjsjo',         // 6画: 竖横折横撇横横折弯钩
    '亿': 'sfo',            // 3画: 撇竖横折弯钩
    '说': 'kpksfcjsu',      // 9画: 点横折提点撇竖横折横撇竖弯钩
    '到': 'jnkjfifg',       // 8画: 横撇折点横竖提竖竖钩
    '话': 'kpsjffcj',       // 8画: 点横折提撇横竖竖横折横
    '山': 'fbf',            // 3画: 竖竖折竖
    '牙': 'jbgs',           // 4画: 横竖折竖钩撇
    '出': 'bffbf',          // 5画: 竖折竖竖竖折竖
    '写': 'kejzj',          // 5画: 点横钩横竖折折钩横
    '互': 'jncj',           // 4画: 横撇折横折横
    '没': 'kkisvel',        // 7画: 点点提撇横折弯横撇捺
    '今': 'slke',           // 4画: 撇捺点横撇
    '少': 'fsks',           // 4画: 竖撇点撇
    '小': 'gsk',            // 3画: 竖钩撇点
    '东': 'jngsk',          // 5画: 横撇折竖钩撇点
    '了': 'et',             // 2画: 横撇弯钩
    '子': 'etj',            // 3画: 横撇弯钩横
    '虫': 'fcjfik',         // 6画: 竖横折横竖提点
    '手': 'sjjt',           // 4画: 撇横横弯钩
    '凹': 'fvfcj',          // 5画: 竖横折折竖横折横
    '凸': 'fjfqj',          // 5画: 竖横竖横折折折横
    '鼎': 'fcjjjxjsfjfc',   // 12画: 竖横折横横横竖折折横撇竖横竖横折
    '九': 'so',             // 2画: 撇横折弯钩
    '几': 'so',             // 2画: 撇横折弯钩
    '凡': 'sok',            // 3画: 撇横折弯钩点
  };
  for (var c in fixes) {
    if (fixes.hasOwnProperty(c)) cnchar.setOrder(c, fixes[c]);
  }
}

// === 唯一数据查询入口 ===
function getStrokeData(char) {
  if (!window._cncharOK) {
    return { char:char, count:0, strokes:[], source:'error', error:'cnchar-order 未加载' };
  }
  try {
    var raw = cnchar.stroke(char, 'order', 'name');
    if (!raw || !raw[0] || raw[0].length === 0) return null;
    var strokes = [];
    for (var i = 0; i < raw[0].length; i++) strokes.push(fixName(raw[0][i], char));
    // STD 校验：每个名称必须在 32 标准名之内
    for (var j = 0; j < strokes.length; j++) {
      if (STD.indexOf(strokes[j]) === -1) {
        console.error(char + ' 第' + (j+1) + '笔「' + strokes[j] + '」不在标准32种之内');
        return { char:char, count:0, strokes:[], source:'error',
          error:'含非标准笔画名: '+strokes[j] };
      }
    }
    return { char:char, count:strokes.length, strokes:strokes, source:'cnchar' };
  } catch(e) {
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
  var chars = [/* AI 填入本次请求的字，仅字符数组 */];
  chars.forEach(function(char) {
    var data = getStrokeData(char);
    if (!data || data.source === 'error') {
      renderError(char, data ? data.error : '无数据');
    } else {
      renderStrokeInfo(char, data);
      // data.source 可能的值：
      // 'cnchar'  — cnchar 查询 + fixName 修正后数据
      // 'error'   — cnchar 不可用或含非标准笔画名
    }
  });
}
</script>
```

## 五、AI 生成规则

1. **原样复制**第四节脚本块
2. **只需填充 chars 数组**（字符数组，不含任何笔画数据）
3. **实现 renderStrokeInfo**：渲染 `{ count, strokes, source }` 结构化数据
4. **实现 renderError**：当 `source === 'error'` 时显示错误信息，**绝不用 AI 记忆数据填充**
5. **绝不硬编码笔画数据**：代码中不得出现任何 `['撇','横',...]` 这样的笔画数组

## 六、发现 cnchar 错误时的修正流程

当用户发现某字笔顺不正确时：

```
① 用户提供正确的逐笔名称（以教材为准）
   例: 凸 → 竖、横、竖、横折折折、横

② AI 将名称机械转换为字母编码
   根据 applyFixes 中的字母对照表（j=横, f=竖, ...）
   例: 竖横竖横折折折横 → fjfqj

③ 将新条目加入 applyFixes 的 fixes 对象
   '凸': 'fjfqj',  // 5画: 竖横竖横折折折横
```

**AI 只做机械的名称→字母转换**，严禁自行推断任何字的笔顺顺序。

## 七、纯文本模式

当用户仅以对话询问笔顺（不生成代码）时：

```
回复：「笔顺数据需要通过代码查询 cnchar。请要求我生成教学网页以查看准确笔顺。」
```

严禁 AI 在纯文本模式下凭记忆输出笔顺。

## 八、自检清单

```
□ 1. 脚本块是否完整包含（含 STD 32种名称 + fixName + applyFixes + getStrokeData）？
□ 2. 是否只加载了 cnchar + cnchar-order 两个脚本？
     → 搜索代码中是否有 hanzi-writer、cnchar-draw、chinese-stroke 等第三方库 → 有则删除
     → 搜索代码中是否有 defaultCharDataLoader、{char}.json 等远程字典加载 → 有则删除
□ 3. chars 数组是否只包含字符（没有笔画名数组）？
□ 4. 代码中是否有任何硬编码笔画数组？→ 有则删除
□ 5. 所有笔画数据是否仅通过 getStrokeData() 获取？
□ 6. renderError 是否在 error 状态显示错误信息（而非 AI 编造笔顺）？
```

## 九、已知 cnchar 错误修正汇总（经用户验证）

| 字 | cnchar 原问题 | 修正编码 | 正确笔顺 |
|----|-----------|--------|--------|
| 吃 | 7画(拆分横折弯钩) | fcjsjo | 竖→横折→横→撇→横→横折弯钩(6画) |
| 亿 | 4画(拆分横折弯钩) | sfo | 撇→竖→横折弯钩(3画) |
| 说 | 7画(合并笔画) | kpksfcjsu | 点→横折提→点→撇→竖→横折→横→撇→竖弯钩(9画) |
| 到 | 7画(缺笔+顺序错) | jnkjfifg | 横→撇折→点→横→竖→提→竖→竖钩(8画) |
| 话 | 9画(多笔) | kpsjffcj | 点→横折提→撇→横→竖→竖→横折→横(8画) |
| 山 | 竖弯→竖折 | fbf | 竖→竖折→竖(3画) |
| 牙 | 撇折→竖折 | jbgs | 横→竖折→竖钩→撇(4画) |
| 出 | 竖弯→竖折 | bffbf | 竖折→竖→竖→竖折→竖(5画) |
| 写 | 编码错误 | kejzj | 点→横钩→横→竖折折钩→横(5画) |
| 互 | 编码错误 | jncj | 横→撇折→横折→横(4画) |
| 没 | 多笔/顺序错 | kkisvel | 点→点→提→撇→横折弯→横撇→捺(7画) |
| 今 | 横撇→横折 | slke | 撇→捺→点→横撇(4画) |
| 少 | 撇→点 | fsks | 竖→撇→点→撇(4画) |
| 小 | 撇→点 | gsk | 竖钩→撇→点(3画) |
| 东 | 撇→点 | jngsk | 横→撇折→竖钩→撇→点(5画) |
| 了 | 竖钩→弯钩 | et | 横撇→弯钩(2画) |
| 子 | 竖钩→弯钩 | etj | 横撇→弯钩→横(3画) |
| 虫 | 第5笔横→提 | fcjfik | 竖→横折→横→竖→提→点(6画) |
| 手 | 竖钩→弯钩 | sjjt | 撇→横→横→弯钩(4画) |
| 凹 | 非标准名称 | fvfcj | 竖→横折折→竖→横折→横(5画) |
| 凸 | 编码错误 | fjfqj | 竖→横→竖→横折折折→横(5画) |
| 鼎 | 非标准名称 | fcjjjxjsfjfc | 竖→横折→横→横→横→竖折折→横→撇→竖→横→竖→横折(12画) |
| 九/几/凡 | 横斜钩→横折弯钩 | so / so / sok | 撇→横折弯钩(2/2/3画) |

> 后续发现新的 cnchar 错误时，由用户对照教材提供正确笔顺，AI 仅做名称→字母的机械转换后加入 fixes 对象。
