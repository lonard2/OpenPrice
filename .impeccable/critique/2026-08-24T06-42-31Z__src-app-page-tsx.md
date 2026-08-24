---
target: src/app/page.tsx
total_score: 32
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-08-24T06-42-31Z
slug: src-app-page-tsx
---
# Design Critique: OpenPrice Homepage (`src/app/page.tsx`)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Real-time inflation ticker and price badges are clear; active role is highlighted. |
| 2 | Match System / Real World | 3 | Terms like "Laspeyres Index" and "Full Telemetry" lean academic/jargon-heavy for everyday consumer shoppers. |
| 3 | User Control and Freedom | 4 | Instant category toggling, quick search clearing, and bottom drawer comparisons. |
| 4 | Consistency and Standards | 3 | Semantic emerald/coral price colors strictly upheld; dark hero contrast creates visual disconnect from daytime canvas. |
| 5 | Error Prevention | 3 | Clear search empty states with single-click "Reset Filters" action. |
| 6 | Recognition Rather Than Recall | 4 | Category icon pills, sparklines, and lowest-store badges keep data visible. |
| 7 | Flexibility and Efficiency | 3 | Fast drawer comparison without losing page scroll; lacks quick `/` search shortcut. |
| 8 | Aesthetic and Minimalist Design | 3 | Hero banner carries high cognitive density (3 metric tiles + 3 buttons + badge). |
| 9 | Error Recovery | 3 | Non-blocking filter resets and graceful fallbacks. |
| 10 | Help and Documentation | 3 | Contextual tooltips on metrics, though metric definitions could be simplified. |
| **Total** | | **32/40** | **Good** |

## Design Specificity Verdict

**LLM Assessment**: The OpenPrice homepage has a strong, authentic identity centered on real economic telemetry (rolling inflation rate, store price variances, sparklines) rather than superficial coupon spam. However, the dark navy hero banner (`bg-gradient-to-r from-slate-900 via-indigo-950`) creates an abrupt visual contrast against the crisp daytime canvas (`bg-slate-50`) and pushes the core search bar and product cards below the mobile viewport fold.

**Deterministic Scan**: Found 3 minor `gray-on-color` contrast occurrences in navigation and editor buttons (`DesktopSidebar.tsx:94`, `ExtractedFieldEditor.tsx:381`, `PhotoUploader.tsx:419`). The core homepage markup is clean of structural layout anti-patterns.

## Overall Impression
The homepage is functional, data-rich, and lively. The biggest opportunity is to **streamline the hero zone**, bring the global search bar front-and-center, and replace technical economic jargon with accessible consumer-first vocabulary.

## What's Working
- **Semantic Price Direction:** The immediate visual separation between green savings (emerald) and price hikes (coral sunset) makes scanning deals instantaneous.
- **Sparkline Micro-Charts:** Inline 30-day SVG trend lines on each product card provide rich historical context without requiring a page navigation.
- **Non-Disruptive Compare Drawer:** Comparing multi-store prices in an adaptive bottom drawer keeps the user in their browsing flow without losing scroll position.

## Priority Issues

### [P1] Hero Zone Cognitive Overload & Mobile Push
- **Why it matters:** On mobile viewports (e.g. 375px/390px screens), the hero section consumes over 550px of vertical space (badge + headline + paragraph + 3 metric tiles + 3 buttons), pushing the search input and product grid completely below the fold.
- **Fix:** Compact the hero into a clean, unified daylight banner; integrate the search bar directly into the hero center, and condense metric cards into a horizontal ticker.
- **Suggested command:** `/impeccable layout` or `/impeccable distill`

### [P1] Technical Jargon Barrier
- **Why it matters:** Everyday shoppers looking for grocery or tech deals are confused by terms like *"Laspeyres Index"* and *"Full Telemetry"*.
- **Fix:** Clarify copy to *"Community Inflation Rate"* and *"View Price History & Charts"*, while keeping the mathematical definition in an explanatory tooltip.
- **Suggested command:** `/impeccable clarify`

### [P2] Search Acceleration (Keyboard Shortcuts)
- **Why it matters:** Power shoppers and desktop users expect immediate access to search via `/` or `Cmd+K` without having to manually scroll and click the input.
- **Fix:** Add a global hotkey listener to auto-focus the search bar when pressing `/` or `Cmd+K`.
- **Suggested command:** `/impeccable delight`

### [P2] Gray-on-Color Contrast Fixes
- **Why it matters:** Inactive text using `text-slate-500` or `text-slate-700` on colored badges reduces legibility for low-vision users.
- **Fix:** Replace with white/near-white or high-contrast tint variants.
- **Suggested command:** `/impeccable polish`

## Persona Red Flags
- **Casey (Mobile Shopper in Store Aisle):** Forced to scroll past a large hero banner to reach the search bar and product cards while shopping one-handed.
- **Jordan (First-Time Bargain Hunter):** Hesitates at "Laspeyres Index", wondering if it requires advanced financial knowledge.
- **Alex (Power User):** Presses `/` expecting search to focus, but nothing happens.

## Minor Observations
- The category filter pills scroll horizontally on mobile, which is great, but could use subtle gradient fade masks on the edges to indicate overflow.
- Product card badges have crisp 1px borders, matching the Subtle Ambient Lift design system well.

## Questions to Consider
- What if the hero section was a streamlined search-first command center with the inflation rate as a clean live ticker pill?
- Would everyday users engage more if the store price comparison drawer allowed direct 1-click addition to a shopping list?
