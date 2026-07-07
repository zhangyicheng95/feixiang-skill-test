# 互动课件字体样式指南

> 本文件只在 Phase 4 首次生成 HTML 前读取，用于让模型自主选择一套贯穿整份互动课件的字体风格。它不新增用户确认字段，不参与 Phase 7 模板后处理重新选字体。

---

## 一、关键结论

AI 模型本身不“拥有”字体。最终页面能否显示某个字体，取决于每页 iframe 运行时能否加载到该字体文件。

本指南中的字体已经作为测试环境静态资源上传到 `musk-songwang` 对应的 `musk-test.fbcontent.cn` URL。生成课件时：

1. 字体选择发生在原版互动课件 HTML 生成前。
2. 只加载被选中的字体资源；禁止一次性加载全部字体。
3. `@font-face`、字体变量和决策注释必须写入唯一的 `<template class="page-shared">`。
4. 模板后处理只继承字体变量，不重新选字体，不覆盖组件内部字体和颜色。
5. 新增字体时，必须先有真实可访问 URL；禁止伪造 `<link>` 或 `@font-face src`。

---

## 二、使用时机

固定位置：Phase 3 素材准备完成后、Phase 4 创建 HTML 骨架和生成第 1 页封面前。

```text
Phase 3 素材准备完成
  ↓
读取 typography-guide.md
  ↓
模型自主选择 1 套字体风格 preset
  ↓
只把该 preset 需要的 @font-face 与 CSS 变量写入 page-shared
  ↓
读取 cover-layout-guide.md，选择封面版式
  ↓
继续按 html-guide.md 生成原版互动课件
  ↓
Phase 7 模板注入继承该字体决策，不重新选择字体
```

硬边界：

1. 不调用 `ask_user` 让用户选择字体；模板选择仍是 Phase 1 表单中唯一新增的视觉字段。
2. 一份互动课件只选择一个主字体 preset。除 preset 明确包含“标题/正文/辅助/西文点缀”分工外，禁止逐页随机换字体。
3. 字体选择属于原版 HTML 生成的一部分，应写入原版课件并被模板版继承。
4. Phase 7 模板后处理只允许继承 `--cw-courseware-*` 字体变量；模板自己的字体只能作为 fallback，不能覆盖原版字体决策。
5. 组件框内字体和文字颜色在模板后处理阶段保持原课件结果；Phase 7 禁止为了模板或字体风格重写组件内部。

---

## 三、字体决策记录

选择字体后，在内部记录并在 `page-shared` 的 CSS 注释里留下可校验标记：

```css
/* CW_TYPOGRAPHY_DECISION:
 * selectedTypographyPreset=serif-source-han;
 * category=中文宋体;
 * reason=语文古诗文课件，正文需要稳定可读，标题需要传统书卷感;
 * resourceMode=uploaded-static;
 * loadedFontFaces=FXS Source Han Serif SC;
 * fallbackReady=true;
 */
```

记录字段：

| 字段 | 含义 |
|---|---|
| `selectedTypographyPreset` | 本指南中的 preset id |
| `category` | 宋体 / 黑体 / 楷体 / 马赛克体 / 西文手绘质感 |
| `reason` | 为什么适合本课题、年级、素材和封面版式 |
| `resourceMode` | 固定写 `uploaded-static`；新增无资源字体时写 `fallback-only` |
| `loadedFontFaces` | 本次实际声明的 `@font-face font-family`，多个用逗号分隔 |
| `fallbackReady` | 是否已提供可用 fallback 栈 |

---

## 四、CSS 写法规范

首次生成 HTML 骨架时，必须把字体资源和字体变量写进唯一的 `<template class="page-shared">`。不要把字体资源只写进 HTML `<head>`，因为每页在 iframe 中独立渲染，父文档资源不会被继承。

示例：选择 `serif-source-han` 时，只加载这一套中文字体。

```html
<template class="page-shared">
  <style>
    @font-face {
      font-family: "FXS Source Han Serif SC";
      src: url("https://musk-test.fbcontent.cn/pub-musk-ai-studio/user/upload/admin/tevTBrZX6UHb3NiamDxk7D.otf") format("opentype");
      font-weight: 400;
      font-style: normal;
      font-display: swap;
    }

    /* CW_TYPOGRAPHY_DECISION:
     * selectedTypographyPreset=serif-source-han;
     * category=中文宋体;
     * reason=示例;
     * resourceMode=uploaded-static;
     * loadedFontFaces=FXS Source Han Serif SC;
     * fallbackReady=true;
     */
    :root {
      --cw-courseware-title-font: "FXS Source Han Serif SC", "Noto Serif SC", "Songti SC", "STSong", serif;
      --cw-courseware-body-font: "FXS Source Han Serif SC", "Noto Serif SC", "Songti SC", "STSong", serif;
      --cw-courseware-label-font: "PingFang SC", "Microsoft YaHei", sans-serif;
      --cw-courseware-note-font: "Kaiti SC", "STKaiti", "KaiTi", cursive;
      --cw-courseware-latin-accent-font: "Arial", sans-serif;
    }

    [data-cw-role="page-root"] {
      font-family: var(--cw-courseware-body-font);
    }

    [data-cw-role="title-block"] {
      font-family: var(--cw-courseware-title-font);
    }

    [data-cw-role="content-block"] {
      font-family: var(--cw-courseware-body-font);
    }

    .cw-typography-label {
      font-family: var(--cw-courseware-label-font);
    }

    .cw-typography-note {
      font-family: var(--cw-courseware-note-font);
    }

    .cw-latin-accent {
      font-family: var(--cw-courseware-latin-accent-font);
    }
  </style>
</template>
```

规则：

1. 中文 Web Font 很重，通常最多加载 1 个中文字体家族。
2. 若需要西文点缀，可额外加载 1 个西文字体，例如 `latin-rubik-doodle`。
3. `@font-face` 必须写在 `page-shared` 内，且必须包含 `font-display: swap;`。
4. `.otf` 使用 `format("opentype")`；`.ttf` 使用 `format("truetype")`。
5. 数学公式、化学式、代码和数字计算区域优先使用 MathJax/系统无衬线/等宽 fallback，禁止套像素、手写、花体。
6. 不得使用负字距，不得靠字体变形解决溢出；溢出应调整布局、字号或拆页。

---

## 五、已上传字体资源目录

### 5.1 中文宋体 7 种

| preset id | 字体/风格 | `@font-face font-family` | URL | 格式 | 建议用法与 fallback |
|---|---|---|---|---|---|
| `serif-source-han` | 思源宋体 / Source Han Serif | `FXS Source Han Serif SC` | `https://musk-test.fbcontent.cn/pub-musk-ai-studio/user/upload/admin/tevTBrZX6UHb3NiamDxk7D.otf` | opentype | 通用语文、历史、传统文化。标题和正文均可用；fallback：`"Noto Serif SC", "Songti SC", "STSong", serif` |
| `serif-xiangcui-jixuesong` | 香萃积雪宋 | `FXS Xiangcui Jixuesong` | `https://musk-test.fbcontent.cn/pub-musk-ai-studio/user/upload/admin/VNTBRFh5epLFgJbK2ZxfdZ.ttf` | truetype | 古典文学、书卷感标题、诗词标题。正文只在字号充足时使用；fallback 到 `serif-source-han` |
| `serif-nanxi-ink` | 南西油墨宋 | `FXS Nanxi Youmosong` | `https://musk-test.fbcontent.cn/pub-musk-ai-studio/user/upload/admin/KVgj5zPku2U2pifzPTmXNF.ttf` | truetype | 旧书、油墨、文化专题。标题/短句强调，避免小字号长正文；生产前需复核原始授权来源；fallback 到 `serif-source-han` |
| `serif-sky-heart` | 空心晴宋体 | `FXS Sky Heart Clear Serif SC` | `https://musk-test.fbcontent.cn/pub-musk-ai-studio/user/upload/admin/4nsD6THgCE7KNsucngPYgV.ttf` | truetype | 轻文学、诗意封面、清爽标题。标题/副标题优先，不用于密集正文；fallback 到 `serif-source-han` |
| `serif-chill-huo-fangsong` | 寒蝉活仿宋 | `FXS Chill HuoFangSong` | `https://musk-test.fbcontent.cn/pub-musk-ai-studio/user/upload/admin/JQSVSS26Xt4JaGYMkgfqZ6.otf` | opentype | 文学批注、文言文、说明性文字。标题和短正文可用；fallback：`"FangSong", "STFangsong", "Songti SC", serif` |
| `serif-zhuque-fangsong` | 朱雀仿宋 | `FXS Zhuque Fangsong` | `https://musk-test.fbcontent.cn/pub-musk-ai-studio/user/upload/admin/GYxugL9VHFoS9tBgjVWuMK.ttf` | truetype | 文学讲读、古文、文化史。标题/正文均可尝试；fallback：`"FangSong", "STFangsong", "Songti SC", serif` |
| `serif-chill-jinshu` | 寒蝉锦书宋 | `FXS Chill Jinshu Song Text` | `https://musk-test.fbcontent.cn/pub-musk-ai-studio/user/upload/admin/MEHkpsscB97KDhDm5QKVim.otf` | opentype | 传统书籍、资料页、封面标题。适合标题和长标题，不用于过小字号；fallback 到 `serif-source-han` |

### 5.2 中文黑体 3 种

| preset id | 字体/风格 | `@font-face font-family` | URL | 格式 | 建议用法与 fallback |
|---|---|---|---|---|---|
| `sans-lxgw-neo-xihei` | 霞鹜新晰黑 | `FXS LXGW Neo XiHei` | `https://musk-test.fbcontent.cn/pub-musk-ai-studio/user/upload/admin/cnXbd2nFHsgkAHYxjbghcL.ttf` | truetype | 现代语文、科学、数学、信息密度较高页面。标题和正文均可用；fallback：`"Noto Sans SC", "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif` |
| `sans-nanowoodhei` | 纳米松木黑 / NanoWoodHei | `FXS NanoWoodHei` | `https://musk-test.fbcontent.cn/pub-musk-ai-studio/user/upload/admin/NWt7peLPfoxRF5XTTBZKqD.ttf` | truetype | 数学、科学、工具型说明、练习题。正文/按钮外文字/标签稳定清晰；fallback：`"MiSans", "PingFang SC", "Microsoft YaHei", sans-serif` |
| `sans-chill-huo-heiti` | 寒蝉活黑体 | `FXS Chill Huo Gothic F` | `https://musk-test.fbcontent.cn/pub-musk-ai-studio/user/upload/admin/gw8Ass4SkySGpwixMfqedW.otf` | opentype | 现代标题、海报感封面、重点提示。只用于标题/短句强调，正文用 `sans-lxgw-neo-xihei` 或 `sans-nanowoodhei` |

### 5.3 中文楷体 1 种

| preset id | 字体/风格 | `@font-face font-family` | URL | 格式 | 建议用法与 fallback |
|---|---|---|---|---|---|
| `kai-lxgw-wenkai` | 霞鹜文楷 | `FXS LXGW WenKai` | `https://musk-test.fbcontent.cn/pub-musk-ai-studio/user/upload/admin/ACoEyA3ffuSjdr4yoEQdhG.ttf` | truetype | 古诗词、朗读、批注、低年级语文温和风格。标题、注记、短正文可用；fallback：`"Kaiti SC", "STKaiti", "KaiTi", cursive` |

### 5.4 马赛克体 1 种

| preset id | 字体/风格 | `@font-face font-family` | URL | 格式 | 建议用法与 fallback |
|---|---|---|---|---|---|
| `pixel-poxiao-hax` | PoxiaoPixel Hax / 像素马赛克体 | `FXS PoxiaoPixel Hax` | `https://musk-test.fbcontent.cn/pub-musk-ai-studio/user/upload/admin/tmd7xQL6bKxVj9tg6qS8Xf.ttf` | truetype | 像素风模板、游戏化封面、数字标签。只用于大标题、页码、标签、短英文/数字；正文必须用清晰黑体 fallback |

### 5.5 西文手绘质感 1 种

| preset id | 字体/风格 | `@font-face font-family` | URL | 格式 | 建议用法与 fallback |
|---|---|---|---|---|---|
| `latin-rubik-doodle` | Rubik Doodle Shadow / 西文手绘质感 | `FXS Rubik Doodle Shadow` | `https://musk-test.fbcontent.cn/pub-musk-ai-studio/user/upload/admin/LcM2RtwkzUmZqeuU2VNrMe.ttf` | truetype | 英文标题点缀、贴纸感短标签、封面英文副标题。只用于英文/数字点缀；禁止用于中文正文和题目 |

---

## 六、preset 到 CSS 变量的映射

选择一个 preset 后，至少生成以下变量：

| preset | title | body | label | note | latin accent |
|---|---|---|---|---|---|
| `serif-source-han` | `FXS Source Han Serif SC` | `FXS Source Han Serif SC` | 系统黑体 | 系统楷体 | 系统无衬线 |
| `serif-xiangcui-jixuesong` | `FXS Xiangcui Jixuesong` | `FXS Source Han Serif SC` | 系统黑体 | 系统楷体 | 系统无衬线 |
| `serif-nanxi-ink` | `FXS Nanxi Youmosong` | `FXS Source Han Serif SC` | 系统黑体 | 系统楷体 | 系统无衬线 |
| `serif-sky-heart` | `FXS Sky Heart Clear Serif SC` | `FXS Source Han Serif SC` | 系统黑体 | 系统楷体 | 系统无衬线 |
| `serif-chill-huo-fangsong` | `FXS Chill HuoFangSong` | `FXS Chill HuoFangSong` | 系统黑体 | 系统楷体 | 系统无衬线 |
| `serif-zhuque-fangsong` | `FXS Zhuque Fangsong` | `FXS Zhuque Fangsong` | 系统黑体 | 系统楷体 | 系统无衬线 |
| `serif-chill-jinshu` | `FXS Chill Jinshu Song Text` | `FXS Source Han Serif SC` | 系统黑体 | 系统楷体 | 系统无衬线 |
| `sans-lxgw-neo-xihei` | `FXS LXGW Neo XiHei` | `FXS LXGW Neo XiHei` | `FXS LXGW Neo XiHei` | 系统楷体 | 系统无衬线 |
| `sans-nanowoodhei` | `FXS NanoWoodHei` | `FXS NanoWoodHei` | `FXS NanoWoodHei` | 系统楷体 | 系统无衬线 |
| `sans-chill-huo-heiti` | `FXS Chill Huo Gothic F` | `FXS LXGW Neo XiHei` | `FXS LXGW Neo XiHei` | 系统楷体 | 系统无衬线 |
| `kai-lxgw-wenkai` | `FXS LXGW WenKai` | `FXS LXGW WenKai` | 系统黑体 | `FXS LXGW WenKai` | 系统无衬线 |
| `pixel-poxiao-hax` | `FXS PoxiaoPixel Hax` | `FXS NanoWoodHei` | `FXS PoxiaoPixel Hax` | 系统楷体 | `FXS PoxiaoPixel Hax` |
| `latin-rubik-doodle` | 系统黑体或当前主标题字体 | 系统黑体 | 系统黑体 | 系统楷体 | `FXS Rubik Doodle Shadow` |

若某 preset 的 body/label 依赖另一套已上传字体，必须同时加载该依赖字体。例如 `pixel-poxiao-hax` 至少加载 `FXS PoxiaoPixel Hax` 和 `FXS NanoWoodHei`，因为像素体不能承载正文。

---

## 七、模型自主选择规则

选择前必须综合：

1. 课时内容和学科：语文古诗文/传统文化优先宋体或楷体；数学/科学/信息密集优先黑体；像素风主题或游戏化标题可用马赛克体点缀。
2. 年级：低年级优先温和、清晰、字形友好的字体；高年级可使用更强风格的标题字体。
3. 素材风格：若图片命中工笔、水墨、版画等传统图像风格，字体可偏宋体/楷体；若图片是实验、流程、图表，正文优先黑体。
4. 封面版式：超大标题可承载风格字体；长标题、两行以上标题必须优先可读性。
5. 模板选择：模板只提供视觉背景和颜色配方，字体 preset 不必与模板强绑定；当前阶段由模型自主选最适合教学内容的字体。

默认推荐：

| 内容类型 | 推荐 preset |
|---|---|
| 古典文学名著、古诗词、古代史、传统文化 | `serif-source-han` / `serif-zhuque-fangsong` / `kai-lxgw-wenkai` |
| 现代文学、阅读分析、综合语文 | `serif-source-han` 或 `sans-lxgw-neo-xihei` |
| 数学、科学、信息密集讲解 | `sans-nanowoodhei` 或 `sans-lxgw-neo-xihei` |
| 游戏化、像素风模板、闯关封面 | `pixel-poxiao-hax` 只做标题/标签，正文用 `sans-nanowoodhei` |
| 英文点缀、贴纸感短标签 | `latin-rubik-doodle` 只做西文 accent |

---

## 八、禁止事项

1. 禁止把字体选择做成新的 `ask_user` 字段。
2. 禁止只写字体名而没有 fallback 栈。
3. 禁止在无资源 URL 时伪造 `<link>` 或 `@font-face src`。
4. 禁止一份课件混用多套不相关字体，导致每页风格乱跳。
5. 禁止把 `Rubik Doodle Shadow`、像素体、手写体用于中文长正文、题目正文、公式、计算步骤。
6. 禁止 Phase 7 模板注入时重新选择字体或用模板字体覆盖 `--cw-courseware-*` 决策。
7. 禁止为了字体风格修改组件 DOM、按钮样式、组件框内文字颜色或交互绑定。
8. 禁止把字体资源放在父文档 `<head>` 里期望 iframe 页面继承。

---

## 九、Phase 7 继承要求

模板后处理必须保留以下内容：

1. 原版 HTML 中的 `CW_TYPOGRAPHY_DECISION` 注释。
2. `@font-face` 字体声明。
3. `--cw-courseware-title-font`
4. `--cw-courseware-body-font`
5. `--cw-courseware-label-font`
6. `--cw-courseware-note-font`
7. `--cw-courseware-latin-accent-font`

模板 `tokens.css` 可以把自己的 `--cw-template-title-font`、`--cw-template-body-font` 映射到这些变量；只有当原版没有字体变量时，才使用模板自带 fallback。
