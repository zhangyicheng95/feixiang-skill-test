---
name: teaching-page-courseware-generator
description: >-
  K12 多页课件 HTML 全流程：① 素材（spec/outline/manifest）→ ② 生成 index.html+壳
  → ③ test 验收。飞象风、960×540、逐题测验。单页见 html-authoring/SKILL.md。
---

# 多页课件 HTML（完整流程）

**Skill**：`courseware-generator/`  
**模式**：`multi`  
**产物**：`pages/<slug>/index.html` + `pages/<slug>/courseware-shell.js`

> 本 Skill 含 **素材 → 内容 → 验收** 三步，须按序执行完毕再交付。  
> 细则：`assets/SKILL.md`（素材）、`test-html/SKILL.md`（验收）。

---

## 总流程

```
Step 1  生成素材   spec + outline.md + assets-manifest.md
   ↓
Step 2  生成内容   index.html + courseware-shell.js
   ↓
Step 3  进行 test  浏览器手测 + 验证结论卡
```

**禁止**：跳过 Step 1 直接写 HTML；未通过 Step 3 即宣称交付。

---

## Step 1：生成素材

### 1.1 确认模式

- 用户要 **多页 / 课件 / PPT / 翻页 / 缩略图** → 本 Skill，`mode: multi`
- 用户要 **单页** → 改走 `html-authoring/SKILL.md`

### 1.2 解析需求 → spec

```
requirements=用户硬要求逐条
require=必含页型/互动（封面、讲解、练习…）
forbid=禁止项（emoji、滚动堆题…）
core-loop=各互动页闭环（如 P8 选题→确认→解析→下一题）
```

### 1.3 大纲 outline.md

```
1. Read assets/outline-guidance.md
2. Write pages/<slug>/outline.md
   - 逐页表：页码 / 页类型 / 内容要点 / 交互设计
   - 标注 core-loop 所在页
3. 用户确认后继续（未确认不进入 Step 2）
```

**页型最低标准**：见 `courseware-generator/content-guide.md` §五。

### 1.4 素材清单

```
Write pages/<slug>/assets-manifest.md
```

| 规则 | 说明 |
|------|------|
| 图片/音频 | 真实 URL；禁止 base64 |
| 无外链 | 写明 CSS/SVG 自绘 |

### 1.5 Step 1 自检

```
□ pages/<slug>/ 已创建
□ spec 四字段 + 各页 core-loop 已整理
□ outline.md 已 Write 且已确认
□ assets-manifest.md 已 Write
```

---

## Step 2：生成内容

### 2.1 必读规范

| 文件 | 路径 |
|------|------|
| 总览 | `courseware-generator/guide.md` |
| 内容生成 | `courseware-generator/content-guide.md` |
| 样式格式 | `courseware-generator/style-guide.md` |
| 视觉 | `courseware-generator/feixiang-style.md` |
| 选择题 | `courseware-generator/quiz-patterns.md` |
| 预览壳 | `courseware-generator/courseware-shell.js` |

### 2.2 执行

```
1. Read guide.md + content-guide.md（从步骤 0 起）+ style-guide.md
2. Read pages/<slug>/outline.md + assets-manifest.md
3. Write pages/<slug>/index.html
   - <template class="page-shared"> 共享样式（含 --canvas-bg）
   - <template class="page-data" data-id="1..N"> 逐页注入
   - 严格对照 outline，不得漏页
   - 互动页 postMessage saveState / restoreState
4. 复制 courseware-generator/courseware-shell.js
   → pages/<slug>/courseware-shell.js
5. <script src="./courseware-shell.js"></script> 在 index.html 末尾
```

### 2.3 HTML 硬要点

- 画布 **960×540**；`page-shared` 声明 `--canvas-bg`（`feixiang-style.md` §4.6）
- **同页多题** = 逐题切换，禁止滚动堆题（`quiz-patterns.md`）
- 选择题：**选题 → 确认答案 → 对错+解析 → 下一题**（`explain` + `revealed`）
- 缩略图侧栏由壳渲染，**禁止手写壳代码**

### 2.4 Step 2 自检

```
□ 逐页对照 outline.md，无遗漏
□ index.html 与 courseware-shell.js 同目录
□ 单选/多选符合 quiz-patterns.md
□ 互动页 saveState / restoreState 已接
□ page-shared 含 --canvas-bg
```

---

## Step 3：进行 test

> 细则：`test-html/guide.md`

### 3.1 执行

```
1. Read test-html/guide.md
2. 从 spec / outline / core-loop 抽 must-cover 清单
3. browser_navigate → pages/<slug>/index.html（HTTP 服务）
4. 手测：
   - 壳加载、缩略图、翻页
   - 各页 core-loop（尤其练习页）
   - 翻页离开再回来 → 状态恢复
5. 输出验证结论卡
6. 未通过 → 回 Step 2 修复 → 再测
```

### 3.2 闸门

- **core-loop 未测通** → 不得交付
- **壳未加载 / 缩略图空白** → 不得交付
- **逐题测验未出解析** → 不得交付

### 3.3 验证结论卡（必填）

```
## 验证结论
- 状态：✓ / ⚠ / ✗
- 需求覆盖：N/M 项
  - [1] 壳加载 + 翻页：✓ / ✗
  - [2] <core-loop 页>：✓ / ✗
- 下一步：修复 / 补测 / 交付
```

### 3.4 Step 3 自检

```
□ 已 Read test-html/guide.md
□ 壳 + 翻页 + 至少一条 core-loop 已手测
□ 验证结论卡已输出
```

---

## 交付物清单

```
pages/<slug>/
├── index.html
├── courseware-shell.js
├── outline.md
└── assets-manifest.md
```

告知用户打开方式：

```bash
cd pages/<slug> && python3 -m http.server 8765
# → http://127.0.0.1:8765/index.html
```
