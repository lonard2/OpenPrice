# Library & Analytics Agent Guide (`src/lib/AGENT.md`)

This guide governs the analytics algorithms, external multimodal AI clients, data formatters, and storage layers in `src/lib/`.

---

## 1. Directory Structure

```
src/lib/
├── openrouter.ts                 # Multimodal AI vision client for OpenRouter API
├── ocr-parser.ts                 # Image parsing, bounding-box normalization, schema extraction
├── inflation.ts                  # Mathematical inflation index & price volatility engine
├── formatters.ts                 # Tabular currency, percentage delta, and timestamp formatters
├── mock-data.ts                  # Comprehensive multi-store, longitudinal price seed dataset
├── storage.ts                    # LocalStorage / IndexedDB persistence layer for client state
└── utils.ts                      # ClassName merger (clsx/tailwind-merge) and common helpers
```

---

## 2. Analytics & Math Engine (`inflation.ts`)

The inflation engine performs real-time calculations on longitudinal price histories:

1. **Item Price Delta ($Δ$ and $\%Δ$):**
   $$\Delta P = P_{\text{current}} - P_{\text{previous}}$$
   $$\% \Delta P = \left( \frac{P_{\text{current}} - P_{\text{previous}}}{P_{\text{previous}}} \right) \times 100$$
2. **Rolling Inflation Basket Index:**
   Aggregates price movements across an essential basket of goods (e.g., groceries, dairy, staples, fuel, electronics) over 30-day, 90-day, and 1-year windows relative to a base index of 100.0.
3. **Store Price Variance & Cheapest Store Discovery:**
   Calculates price variance across identical or substitute products across multiple retail chains (e.g., Supermarket A vs. Supermarket B vs. Online Retailer).
4. **Outlier Anomaly Detection:**
   Flags any submitted price that deviates by more than $3 \times \sigma$ (standard deviation) from the 30-day moving average as a potential outlier requiring admin review.

---

## 3. Multimodal OCR & Vision Pipeline (`openrouter.ts` & `ocr-parser.ts`)

OpenPrice leverages vision-capable models via OpenRouter (`process.env.OPENROUTER_API_KEY`) to extract structured price data from photos:

### Extraction Schema
The parser prompts the vision model to return strict JSON matching this structure:
```typescript
interface RawOcrExtractionResponse {
  storeName?: string;
  storeBranch?: string;
  receiptOrDate?: string;
  items: Array<{
    name: string;
    brand?: string;
    price: number;
    originalPrice?: number;
    unit?: string;
    confidence: number; // 0.0 - 1.0
    boundingBox?: {
      xMin: number; // Percentage 0 - 100
      yMin: number;
      xMax: number;
      yMax: number;
    };
  }>;
}
```

### Fallback & Offline Mode
When `OPENROUTER_API_KEY` is unavailable or the network request fails, the parser must seamlessly fall back to realistic local heuristic OCR parsing with pre-calculated bounding boxes for demo assets.

---

## 4. Invariant Number & Currency Formatting (`formatters.ts`)

All monetary and numeric displays must use centralized formatters to guarantee consistent tabular layout:

```typescript
export function formatCurrency(amount: number, currency: string = 'USD'): string;
export function formatDeltaPercent(delta: number): string; // e.g. "+4.2%" or "-12.5%"
export function formatRelativeTime(date: Date | string): string; // e.g. "2 hours ago"
```
