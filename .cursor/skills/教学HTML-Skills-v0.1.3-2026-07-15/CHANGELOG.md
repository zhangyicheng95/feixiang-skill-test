# 教学 HTML Skills v0.1.3

> 基于 `教学HTML-Skills-v0.1.2-2026-07-14` 复制增强。  
> 目录：`.cursor/skills/教学HTML-Skills-v0.1.3-2026-07-15/`

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

1. `courseware-generator/references/image-generation.md` — 多页 + 封面槽位 + `generate_images`
2. `html-authoring/references/image-generation.md` — 单页独立副本
3. 服务生图工具名：**`generate_images`**

### 验收

- Step 3 **共用** `test-html/`（生成任务与「仅验收」任务同一套合同）

## 入口

| 场景 | 入口 |
|---|---|
| 单页生成 | `html-authoring/SKILL.md` |
| 多页课件生成 | `courseware-generator/SKILL.md` |
| 验收（Step 3 或单独验收） | `test-html/SKILL.md` |
