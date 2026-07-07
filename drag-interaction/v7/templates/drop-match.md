# 模板 C：拼图 / 连线 / 配对（拖到指定区域）

> 🔒 = 必须原样复制（连变量名、注释、空行都别动）
> 🔧 = 可按业务改（样式、命中规则、文案）
> SKILL.md 硬约束 #2：违反 🔒 标记 = 评测失败

## 何时用

用户需要"把一个元素拖到指定的目标区域，命中后吸附保留、未命中复位"。常见场景：

- 英文单词 ↔ 中文释义配对
- 把化学元素拖到周期表对应位置
- 把分数拖到数轴对应刻度
- 拼图（图片块拖到正确槽位）
- 把概念卡拖到对应的分类筐里

判断信号：

- 有明确的"待拖元素"和"目标区"两类对象
- 命中需要业务判定（不只是改顺序）
- 未命中时需要复位（带 FLIP 动画 / 直接归位均可，详见下方实现）

**不适用**：列表排序（模板 B）、自由拖动（模板 A）、无判定的自由摆放（模板 A）。

## 完整可复制模板

> 🔧 HTML 结构 / CSS 视觉样式 / 命中文案 — **可按业务改**
> 🔒 CSS「三件套」（touch-action / user-select / -webkit-touch-callout）— **必抄**
> 🔒 整段 JS（变量命名、函数拆分、FLIP 4 步顺序、pointercancel 独立监听）— **必抄**
> 错误分支二选一：① 原样复制 FLIP 9 行；② 显式降级（见下方「错误分支降级方案」节）

```html
<div class="board">
  <div class="drop-zone" data-target="apple">🍎</div>
  <div class="drop-zone" data-target="banana">🍌</div>
  <div class="drop-zone" data-target="cherry">🍒</div>
</div>
<div class="bank">
  <div class="word" data-word="apple"  data-drag>apple</div>
  <div class="word" data-word="banana" data-drag>banana</div>
  <div class="word" data-word="cherry" data-drag>cherry</div>
</div>

<style>
  /* 三件套全配齐——前两个压制选中，第三个专门压制 iOS 长按菜单 */
  body {
    touch-action: none;
    user-select: none; -webkit-user-select: none;
    -webkit-touch-callout: none;
  }
  .board, .bank { display: flex; gap: 12px; padding: 16px; }
  .drop-zone {
    width: 80px; height: 80px; font-size: 32px;
    border: 2px dashed #bbb; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
  }
  .drop-zone.matched { border-color: #2D593E; background: #d4f4dd; }
  .word {
    padding: 8px 16px; background: #fff; border: 1px solid #ddd; border-radius: 4px;
    cursor: grab;
    transition: left .25s, top .25s; /* 复位时的弹回动画 */
  }
  .word.dragging { transition: none; cursor: grabbing; }
</style>

<script>
(function () {
  let activeEl = null, activePid = null, offsetX = 0, offsetY = 0;
  let originalParent = null, originalNext = null;

  document.addEventListener('pointerdown', (e) => {
    const el = e.target.closest('[data-drag]');
    if (!el) return;
    activeEl = el;
    activePid = e.pointerId;
    originalParent = el.parentNode;
    // 若 el 是最后一个子节点，nextSibling === null；后续 insertBefore(el, null) 等价 appendChild，DOM API 合规
    originalNext = el.nextSibling;
    // 必检 #5 + #6：用 getBoundingClientRect 算 offset（禁用 e.offsetX/Y），避免松手位置错乱
    const r = el.getBoundingClientRect();
    offsetX = e.clientX - r.left;
    offsetY = e.clientY - r.top;

    // 必检 #10：拖拽时脱离原父级 → fixed 到 body
    // 否则父级的 overflow:hidden / transform 会导致坐标计算错误或被裁掉
    el.style.width = r.width + 'px';
    el.style.height = r.height + 'px';
    el.style.position = 'fixed';
    el.style.left = r.left + 'px';
    el.style.top = r.top + 'px';
    el.style.zIndex = '9999';
    el.classList.add('dragging');
    document.body.appendChild(el);

    // 必检 #4：捕获指针，避免快速移动时 move 事件丢失
    el.setPointerCapture(e.pointerId);
  });

  document.addEventListener('pointermove', (e) => {
    if (e.pointerId !== activePid || !activeEl) return;
    activeEl.style.left = (e.clientX - offsetX) + 'px';
    activeEl.style.top  = (e.clientY - offsetY) + 'px';
  });

  document.addEventListener('pointerup', (e) => {
    if (e.pointerId !== activePid || !activeEl) return;

    // 必检 #8 + #9：用 elementFromPoint 判定 drop（禁手算 hitbox）；
    //               调用前必须把自己 pointer-events 关掉，否则永远捞到自己
    activeEl.style.pointerEvents = 'none';
    const hit = document.elementFromPoint(e.clientX, e.clientY);
    activeEl.style.pointerEvents = '';

    const zone = hit && hit.closest('.drop-zone');
    const correct = zone
      && zone.dataset.target === activeEl.dataset.word
      && !zone.classList.contains('matched'); // 已配对过的格子不能再放

    activeEl.releasePointerCapture(e.pointerId);
    activeEl.classList.remove('dragging');

    if (correct) {
      // 命中：吸附进 zone，清掉浮起样式
      zone.classList.add('matched');
      zone.appendChild(activeEl);
      resetFloatStyles(activeEl);
      // 默认锁定：移除 data-drag，事件委托不再识别这个元素 → 配对成功后不能再被拖出
      // 教研默认预期是"放进去就锁住"；如业务要求"可反悔重做"，删掉下面两行并完善状态机
      activeEl.removeAttribute('data-drag');
      activeEl.style.cursor = 'default';
    } else {
      // ⚠️ 关键：FLIP 用 rAF + setTimeout 异步执行；本块末尾会同步把 activeEl 置 null，
      //    必须先抓局部引用 el / parent / next，否则异步回调里 activeEl 已是 null → 报错 → "FLIP 不弹回"
      const el = activeEl;
      const parent = originalParent;
      const next = originalNext;

      // 1) First: 记下当前松手处的 fixed 坐标
      const firstLeft = parseFloat(el.style.left);
      const firstTop  = parseFloat(el.style.top);
      // 2) Last: 暂时清掉 fixed 让元素静态归位，量出归位后的目标坐标
      //    （同步代码内浏览器不会 paint，所以不会闪屏）
      parent.insertBefore(el, next);
      resetFloatStyles(el);
      const lastRect = el.getBoundingClientRect();
      // 3) Invert: 重新浮起到松手位置（视觉上元素还在用户手放开的地方）
      //    关键：先显式禁掉 transition——auto → length 的过渡行为各浏览器实现不一致，
      //    显式禁掉能保证 Invert 是瞬时跳变，不会变成"从原位过渡到松手位置"的反向动画。
      el.style.transition = 'none';
      el.style.width = lastRect.width + 'px';
      el.style.height = lastRect.height + 'px';
      el.style.position = 'fixed';
      el.style.zIndex = '9999';
      el.style.left = firstLeft + 'px';
      el.style.top  = firstTop + 'px';
      // 4) Play: 下一帧恢复 transition，再改到目标坐标，CSS transition 自动播放弹回
      requestAnimationFrame(() => {
        el.style.transition = '';
        el.style.left = lastRect.left + 'px';
        el.style.top  = lastRect.top + 'px';
        setTimeout(() => resetFloatStyles(el), 260);
      });
    }
    activeEl = null; activePid = null;
  });

  // 必检 #11：系统中断（来电、手势识别失败）时直接复位，不走 FLIP 动画
  document.addEventListener('pointercancel', (e) => {
    if (e.pointerId !== activePid || !activeEl) return;
    originalParent.insertBefore(activeEl, originalNext);
    resetFloatStyles(activeEl);
    activeEl.releasePointerCapture(e.pointerId);
    activeEl.classList.remove('dragging');
    activeEl = null; activePid = null;
  });

  function resetFloatStyles(el) {
    el.style.position = '';
    el.style.left = el.style.top = '';
    el.style.width = el.style.height = '';
    el.style.zIndex = '';
  }
})();
</script>
```

## 该模板专属注意

### drop 命中判定：按目标形状选方法

**矩形 drop zone（默认情况）**：用 `elementFromPoint`

```js
// ❌ 错误：手算矩形 hitbox，drop-zone 嵌套、父级 transform、页面缩放时全错
if (x > zone.x && x < zone.x + zone.w && y > zone.y && y < zone.y + zone.h) { ... }
```

**正确**：

```js
// ✅ 浏览器内部用真实渲染坐标判定，永远准
const hit = document.elementFromPoint(x, y);
const zone = hit && hit.closest('.drop-zone');
```

调用 `elementFromPoint` **必须**先把拖拽元素 `pointer-events: none`，否则永远捞到自己。

**圆形 drop zone（如圆盘、圆形按钮，`border-radius: 50%`）**：用几何距离判定，**不要**用 elementFromPoint

`elementFromPoint` 命中的是元素的**矩形 bounding box**——把圆形元素套进去，圆外四角会被错判为命中。

替换的 drop 判定段：

```js
const zoneRect = circularZone.getBoundingClientRect();
const cx = zoneRect.left + zoneRect.width / 2;
const cy = zoneRect.top + zoneRect.height / 2;
const r = zoneRect.width / 2;  // 正圆：宽高相等
const correct = Math.hypot(e.clientX - cx, e.clientY - cy) < r;
// 椭圆兜底：const a = w/2, b = h/2; correct = (dx/a)**2 + (dy/b)**2 < 1
```

多个圆形 zone 的复用函数：

```js
function findCircularDropZone(clientX, clientY) {
  for (const zone of document.querySelectorAll('.drop-zone')) {
    const rect = zone.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    if (Math.hypot(clientX - cx, clientY - cy) < rect.width / 2) return zone;
  }
  return null;
}

// 在 pointerup 里替换 elementFromPoint 那段：
const zone = findCircularDropZone(e.clientX, e.clientY);
const correct = zone && zone.dataset.target === activeEl.dataset.word && !zone.classList.contains('matched');
```

**多边形 / 异形 drop zone**：

- 用 SVG path：`path.isPointInFill(svgPoint)` 或 `path.isPointInStroke(svgPoint)`
- 用 Canvas path：`ctx.isPointInPath(path, x, y)`
- 自定义多边形：经典 ray casting 算法

### 拖拽元素必须浮起到 `document.body`

不浮起的话会被父级的 `overflow: hidden` 裁切、被父级的 `transform` 改变坐标系，导致拖到一半看不见 / 跟手不准。

**浮起的固定动作**：

```js
const r = el.getBoundingClientRect();   // 1. 先记下当前视口坐标
el.style.width = r.width + 'px';        // 2. 锁宽高（脱离父级后会塌缩）
el.style.height = r.height + 'px';
el.style.position = 'fixed';            // 3. 改为 fixed
el.style.left = r.left + 'px';          // 4. 用视口坐标设位置（无缝衔接）
el.style.top = r.top + 'px';
document.body.appendChild(el);          // 5. 物理上挪到 body
```

释放时要把这些 inline style 全清掉（见 `resetFloatStyles`）。

### 错误时的"弹回"动画（FLIP 套路，必须按顺序写）

直接 `appendChild` 回原位会瞬移，体验生硬。本模板用 **FLIP**（First → Last → Invert → Play）实现平滑弹回，4 步顺序**不能调换**：

1. **First**：记下当前松手处的 fixed 坐标（`firstLeft / firstTop`）
2. **Last**：`insertBefore` + `resetFloatStyles` 让元素静态归位，再 `getBoundingClientRect()` 量出归位后的目标坐标
3. **Invert**：先 `transition: none` 禁掉过渡 → 重新打回 `position: fixed` + 松手坐标。**必须先禁 transition**——`auto → length` 的过渡行为各浏览器实现不一致，不禁可能变成"从原位过渡回松手位置"的反向动画
4. **Play**：`requestAnimationFrame` 里恢复 transition → 改到目标坐标，CSS transition 自动播放弹回

**常见写错的版本**（看着像对，其实是瞬移）：

```js
// ❌ 错：insertBefore 没清 fixed 样式，getBoundingClientRect 拿到的还是 fixed 坐标
//    起点 ≈ 终点，transition 实际没动画
originalParent.insertBefore(activeEl, originalNext);
const finalRect = activeEl.getBoundingClientRect(); // 仍是 fixed 坐标
// ...
```

**关键**：必须先 `resetFloatStyles` 让元素真正回到静态布局，才能 measure 出"归位目标坐标"。

### 错误分支降级方案（不想做 FLIP 时的合法简化）

**唯一合法的简化路径**：

```js
} else {
  // 降级：不带弹回动画，直接归位 [必抄 2 行 + 必写注释]
  originalParent.insertBefore(activeEl, originalNext);
  resetFloatStyles(activeEl);
}
```

**两条都必须做到**：
1. `insertBefore(el, originalNext)` 把元素**物理上**还回 originalParent（如果你前面浮起时 appendChild 到了 body，不还就是 DOM 节点错位）
2. `resetFloatStyles(el)` 清掉所有浮起 inline style（position / left / top / width / height / zIndex）

代码里必须写注释 `// 降级：不带弹回动画`，并在最终回复的「对照报告」里把必检 #10 标为 `⚠️ 降级`。

**禁止**的简化写法（看着像归位，实际有 bug）：

```js
// ❌ 反模式 #10：钟面 badcase 实测写法
} else {
  el.style.position = 'static';   // 只清了 position，宽高和 left/top inline 还在
  el.style.transform = 'none';    // 没还 originalParent，DOM 节点仍挂在 body
  showFeedback(false);
}
```

后果：
- DOM 节点没还回 originalParent → 父级 flex/grid 布局塌缩
- width / height 的 inline style 还在 → 元素不能跟父级宽度变化
- 多次拖动后，元素全部堆积在 `document.body` 里

### 连线题怎么做

连线本质上就是配对题的视觉变种，业务逻辑一样，只是：

- 拖动时画一条 SVG `<line>` 跟随
- 命中后保留这条线（不删除浮起元素，而是新增一条线连两端）

代码骨架完全复用本模板的 pointerdown/move/up，只是 `correct` 分支里改成"画线"而不是"吸附"。

### 为什么事件委托到 `document` 而不是某个容器

和模板 A 不同（模板 A 委托到 `#drag-stage`），模板 C 拖拽时元素会被 `appendChild` 到 `document.body`——一旦脱离原父级，绑在原容器上的事件监听就再也收不到 `pointermove / pointerup`。所以只能委托到 `document`，确保整个拖拽生命周期内事件都能正常派发。

如果改回容器委托，会出现："按住能拖一小段、移到容器外就丢事件、松手时元素卡在中途"的灵异 bug。

### 多个待拖元素 / 多个目标区

事件已经委托到 `document`，加多少元素都不需要改 JS。只要保证：

- 每个待拖元素带 `data-drag` 和 `data-word="xxx"`
- 每个目标区有 `data-target="xxx"`
- `data-word === data-target` 即视为正确

### 已配对元素的"再拖动"语义（默认锁定）

模板默认**配对成功即锁定**，不能再拖出。教研课堂场景的默认预期就是"放进去 = 答对了 = 不动"。

实现机制：命中分支里 `el.removeAttribute('data-drag')` + 事件委托按 `[data-drag]` 识别 → 该元素彻底退出拖拽响应。

**如果业务要求"可反悔重做"**：必须显式实现完整状态机，包括：

```js
if (correct) {
  zone.classList.add('matched');
  zone.appendChild(activeEl);
  resetFloatStyles(activeEl);
  // 不要 removeAttribute('data-drag')，保留拖拽能力
}

// 配套：再次拖出已配对元素时，把原 zone 状态回退
document.addEventListener('pointerdown', (e) => {
  const el = e.target.closest('[data-drag]');
  if (!el) return;
  const fromZone = el.parentNode.closest('.drop-zone');
  if (fromZone && fromZone.classList.contains('matched')) {
    fromZone.classList.remove('matched');
    // 还要回退计分 / 进度等业务状态
  }
  // ...原 pointerdown 流程
});
```

**禁止**做半套（只让元素能再拖、不回退 zone 状态）：会出现"格子还是 matched 但元素已经走了 → checkAllMatched 永远以为通关"的灵异 bug。

### 全部配对完成的判定

```js
function checkAllMatched() {
  const total = document.querySelectorAll('.drop-zone').length;
  const matched = document.querySelectorAll('.drop-zone.matched').length;
  if (total === matched) {
    showSuccess();
  }
}
// 在命中分支末尾调用：if (correct) { ...; checkAllMatched(); }
```

## 自检要点

- [ ] `pointerdown` 时元素已浮起到 `document.body`，且改为 `position: fixed`
- [ ] 浮起时锁了 `width/height`，避免脱离父级后塌缩
- [ ] drop 判定方法与 zone 形状匹配：矩形 → `elementFromPoint`；圆形 → `Math.hypot(dx, dy) < r`；异形 → `isPointInPath` / ray casting
- [ ] 调用 `elementFromPoint` 前把自己 `pointer-events: none`
- [ ] 已配对的 zone 用 `.matched` class 标记，新拖入的元素跳过该 zone
- [ ] 错误弹回严格按 FLIP 四步顺序（First → Last → Invert → Play），**两处雷点都不能漏**：
  - ① **Last** 之前先 `resetFloatStyles` 静态归位再 `getBoundingClientRect()` measure（漏 = 瞬移，起点等于终点）
  - ② **Invert** 前先 `transition: 'none'`，**Play** 时在 rAF 内 `transition: ''` 恢复（漏 = Safari 上看到反向动画）
- [ ] `pointercancel` 监听器存在，走"直接复位"路径（不是 FLIP 路径），与 `pointerup` 走不同清理
- [ ] body 三件套齐：`touch-action: none` + `user-select: none` + `-webkit-touch-callout: none`
- [ ] 释放时所有 inline style（position/left/top/width/height/zIndex/pointerEvents）全清掉
- [ ] 错误分支二选一：① 完整 FLIP 9 行；② 显式降级 2 行 + 注释 `// 降级：不带弹回动画`。**禁止**只写 `el.style.position = 'static'` 一行
- [ ] 最终回复附「对照报告」表格（SKILL.md 硬约束 #3）
