---
name: test-html
description: 指导如何用 test_html 工具对 HTML 文件进行 Playwright 单测，含测试模板（基础渲染、响应式布局、LaTeX 公式、交互功能、资源加载）、playwrightCode 格式规范和失败处理流程。当通过 create_file/edit_file 生成或修改了 HTML 文件需要验证、用户反馈页面功能或布局异常需要诊断、或准备调用 test_html 工具时，先加载本 skill。
---

更新时间：2026-04-28

# test_html 使用指南

## 何时触发

以下场景**应当**使用 `test_html` 工具：

1. **生成/编辑后验证**：通过 `create_file` 或 `edit_file` 工具生成/修改了 HTML 文件后（如有多次编辑，全部完成后再测试），验证页面功能和布局
2. **用户反馈诊断**：用户反馈 HTML 存在功能异常或布局问题时，先编写针对性测试复现问题，再修复

> 准备调用 `test_html` 之前，若本 skill 还未加载，请先加载（同一会话只需加载一次）。

### 用户反馈诊断适用范围

适合用测试诊断的反馈类型：
- 功能异常："按钮点不了"、"表单提交没反应"、"下拉菜单不工作"
- 布局问题："手机上显示乱了"、"文字被截断"、"有水平滚动条"
- 渲染异常："公式没显示"、"图片加载不出来"、"元素重叠了"

不适合用测试诊断的反馈（直接读代码分析）：
- 视觉审美："颜色不好看"、"风格不搭"
- 性能感受："加载太慢"、"动画卡顿"

处理流程：用户反馈 → 编写复现测试 → 确认问题 → 修复 HTML → 回归测试

## 前置条件

- 必须已拿到明确的 `resourceId`（来自 `create_file` 或 `edit_file` 的返回值，或用户提供）
- 不能在同一轮同时调用生成文件的工具和 `test_html`，必须等拿到 resourceId 后再调用
- **单次测试在云函数侧最长执行 60 秒，超时会失败**：
  - 等待统一用 `page.wait_for_timeout(毫秒)`，不要写 `time.sleep` 或不必要的轮询
  - 不要在循环里堆砌长等待（如 3 视口 × `wait_for_timeout(2000)` 就 6s，再叠加渲染等待很容易超）
  - 多个独立检查可在一次调用中组合，但单条等待建议 ≤ 2000 毫秒，**总等待时间控制在 20 秒以内**（云函数还要做浏览器启动+页面加载，留出余量）
  - 复杂场景请拆成多次 `test_html` 调用，每次只测一个维度（基础渲染 / 响应式 / 交互 / LaTeX 等）

## 关键：先列 must-cover 清单，再写测试

**测试不是机械套模板，必须针对当前任务的真实需求**。在写 `playwrightCode` 之前，先在心里
（或注释里）列出 must-cover 清单：

1. **拆解用户原始需求**：把用户消息里**明确提到的功能点 / 数值 / 交互 / 状态变化**都摘出来，逐个变成断言
   - 用户说"摆出正确数字时屏幕出现 √"→ 必须测 `expect(page.locator(".check-mark")).to_be_visible()`，
     不能只测按钮 enabled
   - 用户说"春分秋分太阳直射点应在赤道"→ 必须断言 `lat ≈ 0`，不能只测页面渲染
   - 用户说"5 种四连方"→ 必须 `expect(items).to_have_count(5)`
2. **覆盖通用质量项**：基础渲染 + 响应式（如有 CSS 布局）+ 资源加载（如有外部图片/CDN）
3. **聚焦核心，不堆砌**：与本次需求无关的项不要写。基础渲染只验关键容器是否存在，不要每个 div 都断言
4. **若改动 = 修 bug**：测试要能**复现 bug**——先用更宽松的断言/console.log 看到现象，再收紧到精确值

写完测试后回头检查：清单里的每一项是否都有对应断言？如果用户提了 N 个功能点而测试只覆盖 ≤ N/2，
说明测试浅了，需要补充。

错误示例（chatInput=261 真实 case）：
- 用户需求：火柴拖拽 / 摆出数字识别 / √ 提示 / 表扬语言 / 错误想一想
- 模型只测了：4 个 locator 可见 + 4 个按钮 enabled + 反馈层显隐
- 结果：测试 `pass=true` 但**核心交互完全没验**，等于交付了未经验证的页面

正确示例（同样 chatInput=261 应该这样写）：
```python
# must-cover from user request:
# [1] 横向/竖向火柴可拖拽   [2] 摆出正确数字 → √ 出现   [3] 表扬语言出现
# [4] 摆错 → "想一想" 提示  [5] 返回上一步功能         [6] 重新开始清屏

# [1] 拖一根横向火柴到操作区
src = page.locator(".match-h").first
src_box = src.bounding_box()
target = page.locator("#drop-zone")
target_box = target.bounding_box()
page.mouse.move(src_box['x']+src_box['width']/2, src_box['y']+src_box['height']/2)
page.mouse.down()
page.mouse.move(target_box['x']+200, target_box['y']+150)
page.mouse.up()
expect(page.locator("#drop-zone .placed-match")).to_have_count_greater_than(0)

# [2][3] 通过 evaluate 直接调底层 API 验证识别逻辑
result = page.evaluate("typeof checkAnswer === 'function' ? checkAnswer('1') : null")
assert result is not None, "缺少 checkAnswer 实现"

# [5][6] 按钮点击有副作用
initial = page.evaluate("document.querySelectorAll('#drop-zone .placed-match').length")
page.click("button:has-text('返回上一步')")
after = page.evaluate("document.querySelectorAll('#drop-zone .placed-match').length")
assert after < initial, "返回上一步未生效"
```

## 关键：测试代码格式

测试代码（`playwrightCode` 参数）通过 `exec()` 直接执行，**不使用 pytest**。必须遵守：

- **写成顶层语句**，直接使用 `page`、`expect` 等变量
- **不要只定义函数**，`def test_xxx(page):` 不会被自动发现和运行
- 如果要用函数组织代码，定义后必须手动调用

错误写法：
```python
def test_something(page):
    expect(page.locator("h1")).to_be_visible()
# 函数定义了但没调用，什么都不会执行
```

正确写法：
```python
# 直接写顶层语句
expect(page.locator("h1")).to_be_visible()

# 或者定义函数后调用
def check_layout():
    expect(page.locator(".container")).to_be_visible()

check_layout()  # 必须调用
```

## 可用变量

测试代码中可直接使用以下变量（无需 import）：

| 变量 | 类型 | 说明 |
|------|------|------|
| `page` | `Page` | 已加载 HTML 的页面对象 |
| `context` | `BrowserContext` | 浏览器上下文 |
| `browser` | `Browser` | 浏览器实例 |
| `expect` | `function` | Playwright 断言 API |

等待请用 `page.wait_for_timeout(毫秒)` 而不是 `time.sleep()`。

## 测试模板

根据 HTML 内容特征，选择合适的测试组合：

### 1. 基础渲染验证（每次必测）

```python
# 关键元素存在且可见
expect(page.locator("h1")).to_be_visible()
expect(page.locator(".main-content")).to_be_visible()
```

### 2. 响应式布局检测（有 CSS 布局时必测）

```python
VIEWPORTS = [
    {"width": 375, "height": 667, "name": "iPhone SE"},
    {"width": 768, "height": 1024, "name": "iPad"},
    {"width": 1280, "height": 720, "name": "Laptop"},
]

failures = []

for vp in VIEWPORTS:
    label = f"[{vp['name']} {vp['width']}x{vp['height']}]"
    page.set_viewport_size({"width": vp["width"], "height": vp["height"]})
    page.wait_for_timeout(300)

    scroll_w = page.evaluate("document.documentElement.scrollWidth")
    client_w = page.evaluate("document.documentElement.clientWidth")
    if scroll_w > client_w:
        failures.append(f"{label} 水平滚动条: scrollWidth={scroll_w}px > clientWidth={client_w}px")

    overflow_els = page.evaluate("""() => {
        const results = [];
        document.querySelectorAll('body *').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.right > window.innerWidth) {
                results.push({
                    tag: el.tagName.toLowerCase(),
                    cls: el.className || '',
                    right: Math.round(rect.right),
                    vw: window.innerWidth
                });
            }
        });
        return results;
    }""")
    for el in overflow_els:
        failures.append(f"{label} 元素溢出: <{el['tag']}> class=\"{el['cls']}\" right={el['right']}px > viewport={el['vw']}px")

assert len(failures) == 0, f"发现 {len(failures)} 个布局问题:\n\n" + "\n".join(failures)
```

### 3. LaTeX / 数学公式渲染（有公式时必测）

```python
# 等待渲染引擎完成
page.wait_for_timeout(3000)

mathjax_rendered = page.evaluate("""() => {
    if (window.MathJax && MathJax.startup) {
        const jax = document.querySelectorAll('mjx-container');
        return { engine: 'MathJax3', count: jax.length, ok: jax.length > 0 };
    }
    if (window.MathJax && MathJax.Hub) {
        const jax = document.querySelectorAll('.MathJax');
        return { engine: 'MathJax2', count: jax.length, ok: jax.length > 0 };
    }
    const katex = document.querySelectorAll('.katex');
    if (katex.length > 0) {
        return { engine: 'KaTeX', count: katex.length, ok: true };
    }
    return { engine: 'none', count: 0, ok: false };
}""")

assert mathjax_rendered['ok'], f"数学公式未渲染: engine={mathjax_rendered['engine']}, count={mathjax_rendered['count']}"

# 检查渲染错误
errors = page.evaluate("""() => {
    const katexErrors = document.querySelectorAll('.katex-error');
    const mjxErrors = document.querySelectorAll('mjx-merror, .MathJax_Error');
    return {
        total: katexErrors.length + mjxErrors.length,
        details: [...katexErrors, ...mjxErrors].map(el => el.textContent.substring(0, 100))
    };
}""")

assert errors['total'] == 0, f"发现 {errors['total']} 个公式渲染错误: {errors['details']}"

# 公式元素尺寸非零
zero_size = page.evaluate("""() => {
    const formulas = document.querySelectorAll('mjx-container, .katex, .MathJax');
    const issues = [];
    formulas.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
            issues.push('公式#' + i + ': ' + rect.width + 'x' + rect.height);
        }
    });
    return issues;
}""")

assert len(zero_size) == 0, f"有公式尺寸为零（未渲染）: {zero_size}"
```

### 4. 交互功能测试（有按钮/表单/动态交互时测试）

```python
# 按钮可点击
expect(page.locator("#submit-btn")).to_be_visible()
expect(page.locator("#submit-btn")).to_be_enabled()

# 表单输入
page.fill("#input-field", "测试内容")
expect(page.locator("#input-field")).to_have_value("测试内容")

# 点击后状态变化
page.click("#submit-btn")
expect(page.locator("#result")).to_be_visible()

# 鼠标交互（拖拽、hover 等）
page.mouse.move(100, 100)
page.mouse.down()
page.mouse.move(200, 200)
page.mouse.up()
```

### 5. 复杂交互范本（拖拽 / 键盘 / 动画）

很多需求里都有"拖拽"、"键盘操作"、"动画播放"——**直接 click 替代是测不到真实交互的**，
按下面范本写。

#### 5.1 真实拖拽（mouse.down/move/up）

```python
# 把 .draggable 拖到 #drop-zone
src = page.locator(".draggable").first
dst = page.locator("#drop-zone")
src_box = src.bounding_box()
dst_box = dst.bounding_box()
assert src_box and dst_box, "源或目标元素不可见，无法获取坐标"

# 模拟人手：按下→分多步移动→释放
page.mouse.move(src_box['x'] + src_box['width']/2, src_box['y'] + src_box['height']/2)
page.mouse.down()
# 中间至少加 2 步，避免被识别为瞬移
page.mouse.move(src_box['x'] + 100, src_box['y'] + 100, steps=10)
page.mouse.move(dst_box['x'] + dst_box['width']/2, dst_box['y'] + dst_box['height']/2, steps=10)
page.mouse.up()

# 验证拖拽产生了实际效果（DOM 多了一个、或元素挪到 zone 内部）
expect(page.locator("#drop-zone .item")).to_have_count(1)
```

> Playwright 自带的 `source.drag_to(target)` 对原生 HTML5 拖拽（dragstart/dragover/drop）才生效，
> 对自定义 `pointerdown/pointermove/pointerup` 实现的拖拽**无效**——必须用 `mouse.*` API。

#### 5.2 键盘操作

```python
# 输入框打字
page.fill("#answer-input", "")              # 先清空
page.locator("#answer-input").press_sequentially("123", delay=50)
expect(page.locator("#answer-input")).to_have_value("123")

# 组合键 / 方向键 / 回车
page.keyboard.press("Enter")
page.keyboard.press("Control+Z")
page.keyboard.press("ArrowRight")
```

#### 5.3 动画 / 异步状态变化

```python
# 触发动画
page.click("#play-btn")

# 等"动画完成"信号比硬等 wait_for_timeout 更稳：
# (a) 等某个 class 出现（如 .animation-done）
expect(page.locator(".result")).to_have_class("result animation-done", timeout=5000)
# (b) 或等内部 state 变化
page.wait_for_function("window.__animationDone === true", timeout=5000)
# (c) 实在没信号时，再用 wait_for_timeout 兜底，但不要超过 2000ms
page.wait_for_timeout(1500)
```

#### 5.4 通过 evaluate 直接调底层 API（最稳）

UI 模拟有时不可靠，可以**直接调暴露在 window 上的核心函数**：

```python
# 校验业务逻辑而不是 UI 表现
result = page.evaluate("typeof checkAnswer === 'function' ? checkAnswer('123') : null")
assert result == True, f"checkAnswer 业务逻辑错误: {result}"

# 读内部 state 验证状态
state = page.evaluate("typeof state !== 'undefined' ? JSON.parse(JSON.stringify(state)) : null")
assert state and state.get("step") == 2, f"state 异常: {state}"
```

#### 5.5 诊断打印（先看再断言）

第一次测试，或测试反复失败时，先**打印实际值**再写精确断言，避免拍脑袋：

```python
# 打印模式：把可疑值打印出来
texts = page.locator(".item").all_inner_texts()
print("DEBUG items =", texts)
positions = page.evaluate("[...document.querySelectorAll('.tile')].map(e => e.getBoundingClientRect())")
print("DEBUG tile positions =", positions[:3])

# 看到实际值后，下一次再写精确断言
```

### 6. 图片和资源加载（有外部资源时测试）

```python
broken_images = page.evaluate("""() => {
    const images = document.querySelectorAll('img');
    const broken = [];
    images.forEach(img => {
        if (!img.complete || img.naturalWidth === 0) {
            broken.push(img.src.substring(0, 100));
        }
    });
    return broken;
}""")

assert len(broken_images) == 0, f"有 {len(broken_images)} 张图片加载失败: {broken_images}"
```

## 测试组合决策

| HTML 特征 | 必选测试 |
|-----------|---------|
| 任何 HTML | 基础渲染验证 |
| 有 CSS 布局、flex、grid | + 响应式布局检测 |
| 有 `MathJax`、`KaTeX`、`\(`、`$$` | + LaTeX 公式渲染 |
| 有 button、input、form、onclick | + 交互功能测试 |
| 用户需求里出现"拖拽 / drag" | + 复杂交互-真实拖拽（5.1） |
| 用户需求里出现"键盘 / 输入 / 答案" | + 复杂交互-键盘（5.2） |
| 用户需求里出现"动画 / 播放 / 切换" | + 复杂交互-动画（5.3） |
| 业务逻辑暴露在 window（如 `state`、`checkAnswer`） | + 通过 evaluate 调底层 API（5.4） |
| 有 img、video、audio | + 资源加载检查 |

根据页面内容组合多个测试片段到一次 `test_html` 调用中，减少调用次数。

## 测试结果处理

### 通过
继续后续流程。

### 未通过（重要）

**核心原则：先分析错误根因，再决定修改 HTML 还是测试代码。**

处理流程：
1. **分析错误信息**：仔细阅读 `message`、`console` 和 `error` 字段，判断问题出在哪一方
2. **判断根因**：
   - **执行超时**（错误信息含 `timeout`、`Read timed out`、`调用 Playwright 测试云函数失败` 等）：
     测试代码总耗时超过云函数 60s 上限。**优先削减测试**：把单次测试拆成多个更小的 `test_html` 调用、减少
     `wait_for_timeout` 时长、缩小视口/断言循环规模，而不是改 HTML
   - **HTML 问题**（大多数情况）：元素缺失、样式错误、JS 逻辑 bug、CDN 资源未加载等 → 修复 HTML
   - **测试代码问题**：选择器与实际 DOM 结构不匹配、断言条件不合理、等待时间不足等 → 修正测试代码
3. **执行修复**：使用 `edit_file` 修改对应文件，拿到新 resourceId 后重新测试

### 严禁：用同一段测试代码反复测试不同 HTML 版本

**真实反例**：某次评测中模型连续 8 轮以**字节级完全相同的 825 字符测试代码**测试 8 个不同 resourceId 的
HTML，每次都失败，直到第 9 轮才通过。这是典型的"修复策略陷入局部最优"，浪费 8 次工具调用。

**强制规则**：

- 如果**第 2 次测试用了和第 1 次相同的代码**（仅改 HTML 没改测试），且**结果仍是失败**，
  立刻停止"改 HTML+重测"循环，**先用诊断式测试看实际值是什么**：

```python
# 诊断模式：用 console.log 或 evaluate 把可疑变量的实际值打印出来
print("DEBUG: 当前直射点纬度 =", page.locator("#sun-latitude").text_content())
print("DEBUG: 内部 state =", page.evaluate("JSON.stringify(state || null)"))
print("DEBUG: 是否有相关元素 =", page.locator("#btn-spring").count())

# 然后只断言能拿到的最弱属性，让测试先过
assert page.locator("#sun-latitude").count() > 0
```

  跑一次拿到实际值后，再回头精确断言。

- **每轮测试代码必须发生有意义的变化**：要么换断言、要么换选择器、要么拆分粒度、要么加诊断打印。
  如果一定要复用代码，至少把上次失败的具体值写进断言里（例如把 `assert lat ≈ 0` 改成
  `assert lat == 0, f"实际 {lat}"`，让下一次失败时能看到当前值）。

- **同一思路连续失败 ≥ 3 次**：必须切换到其它修复策略：
  - 换一种 CSS 布局方案（flex → grid，固定宽度 → 百分比）
  - 换一种 JavaScript 实现方式（事件监听 → 直接修改 DOM）
  - 调整测试中的选择器以匹配实际 DOM 结构
  - 检查是否遗漏了必要的依赖（CDN 库、字体等）
  - 暂停：把诊断结果汇总后，向用户说明当前进展并询问期望

- **持续尝试**：直到测试通过或已尝试 3 种以上不同的修复策略

**优先级**：优先考虑修复 HTML，仅当确认测试代码本身有明显错误时才修改测试。

**禁止以下行为**：
- 为了让测试通过而无理由地放宽断言条件
- 连续失败后直接放弃，不尝试其他修复策略
- 删除或跳过失败的测试用例
