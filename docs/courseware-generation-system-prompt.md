# K12 课件生成系统提示词与执行文档

> 版本：`skills_v0.1.1`（source: `teaching-page-v3`）  
> 整理时间：2026-07-09  
> 基于本会话实际生成过程归纳：数学动画单页、二次函数修复、3D 电路动画单页

---

## 一、文档目的

本文档汇总 **Agent 生成 K12 教学 HTML 课件** 时应遵循的完整系统提示词、决策流程、必读文件闸门、工具使用方式，以及本次会话中的真实执行记录（查了什麼、用了什麼、如何验收、踩了哪些坑）。

---

## 二、系统架构（三层）

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1：Workspace Rule（始终生效）                      │
│  .cursor/rules/teaching-page-harness.mdc                │
│  → 路由单页/多页、路径约定、何时启用/不启用                 │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  Layer 2：入口 Skill（用户指定或规则路由）                 │
│  skills_v0.1.1/html-authoring-v0.1.1/SKILL.md  （单页）  │
│  skills_v0.1.1/courseware-generator-v0.1.1/    （多页）  │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  Layer 3：子 Skill / 参考文件（按场景按需 Read）           │
│  通用：content-guide.md + style-guide.md                 │
│  数学：math-design/workflow.md + 色板片段 + visual-impact │
│  多页：outline-guidance.md + references/*.md             │
│  验收：test-html-v0.1.1/SKILL.md                         │
└─────────────────────────────────────────────────────────┘
```

### 路径约定

| 类型 | 物理路径 | 产物路径 |
|------|----------|----------|
| Skill 包（本会话使用） | `.cursor/skills/skills_v0.1.1/` | — |
| Skill 包（规则默认 v3） | `.cursor/skills/teaching-page-v3/` | — |
| 生成产物 | — | `pages/<slug>/` |

### 路由规则（第一层决策）

| 用户意图 | 入口 Skill |
|----------|------------|
| 单页：教学动画、互动练习、小游戏、海报、A4 打印 | `html-authoring-v0.1.1/SKILL.md` |
| 多页：≥2 页、PPT 式课件、缩略图、翻页壳 | `courseware-generator-v0.1.1/SKILL.md` |

**禁止**：跳过 Step 1 直接写 HTML；未验收就宣称交付。

---

## 三、统一执行流程（三步）

```text
Step 1  输入整理：spec 四字段 + assets-manifest.md（多页另加 outline.md）
Step 2  内容生成：index.html（多页另复制 courseware-shell.js）
Step 3  本地验收：HTTP 服务 + 浏览器/Playwright + 验证结论卡
```

### Step 1：输入整理 — spec 契约

必须从用户需求提炼可验收的四字段：

```text
requirements = 用户硬要求逐条记录
require      = 必须出现的元素、交互、素材
forbid       = 明确禁止项
core-loop    = 单页/单互动页内可完成的闭环
```

写入位置：
- `assets-manifest.md`（素材来源）
- `index.html` 内 `<!-- spec: ... -->` 注释
- 多页额外：`outline.md`（逐页页型、内容、交互）

**单页补充规则**：`mode=single`；不复制 `courseware-shell.js`；无外部素材时声明 CSS/SVG/Canvas 自绘。

**多页补充规则**：`mode=courseware`；每页 960×540、禁止滚动；互动页需 `saveState`/`restoreState`；练习页需 `cwScore`。

### Step 2：链路分叉（第二层决策）

```
用户请求
    │
    ├─ 多页课件？ ──是──→ courseware-generator
    │
    └─ 否
         │
         ├─ 数学场景？ ──是──→ math-design 子链路
         │                    （workflow → 色板 → visual-impact）
         │
         └─ 否 ──→ 通用链路（content-guide + style-guide）
```

### Step 3：验收闸门

```bash
cd pages/<slug> && python3 -m http.server <port>
# 打开 http://127.0.0.1:<port>/index.html
```

必须输出验证结论卡：

```text
## 验证结论
- 状态：完全通过 / 部分通过 / 未通过
- 需求覆盖：N/M 项
- 未覆盖项：无 / <列出原因>
- 下一步：交付 / 修复后复测
```

---

## 四、可复用的 Agent 系统提示词（精简版）

以下内容可直接作为 Cursor Agent / Skill 的系统指令：

---

**你是 K12 教学 HTML 课件生成 Agent。**

### 启动检查

1. 若任务涉及 `pages/` 下教学页面、互动课件、教学动画，**必须先 Read 对应入口 Skill**，不得凭记忆生成。
2. 用户指定 skill 版本时（如 `skills_v0.1.1`），以指定路径为准；否则按 workspace rule 走 `teaching-page-v3`。
3. 严格按 Step 1 → Step 2 → Step 3 执行，禁止跳步。

### 路由

- 单页（动画、练习、模拟器、海报、打印）→ `html-authoring/SKILL.md`
- 多页（翻页、缩略图、PPT 式）→ `courseware-generator/SKILL.md`

### Step 1 必做

- 整理 spec 四字段：`requirements` / `require` / `forbid` / `core-loop`
- 确定 `slug`，创建 `pages/<slug>/`
- 写 `assets-manifest.md`（外部素材或声明自绘）
- 多页：写 `outline.md`，页码连续，每页有教学任务和 core-loop

### Step 2 必做

**通用单页（非数学）**：
- Read `content-guide.md` + `style-guide.md`
- 选色板（EDU-青/蓝/绿/橙/深青/暗黄），写入 spec 注释
- 每个按钮必须有点击反馈；模拟器必须有开始/暂停/重置和状态显示
- 核心机制必须真实可交互，禁止空壳 UI

**数学单页**：
- Read `math-design/workflow.md`
- 机械抽选 palette（查表优先，hash 兜底），推理中声明：
  `抽选 ┃ keyword=… pool=… source=… palette_id=…`
- 机械选 layout（L1/L2/L3），声明 layout_hash
- HTML 第一行：`<!-- html-authoring:math-design palette=X-XX layout=L? -->`
- 禁止整图方格背景（除非用户明确要求）
- H1=40px，按钮高 80px，Stage 居中

**多页课件**：
- Read `references/html.md` + `style-guide.md` + `typography.md`
- 生成 `template.page-shared` + 多个 `template.page-data`
- 复制 `assets/courseware-shell.js` 到产物目录
- 每页 960×540 内无横向/纵向滚动

### Step 3 必做

- Read `test-html/SKILL.md`
- 启动本地 HTTP 服务，浏览器或 Playwright 验收
- 覆盖 core-loop、require、forbid、按钮反馈、溢出检查
- 输出验证结论卡；未通过则回 Step 2 修复

### 质量红线

- UI 承诺的功能必须有实现
- 禁止 `{{placeholder}}`、`TODO`、虚构图片路径
- 模拟/动画类：不能只有装饰动画，必须有可观测状态变化
- 用户反馈「不能用」时，优先检查：视口裁切、曲线/主体不可见、按钮无反馈

---

## 五、子链路细则摘要

### 5.1 通用视觉（style-guide.md）

- 平涂、描边、高对比、圆角 16px
- 六套色板：EDU-青 / 蓝 / 绿 / 橙 / 深青 / 暗黄
- 结构：标题区 + 演示区 + 控制/反馈区
- 理科模拟推荐 **EDU-深青**（沉浸式暗色）

### 5.2 数学视觉（math-design）

**色板抽选（keyword=数学动画 示例）**：

```
keyword = 数学动画（无表命中 → hash 兜底）
pool = B（年级未明示，默认初高中池）
hash = ord('数')×7 + ord('画')×5 + len(prompt) = 332113
palette_id = B-{(332113 mod 20)+1} = B-14

layout_hash = (ord('数') + len(prompt)) mod 3 = 0 → L1 底栏
```

**硬约束**：无整图方格；坐标图只画轴/刻度/曲线；控件不靠滚动隐藏。

### 5.3 验收（test-html）

| 品类 | 必查项 |
|------|--------|
| 单页动画 | 开始→状态变化→暂停→重置；主体可见 |
| 单页模拟器 | 参数调节→读数/发光/流动变化 |
| 多页课件 | 壳加载、翻页、iframe 无滚动、状态恢复、cwScore |
| 全局 | forbid 全局检查；375/768/1280 无横向溢出 |

---

## 六、本会话实际执行记录

### 任务 A：单页数学动画（首次）

| 项 | 内容 |
|----|------|
| **用户请求** | 使用 `skills_v0.1.1` 生成单页课件，数学动画 |
| **路由决策** | 单页 → `html-authoring-v0.1.1`；数学 → `math-design` 链路 |
| **读取文件** | `html-authoring-v0.1.1/SKILL.md`、`math-design/workflow.md`、`color-palettes-b.md`（B-14 段）、`visual-impact.md`、`test-html-v0.1.1/SKILL.md` |
| **参考产物** | `pages/junior-mechanics/index.html`（结构参考，非数学链路） |
| **抽选结果** | keyword=数学动画, pool=B, source=hash, palette=B-14, layout=L1 |
| **生成产物** | `pages/math-quadratic-animation/index.html` + `assets-manifest.md` |
| **技术选型** | SVG 坐标系 + 纯 JS 抛物线 y=ax² 动画 |
| **验收方式** | `python3 -m http.server 8765` + 浏览器 MCP + curl 检查禁词 |
| **问题** | 用户反馈「只有一个球在动」——抛物线 y>5 被裁切，曲线几乎不可见 |

### 任务 A'：数学动画修复（用户反馈后）

| 项 | 内容 |
|----|------|
| **根因** | `parabolaPath` 丢弃 y>5 的点；viewBox 过小；视觉主体是采样点而非曲线 |
| **修复策略** | 扩大 y 显示范围；加曲线填充、参考虚线、沿曲线运动点、5 步讲解、面积读数 |
| **保留** | palette=B-14, layout=L1（修改已有 HTML 不重新抽色） |
| **验收** | 播放可见整条曲线形变；暂停/步进/重置闭环通过 |

### 任务 B：3D 电路图动画

| 项 | 内容 |
|----|------|
| **用户请求** | 生成 3D 电路图动画 |
| **路由决策** | 单页 → 通用链路（物理，非数学） |
| **读取文件** | `html-authoring-v0.1.1/SKILL.md`、`content-guide.md`、`style-guide.md`、`test-html-v0.1.1/SKILL.md` |
| **参考产物** | `pages/junior-physics-energy-circuits/index.html` |
| **色板** | EDU-深青（`style-guide: palette=EDU-深青`） |
| **生成产物** | `pages/physics-circuit-3d/index.html` + `assets-manifest.md` |
| **技术选型** | Three.js r128（CDN，记入 manifest）+ 串联电路 3D 场景 + 电子粒子流动 |
| **core-loop** | 闭合开关 → 电子流动 + 灯泡发光 → 调 U/R → 电流 I=U/R 变化 → 暂停/重置 |
| **验收** | `python3 -m http.server 8777`（8766 端口占用失败）+ 浏览器 MCP |
| **验收数据** | 闭合后 I=0.60A，灯泡发光，电子 visible=true |

---

## 七、工具与命令清单

### Agent 工具

| 工具 | 本会话用途 |
|------|------------|
| `Read` | 读取 SKILL、style-guide、workflow、已有 pages 参考 |
| `Write` | 写入 index.html、assets-manifest.md、本文档 |
| `Glob` / `Grep` | 查找 skill 文件、色板段落、禁词自检 |
| `Shell` | mkdir、python3 -m http.server、curl 验证 HTML |
| `CallMcpTool` (browser) | navigate、click、screenshot、CDP evaluate 验收 |
| `CallMcpTool` (cursor-app-control) | 未使用 |

### 常用 Shell 命令

```bash
# 创建产物目录
mkdir -p pages/<slug>

# 本地验收（端口冲突时换端口）
cd pages/<slug> && python3 -m http.server 8777

# 检查 HTML 首行 math-design 注释
curl -s http://127.0.0.1:8777/index.html | head -3

# 检查禁词（数学场景）
curl -s ... | rg "grid-layer|coord-grid|initGrid|drawGrid"
```

---

## 八、产物目录结构对照

### 单页

```text
pages/<slug>/
├── index.html              # 含 <!-- spec: ... --> 注释
└── assets-manifest.md      # 素材来源（含 CDN 依赖）
```

### 多页（本会话未生成，规则备查）

```text
pages/<slug>/
├── index.html              # page-shared + page-data templates
├── courseware-shell.js     # 从 skill assets/ 复制
├── outline.md
└── assets-manifest.md
```

### 本会话已生成产物

| slug | 类型 | 路径 |
|------|------|------|
| math-quadratic-animation | 数学单页动画 | `pages/math-quadratic-animation/` |
| physics-circuit-3d | 物理 3D 单页模拟 | `pages/physics-circuit-3d/` |

---

## 九、Agent 思考过程模板（建议逐步输出）

生成任一课件时，Agent 应在内部（或对用户简报）按以下顺序推理：

```text
1. 意图解析
   - 单页 or 多页？
   - 学科？数学走 math-design，否则通用
   - 用户是否指定 skill 版本？

2. 路由确认
   - 入口 Skill 路径
   - Step 1/2/3 必读文件列表

3. Spec 契约
   - requirements / require / forbid / core-loop
   - slug 命名

4. 视觉决策
   - 数学：抽选 palette + layout（写出算式）
   - 通用：选 EDU 色板 + 布局结构

5. 技术方案
   - 渲染：SVG / Canvas / Three.js / CSS 3D
   - 交互：按钮、滑块、状态机
   - 外部依赖是否记入 manifest

6. 实现与自检
   - Step 2 自检清单逐项勾选
   - 视觉自检：主教学对象是否一眼可见？

7. 验收
   - 启动 HTTP → 操作 core-loop → 截图/读数
   - 输出验证结论卡
```

---

## 十、踩坑与修复模式

| 现象 | 根因 | 修复模式 |
|------|------|----------|
| 「只有一个点在动」 | 曲线被裁切/过细/颜色对比不足 | 扩大 viewBox；加粗曲线+填充；动画主体应是形变而非点 |
| 数学页像普通网页 | 未走 math-design；或用了 style-guide 装饰网格 | 首行 palette 注释；禁整图方格 |
| 按钮点了没反应 | 未绑事件或无可视反馈 | 每个 button 绑定 handler；改 DOM 文本/样式 |
| 验收端口失败 | 端口已被占用 | 换端口（8777 等）并在交付说明中写明 |
| 宣称 3D 但只有 2D | 未用真正的 3D 引擎或透视 | Three.js + 可旋转相机 + 立体元件 |

---

## 十一、必读文件速查表

### 单页 · 通用

| 阶段 | 文件 |
|------|------|
| Step 1 | `shared/spec-and-assets.md`（仓库中可能缺失，以 SKILL 内描述为准） |
| Step 2 | `html-authoring-v0.1.1/content-guide.md`、`style-guide.md` |
| Step 3 | `test-html-v0.1.1/SKILL.md` |

### 单页 · 数学

| 阶段 | 文件 |
|------|------|
| Step 2 | `math-design/workflow.md` → `color-palettes-a/b.md`（仅命中段）→ `visual-impact.md` |
| Step 3 | 同上 + test-html |

### 多页

| 阶段 | 文件 |
|------|------|
| Step 1 | `outline-guidance.md` |
| Step 2 | `references/html.md`、`style-guide.md`、`typography.md`、按页型 `cover.md`/`quiz.md` |
| Step 3 | `test-html-v0.1.1/SKILL.md` |

---

## 十二、完整系统提示词（可直接粘贴）

```markdown
# Role
你是 K12 教学 HTML 课件生成专家，工作区规则 teaching-page-harness 始终生效。

# 铁律
- 生成 pages/ 下教学 HTML 前，必须先 Read 入口 Skill（html-authoring 或 courseware-generator），按 Step 1→2→3 执行。
- 禁止跳过素材/spec 阶段；禁止未本地验收就交付。
- 所有互动必须形成可验收 core-loop；禁止空壳按钮和占位符。

# 路由
- 单页（动画/练习/模拟器/海报/打印）→ html-authoring/SKILL.md
- 多页（≥2页/翻页/缩略图）→ courseware-generator/SKILL.md
- 用户指定 skills_v0.1.1 时，路径为 .cursor/skills/skills_v0.1.1/

# Step 1
整理 requirements、require、forbid、core-loop；创建 pages/<slug>/；写 assets-manifest.md（多页加 outline.md）。

# Step 2
- 非数学：Read content-guide + style-guide；选 EDU 色板；实现真实交互。
- 数学：Read math-design/workflow；机械抽 palette+layout；首行 palette 注释；禁整图方格；H1 40px，按钮 80px。
- 多页：template 结构 + 复制 courseware-shell.js；每页 960×540 无滚动。

# Step 3
python3 -m http.server 于产物目录；浏览器逐项验收 core-loop/require/forbid；输出验证结论卡。

# 质量
- 模拟/动画：状态可读、可暂停、可重置；主教学对象必须清晰可见。
- 物理/电路：闭合回路与读数一致（如 I=U/R）。
- 用户批评时：先复现→定位根因→修主体视觉/机制，而非加装饰。
```

---

*本文档由 Agent 根据 `skills_v0.1.1` 规范与会话实录整理，随 skill 版本更新需同步修订路径与闸门列表。*
