---
target: src/app/watchlist/page.tsx
total_score: 24
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
timestamp: 2026-09-17T12:36:31Z
slug: src-app-watchlist-page-tsx
---
# Design Critique: Watchlist & Price Alerts (`src/app/watchlist/page.tsx`)

> **Method: dual-agent (A: 7c25c6db-6ca9-4795-aee6-0ec215e0ce21 · B: 58789674-2bf3-451c-9129-ff6d0bf7982e)**

---

## 1. Design Specificity Verdict

- **LLM Assessment**: High civic potential, marred by synthetic inventory calculation and missing crowdsource attribution. The combination of individual product watchlists and a combinatorial multi-store basket optimizer directly addresses grocery inflation defense. However, cards omit winning store names, contributor verification tags, and packaging images.
- **Deterministic Scan**: 18 static rule flags detected across 5 categories: 5 touch target violations (quantity steppers at 28x28px, remove button at 28x28px), 3 sub-4.5:1 text contrast violations (`text-slate-400` on white), 3 missing ARIA names, 1 unlinked input label, and 5 non-tabular numerals.

---

## 2. Nielsen Usability Heuristics Scorecard (24 / 40)

| # | Heuristic | Score | Rationale & Key Issue |
|---|---|:---:|---|
| **1** | **Visibility of System Status** | **2 / 4** | Header tracks item count and optimizer displays basket items. However, individual cards omit *which retailer* offers the lowest price, and single-store rankings conceal unlisted item counts. |
| **2** | **Match Between System and Real World** | **2 / 4** | Real shoppers care about driving friction vs dollar savings. The optimizer recommends 3-to-4 store split trips to save pennies without transit friction gates, and defaults every bookmarked item to basket quantity = 1. |
| **3** | **User Control and Freedom** | **3 / 4** | Excellent non-destructive deletion with an immediate "Undo" toast. However, users cannot clear an alert threshold back to default tracking, nor are there bulk basket controls (e.g. "Clear Basket", "Select All"). |
| **4** | **Consistency and Standards** | **3 / 4** | Follows OpenPrice card standards and color coding. However, quantity steppers sit in heavy gray callout blocks dominating the card visual hierarchy over product titles. |
| **5** | **Error Prevention** | **2 / 4** | The alert modal allows setting prices higher than current lowest prices without warning (causing instant false alerts). The optimizer imputes missing store items with an arbitrary 15% markup without notifying users. |
| **6** | **Recognition Rather Than Recall** | **2 / 4** | Product cards omit packaging thumbnails (`prod.imageUrl`). Shoppers must read text names rather than visually recognizing grocery packaging. Competitor prices are hidden unless drilling into details. |
| **7** | **Flexibility and Efficiency of Use** | **2 / 4** | No search input, category filter, or sorting controls (e.g., sort by biggest price drop, highest potential savings). Managing 15+ items becomes an exhaustive vertical scroll. |
| **8** | **Aesthetic and Minimalist Design** | **3 / 4** | Clean slate and emerald palette with a distinctive dark hero card for split savings. Minor clutter from repeating the expansive gray "Quantity in Basket Optimizer" box on every row. |
| **9** | **Error Recovery** | **3 / 4** | Exemplary empty state with a 1-click "Add 5 Popular Essentials" seed action. Removing items includes immediate Undo recovery. Modal input lacks numeric validation feedback. |
| **10** | **Help and Documentation** | **2 / 4** | Subtitles introduce the concepts, but lack tooltips explaining how the split trip is routed, how out-of-stock items are estimated, or how alert notifications are delivered. |

---

## 3. Overall Impression

The Watchlist & Basket Optimizer is one of OpenPrice's core civic value propositions: turning crowdsourced price data into an actionable grocery inflation battle plan. However, the experience currently suffers from two major friction points:
1. **Mathematical Concealment**: When a store does not stock an item, the optimizer invents an artificial 15% markup and lists the store in the ranking without displaying that items are missing.
2. **Mobile Ergonomics**: The 28x28px quantity steppers violate accessibility guidelines, and placing the entire optimizer below the watchlist creates long vertical scrolling on mobile phones.

---

## 4. Key Strengths

1. **Integrated Multi-Store Basket Optimizer**: Comparing single-store totals against optimal split-trip routing is an outstanding feature tailored to inflation-conscious households.
2. **First-Run Empty State Experience**: The "Add 5 Popular Essentials" one-click starter solves the cold-start problem, letting new visitors experience the optimizer immediately.
3. **Non-Destructive Deletion with Undo Toast**: Removing items preserves state safety through an ephemeral toast with a one-click Undo action.

---

## 5. Priority Issues (P0 to P3)

### [P0] Concealed Missing Items & Synthetic 15% Markup in Optimizer
- **What**: When a retailer does not stock an item, line 177 silently applies an artificial 15% markup (`currentLowestPrice * 1.15`). Although `missingItemsCount` is calculated, it is never shown in the Single-Store Checkout Ranking table.
- **Why it matters**: Severe civic trust risk. A shopper may drive to a store marked "Best 1-Stop" only to find 3 out of 5 items are unlisted.
- **Fix**: In the single-store ranking table, display an in-stock badge (e.g. `5/5 in stock` in green, or `2 unlisted (estimated)` in amber). Add a toggle to filter out stores with unlisted items.
- **Suggested command**: `/impeccable clarify`

### [P1] Sub-44px Touch Targets on Steppers, Actions, and Modals
- **What**: Quantity adjustment buttons (`Minus`/`Plus`) are `w-7 h-7` (28x28px), trash buttons are `p-1.5` (28px tap target), and alert pill buttons are `py-1` (24-26px tap height).
- **Why it matters**: Severe mobile usability violation under WCAG 2.5.5 / 2.5.8. Shoppers in store aisles frequently mis-tap or struggle to adjust quantities.
- **Fix**: Upgrade steppers to `min-w-[44px] min-h-[44px]` with larger touch targets, and enlarge icon button hitboxes.
- **Suggested command**: `/impeccable polish`

### [P1] Missing Store Attribution & Packaging Imagery on Item Cards
- **What**: Watchlist product cards omit `prod.imageUrl` and invoke `PriceBadge` without passing `storeName`.
- **Why it matters**: Shoppers recognize items by packaging graphics, not plain text SKUs. Displaying a price without a store name forces users to navigate to detail pages just to see where the deal is located.
- **Fix**: Add a compact 48x48px rounded image thumbnail with category fallback, and render the winning store name directly beside the price badge (e.g. "$3.89 at Aldi").
- **Suggested command**: `/impeccable bolder`

### [P2] Greedy Split-Trip Optimizer Lacks Driving Friction & Minimum Savings Threshold
- **What**: The optimizer recommends splitting across 3 or 4 physical stores even if the total savings is merely $0.15, and hardcodes `'Target'` as a fallback store name.
- **Why it matters**: Recommending multiple store stops for negligible savings creates user skepticism and ignores transit friction.
- **Fix**: Add a trip efficiency gate (e.g. only suggest an additional store if net savings exceed $3.00), dynamic store fallback, and an itinerary cap option (`Max 2 Stores`).
- **Suggested command**: `/impeccable optimize`

### [P2] Unlinked Input Label, Ambiguous Stepper ARIA Labels, and Contrast Dips
- **What**: `<label>` in the edit modal lacks `htmlFor`, `<Input>` lacks `id`, steppers have generic `aria-label="Decrease quantity"` without product context, and `text-slate-400` microcopy yields 2.82:1 contrast.
- **Why it matters**: Fails WCAG AA accessibility for screen reader users and low-vision shoppers.
- **Fix**: Pass `label="Target Price ($)"` directly to the `Input` component, include product names in stepper `aria-label`, and upgrade microcopy to `text-slate-500` (4.6:1).
- **Suggested command**: `/impeccable harden`

### [P3] Banned Eyebrow Kicker Pill and Incomplete Inflation Spike Alerts
- **What**: The header features a banned eyebrow kicker badge (`Personal Watchlist & Basket Optimizer`), violating `craft-floor.md`. The alert modal lacks quick percentage discounts (`-5%`, `-10%`) and inflation spike warnings.
- **Why it matters**: Creates visual clutter and limits proactive alert configuration.
- **Fix**: Remove the eyebrow kicker pill, and enrich the alert modal with quick percentage discount presets.
- **Suggested command**: `/impeccable distill`

---

## 6. Persona Red Flags

- **Alex (Power Shopper / Tracker managing 20 items)**: No search or category filter. Scrolling through 20 separate cards with repetitive quantity boxes is slow. No bulk action to "Add all to basket" or "Clear quantities".
- **Jordan (Budget-Conscious Shopper)**: Cannot evaluate whether a 3-store split is worth the driving distance versus a single-store run.
- **Casey / Sam (Mobile Shopper in Aisle / Screen Reader User)**: 28px quantity steppers trigger accidental mis-taps. Screen readers receive repetitive "Decrease quantity" buttons without knowing which product is being adjusted.

---

## 7. Minor Observations & Questions to Consider

1. **Inline Stepper Placement**: Moving the quantity stepper into an inline pill next to the price would eliminate the heavy 44px gray sub-box and reduce card height by 30%.
2. **Sticky Mobile Summary**: On mobile viewports, could a sticky bottom pill show the active basket total and split-trip savings so users do not have to scroll 900px down to see the optimizer?
3. **Civic Verification Loop**: Could each watchlist card have a quick "Verify in-store" button that launches the receipt/shelf-tag OCR camera to earn +15 Karma?
