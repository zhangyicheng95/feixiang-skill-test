# physics-formula-typography Changelog

## 1.1.0 - 2026-06-09

- Clarified the scope boundary: only visible content with physics/math semantics must enter MathJax.
- Added a non-overconstraint rule so ordinary UI labels, answer-option letters, English abbreviations, and CSS/JS identifiers stay as normal text.
- Added `non_overconstraint` to the structured self-check and a source-scan helper for this boundary.

## 1.0.0 - 2026-06-09

- Initial version distilled from the physics formula/font card point in the Feixiang weekly product document.
- Upgraded the teaching-research prompt into an executable Feixiang skill workflow.
- Added hard requirements for the specified MathJax3 CDN, semantic subscript normalization, dynamic MathJax re-typesetting, Canvas/SVG formula handling, and structured self-check output.
