# 教学 HTML Skills v0.1.4

> 基于 `教学HTML-Skills-v0.1.3-2026-07-15` 复制。  
> 目录：`.cursor/skills/教学HTML-Skills-v0.1.4-2026-07-27/`

## 相对 v0.1.3 包目录的变更

本版为包级复制发布，skill 内容与 `v0.1.3` 包末态一致（含 `courseware-generator` v0.1.5、`html-authoring` v0.1.6.1、`test-html` 静态验收主路径等）。后续变更以本目录为准。

## 架构原则

| 内容 | 策略 |
|---|---|
| 生图规范 | **各自独立**：`html-authoring` / `courseware-generator` 各有一份 `references/image-generation.md`，禁止互相读取 |
| 验收 | **共用**：两边 Step 3 都读 `test-html/SKILL.md`（可补读 `guide.md`） |
| 生成侧其它 guide | 各自独立，禁止跨生成 skill 复用 |

## 相对 v0.1.2 的变更

### SCORM 运行时（`courseware-generator/assets/courseware-shell.js`）

适配 ClassIn / LMS iframe，保证学习进度与时长可上报：

1. **API 延迟重试**：`tryScormBoot` 最多约 5s；晚到时有书签才跳转，无书签只 `visit(当前页)`，不强制回第 0 页
2. **Initialize 103**：Already Initialized 视为可续会话，不清空 api
3. **墙钟 `session_time`**：整秒 ISO8601；`pause`/`resume` 多行 no-op，避免 iframe visibility 把时长刷成 0
4. **`cmi.location` 1-based**：`visit` 写 `index+1`，`bookmark` 读回 0-based
5. **keepAlive**：由 10s 改为 5s 推送时长
6. **与前端导出兼容**：壳已加固时 `scorm2004.js` 跳过正则改写，避免误删 `init`

### 生图

1. `courseware-generator/references/image-generation.md` — 多页 + 封面槽位 + `generate_image`
2. `html-authoring/references/image-generation.md` — 单页独立副本
3. 服务生图工具名：**`generate_image`**

### 验收

- Step 3 **共用** `test-html/`（生成任务与「仅验收」任务同一套合同）

### 单页体验层（合并自 teaching-page-html-authoring v0.2.0）

以本包 `html-authoring/` 为准吸收 v0.2.0 变更，并保留 v0.1.3 已有能力：

1. 新增 `experience-design.md`；`artifact-spec.experienceDesign` 为必填
2. 状态源、数据层正确性、可访问控件与「操作→状态→反馈」闭环
3. 1440/390 视口几何闭包；自包含时 `SELF_DRAWN_ONLY`（禁远程 URL）
4. 通用视觉改为舞台优先；**保留禁止学科锁色**（不恢复理化→青色硬绑）
5. 数学 workflow：布局按原型选择、响应式字号/按钮；去掉机械 hash 默认底栏
6. **保留**：新建/编辑 `read_attachment`、`generate_image` + 本目录 image-generation、`create_file` 的 `redis_verify_match`，并叠加 `shell_injected=false`

## 入口

| 场景 | 入口 |
|---|---|
| 单页生成 | `html-authoring/SKILL.md` |
| 多页课件生成 | `courseware-generator/SKILL.md` |
| 验收（Step 3 或单独验收） | `test-html/SKILL.md` |
