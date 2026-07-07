# 模板 C：拼图 / 连线 / 配对（拖到指定区域）

## 何时用

用户需要"把一个元素拖到指定的目标区域，命中正确则保留、错误则弹回"。常见场景：

- 英文单词 ↔ 中文释义配对
- 把化学元素拖到周期表对应位置
- 把分数拖到数轴对应刻度
- 拼图（图片块拖到正确槽位）
- 把概念卡拖到对应的分类筐里

判断信号：

- 有明确的"待拖元素"和"目标区"两类对象
- 命中需要业务判定（不只是改顺序）
- 错误时元素需要弹回原位

**不适用**：列表排序（模板 B）、自由拖动（模板 A）、无判定的自由摆放（模板 A）。

## 完整可复制模板

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
    } else {
      // 复位用 FLIP 套路（First → Last → Invert → Play）：
      // 1) First: 记下当前松手处的 fixed 坐标
      const firstLeft = parseFloat(activeEl.style.left);
      const firstTop  = parseFloat(activeEl.style.top);
      // 2) Last: 暂时清掉 fixed 让元素静态归位，量出归位后的目标坐标
      //    （同步代码内浏览器不会 paint，所以不会闪屏）
      originalParent.insertBefore(activeEl, originalNext);
      resetFloatStyles(activeEl);
      const lastRect = activeEl.getBoundingClientRect();
      // 3) Invert: 重新浮起到松手位置（视觉上元素还在用户手放开的地方）
      //    关键：先显式禁掉 transition——auto → length 的过渡行为各浏览器实现不一致，
      //    显式禁掉能保证 Invert 是瞬时跳变，不会变成"从原位过渡到松手位置"的反向动画。
      activeEl.style.transition = 'none';
      activeEl.style.width = lastRect.width + 'px';
      activeEl.style.height = lastRect.height + 'px';
      activeEl.style.position = 'fixed';
      activeEl.style.zIndex = '9999';
      activeEl.style.left = firstLeft + 'px';
      activeEl.style.top  = firstTop + 'px';
      // 4) Play: 下一帧恢复 transition，再改到目标坐标，CSS transition 自动播放弹回
      requestAnimationFrame(() => {
        activeEl.style.transition = '';
        activeEl.style.left = lastRect.left + 'px';
        activeEl.style.top  = lastRect.top + 'px';
        setTimeout(() => resetFloatStyles(activeEl), 260);
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

### drop 命中判定必须用 `elementFromPoint`

**禁止**手算 hitbox：

```js
// ❌ 错误：drop-zone 嵌套、父级 transform、页面缩放时全错
if (x > zone.x && x < zone.x + zone.w && y > zone.y && y < zone.y + zone.h) { ... }
```

**正确**：

```js
// ✅ 浏览器内部用真实渲染坐标判定，永远准
const hit = document.elementFromPoint(x, y);
const zone = hit && hit.closest('.drop-zone');
```

调用 `elementFromPoint` **必须**先把拖拽元素 `pointer-events: none`，否则永远捞到自己。

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

如果完全不需要弹回动画，直接：

```js
originalParent.insertBefore(activeEl, originalNext);
resetFloatStyles(activeEl);
```

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

### 已配对元素的"再拖动"语义（默认允许）

本模板**没有**锁定已配对元素。用户配对成功后仍可以再次按住它拖出：

- 拖到**别的空格子**：如果目标格的 `data-target` 也匹配（即同一个词可正确配对多个格子的特殊业务），命中分支生效；否则进入弹回分支
- 拖到**已配对的格子**：命中条件里有 `!zone.classList.contains('matched')`，所以不会重复命中，进入弹回分支
- 弹回时 `originalParent` 是上一次命中的格子（不是最初的词库位置），所以元素会回到那个格子里

这是合理默认行为（教学场景里允许学生反悔重做）。如果业务要求**配对后锁定，不可再拖**：

```js
if (correct) {
  zone.classList.add('matched');
  zone.appendChild(activeEl);
  activeEl.removeAttribute('data-drag');  // 移除拖拽标记，事件委托不再识别
  resetFloatStyles(activeEl);
}
```

事件委托是按 `[data-drag]` 识别的，移掉属性后该元素彻底退出拖拽响应。

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
- [ ] drop 判定用 `elementFromPoint`，**不是**手算 hitbox
- [ ] 调用 `elementFromPoint` 前把自己 `pointer-events: none`
- [ ] 已配对的 zone 用 `.matched` class 标记，新拖入的元素跳过该 zone
- [ ] 错误弹回严格按 FLIP 四步顺序（First → Last → Invert → Play），**两处雷点都不能漏**：
  - ① **Last** 之前先 `resetFloatStyles` 静态归位再 `getBoundingClientRect()` measure（漏 = 瞬移，起点等于终点）
  - ② **Invert** 前先 `transition: 'none'`，**Play** 时在 rAF 内 `transition: ''` 恢复（漏 = Safari 上看到反向动画）
- [ ] `pointercancel` 监听器存在，走"直接复位"路径（不是 FLIP 路径），与 `pointerup` 走不同清理
- [ ] body 三件套齐：`touch-action: none` + `user-select: none` + `-webkit-touch-callout: none`
- [ ] 释放时所有 inline style（position/left/top/width/height/zIndex/pointerEvents）全清掉
