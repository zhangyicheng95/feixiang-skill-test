# 字体样式指南

> 路径：`courseware-generator/references/typography.md`  
> Step 2 生成 HTML 前读取一次：选定 1 套字体 preset，写入 `page-shared`。

---

## 一、关键结论

页面最终能显示什么字体，取决于每页 iframe 运行时能否加载到该字体文件。飞象线上把字体作为静态资源上传到自有 CDN；**本 harness 默认无法访问该 CDN**，因此：

- **默认 `resourceMode=fallback-only`**：只用系统字体栈，不写 `@font-face`、不引用外链字体 URL。
- 每个 preset 仍映射到一组 `--cw-courseware-*` CSS 变量，保证字体角色分工（标题 / 正文 / 标签 / 注记 / 西文点缀）一致。
- 若将来接入了可访问的字体 URL，可在对应 preset 下补 `@font-face` 并把 `resourceMode` 改为 `uploaded-static`，变量名保持不变。

---

## 二、使用时机

固定位置：**Step 1 素材完成后**、Step 2 创建 HTML 和生成第 1 页封面前。

```text
素材准备完成
  ↓
读取 references/typography.md
  ↓
模型自主选择 1 套字体 preset
  ↓
把该 preset 的 --cw-courseware-* 变量 + 决策注释写入 page-shared
  ↓
读取 references/cover.md，选择封面版式
  ↓
按 references/html.md 生成课件
```

硬边界：

1. **不询问用户字体**，由模型按课题/学科/年级/素材气质自主决定。
2. 一份课件只选**一个**主 preset，禁止逐页乱换字体。
3. 字体角色分工只在 preset 内部（标题/正文/标签/注记/西文点缀），不额外扩展。
4. 数学公式、化学式、代码、数字计算区一律用系统无衬线/等宽 fallback，禁止套像素/手写/花体。
5. 不得用负字距或字体变形解决溢出；溢出应改布局、字号或拆页。

---

## 三、字体决策记录

在 `page-shared` 的 `<style>` 顶部留下可校验注释：

```css
/* CW_TYPOGRAPHY_DECISION:
 * selectedTypographyPreset=sans-modern;
 * category=中文黑体;
 * reason=九年级物理复习，信息密度高，正文需清晰可读;
 * resourceMode=fallback-only;
 * loadedFontFaces=none;
 * fallbackReady=true;
 */
```

| 字段 | 含义 |
|---|---|
| `selectedTypographyPreset` | 本文件的 preset id |
| `category` | 宋体 / 黑体 / 楷体 / 像素体 / 西文点缀 |
| `reason` | 为何适合本课题、年级、素材、封面 |
| `resourceMode` | 默认 `fallback-only`；接入真实字体 URL 时写 `uploaded-static` |
| `loadedFontFaces` | 实际声明的 `@font-face`；fallback-only 时写 `none` |
| `fallbackReady` | 是否提供了可用 fallback 栈 |

---

## 四、CSS 写法规范（fallback-only 默认）

把字体变量写进唯一 `<template class="page-shared">`；不要只写进 HTML `<head>`（iframe 不继承父文档）。

```html
<template class="page-shared">
  <style>
    /* CW_TYPOGRAPHY_DECISION: selectedTypographyPreset=serif-classic; category=中文宋体;
     * reason=示例; resourceMode=fallback-only; loadedFontFaces=none; fallbackReady=true; */
    :root {
      --cw-courseware-title-font: "Noto Serif SC", "Songti SC", "STSong", serif;
      --cw-courseware-body-font: "Noto Serif SC", "Songti SC", "STSong", serif;
      --cw-courseware-label-font: "PingFang SC", "Microsoft YaHei", sans-serif;
      --cw-courseware-note-font: "Kaiti SC", "STKaiti", "KaiTi", cursive;
      --cw-courseware-latin-accent-font: "Georgia", "Times New Roman", serif;
    }
    html, body { font-family: var(--cw-courseware-body-font); }
    .page-title, h1, h2, h3 { font-family: var(--cw-courseware-title-font); }
    .cw-label { font-family: var(--cw-courseware-label-font); }
    .cw-note { font-family: var(--cw-courseware-note-font); }
    .cw-latin { font-family: var(--cw-courseware-latin-accent-font); }
  </style>
</template>
```

规则：

1. fallback-only 模式下**不写 `@font-face`**，直接用系统字体栈。
2. 每个变量都必须给出 ≥2 级 fallback。
3. 若接入真实字体 URL：在 `page-shared` 内加 `@font-face`（含 `font-display: swap;`），把主字体放到对应变量栈首位，`resourceMode` 改 `uploaded-static`。

---

## 五、字体 preset 目录（fallback-only 系统字体栈）

> 主字体列给出「理想飞象字体」，括注可后补的真实字体；默认只落地 fallback 栈。

### 5.1 中文宋体

| preset id | 适用 | title / body 栈 | label | note | latin |
|---|---|---|---|---|---|
| `serif-classic` | 语文、历史、传统文化、古诗文 | `"Noto Serif SC","Songti SC","STSong",serif` | 系统黑体 | 系统楷体 | `Georgia, serif` |
| `serif-book` | 文言文、批注、资料页、书卷标题 | `"Noto Serif SC","FangSong","STFangsong","Songti SC",serif` | 系统黑体 | 系统楷体 | `Georgia, serif` |

### 5.2 中文黑体

| preset id | 适用 | title / body 栈 | label | note | latin |
|---|---|---|---|---|---|
| `sans-modern` | 数学、科学、信息密集、通用现代 | `"Noto Sans SC","Source Han Sans SC","PingFang SC","Microsoft YaHei",sans-serif` | 同 body | 系统楷体 | `Arial, sans-serif` |
| `sans-tool` | 工具型说明、练习题、按钮标签 | `"MiSans","PingFang SC","Microsoft YaHei",sans-serif` | 同 body | 系统楷体 | `Arial, sans-serif` |
| `sans-poster` | 现代标题、海报感封面（仅标题/短句） | 标题 `"Source Han Sans SC","PingFang SC",sans-serif`；正文回落 `sans-modern` | 同 body | 系统楷体 | `Arial, sans-serif` |

### 5.3 中文楷体

| preset id | 适用 | title / body 栈 | label | note | latin |
|---|---|---|---|---|---|
| `kai-gentle` | 古诗词、朗读、批注、低年级语文 | `"Kaiti SC","STKaiti","KaiTi",cursive` | 系统黑体 | 同 body | `Georgia, serif` |

### 5.4 像素 / 西文点缀

| preset id | 适用 | 说明 |
|---|---|---|
| `pixel-game` | 像素风/游戏化**标题、页码、短英文数字**；正文必须回落 `sans-modern` | fallback 用等宽：`"Courier New",monospace`（标题）；真实像素字体可后补 |
| `latin-accent` | 仅英文/数字点缀、贴纸感短标签 | fallback：`"Georgia","Times New Roman",serif`；禁止用于中文正文/题目 |

---

## 六、模型自主选择规则

选择前综合：

1. **学科/内容**：语文古诗文/传统文化 → 宋体或楷体；数学/科学/信息密集 → 黑体；像素/游戏化主题 → 像素体仅做标题点缀。
2. **年级**：低年级偏温和清晰（楷体/黑体）；高年级可用更强风格标题。
3. **素材气质**：水墨/工笔/版画类图 → 宋体/楷体；实验/流程/图表 → 正文黑体。
4. **封面版式**：超大标题可承载风格字体；两行以上长标题优先可读性。

默认推荐：

| 内容类型 | 推荐 preset |
|---|---|
| 古典文学、古诗词、古代史、传统文化 | `serif-classic` / `serif-book` / `kai-gentle` |
| 现代文学、阅读分析、综合语文 | `serif-classic` 或 `sans-modern` |
| 数学、科学、信息密集讲解 | `sans-tool` 或 `sans-modern` |
| 游戏化、像素风、闯关封面 | `pixel-game` 只做标题，正文用 `sans-modern` |
| 英文点缀、短标签 | `latin-accent` 仅西文 accent |

---

## 七、禁止事项

1. 禁止把字体选择做成询问用户的字段。
2. 禁止只写字体名而无 fallback 栈。
3. 禁止在无可访问 URL 时伪造 `<link>` 或 `@font-face src`。
4. 禁止一份课件混用多套不相关字体导致每页风格乱跳。
5. 禁止把像素体/手写体/西文点缀用于中文长正文、题目正文、公式、计算步骤。
6. 禁止把字体资源放在父文档 `<head>` 期望 iframe 继承。
