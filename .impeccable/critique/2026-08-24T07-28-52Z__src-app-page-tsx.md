---
target: src/app/page.tsx
total_score: 35
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-08-24T07-28-52Z
slug: src-app-page-tsx
---
# Design Critique: OpenPrice Homepage (`src/app/page.tsx`)

Method: dual-agent (A: 1c94131c · B: f937125a)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Dynamic item counts and live telemetry badge; silent bookmark toggle lacks toast feedback |
| 2 | Match System / Real World | 4 | Natural grocery vocabulary (units, shelf tags, price drops); clear Laspeyres basket methodology |
| 3 | User Control and Freedom | 4 | Full keyboard shortcuts (`/`, `⌘K`, `Esc`), one-click clear search, and instant reset filters |
| 4 | Consistency and Standards | 3 | Dual search inputs on desktop (`readOnly` header search and real grid search bar) |
| 5 | Error Prevention | 4 | Card click handlers guard interactive child buttons; header search handles navigation safely |
| 6 | Recognition Rather Than Recall | 4 | Instant 30D sparklines, category pills with count badges, and verified provenance ribbons |
| 7 | Flexibility and Efficiency | 3 | Fast hotkeys and bottom comparison drawer; lacks compact table toggle for power users |
| 8 | Aesthetic and Minimalist Design | 4 | Daylight Community Exchange aesthetic, crisp elevation layers, strict tabular numerals |
| 9 | Error Recovery | 4 | Empty search state quotes search term with one-click "Log price for [Item]" crowdsource CTA |
| 10 | Help and Documentation | 3 | Clear tooltips on CPI metrics; lacks quick onboarding modal explaining karma and verification |
| **Total** | | **35/40** | **Good (87.5%)** |

## Design Specificity Verdict

**LLM Assessment:**
OpenPrice exhibits strong domain authenticity. The inverted financial color semantics (Emerald = price drop/savings, Coral Rose = inflation/price hike) are tailored specifically to consumer shopping psychology. Granular physical retail metrics (`1 gal`, `24 oz loaf`) and verification ribbons give the app genuine utility character. Minor generic artifacts remain: decorative blur background blobs in the hero and a developer-oriented 3-role switcher in the top navigation bar.

**Deterministic Scan:**
The automated AST and token detector (`detect.mjs`) returned **0 findings across 28 scanned source files**. Zero anti-pattern violations: no AI dark/cyan glows, no gray-on-color contrast failures (all text passes WCAG AA/AAA, 5.1:1 to 15.6:1), zero hardcoded token drift, 100% tabular numerals (`font-mono tabular-nums`) across all metrics, and all mobile touch targets meet >=42px–44px minimums.

## Overall Impression
OpenPrice is clean, trustworthy, and fast. The Daylight aesthetic and instant comparison sheet make finding grocery bargains satisfying. The biggest opportunity is eliminating the dual-search ambiguity on desktop and adding reassuring micro-feedback (toasts) on watchlist interactions.

## What's Working
1. **Domain Color Semantics:** Inverted Emerald/Rose logic directly connects price movements with household savings.
2. **Context-Preserving Comparison Sheet:** The bottom comparison drawer allows deep multi-store price inspection without losing search queries or scroll position.
3. **Crowdsourcing Loop:** Empty search states convert dead ends into high-intent contribution triggers (`Log price for "[query]"`).

## Priority Issues

- **[P1] Dual Search Confusion on Desktop**
  - **Why it matters:** On desktop, both the header `readOnly` search input and the catalog search bar are visible at once, causing cognitive friction over which input to use.
  - **Fix:** Unify search state so the header input is active and syncs with the grid, or hide the header search input on `/` when the main search bar is in the viewport.
  - **Suggested command:** `/impeccable clarify`

- **[P1] Silent Watchlist Bookmark (Missing Feedback)**
  - **Why it matters:** Clicking the bookmark icon toggles state visually but provides no toast confirmation, badge animation, or undo action, leaving users uncertain if the item saved.
  - **Fix:** Trigger a lightweight feedback toast ("Saved [Product] to Watchlist • View") with an inline Undo action.
  - **Suggested command:** `/impeccable polish`

- **[P2] Developer Role Switcher in Primary Consumer Navigation**
  - **Why it matters:** Pinned `Public` / `Contributor` / `Admin` buttons in the top header make the app feel like an internal prototype rather than a public community platform.
  - **Fix:** Move the role switcher into a subtle floating dev badge or user settings popover.
  - **Suggested command:** `/impeccable layout`

- **[P2] Sub-375px Mobile Card Action Spacing**
  - **Why it matters:** On very narrow viewports (<360px), 3 action buttons in a row can feel tight for one-handed thumb interaction.
  - **Fix:** Refine grid spans and ensure Bookmark and Compare buttons maintain a generous 44px touch target.
  - **Suggested command:** `/impeccable adapt`

## Persona Red Flags

- **Alex (Power User):** Cannot switch into a dense, high-throughput tabular view to quickly scan 50+ items at a glance; lacks keyboard arrow navigation (`J`/`K`) through results.
- **Jordan (First-Timer):** May stumble over technical phrasing like `Laspeyres weighted basket index` without an introductory tooltip; might hesitate to contribute shelf tags fearing account requirements.
- **Casey (Distracted Mobile User):** The Floating Action Button (`QuickScanFAB`) is hidden on small mobile viewports to yield to the bottom nav bar, making scan ingestion a two-step tap.

## Minor Observations
1. **Cheapest Retailer Callout on Card:** Surfacing "Lowest: $2.49 at Aldi" directly on the card face would save users a click compared to opening the drawer.
2. **Dynamic Category Pill Counts:** Category pill counts (e.g. `Groceries (4)`) currently reflect total catalog counts rather than matching items under an active search query.

## Questions to Consider
- What if the winning retailer name were directly displayed inside the lowest price badge on each card?
- Should the role switcher be tucked away into a floating bottom-right dev pill to make the header 100% consumer-focused?
