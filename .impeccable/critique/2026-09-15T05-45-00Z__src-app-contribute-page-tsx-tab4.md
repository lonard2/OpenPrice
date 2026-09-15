---
target: online retailer web scraper & importer - tab 4
total_score: 15.0
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
target_identity: "file:/Users/lonard/Desktop/OpenPrice/src/app/contribute/page.tsx"
target_path: /Users/lonard/Desktop/OpenPrice/src/app/contribute/page.tsx
timestamp: 2026-09-15T05-45-00Z
slug: src-app-contribute-page-tsx-tab4
---
# Impeccable Critique: Ingestion Studio Tab 4 (Online Retailer Web Scraper & Importer)

## Executive Summary
Evaluation of Tab 4 ("Online Retailer Web Scraper & Importer" / `web-url`) in `src/app/contribute/page.tsx`.

While Tab 4 provides a clean visual container, it functions as a decoupled mockup with critical data corruption flaws:
1. `handleParseWebUrl` unconditionally returns Target milk regardless of the URL entered or sample clicked.
2. `handleIngestWebParsed` hardcodes `productId: 'prod-milk'` and `storeId: 'store-target'`, recording coffee, eggs, and beef directly into organic whole milk's ledger.
3. Silent double karma inflation: `savePriceSubmission` internally awards 15 karma points, and `handleIngestWebParsed` awards another 20 points, producing 35 points instead of the advertised 20.
4. The extracted preview is completely read-only, preventing contributors from correcting scrape errors, adjusting units, or mapping to catalog products.
5. Zero domain validation, error states, or keyboard accelerators.

Score: 15.0 / 40 across Nielsen Usability Heuristics. P0 issues: 2. P1 issues: 2.

---

## Usability Heuristics Breakdown

1. **Visibility of System Status: 1.0 / 4**
   Parsing feedback is a generic button spinner. Clicking sample pills jumps directly to preview without fetch feedback. Missing `aria-live="polite"` status announcements.

2. **Match Between System & Real World: 1.5 / 4**
   Treats online stores as monolithic global entities without location, store branch, or fulfillment mode (pickup vs. delivery).

3. **User Control & Freedom: 1.0 / 4**
   Extracted preview is completely read-only. No way to edit name, brand, price, unit, or catalog product mapping. No reset or undo.

4. **Consistency & Standards: 2.0 / 4**
   Matches basic card styling, but breaks the interactive pattern of Tabs 1, 2, and 3. Inverted karma rewards desk link pasting (+35 effective) higher than in-store shelf tags (+15).

5. **Error Prevention: 0.5 / 4**
   Critical failure. Submitting any URL writes `prod-milk` to the database, corrupting price statistics across products. Zero URL or domain validation.

6. **Recognition Rather Than Recall: 2.0 / 4**
   Sample pills provide good recognition of supported retailers, but custom URLs offer no structure guidance.

7. **Flexibility & Efficiency of Use: 1.5 / 4**
   No keyboard shortcuts (omitted from `?` modal), no clipboard paste button, no batch ingestion.

8. **Aesthetic & Minimalist Design: 2.5 / 4**
   Clean typography and spacing, but sample pills consume excessive vertical height and the preview card lacks product imagery.

9. **Help Users Recognize, Diagnose, & Recover from Errors: 0.5 / 4**
   Zero error handling for 404 dead links, bot blockers, or unsupported domains.

10. **Help and Documentation: 1.5 / 4**
    Basic subtitle only. No explanation of supported retailers, data provenance, or scraper methodology.

---

## Priority Issues (P0 to P3)

- **[P0] Fatal Database Corruption in Scraper & Ingest Handlers:**
  *What:* `handleParseWebUrl` always produces milk, and `handleIngestWebParsed` hardcodes `productId: 'prod-milk'` and `storeId: 'store-target'`.
  *Why:* Every imported link (eggs, coffee, beef) silently corrupts milk catalog stats.
  *Fix:* Wire dynamic URL extraction matching domains to stored retailers and catalog products (`productId`, `storeId`).

- **[P0] Double Karma Inflation Bug:**
  *What:* `savePriceSubmission` awards +15 points, then `handleIngestWebParsed` calls `addKarmaPoints(20)`, awarding 35 points total.
  *Fix:* Unify karma awarding to match the advertised bonus via storage sync.

- **[P1] Read-Only Preview Lacks Field Reconciliation & Catalog Matching:**
  *What:* Contributors cannot adjust misparsed prices, units, or select which catalog product the link belongs to.
  *Fix:* Add editable field review (Price, Original Price, Unit, Store, Catalog Product match).

- **[P1] Missing Domain Validation & Error Recovery States:**
  *What:* Invalid URLs or unsupported domains fail silently or return mock milk without error banners.
  *Fix:* Add URL domain validation against supported retailers and actionable error states.

- **[P2] Accessibility & Design Polish:**
  *What:* Missing `aria-pressed`, missing `aria-live`, sub-44px desktop button collision, non-tabular numerals.
  *Fix:* Add ARIA attributes, ensure 44px touch targets across breakpoints, add `tabular-nums`.
