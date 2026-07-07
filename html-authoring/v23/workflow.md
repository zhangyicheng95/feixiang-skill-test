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

Phase 3 ┃ 机械抽选 1 套（⚠️ 禁止主观挑选、禁止照搬示例编号、禁止任何「跳号」行为）

  **抽选池（完整覆盖，禁止排除任何编号）：**
  - pool A → `A-01, A-02, A-03, A-04, A-05, A-06, A-07, A-08, A-09, A-10, A-11`（11 套，**含 A-01**）
  - pool B → `B-01, B-02, ..., B-20`（20 套，**含 B-12**）
  - A-01 与 B-12 视觉等价但**仍各自参与抽选**，算式命中即采用

  **Step 1 — 计算 seed（必须在推理中写出完整算式，禁止跳过）**
  ```
  keyword = 用户 prompt 中最核心的数学知识点词（如「勾股定理」「鸡兔同笼」；无则取 prompt 前 6 字）
  hash = len(prompt) × 31 + len(keyword) × 7
  pool=A → seed = hash mod 11；palette_id = `A-{seed+1:02d}`
  pool=B → seed = hash mod 20；palette_id = `B-{seed+1:02d}`
  ```

  **Step 2 — 排序无关性硬约束（重要）**
  - 列表顺序（A-01 居首、B-12 居中）**仅用于索引映射**，不构成偏好或避忌
  - 严禁基于「示例用过 X」「A-01 看着稳妥」「灰黄太常见」等理由改选其它编号
  - 算式命中 A-01 / B-12 → **必须采用**，不得跳号
  - 算式命中其他编号 → **不得**改成 A-01 / B-12
  - 禁止 +1 偏移、禁止「重抽」、禁止主观替换

  **Step 3 — 声明输出（Phase 4 前必写）**
  `抽选：pool=B, len(prompt)=N, len(keyword)=M, hash=H, seed=S, palette_id=B-07`
  - HTML 首行注释中的 palette **必须与 Step 1 算式结果完全一致**

  **修改已有 HTML 时**：保留原 palette_id，不重新抽选（除非用户明确要求换配色，此时按相同算式重算）

Phase 4 ┃ 按需读取（禁止全量加载 31 套）
  - **必须使用 `call_skill` 返回的 `<skill-files>` 表中 CDN URL 原样 `read_url`**，禁止自行拼接路径
  - 附件路径可能为 `.../math-design/workflow.md` 或 `.../vN/workflow.md`（以 skill-files 表为准）
  - pool=A → 读取 color-palettes-a.md 中对应编号段落；pool=B → color-palettes-b.md
  - read visual-impact.md
  - 将选定色板的 hex **映射**为 CSS 变量：`--primary` `--secondary` `--accent` `--background` `--foreground`

Phase 5 ┃ 交付硬约束（**缺一即失败，禁止 terminate**）
  ① **palette 注释（最高优先级）**
     - `create_file` / `edit_file` 后，HTML **第一行**（`<!DOCTYPE html>` 之前）必须是：
       `<!-- html-authoring:math-design palette=A-07 -->`（替换为 Phase 3 实际 palette_id）
     - 禁止写在 `<head>` 内代替首行；禁止省略；禁止用其它格式
     - **未写入 → 必须 `edit_file` 补首行注释，然后才允许 terminate**
  ② 字号：H1 必须 40px / font-weight:700 !important；按钮高度 80px；按钮字号 28px
  ③ terminate 前确认 palette_id 与 Phase 3 算式结果完全一致（含 A-01 / B-12 命中场景）
  ④ Stage 主演示容器中心与 Stage 几何中心可视化对齐（见第二节「Stage 居中硬约束」）
  ⑤ Controls 已按第二节「布局变体」三种之一放置，**禁止默认底栏**而未声明变体
```

## 一、视觉硬性要求 (Visual Identity)

- 可视区域参考比例：16:7，优先一屏展示所有交互
- 内容超屏时：Step Navigation 或 Card Tab 切换；允许 Stage 区局部滚动
- 演示图示必须通过色彩填充保持视觉冲击力（遵循 visual-impact.md）
- 按钮统一高度：**80px**
- 页面采用 safe area 安全高度设计
- grid 仅用于模块，不用于锁死整体高度
- 禁止标题前 Emoji；具体元素用 SVG 绘制，配色符合选定色板

## 二、布局硬性约束 (Visual & Layout Constraints)

### 2.1 基础公式
- **一屏优先级**：不产生全局滚动条为最高目标
- **基础公式**：Container(flex) = Header(fixed) + Body(flex-grow:1) + Controls(flex-shrink:0)
  - **Body** 至少包含 Stage（演示区）；Controls 的位置由「布局变体」决定
- **弹性字号保护**：H1 基准 **40px**（禁止 42px）；必要时 `clamp(30px, 5vh, 40px)`

### 2.2 布局变体（**必选 1 种，禁止默认底栏未声明**）

| 变体 | 结构 | Controls 位置 | 适用场景 |
|---|---|---|---|
| **L1 底栏** | Header → Stage → Controls(bottom) | 底部 | 步骤导航、按钮 ≥3、控件以「上一步/下一步/重置」为主 |
| **L2 左栏** | Header → [Controls(left) ‖ Stage] | 左侧 | 滑块/参数调节为主、几何探索（如平移/旋转/缩放）、左侧列表选择 |
| **L3 右栏** | Header → [Stage ‖ Controls(right)] | 右侧 | 演示主导、辅助参数面板（公式/数值/单选）、信息说明类 |

**选择算法（机械，必须在推理中写出）：**
```
layout_hash = (len(prompt) × 3 + len(keyword) × 5) mod 3
layout = ["L1底栏", "L2左栏", "L3右栏"][layout_hash]
```

**例外覆盖规则（仅以下情形允许偏离算式）：**
- 控件数 ≥ 6 且无滑块/数值输入 → 强制 **L1 底栏**
- 主控件为滑块/数值/单选（≥ 2 个）且 Stage 内容偏正方形 → 强制 **L2** 或 **L3**（按算式取其一）
- 必须在推理中显式声明：「算式命中 LX；因 <例外条件> → 改为 LY」

**Controls 尺寸约束：**
- L1：高度 ≥ 100px（按钮 80px + 上下边距），横向 flex
- L2 / L3：宽度 ≤ 28% 视口宽，按钮高 **80px** 不变，纵向 flex
- 三种变体均保留按钮 80px、按钮字号 28px、按钮上方 20px 安全边距

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
