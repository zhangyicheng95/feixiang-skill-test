---
name: stroke-animation
description: 生成汉字田字格跟练、描红、笔顺动画展示的 AI 互动课件时必须加载此 skill。基于 MakeMeAHanzi ARPHIC 公版字形 + stroke-order v57 教研笔顺（data v56）蒸馏的 2,842 教材字几何库。两套 API 各司其职：① `StrokeTrace.animate()` 笔顺动画（仅观看，✍️ 握笔手势 + 蓝色发光墨迹 + 32 笔画口诀 + 调速）；② `StrokeTrace.mount()` 跟练游戏（手写采样 + DTW 评分 + 红笔标注 + 三星 + 进度条/连击/烟花 + Watch Mode + ★ v1.6 错笔强制重写 + 整字完成"作品感"）。严禁硬编码 SVG 路径、引入 HanziWriter/cnchar-draw 等三方笔顺库。触发词：笔顺动画、运笔展示、看怎么写、跟练、描红、练字、田字格练习、手写练习、写字游戏。
---

更新时间：2026-05-06

# 汉字跟练与运笔标准（v1.6）

> 与 `stroke-order` 配套：数据层（笔画名）走 stroke-order，渲染层（动画 / 手写）走本 skill。**两者必须同时加载**。

## 一、两套 API 一句话决策

| 用户意图 | 用什么 |
|---|---|
| "看怎么写"、"笔顺动画"、"演示一遍"、"运笔展示" | **`StrokeTrace.animate()`** 仅观看，自动连播 |
| "跟练"、"练字"、"描红"、"田字格练习"、"写字游戏" | **`StrokeTrace.mount()`** 手写 + 评分 |
| "先看一遍再跟着写" | **双模式联动**（默认 animate，加切换按钮到 mount，见 §6.4） |
| "笔画名 / 笔画数 / 笔顺步骤列表"（仅文字） | ❌ 不用本 skill，用 stroke-order 的 `<stroke-card>` |

**两个 API 完全独立，参数集不互通**。不要给 mount 传 `mode:'animate'`、不要给 animate 传 `scoring`/`watchMode`。

## 二、核心原则

1. **严禁硬编码任何 SVG path 字符串**（MakeMeAHanzi 路径极长，AI 记忆不可靠）
2. **path 数据完全封装在内部**，禁止访问 `.path` / `_path` / `getCharPath` 等私有 API
3. **必配套 `stroke-order`**：本 skill 通过 `window.getStrokeData()` 取笔画名
4. **禁三方库**：HanziWriter、cnchar-draw、chinese-stroke、hanzi-animator
5. **小学场景仅 2,842 教材字**：扩展字（曼/丁/丙等）走降级 UI，不调 mount/animate

## 三、依赖加载（顺序不可反）

```html
<script src="https://musk-test.fbcontent.cn/pub-musk-ai-studio/skills/stroke-order/v57/templates/stroke-loader.js"></script>
<script src="https://musk-test.fbcontent.cn/pub-musk-ai-studio/skills/stroke-animation/v3/templates/animation-loader.js"></script>
```

`animation-loader.js` 加载完后自动派发 `stroke-anim-ready` 事件（每个页面只派发一次）。**所有 mount/animate 调用都必须放在事件 listener 内**。

## 四、`StrokeTrace.mount()` — 跟练游戏

### 4.1 最小用法

```html
<div id="trace"></div>
<script>
window.addEventListener('stroke-anim-ready', function () {
  StrokeTrace.mount({ target: '#trace', char: '学' });
});
</script>
```

`mount` 自动注入完整 UI：田字格 + Canvas 手写区 + 当前笔提示 + 三星反馈 + 重写/下一笔/重新开始/📹 看示范 按钮。

### 4.2 完整 API（含 v1.6 新增）

```js
const handle = StrokeTrace.mount({
  target: '#box',                          // ★ CSS 选择器或 Element
  char: '学',                              // ★ 必须在 2842 教材字内

  grid:    { style: 'tian' },              // 'tian' | 'mi' | 'nine' | 'none'
  brush:   { color: '#2D3436', width: 22 },

  scoring: {
    enabled: true,
    showStars: true,
    showSegmentErrors: true,
    threshold: { excellent: 0.90, good: 0.75, pass: 0.60 },
    // ★ v1.6：通过门槛
    passStars:   2,    // 2 (默认) | 1 (宽松) | 3 (严格)
    failHoldMs:  1000  // 错笔停留显示红笔的时长 ms（让学生看清错在哪）
  },

  hints: {
    showOutline: true,         // 字形衬底（待写米驼/当前橙/已完成绿三色）
    pulseNextStroke: true,     // 下一笔起点呼吸圆
    showStrokeName: true,      // hint 行显示笔画名（"横钩"）
    showStrokeTip: true        // hint 下方 32 笔画口诀（💡）
  },

  // 写前示范：金色虚拟毛笔 + ✍️ 握笔 emoji 跟随笔尖
  watchMode: {
    enabled: true,
    autoPlay: false,           // false（默认按需点）| 'first' | true
    showHand: true,
    showButton: true,
    retryAfterFails: 0         // 连续 N 次未达通过线自动慢速示范，0=关闭
  },

  // 顺滑书写：通过笔后自动跳到下一笔
  autoAdvance: true,           // true（默认）| 'on-pass' | false
  autoAdvanceDelay: 700,

  // 正反馈四件套（默认全开）
  celebration: {
    enabled: true,
    perfectStroke: true,       // 3 星笔金色闪光
    combo: true, comboMin: 2,  // 连击徽章
    fireworks: true,           // 整字 ≥2 星烟花
    fireworksDuration: 1800
  },
  progress: { showBar: true },

  // ★ v1.6 新增：整字写完后的"作品感"
  artwork: {
    enabled: true,             // 衬底淡出，保留田字格 + 学生笔迹
    message: '🎉 这是你写出来的字！'
  },

  onStrokeStart:    function ({ index, name, startPoint }) {},
  onStrokeComplete: function ({ index, strokeName, stars, passed, ... }) {},
  onFinish:         function ({ char, strokes, finalScore, finalStars, combo }) {},
  onReset:          function () {}
});

handle.reset();          // 完整重置（也是作品感"再写一次"按钮触发）
handle.redoStroke();     // 重写当前笔
handle.nextStroke();     // 进入下一笔（v1.6：当前笔未通过会被拒绝）
handle.setChar('字');    // 切换练习字
handle.playDemo(slow?);  // 主动播当前笔示范
handle.destroy();
```

### 4.3 ★ v1.6 跟练新规则

**错笔不保留，必须写对再前进**：

| 阶段 | 行为 |
|---|---|
| 学生抬笔 | 评分（DTW + 三星） |
| **达到 `passStars`**（默认 ≥2 星） | 笔迹保留 → 进度 +1 → 自动进入下一笔 |
| **未达 `passStars`**（0/1 星） | 红笔标注偏差段，停留 `failHoldMs`（默认 1s）→ 自动清除该笔笔迹 → 强制重写当前笔 |

**未通过时**：不更新进度条、不计入 combo、不启用「下一笔」按钮、不响应自动跳转、手动点「下一笔」会显示温和提示「先把这一笔写对再继续」。

**前面已通过的笔不受影响**——只清当前一笔的错笔。

**整字完成"作品感"**：

- 标准衬底（米驼/橙/绿三色字形轮廓）以 0.8s 渐变淡出
- 田字格保留、学生最终笔迹保留、星级/烟花/连击保留
- 提示语变身为「🎉 这是你写出来的字！综合 N 分」
- 「下一笔」按钮变身为「再写一次 ↻」（点击触发完整 reset）
- `artwork.enabled: false` 可关闭，回到旧的"完成提示 + 重新开始按钮"行为

### 4.4 教学场景预设

| 场景 | 推荐配置 |
|---|---|
| 默认课堂 | 全部默认即可 |
| 低年级初学（更宽容） | `scoring: { passStars: 1 }` 一星即过 |
| 高年级 / 字帖训练 | `scoring: { passStars: 3 }` 必须三星才前进 |
| 考试 / 静默练习 | `celebration: { enabled: false }, watchMode: { enabled: false }` |
| 自动加强引导 | `watchMode: { autoPlay: 'first', retryAfterFails: 2 }`，连续 2 次未通过自动慢速示范 |
| 关闭作品感（旧行为） | `artwork: { enabled: false }` |

## 五、`StrokeTrace.animate()` — 笔顺动画

### 5.1 最小用法

```html
<div id="anim"></div>
<script>
window.addEventListener('stroke-anim-ready', function () {
  StrokeTrace.animate({ target: '#anim', char: '学' });
});
</script>
```

加载后**自动一笔一笔连播**：金色虚拟毛笔沿 median 滑动 + ✍️ 握笔 emoji 跟随 + 蓝色发光墨迹 + 笔画口诀 + 控件栏（⏯ ⏭ ⏮ 🔁 调速）。

### 5.2 完整 API

```js
const handle = StrokeTrace.animate({
  target: '#box', char: '学',           // ★ 必需
  autoStart: true, loop: false, speed: 1.0,
  perStrokeMs: 1100, pauseBetweenStrokes: 350,
  showHand: true, handEmoji: '✍️', handSize: 80,
  showBrush: true, showHint: true, showStrokeTip: true,
  showControls: true, grid: { style: 'tian' },
  onStrokeStart: function ({ index, name, total }) {},
  onStrokeEnd:   function ({ index, name, total }) {},
  onComplete:    function ({ char, total }) {}
});
handle.play(); handle.pause(); handle.next(); handle.prev();
handle.restart(); handle.setSpeed(2); handle.setChar('字');
handle.isPlaying(); handle.destroy();
```

### 5.3 典型场景

| 场景 | 配置 |
|---|---|
| 课堂讲解新生字"先看一遍" | 默认 |
| 复习模式（老师循环演示）| `loop: true, speed: 0.7` |
| 嵌入 PPT 课件无控件 | `showControls: false, autoStart: true, loop: true` |

## 六、Prompt 路由（LLM 选 API 的核心规则）

### 6.1 路由总规则

```
prompt 含 "看 / 演示 / 笔顺动画 / 怎么写 / 看一遍 / 运笔展示"
  → StrokeTrace.animate()  仅观看，无手写

prompt 含 "练 / 写 / 描红 / 跟练 / 田字格练习 / 写字游戏 / 我来写"
  → StrokeTrace.mount()    手写 + 评分（v1.6 默认错笔重写 + 作品感）

prompt 仅含 "笔画名 / 笔画数 / 笔顺步骤列表"（纯文字需求）
  → 用 stroke-order 的 <stroke-card>，本 skill 不引入

prompt 含双重需求 "先看一遍再跟着写"
  → 双模式联动（§6.4）
```

### 6.2 路由表

| # | 用户输入样例 | 用什么 |
|---|---|---|
| 1 | "看「学」字怎么写"、"学字笔顺动画" | `animate({ char: '学' })` |
| 2 | "演示一下春夏秋冬的笔顺" | 多 `animate()` |
| 3 | "练「学」字"、"我想练学字" | `validate('学')` → `mount({ char })` |
| 4 | "练春夏秋冬"、"练四季字" | `validateAll('春夏秋冬')` → 多 mount |
| 5 | "练春晓这首诗" | `validateAll(诗句)` |
| 6 | "先看一遍再跟着写「学」"、"边看边练" | 双模式联动（§6.4） |
| 7 | "我想练龘字" / 生僻字 | `validate()` → 降级到 `<stroke-card>` |
| 8 | 用户输入 `'`、`abc`、emoji | `validate().reasonText` 直接显示 |
| 9 | "练一年级上册第 1 课生字" | 严格模式 + `validateAll` |
| 10 | "「学」字几画？哪些笔画？"（仅文字） | ❌ 不用本 skill，用 `<stroke-card>` |

### 6.3 标准骨架：用户输入字 → mount

```html
<div id="trace"></div>
<div id="err" style="color:#C0392B;font-size:13px;margin:8px 0"></div>
<script>
window.addEventListener('stroke-anim-ready', function () {
  var r = window.StrokeTrace.validate('学');   // ← 用户想练的字
  if (r.ok) {
    StrokeTrace.mount({ target: '#trace', char: r.char });
  } else {
    document.getElementById('err').textContent = r.reasonText;
  }
});
</script>
```

### 6.4 标准骨架：双模式联动（先看后练）

```html
<div id="stage"></div>
<button id="mAnim" class="active">📺 看怎么写</button>
<button id="mPrac">✍️ 我来写</button>
<script>
let h = null, ch = '学';
function rebuild(mode) {
  if (h && h.destroy) h.destroy();
  h = (mode === 'animate')
    ? StrokeTrace.animate({ target: '#stage', char: ch })
    : StrokeTrace.mount   ({ target: '#stage', char: ch });
}
window.addEventListener('stroke-anim-ready', () => rebuild('animate'));
mAnim.onclick = () => { rebuild('animate');  mAnim.classList.add('active'); mPrac.classList.remove('active'); };
mPrac.onclick = () => { rebuild('practice'); mPrac.classList.add('active'); mAnim.classList.remove('active'); };
</script>
```

### 6.5 标准骨架：多字课件

```html
<div id="app"></div>
<script>
window.addEventListener('stroke-anim-ready', function () {
  var r = window.StrokeTrace.validateAll('春夏秋冬');
  var app = document.getElementById('app');
  r.valid.forEach(function (ch) {
    var box = document.createElement('div');
    box.id = 'trace-' + ch; app.appendChild(box);
    StrokeTrace.mount({ target: box, char: ch });
  });
  r.invalid.forEach(function (x) {
    app.insertAdjacentHTML('beforeend', '<stroke-card char="' + x.char + '"></stroke-card>');
  });
});
</script>
```

## 七、`validate` / `validateAll` — LLM 输入校验

```js
StrokeTrace.validate('学');
// { ok:true, char:'学', reason:null, strokeCount:8, strokeNames:[...],
//   tier:'textbook', hasPath:true, hasNames:true, suggestion:null }

StrokeTrace.validateAll('春眠不觉晓');
// { ok:true, totalHans:5, valid:['春','眠','不','觉','晓'], invalid:[] }
```

`ok:false` 时 `reason` 枚举：

| reason | 情形 | LLM 应对 |
|---|---|---|
| `not-ready` | 字库还没加载 | 等 `stroke-anim-ready` 事件 |
| `empty` | 输入空 / 纯空白 / null | 提示用户输入汉字 |
| `not-han` | 首字符非汉字（字母/符号/emoji）| 显示 `reasonText` |
| `not-in-textbook` | 在 extended 库（小学范围外） | 用 `<stroke-card>` 降级 |
| `not-in-library` | 超出 7818 字库（生僻字） | 用 `<stroke-card>` 或换字 |

辅助 API：`StrokeTrace.isReady()` / `hasChar(c)` / `listChars()` / `getTier(c)` / `preload(arr?)`。

## 八、严禁清单

| # | 禁止 | 后果 |
|---|---|---|
| 1 | SVG path 字符串字面量出现在代码 | 数据失控 |
| 2 | 访问 `.path` / `_path` / `getCharPath` 等私有 API | 违反封装 |
| 3 | 引入 HanziWriter / cnchar-draw 等三方库 | 数据冲突 |
| 4 | 自行构造 `<svg><path>` 或 `<canvas>` 渲染汉字 | 没有可信数据 |
| 5 | 只引 stroke-animation 不引 stroke-order | 笔画名缺失 |
| 6 | stroke-animation 在 stroke-order 之前引入 | 顺序错 |
| 7 | 对 extended 字调 `mount`/`animate` | 显示"不在字库" |
| 8 | 在 `stroke-anim-ready` 之前调用 mount/animate | 一直显示"加载中" |
| 9 | 给 mount 传 `mode:'animate'` 等不存在的参数 | 仍是练字模式 |
| 10 | 把 mount 与 animate 的参数互传（`animate({ scoring })`、`mount({ loop })`） | 都被忽略 |
| 11 | 未经 `validate()`/`hasChar()` 直接对用户输入字 mount | 兜底缺失 |
| 12 | 在 `validate().reasonText` 之上自行编造解释 | 信息不一致 |

## 九、与 stroke-order 的协同

| 职责 | stroke-order | stroke-animation |
|---|---|---|
| 笔画数 / 笔画名 / tier | ✅ 唯一来源 | ❌ |
| 笔画名展示卡片 `<stroke-card>` | ✅ | ❌ |
| 字形 SVG path / 中线 medians | ❌ | ✅（私有不暴露） |
| 田字格、笔顺动画、跟练 + 评分 | ❌ | ✅ |

**简单规则**：

```
仅文字需求（笔画名 / 笔画数 / 笔顺步骤）  →  只引 stroke-order
观看意图（看 / 演示 / 笔顺动画 / 运笔展示）→ 引两个，用 animate()
动手意图（练 / 写 / 描红 / 跟练 / 写字游戏）→ 引两个，用 mount()
双重意图（先看后练）                       → 引两个，双模式联动
```

## 十、生成后自检

```
□  1. 引入 stroke-loader.js 与 animation-loader.js？顺序正确？
□  2. 没有 HanziWriter / cnchar-draw 等禁用库？
□  3. 没有 'M ' + 数字 开头的 SVG 路径字面量？没有 .path 字段访问？
□  4. mount/animate 在 stroke-anim-ready 事件之内调用？
□  5. 是"看"用 animate、是"练"用 mount，没混用、没互传参数？
□  6. 用户输入字调用了 validate()/validateAll() 校验？
□  7. ok:false 的字走了降级（reasonText 显示 / <stroke-card>）？
□  8. 小学场景过滤了 tier !== 'textbook' 的字？
□  9. ★ v1.6：使用默认 passStars 即可获得"错笔强制重写"行为，未自行覆盖为 0；
□ 10. ★ v1.6：未关 artwork.enabled，让学生写完字看到"作品感"反馈；
□ 11. 双重需求"先看再练"用 §6.4 双模式联动，不是单一 API。
```

## 十一、纯文本对话模式

用户仅询问跟练/描红功能但不要求生成代码时：

> "跟练与运笔练习需要生成交互式网页。我可以为你生成一个田字格练习页面，挑选字后自带评分、星级反馈和错笔强制重写。"

**严禁凭记忆描述任何字的运笔动作**（"先写一竖，再写一横"等）。

## 十二、关联资源

- `assets/stroke-path.json`（7.6 MB / gzip ~3 MB，运行时一次加载，**不进 LLM context**）
- `templates/animation-loader.js`（~117 KB / gzip ~33 KB 单文件 loader）
- `templates/animate-demo.html`（v1.6 双模式 demo · 错笔重写 + 作品感）
- `templates/trace-prod.html`（生产级跟练 demo）
- `templates/validate-demo.html`（validate API 演示）

## 十三、版本简史

| 版本 | 关键改进 |
|---|---|
| v1.0 | 生产级 loader · 2,842 字全覆盖 · 单文件 53KB |
| v1.1 | autoAdvance 顺滑书写 · 对齐 stroke-order v57（data v56） |
| v1.2 | `validate()` / `validateAll()` 输入校验 · Prompt 路由表 |
| v1.3 | 正反馈四件套（进度条 + 完美闪光 + 连击 + 烟花） |
| v1.4 | Watch Mode 写前示范 · 32 笔画口诀 · 📹 按需示范按钮 |
| v1.4.1 | watchMode 默认按需触发 · ✍️ 右手握笔 emoji |
| v1.5 | ★ 新增 `animate()` 笔顺动画 API（仅观看） |
| **v1.6** | **★ 错笔强制重写（`scoring.passStars`/`failHoldMs`）+ 整字"作品感"完成态（`artwork`，衬底淡出）** |
