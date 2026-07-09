# 单页教学 · 素材与清单

> 路径：`html-authoring/manifest.md`  
> Step 1 必读。

---

## spec 四字段

从用户原文整理，写入后续 `index.html` 的 `<!-- spec: ... -->`：

```
requirements=用户硬要求逐条
require=必含元素
forbid=禁止项
core-loop=互动闭环（动词链，如：选题→提交→反馈→重置）
```

互动类须声明可手测的 **core-loop** 每一步。

---

## slug 与目录

```
1. 定 slug（英文小写连字符，如 pythagoras-quiz）
2. 创建 pages/<slug>/
```

---

## 素材清单 assets-manifest.md

```
Write pages/<slug>/assets-manifest.md
```

| 规则 | 说明 |
|------|------|
| 图片/音频 | 真实 URL；禁止 base64 大图、禁止虚构占位路径 |
| 无外链素材 | 写明「CSS/SVG 自绘」，禁止空 manifest |

---

## Step 1 自检

```
□ slug 已确定，pages/<slug>/ 已创建
□ spec 四字段已整理（含 core-loop）
□ assets-manifest.md 已 Write
```
