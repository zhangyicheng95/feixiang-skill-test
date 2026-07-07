---
name: magazine-layout
description: 当用户要求生成"杂志风 / 讲义 / 打印海报 / 纸质刊物 / 分页文档 / A4 排版 / 可打印页面"等**固定纸张**风格的 HTML 交付物时使用；覆盖 Paged.js 多页分页、紧凑网格、主题化风格选择与反模式清单。
---

更新时间：2026-04-24

# magazine-layout

## 适用场景

- 用户要求出**讲义 / 单元整理 / 打印资料 / 杂志排版 / 报纸 / 期刊 / 诗歌合集 / 海报**等**希望打印或以纸张形态呈现**的 HTML
- 用户原文包含 "A4"、"可打印"、"多页"、"杂志风"、"期刊风"、"分页"、"纸张"、"打印友好"

**不适用于：**

- 屏幕优先的交互动画 / 单页课件 / 游戏（用 `html-authoring`）
- 多页 PPT 课件（用 `courseware-*`）
- 试卷命题的题目呈现（用 `paper-generation` → `create_question_sheet`）

## 前置条件

需要以下工具可用：
- **图片生成**：`generate_image`（严禁用 picsum 等占位图 URL）
- **文件操作**：`create_file`、`read_file`、`edit_file`
- **结束**：`terminate`

## 工作流程

### 1. 内容诊断 → 确定情绪基调

用户只给主题（如"光合作用讲义"）时：**绝对禁止**写"这里是内容占位符"。先基于自身知识库生成**专业详实的内容**，再进入排版。

判断情绪基调：严肃 / 前卫 / 活泼 / 优雅 / 学术。基调决定风格选择。

### 2. 选风格（从 5 个里选 1 个或混搭）

| 风格 | 适用内容 | 视觉特征 |
|---|---|---|
| **WIRED 先锋科技** | AI / 科技 / 科幻 / 前沿商业 | 深色 / 高对比度 / 荧光点缀（霓虹绿 / 电光蓝）/ 极端粗细对比 / 文字图片交叠 |
| **Vogue 高级时尚** | 艺术 / 人物 / 诗歌 / 美学 | 衬线大标题可占半版 / 奢侈留白 / 黑白高对比 / 图片出血（贴边不留白） |
| **Monocle 新中产** | 人文地理 / 社会学 / 深度阅读 | 3-4 栏严谨网格 / 衬线标题 + 无衬线正文 / 莫兰迪 or 陶土棕 / 细分割线 |
| **Variety 波普 Z 世代** | 儿童教育 / 趣味练习 / 活动 | 高饱和（泡泡糖粉 / 明黄 / 亮橙）/ Brutalism 粗字体带黑描边 / 不对称色块 / 夸张几何 |
| **剑桥古典学术** | 古文言文 / 历史文献 / 严肃试卷 | 全站衬线 / 非对称双栏（左 1/5 注释 + 右 4/5 正文）/ 首字下沉 / 首行缩进 |

**拒绝千篇一律：不要每次都灰白底 + 居中标题。**

### 3. 视觉提案（生成代码前必做）

在调 `create_file` 前，先在思考中给出 5 点决策：
1. 内容情绪诊断
2. 选定风格
3. 主色 Hex + 字体搭配
4. 网格与亮点：哪里用巨型字 / 非对称 / 跨栏图
5. 防溢出与防截断策略

### 4. 生成 HTML → `create_file`

严格包含下列必备项。

### 5. 交付说明

向用户说明艺术指导理念（示例："我为您采用了 WIRED 先锋科技风，深色 + 霓虹绿点缀，打破传统网格……"）。

## 领域知识

### Paged.js 多页分页（核心差异点）

**绝对禁止**手动切 `<div class="paper">` 或写死高度，模型无法精确计算渲染高度。只需正常写流式 HTML，在 `<head>` 引入 Paged.js，让它自动切 A4。

必须引入：
```html
<script src="https://unpkg.com/pagedjs/dist/paged.polyfill.js"></script>
```

公式内容同时引入 MathJax：
```html
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
```

### @page 与打印安全区

```css
@page { size: A4 portrait; margin: 12mm 15mm; }
```

- **紧凑型** 12mm / 15mm 边距（不是 20mm+），最大化利用纸张
- 屏幕预览加 `.pagedjs_pages` 容器样式，使它像 PDF 阅读器
- `@media print { .no-print { display: none !important; } }`

### 防截断（break-inside）

```css
.keep-together, .question, table, img, figure, .option-group {
  break-inside: avoid;
}
```

**这是纸张排版最常见的坑 — 忘加就会在行中间截断**。题目块、表格、图表、配图必须包 `break-inside: avoid`。

### 极致紧凑排版（省纸铁律）

- 词汇表 / 速查表 / 选择题 / 短文 **必须**用 `column-count: 2` 或 `grid-template-columns: repeat(3, 1fr)`
- 元素间距 `gap: 2-6mm`；段间距 `0.5-0.8em`
- 正文 `line-height: 1.35-1.5`（不是 1.6+）
- 高密度 ≠ 混乱 → 必须配强网格对齐

### 打印按钮（必备交互）

右下角悬浮，类名带 `.no-print`：
```html
<button class="print-btn no-print" onclick="window.print()">打印本页</button>
```

### 字体栈（不要用 Google Fonts）

国内网络环境禁止外部字体 CDN。使用系统级字体栈：
- 衬线：Palatino / Georgia / Songti SC / SimSun
- 无衬线：-apple-system / PingFang SC / Microsoft YaHei
- 等宽：SFMono-Regular / Consolas / Menlo

### 图片

- 禁止 picsum.photos 等随机占位图，必须用 `generate_image` 生成真实图片并用返回 URL
- 生成提示偏向"极简摄影 / 黑白线稿 / 抽象几何 / 高级灰调"
- 必须用 `<figure>` 包 `<img>` + `<figcaption>`
- `figure { margin: 0; break-inside: avoid; }`
- `img { width: 100%; height: auto; display: block; object-fit: cover; }`
- 图注：`font-size: 10px`、浅灰、全大写或斜体，与图片边缘严格对齐
- **严禁**把图片丢进 `column-count` 多栏文本里（会错位 / 悬空）→ 图片必须有专属 `grid-column`（如 `grid-column: 1/-1` 横跨全宽）

## 反模式清单（严格禁止）

- ❌ 外部字体 CDN（Google Fonts 会被墙）
- ❌ 手动切分 `<div class="paper">`、写死页面高度
- ❌ 图片丢进 `column-count` 多栏文本
- ❌ 大面积圆角卡片 + 厚重阴影（那是 UI，不是出版物）
- ❌ `#FF0000` 这种高饱和纯红黄蓝绿（Variety 波普风除外）
- ❌ 塞满页面却没有网格对齐
- ❌ 默认 `<table>` 边框样式
- ❌ "内容占位符"、"暂无内容"这类敷衍
- ❌ `picsum.photos` / `via.placeholder.com` 随机占位图

## 质量标准

- 每份交付**都有清晰的风格定位**，不能退化为千篇一律的灰白底 + 黑字
- 高密度压缩空间的同时保持强网格
- 所有"题目、表格、图片、卡片"块都包 `break-inside: avoid`
- 右下角带打印按钮
- 包含公式时有 MathJax
- 含插图时用 `generate_image` 真实图片，不用占位

## 输出格式

单文件 HTML，`<head>` 必须包含：
1. `@page` + 边距
2. Paged.js 脚本
3. （如需公式）MathJax 脚本
4. `break-inside: avoid` CSS
5. 屏幕预览美化 CSS（`.pagedjs_pages` / `.pagedjs_page`）
6. 打印模式 CSS（`@media print`）
7. 风格化的主题 CSS

`<body>` 正常写流式 HTML，包含：
- 优雅的 Hero 标题 / 题头
- 专属风格的版面区块
- 右下角悬浮的 `.print-btn.no-print` 按钮

## 完整示例

**用户：** "帮我排版一份光合作用讲义，适合高中生"

**决策：**
1. 情绪：严谨 + 略带探索感（科学主题）
2. 风格：**Monocle 新中产** 为主（3 栏 + 莫兰迪绿）+ **WIRED** 局部（跨栏巨型光合反应式 + 荧光绿点缀）
3. 主色：`#6B8E6F`（叶绿素绿）+ `#F5F1E8`（米白）+ `#2E4A3A` 深绿点缀
4. 亮点：跨栏巨型反应式 `6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂`；叶绿体结构 `generate_image` 生成；侧栏细分割线
5. 防溢出：每个反应步骤块 `break-inside: avoid`；表格 `break-inside: avoid`

**执行：**
1. 自己生成光合作用讲义内容（暗反应 / 光反应 / 实验 / 常考点等 600-800 字）
2. `generate_image` 生成叶绿体结构线稿图 URL
3. `create_file` 输出单文件 HTML，含 Paged.js + @page 12mm / 15mm + `break-inside` 规则 + 打印按钮
4. 向用户说明理念 → `terminate`
