# 打印产物验证层（v48 Layer 4）

## 目标

网页端好看不等于打印好看。v47 实测中存在“HTML 没问题，但浏览器打印 PDF 多文本缺失、图片缺失、首页空白、出现孤立方框”等问题。Paged.js 异步分页、MathJax 异步排版、`<img>` 异步加载都可能在打印时失效。

v48 增加 Layer 4：**打开 HTML → 等异步流程 → 导出 PDF → 校验打印 PDF**。Layer 4 不通过，等同于 Layer 3 不通过，不发布。

## 工具

- `tools/print-preview-guard`：基于 Puppeteer + pdf-parse + pdfjs-dist 的 Node.js CLI。
- 需要 Chromium，Puppeteer 默认会自带。
- 不依赖额外服务。

## 调用方式

```bash
cd magazine-layout/tools/print-preview-guard
npm install
node preview.js \
  --input ../../result.html \
  --out ./report \
  --expected-images 6 \
  --expected-questions 30 \
  --max-blank-page-ratio 0.15 \
  --max-isolated-checkboxes 5 \
  --json
```

## 验证流程

```plain
1. 启动 Chromium，加载 HTML 文件（file:// 或 http://）
2. 等待：
   - DOMContentLoaded
   - MathJax.typesetPromise 完成（如果存在）
   - PagedConfig.before 已被 Paged.js 调用
   - .pagedjs_pages 节点已渲染
   - 所有 <img> 已 load 或 error（不允许 onerror 隐藏）
3. 收集 console 错误与 failedResources
4. page.pdf({format: 'A4', printBackground: true}) 导出 PDF
5. 用 pdfjs-dist 解析 PDF：
   - 页数
   - 每页文本量
   - 每页图片数量（OPS.paintImageXObject 计数）
   - 首页非空判断（非空 = 文本量 > 60 字符或图片数 ≥ 1）
   - 空白页比例 = 文本 < 40 字符且图片 = 0 的页 / 总页数
   - 孤立方框统计：检测页面文本中只剩 □ ○ ◯ 等重复符号的行
6. 比对 HTML 端：
   - HTML 与 PDF 题号差异
   - HTML <img> 计数 vs PDF 图片计数
   - HTML 文本字符数 vs PDF 文本字符数
7. 输出 JSON 报告 + 失败截图（如果失败）
```

## 检查项

| 检查 ID | 默认阈值 | 失败语义 |
|---|---|---|
| `firstPageNonEmpty` | true | 首页空白 |
| `blankPageRatio` | ≤ 0.15 | 大面积空白 |
| `expectedImages` | 等于参数 | 漏图 |
| `expectedQuestions` | ≥ 参数 | 缺题 |
| `pdfTextRatio` | `pdfText / htmlText ≥ 0.85` | 打印缺文本 |
| `pdfImageDiff` | `|pdfImg − htmlImg| ≤ 1` | 打印缺图 |
| `noFailedResources` | true | 资源加载失败 |
| `noConsoleErrors` | true（除白名单） | 控制台报错 |
| `noIsolatedCheckboxRows` | ≤ 阈值 | 孤立方框成行 |
| `noBrowserHeaderFooter` | true | 浏览器自带页眉页脚干扰（用 `--print-background` + 模板移除） |
| `noOverflowHidden` | true | 主容器有 `overflow:hidden` 截断内容 |
| `noQuestionBreakAvoid` | true | 普通题块批量 `break-inside: avoid` 造成空白 |
| `mathJaxRendered` | 没有 `\dfrac`/`\frac` 源码出现在 PDF 文本里 | 公式未渲染 |

## 报告格式

```jsonc
{
  "verdict": "pass | fail",
  "input": "../../result.html",
  "html": {
    "imgCount": 6,
    "questionCount": 30,
    "tableCount": 2,
    "textCharCount": 12345
  },
  "pdf": {
    "pageCount": 8,
    "imageCount": 6,
    "textCharCount": 11890,
    "firstPageNonEmpty": true,
    "blankPageRatio": 0.0,
    "isolatedCheckboxRows": 0,
    "pages": [
      { "page": 1, "textChars": 1820, "images": 1, "blank": false }
    ]
  },
  "diff": {
    "textRatio": 0.963,
    "imageDiff": 0
  },
  "consoleErrors": [],
  "failedResources": [],
  "screenshots": ["report/preview-page-001.png"],
  "violations": [
    // {
    //   "code": "blankPageRatio",
    //   "message": "page 5 is blank, ratio=0.125",
    //   "details": {...}
    // }
  ],
  "elapsedMs": 12345
}
```

## 与 Layer 3 的关系

`tools/magazine-layout-guard`（Layer 3）只看 HTML 字符串，速度快、零依赖；`tools/print-preview-guard`（Layer 4）真正打开 Chromium，速度慢、依赖 Puppeteer。

CI/线上发布前必须两层都过：

```bash
node magazine-layout-guard/guard.js --input result.html ...   # Layer 3
node print-preview-guard/preview.js --input result.html ...   # Layer 4
```

任一退出码非 0，都视为不通过。

## 已知白名单（不计入 consoleError）

- `MathJax font cache message`
- `Failed to load resource: the server responded with a status of 200`（pagedjs polyfill 的 dev 提示）
- `Paged.js: Rendering`（info 级别）

具体白名单见 `tools/print-preview-guard/lib/console-allowlist.js`。

## 阻塞文案

```plain
打印产物验证不通过：
- pageCount=8, blankPageRatio=0.25（超过 0.15 阈值）
- 第 5 页只剩孤立方框 12 个
- consoleErrors: 1（MathJax typeset 失败：unknown command \zhcn）
请修复 HTML，重跑 magazine-layout-guard + print-preview-guard 双门禁。
```
