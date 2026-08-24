# Original User Request

## Initial Request — 2026-08-24T12:31:04+07:00

OpenPrice is a lively, modern, crowdsourced and multi-source price tracking and intelligence web application for everyday goods and services. It aggregates data from physical store observations (shelf tag photos, receipts, promotional flyers) and online listings into an open, community-verified historical record with interactive price charts, store comparisons, and inflation analytics across mobile, tablet, and desktop viewports.

Working directory: /Users/lonard/Desktop/OpenPrice
Integrity mode: development

## Team Architecture & Role Division
Refer to TEAM.md for the division of responsibilities across Architecture & Foundation, Data & Analytics, Multimodal AI/OCR, Frontend & Telemetry UI, Multi-Role Experience, and QA/Verification.

## Requirements

### R1. Architecture & Design System Foundation
Scaffold Next.js App Router (React 19, TypeScript, Tailwind CSS) configured with tokens and principles from DESIGN.md (Community Exchange aesthetic, Subtle Ambient Lift, strict price direction semantics, tabular numerals, 44x44px touch targets).

### R2. Data Layer, Inflation Math & Seed Engine
Implement TypeScript domain models, mathematical inflation and volatility calculators, outlier anomaly detection (>3σ), tabular formatters, client storage persistence, and rich multi-store longitudinal price seed datasets.

### R3. Multimodal OCR & Vision Parsing Pipeline
Implement OpenRouter vision API integration and deterministic fallback heuristics capable of extracting prices, item names, and store details from photos, receipts, and promotional flyers with live interactive bounding-box overlays and editable field synchronization.

### R4. Data Visualization & Telemetry Components
Build interactive Recharts telemetry components (PriceHistoryChart with multi-store overlays, timeframe toggles 7D/1M/3M/6M/1Y/ALL, touch scrubber, Sparklines, and InflationRadar) with fixed-width tabular numeral formatting.

### R5. Multi-Role Perspectives & Responsive Workflows
Implement three interconnected operational perspectives:
- Public Shopper: Product search, category filters, price matrices, deep product details, and store comparisons.
- Logged-in Contributor: Ingestion studio (shelf photo OCR, flyer batch parser, manual CRUD), personal watchlist with price drop alerts, and karma points.
- Admin / Curator: Community moderation queue, side-by-side photo diff inspector, and category/store taxonomy management.
- Responsive adaptation: Mobile (<640px bottom navigation & quick-scan FAB), tablet (adaptive split-views), and desktop (dense 3-column dashboard).

### R6. Code Hygiene, License Attribution & Multi-Layer Testing
Maintain active codebase hygiene without placeholder stubs (no // TODO, no empty handlers, no emojis in production code). Provide attribution for any third-party code in README.md / CREDITS.md. Deliver comprehensive test coverage across unit math, component UI, and API integration layers.

## Acceptance Criteria

### Functionality & Multi-Role Workflows
- [ ] Public view displays searchable product catalog with live sparklines, price badges, category filters, and store price matrix.
- [ ] Product detail page renders interactive historical price charts with multi-store comparison and timeframe toggles (7D, 1M, 3M, 6M, 1Y, ALL).
- [ ] Contributor studio supports shelf photo and flyer upload with interactive bounding boxes and real-time field editing.
- [ ] Admin moderation queue displays pending community submissions and flagged outlier prices with approval/rejection actions.
- [ ] User role switching between Public, Contributor, and Admin works seamlessly across all pages.

### Code Quality, Design & Testing
- [ ] Zero TypeScript errors (`npx tsc --noEmit`) and clean production build (`npm run build`).
- [ ] Comprehensive unit and integration test suite passing with objective assertions.
- [ ] No placeholder stubs (`// TODO` or empty dummy handlers) and no decorative emojis in production code.
- [ ] Responsive navigation and touch targets >= 44px x 44px verified across mobile, tablet, and desktop viewports.
- [ ] External references and licenses properly attributed in README.md / CREDITS.md.
