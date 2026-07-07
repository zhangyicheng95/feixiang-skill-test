# 8 类用户场景示例

> 每类示例给出：典型用户对话 → routing 输出 → 关键参数 → 产物特征。
> 对话话术可作为 ask_user / 交付说明的参考。

---

## 1. 高级试卷（exam_paper）

**典型对话**：

> 用户上传 `2026 北京西城六年级（上）期末数学.source-package.json`，说"帮我精美排版"。

**routing**：

```jsonc
{
  "recommendedFamily": "assessment_work",
  "recommendedSubtype": "exam_paper",
  "confidence": 1.00,
  "reasons": ["命中『试卷/期末/考试』关键词", "选择题 + 填空题 + 解答题结构齐全"]
}
```

**关键参数**：

```jsonc
{ "style_preset": "classic_black_white", "density": "compact",
  "columns": "single", "answer_space": "standard",
  "fidelity_mode": "editable_relayout",
  "diagram_dependent": true, "requires_mathjax": true,
  "requires_figures": true, "requires_answers": true }
```

**产物特征**：

- A4 portrait, 10mm 12mm 边距
- 卷首：考试信息表（学校/班级/姓名/学号/考试时长/总分）
- 题型分组：一、选择题；二、填空题；三、解答题
- 选择题选项含分数 → `data-cols="2"` 强制
- 答题区：选择题 box、填空题横线、解答题 large 答题区
- 真实题图（来自 imageLedger）邻近题干
- 答案区在卷末，每题独立

---

## 2. 练习单（practice_sheet）

**典型对话**：

> "做一份分数加减法的课堂练习单，10 题，标知识点和难度。"

**routing**：

```jsonc
{
  "recommendedFamily": "assessment_work",
  "recommendedSubtype": "practice_sheet",
  "confidence": 0.85,
  "reasons": ["命中『练习/巩固/训练/小测/课后』关键词"]
}
```

**关键参数**：

```jsonc
{ "style_preset": "warm_amber", "density": "compact",
  "columns": "single", "answer_space": "short" }
```

**产物特征**：

- 暖色调（warm_amber 暖橙）
- 每题左侧标 chip：知识点 + 难度（⭐⭐⭐）
- 短答题区
- 可分基础 / 提升 / 拓展三档（用 section-title 区分）

---

## 3. 题单（question_set）

**典型对话**：

> "把这些错题整理成专题题单，标一下题源和考点。"

**routing**：

```jsonc
{
  "recommendedFamily": "assessment_work",
  "recommendedSubtype": "question_set",
  "confidence": 0.80,
  "reasons": ["命中『题单/专题/错题/作业』关键词"]
}
```

**关键参数**：

```jsonc
{ "style_preset": "academic_blue", "density": "compact",
  "columns": "single", "answer_space": "short" }
```

**产物特征**：

- 蓝色学术风
- 每题顶部 q-meta：来源 chip + 知识点 chip + 难度 chip
- 含订正区（小答案区）
- `<details>` 折叠的"参考答案"

---

## 4. 默写纸（dictation_sheet）

**典型对话**：

> "做三年级语文上册第一单元生字默写纸，每个字给 8 个田字格。"

**routing**：

```jsonc
{
  "recommendedFamily": "assessment_work",
  "recommendedSubtype": "dictation_sheet",
  "confidence": 0.90,
  "reasons": ["命中『默写/听写/背诵/单词/古诗』关键词", "学科：语文"]
}
```

**关键参数**：

```jsonc
{ "style_preset": "classic_black_white", "density": "spacious",
  "columns": "single", "answer_space": "grid",
  "diagram_dependent": false, "requires_mathjax": false }
```

**产物特征**：

- spacious 密度（书写空间充足）
- 每个生字一行：拼音 chip + 8 个田字格 + 订正格
- 无答案区
- 风格朴素

---

## 5. 教师教案（teacher_lesson_plan）

**典型对话**：

> 用户上传 `10.2.1 代入消元法.source-package.json`，说"帮我做成可打印的教案"。

**routing**：

```jsonc
{
  "recommendedFamily": "learning_document",
  "recommendedSubtype": "teacher_lesson_plan",
  "confidence": 1.00,
  "reasons": ["含教学环节标志（教学目标/教学重点/教学过程 等）",
              "命中『教师活动/学生活动/设计意图』"]
}
```

**关键参数**：

```jsonc
{ "style_preset": "academic_blue", "density": "compact",
  "columns": "single", "answer_space": "none",
  "audience": "teacher" }
```

**产物特征**：

- 封面：LESSON · 教案打印版 + 主标题 + 学科/年级/课时信息卡
- 教学环节徽章（圆形 · / 一 / 二 / 三...）
- 教师专属语义块：【问题】【师生活动】【设计意图】【追问】【新知】
- 公式图自动按尺寸分级（formula_inline / formula_block / figure_large）
- 单栏，紧凑

---

## 6. 学生讲义（student_handout）

**典型对话**：

> 用户上传初一英语备课资料，说"做一份学生讲义"。

**routing**：

```jsonc
{
  "recommendedFamily": "learning_document",
  "recommendedSubtype": "student_handout",
  "confidence": 0.75,
  "reasons": ["含讲义结构关键词：例题、概念、方法",
              "题量少 + 标题层级丰富 → 倾向讲义"]
}
```

**关键参数**：

```jsonc
{ "style_preset": "warm_amber",     // 低年级
  "density": "standard",
  "columns": "single", "answer_space": "short",
  "audience": "student" }
```

**产物特征**：

- 学习目标 banner（"📌 本节学习目标"）
- 知识讲解卡（kcard）
- 例题盒（含解答步骤）
- 思考盒（"想一想"）
- 标准密度

---

## 7. 知识清单（knowledge_sheet）

**典型对话**：

> 用户上传 `三语下考点清单.source-package.json`，说"做成知识清单"。

**routing**：

```jsonc
{
  "recommendedFamily": "knowledge_reference",
  "recommendedSubtype": "knowledge_sheet",
  "confidence": 1.00,
  "reasons": ["命中『知识清单/公式/语法/易错点/考点』关键词"]
}
```

**关键参数**：

```jsonc
{ "style_preset": "academic_green", "density": "compact",
  "columns": "double", "answer_space": "none" }
```

**产物特征**：

- 章节标题 + 双栏 / 多栏
- 每个知识点独立 kcard：title + tag + body
- 易错点用警告色（红/橙）边框
- 公式表用左公式 + 右说明的两栏 kcard
- 高信息密度

---

## 8. 杂志风资料（magazine_article）

**典型对话**：

> 用户上传 `小数算数杂志风.source-package.json`，说"排成杂志风的主题阅读"。

**routing**：

```jsonc
{
  "recommendedFamily": "magazine_reading",
  "recommendedSubtype": "magazine_article",
  "confidence": 0.30,                     // 关键词匹配低
  "reasons": ["内容特征：长段落 + 衬线倾向"],
  "userIntent": "杂志风"                   // 用户显式提到，覆盖 routing
}
```

**关键参数**：

```jsonc
{ "style_preset": "magazine_light", "density": "spacious",
  "columns": "double", "answer_space": "none",
  "fidelity_mode": "editable_relayout" }
```

**产物特征**：

- 大幅封面：MATH READING / FEATURE / VOL.XXX 三栏 meta-line
- 衬线大标题（24pt+）+ 副标题 + 作者
- drop-cap 段首字母放大
- 双栏正文，自动分栏
- 章节小标题（左色条）
- 大幅水墨/插图配图（来自 imageLedger，或 AI 装饰图标注）
- pull-quote 引文
- 杂志脚标

---

## 9. 路由低置信度时的 ask_user 模板

```jsonc
{
  "type": "SINGLE_CHOICE",
  "question": "您希望我把这份资料做成哪类版式？",
  "options": [
    { "value": "exam_paper",        "label": "试卷（A4 标准考试）" },
    { "value": "practice_sheet",    "label": "练习单（课堂训练）" },
    { "value": "question_set",      "label": "题单（专题/错题集）" },
    { "value": "dictation_sheet",   "label": "默写纸（写字格）" },
    { "value": "teacher_lesson_plan", "label": "教案（教师备课打印）" },
    { "value": "student_handout",   "label": "讲义（学生学习材料）" },
    { "value": "knowledge_sheet",   "label": "知识清单（高密度查阅）" },
    { "value": "magazine_article",  "label": "杂志风（主题阅读）" }
  ]
}
```

---

## 10. 错误使用示例（v63 严禁）

| 错误 | 原因 | 正确做法 |
|---|---|---|
| 把数学试卷做成杂志风（衬线 + drop-cap） | 杂志风不能用于学科正式试卷 | exam_paper 必须 classic_black_white |
| 把教案做成学生讲义（删去【设计意图】） | 教案的教师专属语义块不能简化 | teacher_lesson_plan 必须保留所有教师视角语义 |
| 默写纸用 compact 密度 | 默写纸需要书写空间 | spacious 密度 |
| 试卷用 generate_image 替代几何图 | 数学学科严禁 AI 替代题图 | 必须用 imageLedger 真图 |
| 知识清单做成单栏松散布局 | 知识清单要高密度 | double / multi 栏 |
| 杂志风用于物理实验装置图说明 | 物理实验图不能 AI 化 | 物理→ student_handout 或 teacher_lesson_plan |
