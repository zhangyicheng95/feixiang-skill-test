# Cursor 本地 Harness 适配

本 Harness **自包含于 `teaching-page-v2/`**，Agent 只 Read 本目录内文件。

## 路径（均在 teaching-page-v2 内）

| 用途 | 路径 |
|---|---|
| 单页规范 | `html-authoring/guide.md` + `math-design/` |
| 多页规范 | `courseware-generator/guide.md` + `content-guide.md` + `style-guide.md` |
| 测试纪律 | `test-html/SKILL.md` + `test-html/guide.md` |
| 视觉规范 | `feixiang-style.md` |
| 预览壳源码 | `assets/courseware-shell.js` → 复制到 `pages/<slug>/` |
| 产物 | `pages/<slug>/` |

## 工具映射

| 平台概念 | Cursor |
|---|---|
| `create_file` / `edit_file` | `Write` / `StrReplace` |
| `picture_gen` | `GenerateImage` / 用户 URL / 公开 CDN |
| `voice_gen` | Web Audio 或用户音频 URL |
| `knowledge_search` | `WebSearch` + `WebFetch` |
| `create_lesson_design` | `Write pages/<slug>/outline.md` |
| `continue_ask` | 聊天确认大纲 |
| `test_html` | `cursor-ide-browser` 手测 |
| `terminate` | ③ 步通过后结束 |

## 多页壳脚本

`style-guide.md` 与产物 HTML 末尾统一使用：

```html
<script src="./courseware-shell.js"></script>
```

复制步骤：

```
Read  teaching-page-v2/assets/courseware-shell.js
Write pages/<slug>/courseware-shell.js
```

## spec 注释

```html
<!-- spec: requirements=...; require=...; forbid=...; core-loop=... -->
```

数学单页首行（仅数学路由）：

```html
<!-- html-authoring:math-design palette=B-08 layout=L2 -->
```

## 媒体纪律

- 图片/音频须真实 URL 或 `pages/<slug>/assets/` 相对路径
- 禁止 base64 大图/长音频
