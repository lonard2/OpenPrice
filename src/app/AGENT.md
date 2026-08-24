# App Router Agent Guide (`src/app/AGENT.md`)

This document guides the design, routing, state management, and layout patterns for the Next.js App Router layer in OpenPrice.

---

## 1. Route Map & Page Structure

```
src/app/
├── layout.tsx                    # Root layout (fonts, theme providers, responsive shell)
├── page.tsx                      # Primary explorer, search, trend ticker, & product matrix
├── globals.css                   # Tailwind directives & CSS custom properties
├── product/
│   └── [id]/
│       └── page.tsx              # Deep product detail, multi-period price charts, store comparison
├── contribute/
│   └── page.tsx                  # Contributor Studio (Photo/Shelf Tag OCR, Pamphlet batch, Manual CRUD)
├── watchlist/
│   └── page.tsx                  # Logged-in watchlist, price drop alerts, personal contribution karma
├── admin/
│   ├── moderation/
│   │   └── page.tsx              # Submission review queue, outlier price detection, conflict resolver
│   └── taxonomy/
│       └── page.tsx              # Store directory, item categories, unit definitions
└── api/
    ├── ocr/
    │   └── parse/route.ts        # OpenRouter multimodal vision OCR extraction endpoint
    ├── prices/
    │   └── route.ts              # Price submission CRUD & query endpoint
    └── products/
        └── route.ts              # Product search, filter, and inflation stats endpoint
```

---

## 2. Role-Based View Switcher & Context

OpenPrice supports three operational perspectives that can be switched dynamically or accessed via dedicated routes:

1. **Public View (`public`):**
   - Read-only search, category exploration, historical charts, deal badges, and store comparisons.
   - Ideal for everyday consumers walking store aisles or comparing prices before shopping.
2. **Contributor View (`contributor`):**
   - Unlocks the **Multimodal Submission Studio** (Camera/Shelf photo OCR, Pamphlet parser, Manual price log).
   - Manages personal watchlists, custom price drop notifications, and contribution karma score.
3. **Admin / Curator View (`admin`):**
   - Moderation queue for community submissions and OCR parsed outputs.
   - Outlier price detection (identifying abnormal price spikes or erroneous OCR values).
   - Category, store, and unit taxonomy configuration.

> [!TIP]
> Use a shared `RoleContext` / `useRoleView()` hook to allow users to preview and switch between Public, Contributor, and Admin interfaces with a single click in the header/sidebar navigation.

---

## 3. Server vs. Client Component Boundaries

- **Server Components (RSC):**
  - Page wrappers, initial static catalog loading, metadata generation (`generateMetadata`), and static SEO headers.
- **Client Components (`"use client"`):**
  - Interactive Recharts components (`PriceHistoryChart`, `InflationRadarChart`).
  - Multimodal upload zones (`PhotoOcrDropzone`, `PamphletBatchParser`, `BoundingBoxViewer`).
  - Search, filter pill bars, and tabular sort controls.
  - Role switcher and bottom sheet navigation drawers.

---

## 4. Responsive Layout Architecture

- **Root Layout (`src/app/layout.tsx`):**
  - Top header with global search bar, brand identity, and role switcher.
  - Desktop sidebar (`hidden lg:flex`) with primary route links and real-time inflation ticker.
  - Mobile bottom navigation bar (`flex lg:hidden`) with quick-action floating camera button for instant price logging.
  - Main container capped at `max-w-7xl` with responsive horizontal padding (`px-4 sm:px-6 lg:px-8`).

---

## 5. SEO & Structured Data

- Every product page (`/product/[id]`) must render structured JSON-LD `Product` schema with `offers` containing historical low, high, and current average price points.
- Include dynamic OpenGraph preview cards featuring product title, latest tracked price, and trend badge.
