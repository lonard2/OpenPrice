# Project: OpenPrice

## Overview
OpenPrice is a modern, crowdsourced, and multi-source price tracking and intelligence web application for everyday goods and services. It aggregates data from physical store observations (shelf tag photos, receipts, promotional flyers) and online listings into an open, community-verified historical record with interactive price charts, store comparisons, and inflation analytics across mobile, tablet, and desktop viewports.

---

## Architecture
- **Framework & Runtime:** Next.js 15+ App Router, React 19, TypeScript 5.x, Tailwind CSS 3.4+.
- **Design System:** "The Community Exchange" aesthetic matching `DESIGN.md` (Subtle Ambient Lift, strict price direction semantics, tabular numerals, $\ge 44\text{px}$ touch targets).
- **Client Persistence:** Reactive LocalStorage client-side storage for custom products, contributions, watchlist, karma, and role preferences.
- **Multimodal AI/OCR Pipeline:** OpenRouter multimodal vision API (`google/gemini-2.5-flash` / `gpt-4o-mini`) with structured JSON schema output, normalized coordinate bounding boxes (0.0%–100.0%), deterministic fallback parser, and two-way SVG bounding box synchronization.
- **Data Visualizations:** Recharts telemetry components (`PriceHistoryChart` with multi-store overlays & 7D/1M/3M/6M/1Y/ALL timeframes, `Sparkline`, `InflationRadar`, `StoreComparisonChart`).
- **Multi-Role Perspectives:** Seamless role context switching (`public`, `contributor`, `admin`) across public catalog, contributor ingestion studio, and admin moderation hub.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---|---|---|---|
| 1 | Next.js 15+ App Router & TS Config | Modern full-stack framework with strict TypeScript and `@/*` alias | M1 | R1, TEAM.md |
| 2 | Tailwind CSS Design Tokens | Exact color tokens, fonts, shadows, and touch rules from DESIGN.md | M1 | R1, DESIGN.md |
| 3 | Tabular Numeral Typography | `font-variant-numeric: tabular-nums` to prevent numeric layout shift | M1 | R1, DESIGN.md |
| 4 | Multi-Role Context Shell | Client-side `RoleProvider` for `public`, `contributor`, `admin` roles | M1 | R5, TEAM.md |
| 5 | Root Responsive Layout | Root layout with glass header, desktop sidebar, mobile bottom bar & FAB | M1 | R1, R5, DESIGN.md |
| 6 | Domain TypeScript Models | Complete types for Product, Store, PricePoint, OCR, Analytics, User | M2 | R2, TEAM.md |
| 7 | Price Delta & Volatility Math | Formulas for $\Delta P$, $\% \Delta P$, and price trend classification | M2 | R2, TEAM.md |
| 8 | Laspeyres Inflation Basket Engine | Rolling weighted category and composite community inflation index | M2 | R2, TEAM.md |
| 9 | Store Price Variance Calculator | Retailer price variance, market spread, and cheapest store ranking | M2 | R2, TEAM.md |
| 10 | $>3\sigma$ Outlier Anomaly Detector | Bessel-corrected statistical Z-score outlier price flagger | M2 | R2, TEAM.md |
| 11 | Tabular Numeric Formatters | Tabular currency, signed percentage deltas, and relative timestamps | M2 | R2, DESIGN.md |
| 12 | Rich Seed Dataset Engine | 7 retail stores, 20 multi-category products, 1-year longitudinal price points | M2 | R2, TEAM.md |
| 13 | Reactive LocalStorage Layer | Client persistence for user edits, contributions, watchlist, karma | M2 | R2, TEAM.md |
| 14 | Atomic UI Primitives | Accessible Button, Input, Badge, Card, Modal, Drawer, Tabs, Tooltip | M3 | R1, R4, TEAM.md |
| 15 | Strict PriceBadge Component | Semantic direction colors (Emerald drop, Coral hike, Slate stable) | M3 | R1, R4, DESIGN.md |
| 16 | Recharts PriceHistoryChart | Multi-store time series, 7D/1M/3M/6M/1Y/ALL toggles, touch tooltips | M3 | R4, TEAM.md |
| 17 | Compact Sparklines | 7D/30D inline SVG trend indicators for product cards and matrices | M3 | R4, DESIGN.md |
| 18 | Category InflationRadar Chart | 6-axis category inflation barometer chart | M3 | R4, TEAM.md |
| 19 | Store Comparison Bar Chart | Horizontal store price variance ranking visualization | M3 | R4, TEAM.md |
| 20 | OpenRouter Vision API Route | `/api/ocr/parse` endpoint calling vision models with JSON prompting | M4 | R3, TEAM.md |
| 21 | Deterministic Offline Fallback OCR | Offline heuristic fallback parsing for sample shelf tags, receipts, flyers | M4 | R3, TEAM.md |
| 22 | Interactive Bounding Box Overlay | SVG coordinate overlay on photos (0.0%–100.0%) with confidence colors | M4 | R3, DESIGN.md |
| 23 | Extracted Field Table Editor | Real-time editable table with live two-way hover/focus bounding-box sync | M4 | R3, TEAM.md |
| 24 | Pamphlet & Flyer Batch Viewer | Multi-deal circular viewer with pan/zoom and batch item selection | M4 | R3, TEAM.md |
| 25 | Public Explorer Homepage | Ticker, category pills, search/sort toolbar, ProductGrid, ProductCards | M5 | R5, TEAM.md |
| 26 | Deep Product Detail Page | `/product/[id]` with charts, store matrix, provenance feed, price alert modal | M5 | R5, TEAM.md |
| 27 | Contributor Ingestion Studio | 4-tab ingestion (Photo OCR, Flyer, Manual CRUD, Web URL), karma card | M5 | R5, TEAM.md |
| 28 | Watchlist & Basket Optimizer | Tracked items, drop alerts, and cheapest single/split store routing | M5 | R5, TEAM.md |
| 29 | Admin Moderation Hub | `/admin/moderation` queue, side-by-side diff inspector, approval actions | M5 | R5, TEAM.md |
| 30 | Admin Taxonomy Manager | `/admin/taxonomy` store directory and category/unit editors | M5 | R5, TEAM.md |
| 31 | Responsive Ergonomics & Touch | Mobile (<640px bottom bar, QuickScan FAB), Tablet, Desktop 3-column | M5 | R5, DESIGN.md |
| 32 | Opaque-Box E2E Testing Suite | Tiers 1-4 test suite covering all features, boundary cases, workflows | E2E | R6, CHECKLIST.md |
| 33 | Adversarial Coverage Hardening | Tier 5 stress testing on race conditions, corrupt storage, WCAG AA | M6 | R6, CHECKLIST.md |
| 34 | Code Hygiene & License Attribution | Zero TS errors, clean build, no TODO stubs, no emojis, README/CREDITS | M6 | R6, AGENT.md |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| M1 | Architecture & Foundation | `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `tailwind.config.ts`, `src/lib/utils.ts`, `src/app/globals.css`, `RoleContext.tsx`, `src/app/layout.tsx` | none | DONE |
| M2 | Domain Types, Analytics Math & Seed Engine | `src/types/*`, `src/lib/formatters.ts`, `src/lib/inflation.ts`, `src/lib/mock-data.ts`, `src/lib/storage.ts`, unit math tests | M1 | DONE |
| M3 | Atomic UI Primitives & Telemetry Visualizations | `src/components/ui/*`, `PriceBadge.tsx`, `PriceHistoryChart.tsx`, `Sparkline.tsx`, `InflationRadar.tsx`, `StoreComparisonChart.tsx`, navigation components | M1, M2 | DONE |
| M4 | Multimodal AI / OCR Vision Parsing Pipeline | `src/lib/openrouter.ts`, `src/app/api/ocr/parse/route.ts`, `src/components/ocr/*` (PhotoUploader, BoundingBoxOverlay, ExtractedFieldEditor, PamphletViewer) | M1, M2, M3 | DONE |
| M5 | Multi-Role Perspectives & Responsive Workflows | Public (`/`, `/product/[id]`), Contributor (`/contribute`, `/watchlist`), Admin (`/admin/moderation`, `/admin/taxonomy`), mobile/tablet/desktop integration | M1, M2, M3, M4 | DONE |
| E2E | E2E Testing Suite Track | Opaque-box test harness and test cases (Tiers 1-4) published as `TEST_READY.md` (316 tests pass) | M1 (runs parallel) | DONE |
| M6 | Final Milestone: 100% E2E Pass & Adversarial Hardening | Pass 100% E2E suite (Tiers 1-4) + Tier 5 Adversarial hardening + Zero TS errors + Clean build + Attribution | M5, E2E | DONE |

---

## Interface Contracts

### 1. `RoleContext` ↔ UI & Page Shells
```typescript
export interface RoleContextType {
  role: UserRole; // 'public' | 'contributor' | 'admin'
  setRole: (role: UserRole) => void;
  isContributor: boolean;
  isAdmin: boolean;
  isPublic: boolean;
}
```

### 2. `inflation.ts` & `formatters.ts` ↔ Charts & Components
```typescript
export function calculatePriceDelta(current: number, previous: number): { amount: number; percent: number; status: PriceTrendStatus };
export function calculateInflationIndex(currentPrices: Record<string, number>, basePrices: Record<string, number>, weights: Record<string, number>): InflationBasketReport;
export function calculateStorePriceVariance(storePrices: Array<{ storeId: string; storeName: string; price: number }>): StorePriceComparison[];
export function detectPriceOutlier(newPrice: number, historicalPrices: number[], thresholdSigma?: number): PriceOutlierReport;
export function formatCurrency(amount: number, currency?: string, showSign?: boolean): string;
export function formatDeltaPercent(delta: number): string;
export function getDeltaStyle(delta: number): { text: string; bg: string; border: string; badgeClass: string; icon: 'up' | 'down' | 'flat'; label: string };
export function formatRelativeTime(date: string | Date | number): string;
```

### 3. `storage.ts` ↔ Application Views
```typescript
export function getStoredProducts(): Product[];
export function getStoredProductById(id: string): Product | undefined;
export function savePriceSubmission(submission: Partial<PricePoint> & { productId: string; price: number }): { success: boolean; pricePoint: PricePoint; isOutlier: boolean };
export function getStoredWatchlist(): WatchlistItem[];
export function toggleWatchlistProduct(product: Product, targetPrice?: number): boolean;
export function getStoredKarma(): ContributionKarma;
export function addKarmaPoints(points: number, reason: string): ContributionKarma;
export function getModerationQueue(): ModerationItem[];
export function resolveModerationItem(id: string, action: 'approve' | 'reject' | 'adjust', adjustedPrice?: number): void;
```

### 4. Multimodal OCR API (`/api/ocr/parse`) ↔ OCR UI
```typescript
// Request: POST /api/ocr/parse
export interface OcrParseRequest {
  imageBase64?: string;
  imageUrl?: string;
  sourceType: 'photo_shelf' | 'promo_pamphlet' | 'receipt';
}

// Response: 200 OK
export interface OcrParseResponse {
  success: boolean;
  result: OcrParseResult;
  source: 'openrouter' | 'fallback';
}
```

---

## Code Layout
```
OpenPrice/
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── tailwind.config.ts
├── README.md
├── CREDITS.md
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── product/[id]/page.tsx
│   │   ├── contribute/page.tsx
│   │   ├── watchlist/page.tsx
│   │   ├── admin/
│   │   │   ├── moderation/page.tsx
│   │   │   └── taxonomy/page.tsx
│   │   └── api/
│   │       ├── ocr/parse/route.ts
│   │       ├── prices/route.ts
│   │       └── products/route.ts
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Drawer.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   └── Skeleton.tsx
│   │   ├── product/
│   │   │   ├── PriceBadge.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── StoreComparisonTable.tsx
│   │   │   └── ProvenanceTimeline.tsx
│   │   ├── charts/
│   │   │   ├── PriceHistoryChart.tsx
│   │   │   ├── Sparkline.tsx
│   │   │   ├── InflationRadar.tsx
│   │   │   └── StoreComparisonChart.tsx
│   │   ├── ocr/
│   │   │   ├── PhotoUploader.tsx
│   │   │   ├── BoundingBoxOverlay.tsx
│   │   │   ├── ExtractedFieldEditor.tsx
│   │   │   └── PamphletViewer.tsx
│   │   ├── moderation/
│   │   │   ├── ModerationQueueItem.tsx
│   │   │   └── OutlierAlertBanner.tsx
│   │   ├── navigation/
│   │   │   ├── Header.tsx
│   │   │   ├── DesktopSidebar.tsx
│   │   │   ├── MobileBottomBar.tsx
│   │   │   └── QuickScanFAB.tsx
│   │   └── providers/
│   │       └── RoleContext.tsx
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── formatters.ts
│   │   ├── inflation.ts
│   │   ├── mock-data.ts
│   │   ├── openrouter.ts
│   │   └── storage.ts
│   └── types/
│       ├── product.ts
│       ├── ocr.ts
│       ├── analytics.ts
│       ├── user.ts
│       └── index.ts
└── tests/
    ├── unit/
    │   ├── formatters.test.ts
    │   └── inflation.test.ts
    ├── components/
    │   ├── PriceBadge.test.tsx
    │   └── BoundingBoxOverlay.test.tsx
    ├── integration/
    │   ├── role-view-switch.test.tsx
    │   ├── ocr-ingestion-flow.test.tsx
    │   └── moderation-workflow.test.tsx
    └── e2e/
        ├── tier1-feature-coverage.test.ts
        ├── tier2-boundary-cases.test.ts
        ├── tier3-pairwise-combinations.test.ts
        ├── tier4-real-world-scenarios.test.ts
        └── tier5-adversarial-hardening.test.ts
```
