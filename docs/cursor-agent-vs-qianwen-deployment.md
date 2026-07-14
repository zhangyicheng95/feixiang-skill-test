# Cursor Agent 与自部署千问对接：差异说明

> 版本：v1.0  
> 日期：2026-07-09  
> 关联文档：[courseware-generation-system-prompt.md](./courseware-generation-system-prompt.md)

---

## 一、文档目的

说明在 **K12 课件生成** 场景下，使用 **Cursor IDE Agent**（本仓库 Skill 调试环境）与 **自部署对接千问（Qwen）模型** 的本质区别、能力边界，以及如何让千问侧逼近 Cursor Agent 的交付质量。

---

## 二、一句话对比

| 维度 | Cursor Agent | 自部署千问（典型） |
|------|--------------|------------------|
| **本质** | 模型 + Agent 运行时 + 工具链 | 模型 API + 自研编排（若有） |
| **默认输出** | 仓库内可运行产物 + 验收结论 | 文本/HTML 片段（需自行落盘） |
| **规范执行** | Rule + Skill 闸门 + 工具强制读文件 | 依赖 prompt / RAG，遵守率不稳定 |
| **可控性** | 模型版本由 Cursor 调度 | 模型版本、成本、内网合规完全自控 |

**核心结论**：差异不在「谁更会写 HTML」，而在 **有没有 Agent 运行时把 Skill 文档变成「读→写→跑→验→改」的闭环**。

---

## 三、架构对比

### 3.1 Cursor Agent 架构

```text
用户自然语言请求
        │
        ▼
┌───────────────────┐
│ Workspace Rule    │  teaching-page-harness.mdc（始终生效）
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ 入口 Skill        │  html-authoring / courseware-generator
│ Step 1→2→3       │
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ 工具层            │  Read / Write / Shell / Grep / Browser MCP
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ 产物 + 验收       │  pages/<slug>/ + HTTP + 浏览器/Playwright
└───────────────────┘
```

### 3.2 自部署千问（常见形态）

```text
用户 prompt + system prompt（Skill 摘要）
        │
        ▼
┌───────────────────┐
│ 千问 API          │  qwen-max / qwen-plus / 私有化权重
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ 返回文本          │  HTML / Markdown / JSON
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ 后续处理（可选）   │  落盘 / 人工验收 / 二次调用
└───────────────────┘
```

### 3.3 自部署千问（目标形态 — 与 Cursor 对齐）

```text
用户请求
        │
        ▼
┌───────────────────┐
│ 编排器 Orchestrator│  强制 Step 1→2→3，禁止跳步
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ 千问 + 工具调用    │  读 Skill、写文件、跑命令、Playwright
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ 验收门禁          │  core-loop 不通过 → 自动重试或回修
└───────────────────┘
```

---

## 四、能力逐项对比

| 能力 | Cursor Agent | 千问 · 典型 API | 千问 · 加编排后 |
|------|:------------:|:---------------:|:---------------:|
| 读取 Skill 全文并按闸门执行 | ✅ | ⚠️ prompt 约束 | ✅ 工具读文件 |
| 写入 `pages/<slug>/index.html` | ✅ | ❌ 需自建 | ✅ |
| 写 `assets-manifest.md` / `outline.md` | ✅ | ❌ 需自建 | ✅ |
| 参考仓库已有课件 | ✅ Grep/Read | ❌ 需 RAG | ✅ |
| 启动本地 HTTP 服务 | ✅ Shell | ❌ 需自建 | ✅ |
| 浏览器点击验收 core-loop | ✅ Browser MCP | ❌ 需 Playwright | ✅ |
| 数学 palette 机械抽选（hash） | ✅ 可按 workflow 算 | ⚠️ 易主观选色 | ✅ 编排器算好注入 |
| 用户反馈后同上下文改代码 | ✅ 多轮对话 | ⚠️ 看会话设计 | ✅ |
| 模型版本固定 | ❌ Cursor 调度 | ✅ | ✅ |
| 数据不出内网 | ⚠️ 看 Cursor 策略 | ✅ 私有化 | ✅ |
| 单次调用成本可控 | ⚠️ | ✅ | ✅ |
| 批量并发生产 | ⚠️ 人工对话 | ✅ API 并发 | ✅ |

图例：✅ 原生支持 · ⚠️ 不稳定/需额外设计 · ❌ 默认没有

---

## 五、同一套 Skill，执行差异

本仓库 Skill 包（如 `skills_v0.1.1`）**两边可以共用同一份文档**，但执行保障不同：

### 5.1 Cursor Agent 如何保障

1. **Workspace Rule** 自动注入，命中 `pages/**/*.html` 即启用教学页流程。
2. **Skill 闸门**：明文要求「Step 2 前必须 Read content-guide / math-design」。
3. **工具强制**：不是「记得读」，而是 `Read` 工具真实打开文件。
4. **实测验收**：能点「播放」「开关」，能读电流表 DOM，能截图确认 3D 场景。
5. **反馈闭环**：用户说「只有一个球在动」→ 读代码 → 定位 viewBox 裁切 → 重写。

### 5.2 千问 API 常见失误（无编排时）

| 失误 | 原因 |
|------|------|
| 跳过 `assets-manifest.md` | 单次生成，无 Step 1 硬门槛 |
| 数学页铺整图方格 | 未读 math-design 禁令，或 prompt 过长被忽略 |
| 按钮无点击事件 | 只生成视觉壳，无 core-loop 验收 |
| 宣称 3D 实际 2D | 无浏览器验收 |
| palette 总用 A-01/B-12 | 未执行机械抽选算式 |
| 多页课件漏 `courseware-shell.js` | 未走复制步骤 |

---

## 六、会话实录：同一需求下的差异体现

以下为本仓库真实生成过程，用来说明 **Agent 闭环** 的价值。

### 案例 1：数学动画 — 首次交付不合格

| 步骤 | Cursor Agent 实际行为 |
|------|----------------------|
| 路由 | 单页 → math-design 链路 |
| 抽选 | keyword=数学动画, palette=B-14, layout=L1 |
| 产物 | `pages/math-quadratic-animation/` |
| 验收 | HTTP + 浏览器点击通过 |
| 用户反馈 | 「只有一个球在坐标系里动」 |
| 根因 | 抛物线 y>5 被裁切，曲线不可见 |
| 修复 | 扩大视口、加填充/参考线/分步讲解，再验收 |

**千问典型 API**：若无验收与用户反馈环节，可能一直交付「能打开但看不清曲线」的页面。

### 案例 2：3D 电路动画

| 步骤 | Cursor Agent 实际行为 |
|------|----------------------|
| 路由 | 单页 → 通用链路，EDU-深青色板 |
| 技术 | Three.js CDN + 电子粒子 + I=U/R |
| 产物 | `pages/physics-circuit-3d/` |
| 验收 | 闭合开关后 I=0.60A，灯泡发光，截图确认 |

**千问典型 API**：可能生成静态电路图或 2D 示意，除非 prompt 极强且有多轮修补。

---

## 七、成本与合规

| 维度 | Cursor Agent | 自部署千问 |
|------|--------------|------------|
| **计费** | Cursor 订阅 + 模型用量 | 按 token / 实例，可预估 |
| **模型选择** | 用户不直接选千问型号 | 可选 qwen-max、qwen-plus、微调模型 |
| **数据路径** | 经 Cursor 与模型服务商 | 可全内网 DashScope 私有化 / 自建推理 |
| **审计** | 依赖 Cursor 日志 | 可自建全链路日志 |
| **适用** | Skill 研发、快速试错、研发态 | 生产批量、合规敏感、固定版本 |

---

## 八、千问侧对齐 Cursor 的落地清单

若希望自部署千问达到接近 Cursor Agent 的课件质量，建议实现以下 **最小能力集**：

### 8.1 编排层（必须）

```text
□ 解析用户意图 → 单页/多页路由
□ 强制 Step 1：输出 spec 四字段 + assets-manifest（多页 + outline）
□ 强制 Step 2：按路由注入对应 Skill 片段（非全文堆砌）
□ 强制 Step 3：验收不通过禁止标记交付
□ 支持多轮：携带已有 index.html 做定向修改
```

### 8.2 工具层（强烈建议）

```text
□ read_file(path)        — 读 Skill、读已有 pages
□ write_file(path, content) — 写产物
□ run_command(cmd)     — python3 -m http.server、playwright
□ search_repo(query)     — 参考已有课件
□ browser_test(url, steps) — 点击按钮、断言文本变化
```

### 8.3 Prompt 注入策略

| 场景 | 注入内容 | 不要注入 |
|------|----------|----------|
| 单页通用 | content-guide + style-guide 摘要 | 全文 31 套数学色板 |
| 单页数学 | workflow + 单个 palette 段落 | 全部 color-palettes-a/b |
| 多页 | html.md + outline.md 产物 | 无关学科 style |

### 8.4 验收门禁（必须）

```text
□ 页面可 HTTP 打开
□ core-loop 端到端（非仅元素存在）
□ forbid 全局检查（禁词、虚构路径）
□ 375 / 768 / 1280 无横向溢出
□ 多页：iframe 无滚动、cwScore 可捕获
□ 输出验证结论卡（通过/未通过/未覆盖项）
```

### 8.5 失败重试策略

```text
验收失败 → 将「失败现象 + 相关代码片段」喂回千问 → 仅修 Step 2
连续 2 次失败 → 降级为人工审核，不自动交付
```

---

## 九、推荐分工

| 阶段 | 推荐方案 |
|------|----------|
| Skill 编写与调试 | Cursor Agent + 本仓库 `skills_v0.1.1` |
| 单次复杂课件、需大量试错 | Cursor Agent |
| 生产批量生成（同模板、同学科） | 千问 API + 编排器 + Playwright |
| 内网/涉敏数据 | 千问私有化 |
| 质量抽检 | 共用 test-html 验收脚本 |

---

## 十、对接千问的 system prompt 模板（精简）

可直接作为千问 system 消息，配合编排器使用：

```markdown
你是 K12 教学 HTML 生成服务，必须配合外部编排器执行 Step 1→2→3。

【路由】
- 单页 → html-authoring 规范
- 多页 → courseware-generator 规范
- 数学 → math-design（palette 由编排器传入，禁止自选）

【输入】
编排器会提供：spec 四字段、已选 palette/layout、相关 Skill 片段。

【输出】
- Step 1：JSON spec + assets-manifest 内容（多页含 outline）
- Step 2：完整 index.html 源码（不要省略、不要占位符）
- 禁止输出「已完成」类结论，验收由编排器执行

【质量】
- 每个 button 必须有点击逻辑和可见反馈
- 模拟/动画必须有状态读数，不能只有装饰动效
- 数学页禁止整图方格背景（除非用户明确要求）
- 多页必须含 courseware-shell.js 引用说明（由编排器复制）

【禁止】
{{placeholder}}、TODO、虚构图片 URL、无事件空壳按钮
```

---

## 十一、相关文件索引

| 文件 | 用途 |
|------|------|
| [courseware-generation-system-prompt.md](./courseware-generation-system-prompt.md) | 完整生成流程与 Agent 提示词 |
| `.cursor/rules/teaching-page-harness.mdc` | Workspace 路由规则 |
| `.cursor/skills/skills_v0.1.1/html-authoring-v0.1.1/SKILL.md` | 单页入口 Skill |
| `.cursor/skills/skills_v0.1.1/courseware-generator-v0.1.1/SKILL.md` | 多页入口 Skill |
| `.cursor/skills/skills_v0.1.1/test-html-v0.1.1/SKILL.md` | 验收闸门 |

---

*本文档描述的是架构与流程差异；若贵司千问侧已有具体网关、Agent 框架或 DashScope 配置，可在此基础上增补「贵司现状 vs 目标形态」专节。*
