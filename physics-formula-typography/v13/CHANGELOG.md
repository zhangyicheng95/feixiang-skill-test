# physics-formula-typography Changelog

## 1.6.5 - 2026-06-29

- Added a narrow dynamic-readout hygiene rule: do not place mutable `<span>`, `<output>`, or `<input>` nodes inside MathJax delimiters such as `\(...\)`; update the whole formula/readout node and re-typeset that node instead.
- Added source-scan and Python/Playwright examples for interaction-time visual leakage checks: after a slider/button/step update, `innerText` should not contain raw LaTeX fragments like `\(`, `\)`, `\mathrm`, or `\text`.
- Clarified delimiter tests should ignore HTML comments as well as JavaScript `${...}` interpolation, and spec comments should say `dollar-math-delimiter` rather than embedding literal `$...$`.
- Kept the change scoped to formula/symbol implementation and testing; no new force-direction, magnetic-field, resultant-force, 2D/3D, or physics-template constraints were added.

## 1.6.4 - 2026-06-26

- Added a copy-paste Python/Playwright `has_dollar_math_delimiter()` test helper that ignores JavaScript template interpolation such as `${value}` while still catching real `$...$` math delimiters.
- Clarified the three MathJax test layers: raw source checks LaTeX text, post-MathJax DOM checks `mjx-container` / `data-physics-label`, and visual text checks `innerText`.
- Replaced the fragile post-render `innerHTML contains "\\(G\\)"` example with raw-source and rendered-DOM alternatives, and added a small note to avoid repeated `typesetPromise` calls when animation only moves labels.

## 1.6.3 - 2026-06-26

- Tightened only the self-check/test oracle layer: `$...$` delimiter detection now means real paired dollar math, while normal JavaScript template interpolation such as `${value}` is explicitly ignored.
- Added guidance that MathJax checks must separate source inspection (`innerHTML` / `page.content()`) from rendered visual inspection (`innerText`), avoiding false failures that expect raw `\(` or `\mathrm` after MathJax has rendered.
- Recommended optional non-visual hooks such as `data-physics-label="G"` for dynamic force labels so tests can locate labels without adding new physics-model constraints or judging force directions.

## 1.6.2 - 2026-06-26

- Added a narrow control/slider label rule: physics variables and unit hints in labels such as `质量 \(m\) (kg)` and `速度 \(v\) (m/s)` must move the unit into MathJax, for example `质量 \(m\)（单位 \(\mathrm{kg}\)）`.
- Added `control_label_units` to the self-check schema and source-scan examples for common label unit hints like `(kg)`, `(m/s)`, `(T)`, and `(C)`.
- Kept ordinary controls such as start/pause/reset/toggles as normal UI text to avoid turning this typography skill into a broad UI-authoring constraint.

## 1.6.1 - 2026-06-26

- Narrowed the v1.6 Chart.js/ECharts rule to explicitly catch formula-bearing axis titles such as `速度 (m/s)`, `力 (μN)`, `v (m/s)`, and `F (N)`.
- Added guidance to keep chart-internal axis titles as pure Chinese dimension names while moving exact variables and units to MathJax-rendered HTML axis captions.
- Kept physical modeling, force direction, graph layout, and ordinary Chinese chart labels outside this skill to avoid overconstraint.

## 1.6.0 - 2026-06-26

- Added a narrow Canvas/Chart.js/ECharts rule for formula-bearing labels such as `B (⊙)`, `F_洛`, `F_合`, `v0`, and `μN`: graphics may stay in canvas/chart layers, but variables, force labels, and units must move to MathJax-rendered HTML overlays or custom legends.
- Hardened dynamic MathJax guidance so updates must typeset a real non-empty root node; `typesetPromise([])` and helpers that fall back to an empty array are now explicit failures.
- Added `dynamic_typeset_nonempty_root` and `canvas_chart_formula_labels` to the self-check schema while keeping force direction, magnetic-field semantics, 2D/3D switching, and resultant-force algorithms outside this skill.

## 1.5.0 - 2026-06-26

- Added a narrow force/vector/field label rule for visible Three.js/CSS2D/DOM/SVG labels such as `F洛`, `FN`, `F合`, `F_G_N`, `v`, `B`, and `E`.
- Added helper guidance for MathJax-rendered CSS2D/HTML overlay labels without re-typesetting every animation frame.
- Added `force_vector_labels` to the self-check schema while keeping force direction, magnetic-field semantics, 2D/3D switching, and resultant-force algorithms outside this skill.

## 1.4.0 - 2026-06-09

- Added a narrow density legend/range-endpoint rule so static labels such as `1.2 g/cm³` and `8.0 g/cm³` are also MathJax-rendered.

## 1.3.0 - 2026-06-09

- Added a narrow density-readout rule for `g/cm^3` and `kg/m^3` values in sliders, labels, and result badges.
- Added `setDensityValue()` guidance to avoid plain text such as `1.50 g/cm³`.

## 1.2.0 - 2026-06-09

- Added a narrow rule for dynamic measurement labels such as `V1/V2/V3` and `读取 V₁`.
- Clarified that step letters `A/B/C/D` remain normal UI text while adjacent measurement variables must use MathJax.
- Added `setMixedMathText()` guidance for mixed Chinese text plus MathJax variables in dynamic tips.

## 1.1.0 - 2026-06-09

- Clarified the scope boundary: only visible content with physics/math semantics must enter MathJax.
- Added a non-overconstraint rule so ordinary UI labels, answer-option letters, English abbreviations, and CSS/JS identifiers stay as normal text.
- Added `non_overconstraint` to the structured self-check and a source-scan helper for this boundary.

## 1.0.0 - 2026-06-09

- Initial version distilled from the physics formula/font card point in the Feixiang weekly product document.
- Upgraded the teaching-research prompt into an executable Feixiang skill workflow.
- Added hard requirements for the specified MathJax3 CDN, semantic subscript normalization, dynamic MathJax re-typesetting, Canvas/SVG formula handling, and structured self-check output.
