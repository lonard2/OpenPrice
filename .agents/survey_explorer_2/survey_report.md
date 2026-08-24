# OpenPrice Data, Analytics Math, Seed Engine & Multimodal AI Survey Report

**Author:** survey_explorer_2 (Data, Analytics & Multimodal AI Explorer)  
**Date:** 2026-08-24  
**Target Subsystems:** `src/types/*`, `src/lib/*`, `src/app/api/ocr/*`, `src/components/ocr/*`

---

## Executive Summary

This survey report provides the architectural blueprint, formal mathematical specifications, TypeScript domain contracts, seed data models, client persistence strategies, and multimodal vision OCR pipeline designs for the **OpenPrice** crowdsourced price tracking platform.

The system is designed around strict economic invariants (e.g. semantic price direction colors, tabular numeral alignment), statistical rigor (rolling Laspeyres basket inflation, store price variance, $>3\sigma$ Z-score anomaly outlier detection), and high-fidelity multimodal vision ingestion (interactive SVG bounding box overlays synchronized with editable tabular records).

---

## 1. Complete Domain Models & TypeScript Contracts

All types will reside in `src/types/` and be exported via a centralized barrel `src/types/index.ts`.

### 1.1 Product & Pricing Types (`src/types/product.ts`)

```typescript
export type ProductCategory = 
  | 'groceries' 
  | 'electronics' 
  | 'household' 
  | 'pharmacy' 
  | 'apparel' 
  | 'beverages' 
  | 'services';

export interface CategoryMetadata {
  id: ProductCategory;
  displayName: string;
  description: string;
  iconName: string; // Lucide icon name, e.g. 'ShoppingBasket', 'Smartphone', 'Home'
  inflationBasketWeight: number; // Sum of all weights = 1.0
  colorAccent: string;
}

export type PriceTrendStatus = 
  | 'price_drop' 
  | 'price_hike' 
  | 'stable' 
  | 'rare_stock' 
  | 'demand_surge';

export type PriceSourceType = 
  | 'photo_shelf' 
  | 'promo_pamphlet' 
  | 'receipt' 
  | 'web_crawler' 
  | 'manual';

export interface PricePoint {
  id: string;
  productId: string;
  storeId: string;
  storeName: string;
  price: number;
  originalPrice?: number; // Pre-discount struck price if on promotion
  currency: string;       // e.g. 'USD'
  unit: string;           // e.g. 'per lb', '1 gal', '12 oz', 'each', 'box'
  timestamp: string;      // ISO 8601 string: "2026-08-15T10:30:00.000Z"
  sourceType: PriceSourceType;
  confidenceScore?: number; // 0 - 100
  proofImageUrl?: string;
  contributorId?: string;
  contributorName?: string;
  isVerified: boolean;
  isOutlier?: boolean;
  outlierZScore?: number;
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  unit: string;
  description: string;
  imageUrl: string;
  currentLowestPrice: number;
  currentHighestPrice: number;
  averagePrice: number;
  previousPrice: number;
  trendStatus: PriceTrendStatus;
  priceDeltaPercent: number; // e.g. -12.5 or +4.2
  priceDeltaAmount: number;  // e.g. -0.50 or +0.25
  trackedStoresCount: number;
  totalSubmissionsCount: number;
  historicalPrices: PricePoint[];
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  id: string;
  name: string;
  chain?: string;
  branchName: string;
  type: 'physical' | 'online' | 'hybrid';
  city?: string;
  state?: string;
  address?: string;
  logoUrl?: string;
  color: string; // Unique hex color for Recharts line identification
}
```

### 1.2 Multimodal OCR & Vision Types (`src/types/ocr.ts`)

```typescript
export interface BoundingBox {
  xMin: number; // Percentage: 0.0 to 100.0
  yMin: number; // Percentage: 0.0 to 100.0
  xMax: number; // Percentage: 0.0 to 100.0
  yMax: number; // Percentage: 0.0 to 100.0
  label?: string;
  confidence?: number; // 0.0 to 1.0
}

export interface ExtractedPriceItem {
  tempId: string;
  name: string;
  brand?: string;
  category?: ProductCategory;
  price: number;
  originalPrice?: number;
  unit?: string;
  confidence: number; // 0.0 to 1.0
  boundingBox?: BoundingBox;
  storeName?: string;
  notes?: string;
  selected: boolean;
  matchedProductId?: string; // Auto-matched catalog product ID
}

export interface OcrParseResult {
  id: string;
  sourceImageUrl: string;
  imageWidth?: number;
  imageHeight?: number;
  detectedStoreName?: string;
  detectedDate?: string;
  sourceType: 'photo_shelf' | 'promo_pamphlet' | 'receipt';
  extractedItems: ExtractedPriceItem[];
  rawText?: string;
  processingTimeMs: number;
  modelUsed?: string;
}
```

### 1.3 Analytics & Mathematical Types (`src/types/analytics.ts`)

```typescript
export type TimeframeFilter = '7D' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

export interface InflationBasketCategory {
  category: ProductCategory;
  weight: number;              // 0.0 to 1.0 (Sum = 1.0)
  basePriceIndex: number;      // 100.0 base
  currentPriceIndex: number;   // e.g. 106.4
  categoryInflationRate: number; // e.g. +6.4%
  itemCount: number;
  representativeItems: Array<{
    name: string;
    basePrice: number;
    currentPrice: number;
    deltaPercent: number;
  }>;
}

export interface InflationBasketReport {
  period: string; // e.g. "Last 12 Months", "Last 30 Days"
  baseDate: string;
  currentDate: string;
  compositeInflationIndex: number; // e.g. 104.85
  compositeInflationRate: number;  // e.g. +4.85%
  categories: InflationBasketCategory[];
}

export interface StorePriceComparison {
  storeId: string;
  storeName: string;
  chain?: string;
  storeType: 'physical' | 'online' | 'hybrid';
  price: number;
  originalPrice?: number;
  unit: string;
  diffFromLowestAmount: number;
  diffFromLowestPercent: number;
  diffFromAvgAmount: number;
  diffFromAvgPercent: number;
  isCheapest: boolean;
  lastUpdated: string;
  inStock: boolean;
  proofImageUrl?: string;
  sourceType: PriceSourceType;
  isVerified: boolean;
}

export interface PriceOutlierReport {
  pricePointId: string;
  productId: string;
  productName: string;
  storeName: string;
  submittedPrice: number;
  historicalMean: number;
  historicalStdDev: number;
  zScore: number;
  thresholdSigma: number; // default 3.0
  isOutlier: boolean;
  flaggedAt: string;
  reason: string;
}
```

### 1.4 User, Moderation & Karma Types (`src/types/user.ts`)

```typescript
export type UserRole = 'public' | 'contributor' | 'admin';

export interface KarmaBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface ContributionKarma {
  totalPoints: number;
  tier: 'Novice Scout' | 'Eagle Eye' | 'Price Hunter' | 'Master Curator' | 'Grand Arbiter';
  verifiedSubmissions: number;
  pendingSubmissions: number;
  rejectedSubmissions: number;
  badges: KarmaBadge[];
  streakDays: number;
  weeklyGoal: { target: number; completed: number };
}

export interface WatchlistItem {
  id: string;
  productId: string;
  productName: string;
  category: ProductCategory;
  initialPrice: number;
  currentPrice: number;
  lowestTrackedPrice: number;
  targetPrice?: number;
  notifyOnPriceDrop: boolean;
  notifyOnInflationSpike: boolean;
  addedAt: string;
}

export interface ModerationItem {
  id: string;
  pricePoint: PricePoint;
  product: Product;
  flagReason: 'outlier_variance' | 'ocr_low_confidence' | 'user_reported' | 'duplicate';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewerNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}
```

---

## 2. Mathematical Calculations & Analytics Algorithms (`src/lib/inflation.ts`)

### 2.1 Price Delta & Trend Status

$$\Delta P = P_{\text{current}} - P_{\text{previous}}$$

$$\% \Delta P = \begin{cases} \left( \frac{P_{\text{current}} - P_{\text{previous}}}{P_{\text{previous}}} \right) \times 100 & \text{if } P_{\text{previous}} > 0 \\ 0 & \text{otherwise} \end{cases}$$

**Trend Classification Rule:**
- If $\% \Delta P \le -1.0\%$: `trendStatus = 'price_drop'` (Emerald Mint `#10B981`)
- If $\% \Delta P \ge +1.0\%$: `trendStatus = 'price_hike'` (Coral Sunset `#F43F5E`)
- If $-1.0\% < \% \Delta P < +1.0\%$: `trendStatus = 'stable'` (Muted Slate `#64748B`)
- If stock availability ratio across stores is $< 25\%$: `trendStatus = 'rare_stock'`

### 2.2 Rolling Category Inflation Index (Laspeyres Price Index Model)

Let $K$ be the set of product categories. Each category $k$ has fixed weight $w_k$ such that $\sum_{k=1}^K w_k = 1.0$.

Standard Weight Distribution:
- **Groceries:** $w = 0.35$
- **Beverages:** $w = 0.15$
- **Household:** $w = 0.15$
- **Pharmacy:** $w = 0.10$
- **Electronics:** $w = 0.10$
- **Apparel:** $w = 0.08$
- **Services:** $w = 0.07$

For category $k$ containing items $i \in C_k$, let $P_{i, 0}$ be the base period price and $P_{i, t}$ be the current period price:

$$I_{k, t} = 100.0 \times \frac{\frac{1}{|C_k|} \sum_{i \in C_k} P_{i, t}}{\frac{1}{|C_k|} \sum_{i \in C_k} P_{i, 0}}$$

The Composite Community Inflation Index is:

$$I_{\text{composite}, t} = \sum_{k=1}^K w_k \cdot I_{k, t}$$

The aggregate inflation rate is:

$$\pi_t = \left( \frac{I_{\text{composite}, t} - 100.0}{100.0} \right) \times 100\%$$

### 2.3 Store Price Variance & Market Spread

For a product $p$ observed across $M$ stores at prices $\{P_1, P_2, \dots, P_M\}$:

- **Lowest Price:** $P_{\min} = \min_{j} P_j$
- **Highest Price:** $P_{\max} = \max_{j} P_j$
- **Market Mean Price:** $\bar{P} = \frac{1}{M} \sum_{j=1}^M P_j$
- **Sample Variance:** $\sigma^2 = \frac{1}{M-1} \sum_{j=1}^M (P_j - \bar{P})^2$
- **Sample Standard Deviation:** $\sigma = \sqrt{\sigma^2}$
- **Store Premium / Saving vs. Lowest:**
  $$\Delta \%_{\text{lowest}, j} = \left( \frac{P_j - P_{\min}}{P_{\min}} \right) \times 100\%$$

### 2.4 Anomaly & Outlier Detection Algorithm ($>3\sigma$ Z-Score)

When a new price point $x_{\text{new}}$ is submitted for product $p$:

1. Gather verified historical price points $X = \{x_1, x_2, \dots, x_N\}$ for the product (over past 30–90 days, $N \ge 3$).
2. Compute sample mean $\mu = \frac{1}{N} \sum_{i=1}^N x_i$.
3. Compute Bessel-corrected sample standard deviation:
   $$s = \sqrt{\frac{1}{N-1} \sum_{i=1}^N (x_i - \mu)^2}$$
4. Calculate Z-Score:
   $$z = \begin{cases} \frac{x_{\text{new}} - \mu}{s} & \text{if } s > 0 \\ 0 & \text{if } s = 0 \end{cases}$$
5. Outlier Decision Logic:
   - If $|z| > 3.0 \implies \text{flag as } >3\sigma \text{ statistical outlier}$.
   - If $s = 0$ and $|x_{\text{new}} - \mu| / \mu > 0.50 \implies \text{flag as sudden 50\% swing}$.
   - If $x_{\text{new}} \le 0 \lor x_{\text{new}} > 15 \times \mu \implies \text{flag as invalid price anomaly}$.
6. Moderation Handling:
   - Flagged price is marked `isOutlier: true`, `isVerified: false`.
   - The price is automatically placed in `ModerationItem` queue.
   - It is excluded from public product average and sparkline calculations until approved by an admin.

---

## 3. Numeric & Tabular Formatters (`src/lib/formatters.ts`)

All formatters adhere to the **Tabular Numerals Rule** (`font-variant-numeric: tabular-nums`).

```typescript
/**
 * Formats a currency amount with tabular spacing and invariant 2-decimal precision.
 */
export function formatCurrency(amount: number, currency: string = 'USD', showSign: boolean = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '$0.00';
  }
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  if (amount < 0) return `-${formatted}`;
  if (showSign && amount > 0) return `+${formatted}`;
  return formatted;
}

/**
 * Formats a percentage delta with explicit '+' or '-' sign.
 */
export function formatDeltaPercent(delta: number): string {
  if (isNaN(delta) || delta === null || delta === undefined) {
    return '0.0%';
  }
  const sign = delta > 0 ? '+' : delta < 0 ? '' : '';
  return `${sign}${delta.toFixed(1)}%`;
}

/**
 * Returns Tailwind classes strictly enforcing The Price Direction Rule.
 */
export function getDeltaStyle(delta: number) {
  if (delta < -0.01) {
    return {
      text: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      badgeClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      icon: 'down' as const,
      label: 'Price Drop'
    };
  }
  if (delta > 0.01) {
    return {
      text: 'text-rose-700',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      badgeClass: 'text-rose-700 bg-rose-50 border-rose-200',
      icon: 'up' as const,
      label: 'Price Hike'
    };
  }
  return {
    text: 'text-slate-600',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
    badgeClass: 'text-slate-700 bg-slate-100 border-slate-200',
    icon: 'flat' as const,
    label: 'Unchanged'
  };
}

/**
 * Formats relative time strings for community submission cards.
 */
export function formatRelativeTime(dateInput: string | Date | number): string {
  const date = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 172800) return 'Yesterday';
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
```

---

## 4. Comprehensive Seed Dataset Architecture (`src/lib/mock-data.ts`)

### 4.1 Retail Store Entities
1. **FreshMarket Central:** `id: 'store-1'`, Chain: *FreshMarket*, Type: *Physical*, City: *Downtown Seattle*, Color: `#10B981` (Emerald).
2. **SaveMore Supercenter:** `id: 'store-2'`, Chain: *SaveMore*, Type: *Physical*, City: *Bellevue*, Color: `#0EA5E9` (Cerulean).
3. **Trader Green's:** `id: 'store-3'`, Chain: *Trader Green's*, Type: *Physical*, City: *Capitol Hill*, Color: `#8B5CF6` (Violet).
4. **CarePlus Pharmacy:** `id: 'store-4'`, Chain: *CarePlus*, Type: *Hybrid*, City: *Kirkland*, Color: `#F43F5E` (Coral).
5. **Apex Tech & Gear:** `id: 'store-5'`, Chain: *Apex Electronics*, Type: *Hybrid*, City: *Redmond*, Color: `#6366F1` (Indigo).
6. **Metro Wholesale Club:** `id: 'store-6'`, Chain: *Metro Wholesale*, Type: *Physical*, City: *Renton*, Color: `#F59E0B` (Amber).
7. **QuickCart Online:** `id: 'store-7'`, Chain: *QuickCart*, Type: *Online*, City: *National*, Color: `#EC4899` (Pink).

### 4.2 Representative Multi-Category Product Catalog (20 Items)

| Product ID | Name | Category | Unit | Average Price | 30d Delta | Trend Status |
|---|---|---|---|---|---|---|
| `prod-1` | Organic Whole Milk | groceries | 1 Gallon | $4.29 | -4.7% | `price_drop` |
| `prod-2` | Grade A Large Brown Eggs | groceries | 1 Dozen | $4.89 | +16.7% | `price_hike` |
| `prod-3` | Artisan Sourdough Bread | groceries | 24 oz | $3.99 | 0.0% | `stable` |
| `prod-4` | Boneless Chicken Breast | groceries | per lb | $3.79 | -5.0% | `price_drop` |
| `prod-5` | Hass Avocados (4-Pack) | groceries | 4 pack | $3.49 | -12.5% | `price_drop` |
| `prod-6` | Organic Honeycrisp Apples | groceries | per lb | $2.49 | +8.3% | `price_hike` |
| `prod-7` | Cold Brew Coffee Concentrate | beverages | 32 fl oz | $8.99 | 0.0% | `stable` |
| `prod-8` | Sparkling Spring Water (12pk) | beverages | 12 x 12 oz | $5.49 | -8.3% | `price_drop` |
| `prod-9` | 100% Pure Orange Juice | beverages | 52 fl oz | $3.99 | +5.3% | `price_hike` |
| `prod-10` | Eco Liquid Laundry Detergent | household | 100 fl oz | $13.49 | +3.8% | `price_hike` |
| `prod-11` | Ultra Soft Bath Tissue (12 Mega) | household | 12 rolls | $11.99 | 0.0% | `stable` |
| `prod-12` | Concentrated Dish Soap | household | 28 fl oz | $3.29 | -5.7% | `price_drop` |
| `prod-13` | Daily Multivitamin Tablets | pharmacy | 120 count | $14.99 | -6.2% | `price_drop` |
| `prod-14` | Mineral Sunscreen SPF 50 | pharmacy | 5 fl oz | $12.49 | +4.2% | `price_hike` |
| `prod-15` | Probiotic Gut Health Capsules | pharmacy | 60 count | $19.99 | 0.0% | `stable` |
| `prod-16` | Wireless Active Earbuds ANC | electronics | 1 pair | $49.99 | -16.7% | `price_drop` |
| `prod-17` | 65W GaN Fast Charger Dual USB-C | electronics | 1 unit | $24.99 | -10.7% | `price_drop` |
| `prod-18` | Smart Air Purifier HEPA Filter | electronics | 1 unit | $29.99 | +7.1% | `price_hike` |
| `prod-19` | Merino Wool Athletic Socks (3pk)| apparel | 3 pairs | $18.50 | 0.0% | `stable` |
| `prod-20` | Full Synthetic Oil Change 5Qt | services | 1 service | $59.99 | +9.1% | `price_hike` |

### 4.3 Longitudinal 1-Year Historical Price Generation Algorithm

For each product, historical price points will span from **August 2025 through August 2026** (12 monthly observations per store, across 3-5 stores per product, yielding ~36–60 historical price points per product):
- Baseline price with natural store variance ($SaveMore \le TraderGreens \le FreshMarket$).
- Time-series inflation adjustments matching category trends.
- Realistic seasonal promotional sales ($10\% - 25\%$ temporary drops with `originalPrice` recorded).
- Provenance tags: Shelf Photo OCR (40%), Promotional Flyer (30%), Receipt Upload (20%), Web Crawler (10%).
- Verified community contributor badges and attribution metadata.

### 4.4 Sample Ground-Truth OCR Documents

1. **Shelf Tag Document (`sample_shelf_tag.jpg`):**
   - Store: FreshMarket Central
   - Item: Hass Avocados (4-Pack)
   - Price: `$3.49` (Was `$3.99`), Unit: `4 pack`
   - Bounding Box: `{ xMin: 18.5, yMin: 22.0, xMax: 81.5, yMax: 78.0 }`
   - Confidence: `0.98`

2. **Weekly Promotional Flyer (`sample_weekly_flyer.jpg`):**
   - Store: SaveMore Supercenter
   - Items: 4 grid deals:
     1. Organic Whole Milk: `$3.89` | Box: `{ xMin: 6.0, yMin: 8.0, xMax: 48.0, yMax: 48.0 }`
     2. Artisan Sourdough Bread: `$3.49` | Box: `{ xMin: 52.0, yMin: 8.0, xMax: 94.0, yMax: 48.0 }`
     3. Honeycrisp Apples: `$1.99/lb` | Box: `{ xMin: 6.0, yMin: 52.0, xMax: 48.0, yMax: 92.0 }`
     4. Sparkling Water 12pk: `$4.49` | Box: `{ xMin: 52.0, yMin: 52.0, xMax: 94.0, yMax: 92.0 }`

3. **Supermarket Cash Receipt (`sample_cash_receipt.jpg`):**
   - Store: SaveMore Supercenter #104 (Date: 2026-08-20)
   - Items:
     1. Grade A Large Eggs: `$4.89` | Box: `{ xMin: 12.0, yMin: 32.0, xMax: 88.0, yMax: 40.0 }`
     2. Dish Soap 28oz: `$3.10` | Box: `{ xMin: 12.0, yMin: 41.0, xMax: 88.0, yMax: 49.0 }`
     3. 65W GaN Charger: `$24.99` | Box: `{ xMin: 12.0, yMin: 50.0, xMax: 88.0, yMax: 58.0 }`
     4. Laundry Detergent: `$13.49` | Box: `{ xMin: 12.0, yMin: 59.0, xMax: 88.0, yMax: 67.0 }`

---

## 5. Client Persistence Layer Architecture (`src/lib/storage.ts`)

### 5.1 Storage Schema & Namespaces

LocalStorage keys:
- `openprice_user_role`: Current active view mode (`'public' | 'contributor' | 'admin'`).
- `openprice_custom_products`: Array of user-created products merged with base catalog.
- `openprice_user_submissions`: Array of user-contributed price points.
- `openprice_watchlist`: Array of user `WatchlistItem` objects.
- `openprice_karma_state`: User's contributor karma points, tier, and unlocked badges.
- `openprice_moderation_actions`: Record of approved/rejected moderation items.

### 5.2 SSR / Hydration Safety & Multi-Tab Synchronization

- Standard SSR guard: `if (typeof window === 'undefined') return defaultValue;`
- Reactive sync: Custom event dispatcher (`window.dispatchEvent(new CustomEvent('openprice-storage-change'))`) allowing components to update instantly across views without full page reload.
- Initial seed fallback: If LocalStorage is empty, initialize seamlessly from `mock-data.ts`.

---

## 6. Multimodal OCR & Vision Pipeline Architecture

### 6.1 OpenRouter API Integration (`src/app/api/ocr/parse/route.ts`)

- **Endpoint:** `POST /api/ocr/parse`
- **Request Body:**
  ```json
  {
    "imageBase64": "data:image/jpeg;base64,...",
    "imageUrl": "https://...",
    "sourceType": "photo_shelf" | "promo_pamphlet" | "receipt"
  }
  ```
- **Vision Model Selection:** `google/gemini-2.5-flash` (or `openai/gpt-4o-mini`), leveraging high visual resolution, low latency (<1.5s), and native JSON schema output.

### 6.2 Structured System Prompt

```text
You are OpenPrice Vision Parser, an expert OCR system for retail shelf tags, receipts, and promotional flyers.
Analyze the input image and extract all visible items, prices, units, store names, and bounding boxes.

CRITICAL COORDINATE SPECIFICATION:
All bounding boxes MUST be normalized as percentages from 0.0 to 100.0 representing the image viewport:
- xMin: horizontal left edge percentage (0.0 = leftmost, 100.0 = rightmost)
- yMin: vertical top edge percentage (0.0 = topmost, 100.0 = bottommost)
- xMax: horizontal right edge percentage (0.0 to 100.0)
- yMax: vertical bottom edge percentage (0.0 to 100.0)

Output ONLY valid JSON matching this exact structure:
{
  "detectedStoreName": string or null,
  "detectedDate": string or null (YYYY-MM-DD),
  "sourceType": "photo_shelf" | "promo_pamphlet" | "receipt",
  "items": [
    {
      "name": string,
      "brand": string or null,
      "category": "groceries" | "beverages" | "household" | "pharmacy" | "electronics" | "apparel" | "services",
      "price": number (e.g. 3.49),
      "originalPrice": number or null (if discounted from a higher price),
      "unit": string (e.g. "per lb", "1 gal", "each"),
      "confidence": number (0.0 to 1.0),
      "boundingBox": {
        "xMin": number,
        "yMin": number,
        "xMax": number,
        "yMax": number
      },
      "notes": string or null
    }
  ]
}
```

### 6.3 Deterministic Offline Fallback Parser

If `process.env.OPENROUTER_API_KEY` is not present, or if the API call fails or times out:
1. The API route detects the image characteristics (or checks demo asset tokens).
2. It returns a pre-computed high-accuracy OCR parse matching the demo assets with realistic bounding boxes and confidence scores.
3. Provides a header `X-OpenPrice-Parser: fallback-heuristic` so the UI can notify the user gracefully without breaking ingestion workflows.

### 6.4 Interactive Bounding Box Synchronization Architecture

- **SVG Coordinate Layer (`BoundingBoxOverlay.tsx`):**
  - Renders an SVG layer overlaying the image container with `viewBox="0 0 100 100"` and `preserveAspectRatio="none"`.
  - Each item renders an SVG `<rect>` or `<g>` with coordinates `x={box.xMin}`, `y={box.yMin}`, `width={box.xMax - box.xMin}`, `height={box.yMax - box.yMin}`.
  - Hover state: `hoveredTempId` is broadcasted.
  - Rect color coding:
    - High Confidence ($\ge 0.90$): Emerald Mint stroke (`#10B981`) with `fill="rgba(16, 185, 129, 0.15)"`
    - Medium Confidence ($0.70 - 0.89$): Amber stroke (`#F59E0B`) with `fill="rgba(245, 158, 11, 0.15)"`
    - Low Confidence ($< 0.70$): Coral Sunset stroke (`#F43F5E`) with `fill="rgba(244, 63, 94, 0.15)"`
- **Extracted Field Editor (`ExtractedFieldEditor.tsx`):**
  - Displays a responsive tabular list with editable fields (`name`, `price`, `unit`, `category`, `selected` checkbox).
  - Hovering a row triggers highlight on the corresponding SVG bounding box on the image.
  - Clicking a bounding box on the image scrolls and focuses the corresponding row in the table.
  - Single-click "Add to Catalog" or "Batch Import Selected Items" persists data into the client store.

---

## 7. Implementation Recommendations & Verification Matrix

1. **Unit Test Matrix (`tests/inflation.test.ts`, `tests/formatters.test.ts`):**
   - Test $\Delta P$ and $\% \Delta P$ with edge cases ($P_{\text{prev}} = 0$, equal prices, price drops, price hikes).
   - Test rolling inflation calculation against known multi-category price changes.
   - Test $>3\sigma$ anomaly flagger with normal variance vs obvious outliers (e.g. $10\times$ typo).
   - Test currency formatting for USD precision, negative numbers, and tabular numbers.
2. **TypeScript Integrity:**
   - Strict adherence to domain types without `any`.
   - Complete type coverage across client store, API routes, and visualization components.
