---
name: stroke-order
description: This skill MUST be loaded whenever generating Chinese-character stroke-order teaching content. It provides an authoritative 7,818-character stroke-order database (2,865 primary-school textbook characters reviewed by curriculum researchers + textbook-patch-v1 supplementing core characters + 4,953 characters outside the primary-school scope), loaded via stroke-loader.js and rendered in a single line through the stroke-card component. The AI is STRICTLY FORBIDDEN to hard-code stroke data, to introduce any runtime stroke library such as cnchar / HanziWriter, or to give specific stroke-name examples (such as "横、竖、撇、点、捺、横折弯钩 etc.") inside introductory text / teaching highlights / process narration — every stroke name MUST be rendered by the stroke-card component, and any descriptive prose may only state the total stroke count without enumerating individual stroke names. The returned `tier` field distinguishes "within / outside the primary-school scope". Trigger scenarios: stroke order, strokes, literacy & writing, stroke-order demos, writing courseware, stroke count, Tian-zi-ge grid, character-learning cards, character tracing, stroke-order animation.
---

更新时间：2026-05-08

# Chinese Stroke-Order Data Standard (v11.7 · Two-tier Confidence Edition · Taboo #12 anti-hallucination examples)

## Core Principles

1. **The AI is STRICTLY FORBIDDEN to hard-code stroke data** (e.g. `['撇','横',...]`) — the AI's stroke-order memory has been wrong many times.
2. **Likewise, NEVER "give examples" of stroke names in conversational prose** (e.g. "such as 横、竖、撇、捺 etc.") — outdated / incorrect representations from the training data inevitably contaminate introductory paragraphs and contradict what the component renders. See Taboo #12.
3. **Single source of truth**: `stroke-data.json` on the CDN, covering 7,818 characters.
4. **Single query entry point**: `getStrokeData(char)` returns `{char, count, strokes, source, tier}`.
5. **No third-party stroke libraries are allowed**: cnchar, cnchar-draw, HanziWriter, chinese-stroke are all banned.
6. **Two-tier character lists**:
   - **`tier: 'textbook'`** (2,865 characters): primary-school Chinese-textbook characters (writeable + recognition + OVERRIDE + textbook-patch-v1 supplementing 23 characters), curriculum-team reviewed + systematic rule fixes.
   - **`tier: 'extended'`** (4,953 characters): general-purpose characters outside the primary-school scope (dictionary expansion). Stroke order is still reliable (≥98%) but is not part of the textbook focus.

## Required Setup When Generating Code (copy the URLs verbatim — do not change them)

Inject into the HTML `<head>`:

Inject into the HTML `<head>` (**both scripts must load**):

```html
<script src="https://musk-test.fbcontent.cn/pub-musk-ai-studio/skills/stroke-order/v59/templates/stroke-loader.js"></script>
<script src="https://musk-test.fbcontent.cn/pub-musk-ai-studio/skills/stroke-order/v59/templates/stroke-card.js"></script>
```

## ✨ Recommended Approach: Use the Component (one line, **eliminates the dual-data-source problem at its root**)

### Full card `<stroke-card>`

```html
<stroke-card char="学"></stroke-card>
<stroke-card char="曼" size="large"></stroke-card>
<stroke-card char="手" layout="horizontal"></stroke-card>
<stroke-card char="曼" show-strict="true"></stroke-card>   <!-- Primary-school strict mode -->
```

### Standalone badge `<stroke-tier>` (**fixes the "讯" bug where an outer label conflicted with the component**)

LLMs often want to add a "within / outside primary-school scope" badge **outside** the component (in titles, list items, beside descriptive text). **Hand-writing such badge text is strictly forbidden** — use this component instead:

```html
<!-- ❌ Forbidden (even if it looks like a textbook character, do not judge on your own) -->
<span class="badge">✓ Within primary-school scope</span>

<!-- ✅ Correct: delegate to the component to guarantee consistency with the data -->
<h2>讯 <stroke-tier char="讯"></stroke-tier></h2>
<!-- Automatically renders an orange "⚠ Outside primary-school scope" badge (because 讯 is not in the textbook list) -->
```

**The LLM only needs to write `<stroke-card char="X">` or `<stroke-tier char="X">`. Internally the component uniformly calls `getStrokeData` / `isTextbookChar` to render the character, stroke count, per-stroke list, tier badge and tip text.** Anywhere a stroke name or library affiliation must be displayed is controlled by the component; the LLM **does not need to and must not** hand-write any stroke name or badge text anywhere on the page, **completely eliminating dual-data-source conflicts.**

### Component Attributes

| Attribute | Possible values | Default | Description |
|---|---|---|---|
| char | A Chinese character | — | **Required** |
| size | small/default/large | default | Font size |
| layout | vertical/horizontal | vertical | Layout |
| show-tips | true/false | true | Whether to show per-stroke badges |
| show-tier | true/false | true | Whether to show the "within / outside primary-school scope" badge |
| show-strict | true/false | false | Strict mode (refuses to display non-textbook characters) |
| show-missing | true/false | true | Whether characters outside the database show "no data" |

## ⚠️ Exact Structure of `getStrokeData`'s Return Value (Important — Read Carefully)

```js
var d = window.getStrokeData('手');
// d === {
//   char: '手',
//   count: 4,                                 // Total stroke count (integer)
//   strokes: ['撇', '横', '横', '弯钩'],        // ★ Array of strings ★ (each item is a stroke name)
//   strokes_detail: [                          // Array of objects (compatibility API)
//     { index: 1, name: '撇',   path: '' },
//     { index: 2, name: '横',   path: '' },
//     { index: 3, name: '横',   path: '' },
//     { index: 4, name: '弯钩', path: '' },
//   ],
//   source: 'db',
//   tier: 'textbook'
// }
```

### 🚫 **Forbidden Common Mistakes**

```js
// ❌ Wrong! strokes[i] is the string '撇', not an object. .name returns undefined.
d.strokes[i].name             // → undefined (this mistake has occurred many times)
d.strokes[i].path             // → undefined (and this skill does not provide an SVG path)

// ❌ Wrong! Strokes are not numeric IDs.
d.strokes[i].id
d.strokes[i].order

// ❌ Wrong! Pretending a draw path exists.
path.setAttribute('d', s.path)  // s.path does not exist
```

### ✅ **Correct Usage (pick one)**

**Style A: Most concise (recommended)** — use the string array directly:

```js
d.strokes.forEach(function(name, i) {
  // `name` is the stroke-name string ('撇' / '横' / '横钩' etc.)
  listEl.innerHTML += '<li>Stroke ' + (i+1) + ': ' + name + '</li>';
});
```

**Style B: When you need object access** — use `strokes_detail`:

```js
d.strokes_detail.forEach(function(s) {
  // s.index: stroke index (1-based), s.name: stroke name, s.path: reserved as empty string
  listEl.innerHTML += '<li>Stroke ' + s.index + ': ' + s.name + '</li>';
});
```

### About SVG Animation

**This skill does NOT provide stroke SVG path data.** If the LLM is generating HTML and needs a "stroke-order animation":
- Only show the "stroke-name list" and "stroke count" (textual form).
- Do not construct your own `<svg><path d="...">` — there is no path data.
- For animation, defer to Feixiang-laoshi's own stroke-rendering component (handled in the upstream environment); this skill is the data layer only.

## Scenario-based Usage Constraints (split by tier)

### Scenario A: Primary-school Chinese teaching (courseware / exercises / character cards) — **Strict Mode**

**Mandatory constraint**: Use only characters with `tier === 'textbook'`.

```js
var d = window.getStrokeData(ch);
if (d.source !== 'db' || d.tier !== 'textbook') {
  // Prompt the user to replace the character or omit the stroke order
  showMessage('"' + ch + '" is not in the primary-school writing/recognition list; stroke order is not provided.');
  return;
}
// Use d.strokes normally
```

**Trigger keywords**: "primary school", "1st grade", "Bubian (PEP) edition", "writing characters", "literacy & writing", "new characters", "Tian-zi-ge grid", "Chinese-language courseware", etc.

### Scenario B: General stroke-order lookup — **Loose Mode**

All characters with `source === 'db'` may be used, but `tier === 'extended'` characters MUST be **clearly labelled "Outside primary-school scope"**:

```html
<!-- Within primary-school scope: normal display -->
<div class="pinyin-card tier-textbook">
  <span class="count">8 strokes</span>
  <span class="strokes">...</span>
  <span class="badge">✓ Within primary-school scope</span>
</div>

<!-- Outside primary-school scope: orange badge + dashed border -->
<div class="pinyin-card tier-extended" style="border: 1px dashed #bdc3c7">
  <span class="badge">⚠ Outside primary-school scope</span>
  <span class="count">11 strokes</span>
  <span class="strokes">...</span>
</div>
```

**Trigger keywords**: "stroke-order lookup", "adult literacy", "Chinese strokes" — and other non-primary-school-textbook scenarios.

### Default-Scenario Decision

If the prompt contains **any** of the following keywords, treat it as a "primary-school Chinese scenario" → use Strict Mode:

- "primary school" / "kindergarten-to-primary transition"
- "1st grade" / "2nd grade" / "3rd grade" / "4th grade" / "5th grade" / "6th grade"
- "Bubian (PEP) edition" / "Renmin Jiaoyu edition" / "unified edition"
- "new characters" / "writing characters" / "recognition characters" / "literacy"
- "Chinese-language courseware" / "primary-school Chinese" / "literacy and writing"

Otherwise, default to **Loose Mode**.

## 32 Standard Stroke Names (Whitelist)

- Basic (6): 点 (dot), 横 (horizontal), 竖 (vertical), 撇 (left-falling), 捺 (right-falling), 提 (rising)
- Folds (5): 横折, 竖折, 撇折, 横撇, 撇点
- Hooks (12): 竖钩, 弯钩, 斜钩, 卧钩, 竖弯钩, 横钩, 横折钩, 横折弯钩, 横撇弯钩, 横折折折钩, 竖折折钩, 横斜钩
- Rising types (2): 竖提, 横折提
- Bend / fold combos (7): 竖弯, 横折弯, 横折折撇, 竖折撇, 竖折折, 横折折, 横折折折

> Note: **竖折** (a square-corner L shape, e.g. the 2nd stroke of 山) and **竖弯** (an arc transition, e.g. the 4th stroke of 四) are two distinct strokes and are not interchangeable.

## Taboo List

| # | Forbidden | Consequence |
|---|---|---|
| 1 | Stroke-array literals such as `['撇','横',...]` appearing in code | Loss of data-source control |
| 2 | Importing cnchar / cnchar-order / cnchar-draw | Data conflicts |
| 3 | Importing HanziWriter | Pollution from loading `{char}.json` |
| 4 | Obtaining stroke data through any path other than `getStrokeData()` | Bypasses validation |
| 5 | Using AI memory to fill in when `source !== 'db'` | Reanimates the original bug |
| 6 | **Using `tier: 'extended'` characters in a primary-school scenario** | **Confuses the textbook standard** |
| 7 | Stuffing stroke data into a `<template>` / static JSON `<script>` | Equivalent to hard-coding |
| 8 | **`d.strokes[i].name` or `d.strokes[i].path`** | **undefined; the page renders incorrectly** |
| 9 | Inventing an SVG path: `path.setAttribute('d', s.path)` | This skill does not provide path data |
| **10** | **Hand-writing stroke names in "tip area / thinking process / descriptive text / card tooltip"** | **Dual-data-source conflict** |
| **11** | **Hand-writing labels such as "within / outside primary-school scope" / "Bubian textbook" / "in-class / extracurricular character"** outside the component | **Inconsistent with the `tier` field** (e.g. the bug where "讯" was outwardly tagged green "within scope" while the data layer said outside scope) |
| **12** | **"Giving examples / enumerating" specific stroke names in "process narration / teaching highlights / introduction / instructional-design notes"** (e.g. "横、竖、撇、点、捺、横折弯钩 etc.") | **Contradicts what the component renders** (e.g. the bug where the process narration for "枫" said "横折弯钩 etc." while the component on the right rendered "横斜钩" — the two contradict each other) |

### 🎯 Deep Note on Taboo #12 (newly added in v11.7, targeting the "枫" process-narration contradiction bug)

Taboo #10 already covers "describing a specific stroke of a specific character in detail." Taboo #12 further blocks the LLM's favourite "**example-based loophole**" — even when not targeting a specific character, you must NOT **enumerate / illustrate / demonstrate any stroke name** in introductory paragraphs, teaching highlights, thinking text, or other conversational prose.

#### ❌ Forbidden phrasings (still forbidden even when no specific character is named)

```markdown
Teaching-design highlights:
1. Authoritative data: connected to the 7,818-character authoritative stroke-order database, ensuring 枫's stroke count (9) and the name of every stroke (such as: 横、竖、撇、点、捺、横折弯钩 etc.) are completely accurate.

According to the teaching needs, this character's strokes commonly include: 横、竖、撇、捺、提、横折、竖钩、弯钩…

Each stroke (such as: 撇、横、竖钩 etc.) is displayed in standard form…
```

**Root cause**: During conversational-prose generation ("process narration / thinking process") the LLM **does not call `getStrokeData()`** and can only fall back to whatever is left in its training data, which **inevitably triggers hallucinations** (e.g. "横折弯钩" for 枫 is exactly the historical cnchar error from the training data).

#### ✅ Correct phrasings

```markdown
Teaching-design highlights:
1. Authoritative data: connected to the 7,818-character authoritative stroke-order database; the names of individual strokes are governed by the stroke-order card on the right.
2. Static-and-animated combo: supports stroke-by-stroke animation and one-click replay.
3. Concept visualisation: the card displays both stroke count and the per-stroke breakdown, making it easy for students to follow along.
4. Scenario fit: aligned with the primary-school Chinese writing / literacy classroom.
```

**Key points**:
- Mentioning the "stroke count" is fine (it is a number), but **do not give examples of specific stroke names**.
- Say "as shown on the card to the right" / "see the component for details" — hand the entire interpretation of stroke names to `<stroke-card>`.
- If users absolutely must see stroke names, **let the component show them** (via `<stroke-card>` or `<stroke-tier>`).

#### Standard Introduction-Sentence Template (recommended — copy verbatim)

```
A stroke-order demonstration page for "{character}" ({stroke-count} strokes) has been generated for you.

Teaching-design highlights:
1. Authoritative data: connected to the 7,818-character authoritative stroke-order database; the names of individual strokes are governed by the card on the right.
2. Static-and-animated combo: supports stroke-by-stroke animation breakdown / one-click re-play.
3. Concept visualisation: vivid colours + Tian-zi-ge grid emphasise correct writing.
4. Teaching fit: aligned with {primary-school Chinese / general-purpose} use; can be projected directly in class.
```

In the template, **only `{character}` and `{stroke-count}` are dynamic**; every other piece of descriptive prose is fixed, fundamentally preventing the LLM from "improvising examples" in the introduction.

### 🎯 Single-Source-of-Truth Principle (newly added in v10.9, eliminating UI inconsistency)

**Every display location of stroke names on the page** (the per-stroke breakdown on the right, the thinking area on the left, descriptive text, tooltips, animation hints, voice-over scripts, etc.) **MUST** reference the same `getStrokeData(ch).strokes[i]`.

**Easiest approach: use the `<stroke-card>` component directly** — its internal logic guarantees consistency.

If you must build the UI yourself, **never** hand-write stroke-name strings anywhere, e.g.:

```html
<!-- ❌ Forbidden: hand-writing a stroke name in descriptive text -->
<p>The 1st stroke of "手" is a 撇, going from upper-right down to lower-left...</p>

<!-- ❌ Forbidden: writing a separate stroke array in JS -->
const tips = { 手: ['撇','横','横','弯钩'] };

<!-- ✅ Correct: every position uniformly uses d.strokes -->
<p>Stroke 1 is <span id="tip-0"></span>, <span id="desc-0"></span></p>
<script>
  const d = window.getStrokeData('手');
  document.getElementById('tip-0').textContent = d.strokes[0];   // From the same data source
  document.getElementById('desc-0').textContent = getDescription(d.strokes[0]);
</script>
```

## Self-check After Generation

1. Only `stroke-loader.js` is imported — no cnchar / HanziWriter.
2. The `chars` array contains only Chinese characters.
3. No stroke-name string literals can be found in the code.
4. All stroke data comes through `getStrokeData()`.
5. **Choose strict / loose mode based on the scenario; in strict mode, filter out characters with `tier !== 'textbook'`.**
6. Extended characters have a visible "Outside primary-school scope" indicator in the UI.
7. The missing-data / error branches show "no data".
8. **No stroke-name enumeration appears in conversational prose / teaching highlights / introduction** (Taboo #12) — scan your introduction with the regex `(横|竖|撇|捺|点|提|钩|折|弯)`. If it matches, rewrite as "see the card on the right".

## Plain-Text Conversation Mode

When the user only chats and asks about stroke order (without asking for code):

> "Stroke order must be queried from an authoritative database via code. Please ask me to generate a teaching webpage instead (in primary-school courseware mode I will use only the 2,865 textbook characters; in general-purpose mode the 7,818-character coverage is available)."

**Never recite any character's stroke order from memory.**

## Complete, Correct Examples (copy-pasteable)

### Style A: Component-based (**recommended — simplest, eliminates dual-data sources**)

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"><title>New-Character Stroke-Order Teaching</title>
<script src="https://musk-test.fbcontent.cn/pub-musk-ai-studio/skills/stroke-order/v59/templates/stroke-loader.js"></script>
<script src="https://musk-test.fbcontent.cn/pub-musk-ai-studio/skills/stroke-order/v59/templates/stroke-card.js"></script>
</head>
<body>
  <h1>New-Character Stroke Order</h1>
  <stroke-card char="学"></stroke-card>
  <stroke-card char="写"></stroke-card>
  <stroke-card char="字"></stroke-card>
</body>
</html>
```

### Style B: Self-controlled UI (must strictly maintain "single source of truth")

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>Stroke-Order Teaching</title>
<script src="https://musk-test.fbcontent.cn/pub-musk-ai-studio/skills/stroke-order/v59/templates/stroke-loader.js"></script>
<style>
  .card { border: 1px solid #eee; padding: 16px; margin: 8px; display: inline-block; border-radius: 8px; }
  .card.dim { border: 1px dashed #ccc; opacity: 0.8; }
  .ch { font-size: 48px; font-weight: bold; }
  .count { color: #e74c3c; margin: 4px 0; }
  .count.dim { color: #888; }
  .step { display: inline-block; padding: 2px 8px; margin: 2px; background: #f0f0f0; border-radius: 4px; font-size: 12px; }
  .badge { font-size: 11px; padding: 2px 6px; border-radius: 8px; }
  .badge-ok { background: #d5f5e3; color: #27ae60; }
  .badge-warn { background: #f4f6f6; color: #7f8c8d; }
  .miss { color: #999; font-style: italic; }
</style>
</head>
<body>
<div id="app">Loading...</div>
<script>
// AI fills in only the character array — never the stroke data.
var chars = ['学', '写', '字', '手', '彭'];

window.addEventListener('stroke-data-ready', function() {
  var app = document.getElementById('app');
  app.innerHTML = '';
  chars.forEach(function(ch) {
    var d = window.getStrokeData(ch);
    var card = document.createElement('div');
    card.className = 'card';

    if (d.source !== 'db') {
      card.innerHTML = '<div class="ch">' + ch + '</div><div class="miss">No data</div>';
      app.appendChild(card);
      return;
    }

    // Tier downgrade: extended characters use a dashed border + grey
    var isTextbook = d.tier === 'textbook';
    if (!isTextbook) card.classList.add('dim');

    // ★ Correct usage: d.strokes[i] is a string — concatenate it directly ★
    var stepsHtml = '';
    d.strokes.forEach(function(name, i) {
      stepsHtml += '<span class="step">' + (i+1) + '. ' + name + '</span>';
    });

    card.innerHTML =
      '<div class="ch">' + ch + '</div>' +
      '<div class="count' + (isTextbook ? '' : ' dim') + '">' + d.count + ' strokes</div>' +
      '<span class="badge ' + (isTextbook ? 'badge-ok' : 'badge-warn') + '">' +
        (isTextbook ? '✓ Within primary-school scope' : '⚠ Outside primary-school scope') +
      '</span>' +
      '<div style="margin-top:8px">' + stepsHtml + '</div>';
    app.appendChild(card);
  });
});
</script>
</body>
</html>
```

**This template can be copied verbatim — just modify the `chars` array. Note**:
- `d.strokes.forEach(function(name, i) {...})` — `name` is a string (`'撇'`, `'横钩'`, …)
- **Do not** write `d.strokes[i].name` — there is no `.name` field.
- **Do not** write `d.strokes[i].path` — no SVG path is provided.

### Primary-School Strict-Mode Filter (textbook characters only)

```js
if (d.source !== 'db' || d.tier !== 'textbook') {
  showMessage(ch + ' is not in the primary-school textbook character list');
  return;
}
```

## Database Coverage

- **2,865 textbook characters**: all writeable + recognition characters from the Bubian (PEP) edition of primary-school Chinese (grades 1–6) + OVERRIDE high-frequency error-prone characters + 23 lower-grade core characters from v1.7.2 textbook-patch-v1.
- **4,953 extended characters**: characters in the *General-Standard Chinese-Character Table* (level-1 list) that are not yet adopted by textbooks, e.g. 曼 / 丁 / 丙 / 乔 / 丸 / 丽 / 丢 / 丫 / 举 / 乍 / 之 / 乎.

## Systematic Corrections Already Embedded in the Database (no LLM action needed — applied automatically)

- 穴-radical: HP → 横钩
- 阝 component: HZZZG → 横撇弯钩
- 殳 / 朵 / 㕣 components: HZZ → 横折弯
- 风 / 气 family: HZWG → 横斜钩
- 学-character family: consecutive HP → first 横钩
- OVERRIDE hard-corrections for 25 characters (鼎 / 写 / 凹 / 凸 / 虫 / 互 / 今 / 小 / 东 etc.)

## Related Resources

- `assets/stroke-data.json` (630 KB CDN resource, loaded at runtime, **does not enter the LLM context**)
- `templates/stroke-loader.js` (the loader, exposing `getStrokeData` + `isTextbookChar`)
- `templates/stroke-snippet.html` (ready-to-use template with tier-downgrade UI)
