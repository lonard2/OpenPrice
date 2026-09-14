---
target: homepage
total_score: 35
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:/Users/lonard/Desktop/OpenPrice/src/app/page.tsx"
target_fingerprint: "sha256:6b0807ff687f5a05ebd2d9e915c9b33edb1737d42c5598384841950b03f584e6"
target_path: /Users/lonard/Desktop/OpenPrice/src/app/page.tsx
timestamp: 2026-09-14T12-18-38Z
slug: src-app-page-tsx
---
# Impeccable Design Critique: OpenPrice Homepage

Method: dual-agent (A: 1965e4ba-35b1-42a6-99bc-1bae5379fb1f · B: 3d21ab2e-5d22-412b-9910-caeb622ddf24)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|:-----:|-----------|
| 1 | Visibility of System Status | 3.2 | Sidebar static CPI (-0.8%) contradicts hero live basket (+3.9%) |
| 2 | Match System / Real World | 3.2 | Econometric jargon ("Bessel-corrected >3σ outlier rejection") needs plain language gloss |
| 3 | User Control and Freedom | 3.8 | Instant undo toast, responsive Esc dismiss on drawers, explicit filter reset |
| 4 | Consistency and Standards | 3.2 | Duplicate role switcher in Header and Sidebar; dual floating camera triggers on tablets |
| 5 | Error Prevention | 3.7 | Hotkey listener ignores text inputs; filter counts reflect active search queries |
| 6 | Recognition Rather Than Recall | 3.6 | Category pill counters show counts before clicking; lowest store attribution visible inline |
| 7 | Flexibility and Efficiency | 3.7 | Global shortcuts (/ and Cmd+K), multi-faceted sorting, instant in-drawer store comparison |
| 8 | Aesthetic and Minimalist Design | 3.3 | Clean editorial typography, but individual product cards carry up to 6 competing badges |
| 9 | Error Recovery | 3.8 | Helpful empty search state bridges directly into crowdsource upload |
| 10 | Help and Documentation | 3.0 | Footer documents verification filters, but lacks first-timer guide on verified vs unverified |
| **Total** | | **34.5 / 40** | **High Quality / Solid Craft Foundation** |

## Design Specificity Verdict

**LLM Assessment (Assessment A):**
OpenPrice demonstrates strong civic specificity. The primary call to action in the hero is "Log Shelf Tag or Receipt", emphasizing active civic crowdsourcing rather than passive retail browsing. Product cards highlight store-by-store variance and retailer attribution ("at Trader Joe's", "7 stores tracked") rather than checkout funnels. The decoupled Inflation Radar Strip grounds the experience in longitudinal economic reality. However, the catalog layout still bears echoes of generic e-commerce templates, lacks explicit local geographic anchoring (e.g. "Seattle Metro"), and exposes developer/demo perspective controls in both header and sidebar.

**Deterministic Scan (Assessment B):**
- **AI Slop & Gradients:** 100% clean. Zero generic gradient mesh blobs, zero `<Sparkles />` icons, zero em-dashes (—).
- **Color & Contrast:** 100% clean. All text on tinted backgrounds passes WCAG AA contrast with matching hue-family tones.
- **Defects Identified:**
  - 11 touch target violations below the 44px floor (Header contribute link 38px, Watchlist button 36px, Drawer footer buttons ~32px, sidebar role triggers 32px).
  - 3 CSS utility defects (`h-13 w-13` in `MobileBottomBar.tsx` produces no CSS; `text-cerulean-600` in `StoreComparisonTable.tsx` is undefined; `py-0.2` in `DesktopSidebar.tsx` is invalid).
  - Modal focus leakage: Pressing `/` or `Cmd+K` while the Compare Drawer is open pulls focus to the background search input.
  - DOM heading nesting: Drawer title renders an `<h3>` inside an `<h2>` in `page.tsx:309`.

## Overall Impression
OpenPrice is structurally sound, highly responsive, and refreshingly devoid of commercial dark patterns. It successfully balances civic authority with consumer utility. The immediate opportunities are resolving the telemetry synchronization drift, eliminating touch target compromises, and consolidating redundant navigation chrome.

## What's Working
1. **Zero-Latency Comparative Drawer:** Clicking "Compare" slides up a clean distribution chart and price spread table without triggering page navigation or losing catalog scroll position.
2. **Synchronized Search Event Bus:** Bidirectional synchronization between global header search, in-page filter input, URL query parameters, and keyboard hotkeys (`/`, `Cmd+K`) feels fast and responsive.
3. **Actionable Empty-State Loop:** When search yields zero matches, the UI displays an empty state that invites the shopper to crowdsource that exact missing item.

## Priority Issues

### [P1] Telemetry Drift between Sidebar and Hero
- **What:** The desktop sidebar displays static `Community CPI: 104.2 pts (-0.8% 30D)` while the page hero dynamically calculates `+3.9%` Laspeyres rolling basket.
- **Why it matters:** Users viewing both widgets simultaneously encounter conflicting inflation signals, eroding data credibility.
- **Fix:** Connect `DesktopSidebar.tsx` to the reactive storage / inflation calculator so both widgets share a single source of truth.
- **Suggested command:** `/impeccable harden`

### [P1] Touch Target Violations (Sub-44px Floor)
- **What:** 11 interactive controls override or omit the 44px touch target floor (`Header.tsx:169` has `min-h-[38px]`, `Header.tsx:179` has `w-9 h-9`, Drawer footer actions have `px-4 py-2` ~32px height, `StoreComparisonTable` select button has `min-h-[36px]`).
- **Why it matters:** Violates WCAG AA 2.5.5 and creates mis-taps on mobile and touch devices.
- **Fix:** Enforce `min-h-[44px] min-w-[44px]` (`touch-target`) across all interactive triggers and buttons.
- **Suggested command:** `/impeccable adapt`

### [P1] Hotkey Focus Containment Break on Open Drawer
- **What:** Global hotkeys (`/` and `Cmd+K`) remain active when the Compare Drawer is open. Pressing them steals focus from the modal drawer and moves it to the background input, violating `aria-modal="true"`.
- **Why it matters:** Breaks keyboard accessibility and traps screen reader users in an inconsistent state.
- **Fix:** Add `if (comparedProduct) return;` at the top of the global `keydown` handler in `src/app/page.tsx`.
- **Suggested command:** `/impeccable harden`

### [P2] Redundant Perspective Switchers and Tablet FAB Collision
- **What:** "Perspective Mode" (Public / Contributor / Admin) is duplicated in both `Header.tsx` (L185) and `DesktopSidebar.tsx` (L183). On tablets (`md:block lg:hidden`), `QuickScanFAB` and `MobileBottomBar` render two floating camera buttons simultaneously.
- **Why it matters:** Clutters navigation chrome and creates conflicting action targets.
- **Fix:** Consolidate perspective controls into the header, and hide `QuickScanFAB` whenever `MobileBottomBar` is rendered.
- **Suggested command:** `/impeccable distill`

### [P2] Product Card Visual Density & Badge Fatigue
- **What:** Each `ProductCard` packs up to 6 chips/badges (Category, Unit, Brand, Verified ribbon, Movement pill, Store count) plus a sparkline and 3 action buttons.
- **Why it matters:** High visual noise slows down rapid scanning across 24 catalog items.
- **Fix:** Integrate unit directly into the title line (e.g. "Organic Whole Milk (1 Gallon)"), streamline to 2 essential badges (Lowest Store + Price Change), and clean up action buttons.
- **Suggested command:** `/impeccable polish`

## Persona Red Flags

- **Alex (Power User):**
  - *Red Flag:* No compact tabular view toggle. Alex is forced to scroll through spacious cards rather than viewing a dense, sorting-optimized price comparison list.
  - *Red Flag:* Drawer focus leakage when using keyboard shortcuts.
- **Jordan (First-Time Shopper):**
  - *Red Flag:* Jargon in statistical tooltips ("Bessel-corrected >3σ outlier rejection", "Laspeyres weighted basket") creates cognitive intimidation.
  - *Red Flag:* Confusion around "Perspective Mode" in the header; Jordan may wonder if registration is required to use the site.
- **Casey (Distracted Mobile User):**
  - *Red Flag:* Vertical viewport crowding: sticky header (64px) + mobile bottom bar (64px + safe area) consume ~130px of vertical space.
  - *Red Flag:* 8 category filter pills require horizontal swiping, creating discovery blindness for offscreen categories.

## Minor Observations
- `MobileBottomBar.tsx:55`: `h-13 w-13` should be `h-[52px] w-[52px]` (`13` is not a standard Tailwind scale unit).
- `StoreComparisonTable.tsx:134`: `text-cerulean-600` is an undefined class; should be `text-sky-600` or `text-brand-cerulean`.
- `page.tsx:309`: Drawer title should use `<span className="text-base font-bold ...">` instead of nesting an `<h3>` inside an `<h2>`.
- `ProductGrid.tsx:213`: Add `aria-pressed={isSelected}` to category filter pill buttons for screen reader state reflection.

## Questions to Consider
- What if OpenPrice offered a prominent "Local Store Filter" (e.g. Seattle Downtown vs Bellevue) to make price variance immediately personal?
- Could a compact 1-line Table View be toggled alongside the Card Grid for power users comparing weekly baskets?
- What if the hero search bar allowed instant camera drop-in directly from the input?
