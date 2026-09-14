---
target: product detail page
total_score: 31
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 3
target_identity: "file:/Users/lonard/Desktop/OpenPrice/src/app/product/[id]/page.tsx"
target_fingerprint: "sha256:c8723d41debb1903ee4db26dd6ee3fb4c41cc5f639f6317f50e45a40f1c5c38c"
target_path: /Users/lonard/Desktop/OpenPrice/src/app/product/[id]/page.tsx
timestamp: 2026-09-14T12-46-19Z
slug: src-app-product-id-page-tsx
---
# Impeccable Design Critique: OpenPrice Product Detail Page

Method: dual-agent (A: 59f784b5-4a3b-4ae9-b425-b711e7bc8052 · B: 8142133c-d8aa-425e-903b-8ccf2ab32610)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|:-----:|-----------|
| 1 | Visibility of System Status | 3.1 | Timeframe buttons (7D/1M) silently fall back to full history when data points are sparse |
| 2 | Match System / Real World | 2.8 | Econometric jargon ("Longitudinal Average", "Price Spread") intimidates everyday grocery shoppers |
| 3 | User Control and Freedom | 3.5 | Clean undo toast on watchlist; modal cancel actions prompt; chart legend toggles individual stores |
| 4 | Consistency and Standards | 3.1 | Price alert modal implemented inline in page.tsx rather than modular component; lacks preset chips |
| 5 | Error Prevention | 2.4 | Destructive alert toggle: activating alert on already-watchlisted item un-watchlists it in storage |
| 6 | Recognition Rather Than Recall | 3.6 | Comparison table places store price variance adjacent to retailer name with clear "Best Value" tag |
| 7 | Flexibility and Efficiency | 3.0 | Solid responsive layout; lacks percentage preset buttons (-5%, -10%) and table sorting |
| 8 | Aesthetic and Minimalist Design | 3.3 | Restrained civic palette; top summary card slightly congested with 12+ competing data points |
| 9 | Error Recovery | 3.3 | Brief 404 flash on initial page load before localStorage hydration; 34px recovery button |
| 10 | Help and Documentation | 2.6 | Verification mechanics lack contextual explanations (what "95% confidence" or "Verified Item" entails) |
| **Total** | | **31/40** | **Good** |

## Design Specificity Verdict

- **LLM Assessment:** The page successfully replaces the commercial "Buy Box" with a civic "Civic Watchlist & Alert" posture. The cross-retailer matrix and verified provenance timeline with photo proof lightboxes ground the interface in empirical public auditing. However, the complete omission of packaging imagery (`product.imageUrl`) and physical store branch locality weakens the practical grocery shopping context.
- **Deterministic Scan:** 28 total findings across the Product Detail surface (2 P0, 7 P1, 14 P2, 5 P3). Uncovered a critical functional bug where saving an alert removes an existing product from watchlist due to overloaded toggle logic in `storage.ts`, an initial 404 flash before hydration, 8 touch-target violations (<44px), and 13 instances of low-contrast `text-slate-400` micro-labels.
- **Visual Overlays:** No live browser session connected. Static verification performed across all components.

## Overall Impression
A high-integrity, data-rich civic watchdog interface that avoids e-commerce dark patterns, but currently suffers from two critical lifecycle bugs (destructive alert toggle and 404 flash-of-content) alongside ergonomic touch-target and contrast regressions.

## What is Working
1. **Civic Retail Watchdog Posture:** Prioritizes price variance against the local market floor, cheapest store attribution, and community audits over affiliate monetization.
2. **Dual Desktop Matrix / Mobile Card Architecture:** `StoreComparisonTable` provides a dense, information-rich matrix on desktop and stacks into ergonomic cards on mobile.
3. **Audit Trail with Outlier Flagging:** `ProvenanceTimeline` surfaces source type (shelf tag, flyer, receipt), OCR confidence, and flags statistical outliers with an interactive proof photo lightbox.

## Priority Issues

- **[P0] Destructive Alert Toggle Bug in Storage Engine**
  - **What:** Saving a price alert in the modal calls `toggleWatchlistProduct()`, which deletes the product from `localStorage` if it was already watchlisted.
  - **Why it matters:** Users configuring alerts on their favorite items silently lose their watchlist entries.
  - **Fix:** Extract a dedicated `setWatchlistAlert(productId, targetPrice, preferences)` in `src/lib/storage.ts` that preserves watchlist membership.
  - **Suggested command:** `/impeccable harden`

- **[P0] Flash of "Product Not Found" on Initial Mount**
  - **What:** `product` defaults to `null` on mount, causing lines 159-178 to immediately render the full 404 view before `useEffect` fetches from storage.
  - **Why it matters:** Every valid product page visibly flickers an error screen for 50-150ms during client hydration.
  - **Fix:** Add `isLoading` state initialized to `true` and render a skeleton placeholder while resolving the product.
  - **Suggested command:** `/impeccable harden`

- **[P1] Sub-44px Touch Targets Across Interactive Controls**
  - **What:** Navigation Back button (34px), 404 recovery link (34px), submit observation button (28px), modal footer buttons (32-36px), modal close button (32px), and chart timeframe chips (24px) fall below the 44px ergonomic floor.
  - **Why it matters:** High mis-tap rate on mobile devices, especially when navigating grocery aisles with one hand.
  - **Fix:** Enforce `min-h-[44px]` and `min-w-[44px]` across all buttons and interactive controls.
  - **Suggested command:** `/impeccable adapt`

- **[P1] Low-Contrast Slate-400 Micro-Labels Violating WCAG AA**
  - **What:** 13 micro-labels use `text-slate-400` on white or `bg-slate-50`, yielding contrast ratios of 2.2:1 to 2.33:1 (failing the 4.5:1 WCAG AA minimum).
  - **Why it matters:** Critical context labels ("Lowest Observed Price", "All-Time Lowest", "Confidence") are washed out under bright store lighting.
  - **Fix:** Promote microcopy to `text-slate-500` on white and `text-slate-600` on slate-50 surfaces.
  - **Suggested command:** `/impeccable polish`

- **[P1] Missing Form Association and ARIA Attributes**
  - **What:** Target price `<label>` lacks `htmlFor`, `<Input>` lacks `id`, Watchlist toggle lacks `aria-pressed`, and "Set Alert" button lacks `aria-haspopup="dialog"`.
  - **Why it matters:** Screen reader users cannot link input fields with their labels or identify modal/toggle states.
  - **Fix:** Bind explicit `id` and `htmlFor` attributes and add standard ARIA state attributes.
  - **Suggested command:** `/impeccable harden`

- **[P2] Plain-Language Deficit in Economic Telemetry**
  - **What:** Terms like "Longitudinal Average" and "Price Spread" are academic and foreign to everyday consumers.
  - **Why it matters:** Creates cognitive fatigue and disconnects the data from actionable budget decisions.
  - **Fix:** Replace with "Typical Average Price" and "Store Price Difference".
  - **Suggested command:** `/impeccable clarify`

## Persona Red Flags

- **Alex (Power User):**
  - Cannot sort `StoreComparisonTable` by variance or recent observation.
  - Must type decimal numbers manually in the alert modal without quick-step percentage presets (`-5%`, `-10%`, `All-Time Low`).
- **Jordan (First-Time Shopper):**
  - Sees "Verified Item" and "95% confidence" without any explanation of what verification entails.
  - Faces a jarring flash of "Product Not Found" on page load, causing momentary confusion.
  - No product packaging image to confirm if a price is for an organic or conventional variant.
- **Casey (Distracted Mobile User):**
  - Fragile `router.back()` can exit the website entirely if arriving via an external link.
  - Back button (34px) and timeframe filters (24px) are frustratingly small for thumb taps.

## Minor Observations
- Modal renders inline in the DOM rather than through `createPortal`.
- Notification checkboxes in the alert dialog use `defaultChecked` with no storage persistence.
- `StoreComparisonTable` lacks neighborhood or branch locality under retailer titles.

## Questions to Consider
- What if OpenPrice rendered a compact "True Savings" badge comparing the cheapest store against the nearest store factoring in distance?
- Could clicking a point on the price history line chart jump and highlight the exact provenance receipt in the timeline below?
- What if high-contrast product packaging photos were surfaced in the header to anchor instant visual recognition?
