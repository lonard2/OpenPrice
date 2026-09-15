---
target: direct manual observation log - tab 3
total_score: 19
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
target_identity: "file:/Users/lonard/Desktop/OpenPrice/src/app/contribute/page.tsx"
target_fingerprint: "sha256:57b5c3b0f47336105df41f8f228f72e8cc4facf6f304c54719caf076321e9d8d"
target_path: /Users/lonard/Desktop/OpenPrice/src/app/contribute/page.tsx
timestamp: 2026-09-15T05-30-16Z
slug: src-app-contribute-page-tsx
---
# Impeccable Critique: Ingestion Studio Tab 3 (Direct Manual Observation Log)

## Executive Summary
Evaluation of Tab 3 ("Direct Manual Observation Log") in `src/app/contribute/page.tsx`.

While the form provides core input elements (product catalog selector, store dropdown, price fields, camera/file proof upload, notes), it behaves like an unassisted, generic database entry form rather than an intelligent civic crowdsourcing tool.

Critical defects include: the form never resets after successful submission (leaving stale values that trigger accidental duplicate records), switching products desynchronizes unit and category strings, contributors receive duplicate karma points due to double-counting between `page.tsx` and `storage.ts`, and outlier detection triggers post-hoc mathematical warnings (>3σ) without pre-flight market guidance.

Score: 19 / 40 across Nielsen Usability Heuristics. P0 issues: 1. P1 issues: 2.

---

## Usability Heuristics Breakdown

1. **Visibility of System Status: 2.0 / 4**
   Submit button displays a loading spinner, but after submission the form fields do not reset or present a dedicated inline success confirmation. Zero live unit-price calculation ($/unit) or market reference range.

2. **Match Between System & Real World: 2.0 / 4**
   Exposes technical database keys ("Target Product Catalog Item", "Retailer Store") instead of shopper-friendly aisle terms. Freeform unit field invites arbitrary inputs ("jug", "each") rather than standard grocery units.

3. **User Control & Freedom: 2.0 / 4**
   Users can remove attached photos, but there is no "Clear Form" or "Reset" button, no undo submission action, and no quick link to view the recorded entry in the product ledger.

4. **Consistency & Standards: 2.0 / 4**
   Double karma awarding bug: `savePriceSubmission` in `storage.ts` awards 15 karma points, and `handleManualSubmit` in `page.tsx` calls `addKarmaPoints(15)` again, awarding 30 points for a single observation.

5. **Error Prevention: 1.0 / 4**
   Selecting a new product updates `productId` but leaves `unit` and `category` desynchronized (e.g., selecting apples leaves unit as "1 gal"). No pre-submission price bounds check (e.g. typing $48.90 instead of $4.89).

6. **Recognition Rather Than Recall: 2.0 / 4**
   Unfiltered native dropdown of all catalog products with no recent price benchmark, typical range, or visual category cues.

7. **Flexibility & Efficiency of Use: 1.0 / 4**
   No "Submit & Log Another" flow for shoppers in grocery aisles recording multiple items. Tab 3 is omitted from keyboard shortcuts.

8. **Aesthetic & Minimalist Design: 3.0 / 4**
   Clean card geometry and strict 44px touch targets, but feels clinical compared to the visual polish of Tabs 1 and 2.

9. **Help Users Recognize, Diagnose, & Recover from Errors: 2.0 / 4**
   Alienating statistical jargon (">3σ statistical anomaly") emitted in toasts rather than plain-language decimal guidance.

10. **Help and Documentation: 2.0 / 4**
    Basic subtitle provided, but no explanation of empirical proof guidelines or karma tier bonuses.

---

## Strengths
- Crisp visual geometry with 44px touch-target compliance on buttons and inputs.
- Dual mobile camera capture (`capture="environment"`) and file upload support.
- Fully wired to storage pipeline and outlier quarantine system.

---

## Priority Issues (P0 to P3)

- **[P0] Form Does Not Reset Upon Successful Submission & Duplicate Submissions:**
  *What:* `manualForm` and photo preview states are never cleared after submission.
  *Why:* Users attempting to log another price or double-tapping submit create accidental duplicate submissions.
  *Fix:* Reset form fields upon success while optionally retaining store selection, and display an inline confirmation.
  *Suggested Command:* `/impeccable harden`

- **[P1] Product Catalog Selection Desynchronization:**
  *What:* Changing product selector only changes `productId`, leaving stale `unit` and `category` from previous selections.
  *Why:* Leads to corrupt ledger data (e.g. $1.99 per gallon of apples).
  *Fix:* Look up selected product and auto-synchronize canonical unit, category, and display reference price benchmark.
  *Suggested Command:* `/impeccable clarify`

- **[P1] Duplicate Karma Point Awarding Bug:**
  *What:* `savePriceSubmission` awards 15 points, and `handleManualSubmit` invokes `addKarmaPoints(15)` a second time.
  *Why:* Corrupts gamification accounting (30 points awarded instead of 15).
  *Fix:* Remove redundant `addKarmaPoints` call in `handleManualSubmit`.
  *Suggested Command:* `/impeccable harden`

- **[P2] Pre-Flight Benchmark & Human-Friendly Anomaly Guidance:**
  *What:* Price spikes trigger an alarming ">3σ" technical toast without pre-submission sanity check.
  *Fix:* Show typical price range when product is selected and provide plain-language decimal check.
  *Suggested Command:* `/impeccable polish`
