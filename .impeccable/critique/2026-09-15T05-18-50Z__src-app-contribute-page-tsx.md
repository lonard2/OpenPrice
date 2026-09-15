---
target: weekly circular explorer - flyer & pamphlet tab
total_score: 27
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 1
target_identity: "file:/Users/lonard/Desktop/OpenPrice/src/app/contribute/page.tsx"
target_fingerprint: "sha256:aab3e1d2bab42e6545fb9172103be36250c1f6de709daed1c8c1240cb7695ab6"
target_path: /Users/lonard/Desktop/OpenPrice/src/app/contribute/page.tsx
timestamp: 2026-09-15T05-18-50Z
slug: src-app-contribute-page-tsx
---
# Impeccable Critique: Ingestion Studio Tab 2 (Weekly Circular & Flyer Explorer)

## Executive Summary
OpenPrice Ingestion Studio Tab 2 allows contributors to inspect multi-deal promotional flyers and weekly circulars using a pan/zoom canvas, verify extracted deals, and batch-import prices into the civic index.

While the canvas interaction engine (pan, zoom, reset, key bindings) and batch import pipeline are functional, the user experience suffers from nomenclature confusion, decoupled preset deal sets, lack of product name visibility on canvas pills, and missing interaction bindings between the parent page and canvas deals.

Score: 27 / 40 across Nielsen Usability Heuristics.

---

## Nomenclature Analysis: Flyer vs. Pamphlet vs. Circular
- **Circular / Weekly Ad:** The standard grocery industry term in North America for multi-page weekly promotional print/digital mailers (e.g. Target Weekly Ad, Aldi Weekly Circular).
- **Flyer:** Universal consumer term across retail for promotional print sheets featuring weekly specials.
- **Pamphlet:** Historically refers to political, informational, or ideological booklets; rarely used in retail grocery contexts.
- **Recommendation:** Standardize user-facing copy on "Weekly Circulars & Store Flyers" (with tab label "Store Flyers & Circulars"). Retain `PamphletViewer.tsx` internally or rename cleanly in code without breaking imports.

---

## Usability Heuristics Breakdown

1. **Visibility of System Status: 2.5 / 4**
   Switching preset retailers updates the background image, but the detected deal boxes remain locked to Target deals. Custom flyer upload provides no extraction progress or mock bounding boxes.

2. **Match Between System & Real World: 2.5 / 4**
   Missing promotional validity date range indicators (e.g., "Valid Sep 14 - Sep 20"). Conflates single-item shelf tags with multi-item circulars.

3. **User Control & Freedom: 2.0 / 4**
   Contributors cannot draw, adjust, or delete bounding boxes on the flyer canvas. Once batch import is pressed, there is no preview confirmation drawer or undo action.

4. **Consistency & Standards: 2.5 / 4**
   Tab 1 (Receipts) provides an interactive tabular editor for item details; Tab 2 relies entirely on canvas badges without a companion list. A double-badge collision occurs between SVG bounding box labels and HTML overlay pills.

5. **Error Prevention: 2.5 / 4**
   Deals are ingested without pre-submission name confirmation or confidence indicators. Contributor cannot see which product name will be recorded until after committing.

6. **Recognition Rather Than Recall: 2.5 / 4**
   Canvas pills show only extracted prices (e.g. "$1.99") without displaying the item name. The user must remember or visually decipher the product name from the raw flyer image text.

7. **Flexibility & Efficiency of Use: 3.0 / 4**
   "Select all" and aggregate savings tally provide fast batch actions. However, arrow keys intercept global page scrolling rather than confining navigation to the canvas.

8. **Aesthetic & Minimalist Design: 3.0 / 4**
   Clean canvas layout, but dark slate canvas creates visual tension with the light civic design language. Overlapping badges cause visual jitter.

9. **Help Users Recognize, Diagnose, & Recover from Errors: 2.5 / 4**
   No inline guidance if an image fails to load or if no deals are detected in an uploaded flyer.

10. **Help & Documentation: 2.0 / 4**
    Keyboard shortcuts modal (?) omits canvas controls (+, -, 0, and Arrow keys).

---

## Strengths
- Smooth pan/zoom transformations with hardware-accelerated CSS transforms.
- Instant calculation of total potential community savings across selected deals.
- Clear store attribution header with active deal count badges.

---

## Priority Issues (P0 to P3)

- **[P0] Decoupled Presets & Missing Deal Selection Event Bindings:**
  Selecting Aldi or Kroger changes the background image but leaves Target deal coordinates frozen. In addition, `page.tsx` omits `selectedItemId` and `onItemSelect` bindings on `<PamphletViewer>`.
  *Fix:* Synchronize preset deal coordinate sets in `CIRCULAR_SAMPLES` and wire up deal selection state.

- **[P1] Invisible Deal Names & Lack of Deal Review Drawer / Strip:**
  Canvas price pills display only prices ($1.99, $3.49) while the detected product name is completely hidden from the reviewer.
  *Fix:* Display item names on canvas badges and add a compact deal review strip beneath the canvas.

- **[P2] Double-Badge Rendering Collision & Global Arrow Key Hijacking:**
  `BoundingBoxOverlay` SVG badges collide with `PamphletViewer` HTML badges at identical coordinates. Arrow key listeners capture document-wide scrolling.
  *Fix:* Suppress redundant SVG badges in `PamphletViewer` mode and constrain arrow keys to container focus.

- **[P3] Promotional Validity Dates & Terminology Harmonization:**
  Flyer headers lack weekly validity dates, and mixed terms (Pamphlet, Circular, Flyer) confuse first-time contributors.
  *Fix:* Standardize copy to "Weekly Circulars & Store Flyers" and surface promo validity dates.
