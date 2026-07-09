# 多页课件 · 素材与清单

> 路径：`courseware-generator/manifest.md`  
> Step 1 必读（与 `outline-guidance.md` 配合）。

---

## spec 四字段

从用户原文整理，写入 `outline.md` 顶部或 `index.html` 注释：

```
requirements=用户硬要求逐条
require=必含页型/互动（封面、讲解、练习…）
forbid=禁止项（emoji、滚动堆题…）
core-loop=各互动页闭环（如 P8 选题→确认→解析→下一题）
```

---

## 大纲 outline.md

```
1. Read `outline-guidance.md`（harness 模式见该文件开头说明）
2. Write pages/<slug>/outline.md
   - 逐页表：页码 / 页类型 / 内容要点 / 交互设计
   - 标注 core-loop 所在页
3. 用户确认后继续（未确认不进入 Step 2）
```

页型最低标准见 `references/html.md` §六。

---

## 素材清单 assets-manifest.md

```
Write pages/<slug>/assets-manifest.md
```

| 规则 | 说明 |
|------|------|
| 图片/音频 | 真实 URL；禁止 base64 |
| 无外链 | 写明 CSS/SVG 自绘 |
| 封面图 | 若第 1 页需要图，记录 `coverImageSlot`（见 `references/cover.md`） |

---

## Step 1 自检

```
□ pages/<slug>/ 已创建
□ spec 四字段 + 各页 core-loop 已整理
□ outline.md 已 Write 且已确认
□ assets-manifest.md 已 Write
```
