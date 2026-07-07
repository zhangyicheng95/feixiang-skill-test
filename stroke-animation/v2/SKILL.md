---
name: stroke-animation
description: 生成汉字田字格跟练、描红、运笔笔顺动画展示的 AI 互动课件时必须加载此 skill。基于 MakeMeAHanzi ARPHIC 公版字形 + stroke-order v57 教研笔顺（data v56-2026-04-15）蒸馏的 2,842 教材字几何库，提供两种使用模式：① `StrokeTrace.animate()` 一笔一笔展示书写动画（仅观看，自动播放，✍️ 握笔手势 + 蓝色发光墨迹 + 32 笔画口诀 + 调速控件），用于"看怎么写"场景；② `StrokeTrace.mount()` 互动跟练游戏（手写采样 + DTW 评分 + 红笔标注 + 三星反馈 + 进度条/连击/烟花正反馈 + 按需 Watch Mode），用于"亲手练"场景。严禁 AI 硬编码 SVG 路径数据、严禁 AI 直接读写 .path 字段、严禁引入 HanziWriter/cnchar-draw 等第三方笔顺渲染库。触发关键词：笔顺动画、运笔展示、运笔演示、看怎么写、跟练、描红、练字、田字格练习、手写练习、写字游戏。
---

更新时间：2026-04-29

# 汉字跟练与运笔标准（v1.5）

> 与 `stroke-order` 是配套关系：数据层（笔画名）走 stroke-order，渲染层（动画/手写）走本 skill。两者**必须同时加载**。
>
> ### v1.5（双模式 · 笔顺展示 + 跟练游戏）★ 新里程碑
>
> **本 skill 现在提供两种独立用法**，LLM 必须根据用户 prompt 类型选择正确的 API：
>
> | 用户需求 | API | 行为 |
> |---|---|---|
> | "看怎么写"、"笔顺动画"、"演示一遍"、"运笔展示" | **`StrokeTrace.animate()`** | 自动一笔一笔连播 + ✍️ 握笔 + 调速 + 暂停/上一笔/下一笔。**纯观看**，无手写。 |
> | "跟练"、"练字"、"描红"、"写字游戏"、"我来写" | **`StrokeTrace.mount()`** | 田字格 + 手写采样 + DTW 评分 + 三星 + 正反馈四件套。**亲手练**。 |
>
> **关键：两个 API 完全独立**——参数集互不相通，UI 也完全不同。LLM 不要混用，更不要试图给 mount 传 `mode: 'animate'`（不存在这种参数）。
>
> ### v1.4.1（按需教学 + 握笔手势）
>
> ① **mount 的 watchMode 默认按需触发**（`autoPlay: false`）——学生主动点「📹 看示范」才播放；② **✍️ 右手握笔 emoji 跟随笔尖**——animate 和 mount 都有；③ `retryAfterFails` 默认 0。
>
> ### v1.4（直观引导 v1）
>
> Watch Mode 写前示范（金色虚拟毛笔 + "起笔慢-行笔快-收笔顿"自然曲线）、32 种笔画口诀、📹 按需示范按钮。
>
> **v1.3（正反馈 v1）**：进度条 + 完美笔金色闪光 + 连续三星连击徽章 + 整字完成烟花，默认全开。
>
> **v1.2（LLM 稳定性 v1）**：`validate()` / `validateAll()` 输入校验 API + Prompt 路由表（8 场景 + 2 标准骨架 + LLM 硬约束）。
>
> **v1.1 对齐 stroke-order v57**（data v56-2026-04-15）：穴字头/阝/殳/朵/学字族/铅 6 类共性错误修正、45 字「横撇→横钩」、5 字（交/岸/幸/性/柱）补齐、「尔」字第 2 笔修正。几何数据向后兼容。

## 一、核心原则

1. **严禁硬编码任何 SVG 路径数据**——MakeMeAHanzi 的 path 极长且容易抄错，AI 记忆不可靠。
2. **path 数据完全封装在 `StrokeTrace.mount()` 内部**，不通过任何属性向 LLM 暴露。
3. **唯一渲染入口**：`window.StrokeTrace.mount(opts)`。其他 API（preload/listChars/hasChar）仅用于辅助查询。
4. **必须配套 `stroke-order` skill**：本 skill 通过 `window.getStrokeData()` 读取笔画名做提示。
5. **禁引第三方笔顺库**：HanziWriter、cnchar-draw、chinese-stroke、hanzi-animator 全部禁用。
6. **小学场景仅支持 2,842 教材字**：扩展字（曼/丁/丙等）暂无几何数据，需走降级 UI。

## 二、生成代码必做（照抄 URL）

`<head>` 中**依序**注入两个 `<script>`，**顺序不可反**：

```html
<script src="https://musk-test.fbcontent.cn/pub-musk-ai-studio/skills/stroke-order/v57/templates/stroke-loader.js"></script>
<script src="https://musk-test.fbcontent.cn/pub-musk-ai-studio/skills/stroke-animation/v1/templates/animation-loader.js"></script>
```

`animation-loader.js` 自动派发 `stroke-anim-ready` 事件（path + 笔画名都加载完毕后触发，**自 v1.1 起全局只派发一次**，避免多次 listener 触发）。

## 三、最小可运行代码（跟练模式，≤ 16 行）

> 仅展示动画？跳到第五章 `animate()` API。**先决策再用**：v1.5 起 stroke-animation 提供两套 API，参数集独立。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <script src="https://musk-test.fbcontent.cn/pub-musk-ai-studio/skills/stroke-order/v57/templates/stroke-loader.js"></script>
  <script src="https://musk-test.fbcontent.cn/pub-musk-ai-studio/skills/stroke-animation/v1/templates/animation-loader.js"></script>
</head>
<body>
  <div id="trace"></div>
  <script>
    window.addEventListener('stroke-anim-ready', function () {
      window.StrokeTrace.mount({ target: '#trace', char: '学' });
    });
  </script>
</body>
</html>
```

`mount` 自动注入完整 UI：田字格 + Canvas 手写区 + 当前笔提示 + 三星反馈 + 重写/下一笔/重新开始按钮。无需 LLM 自己写 SVG/Canvas 代码。

## 四、`StrokeTrace.mount` 完整 API（跟练游戏）

```js
const handle = window.StrokeTrace.mount({
  target: '#box',                          // ★ 必需：CSS 选择器或 Element
  char: '学',                              // ★ 必需：单字（必须在 2842 教材字内）

  mode: 'follow',                          // 'follow' (跟随，默认) | 'free' (自由) | 'test' (测试)

  grid: {
    style: 'tian'                          // 'tian' | 'mi' | 'nine' | 'none'
  },

  brush: {
    color: '#2D3436',                      // 笔触颜色
    width: 22                              // 笔触宽度（viewBox 1024 下）
  },

  scoring: {
    enabled: true,                         // 启用评分（默认 true）
    showStars: true,                       // 显示三星
    showSegmentErrors: true,               // 红笔标注偏差段
    combo: false,                          // 三星连击数
    threshold: { excellent: 0.90, good: 0.75, pass: 0.60 }
  },

  hints: {
    showOutline: true,                     // 字形轮廓底图（三色：待写/当前/已完成）
    showStrokeOrder: false,                // 笔顺编号 ①②③（默认关，仅初始演示）
    pulseNextStroke: true,                 // 下一笔起点呼吸动画
    showStrokeName: true,                  // 当前笔显示笔画名（如「横钩」）
    showStrokeTip: true                    // ★ v1.4 在 hint 下方显示 32 种笔画口诀
  },

  // ★ v1.4 新增 / v1.4.1 调整默认：写前示范动画（Watch Mode）
  watchMode: {
    enabled: true,                         // 总开关
    // v1.4.1：默认按需触发（不自动播）。学生主动点「📹 看示范」时才播放。
    autoPlay: false,                       // false（默认按需）| 'first'（仅 mount 首笔自动）| true（每笔自动，旧行为）
    duration: 1100,                        // 正常播放时长 ms
    retryDuration: 1700,                   // 重写时变慢，更易看清
    retryAfterFails: 0,                    // v1.4.1：默认 0 = 关闭自动重试（避免打断）；老师场景可设 2
    showBrush: true,                       // 金色虚拟笔尖（带发光 + 起笔/收笔顿放大）
    showHand: true,                        // ★ v1.4.1：右手握笔 ✍️ emoji 跟随笔尖（教学握笔手势）
    handEmoji: '✍️',                       // 自定义手势 emoji（U+270D 写字手；可改 🖐️ ✋ 等）
    handSize: 80,                          // emoji 字号 px（基于 1024×1024 viewBox）
    fadeOutDuration: 500,                  // 示范痕迹淡出 ms
    showButton: true                       // 控件栏显示「📹 看示范」按钮
  },

  // ★ v1.1 新增：顺滑书写（自动进入下一笔）
  autoAdvance: true,                       // true（默认，最顺滑）| 'on-pass'（仅 ≥2 星自动）| false（兼容旧版手动点击）
  autoAdvanceDelay: 700,                   // 自动跳转延迟 ms（0 即刻，默认 700 给星级反馈时间）

  // ★ v1.3 新增：正反馈体系（默认全开）
  celebration: {
    enabled: true,                         // 总开关（false 则 4 个特效全关）
    perfectStroke: true,                   // 3 星笔完成瞬间的金色闪光
    combo: true,                           // 连续 3 星右上角"🔥 连击 N"徽章
    comboMin: 2,                           // 连击徽章最低触发（默认 ≥2 连才显示，避免噪音）
    fireworks: true,                       // 整字完成（≥2 星）粒子烟花
    fireworksDuration: 1800                // 烟花持续 ms（0/1 星不触发）
  },
  progress: {
    showBar: true                          // 顶部彩色进度条（随已完成笔数增长）
  },

  // 回调（全部可选）
  onStrokeStart:    function ({ index, name, startPoint }) {},
  onStrokeComplete: function ({ index, strokeName, stars, final, start, end, path, errors, userPts }) {},
  onFinish:         function ({ char, strokes, finalScore, finalStars, combo }) {},
  onReset:          function () {}
});

// handle 提供的方法
handle.reset();                            // 清空重写
handle.redoStroke();                       // 重写当前笔
handle.nextStroke();                       // 进入下一笔
handle.setChar('字');                      // 切到另一个字（复用 UI）
handle.playDemo(slow?);                    // ★ v1.4 手动播放当前笔示范，slow=true 慢速教学
handle.getStrokeResults();                 // 获取每笔评分快照
handle.getCurrentStroke();                 // 当前笔索引（0-based）
handle.destroy();                          // 销毁组件，移除事件
```

### 4.1 正反馈触发条件（v1.3）

| 特效 | 触发时机 | 关闭方式 |
|---|---|---|
| **进度条** | 每笔评分完成立刻更新宽度（写完几笔就 N/总 %） | `progress.showBar: false` |
| **完美笔金色闪光** | 用户抬笔瞬间得到 `stars === 3` 时在 canvas 上叠加 0.5s 金色光弧 | `celebration.perfectStroke: false` |
| **连击徽章** | 连续 N 笔三星（默认 N ≥ 2）时右上角弹出「🔥 连击 N」| `celebration.combo: false` 或 `comboMin: 999` |
| **完成烟花** | 整字完成且 `finalStars >= 2` 时在田字格上粒子爆发 1.8s（0/1 星不放，避免错误正反馈） | `celebration.fireworks: false` |
| **总开关** | — | `celebration.enabled: false`（一次性关掉全部 4 项） |

**教学场景建议**：

- 课堂生字教学：默认全开
- 课后作业 / 考试模式：`celebration: { enabled: false }`，保持纯净
- 低年级初学：`celebration: { comboMin: 3 }`，避免太频繁徽章分心

### 4.2 直观引导触发条件（v1.4.1）

| 引导手段 | 触发时机（v1.4.1 新默认） | 视觉表现 | 关闭方式 |
|---|---|---|---|
| **📹 看示范按钮** | **★ 默认主入口**——控件栏左侧，任意时刻可点 | 重放当前笔示范；播放时按钮金色脉动；带 ✍️ 握笔手 + 金色笔尖 + 蓝色发光轨迹 | `watchMode.showButton: false` |
| **Watch Mode 写前示范** | 由 `autoPlay` 决定：`false`（默认，仅按钮触发）/ `'first'`（仅 mount 首笔自动）/ `true`（每笔自动） | 金色虚拟毛笔沿 median 滑过 1.1s + ✍️ 右手握笔跟随 + 蓝色发光墨迹 + 0.5s 淡出 | `watchMode.enabled: false` |
| **32 笔画口诀** | 每笔切换时自动更新 hint 下方（与示范是否播放无关） | 浅黄背景 💡 图标 + 8-14 字朗朗上口口诀（"先一横，钩向左下"） | `hints.showStrokeTip: false` |
| **失败自动加强** | 连续 N 次重写都 < 2 星（**默认 N=0 关闭**） | 自动慢速重播示范（duration 1.7s） | 默认已关；想开启设 `watchMode.retryAfterFails: 2` |

**示范节奏（speedCurve）**：起笔段（前 15% 时间）走 8% 长度（慢，模拟"顿笔"）→ 行笔段（中 70% 时间）走 80% 长度（快）→ 收笔段（后 15% 时间）走 12% 长度（顿，模拟"回锋"）。**起笔/收笔时虚拟笔尖半径放大 1.6 倍**，可视化运笔节奏。

**v1.4.1 ✍️ 右手握笔手势**：示范期间，一只虚拟右手 emoji 跟随金色笔尖运动。emoji 锚点对齐运动中的精确笔尖位置，**手部自然在笔尖右上方**——对横/竖/撇/捺等所有笔画方向都符合真实右手书写姿势。可换 emoji（如 🖐️ ✋）或关闭：

```js
StrokeTrace.mount({
  watchMode: { showHand: false }            // 完全不显示手势
  // 或
  watchMode: { handEmoji: '🖐️', handSize: 100 }   // 换图标 + 调大小
});
```

**手动控制**：

```js
const handle = StrokeTrace.mount({ /*...*/ });
handle.playDemo();          // 当前笔标准速度重播
handle.playDemo(true);      // 当前笔慢速教学模式（1.7s）
```

**典型场景配置**：

| 场景 | 推荐 watchMode 配置 |
|---|---|
| 默认（学生自学） | 默认即可（按需点 📹） |
| 课堂集体讲解 | `autoPlay: 'first'`：第 1 笔自动播一次引入，后续靠老师讲 |
| 完全教学模式 | `autoPlay: true, retryAfterFails: 2`：每笔自动播 + 写错自动加强 |
| 考试 / 静默练习 | `enabled: false`：完全不出现示范，仅纯粹评分 |

**口诀分布**（按笔画类型）：
- 基本 6 种（点/横/竖/撇/捺/提）
- 折类 5 种（横折/竖折/撇折/横撇/撇点）
- 钩类 12 种（竖钩/弯钩/斜钩/卧钩/竖弯钩/横钩/横折钩/横折弯钩/横撇弯钩/横折折折钩/竖折折钩/横斜钩）
- 提类 2 种（竖提/横折提）
- 弯折组合 7 种

每条口诀 8-14 字内，覆盖**起、行、收三段动作 + 末端形状**。

## 五、`StrokeTrace.animate` 完整 API（笔顺动画 · v1.5 新增）

> 用途：用户只需要**看一遍这个字怎么写**，不需要亲手练。自动一笔一笔连播 + ✍️ 握笔手势 + 蓝色发光墨迹 + 32 笔画口诀 + 调速控件。

### 5.1 最小用法

```html
<div id="anim"></div>
<script>
window.addEventListener('stroke-anim-ready', function () {
  StrokeTrace.animate({ target: '#anim', char: '学' });
});
</script>
```

页面加载后**自动播放**，全部参数都有合理默认。

### 5.2 完整 API

```js
const handle = StrokeTrace.animate({
  target: '#box',                        // ★ 必需
  char: '学',                            // ★ 必需，2842 textbook 字

  // 播放控制
  autoStart: true,                       // 加载完自动播放（默认 true）
  loop: false,                           // 整字播完是否重新开始
  speed: 1.0,                            // 速度倍数（0.5 / 1 / 1.5 / 2）
  perStrokeMs: 1100,                     // 单笔基准时长 ms
  pauseBetweenStrokes: 350,              // 笔间停顿 ms
  finishHoldMs: 1200,                    // loop 时整字播完停留 ms

  // 视觉
  showHand: true,                        // ✍️ 握笔手势 emoji
  handEmoji: '✍️',                       // 可换 🖐️ ✋ 等
  handSize: 80,
  showBrush: true,                       // 金色笔尖圆点
  showHint: true,                        // 顶部「第 N 笔: 横钩 (3/8)」
  showStrokeTip: true,                   // 💡 32 笔画口诀
  showControls: true,                    // 底部 ⏯ ⏭ ⏮ 🔁 调速 控件栏
  grid: { style: 'tian' },

  // 回调（全部可选）
  onStrokeStart: function ({ index, name, total }) {},
  onStrokeEnd:   function ({ index, name, total }) {},
  onComplete:    function ({ char, total }) {}
});

// handle 提供的方法
handle.play();
handle.pause();
handle.next();          // 跳到下一笔
handle.prev();          // 回上一笔
handle.restart();       // 从第 1 笔重播
handle.setSpeed(2);     // 调速
handle.setChar('字');   // 切字
handle.isPlaying();     // boolean
handle.destroy();
```

### 5.3 animate vs mount —— 决策表

| 维度 | `animate()` 笔顺动画 | `mount()` 跟练游戏 |
|---|---|---|
| 学生交互 | ❌ 仅观看 | ✅ 手写采样 |
| 评分 | ❌ | ✅ DTW 三星 |
| 正反馈（烟花/连击）| ❌ | ✅ 完整 4 件套 |
| Watch Mode 按需示范 | ❌（本身就是动画） | ✅ 默认按需 |
| 控件 | ⏯ ⏭ ⏮ 🔁 调速 | 重写 / 下一笔 / 重新开始 / 📹 看示范 |
| 关键 prompt | "看怎么写"、"演示一遍"、"运笔展示"、"笔顺动画" | "跟练"、"练字"、"描红"、"写字游戏" |

### 5.4 典型场景

| 场景 | 推荐配置 |
|---|---|
| 课堂讲解新生字"先看一遍" | 默认即可 |
| 复习模式（老师循环演示）| `loop: true, speed: 0.7` |
| 学生先看慢动作再练 | `speed: 0.5` 配合下方按钮切到 mount |
| 嵌入 PPT 课件无控件 | `showControls: false, autoStart: true, loop: true` |

### 5.5 双模式联动（先看后练，**最推荐的教学骨架**）

```html
<div id="stage"></div>
<div>
  <button id="modeAnimate" class="active">📺 看怎么写</button>
  <button id="modePractice">✍️ 我来写</button>
</div>
<script>
let handle = null;
function rebuild(mode, char) {
  if (handle) handle.destroy();
  if (mode === 'animate') {
    handle = StrokeTrace.animate({ target: '#stage', char });
  } else {
    handle = StrokeTrace.mount({ target: '#stage', char });
  }
}
window.addEventListener('stroke-anim-ready', () => rebuild('animate', '学'));
modeAnimate.onclick = () => rebuild('animate', '学');
modePractice.onclick = () => rebuild('practice', '学');
</script>
```

## 六、🚫 严禁的典型错误写法

```js
// ❌ 不存在 path API（即使存在也是私有）
StrokeTrace.getPath('学')
window.getStrokePath('学')
window._ST.dataLoader.getCharPath('学').strokes        // 私有 API，禁止 LLM 触碰

// ❌ 自行构造 SVG path
element.innerHTML = '<svg><path d="M 100 100 L 200 200">';
path.setAttribute('d', 'M 375 821 ...');

// ❌ 引入第三方库
new HanziWriter(el, '学', { ... });
cnchar.draw('学', { type: cnchar.draw.TYPE.STROKE });

// ❌ 给 mount 传 strokes/paths 字段（被忽略 + warning）
StrokeTrace.mount({
  char: '学',
  strokes: ['点', '点', '横钩', ...],    // 不需要传，内部自取
  paths:   ['M ...', ...]                  // 严禁
});

// ❌ 在 stroke-anim-ready 之前就调 mount
StrokeTrace.mount({ char: '学' });          // 数据未就绪，会显示加载中

// ❌ 对扩展字 mount（无几何数据）
StrokeTrace.mount({ char: '曼' });          // tier='extended'，应降级为只展示笔画名

// ❌ v1.5：把 animate 和 mount 的参数互传
StrokeTrace.animate({ char: '学', scoring: {...}, watchMode: {...} });  // 都被忽略
StrokeTrace.mount({ char: '学', loop: true, speed: 2.0 });              // 都被忽略

// ❌ v1.5：给 mount 传 mode='animate'（不存在这个参数）
StrokeTrace.mount({ char: '学', mode: 'animate' });   // 仍然是练字模式
// 看一遍要写 → 用 StrokeTrace.animate()
```

## 七、✅ 推荐用法

### A. 单字跟练（最常见）

```js
window.addEventListener('stroke-anim-ready', function () {
  window.StrokeTrace.mount({ target: '#trace', char: '春' });
});
```

### B. 多字课件（每字一个 mount，不复用 UI）

```js
window.addEventListener('stroke-anim-ready', function () {
  ['一', '十', '大', '口'].forEach(function (ch, i) {
    var box = document.createElement('div');
    box.id = 'trace-' + i;
    document.getElementById('app').appendChild(box);

    // ★ 每字校验是否在字库内（2842 textbook）★
    if (!window.StrokeTrace.hasChar(ch)) {
      box.innerHTML = '<div style="text-align:center;padding:20px;color:#999">'
                    + ch + '：暂无几何数据</div>';
      return;
    }
    window.StrokeTrace.mount({ target: box, char: ch });
  });
});
```

### C. 单容器多字（切换字、复用 UI）

```js
let handle;
window.addEventListener('stroke-anim-ready', function () {
  handle = window.StrokeTrace.mount({ target: '#trace', char: '一' });

  document.querySelectorAll('.char-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      handle.setChar(btn.dataset.char);
    });
  });
});
```

### D. 完成后联动其他模块（如打分汇总到老师后台）

```js
window.StrokeTrace.mount({
  target: '#trace',
  char: '学',
  onFinish: function (r) {
    // r = { char, strokes: [...], finalScore: 0.87, finalStars: 2, combo: 0 }
    fetch('/api/log-practice', {
      method: 'POST',
      body: JSON.stringify({ char: r.char, score: r.finalScore })
    });
  }
});
```

## 八、场景化使用约束

### 场景 A：小学语文跟练课件 — 严格模式

仅支持 `tier === 'textbook'` 的 2,842 教材字。校验：

```js
const d = window.getStrokeData(ch);
if (d.tier !== 'textbook' || !window.StrokeTrace.hasChar(ch)) {
  // UI 显示："{ch} 不在小学教材字表，无法跟练"
  return;
}
window.StrokeTrace.mount({ target: '#box', char: ch });
```

**触发关键词**：小学 / 幼小衔接 / 一～六年级 / 部编版 / 人教版 / 统编版 / 识字写字 / 生字 / 会写字 / 语文课件 / 写字课

### 场景 B：通用手写练习 — 宽松模式

扩展字（如「曼」「丁」）**无几何数据**，必须明示降级，不调用 `mount`：

```html
<div class="card-extended">
  <div class="ch">曼</div>
  <div class="notice">⚠ 扩展字暂不支持跟练，仅展示笔顺</div>
  <ul>
    <!-- 通过 getStrokeData('曼').strokes 渲染笔画名 -->
  </ul>
</div>
```

### 默认场景判定

prompt 含以下关键词 → **严格模式**：

- 小学 / 幼小衔接
- 一年级 / 二年级 / 三年级 / 四年级 / 五年级 / 六年级
- 部编版 / 人教版 / 统编版
- 生字 / 会写字 / 识字 / 会读字
- 语文课件 / 小学语文 / 写字课

其他默认宽松模式，但扩展字必须降级。

## 九、辅助 API

### 8.1 简单查询

```js
window.StrokeTrace.isReady();           // boolean，数据是否加载完毕
window.StrokeTrace.hasChar('学');       // boolean，是否在 2842 textbook 字库
window.StrokeTrace.listChars();         // string[]，全部 2,842 字
window.StrokeTrace.getTier('学');       // 'textbook' | 'extended' | null
window.StrokeTrace.preload(['学', '写']); // Promise，按需预热（V1 暂不分片，与 isReady 等价）
```

### 8.2 ★ `validate(input, opts?)` — LLM 必用的输入校验（v1.2 新增）

接收用户输入（可能是单字、句子、粘贴文本），返回一个结构化结果，告诉 LLM **该不该 mount + 为什么 + 下一步怎么办**。

```js
window.StrokeTrace.validate('学');
// {
//   ok: true,
//   char: '学',
//   reason: null,
//   reasonText: '',
//   strokeCount: 8,
//   strokeNames: ['点','点','撇','点','横钩','横撇','弯钩','横'],
//   tier: 'textbook',
//   hasPath: true,
//   hasNames: true,
//   allHansInInput: ['学'],
//   suggestion: null
// }
```

**`ok: true` 的充要条件**：字在 2842 textbook 字库内（`hasPath === true && tier === 'textbook'`），可以直接 `mount({char})`。

**`ok: false` 时的 `reason` 枚举**（LLM 可安全 switch）：

| reason | 情形 | LLM 应对 |
|---|---|---|
| `'not-ready'` | 字库还没加载 | 等 `stroke-anim-ready` 事件 |
| `'empty'` | 输入空 / 纯空白 / null | 提示用户输入汉字 |
| `'not-han'` | 首字符非汉字（字母/符号/emoji） | 温和提示"请输入一个汉字" |
| `'not-in-library'` | 超出 7818 字库（扩展 B 区生僻字） | 用 `<stroke-card>` 降级或提示换字 |
| `'not-in-textbook'` | 在 extended 库（4976 小学范围外字） | 用 `<stroke-card>` 展示笔顺，不 mount |

**`suggestion` 字段**：给 LLM 下一步的中文代码/话术建议，可直接作为用户提示。

### 8.3 `validateAll(input, opts?)` — 批量校验

用于用户粘贴一段文本（诗句、句子）时做批处理：

```js
window.StrokeTrace.validateAll('春眠不觉晓');
// { ok: true, totalHans: 5, valid: ['春','眠','不','觉','晓'], invalid: [], suggestion: null }

window.StrokeTrace.validateAll('春曼秋');   // 「曼」是扩展字
// {
//   ok: false, totalHans: 3,
//   valid: ['春','秋'],
//   invalid: [{char:'曼', reason:'not-in-textbook', reasonText:'...', tier:'extended'}],
//   suggestion: '部分字不支持：曼。建议只对 valid 字调用 mount，对 invalid 字用 <stroke-card> 降级。'
// }
```

自动忽略 ASCII / 标点 / emoji，只对 Han 字校验。返回 `valid` / `invalid` 分组。

## 十、Prompt 路由表（v1.2 引入，v1.5 重写双 API）

**LLM 路由总规则**（v1.5）：

```
用户 prompt 包含 "看 / 演示 / 笔顺动画 / 怎么写 / 看一遍 / 运笔展示"
  → 用 StrokeTrace.animate()  仅观看，无手写

用户 prompt 包含 "练 / 写 / 描红 / 跟练 / 田字格练习 / 写字游戏 / 我来写"
  → 用 StrokeTrace.mount()    手写 + 评分

用户 prompt 仅含 "笔画名 / 笔画数 / 哪些是小学字 / 笔顺步骤列表"
  → 用 stroke-order 的 <stroke-card>，本 skill 不引入

用户 prompt 含双重需求 "先看一遍再跟着写"
  → 双模式联动：默认显示 animate，提供切换按钮到 mount（见 5.5）
```

### 10.1 核心路由表

| # | 用户输入样例 | 应使用 | LLM 生成的代码骨架 |
|---|---|---|---|
| **1** | **"看「学」字怎么写"、"学字笔顺动画"** | **animate** | `animate({target:'#a', char:'学'})` |
| **2** | **"演示一下春夏秋冬的笔顺"** | **多 animate** | 循环创建容器 + `animate()` 每字一个，可设 loop:false |
| 3 | "练「学」字" / "我想练学字" | mount | `validate('学')` → `mount({char:r.char})`，否则显示 reasonText |
| 4 | "练春夏秋冬" / "练四季字" | 多 mount | `validateAll('春夏秋冬')` → `valid[]` 每字 mount 一个容器 |
| 5 | "练春晓这首诗" | 多 mount | `validateAll(诗句)` → 同 #4 |
| **6** | **"先看一遍再跟着写「学」"、"边看边练"** | **双模式联动** | 默认 animate + 切换按钮到 mount（见 5.5 标准骨架） |
| 7 | "我想练龘字" / 生僻字 | 降级 | `validate()` → `reason:'not-in-library'` → 用 `<stroke-card char="龘">` |
| 8 | 用户输入 `'`、`abc`、emoji | 错误提示 | `validate()` → 显示 `reasonText` |
| 9 | "练一年级上册第 1 课生字" | 严格 | `validateAll(字表)`，自动过滤 extended |
| 10 | "「学」字几画？哪些笔画？"（仅文字） | ❌ 不用本 skill | 直接 `<stroke-card char="学">`（stroke-order） |
| 11 | "生成一个生字测试小游戏" / "闯关练字" | 多 mount | `validateAll` + 循环 mount + `onFinish` 做总分 |

### 10.2 标准骨架：LLM 遇到"用户输入字练练看"类 prompt

直接用这套骨架，**无需自己判断字是否在库**：

```html
<div id="trace"></div>
<div id="err" style="color:#C0392B;font-size:13px;margin:8px 0"></div>
<script>
window.addEventListener('stroke-anim-ready', function () {
  // 用户输入来自 LLM（或 UI 输入框），统一走 validate
  var r = window.StrokeTrace.validate('学');        // ← 把"学"换成用户想练的字
  if (r.ok) {
    window.StrokeTrace.mount({ target: '#trace', char: r.char });
  } else {
    document.getElementById('err').textContent = r.reasonText;
    // LLM 可选：if (r.reason === 'not-in-textbook' || r.reason === 'not-in-library')
    // 再渲染 <stroke-card char="X"> 做降级展示
  }
});
</script>
```

### 10.3 标准骨架：多字课件

```html
<div id="app"></div>
<script>
window.addEventListener('stroke-anim-ready', function () {
  var r = window.StrokeTrace.validateAll('春夏秋冬');
  var app = document.getElementById('app');
  r.valid.forEach(function (ch) {
    var box = document.createElement('div');
    box.id = 'trace-' + ch;
    app.appendChild(box);
    window.StrokeTrace.mount({ target: box, char: ch });
  });
  r.invalid.forEach(function (x) {
    // 降级：小学范围外 / 超出字库，用 stroke-order 的 <stroke-card>
    app.insertAdjacentHTML('beforeend',
      '<stroke-card char="' + x.char + '"></stroke-card>');
  });
});
</script>
```

### 10.4 标准骨架：先看再练（v1.5 双模式联动）

```html
<div id="stage"></div>
<div class="modes">
  <button id="mAnim" class="active">📺 看怎么写</button>
  <button id="mPrac">✍️ 我来写</button>
</div>
<script>
let h = null;
function rebuild(mode, ch) {
  if (h && h.destroy) h.destroy();
  h = (mode === 'animate')
    ? StrokeTrace.animate({ target: '#stage', char: ch })
    : StrokeTrace.mount({ target: '#stage', char: ch });
}
window.addEventListener('stroke-anim-ready', () => rebuild('animate', '学'));
mAnim.onclick = () => { rebuild('animate', '学'); mAnim.classList.add('active'); mPrac.classList.remove('active'); };
mPrac.onclick = () => { rebuild('practice', '学'); mPrac.classList.add('active'); mAnim.classList.remove('active'); };
</script>
```

### 10.5 LLM 硬约束

- **禁止**：未经 `validate()` / `hasChar()` 直接 `mount()` 或 `animate()` 用户输入的字
- **禁止**：对 `ok: false` 的字强行 mount/animate（会显示"不在字库"占位）
- **禁止**：在 `validate()` 的 `reasonText` 之上再加自己编造的解释
- **禁止 v1.5**：把 animate 和 mount 的参数互相混用（`animate({scoring:...})` / `mount({loop:true})` 都被忽略）
- **禁止 v1.5**：给 mount 传 `mode: 'animate'`（不存在该参数；要展示动画请直接调用 `animate()`）
- **推荐**：对 `reason: 'not-in-textbook'` 的字，配合 stroke-order 的 `<stroke-card>` 做降级
- **推荐**：批量场景一律用 `validateAll()`，不要自己循环 `hasChar`
- **推荐 v1.5**：教学课件优先双模式联动（10.4 骨架），让学生"先看再练"，比单一模式效果好

## 十一、禁忌清单

| # | 禁止 | 后果 |
|---|---|---|
| 1 | SVG path 字符串字面量出现在代码里 | 数据失控 |
| 2 | 访问 `.path` / `_path` / `getCharPath` 等私有 API | 违反封装 + 后续版本破坏 |
| 3 | 引入 HanziWriter / cnchar-draw 等第三方库 | 数据冲突 + 笔顺名错乱 |
| 4 | 自行构造 `<svg><path>` 或 `<canvas>` 渲染汉字 | 没有可信 path 数据 |
| 5 | 只引入 stroke-animation，不引入 stroke-order | 笔画名缺失（hint 不显示） |
| 6 | 先引 stroke-animation 再引 stroke-order | 依赖顺序错 |
| 7 | 对 extended 字调用 `mount` | 显示"不在字库" |
| 8 | mount 参数传 strokes/paths 字段 | 被忽略（保留为兼容） |
| 9 | 在 stroke-anim-ready 之前 mount | 显示"加载中" |
| 10 | innerHTML 拼接 `<path d="...">` | 等价硬编码 |

## 十二、生成后自检

```
□  1. 引入 stroke-loader.js（数据层）？
□  2. 引入 animation-loader.js（渲染层）？两者顺序正确？
□  3. 没有引入 HanziWriter / cnchar-draw 等禁用库？
□  4. 代码中 grep 不到 'M ' + 数字 开头的 SVG 路径字面量？
□  5. 代码中 grep 不到 .path 字段访问？
□  6. mount/animate 调用前监听了 stroke-anim-ready 事件？
□  7. ★ v1.5 prompt 路由：是"看"用 animate，是"练"用 mount，没混用？
□  8. ★ v1.5 没给 animate 传 mount 参数（scoring/celebration/watchMode），反之亦然？
□  9. ★ 每个可能的用户输入字都调用了 validate() / validateAll() 做校验？（v1.2）
□ 10. ★ 未对 validate 返回 ok:false 的字调用 mount/animate？（v1.2）
□ 11. 多字场景用 validateAll() 分组 valid/invalid？
□ 12. 小学场景过滤了 tier !== 'textbook' 的字？
□ 13. 扩展字 / 超库字走了降级分支（stroke-card / 不 mount/animate）？
□ 14. 错误信息直接用 result.reasonText，没有自行编造？（v1.2）
□ 15. ★ v1.5 双重需求"先看再练"用了双模式联动骨架（10.4），不是单一 API？
```

## 十三、纯文本对话模式

当用户仅对话询问跟练/描红功能（不生成代码）：

> "跟练与运笔练习需要生成交互式网页。我可以帮你生成一个田字格练习页面，挑选字后会配好评分和星级反馈。"

**严禁凭记忆描述任何字的运笔动作**（"先写一竖，再写一横"等）。

## 十四、与 stroke-order 的职责边界（v1.5 更新）

### 14.1 数据层 vs 渲染层 分工

| 职责 | stroke-order | stroke-animation |
|---|---|---|
| 笔画数 (`d.count`) | ✅ 唯一来源 | ❌ |
| 笔画名数组 (`d.strokes`) | ✅ 唯一来源 | ❌（通过 `getStrokeData` 取） |
| tier 分层 (`d.tier`) | ✅ | 透传（`StrokeTrace.getTier`） |
| 笔画名展示 UI（`<stroke-card>`） | ✅ | ❌ |
| tier 徽章（`<stroke-tier>`） | ✅ | ❌ |
| 字形 SVG path | ❌ | ✅（私有，不暴露） |
| 中线 medians（运笔轨迹）| ❌ | ✅（私有，不暴露） |
| 田字格渲染 | ❌ | ✅ |
| **笔顺连播动画**（`animate`）| ❌ | **✅ v1.5 新增** |
| **跟练交互 + DTW 评分**（`mount`）| ❌ | **✅** |

### 14.2 LLM 引入决策（v1.5 重要）

| 用户 prompt 类型 | stroke-order | stroke-animation | 用什么 API |
|---|---|---|---|
| "展示笔顺步骤卡" / "列出笔画名 + 笔画数" | ✅ 必引 | ❌ 不引 | `<stroke-card>` |
| "「学」字几画？哪些笔画？" | ✅ 必引 | ❌ 不引 | `<stroke-card>` |
| **"看「学」字怎么写" / "笔顺动画" / "运笔展示"** | ✅ | ✅ | **`StrokeTrace.animate()`** |
| **"练「学」字" / "描红" / "田字格练习" / "手写评分"** | ✅ | ✅ | **`StrokeTrace.mount()`** |
| **"先看一遍再跟着写"** | ✅ | ✅ | **双模式联动**（10.4） |

### 14.3 简单规则

```
prompt 仅含 "笔画名 / 笔画数 / 笔顺步骤"（纯文字）
  → 只引入 stroke-order，用 <stroke-card>
  
prompt 含 "看 / 演示 / 笔顺动画 / 运笔展示" 等观看意图
  → 引入 stroke-order + stroke-animation，用 StrokeTrace.animate()
  
prompt 含 "练 / 写 / 描红 / 跟练 / 写字游戏" 等动手意图
  → 引入 stroke-order + stroke-animation，用 StrokeTrace.mount()
  
prompt 含双重意图 "先看后练"
  → 引入两 skill，用双模式联动骨架（同时支持 animate + mount）
```

## 十五、关联资源

- `assets/stroke-path.json`（7.3 MB / gzip 2.96 MB CDN 资源，运行时一次性加载，**不进 LLM context**）
- `assets/coverage_report.csv`（覆盖率报告：当前 100% 覆盖 2,842 教材字）
- `templates/animation-loader.js`（110 KB / gzip 31 KB 单文件 loader，暴露 `window.StrokeTrace`，含 mount + animate 两套 UI）
- `templates/animate-demo.html`（v1.5 双模式 demo：📺 看怎么写 ↔ ✍️ 我来写）
- `templates/trace-prod.html`（生产级 demo，可直接打开试玩）
- `templates/validate-demo.html`（v1.2：validate API 用法演示）
- `scripts/distill_stroke_path.py`（数据蒸馏脚本，输入 MakeMeAHanzi + stroke-data，输出 stroke-path）

## 十六、版本历程

| 版本 | 里程碑 | 核心改进 |
|---|---|---|
| v0.1 | 方案立项 | 技术方案 + SKILL.md 草案 |
| v0.5 | concept demo | 4 字示意 + DTW 评分 + 红笔 + 星级 |
| v1.0 | 生产级 loader | 2,842 字全覆盖 + 单文件 53KB + 完整 API + 32 单测 |
| v1.1 | 顺滑 + 对齐 v57 | autoAdvance（写完自动进下一笔 700ms）· stroke-anim-ready 只派发一次 · 搜字输入框 · 对齐 stroke-order v57 / data v56-2026-04-15 |
| v1.2 | LLM 稳定性 v1 | `validate()` / `validateAll()` 新 API（结构化返回 ok / reason / tier / suggestion）· SKILL.md 新增 Prompt 路由表（8 场景 + 2 标准骨架 + LLM 硬约束）· 93 单测全过 |
| v1.3 | 正反馈 v1 | 进度条 · 完美笔金色闪光 · 连击徽章 · 完成烟花，默认全开 · 细粒度开关 · Canvas fx 层（pointer-events:none 不影响手写） |
| v1.4 | 直观引导 v1 | Watch Mode 写前示范 · 32 种笔画口诀 · 失败自动加强 · 📹 按需示范按钮 · `playDemo(slow)` 公共 API |
| v1.4.1 | 按需教学 + 握笔手势 | watchMode 默认按需触发（`autoPlay: false`） · ✍️ 右手握笔 emoji 跟随笔尖 |
| **v1.5** | **★ 双模式（展示 + 跟练）** | **新增 `StrokeTrace.animate()` API：仅笔顺展示动画（无手写交互），自动一笔一笔连播 + ✍️ 握笔手势 + 蓝色发光墨迹 + 32 笔画口诀 + 调速控件（⏯ ⏭ ⏮ 🔁 0.5x/1x/2x） · `mount()` 行为完全不变（向后兼容）· SKILL.md 新增第 5 章 animate 完整 API、Prompt 路由表重写双 API 决策、与 stroke-order 协同关系按双模式重梳理 · animate-demo.html 双模式联动 demo · loader 110KB / gzip 31KB（净增 22KB / 5KB）** |
| v1.6 | 三段式提示线（规划中） | 起/行/收分色 + 末端形状 |
| v2 | 扩展字 + 深度学习评分 | 覆盖 7,818 字 + 训练集精细化阈值 |
