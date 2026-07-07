---
name: stroke-order
description: 生成汉字笔顺教学内容时自动启用。通过 CDN 加载 cnchar 查询笔画数据，用标准笔画名称和笔顺规则校正 cnchar 偏差，与 lookup-table 交叉验证，不确定时标记待人工确认。严禁 AI 硬编码笔画数据。当涉及笔顺、笔画、识字写字、笔顺演示、写字课件时启用。
---

更新时间：2026-04-17

# 汉字笔顺规范

> 版本 8.0.0 ｜ 2026-04-15

## 一、核心原则

1. **AI 不是数据源**：严禁硬编码任何笔画数据。AI 曾把"可"的正确顺序改错、把"到"的错误顺序判为正确、lookup-table 的"写"数据也曾全部写错。**任何来源的笔顺数据（包括 cnchar、lookup-table、AI 记忆）都可能有误。**
2. **cnchar 是主数据源**：通过 CDN 运行时查询，覆盖全量汉字。
3. **规则做校正**：用 32 种标准笔画名称和 fixName 修正 cnchar 的已知命名偏差。
4. **lookup-table 做交叉验证**：当 cnchar 修正后的数据与 lookup-table 不一致时，标记冲突供人工确认。
5. **人是最终权威**：AI 和工具都不完全可靠，最终以教材和用户确认为准。

### 职责边界（严禁越界）

本 Skill **只负责提供笔画数和逐笔名称的结构化数据**，不负责笔顺动画、SVG 绘制、HanziWriter 集成等任何视觉渲染功能。

**AI 生成代码时的禁止事项**：

| 禁止行为 | 后果 | 替代做法 |
|---------|------|---------|
| ❌ 引入 cnchar-draw 库 | 动画数据与笔画名称来自不同源，导致不一致 | 不引入 |
| ❌ 引入 HanziWriter 库 | 会加载 `{char}.json` 字典，笔画名称被替换 | 不引入 |
| ❌ 引入 chinese-stroke 等其他笔顺库 | 同上，数据源不一致 | 不引入 |
| ❌ 调用 `defaultCharDataLoader` 或类似 API | 会获取非 cnchar-order 的笔顺数据 | 不调用 |
| ❌ 自主添加除 cnchar、cnchar-order 之外的任何 `<script>` 标签 | 引入不受控数据源 | 只保留 CDN 两个脚本 |
| ❌ 自行编写 renderStrokeInfo 时从其他 DOM/API 读取笔画数据 | 数据源失控 | 只读取 `getStrokeData(char)` 返回值 |

**唯一允许加载的两个脚本**：

```html
<script src="https://cdn.jsdelivr.net/npm/cnchar@3.2.6/cnchar.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/cnchar-order@3.2.6/cnchar.order.min.js"></script>
```

如果用户要求笔顺动画，飞象老师自己的渲染引擎会处理动画。AI 只需提供正确的 `{ count, strokes }` 数据。

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

// 32 种标准笔画名称
var STD = ['点','横','竖','撇','捺','提','横折','竖折','撇折','横撇','撇点',
  '竖钩','弯钩','斜钩','卧钩','竖弯钩','横钩','横折钩','横折弯钩',
  '横撇弯钩','横折折折钩','竖折折钩','横斜钩','竖提','横折提','竖弯','横折弯',
  '横折折撇','竖折撇','竖折折','横折折','横折折折'];

// ============================================================
// 教研校验字库（固定数据，AI 不得修改）
// 来源：lookup-table.md，由教研人员逐笔校对
// 注意：lookup-table 本身也可能有误，由 REFERENCE 交叉验证发现
// ============================================================
var LOOKUP_TABLE = {
  '一':['横'],'乙':['横折弯钩'],
  '二':['横','横'],'十':['横','竖'],'八':['撇','捺'],'人':['撇','捺'],'入':['撇','捺'],
  '七':['横','竖弯钩'],'儿':['撇','竖弯钩'],'九':['撇','横折弯钩'],'几':['撇','横折弯钩'],
  '了':['横撇','弯钩'],'力':['横折钩','撇'],'刀':['横折钩','撇'],'又':['横撇','捺'],'卜':['竖','点'],
  '三':['横','横','横'],'大':['横','撇','捺'],'小':['竖钩','撇','点'],'上':['竖','横','横'],'下':['横','竖','点'],
  '口':['竖','横折','横'],'山':['竖','竖折','竖'],'土':['横','竖','横'],'女':['撇点','撇','横'],'子':['横撇','弯钩','横'],
  '千':['撇','横','竖'],'个':['撇','捺','竖'],'也':['横折钩','竖','竖弯钩'],'己':['横折','横','竖弯钩'],'工':['横','竖','横'],
  '弓':['横折','横','竖折折钩'],'广':['点','横','撇'],'门':['点','竖','横折钩'],'马':['横折','竖折折钩','横'],'飞':['横斜钩','撇','点'],
  '万':['横','横折钩','撇'],'干':['横','横','竖'],'巾':['竖','横折钩','竖'],'凡':['撇','横折弯钩','点'],'及':['撇','横折折撇','捺'],
  '与':['横','竖折折钩','横'],'川':['撇','竖','竖'],'寸':['横','竖钩','点'],
  '天':['横','横','撇','捺'],'太':['横','撇','捺','点'],'木':['横','竖','撇','捺'],'火':['点','撇','撇','捺'],
  '文':['点','横','撇','捺'],'六':['点','横','撇','点'],'日':['竖','横折','横','横'],'中':['竖','横折','横','竖'],
  '月':['撇','横折钩','横','横'],'不':['横','撇','竖','点'],'开':['横','横','撇','竖'],'牛':['撇','横','横','竖'],
  '心':['点','卧钩','点','点'],'风':['撇','横斜钩','撇','点'],'手':['撇','横','横','弯钩'],'水':['竖钩','横撇','撇','捺'],
  '方':['点','横','横折钩','撇'],'今':['撇','捺','点','横撇'],'车':['横','撇折','横','竖'],'长':['撇','横','竖提','捺'],
  '少':['竖','撇','点','撇'],'五':['横','竖','横折','横'],'无':['横','横','撇','竖弯钩'],'毛':['撇','横','横','竖弯钩'],
  '牙':['横','竖折','竖钩','撇'],'尺':['横折','横','撇','捺'],'片':['撇','竖','横','横折'],'巴':['横折','竖','横','竖弯钩'],
  '王':['横','横','竖','横'],'井':['横','横','撇','竖'],'见':['竖','横折','撇','竖弯钩'],'贝':['竖','横折','撇','点'],
  '气':['撇','横','横','横斜钩'],'区':['横','撇','点','竖折'],'专':['横','横','竖折撇','点'],'云':['横','横','撇折','点'],
  '禾':['撇','横','竖','撇','捺'],'四':['竖','横折','撇','竖弯','横'],'目':['竖','横折','横','横','横'],
  '白':['撇','竖','横折','横','横'],'田':['竖','横折','横','竖','横'],'电':['竖','横折','横','横','竖弯钩'],
  '出':['竖折','竖','竖','竖折','竖'],'头':['点','点','横','撇','点'],'半':['点','撇','横','横','竖'],
  '正':['横','竖','横','竖','横'],'生':['撇','横','横','竖','横'],'左':['横','撇','横','竖','横'],
  '右':['横','撇','竖','横折','横'],'本':['横','竖','撇','捺','横'],'平':['横','点','撇','横','竖'],
  '用':['撇','横折钩','横','横','竖'],'鸟':['撇','横折钩','点','竖折折钩','横'],'瓜':['撇','撇','竖提','点','捺'],
  '皮':['横钩','撇','竖','横撇','捺'],'打':['横','竖钩','提','横','竖钩'],'东':['横','撇折','竖钩','撇','点'],
  '奶':['撇点','撇','横','横折折折钩','撇'],'立':['点','横','点','撇','横'],'石':['横','撇','竖','横折','横'],
  '北':['竖','横','提','撇','竖弯钩'],'写':['点','横钩','横','竖折折钩','横'],
  '米':['点','撇','横','竖','撇','捺'],'竹':['撇','横','竖','撇','横','竖钩'],'年':['撇','横','横','竖','横','竖'],
  '自':['撇','竖','横折','横','横','横'],'耳':['横','竖','竖','横','横','横'],'衣':['点','横','撇','竖提','撇','捺'],
  '羊':['点','撇','横','横','横','竖'],'西':['横','竖','横折','撇','竖弯','横'],'回':['竖','横折','竖','横折','横','横'],
  '有':['横','撇','竖','横折钩','横','横'],'在':['横','撇','竖','横','竖','横'],'字':['点','点','横撇','弯钩','横撇','横'],
  '虫':['竖','横折','横','竖','提','点'],'那':['横折钩','横','横','撇','横撇弯钩','竖'],
  '花':['横','竖','竖','撇','竖','撇','竖弯钩'],'来':['横','点','撇','横','竖','撇','捺'],
  '我':['撇','横','竖钩','提','斜钩','撇','点'],'足':['竖','横折','横','竖','横','撇','捺'],
  '走':['横','竖','横','竖','横','撇','捺'],'里':['竖','横折','横','横','竖','横','横'],
  '两':['横','竖','横折钩','撇','点','撇','点'],'找':['横','竖钩','提','横','斜钩','撇','点'],
  '你':['撇','竖','撇','横撇','竖钩','撇','点'],'没':['点','点','提','撇','横折弯','横撇','捺'],
  '雨':['横','竖','横折钩','竖','点','点','点','点'],'国':['竖','横折','横','横','竖','横','点','横'],
  '果':['竖','横折','横','横','横','竖','撇','捺'],'茎':['横','竖','竖','横撇','点','横','竖','横'],
  '鱼':['撇','横撇','竖','横折','横','竖','横','横'],'学':['点','点','撇','点','横钩','横撇','竖钩','横'],
  '语':['点','横折提','横','竖','横折','横','竖','横折','横'],
  '春':['横','横','横','撇','捺','竖','横折','横','横'],
  '凹':['竖','横折折','竖','横折','横'],'凸':['竖','横','竖','横折折折','横'],
  '鼎':['竖','横折','横','横','横','竖折折','横','撇','竖','横','竖','横折']
};

// REFERENCE 在运行时从 LOOKUP_TABLE 自动筛选（AI 不填充数据，只填字符数组）
var REFERENCE = {};

// === cnchar 命名偏差修正 ===
// 竖弯保留列表（这些字的竖弯是真的竖弯，不转换为竖折）
var SHUWAN_KEEP = '四西酉酒晒洒栖茜硒牺';
// 撇折→竖折（cnchar 用"撇折"代替"竖折"的字，且该字无合法撇折）
var SHUZHE_PIE = '牙';
// 横斜钩保留列表（这些字的横斜钩是真的横斜钩，不转换为横折弯钩）
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
  // cnchar 非标准复合名称 → 标准名称（cnchar 有时不输出管道符，而是合成非标准名）
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

// === setOrder 修正（经用户/教材验证，严禁 AI 自行添加） ===
function applyFixes() {
  if (!cnchar || !cnchar.setOrder) return;
  var fixes = {
    '吃': 'fcjsjo',      // 6画: 竖横折横撇横横折弯钩
    '亿': 'sfo',          // 3画: 撇竖横折弯钩
    '说': 'kpksfcjsu',    // 9画: 点横折提点撇竖横折横撇竖弯钩
    '到': 'jnkjfifg',     // 8画: 横撇折点横竖提竖竖钩
    '话': 'kpsjffcj',     // 8画: 点横折提撇横竖竖横折横 
    '山': 'fbf',          '牙': 'jbgs',
    '出': 'bffbf',
    '写': 'kejzj',        // 5画: 点横钩横竖折折钩横(用户验证)
    '互': 'jncj',         // 4画: 横撇折横折横(用户验证)
    '没': 'kkisvel',      // 7画: 点点提撇横折弯横撇捺(用户验证)
    '今': 'slke',          // 4画: 撇捺点横撇(用户验证)
    '少': 'fsks',          // 4画: 竖撇点撇(用户验证)
    '小': 'gsk',           // 3画: 竖钩撇点(用户验证)
    '东': 'jngsk',         // 5画: 横撇折竖钩撇点(用户验证)
    '了': 'et',            // 2画: 横撇弯钩(用户验证)
    '子': 'etj',           // 3画: 横撇弯钩横(用户验证)
    '虫': 'fcjfik',        // 6画: 竖横折横竖提点(用户验证)
    '手': 'sjjt',           // 4画: 撇横横弯钩(用户验证)
    '凹': 'fvfcj',          // 5画: 竖横折折竖横折横(用户验证)
    '凸': 'fjfqj',          // 5画: 竖横竖横折折折横(用户验证)
    '鼎': 'fcjjjxjsfjfc',   // 12画: 竖横折横横横竖折折横撇竖横竖横折(用户验证)
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
        // 冲突时优先使用 REFERENCE（经人工审核），但展示两版供确认
        return { char:char, count:ref.length, strokes:ref, source:'conflict',
          cncharResult: strokes, referenceResult: ref,
          warning:'cnchar 与 lookup-table 数据不一致，已使用 lookup-table 数据，请人工确认' };
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
  var chars = [/* AI 填入本次请求的字，仅字符数组 */];
  // 自动从 LOOKUP_TABLE 筛选 REFERENCE 数据（AI 不得干预此步骤）
  chars.forEach(function(c) {
    if (LOOKUP_TABLE[c]) REFERENCE[c] = LOOKUP_TABLE[c];
  });
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

1. **原样复制**第四节脚本块（包含完整 LOOKUP_TABLE，约 140 字）
2. **只需填充 chars 数组**（字符数组，不含任何笔画数据）
3. **严禁修改 LOOKUP_TABLE**：该对象是固定数据，AI 不得增删改任何字或笔画
4. **严禁修改 REFERENCE 初始化为 `{}` 的语句**：REFERENCE 会在 initApp 中根据 chars 自动从 LOOKUP_TABLE 筛选
5. **实现 renderStrokeInfo**：根据 `data.source` 显示不同标识：
   - `confirmed` → ✓ 双源一致
   - `cnchar` → 仅 cnchar 数据
   - `reference` → 仅 lookup-table
   - `conflict` → ⚠ 数据冲突，需人工确认（同时展示两版数据）
6. **绝不硬编码笔画数据**：代码中除了 LOOKUP_TABLE 外，不得出现任何 `['撇','横',...]` 这样的笔画数组

## 六、纯文本模式

```
查 lookup-table.md
  ├─ 找到 → 输出并注明"来自 lookup-table，可能存在误差"
  └─ 未找到 → 「如需笔顺数据，可要求生成教学网页（通过 cnchar 查询）。」
```

## 七、自检清单

```
□ 1. 脚本块是否完整包含（含 STD 32种名称）？
□ 2. 是否只加载了 cnchar + cnchar-order 两个脚本？
     → 搜索代码中是否有 hanzi-writer、cnchar-draw、chinese-stroke 等第三方库 → 有则删除
     → 搜索代码中是否有 defaultCharDataLoader、{char}.json 等远程字典加载 → 有则删除
□ 3. LOOKUP_TABLE 是否完整原样复制（未增删改任何字）？
□ 4. REFERENCE 初始化语句是否为 `var REFERENCE = {};`（未被 AI 填入数据）？
□ 5. chars 数组中是否只包含字符（没有 `['撇','横']` 等数组形式的笔画数据）？
□ 6. 代码中除 LOOKUP_TABLE 外有无硬编码笔画数组？→ 有则删除
□ 7. 所有笔画数据是否仅通过 getStrokeData() 获取？
     → 搜索代码中是否有其他获取笔画名称的方式 → 有则删除
□ 8. conflict 状态是否展示了两版数据供人工确认？
□ 9. 每个字的数据来源标识是否显示？
```

## 八、已知 cnchar 错误（经用户验证）

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
| 九 | 横斜钩→横折弯钩 | so | 撇→横折弯钩(2画) |

> **教训**：可 的 cnchar 数据正确，AI 错误修改。到 的 cnchar 数据和 AI 修正都错。
> 写 的 lookup-table 数据曾全部写错。**结论：任何来源都需交叉验证，人是最终权威。**
