/**
 * OpenPrice Statistical Analytics & Inflation Mathematics
 * Implements Laspeyres Rolling Inflation Index, Store Price Variance,
 * and Bessel-corrected >3σ Z-score Anomaly Detection.
 */

import type {
  PriceTrendStatus,
  InflationBasketReport,
  StorePriceComparison,
  PriceOutlierReport,
  PricePoint,
} from '../types/index.ts';

/**
 * Calculates price delta, percentage change, and trend classification.
 */
export function calculatePriceDelta(
  current: number,
  previous: number
): { amount: number; percent: number; status: PriceTrendStatus } {
  if (isNaN(current) || isNaN(previous)) {
    return { amount: 0, percent: 0, status: 'stable' };
  }

  const amount = Number((current - previous).toFixed(2));
  let percent = 0;
  if (previous > 0) {
    percent = Number((((current - previous) / previous) * 100).toFixed(2));
  }

  let status: PriceTrendStatus = 'stable';
  if (amount < 0) {
    status = 'price_drop';
  } else if (amount > 0) {
    status = 'price_hike';
  }

  return { amount, percent, status };
}

/**
 * Calculates the Laspeyres Rolling Inflation Index and category breakdowns.
 * @param currentPrices Map of item identifiers (or 'category:item') to current prices
 * @param basePrices Map of item identifiers to base period prices
 * @param weights Optional map of item identifiers to basket weights (default 1.0)
 */
export function calculateInflationIndex(
  currentPrices: Record<string, number>,
  basePrices: Record<string, number>,
  weights: Record<string, number> = {}
): InflationBasketReport {
  let weightedCurrentSum = 0;
  let weightedBaseSum = 0;
  const categoryCurrentSum: Record<string, number> = {};
  const categoryBaseSum: Record<string, number> = {};
  let itemsCount = 0;

  const itemKeys = Object.keys(currentPrices);

  itemKeys.forEach((key) => {
    const current = currentPrices[key];
    const base = basePrices[key];
    if (current !== undefined && base !== undefined && base > 0) {
      const weight = weights[key] !== undefined && weights[key] > 0 ? weights[key] : 1.0;
      weightedCurrentSum += current * weight;
      weightedBaseSum += base * weight;
      itemsCount++;

      // Extract category if key is formatted as 'category:item'
      const category = key.includes(':') ? key.split(':')[0] : 'general';
      categoryCurrentSum[category] = (categoryCurrentSum[category] || 0) + current * weight;
      categoryBaseSum[category] = (categoryBaseSum[category] || 0) + base * weight;
    }
  });

  const indexValue = weightedBaseSum > 0
    ? Number(((weightedCurrentSum / weightedBaseSum) * 100).toFixed(2))
    : 100.0;
  const inflationRatePercent = Number((indexValue - 100).toFixed(2));

  const categoryBreakdown: Record<string, number> = {};
  Object.keys(categoryCurrentSum).forEach((cat) => {
    const catBase = categoryBaseSum[cat];
    const catCurr = categoryCurrentSum[cat];
    if (catBase && catBase > 0) {
      categoryBreakdown[cat] = Number(((catCurr / catBase) * 100 - 100).toFixed(2));
    }
  });

  return {
    indexValue,
    baseIndex: 100.0,
    inflationRatePercent,
    compositeInflationIndex: indexValue,
    compositeInflationRate: inflationRatePercent,
    categoryBreakdown,
    itemsCount,
    timestamp: new Date().toISOString(),
  };
}

export interface StorePriceInput {
  storeId: string;
  storeName: string;
  price: number;
  chain?: string;
  storeType?: 'physical' | 'online' | 'hybrid';
  originalPrice?: number;
  unit?: string;
  lastUpdated?: string;
  inStock?: boolean;
  proofImageUrl?: string;
  sourceType?: PricePoint['sourceType'];
  isVerified?: boolean;
}

/**
 * Calculates store price variance, cheapest retailer, and delta metrics.
 */
export function calculateStorePriceVariance(
  storePrices: StorePriceInput[]
): StorePriceComparison[] {
  if (!storePrices || storePrices.length === 0) {
    return [];
  }

  const validPrices = storePrices.filter((s) => !isNaN(s.price) && s.price >= 0);
  if (validPrices.length === 0) return [];

  const minPrice = Math.min(...validPrices.map((s) => s.price));
  const avgPrice = validPrices.reduce((acc, curr) => acc + curr.price, 0) / validPrices.length;

  return validPrices.map((sp) => {
    const diffFromMin = Number((sp.price - minPrice).toFixed(2));
    const diffPercentFromMin = minPrice > 0
      ? Number((((sp.price - minPrice) / minPrice) * 100).toFixed(2))
      : 0;
    const diffFromAverage = Number((sp.price - avgPrice).toFixed(2));
    const isCheapest = sp.price === minPrice;

    return {
      storeId: sp.storeId,
      storeName: sp.storeName,
      chain: sp.chain,
      storeType: sp.storeType,
      price: sp.price,
      originalPrice: sp.originalPrice,
      unit: sp.unit || 'unit',
      diffFromMin,
      diffPercentFromMin,
      diffFromAverage,
      diffFromLowestAmount: diffFromMin,
      diffFromLowestPercent: diffPercentFromMin,
      diffFromAvgAmount: diffFromAverage,
      diffFromAvgPercent: avgPrice > 0 ? Number((((sp.price - avgPrice) / avgPrice) * 100).toFixed(2)) : 0,
      isCheapest,
      lastUpdated: sp.lastUpdated || new Date().toISOString(),
      inStock: sp.inStock ?? true,
      proofImageUrl: sp.proofImageUrl,
      sourceType: sp.sourceType,
      isVerified: sp.isVerified ?? true,
    };
  });
}

/**
 * Calculates sample mean and Bessel-corrected sample standard deviation (using N-1 denominator).
 */
export function calculateStandardDeviation(
  values: number[]
): { mean: number; stdDev: number; sampleCount: number } {
  if (!values || values.length === 0) {
    return { mean: 0, stdDev: 0, sampleCount: 0 };
  }
  const n = values.length;
  const mean = values.reduce((sum, v) => sum + v, 0) / n;
  if (n < 2) {
    return { mean, stdDev: 0, sampleCount: n };
  }
  // Bessel-corrected sample variance: sum((x - mean)^2) / (n - 1)
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (n - 1);
  const stdDev = Math.sqrt(variance);
  return { mean, stdDev, sampleCount: n };
}

/**
 * Detects statistical price anomalies using a >3σ Bessel-corrected Z-score test.
 * @param newPrice The newly submitted price to test
 * @param historicalPrices Array of historical verified price observations
 * @param thresholdSigma Z-score threshold (default 3.0 for 99.73% normal bounds)
 */
export function detectPriceOutlier(
  newPrice: number,
  historicalPrices: number[],
  thresholdSigma: number = 3.0
): PriceOutlierReport {
  if (isNaN(newPrice)) {
    return {
      isOutlier: false,
      zScore: 0,
      mean: 0,
      standardDeviation: 0,
      thresholdSigma,
      sampleSize: 0,
      originalPrice: newPrice,
    };
  }

  const validHist = historicalPrices.filter((p) => !isNaN(p) && p >= 0);
  const sampleSize = validHist.length;

  if (sampleSize < 2) {
    return {
      isOutlier: false,
      zScore: 0,
      mean: newPrice,
      standardDeviation: 0,
      thresholdSigma,
      sampleSize,
      originalPrice: newPrice,
    };
  }

  const { mean, stdDev } = calculateStandardDeviation(validHist);

  if (stdDev === 0) {
    const isOutlier = newPrice !== mean;
    return {
      isOutlier,
      zScore: isOutlier ? 999.0 : 0.0,
      mean,
      standardDeviation: 0,
      thresholdSigma,
      sampleSize,
      originalPrice: newPrice,
      reason: isOutlier ? 'Price deviates from zero-variance historical baseline' : undefined,
    };
  }

  const zScore = Number((Math.abs(newPrice - mean) / stdDev).toFixed(2));
  const isOutlier = zScore > thresholdSigma;

  return {
    isOutlier,
    zScore,
    mean: Number(mean.toFixed(2)),
    standardDeviation: Number(stdDev.toFixed(2)),
    thresholdSigma,
    sampleSize,
    originalPrice: newPrice,
    reason: isOutlier
      ? `Z-Score (${zScore}σ) exceeds threshold limit (${thresholdSigma}σ)`
      : undefined,
  };
}
