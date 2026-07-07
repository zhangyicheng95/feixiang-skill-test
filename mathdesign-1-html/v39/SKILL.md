---
name: Mathdesign-1-html
description: [MANDATORY EXECUTION INSTRUCTION] Decisions MUST be based on the "overall semantics / image". Whenever the user's intent involves math-related knowledge points, the provided color-matching mechanism MUST be enforced. ALL color schemes MUST be loaded, including [A-Color 01-11] and [B-Color 01-20], totaling 31 color codes. Matching mechanism: For knowledge belonging to the primary-school stage (Grades 1-6), one color scheme MUST be randomly selected from the [Vibrant High-Saturation] color system [A-Color 01-11] for the HTML design, in order to achieve a highly attractive visual effect; for knowledge belonging to the middle-school and high-school stages (Grades 7-12), one color scheme MUST be randomly selected from the [Intellectual Low-Saturation] color system [B-Color 01-20] for the HTML design, ensuring a rational, restrained and intellectually engaging visual style, thereby improving comprehension efficiency for upper-grade students.
---

更新时间：2026-05-08

## I. Hard Visual Requirements (Visual Identity)
- Reference visible-area ratio: 16:7. Prefer displaying all interactions within a single screen. When the content exceeds the visible area, it is recommended to address it via:
   - Step Navigation
   - Card Tab switching
- Vertical scrolling is allowed (when necessary)
- The illustration/demonstration area MUST maintain visual impact through color filling. The Color Palettes configuration MUST be read.
- The Color Palettes configuration page MUST be invoked
- The page MUST be designed according to my type-size system
- Buttons share a unified height: 80px
- The page adopts a "safe area" design
- `grid` is used only for modules and MUST NOT be used to lock the overall height
- Emoji symbols in front of text are forbidden. If specific elements must be generated, they MUST be drawn as SVG graphics; the graphics must also conform to the color requirements and follow a minimal-geometric / illustration design style.

---

## II. Hard Layout Constraints (Visual & Layout Constraints)

- **Single-Screen Priority**:
  - The AI MUST plan content density with the highest goal of "no global scrollbar".
  - **Layout formula**: Container(flex) = Header(fixed) + Stage(flex-grow: 1 + overflow-y: auto) + Controls(flex-shrink: 0).
  - **Core meaning**: Ensure the title and the buttons always stay on the first screen, while only the middle demonstration content provides local scrolling when necessary.
- **Elastic font-size protection**:
  - The default H1 is 42px. When the content is detected as likely to trigger scrolling, prefer shrinking via `clamp(30px, 5vh, 42px)` instead of letting it overflow.
- **Safe boundary**:
  - A fixed `20px` gap MUST be reserved above the bottom button (80px) to prevent the content from sticking to the interactive components.

---

## III. Typography (MUST be strictly enforced)

- H1 = 40px / font-weight: 700 !important** (the weight MUST be guaranteed to prevent framework overrides)
- H2 = 30px / font-weight:600
- H3 = 28px / font-weight:500
- Body = 28px/ font-weight:500
- Caption ≥ 22px/ font-weight:300
- Button font-size = 28px/font-weight:500

---

## V. Color Palettes
Requirements:
- ALL color schemes MUST be read, including A-Color 01-11 and B-Color 01-20, totaling 31 color codes
- It is forbidden to always pick the first scheme
- It is forbidden to bias toward the first few schemes

### A. [Vibrant High-Saturation] color system, 11 schemes in total, suited for primary-school knowledge points (Grades 1-6). Important: one of the following colors MUST be randomly selected.
 #### A-Color 01 - Background: #F3F3F3
- All text colors (Text): #000000
- Primary: #FFDF5E

- Card color/style:
background: #F3F3F3;
border: 4px solid rgba(0, 0, 0, 0.30);
border-radius: 20px;

- Button color/style: (strictly follow the requirement)
01: Core button
background: #FFDF5E;
border: 4px solid #DDB103;
border-radius: 20px; color: #000000 (text on the button)
02: Secondary / unselected button
background: #FFFFFF;
border: 4px solid #E2E2E2;
border-radius: 20px; color: #000000 (text on the button)
 - Knowledge-demo area color/style: 01: Demo-area background: Background:  background: #EBEBEB;
border: 6px solid #CFCFCF;
border-radius: 20px;
Background grid: (note: this is the background for graphics/formulas/models and all primary information)
linear-gradient(#DADADA 1px, transparent 1px),
linear-gradient(90deg, #DADADA 1px, transparent 1px);
background-size: 30px 30px;  02: Knowledge-demo area colors (3D / graphics / charts / geometry, etc. demos MUST use 100% of the colors below. Important: avoid the issue of appearing too dark or unclear due to insufficient lighting; ensure the colors are reproduced more vividly and faithfully.)
  01 background: #FFDF5E;
border: 6px solid #DDB103;
  02 background: #FD6638;
border: 6px solid #DE3602;
  03
background: #FFB8B8;
border: 6px solid #FF7B7B;
  04
background: #9A5000;
border: 6px solid #6F3A00;
  05
background: #AEF89C;
border: 6px solid #6CE34F;
  06
background: #198AEC;
border: 6px solid #066DC7;
  07
background: #02543B;
border: 6px solid #023223;
 - Design keywords / tags: If the user has a modeling need, apply [minimal, geometric style, clean, blocky, low-detail] processing; otherwise ignore.
Tags: high-contrast palette, minimal educational visualization, shadowless flat fill, structural-decomposition teaching

#### Color A-02 - Background: #E3E3E3
- All text colors (Text): #2F0400
- Primary: #2F0400

- Card color/style:
background: #EEEEEE;
border: 1px solid rgba(20, 20, 20, 0.30);
border-radius: 20px;

- Button color/style: (strictly follow the requirement)
01: Core button
background: #FF7B50;
border: 3px solid #E13120;
border-radius: 20px; color: #2F0400 (text on the button)
02: Secondary / unselected button
background: #EEEEEE;
border: 3px solid #989898;
border-radius: 20px; color: #2F0400 (text on the button)
 - Knowledge-demo area color/style: 01: Demo-area background: background: #EEEEEE;
border: 1px solid #A2A2A2;
border-radius: 20px;
Background grid: (note: this is the background for graphics/formulas/models and all primary information)
linear-gradient(#E3E3E3 1px, transparent 1px),
linear-gradient(90deg, #E3E3E3 1px, transparent 1px);
background-size: 30px 30px;  02: Knowledge-demo area colors (3D / graphics / charts / geometry, etc. demos MUST use 100% of the colors below. Important: avoid the issue of appearing too dark or unclear due to insufficient lighting; ensure the colors are reproduced more vividly and faithfully.)
  01 background: #FEFA4C;
border: 5px solid #CD8702;
  02 background: rgba(250, 155, 249, 0.90);
border: 5px solid #E93D7E;
  03
background: #FF7B50;
border: 5px solid #C20D0D;
 - Design keywords / tags: If the user has a modeling need, apply [minimal, geometric style, clean, blocky, low-detail] processing; otherwise ignore.
Tags: high-contrast palette, minimal educational visualization, shadowless flat fill, structural-decomposition teaching

#### Color A-03 - Background: #ECECE6
- All text colors (Text): #012419
- Primary: #DFFF18

- Card color/style:
background: #ECECE6;
border: 1px solid rgba(0, 0, 0, 0.30);
border-radius: 20px;

- Button color/style: (strictly follow the requirement)
01: Core button
background: #012419
border: 1px solid #012419;
border-radius: 20px; color: #DFFF18 (text on the button)
02: Secondary / unselected button
background: #FFFFFF;
border: 1px solid #012419;
border-radius: 20px; color: #012419 (text on the button)
 - Knowledge-demo area color/style: 01: Demo-area background: Background:  background: #E2E3DB;
border: 1px solid rgba(0, 0, 0, 0.30);
border-radius: 20px;
Background grid: (note: this is the background for graphics/formulas/models and all primary information)
linear-gradient(#CBD0C8 1px, transparent 1px),
linear-gradient(90deg, #CBD0C8 1px, transparent 1px);
background-size: 30px 30px;  02: Knowledge-demo area colors (3D / graphics / charts / geometry, etc. demos MUST use 100% of the colors below. Important: avoid the issue of appearing too dark or unclear due to insufficient lighting; ensure the colors are reproduced more vividly and faithfully.)
  01 background: #DFFF18;
border: 2px solid #759119;
border-radius: 2px;
  02 background: #33FCB4;
border: 2px solid #118D7E;
border-radius: 2px;
  03
background: #4C28B1;
border: 2px solid #2D1066;
border-radius: 2px;
  04
background: #3F4E15;
border: 2px solid #203202;
border-radius: 2px;
  05
background: #D947F2;
border: 2px solid #7A1957;
border-radius: 2px;
  06
background: #012419;
border: 2px solid #3F2C02;
border-radius: 2px;
 - Design keywords / tags: If the user has a modeling need, apply [minimal, geometric style, clean, blocky, low-detail] processing; otherwise ignore.
Tags: high-contrast palette, minimal educational visualization, shadowless flat fill, structural-decomposition teaching

#### Color A-04 - Background: #F4F4F4
- All text colors (Text): #012103
- Primary: #FF6A18

- Card color/style:
background: #F4F4F4;
border: 1px solid rgba(0, 0, 0, 0.30);
border-radius: 26px;

- Button color/style: (strictly follow the requirement)
01: Core button
background: #FF6A18;
border: 1px solid rgba(0, 0, 0, 0.30);
border-radius: 26px; color: #012103 (text on the button)
02: Secondary / unselected button
background: #DADADA;
border: 1px solid rgba(0, 0, 0, 0.30);
border-radius: 26px; color: #012103 (text on the button)
 - Knowledge-demo area color/style: 01: Demo-area background: background: #158A60;
border: 1px solid #789079;
border-radius: 26px;
Background grid: (note: this is the background for graphics/formulas/models and all primary information)
linear-gradient(#148259 1px, transparent 1px),
linear-gradient(90deg, #148259 1px, transparent 1px);
background-size: 30px 30px;  02: Knowledge-demo area colors (3D / graphics / charts / geometry, etc. demos MUST use 100% of the colors below. Important: avoid the issue of appearing too dark or unclear due to insufficient lighting; ensure the colors are reproduced more vividly and faithfully.)
  01 background: #FFEF5A;
border: 3px solid #9A6E02;
  02 background: #FF6A18;
border: 3px solid #7A2B00;
  03
background: #95A6FE;
border: 3px solid #4D4CD4;
  04
background: #FFC4CB;
border: 3px solid #DA606F;
  05
background: #00D588;
border: 3px solid #026044;
 - Design keywords / tags: If the user has a modeling need, apply [minimal, geometric style, clean, blocky, low-detail] processing; otherwise ignore.
Tags: high-contrast palette, minimal educational visualization, shadowless flat fill, structural-decomposition teaching

#### Color A-05 - Background: #F4F4F4
- All text colors (Text): #000000
- Primary: #05C3FB

- Card color/style:
background: #F4F4F4;
border: 1px dashed #000000;
border-radius: 26px;
stroke-dasharray: 12 6;

- Button color/style: (strictly follow the requirement)
01: Core button
background: #05C3FB;
border: 1px dashed #000000;
stroke-dasharray: 12 6;
border-radius: 26px; color: #012103 (text on the button)
02: Secondary / unselected button
background: #E4E4E4;
border: 1px dashed #000000;
stroke-dasharray: 12 6;
border-radius: 26px; color: #000000 (text on the button)
 - Knowledge-demo area color/style: 01: Demo-area background: background: #FBED6C;
border: 1px dashed #000000;
border-radius: 26px;
stroke-dasharray: 12 6;
Background grid: (note: this is the background for graphics/formulas/models and all primary information)
linear-gradient(#F7D61A 1px, transparent 1px),
linear-gradient(90deg, #F7D61A9 1px, transparent 1px);
background-size: 30px 30px;
stroke-dasharray: 2 2;  02: Knowledge-demo area colors (3D / graphics / charts / geometry, etc. demos MUST use 100% of the colors below. Important: avoid the issue of appearing too dark or unclear due to insufficient lighting; ensure the colors are reproduced more vividly and faithfully.)
  01 background: #97FA3B;
border: 8px dashed #000000;
border-radius: 4px;
stroke-dasharray: 30 8;
  02 background: #FF3D00;
border: 8px dashed #000000;
border-radius: 4px;
stroke-dasharray: 30 8;
  03 background: #000000;
border: 8px dashed #000000;
border-radius: 4px;
stroke-dasharray: 30 8;
  04 background: #05C3FB;
border: 8px dashed #000000;
border-radius: 4px;
stroke-dasharray: 30 8;
  05 background: #F794FF;
border: 8px dashed #000000;
border-radius: 4px;
stroke-dasharray: 30 8;
 - Design keywords / tags: If the user has a modeling need, apply [minimal, geometric style, clean, blocky, low-detail] processing; otherwise ignore.
Tags: high-contrast palette, minimal educational visualization, shadowless flat fill, structural-decomposition teaching

#### Color A-06 - Background: #FDE9E5
- All text colors (Text): #3B0303
- Primary: #3B0303
- Highlight / Accent: #FB6D92

- Card color/style:
background: #FDE9E5;
border: 1px solid rgba(59, 3, 3, 0.30);
border-radius: 20px;

- Button color/style: (strictly follow the requirement)
01: Core button
background: #3B0303;
border: 1px solid rgba(59, 3, 3, 0.30);
border-radius: 20px; color: #FFFFFF (text on the button)
02: Secondary / unselected button
background: #FEEDEA;
border: 2px solid rgba(0, 0, 0, 0.30);
border-radius: 20px; color: #3B0303 (text on the button)
 - Knowledge-demo area color/style: 01: Demo-area background: Background:  background: #FFF9F9;
border: 1px solid rgba(59, 3, 3, 0.30);
border-radius: 20px;
Background grid: (note: this is the background for graphics/formulas/models and all primary information)
linear-gradient(#F1E7E7 1px, transparent 1px),
linear-gradient(90deg, #F1E7E7 1px, transparent 1px);
background-size: 30px 30px;  02: Knowledge-demo area colors (3D / graphics / charts / geometry, etc. demos MUST use 100% of the colors below. Important: avoid the issue of appearing too dark or unclear due to insufficient lighting; ensure the colors are reproduced more vividly and faithfully.)
  01 background: rgba(251, 102, 140, 0.95);
border: 4px solid #FF466C;
  02 background: rgba(9, 122, 53, 0.95);
border: 4px solid #054A20;
  03
background: rgba(229, 82, 39, 0.95);
border: 4px solid #761F05;
  04
background: rgba(249, 179, 22, 0.95);
border: 4px solid #B78106;
  05
background: rgba(13, 129, 185, 0.95);
border: 4px solid #0B4A69;
  06
background: rgba(251, 251, 254, 0.90);
border: 4px solid #02543B;
 - Design keywords / tags: If the user has a modeling need, apply [minimal, geometric style, clean, blocky, low-detail] processing; otherwise ignore.
Tags: high-contrast palette, minimal educational visualization, shadowless flat fill, structural-decomposition teaching

#### Color A-07 - Background: #ACEE9F
- All text colors (Text): #000000
- Primary: #8FE93B

- Card color/style:
background: #CBFC83;
border: 1px solid rgba(0, 0, 0, 0.30);
border-radius: 26px;

- Button color/style: (strictly follow the requirement)
01: Core button
background: #5AE337;
border: 1px solid rgba(0, 0, 0, 0.30);
border-radius: 26px; color: #000000 (text on the button)
02: Secondary / unselected button
background: #8FE93B;
border: 1px solid rgba(0, 0, 0, 0.30);
border-radius: 26px; color: #000000 (text on the button)
 - Knowledge-demo area color/style: 01: Demo-area background: Background:  background: #FFFFFF;
border: 1px solid #CBFC83;
border-radius: 26px;
Background grid: (note: this is the background for graphics/formulas/models and all primary information)
linear-gradient(#EDEDED 1px, transparent 1px),
linear-gradient(90deg, #EDEDED 1px, transparent 1px);
background-size: 20px 20px;  02: Knowledge-demo area colors (3D / graphics / charts / geometry, etc. demos MUST use 100% of the colors below. Important: avoid the issue of appearing too dark or unclear due to insufficient lighting; ensure the colors are reproduced more vividly and faithfully.)
  01 background: #8FE93B;
border: 2px solid #000000;
  02 background: #F84A54;
border: 2px solid #000000;
  03
background: #FF69CF;
border: 2px solid #000000;
  04
background: #53FFF4;
border: 2px solid #000000;
  05
background: #FFF059;
border: 2px solid #000000;
 - Design keywords / tags: If the user has a modeling need, apply [minimal, geometric style, clean, blocky, low-detail] processing; otherwise ignore.
Tags: high-contrast palette, minimal educational visualization, shadowless flat fill, structural-decomposition teaching

#### Color A-08 - Background: #27644D
- All text colors (Text): #F
- Primary: #6AFA77

- Card color/style:
background: #27644D;
border: 1px solid rgba(255, 255, 255, 0.30);
border-radius: 26px;

- Button color/style: (strictly follow the requirement)
01: Core button
background: #6AFA77;
border: 1px solid rgba(255, 255, 255, 0.30);
border-radius: 26px; color: #1B4535 (text on the button)
02: Secondary / unselected button
background: #1B4535;
border: 1px solid rgba(255, 255, 255, 0.30);
border-radius: 26px; color: #FFFFFF (text on the button)
 - Knowledge-demo area color/style: 01: Demo-area background: Background:  background: #EBEDD4;
border: 1px solid #689383;
border-radius: 26px;
Background grid: (note: this is the background for graphics/formulas/models and all primary information)
linear-gradient(#DDE3CA 1px, transparent 1px),
linear-gradient(90deg, #DDE3CA 1px, transparent 1px);
background-size: 30px 30px;  02: Knowledge-demo area colors (3D / graphics / charts / geometry, etc. demos MUST use 100% of the colors below. Important: avoid the issue of appearing too dark or unclear due to insufficient lighting; ensure the colors are reproduced more vividly and faithfully.)
  01 background: rgba(106, 250, 119, 0.95);
border: 3px solid #438B66;
border-radius: 2px;
  02 background: #B292FA;
border: 3px solid #5925CF;
border-radius: 2px;
 - Design keywords / tags: If the user has a modeling need, apply [minimal, geometric style, clean, blocky, low-detail] processing; otherwise ignore.
Tags: high-contrast palette, minimal educational visualization, shadowless flat fill, structural-decomposition teaching

#### Color A-09 - Background: #E0E0E0
- All text colors (Text): #000000
- Primary: #B997F8

- Card color/style:
background: #E0E0E0;
border: 1px solid rgba(20, 20, 20, 0.30);

- Button color/style: (strictly follow the requirement)
01: Core button
background: #B997F8;
border: 1px solid rgba(20, 20, 20, 0.30);
border-radius: 0px; color: #000000 (text on the button)
02: Secondary / unselected button
background: #FBFBFA;
border: 1px solid rgba(20, 20, 20, 0.30);
border-radius: 0px; color: #000000 (text on the button)
 - Knowledge-demo area color/style: 01: Demo-area background: Background:  background: #FCFCFC;
border: 1px solid #A2A2A2;
border-radius: 0px;
Background grid: (note: this is the background for graphics/formulas/models and all primary information)
linear-gradient(#EAEAEA 1px, transparent 1px),
linear-gradient(90deg, #EAEAEA 1px, transparent 1px);
background-size: 30px 30px;  02: Knowledge-demo area colors (3D / graphics / charts / geometry, etc. demos MUST use 100% of the colors below. Important: avoid the issue of appearing too dark or unclear due to insufficient lighting; ensure the colors are reproduced more vividly and faithfully.)
  01 background: #FFE36C;
border: 1px solid #26140D;
  02 background: #B997F8;
border: 2px solid #5F37A8;
  03
background: #5C2B1A;
border: 1px solid #26140D;
 - Design keywords / tags: If the user has a modeling need, apply [minimal, geometric style, clean, blocky, low-detail] processing; otherwise ignore.
Tags: high-contrast palette, minimal educational visualization, shadowless flat fill, structural-decomposition teaching


#### Color A-10 - Background: #FFF3D9
- All text colors (Text): #000000
- Primary: #F8981F 
- Card color/style: background: #FFFFFF;
border: 1px solid rgba(0, 0, 0, 0.30); border-radius: 0;

- Button color/style:
01: Core button
background: #F8981F;
border: 1px solid rgba(0, 0, 0, 0.30); color: #000000 (text on the button)
02: Secondary / unselected button
background: #FFF6E3;
border: 1px solid rgba(0, 0, 0, 0.30); color: #000000 (text on the button)
 - Knowledge-demo area color/style: 
01: Demo-area background: Background: #FFFFFF, border: 1px solid rgba(0, 0, 0, 0.30);
Background grid:
linear-gradient(#ECECEC 1px, transparent 1px),
linear-gradient(90deg, #ECECEC 1px, transparent 1px);
background-size: 30px 30px;  02: Knowledge-demo area colors (3D / graphics / charts / geometry, etc. demos MUST use 100% of the colors below. Important: avoid the issue of appearing too dark or unclear due to insufficient lighting; ensure the colors are reproduced more vividly and faithfully.)
  01 background: rgba(255, 232, 181, 0.95);
border: 2px solid #9D1700;
  02 background: rgba(94, 126, 180, 0.95);
border: 2px solid #31415C;   03 background: rgba(248, 152, 31, 0.95);
border: 2px solid #9D3E00;
  04
background: rgba(61, 51, 52, 0.95);
border: 1px solid #0D0705;   05
background: rgba(166, 207, 239, 0.95);
border: 2px solid #2782C9;  - Design keywords / tags: If modeling is required, apply [minimal, geometric style, clean, blocky, low-detail] processing. Warm-rice educational style, flat pseudo-3D geometry, structural-decomposition interactive courseware, math visualization UI, low-distraction teaching interface, process-oriented interactive demonstration
B-
#### Color A-11 - Background: #E9D9BD
- All text colors (Text): #251310
- Primary: #ED7D4B

- Card color/style: Aside from the illustration area, minimize content shown inside cards and lay out content directly on the background.

- Button color/style: (strictly follow the requirement)
01: Core button
background: #ED7D4B;
border: 1px solid #251310;
border-radius: 20px; color: #251310 (text on the button)
02: Secondary / unselected button
background: #F8F3EA;
border: 1px solid #251310;
border-radius: 20px; color: #251310 (text on the button)
 - Knowledge-demo area color/style: 01: Demo-area background: Background:  background: #F8F3EA;
border: 1px solid rgba(37, 19, 16, 0.30);
border-radius: 26px;
Background grid: (note: this is the background for graphics/formulas/models and all primary information)
linear-gradient(#EEE2DC 1px, transparent 1px),
linear-gradient(90deg, #EEE2DC 1px, transparent 1px);
background-size: 30px 30px;  02: Knowledge-demo area colors (3D / graphics / charts / geometry, etc. demos MUST use 100% of the colors below. Important: avoid the issue of appearing too dark or unclear due to insufficient lighting; ensure the colors are reproduced more vividly and faithfully.)
  01 background: #ED7D4B;
border: 2px solid #B73E09;
  02 background: #4189CC;
border: 2px solid #153B5F;
  03
background: #386250;
border: 2px solid #22372E;
  04
background: #251310;
border: 1px solid #0E0605;
 - Design keywords / tags: If the user has a modeling need, apply [minimal, geometric style, clean, blocky, low-detail] processing; otherwise ignore.
Tags: high-contrast low-saturation palette, minimal educational visualization, shadowless flat fill, structural-decomposition teaching

-

### B. [Intellectual Low-Saturation] color system, suited for middle-school and high-school knowledge points (Grades 7-12). One color scheme from the [Intellectual Low-Saturation] palette MUST be randomly selected; do not analyze which color suits which knowledge point.

#### Color B-01 (Low-saturation Monochrome) - Background: #DCDCDC
- Background grid (Background): 
linear-gradient(#C1C1C1 1px, transparent 1px),
linear-gradient(90deg, #C1C1C1 1px, transparent 1px);
background-size: 30px 30px;
- All text colors (Text): #000000
- Primary: #E81C2B #E81C2B
- Highlight / Accent: #E81C2B 
- Card color/style: background: #F1F1F1;
border: 1px solid rgba(0, 0, 0, 0.40); border-radius: 0;

- Button color/style:
01: Core button
background: #000000;
border: 1px solid rgba(0, 0, 0, 0.40); color: #FFFFFF (white text on the button)
02: Secondary / unselected button
background: #F1F1F1;
border: 1px solid rgba(0, 0, 0, 0.40); color: #000000 (black text on the button)
 - Knowledge-demo color/style: (3D / graphics / charts / geometry, etc. demos MUST use 100% of the colors below. Important: avoid the issue of appearing too dark or unclear due to insufficient lighting; ensure the colors are reproduced more vividly and faithfully.) Main model (geometric body)
background: rgba(249, 250, 252, 0.95);
border: 2px solid #8B9094;  - Design keywords / tags: Low-Poly Wireframe Triangulated Mesh, wireframe topology, geometric skeleton, low-poly modeling, tech-feel geometric expression

#### Color B-02 - Background: #E2ECD3
- All text colors (Text): #012B1F
- Primary: #405E28
- Highlight / Accent: #B5FF8B 
- Card color/style: background: #E2ECD3;
border: 1px solid rgba(1, 43, 31, 0.30); border-radius: 8px;

- Button color/style:
01: Core button
background: #405E28;
border: 1px solid rgba(1, 43, 31, 0.30); border-radius: 8px; color: #E2ECD3 (text on the button)
02: Secondary / unselected button
background: #F7FDF6;
border: 1px solid rgba(1, 43, 31, 0.30); border-radius: 8px; color: #012B1F (text on the button)
 - Knowledge-demo area color/style: 01: Demo-area background: Background: #F7FDF6, border: 1px solid rgba(0, 0, 0, 0.30)
border-radius: 8px;
Background grid:
linear-gradient(#ECF1E6 1px, transparent 1px),
linear-gradient(90deg, #ECF1E6 1px, transparent 1px);
background-size: 30px 30px;  02: Knowledge-demo area colors (3D / graphics / charts / geometry, etc. demos MUST use 100% of the colors below. Important: avoid the issue of appearing too dark or unclear due to insufficient lighting; ensure the colors are reproduced more vividly and faithfully.)
  01 background: #B5FF8B;
border: 2px solid #168D76;
  02 background: #549B22;
border: 2px solid #1C402A;   03 background: #405E28;
border: 2px solid #001912;  - Design keywords / tags: If modeling is required, apply [minimal, geometric style, clean, blocky, low-detail] processing. Warm-rice educational style, flat pseudo-3D geometry, structural-decomposition interactive courseware, math visualization UI, low-distraction teaching interface, process-oriented interactive demonstration

#### Color B-03 - Background: #E4DEBD
- All text colors (Text): #3A1D09
- Primary: #3A1D09

- Card color/style: Aside from the illustration area, minimize content shown inside cards and lay out content directly on the background.

- Button color/style: (strictly follow the requirement)
01: Core button
background: #3A1D09;
border: 1px solid #3A1D09;
border-radius: 20px; color: #E4DEBD (text on the button)
02: Secondary / unselected button
background: #E4DEBD;
border: 1px solid #3A1D09;
border-radius: 20px; color: #3A1D09 (text on the button)
 - Knowledge-demo area color/style: 01: Demo-area background: Background:  background: #E4DEBD;
border: 2px solid rgba(58, 29, 9, 0.30);
border-radius: 26px;
Background grid: (note: this is the background for graphics/formulas/models and all primary information)
linear-gradient(#DDCDAA 1px, transparent 1px),
linear-gradient(90deg, #DDCDAA 1px, transparent 1px);
background-size: 20px 20px;  02: Knowledge-demo area colors (3D / graphics / charts / geometry, etc. demos MUST use 100% of the colors below. Important: avoid the issue of appearing too dark or unclear due to insufficient lighting; ensure the colors are reproduced more vividly and faithfully.)
  01 background: #E3B66F;
border: 2px solid #B47E2B;
  02 background: #724919;
border: 2px solid #493317;
  03
background: #B38248;
border: 2px solid #7B572E;
  04
background: #3A1D09;
border: 1px solid #291512;
 - Design keywords / tags: If the user has a modeling need, apply [minimal, geometric style, clean, blocky, low-detail] processing; otherwise ignore.
Tags: low-saturation palette, minimal educational visualization, shadowless flat fill, structural-decomposition teaching

#### Color 04 - Background: #F4F0E9
- All text colors (Text): #53241E
- Primary: #E3B15D
- Highlight / Accent: #FE721E 
- Card color/style: background: #F4EDDD;
border: 1px solid #966716;
border-radius: 8px;
- Card grid (Background): 
linear-gradient(#ECDFC2 1px, transparent 1px),
linear-gradient(90deg, #ECDFC2 1px, transparent 1px);

- Button color/style:
01: Core button
background: #E3B15D;
border: 1px solid #966716;
border-radius: 8px; color: #53241E (text on the button)
02: Secondary / unselected button
background: #F4EDDD;
border: 1px solid #966716;
border-radius: 8px; color: #53241E (text on the button)
 02: Knowledge-demo area colors (3D / graphics / charts / geometry, etc. demos MUST use 100% of the colors below. Important: avoid the issue of appearing too dark or unclear due to insufficient lighting; ensure the colors are reproduced more vividly and faithfully.) Color 1 #FE721E, Color 2 #E3B15D, Color 3 53241E  - Design keywords / tags: warm brown beige tones, low-saturation palette, minimal geometry, vintage math style, academic style, soft and shadowless, monochromatic outlines, high-contrast text

#### Color B-05 - Background: #FFF3D9
- All text colors (Text): #000000
- Primary: #F8981F 
- Card color/style: background: #FFFFFF;
border: 1px solid rgba(0, 0, 0, 0.30); border-radius: 0;

- Button color/style:
01: Core button
background: #F8981F;
border: 1px solid rgba(0, 0, 0, 0.30); color: #000000 (text on the button)
02: Secondary / unselected button
background: #FFF6E3;
border: 1px solid rgba(0, 0, 0, 0.30); color: #000000 (text on the button)
 - Knowledge-demo area color/style: 
01: Demo-area background: Background: #FFFFFF, border: 1px solid rgba(0, 0, 0, 0.30);
Background grid:
linear-gradient(#ECECEC 1px, transparent 1px),
linear-gradient(90deg, #ECECEC 1px, transparent 1px);
background-size: 30px 30px;  02: Knowledge-demo area colors (3D / graphics / charts / geometry, etc. demos MUST use 100% of the colors below. Important: avoid the issue of appearing too dark or unclear due to insufficient lighting; ensure the colors are reproduced more vividly and faithfully.)
  01 background: rgba(255, 232, 181, 0.95);
border: 2px solid #9D1700;
  02 background: rgba(94, 126, 180, 0.95);
border: 2px solid #31415C;   03 background: rgba(248, 152, 31, 0.95);
border: 2px solid #9D3E00;
  04
background: rgba(61, 51, 52, 0.95);
border: 1px solid #0D0705;   05
background: rgba(166, 207, 239, 0.95);
border: 2px solid #2782C9;  - Design keywords / tags: If modeling is required, apply [minimal, geometric style, clean, blocky, low-detail] processing. Warm-rice educational style, flat pseudo-3D geometry, structural-decomposition interactive courseware, math visualization UI, low-distraction teaching interface, process-oriented interactive demonstration

#### Color B-06 - Background: #02211C
- All text colors (Text): #A4D7C4
- Primary: #A4D7C4
- Highlight / Accent: #B694F8 
- Card color/style: background: #02211C;
border: 1px solid rgba(44, 103, 81, 0.50);
border-radius: 0px;

- Button color/style:
01: Core button
background: #A4D7C4;
border: 1px solid rgba(44, 103, 81, 0.50);
border-radius: 0px; color: #02211C (text on the button)
02: Secondary / unselected button
background: #0D2E25;
border: 1px solid rgba(44, 103, 81, 0.50);
border-radius: 0px; color: #A4D7C4 (text on the button)
 - Knowledge-demo area color/style: 01: Demo-area background: Background:  background: #16493A;
border: 1px solid rgba(15, 35, 54, 0.30);
border-radius: 0x;
Background grid: (note: this is the background for graphics/formulas/models and all primary information)
linear-gradient(#2C6751 1px, transparent 1px),
linear-gradient(90deg, #2C6751 1px, transparent 1px);
background-size: 30px 30px;  02: Knowledge-demo area colors (3D / graphics / charts / geometry, etc. demos MUST use 100% of the colors below. Important: avoid the issue of appearing too dark or unclear due to insufficient lighting; ensure the colors are reproduced more vividly and faithfully.)
  01 (If used for modeling, use as the top-face color; if not modeling, ignore) background: rgba(36, 164, 116, 0.90);
border: 1px solid #B1EFC7;
  02 background: #B694F8;
border: 1px solid #8A55F2;
 - Design keywords / tags: If the user has a modeling need, apply [minimal, geometric style, clean, blocky, low-detail] processing; otherwise ignore.
Tags: high-contrast low-saturation palette, minimal educational visualization, shadowless flat fill, structural-decomposition teaching

#### Color B-07 - Background: #0F302F
- All text colors (Text): #EEFFEB
- Primary: #06B17A
- Highlight / Accent: #B6FCE5
- Information accent color: #E44B40 (used for textual content / highlight lines; do not use over large areas) 
- Card color/style: background: #0F302F;
border: 1px solid rgba(238, 255, 235, 0.30);
border-radius: 0px;

- Button color/style:
01: Core button
background: #06B17A;
border: 1px solid rgba(238, 255, 235, 0.30);
border-radius: 0px; color: #FFFFFF (text on the button)
02: Secondary / unselected button
background: #184C49;
border: 1px solid rgba(238, 255, 235, 0.30);
border-radius: 0px; color: #EEFFEB (text on the button)
 - Knowledge-demo area color/style: 01: Demo-area background: Background:  background: #123A37;
border: 1px solid #526F68;
border-radius: 0x;
Background grid: (note: this is the background for graphics/formulas/models and all primary information)
linear-gradient(#164441 1px, transparent 1px),
linear-gradient(90deg, #164441 1px, transparent 1px);
background-size: 15px 15px;  02: Knowledge-demo area colors (3D / graphics / charts / geometry, etc. demos MUST use 100% of the colors below. Important: avoid the issue of appearing too dark or unclear due to insufficient lighting; ensure the colors are reproduced more vividly and faithfully.)
  01 (If used for modeling, use as the top-face color; if not modeling, ignore) background: #06B17A;
border: 2px solid #06B17A;
  02 background: #B6FCE5;
border: 2px solid #06B17A;
  03
background: #EEFFEB;
border: 2px solid #06B17A;
 - Design keywords / tags: If the user has a modeling need, apply [minimal, geometric style, clean, blocky, low-detail] processing; if there is no modeling need, ignore.
Tags: high-contrast low-saturation palette, minimal educational visualization, shadowless flat fill, structural-decomposition teaching

#### Color B-08 - Background: #FFFFFF
- All text colors (Text): #00404D
- Primary: #00404D 
- Card color/style: background: #D3F6F4;
border: 1px solid rgba(0, 64, 77, 0.30);
border-radius: 0px;

- Button color/style:
01: Core button
background: #00404D;
border: 1px solid rgba(0, 64, 77, 0.30);
border-radius: 0px; color: #FFFFFF (text on the button)
02: Secondary / unselected button
background: #ECFCFB;
border: 1px solid rgba(0, 64, 77, 0.30);
border-radius: 0px; color: #00404D (text on the button)
 - Knowledge-demo area color/style: 01: Demo-area background: Background:  background: #D3F6F4;
border: 1px solid #93BFC2;
border-radius: 0x;
Background grid: (note: this is the background for graphics/formulas/models and all primary information)
linear-gradient(#DBF1F0 1px, transparent 1px),
linear-gradient(90deg, #DBF1F0 1px, transparent 1px);
background-size: 15px 15px;  02: Knowledge-demo area colors (3D / graphics / charts / geometry, etc. demos MUST use 100% of the colors below. Important: avoid the issue of appearing too dark or unclear due to insufficient lighting; ensure the colors are reproduced more vividly and faithfully.)
  01 background: rgba(53, 233, 254, 0.95);
border: 2px solid #137F8B;
  02 background: rgba(223, 144, 18, 0.95);
border: 2px solid #513810;
  03 (If used for modeling, use as the dark-face color; if not modeling, ignore)
background: #00404D;
border: 2px solid #00191E;
 - Design keywords / tags: If the user has a modeling need, apply [minimal, geometric style, clean, blocky, low-detail] processing; if there is no modeling need, ignore.
Tags: high-contrast low-saturation palette, minimal educational visualization, shadowless flat fill, structural-decomposition teaching

#### Color B-09 - Background: #E8E8E8
- All text colors (Text): #431504
- Primary: #F55A42

- Card color/style:
background: #E8E8E8;
border: 1px solid rgba(0, 0, 0, 0.30);
border-radius: 10px;

- Button color/style: (strictly follow the requirement)
01: Core button
background: #F55A42;
border: 1px solid rgba(0, 0, 0, 0.30);
border-radius: 10px; color: #431504 (text on the button)
02: Secondary / unselected button
background: #DBDBDB;
border: 1px solid rgba(0, 0, 0, 0.30);
border-radius: 10px; color: #00344C (text on the button)
 - Knowledge-demo area color/style: 01: Demo-area background: Background:  background: #CBCBCB;
border: 1px solid #A2A2A2;
border-radius: 10px;
Background grid: (note: this is the background for graphics/formulas/models and all primary information)
linear-gradient(#C5BFBF 1px, transparent 1px),
linear-gradient(90deg, #C5BFBF 1px, transparent 1px);
background-size: 20px 20px;  02: Knowledge-demo area colors (3D / graphics / charts / geometry, etc. demos MUST use 100% of the colors below. Important: avoid the issue of appearing too dark or unclear due to insufficient lighting; ensure the colors are reproduced more vividly and faithfully.)
  01 background: #F55A42;
border: 2px solid #AC3914;
  02 background: #FCD465;
border: 2px solid #9D3E00;
  03
background: #431504;
border: 1px solid #26140D;
 - Design keywords / tags: If the user has a modeling need, apply [minimal, geometric style, clean, blocky, low-detail] processing; otherwise ignore.
Tags: high-contrast palette, minimal educational visualization, shadowless flat fill, structural-decomposition teaching

#### Color B-10 - Background: #EBEAE5
- All text colors (Text): #213B2A
- Primary: #388E56
- Highlight / Accent: #EC725C 
- Card color/style: background: #EBEAE5;
border: 1px solid rgba(1, 43, 31, 0.30);
border-radius: 10px;

- Button color/style:
01: Core button
background: #265737;
border: 1px solid rgba(1, 43, 31, 0.30);
border-radius: 10px; color: #FBFBFA (text on the button)
02: Secondary / unselected button
background: #FBFBFA;
border: 1px solid rgba(1, 43, 31, 0.30);
border-radius: 10px; color: #213B2A (text on the button)
 - Knowledge-demo area color/style: 01: Demo-area background: Background:  background: #F5F5F2;
border: 1px solid rgba(1, 43, 31, 0.30);
border-radius: 10px;
Background grid: (note: this is the background for graphics/formulas/models and all primary information)
linear-gradient(#E9EAE6 1px, transparent 1px),
linear-gradient(90deg, #E9EAE6 1px, transparent 1px);
background-size: 30px 30px;  02: Knowledge-demo area colors (3D / graphics / charts / geometry, etc. demos MUST use 100% of the colors below. Important: avoid the issue of appearing too dark or unclear due to insufficient lighting; ensure the colors are reproduced more vividly and faithfully.)
  01 background: #388E56;
border: 2px solid #19201B;
  02 background: #EC725C;
border: 2px solid #54241B;
 - Design keywords / tags: If the user has a modeling need, apply [minimal, geometric style, clean, blocky, low-detail] processing; otherwise ignore.
Tags: high-contrast low-saturation palette, minimal educational visualization, shadowless flat fill, structural-decomposition teaching


#### Color B-11 - Background: #EBEAE5
- All text colors (Text): #213B2A
- Primary: #388E56
- Highlight / Accent: #EC725C 
- Card color/style: background: #EBEAE5;
border: 1px solid rgba(1, 43, 31, 0.30);
border-radius: 10px;

- Button color/style:
01: Core button
background: #265737;
border: 1px solid rgba(1, 43, 31, 0.30);
border-radius: 10px; color: #FBFBFA (text on the button)
02: Secondary / unselected button
background: #FBFBFA;
border: 1px solid rgba(1, 43, 31, 0.30);
border-radius: 10px; color: #213B2A (text on the button)
 - Knowledge-demo area color/style: 01: Demo-area background: Background:  background: #F5F5F2;
border: 1px solid rgba(1, 43, 31, 0.30);
border-radius: 10px;
Background grid: (note: this is the background for graphics/formulas/models and all primary information)
linear-gradient(#E9EAE6 1px, transparent 1px),
linear-gradient(90deg, #E9EAE6 1px, transparent 1px);
background-size: 30px 30px;  02: Knowledge-demo area colors (3D / graphics / charts / geometry, etc. demos MUST use 100% of the colors below. Important: avoid the issue of appearing too dark or unclear due to insufficient lighting; ensure the colors are reproduced more vividly and faithfully.)
  01 background: #388E56;
border: 2px solid #19201B;
  02 background: #EC725C;
border: 2px solid #54241B;
 - Design keywords / tags: If the user has a modeling need, apply [minimal, geometric style, clean, blocky, low-detail] processing; otherwise ignore.
Tags: high-contrast low-saturation palette, minimal educational visualization, shadowless flat fill, structural-decomposition teaching

#### Color B-12 - Background: #F3F3F3
- All text colors (Text): #000000
- Primary: #FFDF5E

- Card color/style:
background: #F3F3F3;
border: 4px solid rgba(0, 0, 0, 0.30);
border-radius: 20px;

- Button color/style: (strictly follow the requirement)
01: Core button
background: #FFDF5E;
border: 4px solid #DDB103;
border-radius: 20px; color: #000000 (text on the button)
02: Secondary / unselected button
background: #FFFFFF;
border: 4px solid #E2E2E2;
border-radius: 20px; color: #000000 (text on the button)
 - Knowledge-demo area color/style: 01: Demo-area background: Background:  background: #EBEBEB;
border: 6px solid #CFCFCF;
border-radius: 20px;
Background grid: (note: this is the background for graphics/formulas/models and all primary information)
linear-gradient(#DADADA 1px, transparent 1px),
linear-gradient(90deg, #DADADA 1px, transparent 1px);
background-size: 30px 30px;  02: Knowledge-demo area colors (3D / graphics / charts / geometry, etc. demos MUST use 100% of the colors below. Important: avoid the issue of appearing too dark or unclear due to insufficient lighting; ensure the colors are reproduced more vividly and faithfully.)
  01 background: #FFDF5E;
border: 6px solid #DDB103;
  02 background: #FD6638;
border: 6px solid #DE3602;
  03
background: #FFB8B8;
border: 6px solid #FF7B7B;
  04
background: #9A5000;
border: 6px solid #6F3A00;
  05
background: #AEF89C;
border: 6px solid #6CE34F;
  06
background: #198AEC;
border: 6px solid #066DC7;
  07
background: #02543B;
border: 6px solid #023223;
 - Design keywords / tags: If the user has a modeling need, apply [minimal, geometric style, clean, blocky, low-detail] processing; otherwise ignore.
Tags: high-contrast palette, minimal educational visualization, shadowless flat fill, structural-decomposition teaching

#### Color B-13 - Background: #ECECE6
- All text colors (Text): #012419
- Primary: #DFFF18

- Card color/style:
background: #ECECE6;
border: 1px solid rgba(0, 0, 0, 0.30);
border-radius: 20px;

- Button color/style: (strictly follow the requirement)
01: Core button
background: #012419
border: 1px solid #012419;
border-radius: 20px; color: #DFFF18 (text on the button)
02: Secondary / unselected button
background: #FFFFFF;
border: 1px solid #012419;
border-radius: 20px; color: #012419 (text on the button)
 - Knowledge-demo area color/style: 01: Demo-area background: Background:  background: #E2E3DB;
border: 1px solid rgba(0, 0, 0, 0.30);
border-radius: 20px;
Background grid: (note: this is the background for graphics/formulas/models and all primary information)
linear-gradient(#CBD0C8 1px, transparent 1px),
linear-gradient(90deg, #CBD0C8 1px, transparent 1px);
background-size: 30px 30px;  02: Knowledge-demo area colors (3D / graphics / charts / geometry, etc. demos MUST use 100% of the colors below. Important: avoid the issue of appearing too dark or unclear due to insufficient lighting; ensure the colors are reproduced more vividly and faithfully.)
  01 background: #DFFF18;
border: 2px solid #759119;
border-radius: 2px;
  02 background: #33FCB4;
border: 2px solid #118D7E;
border-radius: 2px;
  03
background: #4C28B1;
border: 2px solid #2D1066;
border-radius: 2px;
  04
background: #3F4E15;
border: 2px solid #203202;
border-radius: 2px;
  05
background: #D947F2;
border: 2px solid #7A1957;
border-radius: 2px;
  06
background: #012419;
border: 2px solid #3F2C02;
border-radius: 2px;
 - Design keywords / tags: If the user has a modeling need, apply [minimal, geometric style, clean, blocky, low-detail] processing; otherwise ignore.
Tags: high-contrast palette, minimal educational visualization, shadowless flat fill, structural-decomposition teaching

#### Color B-14 - Background: #27644D
- All text colors (Text): #F
- Primary: #6AFA77

- Card color/style:
background: #27644D;
border: 1px solid rgba(255, 255, 255, 0.30);
border-radius: 26px;

- Button color/style: (strictly follow the requirement)
01: Core button
background: #6AFA77;
border: 1px solid rgba(255, 255, 255, 0.30);
border-radius: 26px; color: #1B4535 (text on the button)
02: Secondary / unselected button
background: #1B4535;
border: 1px solid rgba(255, 255, 255, 0.30);
border-radius: 26px; color: #FFFFFF (text on the button)
 - Knowledge-demo area color/style: 01: Demo-area background: Background:  background: #EBEDD4;
border: 1px solid #689383;
border-radius: 26px;
Background grid: (note: this is the background for graphics/formulas/models and all primary information)
linear-gradient(#DDE3CA 1px, transparent 1px),
linear-gradient(90deg, #DDE3CA 1px, transparent 1px);
background-size: 30px 30px;  02: Knowledge-demo area colors (3D / graphics / charts / geometry, etc. demos MUST use 100% of the colors below. Important: avoid the issue of appearing too dark or unclear due to insufficient lighting; ensure the colors are reproduced more vividly and faithfully.)
  01 background: rgba(106, 250, 119, 0.95);
border: 3px solid #438B66;
border-radius: 2px;
  02 background: #B292FA;
border: 3px solid #5925CF;
border-radius: 2px;
 - Design keywords / tags: If the user has a modeling need, apply [minimal, geometric style, clean, blocky, low-detail] processing; otherwise ignore.
Tags: high-contrast palette, minimal educational visualization, shadowless flat fill, structural-decomposition teaching

#### Color B-15 - Background: #000000
- All text colors (Text): #FFFFFF
- Primary: #F8EF50

- Card color/style:
background: #232323;
border: 1px solid rgba(188, 227, 223, 0.30);
border-radius: 26px;

- Button color/style: (strictly follow the requirement)
01: Core button
background: #F8EF50;
border: 1px solid #414141;
border-radius: 20px; color: #000000 (text on the button)
02: Secondary / unselected button
background: #414141;
border: 1px solid #B7B7B7;
border-radius: 20px; color: #FFFFFF (text on the button)
 - Knowledge-demo area color/style: 01: Demo-area background: Background:  background: #232323;
border: 1px solid rgba(188, 227, 223, 0.30);
border-radius: 26px;
Background grid: (note: this is the background for graphics/formulas/models and all primary information)
linear-gradient(#393939 1px, transparent 1px),
linear-gradient(90deg, #393939 1px, transparent 1px);
background-size: 20px 20px;  02: Knowledge-demo area colors (3D / graphics / charts / geometry, etc. demos MUST use 100% of the colors below. Important: avoid the issue of appearing too dark or unclear due to insufficient lighting; ensure the colors are reproduced more vividly and faithfully.)
  01 background: #F672AD;
border: 3px solid #000000;
  02 background: #F8EF50;
border: 3px solid #000000;
  03
background: #03DEDE;
border: 3px solid #000000;
  04
background: #0C773B;
border: 3px solid #000000;
  05
background: #F05C35;
border: 3px solid #000000;
  06
background: #6AFA77;
border: 3px solid #000000;
 - Design keywords / tags: If the user has a modeling need, apply [minimal, geometric style, clean, blocky, low-detail] processing; otherwise ignore.
Tags: high-contrast palette, minimal educational visualization, shadowless flat fill, structural-decomposition teaching

#### Color B-16 - Background: #003830
- All text colors (Text): #DDF1EF
- Primary: #89E593

- Card color/style:
background: #003830;
border: 1px solid rgba(188, 227, 223, 0.30);
border-radius: 26px;

- Button color/style: (strictly follow the requirement)
01: Core button
background: #89E593;
border: 4px solid #39B446;
border-radius: 26px; color: #003830 (text on the button)
02: Secondary / unselected button
background: #006F48;
border: 4px solid #003830;
border-radius: 26px; color: #DDF1EF (text on the button)
 - Knowledge-demo area color/style: 01: Demo-area background: Background:  background: #00241C;
border: 1px solid rgba(188, 227, 223, 0.30);
border-radius: 26px;
Background grid: (note: this is the background for graphics/formulas/models and all primary information)
linear-gradient(#163831 1px, transparent 1px),
linear-gradient(90deg, #163831 1px, transparent 1px);
background-size: 30px 30px;  02: Knowledge-demo area colors (3D / graphics / charts / geometry, etc. demos MUST use 100% of the colors below. Important: avoid the issue of appearing too dark or unclear due to insufficient lighting; ensure the colors are reproduced more vividly and faithfully.)
  01 background: #89E593;
border: 4px solid #39B446;
border-radius: 2px;
  02 background: #FFD1DB;
border: 2px solid #FB8BA3;
border-radius: 2px;
  03
background: #5CB5F5;
border: 4px solid #1A618B;
border-radius: 2px;
  04
background: #CE8927;
border: 4px solid #855614;
border-radius: 2px;
  05
background: #FFDF5E;
border: 4px solid #EEB40E;
border-radius: 2px;
  06
background: #005034;
border: 4px solid #004037;
border-radius: 2px;
 - Design keywords / tags: If the user has a modeling need, apply [minimal, geometric style, clean, blocky, low-detail] processing; otherwise ignore.
Tags: high-contrast palette, minimal educational visualization, shadowless flat fill, structural-decomposition teaching

#### Color B-17 - Background: #F4F4F4
- All text colors (Text): #012103
- Primary: #FF6A18

- Card color/style:
background: #F4F4F4;
border: 1px solid rgba(0, 0, 0, 0.30);
border-radius: 26px;

- Button color/style: (strictly follow the requirement)
01: Core button
background: #FF6A18;
border: 1px solid rgba(0, 0, 0, 0.30);
border-radius: 26px; color: #012103 (text on the button)
02: Secondary / unselected button
background: #DADADA;
border: 1px solid rgba(0, 0, 0, 0.30);
border-radius: 26px; color: #012103 (text on the button)
 - Knowledge-demo area color/style: 01: Demo-area background: background: #158A60;
border: 1px solid #789079;
border-radius: 26px;
Background grid: (note: this is the background for graphics/formulas/models and all primary information)
linear-gradient(#148259 1px, transparent 1px),
linear-gradient(90deg, #148259 1px, transparent 1px);
background-size: 30px 30px;  02: Knowledge-demo area colors (3D / graphics / charts / geometry, etc. demos MUST use 100% of the colors below. Important: avoid the issue of appearing too dark or unclear due to insufficient lighting; ensure the colors are reproduced more vividly and faithfully.)
  01 background: #FFEF5A;
border: 3px solid #9A6E02;
  02 background: #FF6A18;
border: 3px solid #7A2B00;
  03
background: #95A6FE;
border: 3px solid #4D4CD4;
  04
background: #FFC4CB;
border: 3px solid #DA606F;
  05
background: #00D588;
border: 3px solid #026044;
 - Design keywords / tags: If the user has a modeling need, apply [minimal, geometric style, clean, blocky, low-detail] processing; otherwise ignore.
Tags: high-contrast palette, minimal educational visualization, shadowless flat fill, structural-decomposition teaching

#### Color B-18 - Background: #201515
- All text colors (Text): #FFFBED
- Primary: #F96524
- Card color/style: background: #201515;
border: 1px solid rgba(255, 251, 237, 0.30);
border-radius: 10px;

- Button color/style:
01: Core button
background: #F96524;
border: 1px solid rgba(255, 251, 237, 0.30);
border-radius: 10px; color: #1C252E (text on the button)
02: Secondary / unselected button
background: #422D2D;
border: 1px solid rgba(255, 251, 237, 0.30);
border-radius: 10px; color: #FFFBED (text on the button)
 - Knowledge-demo area color/style: 01: Demo-area background: Background:  background: #2A1C1C;
border: 1px solid #635A56;
border-radius: 10px;
Background grid: (note: this is the background for graphics/formulas/models and all primary information)
linear-gradient(#392C2B 1px, transparent 1px),
linear-gradient(90deg, #392C2B 1px, transparent 1px);
background-size: 15px 15px;  02: Knowledge-demo area colors (3D / graphics / charts / geometry, etc. demos MUST use 100% of the colors below. Important: avoid the issue of appearing too dark or unclear due to insufficient lighting; ensure the colors are reproduced more vividly and faithfully.)
  01 background: rgba(53, 233, 254, 0.95);
border: 2px solid #137F8B;
  02 background: rgba(223, 144, 18, 0.95);
border: 2px solid #513810;
  03 (If used for modeling, use as the dark-face color; if not modeling, ignore)
background: #00404D;
border: 2px solid #00191E;
 - Design keywords / tags: If the user has a modeling need, apply [minimal, geometric style, clean, blocky, low-detail] processing; if there is no modeling need, ignore.
Tags: high-contrast low-saturation palette, minimal educational visualization, shadowless flat fill, structural-decomposition teaching

#### Color B-19 - Background: #E0E0E0
- All text colors (Text): #000000
- Primary: #B997F8

- Card color/style:
background: #E0E0E0;
border: 1px solid rgba(20, 20, 20, 0.30);

- Button color/style: (strictly follow the requirement)
01: Core button
background: #B997F8;
border: 1px solid rgba(20, 20, 20, 0.30);
border-radius: 0px; color: #000000 (text on the button)
02: Secondary / unselected button
background: #FBFBFA;
border: 1px solid rgba(20, 20, 20, 0.30);
border-radius: 0px; color: #000000 (text on the button)
 - Knowledge-demo area color/style: 01: Demo-area background: Background:  background: #FCFCFC;
border: 1px solid #A2A2A2;
border-radius: 0px;
Background grid: (note: this is the background for graphics/formulas/models and all primary information)
linear-gradient(#EAEAEA 1px, transparent 1px),
linear-gradient(90deg, #EAEAEA 1px, transparent 1px);
background-size: 30px 30px;  02: Knowledge-demo area colors (3D / graphics / charts / geometry, etc. demos MUST use 100% of the colors below. Important: avoid the issue of appearing too dark or unclear due to insufficient lighting; ensure the colors are reproduced more vividly and faithfully.)
  01 background: #FFE36C;
border: 1px solid #26140D;
  02 background: #B997F8;
border: 2px solid #5F37A8;
  03
background: #5C2B1A;
border: 1px solid #26140D;
 - Design keywords / tags: If the user has a modeling need, apply [minimal, geometric style, clean, blocky, low-detail] processing; otherwise ignore.
Tags: high-contrast palette, minimal educational visualization, shadowless flat fill, structural-decomposition teaching

#### Color B-20 - Background: #DFEDFF
- All text colors (Text): #000000
- Primary: #278DEA
- Highlight / Accent: #83FE91 
- Card color/style: Aside from the illustration area, minimize content shown inside cards and lay out content directly on the background.

- Button color/style:
01: Core button
background: #83FE91;
border: 1px solid #000000;
border-radius: 20px; color: #232323 (text on the button)
02: Secondary / unselected button
background: #DFEDFF;
border: 1px solid #000000;
border-radius: 20px; color: #000000 (text on the button)
 - Knowledge-demo area color/style: 01: Demo-area background: Demo-area background:  background: #FFFFFF;
border: 1px solid rgba(15, 35, 54, 0.30);
border-radius: 20px;
Demo-area background grid: (note: this is the background for graphics/formulas/models and all primary information)
linear-gradient(#F1F5FB 1px, transparent 1px),
linear-gradient(90deg, #F1F5FB 1px, transparent 1px);
background-size: 30px 30px;  02: Knowledge-demo area colors ((3D / graphics / charts / geometry, etc. demos MUST use 100% of the colors below. Important: avoid the issue of appearing too dark or unclear due to insufficient lighting; ensure the colors are reproduced more vividly and faithfully.)
  01 background: #83FE91;
border: 2px solid #40A10B;
  02 background: #278DEA;
border: 2px solid #27609F;   03 background: #DFEDFF;
border: 2px solid #84B8FB;
  04 (If used for modeling, use as the bottom-face color) background: #232323;
border: 1px solid #9FA3B2;
 - Design keywords / tags: If modeling is required, apply [minimal, geometric style, clean, blocky, low-detail] processing. Morandi-green educational style, flat pseudo-3D geometry, low-distraction math visualization, structural-decomposition interactive courseware, same-color-family minimal UI, academic-feel vector geometric expression

---

## V. Color Palettes

### [Vibrant High-Saturation] color system, suited for primary-school knowledge points (Grades 1-6). One color from the following MUST be randomly selected; do not analyze which color suits which knowledge point.

### Visual Impact for Illustrations
- **Multi-color utilization protocol**: When demonstrating core knowledge points (e.g. geometric figures, formula derivations), at least 90% of the preset colors in the color scheme MUST be activated (for example, items numbered 01-05 must all appear).
- **Application targets**: Colors should be applied via the `background` and `border` properties on:
  - Highlight boxes for key variables in formulas
  - Different faces or auxiliary lines of geometric figures
  - Emphasis borders for step cards
- **No single-color use allowed**: It is strictly forbidden for the entire demo area to use only a single primary color; strong visual segmentation MUST be formed through color filling.
---
