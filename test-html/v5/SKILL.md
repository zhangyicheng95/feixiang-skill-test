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

### 5. 图片和资源加载（有外部资源时测试）

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
4. **如仍未通过**：换一种修复思路，不要重复同样的修复方式。例如：
   - 换一种 CSS 布局方案（flex → grid，固定宽度 → 百分比）
   - 换一种 JavaScript 实现方式
   - 调整测试中的选择器以匹配实际 DOM 结构
   - 检查是否遗漏了必要的依赖（CDN 库、字体等）
5. **持续尝试**：直到测试通过或已尝试 3 种以上不同的修复策略

**优先级**：优先考虑修复 HTML，仅当确认测试代码本身有明显错误时才修改测试。

**禁止以下行为**：
- 为了让测试通过而无理由地放宽断言条件
- 连续失败后直接放弃，不尝试其他修复策略
- 删除或跳过失败的测试用例
