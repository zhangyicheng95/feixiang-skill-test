# 示例

## 示例一：零散题目转练习单

用户输入：

```plain
我上传了一批四年级数学“鸡兔同笼”题，里面有选择题、填空题和解答题。
不要搜题，题目都在文档里。帮我做成 A4 精美排版练习单。
```

执行方式：

1. 读取上传内容，清点选择题、填空题、解答题数量。
2. 保留全部原题、原选项、原条件和原单位。
3. 按题型分区，重新建立清晰题号。
4. 使用 A4 白底、清爽学术绿或经典试卷黑白风格。
5. 解答题预留手写答题线；普通题块不要默认 `break-inside: avoid`，只给真实图片、表格或很短且必须同页的关键题组加 `.keep-together`。
6. 输出单文件 HTML，包含 Paged.js 0.4.3 和打印按钮。

## 示例二：英语模板锁定

用户输入：

```plain
记住这个格式。之后继续制作 Unit 5 时，都按这份练习单的格式来，只替换单元内容。
```

执行方式：

1. 锁定固定层：布局、配色、字体字号、页边距、题型顺序、横线样式、题目密度。
2. 识别可变层：Unit、词汇、语法点、阅读文本、题目内容。
3. 后续生成时只替换可变层，不改变固定层。
4. 输出时主动说明“已沿用上次模板，仅替换 Unit 内容”。

## 示例三：上传教案改造

用户输入：

```plain
把这个教案改成打印精美版，A4，方便我上课拿着用。
```

执行方式：

1. 保留教学目标、重难点、教学过程、活动设计、板书、作业。
2. 不把教案改成阅读材料或讲义。
3. 用“教学环节卡片 + 时间轴 + 备注区”的打印版结构。
4. 保证每个教学环节不被分页截断。

## 示例四：图形依赖型试卷缺图（v48 阻塞模板）

用户输入：

```plain
帮我把这份西城六年级数学期末卷做成精美 A4 排版。
（仅上传了 PDF，没有 MinerU 输出，没有逐页图，没有题内 figure URL）
```

错误处理：调用 `ask_user` “是否接受仅文字和公式精美排版（不含原卷图形）”——这把降级当默认推荐，**禁止**。

正确处理：

1. 检测到学科=数学，题干含“如图/坐标图/统计图”，标记 `exam.diagramDependent=true`。
2. 检查素材包：缺 `figures[]`、缺 `imageLedger[]`、缺 bbox。
3. 阻塞输出：

```plain
当前不生成 HTML：图形依赖型试卷缺少题内图。
- 学科：六年级数学（图形依赖）
- 缺失：MinerU/Docling 结构化素材包、逐页 PNG（pageImages）、题内图 URL/bbox
- 不可降级：默认禁止 text-only，因为缺图等于丢失题目条件
- 建议链路：
  1) 后端调用 MinerU/Docling 解析，或
  2) 至少调用 tools/pdf-to-page-images 拿到逐页 PNG + manifest.json，
  3) 再用 tools/question-figure-cropper 按 bbox 裁出题内图。
- 如果你确认接受“仅文字版（不含原图形条件，不可作为完整试卷使用）”，请明确回复“只要文字版”。
```

## 示例五：手动上传整页截图（v48 截图分类）

用户输入：

```plain
我截了这张物理卷的整页图，帮我做精美排版，每道题的图都要清楚。
```

正确处理：

1. 把上传图标记为 `imageLedger[].type=source-page`。
2. 必须先：
   - OCR 整页识别题号、题干、选项、答案；
   - 调用 `tools/question-figure-cropper` 按 bbox 切出每道题的题内图（满足最小可读宽度）；
3. 把 `source-page` 放进 `.source-pages` 校验附录；题内图放进对应 `.question-figure`。
4. 任意一题缺 bbox → 阻塞，不能把整页图缩成题内小图。

## 示例六：text-only 用户明确同意降级（v48）

用户输入：

```plain
我只要文字版，先不管图。
```

正确处理：

1. 仍按内容复现规则保留题号、选项、公式、答案。
2. HTML 标题与首屏明确标注：
   ```html
   <p class="text-only-tag">文字版（不含原图形条件）</p>
   <p class="text-only-warning">本版本不包含原卷图形条件，仅作复习参考，不可作为完整试卷使用。</p>
   ```
3. 跑 guard 时携带 `--require-text-only-disclaimer`，确保标识存在。

## 示例七：二阶段补图全是整页扫描（v50 阻塞反例）

用户输入流：

```plain
[第一轮] 上传 PDF《2026 北京西城六年级（上）期末数学.pdf》，"做成精美 A4 排版"
[Agent] 调 convert_to_text → 拿到纯文本，识别为图形依赖型试卷 → ask_user 阻塞要图
[第二轮] 上传 4 张图片，"试卷中的图片见附件"
```

**v49 实际错误链路**（必须避免）：

```text
read_url(每张图URL拿 alt 信息)
  → 把 4 张原卷整页扫描当作 9 个题的 question-figure 复用
  → max-height: 80-200px 缩成米粒
  → create_file → 用户打印发现一片模糊
```

**v50 正确处理**：

1. **重新调 `skills(name="magazine-layout")`**：必读 SKILL.md / tool-routing.md / screenshot-classification.md。
2. 对每张补充图按 `screenshot-classification.md` 分类：
   - 图片 1：1654 × 2339，ratio=0.707 → A4 整页 → `source-page`
   - 图片 2：1654 × 2339，ratio=0.707 → `source-page`
   - 图片 3：同上
   - 图片 4：同上
3. 判定：**全部为 source-page，覆盖 0 张真实 single-question-figure**。
4. 按 SKILL.md `Phase 1.3` 表格"全部为整页扫描"分支，执行二选一：
   - 用户态度暂未明确 → 必须再次阻塞，列出还差哪些题号的真实题图。

**正确阻塞文案**：

```plain
当前不生成精美 A4 重排：补充的 4 张图均为原卷整页扫描（A4 比例 1:1.41，短边 ≥ 800 px），属于 source-page，不能直接作为题内 figure（v49 真实失败模式：被多次复用 + max-height 缩小 → 打印模糊）。

已识别图形依赖题号：第 2、3、5、6、7 题（对称轴 / 进度条 / 统计图 / 几何图）
其中真实题图覆盖率：0%（无任一单题清晰图）

您可以选择：
① 按题号截题图（一题一图，建议短边 ≥ 600px）后重新上传
② 回复"我只要原卷整页打印版"，会出 Phase 3.fullpage HTML（非设计师级重排）
③ 回复"我只要文字版（不含原图形条件）"，会出明确标注的 text-only 降级版
```

## 示例八：4 列分数选项错位（v50 反例）

用户输入：

```plain
帮我把"求阴影部分面积，A. 7/9π  B. 2π  C. 3/2π  D. 11π"这道题做成 A4 选择题。
```

**v49 错误 CSS**（必须避免）：

```css
.options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);  /* ❌ 4 列装分数 → 行高乱、option-box 错位 */
  gap: 4mm;
}
```

打印 PDF 中的视觉效果：4 列宽度不够装下 `\dfrac{7}{9}\pi`，分数被换行，option-box 在第一行，分数被推到第二行——出现孤立 □ 一串。

**v50 正确 CSS**：

```css
.options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);  /* ✅ 含 \frac 默认 2 列 */
  gap: 4mm 8mm;
  align-items: start;
}
.option-item {
  display: flex;
  align-items: flex-start;
  gap: 4mm;
}
.option-box {
  flex: 0 0 auto;
  width: 14px;
  height: 14px;
  border: 1px solid #333;
  margin-top: 0.6em;
}
```

## 示例九：原卷整页保真打印版（v50 正例）

用户输入流：

```plain
[第一轮] 上传 PDF + 第二轮上传 4 张原卷整页扫描
[第三轮] "我就要原卷整页打印版，不重排"
```

**v50 正确处理**：

1. 重新调 `skills(name="magazine-layout")`，确认 Phase 3.fullpage 模板。
2. 按 `pagedjs-template.md` Phase 3.fullpage 模板生成 HTML：
   - **必有** `.fullpage-tag` 与 `.fullpage-warning`；
   - **只有** `.source-pages` 一个主要内容区；
   - **不引入** MathJax；
   - 每张原卷扫描图按 `width: 100%` A4 全宽显示；
   - 每页 `page-break-after: always` 让 4 张图各占一页打印；
3. 不调用 `tools/magazine-layout-guard --require-text-only-disclaimer`，改用 `--require-fullpage-disclaimer`；
4. 13 条手工自检：跳过 #5 #6 #9 #10 #12（不适用），其余必须通过。

**HTML 关键片段**：

```html
<header class="banner-fullpage">
  <h1>《2026 北京西城六年级（上）期末数学》原卷整页保真打印版</h1>
  <span class="fullpage-tag">原卷整页扫描打印版（非设计师级重排）</span>
  <p class="fullpage-warning">本版本由原卷整页扫描组成，未做题号级重排和题图裁剪；适合临时打印应急，不替代设计师级精美排版。</p>
</header>
<section class="source-pages source-pages-main">
  <figure class="source-page keep-together"><img src="原卷第1页URL" /></figure>
  <figure class="source-page keep-together"><img src="原卷第2页URL" /></figure>
  <figure class="source-page keep-together"><img src="原卷第3页URL" /></figure>
  <figure class="source-page keep-together"><img src="原卷第4页URL" /></figure>
</section>
```

## 输出验收话术

交付时简要说明：

```plain
已按“先完整复现，再精美排版”的四层流水线处理：
1. Layer 1 上游解析：使用 MinerU 标准化素材包（含 questions/figures/tables/answers/imageLedger）。
2. Layer 2 重排：保留原文档中的题型、题号、公式/图表和题目数量；题内图已按 bbox 真实裁剪。
3. Layer 3 HTML 静态门禁：tools/magazine-layout-guard 通过（题量、图片、MathJax、紧凑 A4、占位词、孤立方框、答案解析）。
4. Layer 4 打印产物验证：tools/print-preview-guard 通过（页数 8、首页非空、空白页比例 0.0、文本比 0.96、图片差 0）。
现在可直接浏览器打开并打印。
```
