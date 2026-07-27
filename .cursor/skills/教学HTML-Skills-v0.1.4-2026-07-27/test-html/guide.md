# 本地 HTML 验收指南

> 路径：`test-html/guide.md`  
> 与 `SKILL.md` 配合；`html-authoring` / `courseware-generator` 的 Step 3 共用本 skill。

## 推荐流程（静态优先，纯 Agent）

```
Read 产物 → Grep 模式 → static-checks.md A→H 逐项勾选 → 结论卡
                                              ↓
                              Playwright/浏览器可用时再补动态
```

**不依赖 Python、Node 或任何验收脚本。**

## must-cover

| 来源 | 静态（Read/Grep） | 动态 |
|---|---|---|
| delivery | 文件、doctype、charset、单文件依赖 | — |
| core-loop | 关键函数/事件是否存在 | 端到端操作与反馈 |
| require | id/class/assets 声明 | 是否真发挥作用 |
| forbid | 路径、占位、双壳 | 滚动、弹窗等行为 |
| assets | spec 记录、url 非占位 | HTTP 加载 |

多页课件额外见 `static-checks.md` 第 F 节。

## 静态验收

1. Read 工具确认的最终 HTML。
2. 按 `references/static-checks.md` 的「常用 Grep 模式」搜索。
3. 逐项完成 A→H，记录通过/失败/跳过及行号证据。
4. 任一硬门槛失败 → 静态未通过。

## 人工浏览器验收

静态通过后再打开浏览器；确认无阻断性脚本错误、主内容可见；按 must-cover 逐项操作。

## 本地 Playwright 验收

**仅本地或已部署 Playwright 的环境**；服务端未部署时不要依赖。见 `references/test-templates.md`。

## 失败处理

静态失败修 HTML，不动验收合同。动态失败时只有断言/选择器错误、或诊断确认页面正确时才改测试脚本。
