---
target: src/app/contribute/page.tsx
total_score: 32
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
timestamp: 2026-08-24T07-55-21Z
slug: src-app-contribute-page-tsx
---
Method: dual-agent (A: 7f3e39b3 · B: 3bf64a50)

### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|:-----:|-----------|
| 1 | Visibility of System Status | 3 | Real-time loading states & progress bar; missing upload byte progress & 4-step pipeline timeline |
| 2 | Match Between System & Real World | 4 | Natural grocery mental model with retail terms (shelf tag, strike-through, unit price, circular flyer) |
| 3 | User Control and Freedom | 3 | Row-level editing & demo presets; lacks inline line-item undo and image rotate/crop tools |
| 4 | Consistency and Standards | 3 | High token consistency; architectural variation across tabs (Tab 1 is dual-pane, Tab 2 has no uploader) |
| 5 | Error Prevention | 3 | >3σ price outlier quarantine & 12MB limit checks; lacks inline table validation preventing empty/negative prices |
| 6 | Recognition Rather Than Recall | 4 | Excellent bidirectional sync between SVG bounding boxes and editable ledger table with auto-scroll |
| 7 | Flexibility and Efficiency | 3 | Good batch ingestion; lacks power-user keyboard shortcuts (J/K box cycling, Enter to approve, Cmd+Enter to save) |
| 8 | Aesthetic and Minimalist Design | 3 | Clean Tailwind aesthetic with tabular currency; Tab 1 dual-pane is dense on sub-1280px viewports |
| 9 | Error Recovery | 3 | Informative outlier alerts & confidence indicators; missing specific field-level inline error guidance |
| 10 | Help and Documentation | 3 | Useful contextual tips; missing dedicated photo capture guidelines and Karma tier explanation |
| **Total** | | **32/40** | **Good (80.0%)** |

### Design Specificity Verdict

**LLM assessment**: Deeply domain-grounded in community price crowdsourcing, OCR shelf-tag ingestion, and multi-store retail tracking. The interface avoids generic upload boilerplate by capturing grocery-specific metadata (unit pricing, was/sale discounts, store brand linking), confidence-aware bounding boxes, and gamified karma progression. However, architectural fragmentation across tabs (Tab 2 lacking custom file upload and Tab 3 using a text URL field) dilutes the otherwise unified studio feel.

**Deterministic scan**: Automated detector scanned 5 files (2,193 lines) and identified 2 non-blocking warnings:
1. `hero-eyebrow-chip` (`src/app/contribute/page.tsx:364`): Tracked pill label sitting above primary H1 heading.
2. `dark-glow` (`src/components/ocr/BoundingBoxOverlay.tsx:50`): Zero-offset SVG `<feDropShadow>` filter on bounding boxes.
Deterministic audit also confirmed 0 gradient-text violations, 0 AI color palette tells, 100% tabular numerals on prices and percentages, but flagged low contrast on `slate-400` micro-labels and sub-44px touch targets on mobile viewports.

### Overall Impression
OpenPrice's Contributor Studio is an impressively functional multimodal ingestion workspace. The bidirectional image-to-table synchronization feels like professional data tooling. The single biggest opportunity is unifying the four ingestion channels into a consistent, accessible, keyboard-accelerated capture pipeline with intrinsic SVG coordinate alignment.

### What's Working
1. **Bidirectional Visual-to-Ledger Synchronization:** Clicking or hovering over SVG bounding boxes immediately highlights and auto-scrolls the corresponding table row in `ExtractedFieldEditor`, delivering instant proof verification.
2. **Confidence-Aware Visual Semantics:** Semantic color tokens (Emerald $\ge 90\%$, Amber $70\text{--}89\%$, Coral $<70\%$) with dashed borders for uncertain detections guide attention straight to values needing human verification.
3. **Robust Anomaly Quarantining & Multimodal Fallbacks:** Statistical outlier detection ($>3\sigma$ Z-score) routes anomalous prices to the moderation queue with immediate feedback, while offline heuristic parsing guarantees unbroken UX if vision API keys are unavailable.

### Priority Issues

- **[P0] SVG Bounding Box Aspect Ratio & Letterbox Desynchronization**
  - **What:** In `BoundingBoxOverlay.tsx` and `page.tsx`, `<img>` uses `object-contain` within a fixed `h-[360px]` box while SVG uses `w-full h-full preserveAspectRatio="none"`. Non-standard image aspect ratios cause letterboxing where SVG coordinates drift from image features.
  - **Why it matters:** Breaks user trust in OCR precision when boxes float away from shelf-tag text.
  - **Fix:** Wrap `<img>` and `<svg>` in an intrinsic aspect-ratio container matching the image dimensions to lock 1:1 bitmap coordinate mapping.
  - **Suggested command:** `/impeccable layout`

- **[P1] Inconsistent Ingestion Workflow Across Tabs**
  - **What:** Tab 1 has full drag-and-drop file upload; Tab 2 (Flyer) has a fixed mock canvas with no custom flyer uploader; Tab 3 (Manual) uses a bare URL string input for proof photos.
  - **Why it matters:** Violates consistency standards and prevents users from uploading their own circular flyers or receipt photos in manual mode.
  - **Fix:** Allow Tab 2 to accept custom uploaded circular images/PDFs and replace the text URL field in Tab 3 with a compact `PhotoUploader` dropzone.
  - **Suggested command:** `/impeccable clarify`

- **[P1] Keyboard Navigation & Power Contributor Accelerators**
  - **What:** Contributors cannot navigate bounding boxes or table rows via keyboard (`J`/`K` or Arrow keys), and cannot batch commit via `Cmd+Enter`.
  - **Why it matters:** Slows down high-volume contributors scanning multi-item receipts or long flyers.
  - **Fix:** Implement global keyboard listeners in the editor for row traversal, selection toggle (`Space`), and instant commit (`Cmd+Enter`).
  - **Suggested command:** `/impeccable adapt`

- **[P2] Low-Luminance Microcopy & WCAG AA Contrast Compliance**
  - **What:** Labels such as "Rank & Tier", "Karma Pts", and timestamps use `text-slate-400` on white backgrounds (2.33:1 contrast ratio, below 4.5:1 WCAG AA).
  - **Why it matters:** Impairs legibility for low-vision users and under bright supermarket lighting conditions.
  - **Fix:** Upgrade secondary microcopy to `text-slate-500` or `text-slate-600` (4.5:1+ contrast).
  - **Suggested command:** `/impeccable polish`

- **[P2] Form Association Gaps in Manual Entry Form**
  - **What:** In Tab 3, `<label>` elements lack `htmlFor` bindings and input elements lack corresponding `id` attributes.
  - **Why it matters:** Screen readers cannot announce input labels when focus moves through the manual form.
  - **Fix:** Add unique `id` and `htmlFor` props to all manual form fields.
  - **Suggested command:** `/impeccable harden`

### Persona Red Flags

- **Jordan (First-Timer):** Jordan is unsure what constitutes an acceptable shelf tag or receipt photo. Blurry uploads produce low confidence scores without inline guidance on lighting or framing.
- **Alex (Power Contributor):** Alex is frustrated by having to click table rows individually with a mouse. Lacks batch actions and keyboard accelerators for high-volume receipt processing.
- **Sam (Accessibility-Dependent):** Sam encounters SVG bounding boxes with weak focus outlines, unlinked labels in Tab 3, and cannot control flyer canvas zoom/pan using standard keyboard navigation.

### Minor Observations
1. In `PamphletViewer.tsx`, zoom buttons are 28×28px, which are below the 44px mobile touch target guideline.
2. The Contributor Studio header banner features an eyebrow pill chip directly above the H1 heading.
3. Activity ledger timestamps update dynamically, but lack direct links back to the audited product ledger.

### Questions to Consider
- What if the Ingestion Studio featured an automated **Receipt Total Reconciliation** engine ($\sum \text{items} == \text{Total}$) that awarded bonus Karma when all line items balanced?
- Could client-side barcode scanning (via the Web `BarcodeDetector` API) run in parallel with OCR to achieve 100% deterministic catalog matching?
- What if high-volume contributors had a rapid "Review Queue" mode with full keyboard-only batch verification?
