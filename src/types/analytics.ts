/**
 * OpenPrice Analytics & Statistical Mathematical Domain Models
 */

import type { ProductCategory, PriceSourceType } from './product.ts';

export type TimeframeFilter = '7D' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

export interface InflationBasketCategory {
  category: ProductCategory;
  weight: number;              // 0.0 to 1.0 (Sum = 1.0)
  basePriceIndex: number;      // 100.0 base
  currentPriceIndex: number;   // e.g. 106.4
  categoryInflationRate: number; // e.g. +6.4%
  itemCount: number;
  representativeItems?: Array<{
    name: string;
    basePrice: number;
    currentPrice: number;
    deltaPercent: number;
  }>;
}

export interface InflationBasketReport {
  period?: string; // e.g. "Last 12 Months", "Last 30 Days"
  baseDate?: string;
  currentDate?: string;
  indexValue: number; // e.g. 104.85
  baseIndex: number;  // 100.0
  inflationRatePercent: number;  // e.g. +4.85%
  compositeInflationIndex?: number;
  compositeInflationRate?: number;
  categoryBreakdown: Record<string, number>;
  categories?: InflationBasketCategory[];
  itemsCount: number;
  timestamp: string;
}

export interface StorePriceComparison {
  storeId: string;
  storeName: string;
  chain?: string;
  storeType?: 'physical' | 'online' | 'hybrid';
  price: number;
  originalPrice?: number;
  unit?: string;
  diffFromMin: number;
  diffPercentFromMin: number;
  diffFromAverage: number;
  diffFromLowestAmount?: number;
  diffFromLowestPercent?: number;
  diffFromAvgAmount?: number;
  diffFromAvgPercent?: number;
  isCheapest: boolean;
  lastUpdated?: string;
  inStock?: boolean;
  proofImageUrl?: string;
  sourceType?: PriceSourceType;
  isVerified?: boolean;
}

export interface PriceOutlierReport {
  isOutlier: boolean;
  zScore: number;
  mean: number;
  standardDeviation: number;
  thresholdSigma: number; // default 3.0
  sampleSize: number;
  originalPrice: number;
  pricePointId?: string;
  productId?: string;
  productName?: string;
  storeName?: string;
  submittedPrice?: number;
  historicalMean?: number;
  historicalStdDev?: number;
  flaggedAt?: string;
  reason?: string;
}
