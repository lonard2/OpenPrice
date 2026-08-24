# OpenPrice

OpenPrice is a crowdsourced and multi-source price tracking web application for everyday goods and services. It aggregates data from physical store observations (shelf tag photos, receipts, promotional flyers) and online e-commerce listings into an open, community-verified historical record with interactive price charts, store comparisons, and inflation tracking.

---

## Key Features

- **Multi-Source Price Ingestion:** Log prices manually, parse promotional flyers and receipts with multimodal vision OCR, or track online product listings.
- **Interactive Price History Charts:** Track multi-store historical timelines across customizable timeframes (7D, 1M, 3M, 6M, 1Y, ALL) with tabular numeral alignment.
- **Store-by-Store Comparison Matrix:** Compare current prices, stock availability, and savings across competing retailers.
- **Macro Inflation & Volatility Radar:** Real-time metrics highlighting category-level price movements, inflation spikes, and genuine discounts.
- **Multi-Role Perspectives:** Seamlessly switch between Public Shopper, Logged-in Contributor, and Admin/Curator views.
- **Responsive Design:** Optimized for mobile (aisle logging, sticky camera trigger, bottom navigation), tablet (adaptive split-views), and desktop (dense analytical dashboards).

---

## Tech Stack

- **Framework:** Next.js (App Router, React 19)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (custom tokens defined in `DESIGN.md`)
- **Icons:** Lucide React
- **Charts:** Recharts
- **Multimodal AI:** OpenRouter Vision API (with deterministic fallback heuristics)

---

## Project Structure

```
OpenPrice/
├── src/
│   ├── app/                # Next.js App Router routes, layouts, and API endpoints
│   ├── components/         # Reusable UI primitives, charts, and OCR visualizers
│   ├── lib/                # Inflation algorithms, OCR parsing pipeline, formatters, and seed data
│   └── types/              # Strict TypeScript domain interfaces and schemas
├── AGENT.md                # Master agent and developer governance guidelines
├── CHECKLIST.md            # 16-phase development roadmap and verification status
├── PRODUCT.md              # Product requirements, user roles, and operating context
└── DESIGN.md               # Visual design system specification and tokens
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- npm or pnpm

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/lonard2/OpenPrice.git
   cd OpenPrice
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env.local`:
   ```bash
   OPENROUTER_API_KEY="your-openrouter-api-key"
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## Testing & Quality Assurance

- **Type Check:** `npm run type-check` (or `npx tsc --noEmit`)
- **Linting:** `npm run lint`
- **Unit & Integration Tests:** `npm test`
- **Production Build:** `npm run build`

---

## License

This project is licensed under the MIT License. See `LICENSE` for details.
