# OpenPrice Development Checklist (`CHECKLIST.md`)

This master checklist outlines every implementation phase, sub-task, and verification gate for the OpenPrice crowdsourced and parsed price tracking platform.

---

## Progress Dashboard

- **Total Phases:** 16 Phases
- **Current Status:** Phase 1 (Foundations & Governance Ready)
- **Overall Completion:** [■□□□□□□□□□□□□□□□] 6%

---

## Phase 1: Environment & Project Foundation
- [x] Create project repository structure and governance files (`PRODUCT.md`, `DESIGN.md`, `.impeccable/config.json`).
- [x] Scaffold agent instruction hierarchy (`AGENT.md`, `src/app/AGENT.md`, `src/components/AGENT.md`, `src/lib/AGENT.md`, `src/types/AGENT.md`).
- [ ] Initialize Next.js 15+ App Router application with React 19 and TypeScript.
- [ ] Install essential runtime dependencies: `lucide-react`, `recharts`, `clsx`, `tailwind-merge`.
- [ ] Configure `tsconfig.json` with strict type checking, `@/*` path aliases, and module resolution.
- [ ] Configure `.env.local` with `OPENROUTER_API_KEY` for multi-modal vision parsing.

---

## Phase 2: Design Token & Global Style System
- [ ] Configure `tailwind.config.ts` mapping all tokens from `DESIGN.md`:
  - [ ] Neutral ground: Canvas (`#F8FAFC`), Card Surface (`#FFFFFF`), Border Hairline (`#E2E8F0`).
  - [ ] Primary structural navy: Deep Slate Navy (`#0F172A`).
  - [ ] Semantic accents: Mint/Emerald (`#10B981`), Coral Crimson (`#F43F5E`), Electric Violet (`#6366F1`), Amber Sun (`#F59E0B`).
- [ ] Implement **The Tabular Numerals Rule** in `globals.css` (`font-variant-numeric: tabular-nums`).
- [ ] Implement **The Border-First Depth Rule** (crisp 1px border system and micro-elevation styles).
- [ ] Define responsive container breakpoints and viewport utility classes (`mobile`, `tablet`, `desktop`).

---

## Phase 3: Domain Types & Schema Infrastructure
- [ ] Create `src/types/product.ts`:
  - [ ] `Product`, `ProductCategory`, `PricePoint`, `PriceTrendStatus`, `Store`.
- [ ] Create `src/types/ocr.ts`:
  - [ ] `BoundingBox`, `ExtractedPriceItem`, `OcrParseResult`, `OcrSourceType`.
- [ ] Create `src/types/analytics.ts`:
  - [ ] `InflationBasket`, `TimeframeFilter`, `StorePriceComparison`, `TrendIndicator`.
- [ ] Create `src/types/user.ts`:
  - [ ] `UserRole` (`public` | `contributor` | `admin`), `WatchlistItem`, `ModerationItem`, `ContributionKarma`.
- [ ] Create barrel export `src/types/index.ts`.

---

## Phase 4: Analytics Math Engine & Utility Suite
- [ ] Implement `src/lib/formatters.ts`:
  - [ ] `formatCurrency(amount, currency)` with tabular spacing.
  - [ ] `formatDeltaPercent(delta)` with explicit `+` or `-` prefix and color classes.
  - [ ] `formatRelativeTime(date)` (e.g. "3 hours ago", "Yesterday").
- [ ] Implement `src/lib/inflation.ts`:
  - [ ] Price delta calculation ($Δ$ and $\%Δ$).
  - [ ] Rolling inflation index engine across category baskets.
  - [ ] Store price variance calculator to identify cheapest retailer.
  - [ ] Anomaly/Outlier detection algorithm ($>3\sigma$ standard deviation flagger).
- [ ] Implement `src/lib/utils.ts` (Tailwind class merging helper `cn()`).

---

## Phase 5: Mock Data & Seed Generation Engine
- [ ] Implement `src/lib/mock-data.ts`:
  - [ ] Seed realistic retail stores (Supermarkets, Tech Retailers, Pharmacies, Local Grocers).
  - [ ] Seed diverse multi-category products (Groceries, Electronics, Household, Beverages, Pharmacy, Services).
  - [ ] Generate longitudinal 1-year historical price data points for each product across multiple stores.
  - [ ] Seed sample OCR extractions with mock bounding boxes (receipts, shelf tags, promo pamphlets).
- [ ] Implement `src/lib/storage.ts`:
  - [ ] Client-side state persistence (Local storage for custom contributions, watchlists, karma, role preferences).

---

## Phase 6: Shared Atomic UI Primitives
- [ ] `src/components/ui/Button.tsx`: Primary, secondary, outline, ghost, and danger variants with loading states.
- [ ] `src/components/ui/Input.tsx`: Icon slot inputs with search, clear, and validation states.
- [ ] `src/components/ui/Badge.tsx`: Semantic status pills (Verified, OCR Confidence, Outlier, Category).
- [ ] `src/components/ui/Card.tsx`: Border-first cards with subtle tonal hover transitions.
- [ ] `src/components/ui/Modal.tsx`: Accessible dialog container with backdrop blur, focus trap, and Escape handler.
- [ ] `src/components/ui/Tabs.tsx`: Animated pill and underline tab controls.
- [ ] `src/components/ui/Tooltip.tsx`: Lightweight, accessible hover and focus tooltip.

---

## Phase 7: Data Visualization & Chart Telemetry Suite
- [ ] `src/components/product/PriceBadge.tsx`: Strict implementation of **The Price Direction Rule** with tabular numbers.
- [ ] `src/components/charts/Sparkline.tsx`: Compact 7-day/30-day SVG trend indicator for product cards.
- [ ] `src/components/charts/PriceHistoryChart.tsx`:
  - [ ] Responsive Recharts multi-store time-series chart.
  - [ ] Timeframe filters (`7D`, `1M`, `3M`, `6M`, `1Y`, `ALL`).
  - [ ] Interactive touch tooltip with date, store names, prices, and source tags.
  - [ ] Reference line indicating historical average or lowest price.
- [ ] `src/components/charts/InflationRadar.tsx`: Category-level inflation barometer chart.
- [ ] `src/components/charts/StoreComparisonChart.tsx`: Horizontal bar chart comparing current store price variance.

---

## Phase 8: Multimodal OCR & Vision Parsing Pipeline
- [ ] Implement `src/lib/openrouter.ts`:
  - [ ] OpenRouter multimodal client calling vision models (e.g. Gemini 2.5 Flash / GPT-4o-mini).
  - [ ] Structured prompt engineering requesting strict JSON schema with bounding box coordinates.
  - [ ] Offline fallback parser with deterministic bounding boxes for sample assets.
- [ ] Implement `src/app/api/ocr/parse/route.ts` API route handler.
- [ ] Implement OCR UI Components:
  - [ ] `src/components/ocr/PhotoUploader.tsx`: Drag-and-drop zone and mobile camera stream/capture button.
  - [ ] `src/components/ocr/BoundingBoxOverlay.tsx`: Interactive SVG/CSS coordinate boxes over uploaded images.
  - [ ] `src/components/ocr/ExtractedFieldEditor.tsx`: Real-time editable table of parsed items, prices, and confidence scores.
  - [ ] `src/components/ocr/PamphletViewer.tsx`: Multi-item flyer pan/zoom viewer with extracted deal callouts.

---

## Phase 9: Public Explorer & Product Discovery Surface
- [ ] `src/components/navigation/Header.tsx`:
  - [ ] Brand logo and search bar with live auto-complete.
  - [ ] Quick Role View Switcher (`Public` / `Contributor` / `Admin`).
  - [ ] Mobile navigation hamburger and quick action links.
- [ ] `src/app/page.tsx` (Explorer Home):
  - [ ] Macro Inflation & Price Trend Ticker (live scrolling / animated metrics).
  - [ ] Category Filter Pills (All, Groceries, Tech, Household, Pharmacy, Services).
  - [ ] Sort & Filter Toolbar (Biggest Price Drops, Recent Price Hikes, Popular, Rare Stock).
  - [ ] `src/components/product/ProductGrid.tsx` & `ProductCard.tsx` with live sparklines and price badges.
  - [ ] Quick store price comparison preview drawer.

---

## Phase 10: Deep Product Detail & Price Intelligence View
- [ ] `src/app/product/[id]/page.tsx`:
  - [ ] Product header: title, category badge, brand, unit, current lowest price vs store average.
  - [ ] Full-featured `PriceHistoryChart` with multi-store comparison and timeframe switcher.
  - [ ] Store Comparison Matrix (`src/components/product/StoreComparisonTable.tsx`):
    - [ ] Store name, branch, current price, difference from average, stock status, verified badge.
  - [ ] Historical Submission Provenance Timeline:
    - [ ] List of community contributions with source badge (*"Shelf Tag OCR"*, *"Flyer Scan"*), contributor karma, and proof thumbnail.
  - [ ] Watchlist toggle button with custom price target trigger.

---

## Phase 11: Contributor Studio & Ingestion Workflows
- [ ] `src/app/contribute/page.tsx` (Contributor Studio):
  - [ ] Multi-Modal Ingestion Tab Switcher:
    1. **Shelf Photo / Camera OCR:** Upload or snap photo of price tag -> AI extraction -> Bounding box review -> Save.
    2. **Promotional Pamphlet Parser:** Upload multi-item flyer -> Batch parse all deals -> Select & verify items -> Bulk submit.
    3. **Manual Price Log (CRUD):** Search product or create new -> Select store -> Input observed price & date -> Add photo note.
    4. **Web / E-Commerce Link:** Paste product URL -> Parse store price metadata.
  - [ ] Live Bounding Box sync: Clicking a field highlights its corresponding box on the image.
  - [ ] Contributor Karma & Stats Card: Badges earned, total verified submissions, community impact score.

---

## Phase 12: User Watchlist & Alert Center
- [ ] `src/app/watchlist/page.tsx`:
  - [ ] List of user-tracked products with current price, 30-day delta, and target price indicator.
  - [ ] Price Drop Alert Manager: Set alert thresholds (e.g. "Notify when price drops below $3.50").
  - [ ] Inflation & Price Spike Warning Feed: Highlights items in watchlist that experienced unexpected price hikes.
  - [ ] Quick-action export or shopping list generator with lowest-price store routing.

---

## Phase 13: Admin & Community Moderation Hub
- [ ] `src/app/admin/moderation/page.tsx`:
  - [ ] Moderation Queue: List of pending community submissions, OCR extractions with confidence <80%, and flagged outlier prices.
  - [ ] Diff Inspector: Side-by-side view of proof photo with highlighted bounding box vs. submitted values.
  - [ ] Action buttons: `Approve Price`, `Reject Price`, `Adjust Value`, `Flag User`.
- [ ] `src/app/admin/taxonomy/page.tsx`:
  - [ ] Store Directory Manager: Add/edit store chains, branches, and geolocation tags.
  - [ ] Category & Unit Taxonomy Editor: Manage categories, units of measure ($/kg, $/lb, $/unit), and price alert bounds.

---

## Phase 14: Responsive Optimization & Device Fluidity
- [ ] **Mobile Viewport (<640px):**
  - [ ] Persistent bottom navigation bar (`src/components/navigation/MobileBottomBar.tsx`): Explore, Watchlist, Contribute, Admin.
  - [ ] Floating Action Button (`QuickScanFAB.tsx`): Instant camera trigger on mobile.
  - [ ] Bottom-sheet drawers for filters, quick price logging, and product preview.
  - [ ] Verify touch targets are $\ge 44\text{px} \times 44\text{px}$.
- [ ] **Tablet Viewport (640px–1024px):**
  - [ ] Adaptive 2-column layout (item catalog list + synchronized price chart side drawer).
  - [ ] Collapsible navigation drawer and touch-friendly chart scrubbers.
- [ ] **Desktop Viewport (>1024px):**
  - [ ] 3-column layout: Left navigation sidebar, Central analytics matrix, Right inflation & store radar.
  - [ ] High-density tabular views and full keyboard shortcut navigation.

---

## Phase 15: Accessibility, Performance & Edge Cases
- [ ] Color Contrast Audit: Verify all text, badges, and chart lines meet WCAG AA ($\ge 4.5:1$).
- [ ] Keyboard Navigation: Verify full tab-stop order across modals, drawers, tabs, and form controls.
- [ ] Screen Reader Semantics: Add descriptive `aria-label`, `aria-expanded`, and `role` attributes.
- [ ] Empty & Loading States: Skeleton loaders for charts, product grids, and OCR processing spinners.
- [ ] Error Handling: Graceful API fallback when OpenRouter is unreachable or image upload fails.
- [ ] Offline Capability: Cache viewed products and enable offline price draft logging.

---

## Phase 16: Verification, End-to-End Testing & Polish
- [ ] Run full TypeScript compilation (`npx tsc --noEmit`) with zero errors.
- [ ] Run production Next.js build (`npm run build`) and test output.
- [ ] Conduct multi-device visual inspection (Mobile 375px, Tablet 768px, Desktop 1440px).
- [ ] Run mechanical Impeccable design detector (`node .../detect.mjs --json`).
- [ ] Run Impeccable Documenter (`/impeccable document`) to extract live tokens into `DESIGN.md` and `.impeccable/design.json`.
- [ ] Final user walkthrough and feature demonstration.
