/**
 * OpenPrice Product & Pricing Domain Models
 */

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
  | 'demand_surge'
  | 'up'
  | 'down'
  | 'flat'
  | 'new'
  | 'outlier';

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
  outlierSigma?: number;
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
  priceDeltaAmount?: number;  // e.g. -0.50 or +0.25
  trackedStoresCount: number;
  totalSubmissionsCount: number;
  historicalPrices: PricePoint[];
  tags?: string[];
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
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
  color?: string; // Unique hex color for Recharts line identification
  isVerified?: boolean;
}
