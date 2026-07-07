---
name: courseware-generator
description: 生成多页 PPT 式互动课件 HTML。最高优先级：互动课件只能加载 courseware-generator，禁止同轮加载 math-design、interaction-design、html-authoring、character-visual、illustration-plan 等其他 skill。首次业务动作必须是真实 ask_user 表单，确认 9 项课件信息并让用户单选模板。确认页数范围后必须锁定 lockedPageCount，后续大纲、HTML page-data、原版发布、模板版发布都必须等于该页数。HTML 必须使用标准壳协议：未转义 page-shared/page-data、固定壳脚本、无自写 cw-root/iframe/srcdoc。完整流程必须先发布原版互动课件，再基于原版只做页面级模板注入并发布模板版。
---

更新时间：2026-06-09

# 互动课件生成技能

本技能只做一件事：按教研流程生成完整互动课件，并在原版发布后按用户首次选择的模板做安全套版。

## 最高优先级硬闸门

1. **只用本技能**：收到互动课件需求后，只能加载 `courseware-generator`。禁止加载或读取 `math-design`、`interaction-design`、`character-visual`、`illustration-plan`、`illustration-anchor`、`illustration-render` 或其他设计/生图 skill。
2. **先问用户**：Phase 1 第一个业务工具必须是真实 `ask_user`，不能用正文表格、`[SINGLE_CHOICE]` 文本或过程输出模拟表单。
3. **表单字段固定**：首次 `ask_user` 必须包含且只包含这 10 个字段：`课时内容`、`年级`、`册次`、`教材版本`、`教学重点`、`课时数`、`授课类型`、`课件页数范围`、`班级学情`、`版面模板`。
4. **模板字段固定**：`版面模板` 只能从 `templates/README.md` 读取真实选项，当前为 `retro-zine` / `8-bit-orbit`；模板字段禁止自定义。
5. **页数锁定**：用户确认页数范围后，必须立即确定一个具体整数 `lockedPageCount`。后续逐页大纲、`create_lesson_design`、HTML `<template class="page-data">` 数量、原版发布、模板版发布全部必须等于该数。禁止压缩成“核心 8 页”。
6. **原版不套模板**：`selectedTemplateId` 在原版生成前只记录，不影响大纲、图片 prompt、字体、背景、按钮、组件样式或页面风格。
7. **先原版后模板**：必须先发布完整原版互动课件，再读取 `template-postprocess-guide.md` 按 `selectedTemplateId` 套模板并二次发布。
8. **壳协议不合格禁止发布**：发布前必须 `read_file` 最新 HTML 并字面量检查：
   - 去掉前置空白后以 `<!DOCTYPE html>` 开头。
   - `<template class="page-shared"` 恰好 1 个。
   - `<template class="page-data"` 恰好等于 `lockedPageCount`。
   - `data-id` 从 1 到 `lockedPageCount` 连续。
   - 固定壳脚本 `https://musk-test.fbcontent.cn/pub-musk-ai-studio/user/upload/admin/HgSiredEejFXx94ofdiCZ8.js` 恰好 1 个，且位于所有页面之后。
   - `&lt;template class=&quot;page-data&quot;`、`<div id="cw-root"`、`#cw-root`、`iframe srcdoc` 都必须为 0。
9. **样式隔离硬规则**：每个 `page-data` 都在独立 iframe 中渲染。某页不能依赖上一页 `<style>`。多页共用的 class 样式必须放进 `page-shared`；否则每页必须自带自己的 `<style>`。
10. **模板只改 page-root 标记和共享模板 CSS**：模板阶段禁止替换整页 DOM，禁止改组件、按钮、媒体、交互脚本、标题横杠、组件框内文字颜色。每次 edit_file 只允许追加模板 CSS 或修改 `page-root` 开始标签上的 `data-cw-template` / `data-cw-variant`。

## 流程

### Phase 1 信息确认与大纲生成

1. 读取 `templates/README.md`，获取真实模板选项。
2. 读取 `outline-guidance.md`。
3. 单独调用 `ask_user`，让用户确认 9 项课件信息 + 1 项模板。
4. 根据用户确认的 `课件页数范围` 锁定 `lockedPageCount`。
5. 调用 `insert_courseware_design_sop`，使用返回的 `expertId` 继续专家咨询，禁止自行改 ID。
6. 按 SOP 完成课标、教材、学情、目标重难点和逐页设计。
7. 调用 `create_lesson_design`。调用前必须确认逐页设计行数等于 `lockedPageCount`。

### Phase 2 大纲确认

调用 `ask_user` 让用户确认大纲：

- `大纲很棒，直接开始制作`
- `需要微调`

若用户要求微调，修改大纲后重新 `create_lesson_design` 并再次确认。用户确认后进入素材准备。

### Phase 3 素材准备

按确认的大纲逐页判断是否需要素材。只有在确实准备调用 `generate_image` 时，才读取 `image-generation-guide.md` 做单张图片的命中式 prompt 增强：

- 命中设计稿内容类型才追加对应风格。
- 不命中就保持原始图片需求。
- 豆包工作流优先中文提示词。
- 封面图若需要生成，先读 `cover-layout-guide.md` 取封面图槽位、目标比例和安全构图。

音频、题目、知识资源按大纲需要准备。所有素材都记录 URL，不使用 base64。

### Phase 4 HTML 原版生成

1. 读取 `typography-guide.md`，自主选择 1 套字体 preset，写入唯一 `page-shared`。
2. 读取 `cover-layout-guide.md`，为第 1 页选择封面版式。
3. 读取 `html-guide.md`，只创建标准短骨架。
4. 按连续页码分批注入页面，每批成功后记录完成页码。
5. 每页必须独立可渲染：页面样式要么在本页 `<style>`，要么在 `page-shared`；禁止第 7 页依赖第 6 页 CSS。
6. 分批完成后必须 `read_file` 做页数、壳脚本、转义模板、自写壳检查。

### Phase 5 原版发布

硬校验通过后调用 `publish_resource` 发布原版互动课件。发布后不得结束，必须进入模板阶段。

### Phase 6/7 模板注入与二次发布

1. 读取 `template-postprocess-guide.md`。
2. 根据 `selectedTemplateId` 读取对应模板说明和 CSS 资产。
3. 先追加模板共享 CSS 到唯一 `page-shared` 的现有 `<style>` 末尾。
4. 再按连续页码分批，只修改每页 `page-root` 开始标签，补 `data-cw-template` 和 `data-cw-variant`。
5. 每批必须基于最新 `resourceId`，失败则重试当前批，禁止跳页继续。
6. 全部完成后 `read_file` 校验全部页面都有模板标记，再发布模板版。

## 文件读取顺序

| 文件 | 何时读取 |
| --- | --- |
| `templates/README.md` | Phase 1 表单模板选项；Phase 7 核对模板 |
| `outline-guidance.md` | Phase 1 大纲生成 |
| `image-generation-guide.md` | 仅在准备调用 `generate_image` 前 |
| `typography-guide.md` | Phase 4 HTML 生成前 |
| `cover-layout-guide.md` | 封面图 prompt 前；Phase 4 封面页生成前 |
| `html-guide.md` | Phase 4 HTML 生成 |
| `template-postprocess-guide.md` | Phase 7 模板注入 |
| `templates/<templateId>.md` 与模板 CSS 资产 | Phase 7 用户已选模板后 |

## 常见失败恢复

- `ask_user` 参数不合法或字段错：只能重试合法 `ask_user`，禁止继续 SOP。
- 大纲页数不等于 `lockedPageCount`：回到逐页设计补齐，不生成 HTML。
- `edit_file` 批次失败：继续使用最近一次成功的 `resourceId`，重试当前批；不要跳到下一批。
- 页面缺样式或只显示半页：检查该页是否依赖其他页 `<style>`；把共用样式移入 `page-shared` 或给每页补本页 `<style>`。
- 模板看起来没生效：只检查模板 CSS 是否追加到 `page-shared` 末尾、`page-root` 是否有模板标记、`page-root` 内联背景是否冲突；禁止改子节点和组件。

## 最终交付

最终必须有两个发布结果：

1. 原版互动课件。
2. 模板版互动课件。
