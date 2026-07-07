# PPTX 转 HTML 页面优化策略

本文件是 PPTX 转 HTML 产物的**专属**优化指南。当 SKILL.md 检测到 PPTX 页面特征后，**仅**加载本文件，不再加载 strategy-layout / strategy-visual / strategy-interaction。

---

## 一、自由度与硬约束

PPTX 转 HTML 的原始输出是机器生成的绝对定位页面，**可读性差、无语义结构、样式冗余**。优化的目标是将其重构为高质量的教学页面。除以下硬约束和默认约束外，**布局、CSS、动画效果、装饰元素、JS 实现方式、字号间距等一切均可自由重写**。

### 硬约束（不可违反）

| # | 约束 | 说明 |
|---|------|------|
| 1 | **内容完整** | 所有文字内容逐字保留，不改写、不删减、不重新措辞 |
| 2 | **资源真实** | `data-img` / `data-audio` / `data-video` 属性及其对应的 `<script>` 加载脚本必须保留，它们承载真实资源 URL；不可编造 URL |
| 3 | **门控行为** | 若原页面有点击动画步骤（`S` 数组非空），优化后必须实现等效的点击推进行为：点击 → 播放动画 → 全部播完 → 恢复翻页，并支持状态保存/恢复。详见第四节 |
| 4 | **页面标识** | `data-id`、`data-name` 属性值不变 |
| 5 | **根容器** | 使用 `min-height: 100%`，不设 `overflow: hidden`；根容器必须有 `.sr` class |

### 默认约束（用户未明确要求时应遵守）

- **配色严格沿用**：默认沿用原始页面的配色方案，视觉风格不应产生大出入。允许在同色系内微调明度/饱和度、补充层次色，但不更换主色方向。仅当用户**明确要求**换风格时才可突破

### 自由重写范围

只要满足上述约束，以下内容均可自由重写：布局结构、CSS 样式、动画效果与实现方式、装饰元素、JS 代码结构、字号间距、排版模式等。不必拘泥于原始实现。

---

## 二、输入结构速查

PPTX 转 HTML 页面由转换脚本自动生成，结构固定：

```
<template class="page-data" data-id="N" data-name="...">
  <style>
    .page-NNN { ... }              ← 根容器样式
    .page-NNN div { margin:0; ... } ← 全局 reset
    .page-NNN [data-anim-id] { visibility:hidden }  ← 动画初始隐藏
    @keyframes anim-fade-in { ... } ← 动画关键帧
    ...各元素的 class 样式...
  </style>

  <div class="sr page-NNN" data-interactive data-bg="0">
    ...绝对定位的内容元素（文字框、图片、矢量形状、公式）...
  </div>

  <script>/* 动画控制器：S 步骤数组 + syncClickNavigationGate */</script>
  <script>/* 图片加载器：var _IMG = [...] */</script>
  <script>/* 可选：音频/视频加载器 */</script>
</template>
```

### 关键组成

| 组成部分 | 说明 |
|---------|------|
| **`data-interactive`** | 根容器上的此属性告知壳框架"该页有点击交互，不要将点击转为翻页"。动画播完后由 JS 移除以恢复翻页。仅在有点击动画时存在 |
| **`data-anim-id="N"`** | 元素的动画标识，动画控制器通过此属性查找目标元素 |
| **`data-img="N"`** | 图片延迟加载标识，底部 JS（`var _IMG = [...]`）将 URL 数组中第 N 项赋值给该元素的 `src` |
| **`data-bg="N"`** | 背景图延迟加载标识，底部 JS 将 URL 赋值为根容器的 `background` |
| **`data-audio="N"`** | 音频按钮标识，点击时播放 URL 数组中第 N 项 |
| **`visibility:hidden`** | 带入场动画（`entr`）的元素初始隐藏，由动画控制器在点击时设为 `visible` |
| **`@keyframes`** | CSS 动画定义（淡入、擦入、滑入等），被动画控制器通过 `element.style.animation` 触发 |

---

## 三、重构指南

### 3.1 PPTX 特有陷阱

将绝对定位重构为流式布局时，以下问题是 PPTX 转 HTML 特有的，必须注意。

#### 文字容器

- **固定宽高 + `overflow:hidden`**：原始文本容器有固定 `width`/`height` 和 `overflow:hidden`，用于精确还原 PPT 文本框尺寸。转为流式布局后，必须去掉固定高度和 `overflow:hidden`，让文字自然撑开，否则字体渲染差异会导致文字被截断
- **spacer 空元素**：`display:inline-block; width:Npx` 的空元素用于模拟 PPT 字符间距。重构时删除，改用 `letter-spacing` 或 `gap`
- **无效字体名**：`font-family` 中 `'+mj-ea'`、`'+mn-ea'` 等 `+` 开头的名称是 PPT 内部占位符，浏览器无法解析。从列表中移除，保留后续回退字体
- **单字符容器**：数学公式中每个字符可能各占一个独立定位的 div（宽度 20–50px），这是 PPTX 转换的典型产物，参见下方"数学公式"的处理方式

#### 数学公式

PPTX 转换脚本无法识别公式语义，只能将每个字符/符号拆成独立定位的 div，分数则由分子 div + 分数线 div（`height:1px; border-top:1px solid`）+ 分母 div 拼合。**重构时应理解公式含义，用 LaTeX 重写**，不要保留多元素拼接。使用 MathJax 渲染（页面 `<script>` 中引入），行内公式用 `\( ... \)`，独立公式用 `\[ ... \]`。如果公式过于复杂无法准确还原语义，才退而求其次用 `position:relative` 容器包裹保留原始结构。

#### 图片与背景

- **`data-img` 延迟加载**：图片用 `data-img="N"` 配合底部 JS 数组赋值 `src`。重构时必须保留 `data-img` 属性和对应的 `<script>` 块
- **`data-bg` 背景图**：根容器的背景图用 `data-bg="N"` + 底部 JS 赋值。是否保留取决于用户需求——若用户要求更新页面风格，可删除背景图并用新的 CSS 背景替代；若需保留，则必须保持原始的 `data-bg` 属性、`data-bg-css` 属性（如有）和对应的 `<script>` 赋值逻辑，不可只保留属性而丢失脚本

#### 装饰性形状

`clip-path:polygon(...)` 三角形/箭头、半透明色块（`opacity:0.2~0.7`）等元素是 PPT 中的图形装饰。**不要简单保留其绝对定位**——这类元素最容易在重构后错位，强行保持原始坐标反而破坏视觉效果。正确做法是：分析其在原始页面中的位置和与周围教学内容的关系，推断其装饰目的（如标题区色块、要点区分隔、背景点缀等），然后在重构后的流式布局中用新的、适合当前布局的装饰手法实现同等目的（如左侧色条、卡片背景、圆角色块等）。

### 3.2 渐进式内容的布局处理

PPT 常用"出现/消失"动画在同一位置交替显示不同内容（如逐步显示解题过程）。此时多个元素在原始布局中**坐标重叠是有意为之**，它们靠 `visibility:hidden` 初始隐藏，由脚本控制依次出现。

#### 区分"始终可见"与"动画控制显隐"

- 元素**有** `data-anim-id` 且在 `<script>` 的 `S` 数组中被引用、`anim_class` 为 `entr` → 初始不可见，后续点击才出现。其空间**不应计入常规布局**
- 元素**无** `data-anim-id`，或其 `data-anim-id` 未被动画序列引用 → 始终可见，参与流式布局

#### 布局策略

- 始终可见的元素参与流式布局
- 动画控制显隐的元素用叠放定位（同一位置，靠 JS 切换可见性），不能拆开排列
- 绝对定位页面中所有元素坐标总高度可能远超 540px，但因为动画控制交替显示，实际任意时刻可见内容是能装下的。转为流式布局时不要将所有元素平铺展开

#### 溢出处理

内容应尽量在 540px 内完整显示。按以下优先级处理溢出：

1. **缩减间距**：减小 padding、margin、gap
2. **缩小字号**：正文降至 16px，标注降至 12px（不低于 12px）
3. **缩小图片**：等比缩小
4. **切换布局**：纵向→横向，或更紧凑的模式
5. **利用动画分层**：将部分内容改为点击展开（复用现有动画机制），使同一时刻可见内容不超出画布
6. **精简内容**：合并重复要点、缩短说明文字（保留核心信息）
7. **允许自然溢出**：以上手段均已用尽仍无法压入 540px，让内容自然超出画布，壳框架会提供垂直滚动

**禁止**：删除教学核心内容来腾出空间。

### 3.3 排版与视觉

#### 排版参考值

| 层级 | 推荐字号 | 用途 |
|------|---------|------|
| 大标题 | 28–36px，font-weight: 700 | 页面标题 |
| 小标题 | 20–24px，font-weight: 600 | 分区标题 |
| 正文 | 16–18px，font-weight: 400 | 主体内容 |
| 标注 | 12–14px | 注释、次要信息 |

- 页面内边距：上下 30px、左右 40px
- 模块间距 20–32px > 段落间距 12–16px > 要点间距 8–12px
- 行高 1.5–1.8
- 布局模式根据教学意图选择：单栏、双栏、卡片网格、图文混排

#### 配色规则

- 默认严格沿用原始页面的配色方案基调
- 允许在同色系内微调明度/饱和度
- 允许补充缺失的层次色（如加一个浅色背景区分区块）
- **禁止**更换主色方向或引入冲突色（除非用户明确要求换风格）

#### 装饰增强

- 可添加圆角（8–12px）、阴影（`box-shadow: 0 2px 8px rgba(0,0,0,0.1)`）
- 可添加内容区块的背景色块（使用主色调的低饱和度变体，`opacity:0.05~0.1`）
- 可添加分隔线（`1px solid` + 主色调低透明度）
- 标题区可用左侧色条装饰（`border-left: 4px solid 主色`）

#### 文字层次

- 标题使用主色调或深色，正文使用 `#333`–`#555`
- 标注/说明文字颜色比正文浅（`#888`–`#aaa`）
- 关键词/术语可加粗或使用强调色

---

## 四、点击推进动画参考

### 4.1 何时使用

当页面有需要教师逐步呈现的内容（如解题步骤、渐进式讲解）时，点击推进动画是成熟的解法。如果原页面有 `S` 数组和 `syncClickNavigationGate`，说明原始 PPT 就设计了这种渐进式呈现，优化后应保持等效的点击推进行为。

### 4.2 行为契约

点击推进动画必须满足以下行为：

1. **门控翻页**：动画未播完时，根容器设置 `data-interactive` 属性阻止翻页；全部播完后移除该属性恢复翻页
2. **`syncClickNavigationGate()`** 在三个时机调用：初始化时、每次点击推进后、状态恢复后
3. **点击事件绑定在 `.sr` 根容器上**（不是 `document` 或 `body`）
4. **交互触发序列**（`ISEQ`）的点击事件需 `stopPropagation`，防止同时推进主动画序列
5. **渐进式教学内容建议保持手动推进**，不要改为自动播放
6. **状态保存/恢复**：`saveState` 上报 `{ animStep, interactiveAnimStep }`；`restoreState` 时用 `instant=true` 快速恢复到目标步骤

如果保留原始动画系统，从原页面提取 `S` / `ISEQ` 数据填入下方模板；如果重新设计动画，需实现等效的门控和状态管理行为。

### 4.3 JS 参考实现

以下是点击推进动画的参考实现。保留原始动画系统时可直接使用（填入原页面的 `S` 和 `ISEQ` 数据）；重新设计动画时需实现等效的门控和状态管理行为。

```javascript
(function () {
  var S = __STEPS__;       // 点击动画步骤数组（从原页面提取）
  var ISEQ = __INTERACTIVE__; // 交互触发序列（从原页面提取）
  var c = 0;               // 当前点击步骤计数器
  var ic = {};             // 交互序列步骤计数器
  var r = document.querySelector(".sr");

  if (!r || (!S.length && !ISEQ.length)) return;

  // 播放单个动画效果
  function A(a, instant) {
    var e = r.querySelector('[data-anim-id="' + a.spid + '"]');
    if (!e) return;

    if (a.anim_class === "path" && a.path) {
      // 路径动画...
      return;
    }
    if (a.anim_class === "entr") {
      e.style.visibility = "visible";
      if (!instant && a.css_name && a.css_name !== "anim-appear") {
        e.style.animation = a.css_name + " " + a.duration + "ms ease forwards";
      }
    } else if (a.anim_class === "exit") {
      if (instant) {
        e.style.visibility = "hidden";
      } else if (a.css_name && a.css_name !== "anim-disappear") {
        e.style.animation = a.css_name + " " + a.duration + "ms ease forwards";
        setTimeout(function () { e.style.visibility = "hidden"; }, a.duration);
      } else {
        e.style.visibility = "hidden";
      }
    }
  }

  // 播放一组动画（处理 withEffect / afterEffect 时序）
  function PGroup(g, instant) {
    var maxDur = 0, click = [], withE = [], afterE = [];
    g.forEach(function (a) {
      if (a.node_type === "withEffect") withE.push(a);
      else if (a.node_type === "afterEffect") afterE.push(a);
      else click.push(a);
    });
    click.concat(withE).forEach(function (a) {
      A(a, instant);
      if (a.duration > maxDur) maxDur = a.duration;
    });
    if (afterE.length) {
      if (instant) { afterE.forEach(function (a) { A(a, true); }); }
      else { setTimeout(function () { afterE.forEach(function (a) { A(a, false); }); }, maxDur); }
    }
  }

  function syncClickNavigationGate() {
    if (S.length && c < S.length) {
      r.setAttribute("data-interactive", "");
    } else {
      r.removeAttribute("data-interactive");
    }
  }

  syncClickNavigationGate();

  if (S.length) {
    r.addEventListener("click", function () {
      if (c >= S.length) return;
      PGroup(S[c], false);
      c++;
      syncClickNavigationGate();
      saveState();
    });
  }

  ISEQ.forEach(function (seq) {
    var trigger = r.querySelector('[data-anim-id="' + seq.trigger_spid + '"]');
    if (!trigger || !seq.steps || !seq.steps.length) return;
    ic[seq.trigger_spid] = 0;
    trigger.setAttribute("data-cw-interactive", "");
    trigger.style.cursor = "pointer";
    trigger.addEventListener("click", function (evt) {
      var idx = ic[seq.trigger_spid] || 0;
      evt.stopPropagation();
      if (idx >= seq.steps.length) return;
      PGroup(seq.steps[idx], false);
      ic[seq.trigger_spid] = idx + 1;
      saveState();
    });
  });

  function saveState() {
    window.parent.postMessage({
      type: "saveState",
      state: { animStep: c, interactiveAnimStep: ic }
    }, "*");
  }

  window.addEventListener("message", function (e) {
    if (!(e.data && e.data.type === "restoreState" && e.data.state)) return;
    var t = e.data.state.animStep || 0;
    for (var i = 0; i < t && i < S.length; i++) PGroup(S[i], true);
    c = t;
    syncClickNavigationGate();

    var stepMap = e.data.state.interactiveAnimStep || {};
    ISEQ.forEach(function (seq) {
      var count = stepMap[seq.trigger_spid] || 0;
      for (var k = 0; k < count && k < seq.steps.length; k++) PGroup(seq.steps[k], true);
      ic[seq.trigger_spid] = count;
    });
  });
})();
```

---

## 检查清单

优化完成后逐项确认：

- [ ] `data-id` 和 `data-name` 与输入完全一致
- [ ] 文字内容与原页面完全一致，未改写/删减/重新措辞
- [ ] 教学内容图片/音频/视频资源保留（`data-img`/`data-audio`/`data-video` 及其 `<script>` 完整）
- [ ] 若有点击动画：门控行为正确（动画未播完时点击不翻页，播完后恢复）
- [ ] 根容器使用 `min-height: 100%`，无 `overflow: hidden`，有 `.sr` class
- [ ] 配色沿用原始方案基调（除非用户要求换风格）
