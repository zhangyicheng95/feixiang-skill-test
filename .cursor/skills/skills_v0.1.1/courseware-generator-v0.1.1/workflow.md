# 多页课件 · 调用流程图

> 路径：`workflow.md`
> 入口：`SKILL.md`。下图展示 Read / Write / 复制 的调用顺序与分支。

---

## 总览

```mermaid
flowchart TD
    START([用户请求多页课件]) --> ENTRY[Read SKILL.md]
    ENTRY --> S1[Step 1 素材]
    S1 --> S2[Step 2 内容]
    S2 --> S3[Step 3 验收]
    S3 --> PASS{must-cover 全通过?}
    PASS -->|是| DONE([交付 pages/slug/])
    PASS -->|否| FIX[回 Step 2 修复]
    FIX --> S3

    S1 -.->|禁止跳过| S2
    S3 -.->|未通过禁止交付| DONE
```

---

## Step 1：素材

```mermaid
flowchart TD
    S1_START([Step 1 开始]) --> R_OUTLINE[Read outline-guidance.md]
    R_OUTLINE --> SPEC[整理 spec 四字段<br/>mode / requirements / require / forbid / core-loop]
    R_OUTLINE --> W_OUTLINE[Write pages/slug/outline.md<br/>逐页表 + core-loop 标注]
    W_OUTLINE --> CONFIRM{用户确认大纲?}
    CONFIRM -->|否| REVISE[按反馈修改 outline.md]
    REVISE --> CONFIRM
    CONFIRM -->|是| W_ASSETS[Write pages/slug/assets-manifest.md<br/>URL / CSS自绘 / coverImageSlot]
    W_ASSETS --> S1_CHECK{Step 1 自检通过?}
    S1_CHECK -->|否| R_OUTLINE
    S1_CHECK -->|是| S1_END([进入 Step 2])
```

**产物**：`outline.md`、`assets-manifest.md`

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
    R_QUIZ --> READ_PAGES[Read outline.md + assets-manifest.md]
    READ_PAGES --> W_HTML[Write pages/slug/index.html<br/>page-shared + 全部 page-data]
    W_HTML --> COPY[复制 assets/courseware-shell.js<br/>→ pages/slug/ 只复制不 Read]
    COPY --> SELF[对照 outline 逐页自检<br/>references/html.md §八]
    SELF --> S2_END([进入 Step 3])
```

**产物**：`index.html`、`courseware-shell.js`

---

## Step 3：验收

```mermaid
flowchart TD
    S3_START([Step 3 开始]) --> R_TEST[Read ../test-html-v0.1.1/SKILL.md]
    R_TEST --> R_GUIDE[Read ../test-html-v0.1.1/guide.md]
    R_GUIDE --> MUST[从 spec / core-loop 抽 must-cover]
    MUST --> BROWSER[本地浏览器或 Playwright 打开<br/>http://127.0.0.1:port/index.html]
    BROWSER --> HAND[逐项手测<br/>壳加载 / 翻页 / saveState / cwScore…]
    HAND --> CARD[输出验证结论卡]
    CARD --> OK{全部通过?}
    OK -->|否| BACK[回 Step 2 修复]
    OK -->|是| S3_END([可宣称交付])
```

**外部 Skill**：`../test-html-v0.1.1/SKILL.md`

---

## 文件调用关系

```mermaid
flowchart LR
    subgraph entry [入口]
        SKILL[SKILL.md]
    end

    subgraph step1 [Step 1 · Read + Write]
        OUTLINE_G[outline-guidance.md]
        OUTLINE_W[(outline.md)]
        ASSETS_W[(assets-manifest.md)]
    end

    subgraph step2 [Step 2 · Read + Write + 复制]
        HTML_R[references/html.md]
        STYLE_R[style-guide.md]
        TYPO_R[references/typography.md]
        COVER_R[references/cover.md]
        QUIZ_R[references/quiz.md]
        SHELL[(courseware-shell.js)]
        INDEX_W[(index.html)]
    end

    subgraph step3 [Step 3 · Read + 浏览器]
        TEST[../test-html-v0.1.1/SKILL.md]
        GUIDE[../test-html-v0.1.1/guide.md]
    end

    SKILL --> OUTLINE_G
    OUTLINE_G --> OUTLINE_W
    OUTLINE_W --> ASSETS_W

    ASSETS_W --> HTML_R
    HTML_R --> STYLE_R
    STYLE_R --> TYPO_R
    TYPO_R --> COVER_R
    COVER_R --> QUIZ_R
    QUIZ_R --> INDEX_W
    HTML_R --> INDEX_W
    SHELL --> INDEX_W

    INDEX_W --> TEST
    TEST --> GUIDE
```

| 图例 | 含义 |
|------|------|
| 方框 | Skill 内 md（Read） |
| 圆角框 | 产物文件（Write 或复制） |
| 虚线禁止 | 跳过 Step 1 / 未验收即交付 |
