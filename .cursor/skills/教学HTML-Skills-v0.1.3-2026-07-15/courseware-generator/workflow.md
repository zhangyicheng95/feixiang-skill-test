# 多页课件 · 调用流程图

> 路径：`courseware-generator/workflow.md`
> 入口：`SKILL.md`。下图展示 Read / Write / create_file 注入壳 / 验收的调用顺序与分支。

---

## 总览

```mermaid
flowchart TD
    START([用户请求多页课件]) --> ENTRY[Read SKILL.md]
    ENTRY --> S1[Step 1 素材]
    S1 --> S2[Step 2 内容]
    S2 --> S3[Step 3 验收]
    S3 --> PASS{must-cover 全通过?}
    PASS -->|是| DONE([交付单个 slug.html])
    PASS -->|否| FIX[回 Step 2 修复]
    FIX --> S3

    S1 -.->|禁止跳过| S2
    S3 -.->|未通过禁止交付| DONE
```

---

## Step 1：素材

```mermaid
flowchart TD
    S1_START([Step 1 开始]) --> R_CONTRACT[Review SKILL.md 内置 spec/assets 合同]
    R_CONTRACT --> R_OUTLINE[Read outline-guidance.md]
    R_OUTLINE --> SPEC[整理 spec 四字段<br/>mode / requirements / require / forbid / core-loop]
    R_OUTLINE --> W_OUTLINE[形成 outline 数据<br/>逐页表 + core-loop 标注]
    W_OUTLINE --> CONFIRM{用户确认大纲?}
    CONFIRM -->|否| REVISE[按反馈修改 outline]
    REVISE --> CONFIRM
    CONFIRM -->|是| W_ASSETS[形成 assets 数据<br/>URL / CSS自绘 / coverImageSlot]
    W_ASSETS --> IMG{需要生图?}
    IMG -->|是| SLOT{封面图?}
    SLOT -->|是| R_COVER[Read cover.md 定 coverImageSlot]
    SLOT -->|否| R_IMG[Read image-generation.md<br/>命中式增强 prompt]
    R_COVER --> R_IMG
    R_IMG --> CALL_IMG[调用 generate_images]
    CALL_IMG --> REC[写入 artifact-spec.assets<br/>真实 URL + prompt + styleHit]
    IMG -->|否| S1_CHECK{Step 1 自检通过?}
    REC --> S1_CHECK
    S1_CHECK -->|否| R_CONTRACT
    S1_CHECK -->|是| S1_END([进入 Step 2])
```

**阶段数据**：`artifact-spec.outline`、`artifact-spec.assets`  
**生图闸门**：调用 `generate_images` 前必读 `references/cover.md`（封面）+ `references/image-generation.md`；工具不可用则自绘并声明。

---

## Step 2：内容

```mermaid
flowchart TD
    S2_START([Step 2 开始]) --> R_HTML[Read references/html.md]
    R_HTML --> R_STYLE[Read style-guide.md<br/>选色板 / 组件 / 防溢出]
    R_STYLE --> R_TYPO[Read references/typography.md<br/>选 1 套字体 preset]
    R_TYPO --> R_COVER[Read references/cover.md<br/>选封面版式]
    R_COVER --> HAS_QUIZ{outline 含练习页?}
    HAS_QUIZ -->|是| R_QUIZ[Read references/quiz.md]
    HAS_QUIZ -->|否| READ_PAGES
    R_QUIZ --> READ_PAGES[Read artifact-spec.outline + assets]
    READ_PAGES --> W_HTML[组装 slug.html<br/>artifact-spec + page-shared + 全部 page-data]
    W_HTML --> PLACEHOLDER[在 body 末尾放置<br/>COURSEWARE_SHELL_INJECTED_BY_CREATE_FILE]
    PLACEHOLDER --> SELF[对照 artifact-spec.outline 逐页自检<br/>references/html.md §八]
    SELF --> S2_END([进入 Step 3])
```

**产物**：单个 `<slug>.html`

---

## Step 3：验收

```mermaid
flowchart TD
    S3_START([Step 3 开始]) --> R_TEST[Read teaching-page-test-html]
    R_TEST --> R_GUIDE[Read teaching-page-test-html guide]
    R_GUIDE --> MUST[从 spec / core-loop 抽 must-cover]
    MUST --> STATIC[create_file 注入壳并写入后回读<br/>结构 / 依赖 / artifact-spec / 内联壳]
    STATIC --> AVAILABLE{动态工具可用?}
    AVAILABLE -->|是| BROWSER[浏览器或 Playwright 打开工具可访问地址]
    BROWSER --> HAND[逐项手测<br/>壳加载 / 翻页 / saveState / cwScore…]
    AVAILABLE -->|否| CARD
    HAND --> CARD[输出验证结论卡]
    CARD --> OK{全部通过?}
    OK -->|否| BACK[回 Step 2 修复]
    OK -->|是| S3_END([可宣称交付])
```

**外部 Skill**：`teaching-page-test-html`

---

## 文件调用关系

```mermaid
flowchart LR
    subgraph entry [入口]
        SKILL[SKILL.md]
    end

    subgraph step1 [Step 1 · Read + Write]
        CONTRACT[SKILL.md 内置 spec/assets 合同]
        OUTLINE_G[outline-guidance.md]
        OUTLINE_W[(artifact-spec.outline)]
        ASSETS_W[(artifact-spec.assets)]
    end

    subgraph step2 [Step 2 · Read + Write + 占位符]
        HTML_R[references/html.md]
        STYLE_R[style-guide.md]
        TYPO_R[references/typography.md]
        COVER_R[references/cover.md]
        QUIZ_R[references/quiz.md]
        PLACEHOLDER_W[(COURSEWARE_SHELL_INJECTED_BY_CREATE_FILE)]
        INDEX_W[(slug.html)]
    end

    subgraph step3 [Step 3 · Read + 浏览器]
        TEST[teaching-page-test-html]
        GUIDE[teaching-page-test-html guide]
    end

    SKILL --> CONTRACT
    CONTRACT --> OUTLINE_G
    OUTLINE_G --> OUTLINE_W
    OUTLINE_W --> ASSETS_W

    ASSETS_W --> HTML_R
    HTML_R --> STYLE_R
    STYLE_R --> TYPO_R
    TYPO_R --> COVER_R
    COVER_R --> QUIZ_R
    QUIZ_R --> INDEX_W
    HTML_R --> INDEX_W
    PLACEHOLDER_W --> INDEX_W

    INDEX_W --> TEST
    TEST --> GUIDE
```

| 图例 | 含义 |
|------|------|
| 方框 | Skill 内 md（Read） |
| 圆角框 | 阶段数据、源文件或最终产物 |
| 虚线禁止 | 跳过 Step 1 / 未验收即交付 |
