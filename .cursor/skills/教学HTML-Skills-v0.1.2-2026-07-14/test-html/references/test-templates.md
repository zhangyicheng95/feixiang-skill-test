# 本地 Playwright 模板

这些模板使用 `artifact_url`，其值来自当前工具实际可访问的最终 HTML；不把目录、文件名或端口写死。

## 基础渲染

```python
page.goto(artifact_url, wait_until="domcontentloaded")
expect(page.locator("body")).to_be_visible()
```

## 响应式与横向溢出

```python
for width, height in [(375, 667), (768, 1024), (1280, 720)]:
    page.set_viewport_size({"width": width, "height": height})
    page.wait_for_timeout(300)
    scroll_width = page.evaluate("document.documentElement.scrollWidth")
    client_width = page.evaluate("document.documentElement.clientWidth")
    assert scroll_width <= client_width, f"horizontal overflow: {scroll_width}>{client_width}"
```

## 多页课件逐页无滚动

```python
frames = page.locator(".cw-main-iframe")
expect(frames).to_be_visible()
frame = frames.element_handle().content_frame()
assert frame is not None, "main iframe not ready"
scroll_width = frame.evaluate("document.documentElement.scrollWidth")
client_width = frame.evaluate("document.documentElement.clientWidth")
scroll_height = frame.evaluate("document.documentElement.scrollHeight")
client_height = frame.evaluate("document.documentElement.clientHeight")
assert scroll_width <= client_width, f"page horizontal overflow: {scroll_width}>{client_width}"
assert scroll_height <= client_height, f"page vertical scroll: {scroll_height}>{client_height}"
```

## 按钮反馈

```python
buttons = page.locator("button")
assert buttons.count() > 0, "no buttons found"
before = page.locator("body").inner_text()
buttons.first.click()
page.wait_for_timeout(300)
after = page.locator("body").inner_text()
assert after != before, "first button produced no visible feedback"
```

## 多页壳加载

```python
expect(page.locator(".cw-root")).to_be_visible()
expect(page.locator(".cw-main-iframe")).to_be_visible()
assert page.locator(".cw-thumbs iframe").count() > 0, "no thumbnails rendered"
```

## cwScore 消息

```python
page.evaluate("""
() => {
  window.__cwScores = [];
  window.addEventListener('message', e => {
    if (e.data && e.data.type === 'cwScore') window.__cwScores.push(e.data);
  });
}
""")
# 执行页面里的答题和判分动作后检查：
scores = page.evaluate("window.__cwScores || []")
assert len(scores) > 0, "no cwScore message captured"
```

## SCORM 按钮

```python
errors = []
page.on("pageerror", lambda e: errors.append(str(e)))
btn = page.locator("button:has-text('SCORM')")
if btn.count() > 0:
    btn.first.click()
    page.wait_for_timeout(500)
    assert not errors, f"SCORM button caused page error: {errors[:1]}"
```
