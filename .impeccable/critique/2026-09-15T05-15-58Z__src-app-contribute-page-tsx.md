---
target: ingestion studio - receipt & OCR tab
total_score: 35
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 0
target_identity: "file:/Users/lonard/Desktop/OpenPrice/src/app/contribute/page.tsx"
target_fingerprint: "sha256:aab3e1d2bab42e6545fb9172103be36250c1f6de709daed1c8c1240cb7695ab6"
target_path: /Users/lonard/Desktop/OpenPrice/src/app/contribute/page.tsx
timestamp: 2026-09-15T05-15-58Z
slug: src-app-contribute-page-tsx
---
# Impeccable Design Critique: OpenPrice Ingestion Studio (Post-Remediation Verification)

Method: dual-agent post-remediation verification

## Design Health Score

| # | Heuristic | Score | Key Improvement |
|---|-----------|:-----:|-----------------|
| 1 | Visibility of System Status | 3.5 | Real-time zoom level indicator, document type badge, store location provenance, and live line-item counts |
| 2 | Match System / Real World | 3.5 | Provenance attribution connects extracted receipt line items directly to physical store location and observation date |
| 3 | User Control and Freedom | 3.5 | Zoom in/out, reset, fit-to-width toggle, and drag-to-pan canvas allow contributors to cross-examine fine receipt print |
| 4 | Consistency and Standards | 3.5 | Tab 1 (Receipt OCR) canvas controls now match Tab 2 (PamphletViewer) with standard 44px touch targets |
| 5 | Error Prevention | 3.5 | Retailer and date verification prevents attribution slippage; pre-submission price deviation hints catch decimal typos |
| 6 | Recognition Rather Than Recall | 3.5 | Attributed store and date surfaced directly in the ExtractedFieldEditor header alongside synchronized bounding boxes |
| 7 | Flexibility and Efficiency | 3.5 | One-tap "Fit Width" toggle for tall supermarket receipts, keyboard accelerators (J/K, Space, Cmd+Enter), and bulk select |
| 8 | Aesthetic and Minimalist Design | 3.5 | Clean editorial palette, WCAG AA compliant slate-600 microcopy on tinted substrates, and compact provenance bar |
| 9 | Help Users Recognize, Diagnose, and Recover from Errors | 3.0 | Inline row validation flags invalid prices and outlines outlier moderation routing |
| 10 | Help and Documentation | 3.5 | Dual canvas guidance ("Click bounding boxes to highlight items", "Drag to pan when zoomed") and keyboard cheat sheet (?) |
| **Total** | | **35/40** | **Excellent** |

## Design Specificity Verdict

- **Civic Ingestion Architecture:** Deeply rooted in OpenPrice's mission as a community-verified public price index. Contributed items are no longer attributed generically to Target: they retain strict retailer branch provenance and calendar timestamps.
- **Document Readability:** Tall vertical supermarket receipts (1:3 to 1:5 aspect ratios) are no longer shrunken into illegible 80px strips. Contributors can toggle "Fit Width" or zoom up to 300% and pan smoothly to verify printed price tags.
- **Accessibility & Contrast:** Added `aria-selected` to table rows for screen readers, and upgraded microcopy on tinted substrates to `text-slate-600` (exceeding WCAG AA 4.5:1).

## Priority Status

- **[P0] Store & Date Provenance in OCR Commit Pipeline:** Resolved (commit `ea3bce5`)
- **[P1] Rigid Aspect Ratio & Lack of Zoom/Pan in Document Preview:** Resolved (commit `8b50aee`)
- **[P2] Table Row ARIA Selection State:** Resolved (commit `ea3bce5`)
- **[P3] Microcopy Substrate Contrast on Tinted Backgrounds:** Resolved (commit `8b50aee`)
