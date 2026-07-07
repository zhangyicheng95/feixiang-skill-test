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

Phase 3 ┃ 随机选 1 套（⚠️ 禁止固定 A-01 / B-01）
  - 从 pool 均匀随机 1 个编号（A-01~A-11 或 B-01~B-20）
  - 过程输出标注 palette_id（如 A-07 / B-12）

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
  ③ terminate 前复读 HTML 首行，确认以 `<!-- html-authoring:math-design palette=` 开头
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

- **一屏优先级**：不产生全局滚动条为最高目标
- **布局公式**：Container(flex) = Header(fixed) + Stage(flex-grow:1 + overflow-y:auto) + Controls(flex-shrink:0)
- **弹性字号保护**：H1 基准 **40px**（禁止 42px）；必要时 `clamp(30px, 5vh, 40px)`
- **安全边界**：底部按钮（80px）上方保留 20px 间距

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
