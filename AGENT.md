# OpenPrice Developer & Agent Guide (`AGENT.md`)

Welcome to the **OpenPrice** codebase. This document serves as the master guide for all AI agents and engineers contributing to the project. It outlines our architectural philosophy, design commitments, directory boundaries, and development workflows.

---

## 1. Project Mission & Identity

**OpenPrice** is an engaging, lively, modern, crowdsourced and multi-source price tracking and intelligence web application built for everyday goods and services. It aggregates data from physical store observations (shelf tag photos, receipts, promotional pamphlets) and online e-commerce listings into an open, community-verified historical record.

### Key Value Pillars
1. **Radical Price Transparency:** Complete historical timelines, store-by-store price matrices, inflation indices, and trend signals (price hikes, genuine discounts, stock rarity).
2. **Low-Friction Multimodal Ingestion:** Instant extraction of prices, item names, and store details from camera photos and pamphlets using AI vision/OCR with live editable bounding boxes.
3. **Fluid Multi-Device Experience:** Built from the ground up for mobile (fast aisle logging, sticky bottom navigation, touch camera trigger), tablet (adaptive split-views), and desktop (dense analytical dashboards).
4. **Multi-Role Perspectives:** Seamless role switching between **Public Shopper**, **Logged-in Contributor**, and **Admin / Curator**.

---

## 2. Core Tech Stack & System Architecture

| Layer | Technology | Key Purpose |
| :--- | :--- | :--- |
| **Framework** | **Next.js (App Router)** | Full-stack architecture, React Server Components (RSC), Client Components, and route handlers. |
| **Language** | **TypeScript** | Strict type safety, explicit domain schemas, zero unvalidated `any`. |
| **Styling** | **Tailwind CSS** | Design token implementation, fluid responsive breakpoints, micro-animations. |
| **Icons** | **Lucide React** | Consistent, legible icon vocabulary. |
| **Visualizations** | **Recharts & Custom SVG** | Interactive time-series charts, sparklines, inflation radar, and price distribution curves. |
| **AI / Multimodal** | **OpenRouter API (Vision Models)** | Multi-modal OCR extraction for shelf tags, receipts, and multi-item promo pamphlets. |

---

## 3. Strict Design Invariants (`DESIGN.md`)

All generated components and pages must strictly adhere to the rules established in [`DESIGN.md`](./DESIGN.md):

- 🟢 **The Price Direction Rule:** Colors on price tags and deltas are strictly semantic:
  - **Emerald / Mint (`#10B981` / `text-emerald-600` / `bg-emerald-50`):** Price drops, savings, and best available deals.
  - **Coral Crimson (`#F43F5E` / `text-rose-600` / `bg-rose-50`):** Price hikes, inflation spikes, out-of-stock items, and outlier alerts.
  - **Muted Slate (`#64748B` / `text-slate-500`):** Stable / unchanged prices.
  - *Never use red for a price drop or green for a price hike.*
- 🔢 **The Tabular Numerals Rule:** All currency amounts, percentages, and timestamps must use fixed-width tabular figures (`font-mono` or `tabular-nums`) to prevent layout jitter during data updates.
- 📐 **The Border-First Depth Rule:** Depth is defined by crisp 1px borders (`border-slate-200`) and subtle tonal surfaces (`bg-slate-50`, `bg-white`), never heavy muddy shadows.
- 📱 **Mobile Touch Rule:** All interactive touch targets (buttons, pills, tabs) must be at least `44x44px` on mobile viewports.
- 🏷️ **Multimodal Provenance:** Every price entry must display its origin (e.g., *"Photo OCR (98%)"*, *"Pamphlet Scan"*, *"Manual Submission"*, *"Online Crawler"*).

---

## 4. Directory Structure & Subdirectory Guidelines

Each core directory contains its own scoped `AGENT.md` file governing development in that folder:

```
OpenPrice/
├── AGENT.md                      # Master agent governance (this file)
├── CHECKLIST.md                  # Granular step-by-step roadmap & verification
├── PRODUCT.md                    # Durable product truth & user definitions
├── DESIGN.md                     # Visual design system & token definitions
├── .env                          # Environment variables (OpenRouter API key)
├── src/
│   ├── app/                      # Next.js App Router routes & layouts
│   │   └── AGENT.md              # Route design, RSC boundaries, role views
│   ├── components/               # Reusable UI, charts, and modal components
│   │   └── AGENT.md              # Component architecture & design tokens
│   ├── lib/                      # Analytics engines, OCR client, utilities
│   │   └── AGENT.md              # Inflation algorithms, OCR parsing, helpers
│   └── types/                    # Domain models and TypeScript contracts
│       └── AGENT.md              # Schema definitions and data contracts
```

---

## 5. Coding & Workflow Standards for Agents

1. **Do Not Hallucinate Data Structures:** Always reference [`src/types/`](./src/types/) when manipulating products, stores, price logs, or OCR bounding boxes.
2. **Graceful Fallbacks for External APIs:** The OCR and vision parsing services must work seamlessly with the live OpenRouter API, while providing robust mock fallbacks when offline or during automated testing.
3. **Accessible Markup:**
   - Always include `aria-label` on icon-only buttons.
   - Use semantic headings (`h1` -> `h2` -> `h3`) in proper order.
   - Ensure color contrast ratios meet or exceed WCAG 2.1 AA (`>= 4.5:1` for normal text).
4. **Performance & Responsiveness:**
   - Optimize bundle size by importing specific icon names from `lucide-react`.
   - Implement responsive design at every component level using Tailwind (`sm:`, `md:`, `lg:`, `xl:`).
5. **Verify Before Completion:** Always ensure TypeScript compiles with zero errors (`npx tsc --noEmit`) and run lint/build checks before concluding tasks.
