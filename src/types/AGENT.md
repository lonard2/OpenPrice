# TypeScript Domain Models Agent Guide (`src/types/AGENT.md`)

This guide governs domain models, schema validation, and type definitions in `src/types/`.

---

## 1. Domain Type Architecture

```
src/types/
├── index.ts                      # Barrel export of all domain types
├── product.ts                    # Product, Category, Store, PricePoint definitions
├── ocr.ts                        # Multimodal OCR bounding boxes and extraction payloads
├── analytics.ts                  # Inflation models, trend metrics, and comparison types
└── user.ts                       # User roles, watchlists, karma, and moderation items
```

---

## 2. Core Type Definitions

### Product & Pricing (`src/types/product.ts`)
```typescript
export type ProductCategory = 
  | 'groceries' 
  | 'electronics' 
  | 'household' 
  | 'pharmacy' 
  | 'apparel' 
  | 'beverages' 
  | 'services';

export type PriceTrendStatus = 
  | 'price_drop' 
  | 'price_hike' 
  | 'stable' 
  | 'rare_stock' 
  | 'demand_surge';

export interface PricePoint {
  id: string;
  productId: string;
  storeId: string;
  storeName: string;
  price: number;
  originalPrice?: number;
  currency: string;
  unit: string;
  timestamp: string; // ISO 8601
  sourceType: 'photo_shelf' | 'promo_pamphlet' | 'receipt' | 'web_crawler' | 'manual';
  confidenceScore?: number; // 0 - 100
  proofImageUrl?: string;
  contributorId?: string;
  contributorName?: string;
  isVerified: boolean;
  isOutlier?: boolean;
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
  priceDeltaPercent: number; // e.g. -12.5 or +5.0
  trackedStoresCount: number;
  totalSubmissionsCount: number;
  historicalPrices: PricePoint[];
}

export interface Store {
  id: string;
  name: string;
  chain?: string;
  branchName: string;
  type: 'physical' | 'online' | 'hybrid';
  city?: string;
  logoUrl?: string;
}
```

### Multimodal OCR Models (`src/types/ocr.ts`)
```typescript
export interface BoundingBox {
  xMin: number; // percentage 0 - 100
  yMin: number;
  xMax: number;
  yMax: number;
}

export interface ExtractedPriceItem {
  tempId: string;
  name: string;
  brand?: string;
  category?: ProductCategory;
  price: number;
  originalPrice?: number;
  unit?: string;
  confidence: number; // 0.0 - 1.0
  boundingBox?: BoundingBox;
  storeName?: string;
  notes?: string;
  selected: boolean;
}

export interface OcrParseResult {
  sourceImageUrl: string;
  detectedStoreName?: string;
  detectedDate?: string;
  sourceType: 'photo_shelf' | 'promo_pamphlet' | 'receipt';
  extractedItems: ExtractedPriceItem[];
  rawText?: string;
  processingTimeMs: number;
}
```

### User Roles & Moderation (`src/types/user.ts`)
```typescript
export type UserRole = 'public' | 'contributor' | 'admin';

export interface WatchlistItem {
  id: string;
  productId: string;
  productName: string;
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
}
```
