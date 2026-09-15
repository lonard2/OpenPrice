---
target: ingestion studio - receipt & OCR tab
total_score: 29
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 1
target_identity: "file:/Users/lonard/Desktop/OpenPrice/src/app/contribute/page.tsx"
target_fingerprint: "sha256:1f2b232d2d72bf4ddb3e3ea6f589b6bc587fb29c8839c1fa977964f6f3c1df6f"
target_path: /Users/lonard/Desktop/OpenPrice/src/app/contribute/page.tsx
timestamp: 2026-09-15T05-06-11Z
slug: src-app-contribute-page-tsx
---
# Impeccable Design Critique: OpenPrice Ingestion Studio (Receipt & OCR Tab)

Method: dual-agent (A: 87746c6c-63b6-4c70-898b-5d6327bc30c8 · B: d3c11bab-103c-4aa0-acf9-e84039219a85)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|:-----:|-----------|
| 1 | Visibility of System Status | 3.0 | Descriptive OCR status messages and live badge counts; lacks determinate progress or latency indicator during vision processing |
| 2 | Match System / Real World | 3.0 | Strong retail taxonomy; lacks fiscal receipt math reconciliation (subtotal, tax, total tender check) |
| 3 | User Control and Freedom | 2.5 | Add/delete rows and toggle selection active; lacks row deletion Undo and bounding boxes cannot be resized or re-cropped |
| 4 | Consistency and Standards | 2.5 | Tab 2 (Circulars) has pan/zoom canvas controls, but Tab 1 (Receipt OCR) locks images in a rigid, non-zoomable 400px container |
| 5 | Error Prevention | 3.0 | Pre-submission price deviation hints flag decimal errors against catalog baselines; lacks duplicate receipt upload guardrails |
| 6 | Recognition Rather Than Recall | 3.0 | Bi-directional hover and focus synchronization between SVG boxes and table rows; lacks indexed visual markers on tall receipts |
| 7 | Flexibility and Efficiency | 3.0 | Keyboard navigation (J/K, Space, Cmd+Enter, ?) works well; lacks bulk category/store assignment across selected rows |
| 8 | Aesthetic and Minimalist Design | 2.5 | Clean editorial palette; top header and karma cards consume ~450px vertical height before reaching the verification workspace |
| 9 | Error Recovery | 2.5 | Inline input errors identify invalid fields; generic OCR failures lack photographic guidance (glare, angle, lighting) |
| 10 | Help and Documentation | 2.5 | Keyboard cheat sheet modal is comprehensive; photo capture quality requirements and karma unlock tiers lack contextual guidance |
| **Total** | | **29/40** | **Good** |

## Design Specificity Verdict

- **LLM Assessment:** Distinctive civic crowdsourcing studio with democratic karma gamification, catalog matching, and statistical anomaly detection (>3σ price spike warnings). However, it currently treats receipts as generic square photos rather than tall vertical fiscal documents, and lacks an explicit store/date attribution selector in the OCR commit header.
- **Deterministic Scan:** 0 detector anti-patterns found (`[]`). Zero AI slop, zero generic gradient meshes, zero em-dashes. Tabular numerals are enforced across prices and zoom indicators. Identified minor technical findings: missing `aria-selected` on desktop table rows and slight substrate contrast dip (~4.2:1) for `text-slate-500` over `bg-slate-50`.
- **Visual Overlays:** Verified across mobile card stacks and desktop spreadsheet tables.

## Overall Impression
A highly ambitious and technically capable multimodal ingestion studio. Its civic integrity is strong, but the actual receipt scanning experience is held back by the lack of document pan/zoom in Tab 1 and the critical omission of store/date attribution before committing extracted items to the public index.

## What is Working
1. **Intelligent Baseline Price Deviation Checks:** `getPriceDeviationHint` alerts contributors to decimal slippage (e.g. typing $48.90 instead of $4.89) before submission without blocking legitimate inflation spikes.
2. **Keyboard-First Contributor Workflow:** Fast row traversal (`J`/`K`), selection toggling (`Space`), row insertion (`A`), deletion (`D`), and commit (`Cmd+Enter`) paired with an accessible modal cheat sheet (`?`).
3. **Adaptive Dual-Density Views:** Seamlessly branches between an accessible mobile card stack with 44px touch targets and a high-density desktop spreadsheet table.

## Priority Issues

- **[P0] Missing Store & Date Attribution in OCR Commit Header**
  - **What:** In `handleSaveOcrItems` (`src/app/contribute/page.tsx:360-376`), extracted OCR items are committed without an explicit store selector or receipt date picker, defaulting in storage to `'store-target'` / `'Target'`.
  - **Why it matters:** Scanning an Aldi, Costco, or Walmart receipt accidentally attributes all prices to Target in the public price index, compromising dataset integrity and civic trust.
  - **Fix:** Add a Document Provenance Header above the extracted items editor with an auto-detected store selector and receipt date picker, passing both directly into `savePriceSubmission`.
  - **Suggested command:** `/impeccable harden`

- **[P1] Rigid Aspect Ratio & Lack of Zoom/Pan in Document Preview**
  - **What:** The document preview in Tab 1 (`src/app/contribute/page.tsx:685-705`) is locked in a fixed `h-[400px]` box without pan or zoom controls. Supermarket receipts (1:3 to 1:5 aspect ratio) get shrunk down to 80-100px wide, making small receipt print unreadable.
  - **Why it matters:** Contributors cannot cross-examine the original receipt lines against the extracted data to verify prices.
  - **Fix:** Bring `PamphletViewer`'s zoom and pan controls (`+`, `-`, `0`, click-and-drag) into Tab 1's document preview with a "Fit to Width" toggle.
  - **Suggested command:** `/impeccable adapt`

- **[P2] Visual Grounding Break on Screen Sizes Below 1280px**
  - **What:** On viewports below 1280px (laptops and tablets), the preview and table stack vertically. Scrolling down the table pushes the receipt preview completely off-screen.
  - **Why it matters:** Users lose visual reference to the receipt image while editing items 4 through 20.
  - **Fix:** Add a sticky/collapsible split pane or floating document preview on mid-size screens.
  - **Suggested command:** `/impeccable layout`

- **[P2] Table Row ARIA Selection State**
  - **What:** In `src/components/ocr/ExtractedFieldEditor.tsx:606-619`, desktop table rows handle visual selection but lack `aria-selected={isSelected}` on the `<tr>` elements.
  - **Why it matters:** Screen readers cannot announce which rows are selected for batch submission.
  - **Fix:** Add `aria-selected={isSelected}` to `<tr>` elements.
  - **Suggested command:** `/impeccable harden`

- **[P3] Microcopy Substrate Contrast on Tinted Backgrounds**
  - **What:** `text-slate-500` over `bg-slate-50` in `page.tsx:584` and `ExtractedFieldEditor.tsx:827` measures ~4.2:1 contrast.
  - **Why it matters:** Falls slightly below the WCAG AA 4.5:1 ratio for regular text.
  - **Fix:** Upgrade microcopy on tinted slate backgrounds to `text-slate-600`.
  - **Suggested command:** `/impeccable polish`

## Persona Red Flags

- **Alex (Power Contributor):** Logging 30-item supermarket receipts is slowed down because tabbing through table rows focuses delete buttons and catalog chips rather than flowing directly to the next row's price input.
- **Jordan (First-Timer):** Confused about whether to use Tab 1 ("Photo & Receipt OCR") or Tab 3 ("Direct Manual Log"), and feels alarmed when a genuine price hike is labeled *"Flagged for moderation (>3σ outlier)"* without reassurance.
- **Sam / Casey (Mobile & Accessibility Users):** Touching small SVG bounding boxes on mobile viewports is difficult; table rows lack `aria-selected` announcements.

## Minor Observations
- No receipt total checksum reconciliation (adding extracted item prices to verify against the receipt's subtotal and tax lines).
- Tabs 1 (Photo & Receipt OCR) and 2 (Weekly Circular Explorer) could be unified into a single adaptive document intake canvas.
- Anomaly warnings could be framed positively (e.g. *"Critical price movement detected: thank you for alerting the community"* instead of a dry moderation notice).

## Questions to Consider
- What if the receipt editor automatically calculated the sum of extracted item prices and compared it against the receipt's printed Total?
- Should Tab 1 document preview inherit the exact pan-and-zoom controls from Tab 2?
- How might the intake form highlight the detected store name (e.g. Trader Joe's, Aldi) right after OCR parsing so the user can confirm it with 1 tap?
