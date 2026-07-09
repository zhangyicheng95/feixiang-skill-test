---
name: teaching-page-html-authoring-v3
description: >-
  K12 单页教学 HTML 全流程（v3 · 飞象最新圆角风）：① 素材（spec/manifest）→ ② 生成 index.html → ③ test 验收。
  飞象平涂描边风、圆角 16px。多页课件见 courseware-generator/SKILL.md。
---

# 单页教学 HTML（完整流程）

**Skill**：`html-authoring/`  
**模式**：`single`  
**产物**：`pages/<slug>/index.html`

---

## 目录结构

```
html-authoring/
├── SKILL.md           ← 本文件（唯一入口）
├── manifest.md        ← Step 1：spec、素材清单
├── guide.md           ← Step 2 生成规范
├── feixiang-style.md  ← Step 2 视觉（非数学）
└── math-design/       ← Step 2 数学专用
```

> 本 Skill 含 **素材 → 内容 → 验收** 三步，须按序执行完毕再交付。  
> 素材细则见 `manifest.md`；验收见 `test-html/SKILL.md`。

---

## 总流程

```
Step 1  生成素材   spec + assets-manifest.md
   ↓
Step 2  生成内容   pages/<slug>/index.html
   ↓
Step 3  进行 test  浏览器手测 + 验证结论卡
```

**禁止**：跳过 Step 1 直接写 HTML；未通过 Step 3 即宣称交付。

---

## Step 1：生成素材

Read `manifest.md`，按其中流程执行。

### 1.1 确认模式

- 用户要 **单页**（游戏 / 练习 / 海报 / 动画）→ 本 Skill，`mode: single`
- 用户要 **多页课件 / PPT / 翻页** → 改走 `courseware-generator/SKILL.md`

### 1.2 解析需求 → spec

从用户原文整理四字段（写入后续 `index.html` 的 `<!-- spec: ... -->`）：

```
requirements=用户硬要求逐条
require=必含元素
forbid=禁止项
core-loop=互动闭环（动词链，如：选题→提交→反馈→重置）
```

互动类须声明可手测的 **core-loop** 每一步。

### 1.3 素材清单

```
1. 定 slug（英文小写连字符，如 pythagoras-quiz）
2. 创建 pages/<slug>/
3. Write pages/<slug>/assets-manifest.md
```

| 规则 | 说明 |
|------|------|
| 图片/音频 | 真实 URL；禁止 base64 大图、禁止虚构占位路径 |
| 无外链素材 | 写明「CSS/SVG 自绘」，禁止空 manifest |

### 1.4 Step 1 自检

```
□ slug 已确定，pages/<slug>/ 已创建
□ spec 四字段已整理（含 core-loop）
□ assets-manifest.md 已 Write
```

---

## Step 2：生成内容

### 2.1 必读规范

| 文件 | 路径 |
|------|------|
| 生成规范 | `html-authoring/guide.md` |
| 视觉 | `html-authoring/feixiang-style.md` |
| 数学工作流 | `html-authoring/math-design/workflow.md` |
| 小学色板 | `html-authoring/math-design/color-palettes-a.md` |
| 初高中色板 | `html-authoring/math-design/color-palettes-b.md` |
| 数学视觉 | `html-authoring/math-design/visual-impact.md` |

**学科路由**（`guide.md` §学科路由）：

- **数学** → 必读 `math-design/`；HTML 首行 palette 注释
- **非数学** → 只读 `guide.md` + `feixiang-style.md`；**禁止**读 `math-design/`

### 2.2 执行

```
1. Read html-authoring/guide.md（数学另读 math-design/）
2. Read pages/<slug>/assets-manifest.md
3. Write pages/<slug>/index.html
   - <head> 内 <!-- spec: ... -->
   - 飞象风：平涂、描边、无 emoji、无卡片阴影
   - 每个按钮/交互须绑定事件，core-loop 可端到端触发
4. 对照 guide.md 交付自检
```

### 2.3 Step 2 自检

```
□ index.html 已 Write 到 pages/<slug>/
□ spec 注释与 Step 1 一致
□ core-loop 每步可触发
□ 素材来自 manifest（或已声明自绘）
□ 无 courseware-shell.js（单页不需要壳）
```

---

## Step 3：进行 test

见 `test-html/SKILL.md`。

```
1. Read test-html/SKILL.md
2. 按 must-cover 清单验证，输出验证结论卡
3. 未通过 → 回 Step 2 修复 → 再测
```

### Step 3 自检

```
□ 已 Read test-html/SKILL.md
□ core-loop 已验证
□ 验证结论卡已输出
□ 状态为 ✓ 或已说明遗留项
```

---

## 交付物清单

```
pages/<slug>/
├── index.html
└── assets-manifest.md
```

告知用户打开方式，例如：

```bash
cd pages/<slug> && python3 -m http.server 8765
# → http://127.0.0.1:8765/index.html
```
