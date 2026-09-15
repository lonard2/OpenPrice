---
target: homepage
total_score: 32
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
target_identity: "file:/Users/lonard/Desktop/OpenPrice/src/app/page.tsx"
target_fingerprint: "sha256:25f1853a6f22fd260577ffa91a30cb699248d5ce2d363268fccc028524a8586a"
target_path: /Users/lonard/Desktop/OpenPrice/src/app/page.tsx
timestamp: 2026-09-15T04-46-53Z
slug: src-app-page-tsx
---
# Impeccable Design Critique: OpenPrice Homepage

Method: dual-agent (A: 755c6b22-e673-48c8-ba09-c3aaba05089b · B: 4d247c6c-b6b9-405f-b51a-80f01e440449)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|:-----:|-----------|
| 1 | Visibility of System Status | 3.5 | Live pulse beacon and 30D sparklines active; macro catalog lacks last-updated timestamp |
| 2 | Match System / Real World | 2.9 | Academic jargon ("Laspeyres weighted basket") and developer labels ("Taxonomy Manager") leak into consumer view |
| 3 | User Control and Freedom | 3.4 | Toast undo and clear buttons active; single-select category prevents multi-category comparisons |
| 4 | Consistency and Standards | 2.6 | Duplicate bottom bar route (Tabs 3 and 4 both point to /contribute); competing search inputs on desktop |
| 5 | Error Prevention | 3.6 | Hotkey guards prevent focus stealing during modal drawer comparison or active typing |
| 6 | Recognition Rather Than Recall | 3.7 | Dynamic category item counts, winning lowest-price store named on card face, clear visual sparklines |
| 7 | Flexibility and Efficiency | 2.8 | Lacks compact/spreadsheet table view for high-density grocery staple price scanning |
| 8 | Aesthetic and Minimalist Design | 3.0 | ProductCard packs 15 micro-elements (~420px height); 6 instances of sub-4.5:1 text-slate-400 contrast |
| 9 | Error Recovery | 3.5 | Search empty state includes 1-click filter reset and direct contribution link with pre-filled query |
| 10 | Help and Documentation | 2.7 | Inflation calculation tooltip exists, but crowdsourcing verification and OCR mechanics lack onboarding |
| **Total** | | **32/40** | **Good** |

## Design Specificity Verdict

- **LLM Assessment:** Strongly grounded civic retail price observatory (8.8/10 specificity). Visual language avoids e-commerce impulse checkout patterns ("Buy Now") and crypto/fintech volatility styling. The palette strictly aligns with consumer economics (emerald for price drops/savings, rose for price hikes/inflation). However, internal operational concepts ("Taxonomy Manager", "Perspective Dropdown") leak into the consumer header.
- **Deterministic Scan:** 0 AI slop, 0 generic gradient meshes, 0 sparkles, 0 em-dashes. Found 6 text contrast violations (`text-slate-400` on white surfaces, 2.5:1 ratio), 3 sub-44px touch targets (tooltip trigger, drawer close, input clear), and 2 DOM structural issues (heading skip from `h1` to `h4`, illegal `<p>`/`<div>` nesting inside `<h2>` in `Drawer.tsx`).
- **Visual Overlays:** Static code and layout analysis verified across desktop, tablet, and mobile viewports.

## Overall Impression
An authoritative, transparent public price index with solid foundation and civic integrity. The experience is primarily hampered by duplicate navigation destinations on mobile, dual search inputs competing for focus on desktop, and card over-density.

## What is Working
1. **Shopper-First Economic Polarity:** Price drops (consumer savings) are emerald, while price hikes (inflation) are rose. Unambiguous retail economics with zero crypto/fintech distortion.
2. **Progressive Disclosure via Side Drawer:** Comparing a product across retailers opens a bottom/side drawer with store price variances and bar chart without displacing the catalog scroll state.
3. **Reactivity & Undoable State:** Watchlist toggling provides instant visual feedback with accessible toast notifications featuring a 1-click Undo action.

## Priority Issues

- **[P0] Duplicate Bottom Navigation Route on Mobile**
  - **What:** On mobile viewports for public/contributor users, Tab 3 ("Scan") and Tab 4 ("Studio") both route to `/contribute`.
  - **Why it matters:** Wastes 25% of mobile navigation space and disorients mobile shoppers with redundant destinations.
  - **Fix:** Remove the duplicate Studio tab for non-admins and rebalance into a clean 3-tab navigation (`Explore`, `Scan [FAB]`, `Watchlist`) or dedicate Tab 4 to `Trends` (`#telemetry`).
  - **Suggested command:** `/impeccable adapt`

- **[P1] Dual Competing Search Inputs on Desktop**
  - **What:** Both the global header (`#header-global-search`) and catalog card (`#main-product-search`) render search bars simultaneously within a 200px vertical window.
  - **Why it matters:** Induces decision paralysis (Hick's Law) and splits visual focus on wide screens.
  - **Fix:** Conditionally hide the global header search input on the homepage (`pathname === '/'`) so only the hero catalog search is active, or dock smoothly on scroll.
  - **Suggested command:** `/impeccable layout`

- **[P1] Touch Target Compliance & Drawer DOM Nesting**
  - **What:** Methodology tooltip trigger (~18px), drawer close button (~32px), and input clear button (~24px) violate the 44px floor. Furthermore, `Drawer.tsx` nests block elements (`div`, `p`) inside an `<h2>` heading.
  - **Why it matters:** Violates WCAG 2.5.5 touch target sizing and causes HTML5 validation errors.
  - **Fix:** Upgrade triggers to `min-h-[44px] min-w-[44px] touch-target` and allow `Drawer.tsx` to render a `div` when `title` is a composite ReactNode.
  - **Suggested command:** `/impeccable adapt`

- **[P2] Visual Overload on ProductCard (15 Micro-Elements)**
  - **What:** Each card renders category badge, verified ribbon, brand eyebrow, unit, 2-line title, description, 30D movement label, sparkline, lowest price label, store count badge, PriceBadge, store pill, bookmark button, compare button, and details link (~420px height).
  - **Why it matters:** Crowds out desktop scanning efficiency to only 4-6 items above the fold and overwhelms casual grocery shoppers.
  - **Fix:** Prune generic 2-line card descriptions (reserve for product detail view) and integrate the lowest-price label into the PriceBadge to shave ~70px of card height.
  - **Suggested command:** `/impeccable distill`

- **[P2] WCAG AA Text Contrast Hardening**
  - **What:** 6 instances of `text-slate-400` rendered on white/light canvases (2.5:1 ratio) in `page.tsx:211`, `DesktopSidebar.tsx:85, 122`, `Header.tsx:208`, `Footer.tsx:103`, and `ProductCard.tsx:83`.
  - **Why it matters:** Fails WCAG 1.4.3 minimum 4.5:1 contrast for regular text.
  - **Fix:** Upgrade these instances from `text-slate-400` to `text-slate-500` or `text-slate-600`.
  - **Suggested command:** `/impeccable polish`

## Persona Red Flags

- **Alex (Power User):** Forced to scroll through large 420px cards with no compact table/spreadsheet mode. Cannot scan 30 staple items in under a minute without opening and closing the drawer 30 times.
- **Jordan (First-Timer):** Confused by developer/admin terminology ("Public View" role dropdown in header, "Laspeyres weighted basket" in telemetry tooltip).
- **Casey (Distracted Mobile User):** Confronted with duplicate "Scan" and "Studio" tabs on the bottom bar while holding a phone in the grocery store aisle.

## Minor Observations
- Generic `StoreIcon` is used for all stores; visual branded accents or distinct store color tags would improve glanceability.
- The button labeled "Compare" actually opens store price variances for a single item, rather than comparing Product A against Product B; consider labeling as "Store Prices".
- Heading hierarchy skips from `h1` directly to `h4` in product cards; introduce an `h2` section heading and promote card titles to `h3`.

## Questions to Consider
- What if the desktop homepage omitted the header search bar entirely while scrolled to the top, activating it only when the hero search scrolls out of view?
- Could a compact list toggle (`[::] [=]`) give power users like Alex a high-density supermarket price sheet?
- Would simplifying the bottom navigation bar to 3 primary actions make mobile aisle usage frictionless?
