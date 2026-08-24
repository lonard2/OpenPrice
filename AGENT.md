# OpenPrice Developer & Agent Guide (`AGENT.md`)

This document serves as the master guide for all engineers and AI agents contributing to **OpenPrice**. It outlines our architectural philosophy, strict coding standards, design invariants, directory boundaries, and development workflows.

---

## 1. Project Mission & Identity

**OpenPrice** is an engaging, lively, modern, crowdsourced and multi-source price tracking and intelligence web application built for everyday goods and services. It aggregates data from physical store observations (shelf tag photos, receipts, promotional pamphlets) and online e-commerce listings into an open, community-verified historical record.

### Key Value Pillars
1. **Radical Price Transparency:** Complete historical timelines, store-by-store price matrices, inflation indices, and trend signals (price hikes, genuine discounts, stock rarity).
2. **Low-Friction Multimodal Ingestion:** Instant extraction of prices, item names, and store details from camera photos and pamphlets using AI vision/OCR with live editable bounding boxes.
3. **Fluid Multi-Device Experience:** Built from the ground up for mobile (fast aisle logging, sticky bottom navigation, touch camera trigger), tablet (adaptive split-views), and desktop (dense analytical dashboards).
4. **Multi-Role Perspectives:** Seamless role switching between **Public Shopper**, **Logged-in Contributor**, and **Admin / Curator**.

---

## 2. Mandatory Engineering & Codebase Standards

All contributors and AI agents must strictly adhere to the following core engineering standards:

1. **Active Codebase Hygiene (No Placeholder Stubs):**
   - Every file, component, function, and test must be fully implemented and functional.
   - Never commit `// TODO`, empty handler stubs, mock placeholder buttons that do nothing, or pseudo-implementations.
2. **No Emojis or Artificial AI Quirks in Production Code:**
   - Production UI copy, component labels, log messages, and code comments must be natural, professional, and clear.
   - Avoid decorative emojis in production source code, UI titles, buttons, and system logs. Use clean, accessible SVGs (Lucide React icons) instead.
   - Avoid artificial AI writing patterns, corporate buzzword filler, and hollow template clichés.
3. **Comprehensive Multi-Layer Testing:**
   - Maintain unit tests for calculation engines (inflation metrics, volatility math, currency formatters).
   - Maintain component and UI tests for core widgets (price charts, bounding-box overlays, badge directions).
   - Maintain integration tests for API routes, OCR extraction pipelines, and state persistence.
4. **Concrete Evidence-First Diagnosis:**
   - When encountering bugs, failures, or edge cases, always diagnose the root cause with tangible evidence (logs, stack traces, test assertions) before modifying code.
   - Apply fixes surgically at the narrowest responsible layer without introducing collateral regressions.
5. **Latest Stable Dependencies:**
   - Use the latest stable versions of core packages (Next.js App Router, React 19, TypeScript, Tailwind CSS, Recharts, Lucide React).
   - Regularly verify dependency health and audit for deprecations.
6. **Lean Engineering (No Overengineering):**
   - Prioritize simple, robust, and readable implementations over premature abstractions or unnecessary complexity.
   - Build only what is required by confirmed product requirements.
7. **Concise & Informative Documentation:**
   - Maintain an accurate, up-to-date, and concise `README.md` reflecting real project architecture, setup steps, and operational commands.
8. **Leverage Specialized Agent Skills:**
   - Use specialized CLI skills (Context7 for library documentation, systematic debugging, safe refactoring, and visual design auditing) to maintain high craft standards.

---

## 3. Strict Design Invariants (`DESIGN.md`)

All generated components and pages must strictly adhere to the design rules in [`DESIGN.md`](./DESIGN.md):

- **The Price Direction Rule:** Colors on price tags and deltas are strictly semantic:
  - **Emerald Mint (`#10B981` / `text-emerald-600` / `bg-emerald-50`):** Price drops, savings, and best available deals.
  - **Coral Sunset (`#F43F5E` / `text-rose-600` / `bg-rose-50`):** Price hikes, inflation spikes, out-of-stock items, and outlier alerts.
  - **Muted Slate (`#64748B` / `text-slate-500`):** Stable / unchanged prices.
  - *Never use red for a price drop or green for a price hike.*
- **The Tabular Numerals Rule:** All currency amounts, percentages, and timestamps must use fixed-width tabular figures (`font-mono` or `tabular-nums`) to prevent layout jitter during data updates.
- **The Subtle Ambient Lift Rule:** Clean 1px structural hairline borders (`border-slate-200`) paired with subtle diffused shadows and translucent glassmorphic navigation headers (`backdrop-blur-md bg-white/80`).
- **Mobile Touch Rule:** All interactive touch targets (buttons, pills, tabs) must be at least `44x44px` on mobile viewports.
- **Multimodal Provenance:** Every price entry must display its origin (e.g., *"Photo OCR (98%)"*, *"Pamphlet Scan"*, *"Manual Submission"*, *"Online Crawler"*) with clean verified ribbons for confirmed submissions.

---

## 4. Directory Hierarchy Guide

```
OpenPrice/
├── AGENT.md                      # Master agent governance (this file)
├── CHECKLIST.md                  # Granular 16-phase roadmap & verification gates
├── PRODUCT.md                    # Durable product truth & user definitions
├── DESIGN.md                     # Visual design system & token definitions
├── README.md                     # Concise, human-oriented project overview & setup
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
