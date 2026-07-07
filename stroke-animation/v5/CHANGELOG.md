# stroke-animation · CHANGELOG

> 飞象老师 · 汉字田字格跟练 + 笔顺动画 skill。
> 本日志按"最新 → 最旧"组织，仅记录会影响课件生成、教学体验或公开 API 的变更。

---

## v1.7 · 圈点系统 MVP（2026-05-06）

> 在 v1.6 整字"作品感"基础上，新增"老师批改习字本"式反馈：3 星笔画红圈表扬 + 重写笔画"改正成功"鼓励。

### 新增

- **圈点系统**：整字通过的作品态出现后，对最终通过且 3 星的笔画在学生笔迹外画**红色手绘风**椭圆环表扬（独立 SVG `<g class="st-circles">` 层，不影响 fxCanvas 烟花）。
  - 36 段折线 + 抖动 + `stroke-linejoin: round` + `stroke-dasharray: 9 5 16 6` + 轻微旋转 = 接近老师手写圆圈的视觉。
  - 每个圈错落淡入（CSS animation-delay 每笔 +0.18s）。
- **重写鼓励文案**：在作品态点评区追加 ✅ 胶囊式贴纸，对每个"曾经失败 ≥1 次后通过"的笔（`_strokeRetries[i] > 0`）给出 3 种轮换鼓励文案（"重写后变准了" / "改正了，越写越好" / "改好了，棒"）；≥4 笔重写时聚合为"还有 N 笔也成功改正了"。
- **新公共配置**（在 `mount({ artwork })` 内）：
  - `praiseCircles: true` 是否画红圈
  - `maxPraiseCircles: 3` 红圈数量上限（按 `final` 分降序选）
  - `retryPraise: true` 是否显示重写鼓励文案
- **15 个新单测**（`tests/test_circles.js`）：覆盖 `_strokeBoundingCircle` 几何、`_pickPraiseStrokes` 筛选/排序/上限、`_buildRetryPraises` 文案/聚合/开关。

### 视觉反馈语义边界（清晰区分三种红色元素）

| 反馈 | 视觉 | 时机 | 含义 |
|---|---|---|---|
| 红笔标注 | 半透明红色覆盖在错笔上 | 当前笔写错的瞬间，停留 `failHoldMs` 后清除 | 当前错笔提示 |
| **红圈（v1.7）** | 红色手绘椭圆环 | 整字完成作品态 | 最终优秀表扬 |
| **重写鼓励（v1.7）** | 白底 ✅ 胶囊文字 | 作品态点评区 | "改正成功" |

**红笔错误标注绝不残留到作品态**（保留期到点后已 `tracer.clearCurrent()` 清干净）。

### 状态隔离

以下操作均会清空圈点系统所有状态（红圈 SVG 节点 + 重写计数 + 鼓励文案）：

- `handle.reset()`
- `handle.setChar(...)`
- 点击作品态的「再写一次 ↻」按钮
- `handle.destroy()`

### 改动

- `src/stroke-trace.js`：
  - 构造器新增 `this._strokeRetries = []`
  - `_onStrokeEnd` 失败分支累加 `_strokeRetries[curStroke]++`
  - `_loadAndStart` / `reset` 清空 `_strokeRetries`
  - `_enterArtworkMode` 拼接重写鼓励文案 + 调用 `_drawPraiseCircles()`
  - `_exitArtworkMode` / `destroy` 调用 `_clearPraiseCircles()`
  - 新增方法：`_strokeBoundingCircle` / `_pickPraiseStrokes` / `_wigglyEllipsePath` / `_drawPraiseCircles` / `_clearPraiseCircles` / `_buildRetryPraises`
  - 新增 CSS：`.st-circles` 手绘动画 + `.st-retry-praise` 贴纸样式
  - 新增 `__test__` 出口（仅供单测访问 TraceInstance 原型，注明私有不稳定）
  - bootstrap `loadAll()` 加 `.catch` 防止未处理 promise rejection
- `tests/test_circles.js`：15 个新单测
- `SKILL.md`：补 v1.7 配置说明 + 三种视觉反馈语义边界表
- `教研测试指南.md`：新增 §5.2.1 圈点系统观察点
- `templates/animate-demo.html`：升级版本号 + cache buster

### 兼容性

- ✅ `animate()` 完全不受影响
- ✅ v1.6 错笔强制重写逻辑不变
- ✅ 烟花 / 星级 / 连击 / 进度条等正反馈保持
- ✅ `artwork.enabled: false` 时整套圈点系统降级隐藏，不报错
- ✅ stroke-order 数据未触碰
- ✅ 旧测试 93 个 + 新测试 15 个 = **108 个单测全部通过**

### 体积

- Loader: `117 KB → 127 KB`（+10 KB raw）/ `33 KB → 36 KB`（+3 KB gzip）
- Skill zip: `6.1 MB → 6.1 MB`（≈0）

---

## v1.6.1 · 32 笔画提示语硬笔化（2026-05-06）

将 32 条笔画提示语从毛笔书法术语全部替换为小学语文硬笔写字版本。

- 旧："侧锋顿入，瞬时收笔" / "起笔轻顿，平稳行笔，收笔回锋"
- 新："轻轻点下，方向要准，不要写成长线" / "从左往右写，基本写平，可微微上斜"

文档对齐："金色虚拟毛笔" → "金色虚拟笔尖"；"真实毛笔节奏" → "硬笔书写节奏"。

---

## v1.6 · 错笔强制重写 + 整字"作品感"（2026-04-29）

### 错笔不保留 · 必须写对再前进

- 新增 `scoring.passStars`（默认 2，可设 1/2/3）：当前笔达到此星数才算"写对"。
- 新增 `scoring.failHoldMs`（默认 1000）：错笔停留显示红笔的时长。
- 行为：未达通过门槛时 → 红笔标注 + 短暂停留 → 自动清除该笔笔迹 → 强制重写当前笔。
- 未通过时**不**更新进度、**不**计入 combo、**不**启用「下一笔」、手动点「下一笔」会被温和拒绝。
- 前面已通过的笔不受影响。

### 整字完成"作品感"

- 新增 `artwork.enabled`（默认 true）+ `artwork.message`。
- 整字通过后：标准衬底以 0.8s CSS 渐变淡出（仅留田字格 + 学生笔迹）；提示语高亮"🎉 这是你写出来的字！"；「下一笔」按钮变身「再写一次 ↻」。
- 视觉与 v1.3 烟花/星级/连击共存。

---

## v1.5 · 双模式（笔顺动画 + 跟练游戏）（2026-04-23）

新增 `StrokeTrace.animate()` 仅观看模式（自动连播 + ✍️ 握笔 + 调速控件），与 `mount()` 完全独立。

---

## v1.4.1 · 按需教学 + 握笔手势（2026-04-22）

- `watchMode.autoPlay` 默认改为 `false`（按需点 📹 看示范）。
- 写示范时显示右手握笔 ✍️ emoji 跟随金色笔尖。

---

## v1.4 · 直观引导（2026-04-21）

Watch Mode 写前示范（金色虚拟笔尖 + "起笔慢-行笔快-收笔稳"自然曲线）+ 32 种笔画提示语 + 📹 按需示范按钮 + 失败自动加强（`watchMode.retryAfterFails`）。

---

## v1.3 · 正反馈四件套（2026-04-20）

进度条 + 完美笔金色闪光 + 连击徽章（🔥 连击 N）+ 完成烟花，默认全开，细粒度开关。

---

## v1.2 · LLM 输入校验（2026-04-19）

新增 `validate()` / `validateAll()` API，结构化返回 `ok / reason / tier / suggestion`。SKILL.md 新增 Prompt 路由表。

---

## v1.1 · 顺滑书写 + 对齐 stroke-order v57（2026-04-17）

`autoAdvance` 写完一笔自动跳 700ms · `stroke-anim-ready` 全局只派发一次 · 对齐 stroke-order v57（data v56-2026-04-15）。

---

## v1.0 · 生产级 loader（2026-04-16）

2,842 字全覆盖 · 单文件 53KB · 完整 mount API · 32 算法层单测全过。
