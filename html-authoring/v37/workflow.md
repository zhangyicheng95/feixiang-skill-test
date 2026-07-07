# math-design 子链路（html-authoring 内置）

> **仅当 html-authoring 判定为数学场景时启用。** 非数学学科**禁止**读取本目录任何文件，**禁止**在 HTML 中写入 `html-authoring:math-design` 注释。

## 文件导航

| 文件 | 用途 | 何时读取 |
|---|---|---|
| **workflow.md**（本文件） | 数学视觉工作流 + 布局/字号 | 数学场景**首先读取** |
| [color-palettes-a.md](color-palettes-a.md) | A-色彩01~11 活力高饱和 | Phase 3 选定 A 编号后，**仅读该编号段落** |
| [color-palettes-b.md](color-palettes-b.md) | B-色彩01~20 智性低饱和 | Phase 3 选定 B 编号后，**仅读该编号段落** |
| [visual-impact.md](visual-impact.md) | 图示视觉强化协议 | Phase 4 编写演示区前 |

## 色彩选用工作流（Color Selection）

```
Phase 1 ┃ 场景确认（已由 html-authoring 路由判定为数学）
Phase 2 ┃ 学段判定 → 选择 pool
  - 小学 1-6 年级 / 低段算术几何 → pool A（11 套）
  - 初中 7-9 / 高中 10-12 / 代数·函数·三角·数列 → pool B（20 套）
  - 年级未明示：按知识点难度推断；仍不确定 → 默认 pool B

Phase 3 ┃ 机械抽选 1 套（⚠️ 禁止主观挑选、禁止照搬示例编号、禁止跳号）

  **抽选池（完整覆盖，排序无关）：**
  - pool A → A-01 ~ A-11（11 套）
  - pool B → B-01 ~ B-20（20 套）
  - 所有编号同权参与抽选；A-01 居首、B-12 居中**仅是索引**，与命中概率无关
  - 严禁基于「示例用过 X」「A-01 / B-12 太常见」「某编号看着稳妥」等理由跳号

  **Step 1 — 提取 keyword**
  - keyword = 用户 prompt 中最核心的数学知识点词（如「勾股定理」「鸡兔同笼」「圆锥」）
  - 取最短能描述本课的词；无明显知识点 → prompt 前 4 字

  **Step 2 — 查 [knowledge-palette-map] 表（优先级 1，必查）**

  下表为 30 个常见知识点的预算定 palette。**Agent 必须先按 keyword 在表中精确匹配；命中即采用，禁止主观换号。** 表覆盖 A pool 8+ 套、B pool 13+ 套，已分散，A-01/B-12 与其它编号同权。

  | keyword | pool | palette_id | keyword | pool | palette_id |
  |---|---|---|---|---|---|
  | 鸡兔同笼 | A | A-06 | 勾股定理 | B | B-04 |
  | 表内乘法 | A | A-03 | 一次函数 | B | B-09 |
  | 圆的周长 | A | A-08 | 二次函数 | B | B-14 |
  | 长方体 | A | A-04 | 方程组 | B | B-07 |
  | 平行四边形 | A | A-09 | 等差数列 | B | B-11 |
  | 平均数 | A | A-02 | 阴影面积 | B | B-15 |
  | 植树问题 | A | A-07 | 数轴 | B | B-20 |
  | 相遇问题 | A | A-10 | 一元一次方程 | B | B-03 |
  | 圆锥 | A | A-05 | 因式分解 | B | B-17 |
  | 面动成体 | A | A-11 | 圆周角 | B | B-05 |
  | 概率（小学） | A | A-06 | 概率（初高中） | B | B-18 |
  | 单位进率 | A | A-04 | 绝对值 | B | B-12 |
  | 分数加减 | A | A-09 | 全等三角形 | B | B-06 |
  | 时分秒 | A | A-02 | 立体几何 | B | B-10 |
  | 平移旋转 | A | A-05 | 三角函数 | B | B-13 |
  | 表面积展开图 | A | A-01 | 数列求和 | B | B-08 |

  - **精确匹配命中即用**，禁止替换
  - 同义词归一：「长方体表面积」→「长方体」；「相遇」→「相遇问题」；不必拘泥完整原句

  **Step 3 — 算式兜底（仅当 Step 2 未命中时使用）**

  ```
  c1 = ord(keyword 第 1 字符)
  c2 = ord(keyword 末字符)
  hash = c1 × 7 + c2 × 5 + len(prompt)
  pool=A → palette_id = A-{(hash mod 11) + 1:02d}
  pool=B → palette_id = B-{(hash mod 20) + 1:02d}
  ```

  - 不会算 Unicode codepoint 时：选**与 keyword 最接近**的表中条目使用其 palette；严禁直接选 A-01 / B-12 / 任何"安全"编号

  **Step 4 — 声明输出（Phase 4 前必写）**

  必须在推理中显式输出**完整 4 项**，缺一即失败：
  ```
  抽选 ┃ keyword=<词>  pool=<A|B>  source=<table|hash>  palette_id=<X-XX>
  ```

  HTML 首行注释中的 palette **必须与本声明一致**。

  **修改已有 HTML 时**：保留原 palette_id，不重新抽选（除非用户明确要求换配色）。

Phase 4 ┃ 按需读取（禁止全量加载 31 套）
  - **必须使用 `call_skill` 返回的 `<skill-files>` 表中 CDN URL 原样 `read_url`**，禁止自行拼接路径
  - 附件路径可能为 `.../math-design/workflow.md` 或 `.../vN/workflow.md`（以 skill-files 表为准）
  - pool=A → 读取 color-palettes-a.md 中对应编号段落；pool=B → color-palettes-b.md
  - read visual-impact.md
  - 将选定色板的 hex **映射**为 CSS 变量：`--primary` `--secondary` `--accent` `--background` `--foreground`

Phase 5 ┃ 交付硬约束（**缺一即失败，禁止 terminate**）
  ① **palette 注释（最高优先级）**
     - `create_file` / `edit_file` 后，HTML **第一行**（`<!DOCTYPE html>` 之前）必须是：
       `<!-- html-authoring:math-design palette=<id> layout=<L1|L2|L3> -->`
     - 替换为 Phase 3 实际 palette_id 和 §2.2 实际 layout
     - 禁止写在 `<head>` 内代替首行；禁止省略
     - **未写入 → 必须 `edit_file` 补首行，然后才允许 terminate**
  ② 字号/按钮：H1=40px / font-weight:700 !important；按钮高 80px；按钮字号 28px
  ③ palette_id 与 Phase 3 输出一致（查表命中→精确匹配；hash 兜底→与算式结果一致）
  ④ Stage 主演示容器中心与 Stage 几何中心可视化对齐（§2.3）
  ⑤ 布局变体已落实并匹配算式（§2.2）：Agent 推理已声明 layout_hash 数字
  ⑥ **无下拉条**：HTML 中**不包含** `#controls` / `.controls` 的 `overflow-y:auto|scroll` 或 `overflow:auto|scroll`；`<body>` 只允许 `overflow:hidden`；唯一允许的滚动容器是 `#stage` 且仅在内容真超出时
  ⑦ Controls 控件块数 ≤ 5（L2/L3）或横向块 ≤ 6（L1），超量必须用 Tabs/Accordion 内部折叠
  ⑧ 坐标系/坐标轴方格闸门：只要页面实际绘制平面坐标系、函数图像、数轴、统计图坐标轴、x/y 轴或图表轴线，就执行 §1.1/§2.3.1；默认保留轴线、短刻度、标签、曲线/柱形/数据图形，但不出现 Stage/SVG/Canvas 背景方格或贯穿绘图区网格线；用户明确要求“方格线/网格线/坐标网格/参考线/辅助线/方便读点”时才画
  ⑨ 轴线保护：不得为了去方格而删除坐标轴/图表轴、刻度、轴标签、分箱标签、数据标签或必要数据图形；轴线必须清晰可见
```

## 一、视觉硬性要求 (Visual Identity)

- 可视区域参考比例：16:7，优先一屏展示所有交互
- 内容超屏时：Step Navigation 或 Card Tab 切换；允许 Stage 区局部滚动
- 演示图示必须通过色彩填充保持视觉冲击力（遵循 visual-impact.md）
- 按钮统一高度：**80px**
- 页面采用 safe area 安全高度设计
- grid 仅用于模块，不用于锁死整体高度
- **坐标系/坐标轴方格只由用户意图触发**：色板中的“背景网格”只提供可选视觉语言，不能自动变成 Stage 底纹；凡是带 x/y 轴或图表轴线的场景（函数图、直方图、柱状图、折线统计图等）默认不铺背景方格/贯穿绘图区网格线；统计图默认保留轴线、短刻度、轴标签、分箱/数据标签，只有显式要求参考线时才画图表参考线
- 禁止标题前 Emoji；具体元素用 SVG 绘制，配色符合选定色板

### 1.1 坐标系/坐标轴方格开关

**只在页面实际绘制坐标系或坐标轴时使用本节。** 包括平面直角坐标系、函数图像、数轴、统计直方图、柱状图、条形图、折线统计图等凡是出现 x/y 轴、图表轴线、`axis` 图层或坐标标尺的场景；不包含完全没有轴线的普通卡片、表格、分块模块或装饰背景。

任何坐标系/坐标轴场景都必须先从用户原文声明 `grid_intent`，再写代码和测试：

- `grid_intent=default_no_grid`：用户只说“平面直角坐标系 / 坐标系 / 坐标轴 / 坐标平面 / 点坐标 / 读坐标 / 在坐标系中演示点或函数 / 标出交点 / 展示面积变化”等，没有出现方格/网格/参考线触发词
- `grid_intent=explicit_coordinate_grid`：用户原文明确要求“方格线 / 网格线 / 坐标网格 / 坐标纸 / 方格纸 / 网格背景 / 带网格坐标系 / 方便学生读点”等，并且对象是平面直角坐标系/函数图/坐标纸
- `grid_intent=explicit_chart_reference`：统计图/图表中用户明确要求“参考线 / 辅助线 / 方便读数”，但没有要求坐标纸/坐标网格

**禁止把“平面直角坐标系”四个字当成方格意图。** 例如用户说“在平面直角坐标系中演示点 A(2,3)、B(-1,2)、C(3,-2) 的位置，并展示三角形 ABC 的面积变化”，应判为 `grid_intent=default_no_grid`：只能画 x/y 轴、箭头、短刻度、坐标标签、点、三角形和面积标签；不得生成 `#grid-layer`、`.grid-line`、`initGrid()` 或全幅横竖网格线。

当用户原文明确出现“方格线 / 网格线 / 坐标网格 / 坐标纸 / 方格纸 / 网格背景 / 带网格坐标系 / 参考线 / 辅助线 / 方便学生读点”等表达时：

- 必须生成对应的坐标方格/图表参考线，不能因为“默认无方格”规则删除
- 若任务是平面直角坐标系/函数图像/坐标纸，且用户说“方格线 / 网格线 / 坐标网格 / 坐标纸 / 方格纸 / 带网格坐标系 / 方便学生读点”，必须生成二维坐标方格：水平线和垂直线都要真实渲染且数量相近；只生成横向参考线或只生成纵向参考线都不是“方格线”
- 若任务是统计图，且用户只说“参考线 / 辅助线 / 方便读数”而没有要求坐标纸/坐标网格，可按读数需要只画水平或垂直参考线；这类参考线不等同于平面直角坐标系的完整方格
- 方格/参考线必须与坐标轴、刻度、标签、曲线/柱形共用同一 `unit/origin` 或图表比例尺；x 轴、y 轴必须与网格/参考线对齐
- 平面直角坐标系/坐标纸的原点必须是网格交点：若网格按 `gridStartX/gridStartY + n * unit` 绘制，则 `(originX-gridStartX) % unit == 0` 且 `(originY-gridStartY) % unit == 0`，容差 ≤0.5px；`GRID_SIZE=600, UNIT=40, ORIGIN_X=300, ORIGIN_Y=300` 是失败例，因为 300 不在 40px 网格线上
- 建议使用 `viewBox` 以原点为中心，或采用 `GRID_SIZE=640, UNIT=40, ORIGIN=320` / `gridStart=20, origin=300, unit=40` 这类能让轴线落在网格线上的参数；禁止轴线夹在两条网格线中间
- 方格/参考线放在曲线/点/柱形/坐标轴下层，坐标轴在上层且更粗更深；建议 `axis stroke-width >= 2`，`grid stroke-width >= 1`
- 坐标方格线优先直接写在 SVG 标记中，或用常量数组拼接 `<line ... class="grid-line">` 后一次性写入 `gridLayer.innerHTML`；不要在最终产物里逐条用 `document.createElementNS(...)` 动态创建坐标方格线，因为发布链可能把 SVG namespace 改写为 `[unsafe-url-removed]`，导致一部分方向的线存在于 DOM 但无法渲染
- 方格/参考线必须肉眼可见，不能只是 DOM 中存在：颜色必须明显区别于 Stage/plot 背景；禁止 `#C5BFBF` 配 `#CBCBCB`、`#DDE3CA` 配 `#EBEDD4` 这类近灰/近浅色组合
- **显式方格可见性机械阈值**：网格线 computed stroke 与 Stage/plot 背景的相对亮度对比度 `contrast >= 1.5`，或 RGB 任一通道差值 `maxDelta >= 32`；`stroke-width >= 1.25px`；`stroke-opacity/opacity >= 0.65`。浅背景优先用更深的 palette 边框/正文色，深背景优先用更亮的 palette 浅线，仍需来自选定 palette/同色系
- 显式方格线配色选择：不要取与 `--stage-bg` 只差一档的浅色；浅 Stage 上优先用 `--text-on-stage` / `--primary-text` / 深边框色作为 grid stroke 并降低层级，深 Stage 上优先用浅前景色。轴线仍必须比网格线更粗更醒目
- `test_html`/自检必须验证：坐标方格数量 > 0；横竖方向都存在且来自有效 SVG namespace；源码/DOM 不含 `[unsafe-url-removed]`；坐标轴/图表轴存在；方格/参考线与轴线不应同色同粗；并计算上述 contrast/maxDelta/stroke-width/opacity，未达阈值即视为方格线缺失。统计图单向参考线按参考线意图单独断言，不套用二维坐标方格断言
- **禁止无效网格测试**：测试脚本只写 `grid_count > 0`、`.grid-line count > 0`、`#grid line count > 0` 不合格；这种测试只能证明 DOM 存在，不能证明方格线可见。没有计算 `contrast` 或 `maxDelta` 的测试，不得在最终回复里声称“方格线符合可见性阈值”

当用户没有明确要求上述方格/网格表达时：

- 坐标系/坐标轴场景默认只画坐标轴/图表轴、箭头、短刻度、刻度标签、轴标签、函数曲线/点位、柱形/折线/数据标签和必要语义辅助线
- 不画覆盖整个 SVG/Canvas/Stage/plot-area/chart-area 的完整方格背景；不要在 `#stage`、`.stage`、`.plot-area`、`.chart-area`、`.svg-container`、`#plot-container` 上用 CSS `background-image` / 成对 `linear-gradient` / `repeating-linear-gradient` / SVG `<pattern>` 伪装坐标方格
- 不要写会生成全幅背景方格的 `initGrid/drawGrid/createGrid*` 或全宽全高横竖线循环；`grid-lines` 命名只在内容确实是短刻度/刻度标签时允许
- 不要把方格作为“可选功能”默认塞进页面：用户未要求方格/网格时，禁止出现“切换网格/显示网格/隐藏网格”按钮，禁止保留默认隐藏或可切换的 `gridLayer`、`.grid-line`、`toggleGrid()`、`gridVisible`。默认场景需要读点时，用短刻度、刻度标签、交点/点位标签解决
- 默认无方格场景的 `test_html` must-cover 必须写“坐标轴/短刻度/点位/曲线/数据图形存在，且无方格/网格背景”；禁止写“坐标方格可见性 / 方格线对比度 / 网格线与轴对齐”等显式方格断言。若测试或人工检查发现默认场景有方格，修复是删除 `gridLayer/.grid-line/initGrid()` 与对应测试断言，不能通过加深 `--grid-color`、提高 opacity 来保留方格
- 若需刻度，只画轴附近短刻度线；禁止把默认刻度线延伸成贯穿整个绘图区的横线/竖线
- 失败例：用户只说“生成考试成绩频数分布直方图，数据分组和频数可以调整”时，`#stage { background-image: linear-gradient(...), linear-gradient(90deg,...); background-size: 15px 15px; }` 属于错误的默认方格背景

**统计图/图表轴保护（避免过度限制）：**
- 统计直方图、柱状图、条形图、折线统计图只要绘制 x/y 轴或图表轴线，也属于“坐标轴场景”的默认无背景方格规则
- 不得删除统计图的底轴/纵轴、轴标签、刻度/分箱标签、柱形/折线/数据标签；轴线颜色必须与背景有明显对比
- 默认允许短刻度、刻度标签、分箱边界、数据标签；不默认绘制贯穿绘图区的水平/垂直参考线。若用户明确要求“参考线/网格线/辅助线/方便读数”，才画参考线
- `grid-lines` / `ref-line` 命名本身不是失败；失败的是未显式要求时出现 Stage CSS 背景网格或贯穿绘图区的全幅网格/参考线

## 二、布局硬性约束 (Visual & Layout Constraints)

### 2.1 基础公式
- **一屏优先级**：不产生全局滚动条为最高目标
- **基础公式**：Container(flex) = Header(fixed) + Body(flex-grow:1) + Controls(flex-shrink:0)
  - **Body** 至少包含 Stage（演示区）；Controls 的位置由「布局变体」决定
- **弹性字号保护**：H1 基准 **40px**（禁止 42px）；必要时 `clamp(30px, 5vh, 40px)`

### 2.2 布局变体（**三向必选 1 种，禁止默认底栏**）

| 变体 | 结构 | Controls 位置 | 适用场景 |
|---|---|---|---|
| **L1 底栏** | Header → Stage → Controls(bottom) | 底部 | 步骤导航、按钮 ≥3、以「上一步/下一步/重置」为主 |
| **L2 左栏** | Header → [Controls(left) ‖ Stage] | 左侧 | 滑块/参数调节为主、几何探索、左侧选择列表 |
| **L3 右栏** | Header → [Stage ‖ Controls(right)] | 右侧 | 演示主导、辅助参数面板、信息说明类 |

**选择算法（机械，必须在推理中输出 layout_hash 数字）：**
```
c1 = ord(keyword 第 1 字符)
layout_hash = (c1 + len(prompt)) mod 3
layout = ["L1底栏", "L2左栏", "L3右栏"][layout_hash]
```

**层级例外（极少使用，必须显式声明理由）：**
- 仅当算式命中 L1 但实际控件含 ≥ 3 个滑块/数值输入 → 在 L2 / L3 之间二选一（按 `(c1+1) mod 2` → 0=L2 / 1=L3）
- 其它情形**一律按算式**，禁止"为简洁/安全/熟悉"改为 L1

**Controls 尺寸约束：**
- L1：高度 ≤ 140px（按钮 80px + 上下 20px 边距 + 必要标签），横向 flex
- L2 / L3：宽度 ≤ 28% 视口宽，按钮高 **80px**，纵向 flex
- 三种变体均保留：按钮 80px、按钮字号 28px、按钮上方 20px 安全边距

**Controls 内容硬约束（**关键，防止下拉条**）：**
- **禁止** `#controls` / `.controls` 设置 `overflow-y: auto`、`overflow-y: scroll`、`overflow: auto` 或 `overflow: scroll`（一旦出现 → terminate 失败）
- L2 / L3 单栏控件数 **≤ 5 块**（一个滑块组、一个按钮组、一个公式卡、一个数值显示 = 4 块）
- 控件多 → 用 Tabs / Accordion 内部折叠；**不允许**靠滚动条解决
- 全局 `<body>` 仅允许 `overflow: hidden`；唯一允许内部滚动的容器是 `#stage`（也仅在内容真超出时）

### 2.3 Stage 居中硬约束（**所有变体通用**）

- **Stage 容器**必须设置：
  ```css
  #stage {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }
  ```
- **主演示元素**（SVG / Canvas / 几何容器 / 三维场景）必须：
  - 使用 `margin: auto` 或 flex 居中，**禁止**仅靠 `position:absolute; left:0; top:0`
  - 包围盒中心 = Stage 几何中心；坐标系/数轴的原点或对称轴必须对齐 Stage 中心
  - 容器 `max-width: 90%; max-height: 90%`，避免贴边
- **SVG viewBox**：原点居中 (`viewBox="-W/2 -H/2 W H"`)，方便绕中心绘制
- terminate 前自检：左右留白偏差 ≤ 15%、上下留白偏差 ≤ 15%

### 2.3.1 坐标系/坐标轴与方格线硬约束（防视觉误差）

- **适用范围**：当页面实际绘制“平面直角坐标系 / 坐标轴 / x 轴 y 轴 / 数轴 / 函数图像 / 一次函数图像 / 二次函数图像 / 抛物线 / 坐标平移或变换 / 统计图坐标轴 / 直方图轴线 / 柱状图轴线 / 折线图轴线”时，执行本节
- **不适用范围**：完全没有坐标轴的扇形图、纯表格、分块卡片、流程图、装饰背景等；这些场景不因本节被限制
- **默认形态**：只画坐标轴/图表轴、箭头、短刻度、刻度标签、轴标签、函数曲线/点位、柱形/折线/数据标签，以及必要的语义辅助线（如对称轴、区间边界、极值垂线）；默认**不画覆盖整个 SVG/Canvas/Stage/绘图区的方格纸背景**
- **先判定意图再测试**：出现“平面直角坐标系/坐标轴/点坐标/函数图像”只是坐标轴场景，不是方格意图；若用户没有原文要求方格/网格/坐标纸/参考线，`grid_intent=default_no_grid`，`test_html` 必须验证无方格，禁止把“方格可见性/方格线对比度”列入 must-cover
- **显式要求才画坐标方格/参考线**：用户原文出现“方格线 / 网格线 / 坐标网格 / 坐标纸 / 方格纸 / 网格背景 / 带网格坐标系 / 参考线 / 辅助线 / 方便学生读点”等要求时，才绘制完整坐标方格或图表参考线，且必须可见、与坐标轴/比例尺对齐。若用户写“带方格线的平面直角坐标系”，`grid_intent=explicit`，没有可见方格线就是失败
- 未显式要求方格/参考线时，坐标轴场景代码中禁止出现：用于背景方格的 CSS `background-image` 网格、成对 `linear-gradient`、`repeating-linear-gradient`、SVG `<pattern>` 方格底纹、`gridLayer`、`.grid-line`、`toggleGrid()`、`gridVisible`、`initGrid()`、`drawGrid()`、`createGrid*()`、Canvas/SVG 中覆盖全宽全高的全量横竖线循环；此处不禁止 CSS 布局 `display:grid`，也不禁止统计图的短刻度线/数据图形
- 若需要刻度，只画短刻度线：函数坐标系中 x 轴刻度为 y=-4 到 y=4 的短线、y 轴刻度为 x=-4 到 x=4 的短线；图表轴中短刻度应贴近轴线，长度建议 ≤10px；禁止把默认刻度线延伸成贯穿整个绘图区的横线/竖线
- **坐标轴可视范围保护**：函数图像、平面直角坐标系和需要标出 x/y 轴交点的题目，x 轴和 y 轴必须在 SVG `viewBox` / Canvas / plot 区域内清晰可见；`originX/originY` 或轴线坐标不得落到可视范围外。失败例：`viewBox="-150 -250 500 400"` 的 y 范围是 `[-250,150]`，却设置 `originY=200` 并把 x 轴画在 `y=200`，会导致 x 轴被裁掉
- **统计图口径**：直方图/柱状图/折线统计图必须保留清晰的图表轴线、轴标签、刻度/分箱标签和数据图形；只限制默认背景方格和全幅参考线，不限制轴线本身
- 色板段落里的“背景网格”不能触发坐标方格；它只能作为普通模块纹理参考，不能替代用户的显式网格要求
- 允许绘制坐标系方格时，必须定义唯一的 `unit`、`originX`、`originY`，并用同一变换绘制所有元素：
  ```js
  xScreen = originX + x * unit;
  yScreen = originY - y * unit;
  ```
- 网格线、坐标轴、刻度、标签、曲线、点位、辅助线必须全部来自上述同一坐标变换或同一图表比例尺；x 轴和 y 轴必须落在网格/参考线体系上，刻度标签必须对齐
- 显式坐标纸/平面直角坐标系必须机械验证轴网格对齐：x 轴的 `y` 坐标必须等于某条水平网格线的 `y`，y 轴的 `x` 坐标必须等于某条垂直网格线的 `x`，距离容差 ≤0.5px；不能只看起来差不多，也不能只检查 `.grid-line` 数量
- 优先用同一个 SVG / Canvas 绘制方格、轴、刻度、曲线/柱形；禁止用独立 CSS 背景伪装坐标方格，除非用户显式要求网格且 `background-size` 与 `background-position` 严格绑定同一个 `unit/origin`
- 坐标系方格颜色仍必须来自选定 palette 的浅色/边框色变量，不能引入外源灰蓝、默认蓝等非 palette 颜色；若用户没有要求方格且无法保证与坐标轴精确对齐，**必须删除方格，只保留坐标轴/短刻度/标签/数据图形**
- `test_html`/自检必须按意图分支：坐标系/坐标轴场景且未要求方格/参考线时，断言 Stage/plot 容器 computed `backgroundImage` 不含 `linear-gradient`/`repeating-linear-gradient`，无贯穿绘图区的全幅网格/参考线，无 `gridLayer`/`#grid-layer`、`.grid-line`、`initGrid()`/`drawGrid()`/`createGrid*()`、`toggleGrid()`/`gridVisible`/“切换网格”这类方格脚手架或入口，同时坐标轴/图表轴和轴标签存在且位于可视范围内；明确要求坐标方格时，断言方格存在、横竖方向都有、均为有效 SVG 线、源码/DOM 不含 `[unsafe-url-removed]`、坐标轴存在且轴线比方格线更醒目，并断言网格线 computed stroke 相对 Stage/plot 背景 `contrast >= 1.5` 或 `maxDelta >= 32`、`stroke-width >= 1.25px`、`opacity >= 0.65`，平面坐标纸还必须断言轴线落在网格线上；明确要求统计参考线时，按水平/垂直参考线意图验证可见性和比例尺对齐，不强制二维方格；非坐标轴场景不执行本分支

显式方格线可见性测试必须包含“存在 + 横竖方向 + 样式可见性”三类断言，可直接使用如下 Playwright 片段（按页面实际选择器调整）：

```python
grid_check = page.evaluate("""() => {
  const grids = [...document.querySelectorAll('.grid-line, .grid, [data-grid-line], #grid line, #grid-lines line, #grid-layer line')];
  const stage = document.querySelector('#stage, .stage, .plot-area, .chart-area, #plot-svg, svg');
  const html = document.documentElement.innerHTML || '';
  const parseColor = (value) => {
    value = (value || '').trim();
    const nums = value.match(/rgba?\\(([^)]+)\\)/);
    if (nums) {
      const parts = nums[1].split(',').map(x => parseFloat(x));
      return {r: parts[0], g: parts[1], b: parts[2], a: parts[3] == null ? 1 : parts[3]};
    }
    const hex = value.match(/^#([0-9a-f]{6})$/i);
    if (hex) {
      const n = parseInt(hex[1], 16);
      return {r:(n>>16)&255, g:(n>>8)&255, b:n&255, a:1};
    }
    return null;
  };
  const relLum = (c) => {
    const f = (v) => {
      v = v / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  if (!grids.length) {
    return {count:0, horizontal:0, vertical:0, badNamespace:0, unsafeNamespace:/\\[unsafe-url-removed\\]/.test(html), contrast:0, maxDelta:0, strokeWidth:0, opacity:0};
  }
  const gridLines = grids.filter(l => l.tagName.toLowerCase() === 'line');
  const validSvgLines = gridLines.filter(l => l.namespaceURI === 'http://www.w3.org/2000/svg');
  const badNamespace = gridLines.length - validSvgLines.length;
  const bg = parseColor(getComputedStyle(stage).backgroundColor);
  const sample = validSvgLines[0] || grids[0];
  const gStyle = getComputedStyle(sample);
  const stroke = parseColor(gStyle.stroke || sample.getAttribute('stroke'));
  const contrast = stroke && bg ? (Math.max(relLum(stroke), relLum(bg)) + 0.05) / (Math.min(relLum(stroke), relLum(bg)) + 0.05) : 0;
  const maxDelta = stroke && bg ? Math.max(Math.abs(stroke.r-bg.r), Math.abs(stroke.g-bg.g), Math.abs(stroke.b-bg.b)) : 0;
  const strokeWidth = parseFloat(gStyle.strokeWidth || sample.getAttribute('stroke-width') || '0');
  const opacity = Math.min(parseFloat(gStyle.opacity || '1'), parseFloat(gStyle.strokeOpacity || sample.getAttribute('stroke-opacity') || '1'));
  const horizontal = validSvgLines.filter(l => l.getAttribute('y1') === l.getAttribute('y2')).length;
  const vertical = validSvgLines.filter(l => l.getAttribute('x1') === l.getAttribute('x2')).length;
  const directionRatio = Math.min(horizontal, vertical) / Math.max(horizontal, vertical, 1);
  return {count: grids.length, validSvgCount: validSvgLines.length, horizontal, vertical, directionRatio, badNamespace, unsafeNamespace:/\\[unsafe-url-removed\\]/.test(html), contrast, maxDelta, strokeWidth, opacity};
}""")
assert grid_check["count"] > 0, "显式方格线缺失"
assert grid_check["horizontal"] > 0 and grid_check["vertical"] > 0, f"方格线方向不完整: {grid_check}"
assert grid_check["directionRatio"] >= 0.5, f"方格线横竖数量明显失衡: {grid_check}"
assert grid_check["badNamespace"] == 0 and not grid_check["unsafeNamespace"], f"方格线 SVG namespace 被发布链改写: {grid_check}"
assert grid_check["contrast"] >= 1.5 or grid_check["maxDelta"] >= 32, f"方格线对比度不足: {grid_check}"
assert grid_check["strokeWidth"] >= 1.25 and grid_check["opacity"] >= 0.65, f"方格线过细或过淡: {grid_check}"
```

默认无方格场景必须额外断言“没有可切换网格入口”，否则会重现“默认显示方格/可切换方格”的失败：

```python
default_grid_check = page.evaluate("""() => {
  const bodyText = document.body.innerText || '';
  const html = document.documentElement.innerHTML || '';
  const bg = [...document.querySelectorAll('#stage, .stage, .plot-area, .chart-area, svg')]
    .map(el => getComputedStyle(el).backgroundImage || '')
    .join(' ');
  const fullGridLines = [...document.querySelectorAll('.grid-line, [data-grid-line], #grid-layer line, #grid line')]
    .filter(l => {
      const x1 = parseFloat(l.getAttribute('x1') || 'NaN'), x2 = parseFloat(l.getAttribute('x2') || 'NaN');
      const y1 = parseFloat(l.getAttribute('y1') || 'NaN'), y2 = parseFloat(l.getAttribute('y2') || 'NaN');
      const len = Math.hypot((x2 || 0) - (x1 || 0), (y2 || 0) - (y1 || 0));
      return Number.isFinite(len) && len > 30;
    }).length;
  return {
    hasGradientGrid: /linear-gradient|repeating-linear-gradient/.test(bg),
    hasGridScaffold: /\\b(gridLayer|gridVisible|toggleGrid|initGrid|drawGrid|createGrid\\w*)\\b|id=["']grid-layer["']|class=["'][^"']*\\bgrid-line\\b/.test(html),
    hasToggleGrid: /toggleGrid|gridVisible|切换网格|显示网格|隐藏网格/.test(html + bodyText),
    fullGridLines
  };
}""")
assert not default_grid_check["hasGradientGrid"], f"默认场景出现 CSS 方格背景: {default_grid_check}"
assert not default_grid_check["hasGridScaffold"], f"默认场景出现方格脚手架或网格类名: {default_grid_check}"
assert not default_grid_check["hasToggleGrid"], f"默认场景出现可切换网格入口: {default_grid_check}"
assert default_grid_check["fullGridLines"] == 0, f"默认场景出现全幅网格线: {default_grid_check}"
```

坐标轴场景必须额外断言“轴线在 SVG/Canvas 可视范围内”，否则会出现坐标轴被裁掉但测试仍通过：

```python
axis_visibility_check = page.evaluate("""() => {
  const svg = document.querySelector('svg');
  const vb = svg?.viewBox?.baseVal;
  if (!svg || !vb || !vb.width || !vb.height) return {skip:true};
  const minX = vb.x, maxX = vb.x + vb.width, minY = vb.y, maxY = vb.y + vb.height;
  const num = v => parseFloat(v);
  const lines = [...document.querySelectorAll('line.axis, #axis-layer line, #axes-layer line, .axis line')]
    .map(l => ({x1:num(l.getAttribute('x1')), x2:num(l.getAttribute('x2')), y1:num(l.getAttribute('y1')), y2:num(l.getAttribute('y2'))}))
    .filter(l => [l.x1,l.x2,l.y1,l.y2].every(Number.isFinite));
  const horizontal = lines
    .filter(l => Math.abs(l.y1-l.y2) <= 0.5 && Math.abs(l.x2-l.x1) > 30)
    .sort((a,b) => Math.abs(b.x2-b.x1)-Math.abs(a.x2-a.x1))[0];
  const vertical = lines
    .filter(l => Math.abs(l.x1-l.x2) <= 0.5 && Math.abs(l.y2-l.y1) > 30)
    .sort((a,b) => Math.abs(b.y2-b.y1)-Math.abs(a.y2-a.y1))[0];
  const overlapsX = l => Math.max(l.x1,l.x2) >= minX && Math.min(l.x1,l.x2) <= maxX;
  const overlapsY = l => Math.max(l.y1,l.y2) >= minY && Math.min(l.y1,l.y2) <= maxY;
  return {
    skip:false, viewBox:{minX,maxX,minY,maxY},
    xAxisY: horizontal?.y1, yAxisX: vertical?.x1,
    hasXAxis: !!horizontal, hasYAxis: !!vertical,
    xAxisVisible: !!horizontal && horizontal.y1 >= minY && horizontal.y1 <= maxY && overlapsX(horizontal),
    yAxisVisible: !!vertical && vertical.x1 >= minX && vertical.x1 <= maxX && overlapsY(vertical)
  };
}""")
assert axis_visibility_check["skip"] or axis_visibility_check["hasXAxis"], f"x轴缺失: {axis_visibility_check}"
assert axis_visibility_check["skip"] or axis_visibility_check["hasYAxis"], f"y轴缺失: {axis_visibility_check}"
assert axis_visibility_check["skip"] or axis_visibility_check["xAxisVisible"], f"x轴不在可视范围内: {axis_visibility_check}"
assert axis_visibility_check["skip"] or axis_visibility_check["yAxisVisible"], f"y轴不在可视范围内: {axis_visibility_check}"
```

显式坐标纸/平面直角坐标系还必须额外断言“坐标轴落在网格线上”，不能只数方格线：

```python
alignment_check = page.evaluate("""() => {
  const lines = [...document.querySelectorAll('line')];
  const gridLines = [...document.querySelectorAll('.grid-line, [data-grid-line], #grid-layer line, #grid line')];
  const num = v => Math.round(parseFloat(v) * 100) / 100;
  const verticalGridXs = gridLines
    .filter(l => l.getAttribute('x1') === l.getAttribute('x2'))
    .map(l => num(l.getAttribute('x1')))
    .filter(Number.isFinite);
  const horizontalGridYs = gridLines
    .filter(l => l.getAttribute('y1') === l.getAttribute('y2'))
    .map(l => num(l.getAttribute('y1')))
    .filter(Number.isFinite);
  const axisCandidates = lines.filter(l => !l.classList.contains('grid-line'));
  const horizontalAxes = axisCandidates
    .filter(l => l.getAttribute('y1') === l.getAttribute('y2'))
    .map(l => ({y:num(l.getAttribute('y1')), len:Math.abs(num(l.getAttribute('x2'))-num(l.getAttribute('x1')))}))
    .sort((a,b) => b.len - a.len);
  const verticalAxes = axisCandidates
    .filter(l => l.getAttribute('x1') === l.getAttribute('x2'))
    .map(l => ({x:num(l.getAttribute('x1')), len:Math.abs(num(l.getAttribute('y2'))-num(l.getAttribute('y1')))}))
    .sort((a,b) => b.len - a.len);
  const nearest = (arr, v) => arr.length ? Math.min(...arr.map(x => Math.abs(x - v))) : Infinity;
  const xAxisY = horizontalAxes[0]?.y;
  const yAxisX = verticalAxes[0]?.x;
  return {
    xAxisY, yAxisX,
    xAxisGap: nearest(horizontalGridYs, xAxisY),
    yAxisGap: nearest(verticalGridXs, yAxisX),
    horizontalGridCount: horizontalGridYs.length,
    verticalGridCount: verticalGridXs.length
  };
}""")
assert alignment_check["xAxisGap"] <= 0.5, f"x轴未落在水平网格线上: {alignment_check}"
assert alignment_check["yAxisGap"] <= 0.5, f"y轴未落在垂直网格线上: {alignment_check}"
```

### 2.4 三向布局 CSS 骨架（**Agent 应直接套用**，避免落回 L1）

**L2 左栏（Controls 在左，Stage 在右）：**
```html
<main style="flex:1; display:flex; flex-direction:row; gap:20px; padding:20px;">
  <aside id="controls" style="width:26%; min-width:240px; display:flex; flex-direction:column; gap:16px;">
    <!-- 控件块 ≤ 5 个；禁止 overflow-y:auto -->
  </aside>
  <section id="stage" style="flex:1; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden;">
    <!-- 演示主体居中渲染 -->
  </section>
</main>
```

**L3 右栏（Stage 在左，Controls 在右）：**
```html
<main style="flex:1; display:flex; flex-direction:row; gap:20px; padding:20px;">
  <section id="stage" style="flex:1; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden;"></section>
  <aside id="controls" style="width:26%; min-width:240px; display:flex; flex-direction:column; gap:16px;"></aside>
</main>
```

**L1 底栏（Stage 上、Controls 下）：**
```html
<main style="flex:1; display:flex; flex-direction:column; gap:20px; padding:20px;">
  <section id="stage" style="flex:1; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden;"></section>
  <aside id="controls" style="height:120px; display:flex; flex-direction:row; align-items:center; gap:16px;"></aside>
</main>
```

**禁止**在以上任何 `aside#controls` 上加 `overflow-y:auto`；超量控件用 Tabs/Accordion 替代。

## 三、字号系统（Typography）

- H1 = **40px** / font-weight: 700 !important（禁止 42px 或其他值）
- H2 = 30px / font-weight: 600
- H3 = 28px / font-weight: 500
- Body = 28px / font-weight: 500
- Caption ≥ 22px / font-weight: 300
- 按钮字号 = 28px / font-weight: 500

## 四、与 html-authoring 通用规范的衔接

数学场景下，以下 html-authoring 通用规则**仍适用**：内容组织模式、交互粒度、事件绑定、媒体白名单、MathJax 3、技术约束、terminate 前需求落实度自检。

以下 html-authoring 通用规则**被本链路覆盖，禁止同时执行**：
- 「参考配色方案（5 个）」—— 数学必须用本目录 31 套色板
- 「根据学科选：数学-橙紫」—— 已由 pool A/B 替代
- 通用排版「标题为正文 1.5–2 倍」—— 改用第三节固定 px 字号
