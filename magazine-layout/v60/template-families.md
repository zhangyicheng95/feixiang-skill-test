# 4 模板族 × 8 subtype × 参数化系统

> v60 magazine-layout 的核心生成能力：把用户侧 8 类资料压缩为 4 个工程模板族，
> 通过 `style_preset / density / columns / answer_space / fidelity_mode` 等参数实现
> 同一资料的多种产出风格。这是「教学结构 + 质量底线 + 可变参数 + 样式自由度」的设计。

---

## 1. 模板族总览

| 工程模板族 | 用户侧 8 个 subtype | 共享底层能力 |
|---|---|---|
| **assessment_work** | exam_paper / practice_sheet / question_set / dictation_sheet | 题目结构、题型层级、题号、选项、答题区、公式、图文邻近、A4 紧凑分页 |
| **learning_document** | teacher_lesson_plan / student_handout | 教学结构、stage 徽章、信息卡、知识讲解、例题、设计意图 |
| **knowledge_reference** | knowledge_sheet | 高密度卡片化、表格优先、重点框、速记体、可多栏 |
| **magazine_reading** | magazine_article | 衬线大标题、drop-cap、双栏、pull-quote、嵌入大幅配图、章节小标题、杂志脚标 |

> 「公式表 / 语法清单 / 易错点清单 / 考点速查表」属于 `knowledge_sheet` 的子风格变体，
> 通过 `style_preset` + 内容组织变化实现，不再单独建 builder。

---

## 2. 参数化系统

每次生成 HTML 时，按以下参数确定具体版式（这些不是固定值，AI 可根据学科/年级/老师意图灵活调整）：

```jsonc
{
  "templateFamily": "assessment_work" | "learning_document" | "knowledge_reference" | "magazine_reading",
  "subtype":         "exam_paper" | "practice_sheet" | "question_set" | "dictation_sheet"
                   | "teacher_lesson_plan" | "student_handout"
                   | "knowledge_sheet" | "magazine_article",

  "style_preset":    "classic_black_white"     // 黑白严肃，正式试卷
                   | "academic_blue"            // 蓝色学术，教案/讲义
                   | "academic_green"           // 绿色清新，知识清单
                   | "warm_amber"               // 暖橙活泼，低年级讲义/练习
                   | "elegant_purple"           // 紫色雅致，语文/古诗
                   | "primary_friendly"         // 低龄友好，大字号/卡通色
                   | "magazine_light"           // 米色衬线杂志
                   ,

  "density":         "compact"   // 紧凑：字号 10.5pt、行高 1.32、段距 2-3mm（试卷/教案）
                   | "standard"  // 标准：11pt、行高 1.5、段距 3-4mm（讲义）
                   | "spacious"  // 舒展：11.5pt、行高 1.6、段距 4-5mm（默写纸/杂志）
                   ,

  "columns":         "auto"      // 让模板族决定（默认）
                   | "single"    // 单栏：教案、试卷
                   | "double"    // 双栏：杂志、知识清单
                   | "multi"     // 多栏：极简清单、词汇表
                   ,

  "answer_space":    "none"      // 无答题区（讲义/知识清单）
                   | "short"     // 短答：1-2 行
                   | "standard"  // 标准答题区
                   | "large"     // 大答题区：解答题、作文
                   | "grid"      // 田字格 / 拼音四线格 / 默写格
                   ,

  "fidelity_mode":   "editable_relayout"        // 默认：可编辑 A4 重排
                   | "source_page_print"        // 仅当用户明确要"原卷整页打印版"时使用
                   | "text_only_degraded"       // 仅当用户明确接受"文字版"时使用
                   ,

  "diagram_dependent": true,        // 标记：缺关键图时阻塞
  "requires_mathjax":  true,        // 标记：必须加载 MathJax
  "requires_figures":  true,        // 标记：题图缺失时阻塞
  "requires_answers":  false        // 标记：答案缺失时给警告
}
```

**默认参数表**（按 subtype）：

| subtype | style_preset | density | columns | answer_space | requires_mathjax | requires_figures |
|---|---|---|---|---|---|---|
| exam_paper | classic_black_white | compact | single | standard | ✓（数理科） | ✓（图形依赖） |
| practice_sheet | classic_black_white / warm_amber | compact | single / double | standard | 视学科 | 视学科 |
| question_set | academic_blue | compact | single | short | 视学科 | 视学科 |
| dictation_sheet | classic_black_white | spacious | single / double | grid | ✗ | ✗ |
| teacher_lesson_plan | academic_blue | compact | single | none | ✓（数理科） | ✓ |
| student_handout | academic_blue / warm_amber | standard | single | short | ✓（数理科） | ✓ |
| knowledge_sheet | academic_green | compact | double / multi | none | ✓（公式表） | ✓ |
| magazine_article | magazine_light | spacious | double | none | 仅有公式时 | ✗（允许 AI 配图，须标注） |

---

## 3. 4 模板族详细规则

### 3.1 assessment_work（学生作答 / 题目训练）

**覆盖**：高级试卷、练习单、题单、默写纸

**共享 CSS class**：

```css
.work-section{ margin: 0 0 6mm; }
.work-section-title{ font-size: 12pt; font-weight: bold; padding: 1.5mm 3mm;
                      background: var(--section-bg); color: var(--section-fg); }
.work-question{ margin: 3mm 0; padding: 1.5mm 0; }      /* 普通题块，禁止 break-inside: avoid */
.work-qnum{ font-weight: bold; margin-right: 2mm; }
.work-options{ display: grid; gap: 3mm 6mm; align-items: start; }
.work-options[data-cols="2"]{ grid-template-columns: repeat(2, 1fr); }
.work-options[data-cols="1"]{ grid-template-columns: 1fr; }
.option-item{ display: flex; align-items: flex-start; gap: 3mm; }
.option-box{ flex: 0 0 auto; width: 14px; height: 14px; border: 1px solid #333; margin-top: 0.6em; }
.answer-space{ border-bottom: 1px solid #999; min-height: 8mm; margin: 2mm 0; }
.answer-space[data-kind="short"]{ min-height: 6mm; }
.answer-space[data-kind="large"]{ min-height: 24mm; }
.answer-space[data-kind="grid"]{ /* 田字格 / 四线格，见 dictation_sheet */ }
```

#### 3.1.1 exam_paper

- 严格的考试格式：考试信息表（学校/班级/姓名/学号/考试时长/总分）
- 题型分组（一、选择题；二、填空题；三、解答题）
- 选择题严格 4 列 grid 仅当所有选项都是 1-2 字符短文本；含 `\frac/\dfrac/<img>/长表达式` 强制 2 列
- 答题区：选择题选项框、填空题横线、解答题大答题区
- 装饰最小化、无情感色彩

#### 3.1.2 practice_sheet

- 课堂训练，可分基础 / 提升 / 拓展三档
- 每题可标知识点 chip
- 答题区适中（standard）
- 风格可活泼（warm_amber）

#### 3.1.3 question_set

- 专题 / 错题集
- 每题左侧或顶部标记：知识点 / 题源 / 难度 chip
- 含订正区（小答案区）或答题卡

#### 3.1.4 dictation_sheet

- 不强求题量保真（mineru 输出可能只是词表）
- 重点是书写空间：田字格 / 拼音四线格（语文）、四线三格（英语）、横线（数学公式）
- 订正区
- spacious 密度

```css
/* 田字格 */
.dictation-tianzige{ width: 8mm; height: 8mm; border: 1px solid #999;
                      background: linear-gradient(to right, transparent 49%, #ddd 49%, #ddd 51%, transparent 51%),
                                  linear-gradient(to bottom, transparent 49%, #ddd 49%, #ddd 51%, transparent 51%); }
/* 英语四线三格 */
.dictation-fourline{ height: 10mm; background: linear-gradient(to bottom,
                      #999 0, #999 1px, transparent 1px, transparent 33%,
                      #ccc 33%, #ccc 34%, transparent 34%, transparent 66%,
                      #ccc 66%, #ccc 67%, transparent 67%, transparent 99%,
                      #999 99%); }
```

### 3.2 learning_document（教学内容组织）

**覆盖**：讲义、教案打印版

**共享 CSS class**：

```css
.cover-header{ padding: 4mm 0; border-bottom: 2px solid var(--accent); }
.cover-eyebrow{ font-size: 9pt; letter-spacing: 1pt; color: var(--accent);
                font-weight: bold; text-transform: uppercase; }
.cover-title{ font-size: 18pt; font-weight: bold; margin: 1mm 0 2mm; }
.cover-meta{ font-size: 9pt; color: #555; }

.lesson-info{ display: grid; grid-template-columns: repeat(3, 1fr);
              gap: 2mm; padding: 2mm 3mm; background: #f5f7fb; margin: 3mm 0; }
.lesson-info-cell .label{ font-size: 8pt; color: #888; margin-right: 2mm; }

.lesson-stage{ margin: 4mm 0; }
.lesson-stage-header{ display: flex; align-items: center; gap: 3mm; padding: 2mm 0;
                       border-bottom: 1px solid var(--accent); }
.lesson-stage-num{ flex: 0 0 auto; width: 10mm; height: 10mm;
                    background: var(--accent); color: #fff; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 12pt; font-weight: bold; }
.lesson-stage-title{ font-size: 14pt; font-weight: bold; }
.lesson-stage-body{ padding: 2mm 0 0 13mm; }

/* 教师视角专属 */
body[data-subtype="teacher_lesson_plan"] .teacher-note{
  background: #fff8e1; border-left: 3px solid #ffa726; padding: 2mm 3mm;
  font-size: 9.5pt; margin: 2mm 0;
}
body[data-subtype="teacher_lesson_plan"] .teacher-activity{
  display: grid; grid-template-columns: 14mm 1fr; gap: 3mm; margin: 1.5mm 0;
}
body[data-subtype="teacher_lesson_plan"] .teacher-activity > div:first-child{
  font-weight: bold; color: var(--accent);
}

/* 公式图三档（来自 docx WMF 回填）*/
body[data-family="learning_document"] figure.q-figure.formula-inline{
  display: inline-block; margin: 0 1mm; vertical-align: middle;
}
body[data-family="learning_document"] figure.q-figure.formula-inline img{
  max-width: 60mm; max-height: 8mm; vertical-align: middle;
}
body[data-family="learning_document"] figure.q-figure.formula-block{
  display: block; margin: 1.5mm 0; text-align: center;
}
body[data-family="learning_document"] figure.q-figure.formula-block img{
  max-width: 80mm; max-height: 24mm;
}
body[data-family="learning_document"] figure.q-figure.figure-large img{
  max-width: 140mm; max-height: 90mm;
}
```

#### 3.2.1 teacher_lesson_plan

- 教学环节用罗马数字 / 中文序号「一、二、」徽章
- 章节关键词识别：教学目标 / 教学重点 / 教学难点 / 教学过程 / 知识回顾 / 新知探究 / 探究学习 / 典例分析 / 应用迁移 / 巩固练习 / 课堂小结 / 作业布置 等
- 教师专属语义块：`【问题】` / `【师生活动】` / `【设计意图】` / `【追问】` / `【新知】`
- 板书设计 / 教学反思 卡片化
- 风格 academic_blue，单栏，compact

#### 3.2.2 student_handout

- 学习目标 banner
- 知识讲解卡
- 例题盒（含解答）
- 思考盒
- 风格 warm_amber（低年级）/ academic_blue（高年级以上）

### 3.3 knowledge_reference（高密度查阅）

**覆盖**：知识清单、公式表、语法清单、易错点清单、考点速查表

**共享 CSS class**：

```css
.kcard{ border: 1px solid var(--card-border); border-radius: 2mm; padding: 2.5mm;
         margin: 2mm 0; break-inside: avoid; }    /* 知识卡可防拆 */
.kcard-title{ font-size: 11pt; font-weight: bold; margin-bottom: 1.5mm;
              color: var(--accent); }
.kcard-tag{ display: inline-block; padding: 0.5mm 2mm; font-size: 8pt;
             border-radius: 1mm; background: var(--tag-bg); color: var(--tag-fg);
             margin-right: 1mm; }
.kcard-body{ font-size: 10pt; line-height: 1.4; }

/* 公式表专属：左公式 + 右说明 */
body[data-subtype="formula_sheet"] .kcard{
  display: grid; grid-template-columns: 1fr 1fr; gap: 4mm;
}
body[data-subtype="formula_sheet"] .kcard-formula{ text-align: center; }

/* 语法清单：表格优先 */
body[data-subtype="grammar_sheet"] table{ width: 100%; border-collapse: collapse;
                                            font-size: 9.5pt; margin: 2mm 0; }
body[data-subtype="grammar_sheet"] th{ background: var(--accent);
                                         color: #fff; padding: 1mm 2mm; }

/* 易错点：警告框 */
body[data-subtype="mistake_sheet"] .kcard.is-warning{
  border-color: #f44336; background: #ffebee;
}
body[data-subtype="mistake_sheet"] .kcard.is-warning .kcard-title::before{
  content: "⚠ "; color: #f44336;
}
```

#### 3.3.1 knowledge_sheet（默认）

- 章节分组 → 多张知识卡
- 每卡：title + tag + body（要点 / 公式 / 例子）
- 双栏或多栏（根据卡片密度）
- compact 密度

#### 3.3.2 子风格变体

- **公式表**：左侧公式（MathJax 居中渲染）+ 右侧说明
- **语法清单**：HTML table 优先，配 ✓/✗ 示例对照
- **易错点清单**：橙红警告框
- **考点速查表**：表格 + 高频度标签

### 3.4 magazine_reading（阅读体验）

**覆盖**：杂志风资料、主题阅读、科普专题、项目化学习材料、学科文化拓展

**共享 CSS class**：

```css
:root{
  --mag-serif: "Songti SC", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif;
  --mag-sans: "PingFang SC", -apple-system, sans-serif;
  --mag-bg: #fafaf5;
  --mag-accent: #1a3a5c;
}

body[data-family="magazine_reading"]{
  font-family: var(--mag-serif);
  background: var(--mag-bg);
}

.mag-meta{ display: grid; grid-template-columns: 1fr auto 1fr; gap: 4mm;
            font-size: 8pt; letter-spacing: 1pt; padding-bottom: 4mm;
            border-bottom: 1px solid #ccc; }
.mag-meta .center{ font-family: var(--mag-sans); font-weight: bold;
                    background: var(--mag-accent); color: #fff;
                    padding: 0.5mm 3mm; }

.mag-cover{ padding: 6mm 0; border-bottom: 2px solid var(--mag-accent);
             margin-bottom: 4mm; }
.mag-title{ font-size: 24pt; font-weight: bold; margin: 0 0 2mm; }
.mag-subtitle{ font-size: 13pt; color: #555; font-style: italic; }
.mag-author{ font-size: 9pt; color: #888; margin-top: 3mm;
              font-family: var(--mag-sans); }

.mag-section-title{ font-size: 14pt; font-weight: bold;
                     border-left: 4px solid var(--mag-accent);
                     padding-left: 3mm; margin: 4mm 0 2mm; }

.mag-body[data-cols="double"]{
  column-count: 2; column-gap: 8mm; column-rule: 1px solid #e8e8e8;
}

.mag-body p:first-of-type::first-letter{
  /* drop-cap：段首字母 */
  float: left; font-size: 36pt; font-weight: bold;
  line-height: 0.85; padding: 4px 4px 0 0; color: var(--mag-accent);
}

.mag-pullquote{ font-size: 13pt; font-weight: bold; text-align: center;
                 padding: 3mm 0; margin: 4mm 0;
                 border-top: 2px solid var(--mag-accent);
                 border-bottom: 2px solid var(--mag-accent); }
.mag-pullquote::before{ content: '"'; font-size: 24pt; vertical-align: -6pt;
                          color: var(--mag-accent); margin-right: 2mm; }

.mag-figure{ margin: 3mm 0; break-inside: avoid; }
.mag-figure img{ width: 100%; }
.mag-figure figcaption{ font-size: 8.5pt; color: #888; margin-top: 1mm;
                          font-family: var(--mag-sans); }

.mag-footer{ padding: 4mm 0 0; border-top: 1px solid #ccc;
              display: flex; justify-content: space-between;
              font-size: 8pt; color: #888; }
```

#### 3.4.1 magazine_article

- 大幅封面：meta-line + 主标题（衬线 24pt+）+ 副标题 + 作者
- drop-cap 段首字母
- 双栏正文（可由 AI 视长度调整为单栏）
- 章节小标题（左色条）
- 嵌入大幅配图（水墨 / 摄影）
- pull-quote 引文样式
- 杂志脚标（VOL.XXX / 期号 / 栏目）

**重要边界**：

- 杂志风**不能用于正式试卷**（试卷必须 classic_black_white）
- 杂志风**允许** AI 装饰图（`generate_image` 调用），但每张图必须 figcaption 标注 "AI 辅助插图"
- 数学/物理/化学等学科的题图**严禁**用 AI 替代

---

## 4. 8 类用户场景示例片段

> 这些是 AI 生成 HTML 时可参考的最小可用片段。

### 4.1 试卷 exam_paper

```html
<header class="cover-header" data-subtype="exam_paper">
  <span class="cover-eyebrow">EXAM · 期末试卷</span>
  <h1 class="cover-title">2026 北京西城六年级（上）期末数学</h1>
  <table class="exam-info"><tr><td>学校</td><td>______</td><td>班级</td><td>______</td></tr>
    <tr><td>姓名</td><td>______</td><td>学号</td><td>______</td></tr></table>
</header>

<section class="work-section">
  <h2 class="work-section-title">一、选择题（每题 4 分，共 32 分）</h2>
  <article class="work-question">
    <span class="work-qnum">1.</span>
    <p>下列各组数中，互为相反数的是（&nbsp;&nbsp;&nbsp;）</p>
    <div class="work-options" data-cols="2">
      <div class="option-item"><span class="option-box"></span>
        <span>A. \(\dfrac{1}{2}\) 和 \(-\dfrac{1}{2}\)</span></div>
      <div class="option-item"><span class="option-box"></span>
        <span>B. \(\dfrac{1}{3}\) 和 \(-3\)</span></div>
      <!-- ... -->
    </div>
  </article>
</section>
```

### 4.2 练习单 practice_sheet

```html
<article class="work-question">
  <span class="work-qnum">1.</span>
  <span class="chip chip-knowledge">分数加减</span>
  <span class="chip chip-difficulty">⭐⭐</span>
  <p>计算：\(\dfrac{2}{3} + \dfrac{1}{4}\)</p>
  <div class="answer-space" data-kind="short"></div>
</article>
```

### 4.3 题单 question_set

```html
<article class="work-question">
  <header class="q-meta">
    <span class="chip chip-source">来源：2024 海淀一模</span>
    <span class="chip chip-knowledge">二次函数</span>
  </header>
  <p>已知抛物线 y = ax² + bx + c ...</p>
  <div class="answer-space" data-kind="large"></div>
  <details class="q-answer"><summary>参考答案</summary>
    <p>解：由题意得 ...</p>
  </details>
</article>
```

### 4.4 默写纸 dictation_sheet

```html
<section class="dictation-list">
  <article class="dictation-item">
    <header><span class="chip chip-pinyin">qīnɡ jié</span></header>
    <div class="dictation-fourline" style="grid-column: span 6"></div>
  </article>
  <!-- 田字格示例 -->
  <article class="dictation-item">
    <header><span>请默写"清"字</span></header>
    <div style="display:grid;grid-template-columns:repeat(8,1fr);gap:1mm;">
      <span class="dictation-tianzige"></span>
      <span class="dictation-tianzige"></span>
      <!-- × 8 -->
    </div>
  </article>
</section>
```

### 4.5 教案 teacher_lesson_plan

```html
<section class="lesson-stage">
  <header class="lesson-stage-header">
    <span class="lesson-stage-num">·</span>
    <h3 class="lesson-stage-title">新知探究</h3>
  </header>
  <div class="lesson-stage-body">
    <div class="teacher-note">【问题】新疆是我国棉花的主要产地之一……</div>
    <div class="teacher-activity">
      <div>师生活动</div><div>学生独立思考作答。</div>
    </div>
    <figure class="q-figure formula-block">
      <img src="data:image/png;base64,..." alt="x+y=6 / 2x+y=8">
    </figure>
    <div class="teacher-note teacher-design">
      【设计意图】通过实例引出二元一次方程组……
    </div>
  </div>
</section>
```

### 4.6 学生讲义 student_handout

```html
<section class="handout-objective">
  <h3>📌 本节学习目标</h3>
  <ol>
    <li>理解代入消元法的基本思路</li>
    <li>掌握用代入法解二元一次方程组的步骤</li>
  </ol>
</section>
<section class="handout-knowledge">
  <h3>知识讲解</h3>
  <p>把方程组中的一个方程的某个未知数用含另一个未知数的式子表示出来……</p>
</section>
<section class="handout-example">
  <h3>例 1</h3>
  <p>解方程组 ……</p>
</section>
```

### 4.7 知识清单 knowledge_sheet

```html
<section class="kchapter">
  <h2>第一单元 数与代数</h2>
  <div style="column-count:2;column-gap:6mm;">
    <article class="kcard">
      <h3 class="kcard-title">分数的基本性质</h3>
      <span class="kcard-tag">核心</span>
      <div class="kcard-body">
        <p>分子分母同时乘以或除以相同的非零数，分数大小不变。</p>
        <p>例：\(\dfrac{2}{3} = \dfrac{4}{6} = \dfrac{6}{9}\)</p>
      </div>
    </article>
    <article class="kcard is-warning">
      <h3 class="kcard-title">分数比较易错点</h3>
      <span class="kcard-tag">易错</span>
      <div class="kcard-body">
        <p>分子相同时，分母小的分数大，不要弄反。</p>
      </div>
    </article>
  </div>
</section>
```

### 4.8 杂志风 magazine_article

```html
<header class="mag-meta">
  <div>MATH READING · 小数主题</div>
  <div class="center">FEATURE · 主题阅读</div>
  <div style="text-align:right;">VOL.002</div>
</header>
<section class="mag-cover">
  <h1 class="mag-title">小数算数 · 主题阅读</h1>
  <p class="mag-subtitle">走进小数的奇妙世界 · 数学文化拓展</p>
  <p class="mag-author">作者：数学组 · 数学</p>
</section>
<section class="mag-body" data-cols="double">
  <h2 class="mag-section-title">一写给四年级同学的计算魔法史</h2>
  <p>人类最早的计算工具是什么？……</p>
  <figure class="mag-figure">
    <img src="data:image/jpeg;base64,...." alt="算筹水墨画">
    <figcaption>古人用算筹计算（AI 辅助插图）</figcaption>
  </figure>
  <h3 class="mag-section-title">第一代：小竹棍大智慧——算筹</h3>
  <p>……</p>
  <p class="mag-pullquote">横放一根棍子代表 5</p>
</section>
<footer class="mag-footer">
  <span>小数算数 · 主题阅读</span>
  <span>VOL.002</span>
</footer>
```

---

## 5. 路由决策表（结合 source-package.routing）

```text
1. 用户在对话中显式说 "我要做成 X"  →  最高优先级，直接采用 X
2. routing.confidence ≥ 0.5         →  采用 routing.recommendedSubtype
3. routing.confidence in [0.3, 0.5) →  ask_user 确认
4. routing.confidence < 0.3         →  ask_user 询问场景词或采用 routing.fallback
5. 用户与 routing 冲突（如 routing=exam_paper 但用户说"做成杂志风"）→  优先用户意图，但若学科是数学/物理/化学/生物/地理，提示用户"杂志风不适合学科原卷"
```

---

## 6. 风格预设细节（CSS 变量）

每个 style_preset 对应一组 CSS 变量，注入 `<body>` 上：

```css
body[data-style="classic_black_white"]{
  --accent: #000; --section-bg: #000; --section-fg: #fff;
  --tag-bg: #f0f0f0; --tag-fg: #333; --card-border: #ccc;
}
body[data-style="academic_blue"]{
  --accent: #1976d2; --section-bg: #e3f2fd; --section-fg: #1976d2;
  --tag-bg: #1976d2; --tag-fg: #fff; --card-border: #1976d2;
}
body[data-style="academic_green"]{
  --accent: #388e3c; --section-bg: #e8f5e9; --section-fg: #2e7d32;
  --tag-bg: #388e3c; --tag-fg: #fff; --card-border: #c8e6c9;
}
body[data-style="warm_amber"]{
  --accent: #f57c00; --section-bg: #fff8e1; --section-fg: #e65100;
  --tag-bg: #ffb74d; --tag-fg: #4e342e; --card-border: #ffcc80;
}
body[data-style="elegant_purple"]{
  --accent: #5e35b1; --section-bg: #ede7f6; --section-fg: #4527a0;
  --tag-bg: #5e35b1; --tag-fg: #fff; --card-border: #d1c4e9;
}
body[data-style="primary_friendly"]{
  --accent: #ec407a; --section-bg: #fff0f5; --section-fg: #c2185b;
  --tag-bg: #ff80ab; --tag-fg: #fff; --card-border: #f8bbd0;
}
body[data-style="magazine_light"]{
  --accent: #1a3a5c; --section-bg: #fafaf5; --section-fg: #1a3a5c;
  --tag-bg: #fafaf5; --tag-fg: #1a3a5c; --card-border: #d8d8d0;
}
```

---

## 7. 与 v59 老规则的兼容

v59 的"模板锁定"逻辑保留：用户说"按这个格式来"时固定层不变。

v59 删除的规则：

- ❌ Phase 1.3 二阶段补图判定（mineru source-package 不需要）
- ❌ screenshot-classification 七分类（imageLedger.role 已分类）
- ❌ figure-cropping 最小可读宽度自检（imageLedger.naturalSize 已知，渲染时自动按 role 选 max-width）
- ❌ pdf-ocr-preprocess（mineru 内置）
- ❌ pdf-page-fidelity（mineru 输出 page_full role 后由 fidelity_mode 控制）

v59 保留的红线（写在 SKILL.md 8 项自检中）：

- ✓ 题量保真
- ✓ 答案保留
- ✓ MathJax 标准 CDN
- ✓ Paged.js 0.4.3
- ✓ @page margin ≤ 12mm
- ✓ 普通题块禁批量 break-inside: avoid
- ✓ 选项 4 列 grid 限制
- ✓ AI 图禁用于学科原卷
