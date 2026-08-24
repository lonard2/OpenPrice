/**
 * Pure Mathematical & State Contract Engine for OpenPrice
 * Direct requirement-driven implementation verifying all formulas from PROJECT.md & DESIGN.md.
 */

import type {
  Product,
  Store,
  PricePoint,
  PriceTrendStatus,
  ProductCategory,
  InflationBasketReport,
  StorePriceComparison,
  PriceOutlierReport,
  ExtractedPriceItem,
} from '../fixtures/domain-fixtures.ts';
import {
  SEED_PRODUCTS,
  SEED_STORES,
  SAMPLE_OCR_RESULTS,
} from '../fixtures/domain-fixtures.ts';
import type { UserRole, WatchlistItem, ContributionKarma, ModerationItem } from '../../src/types/user.ts';

// ==========================================
// 1. Tabular Numeric Formatters
// ==========================================

export function formatCurrency(amount: number, currency: string = 'USD', showSign: boolean = false): string {
  if (isNaN(amount) || !isFinite(amount)) {
    return '$0.00';
  }

  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'CA$',
    AUD: 'A$',
  };

  const symbol = symbols[currency.toUpperCase()] || '$';
  const isJpy = currency.toUpperCase() === 'JPY';
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  let formattedNum: string;
  if (isJpy) {
    formattedNum = Math.round(absAmount).toLocaleString('en-US');
  } else {
    formattedNum = absAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  if (isNegative) {
    return `-${symbol}${formattedNum}`;
  }
  if (showSign && amount > 0) {
    return `+${symbol}${formattedNum}`;
  }
  return `${symbol}${formattedNum}`;
}

export function formatDeltaPercent(delta: number): string {
  if (isNaN(delta) || !isFinite(delta)) {
    return '0.0%';
  }
  if (delta > 0) {
    return `+${delta.toFixed(1)}%`;
  }
  if (delta < 0) {
    return `${delta.toFixed(1)}%`;
  }
  return '0.0%';
}

export function getDeltaStyle(delta: number): {
  text: string;
  bg: string;
  border: string;
  badgeClass: string;
  icon: 'up' | 'down' | 'flat';
  label: string;
  colorHex: string;
} {
  if (delta < 0) {
    return {
      text: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: 'down',
      label: 'Price Drop',
      colorHex: '#10B981',
    };
  }
  if (delta > 0) {
    return {
      text: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
      icon: 'up',
      label: 'Price Hike',
      colorHex: '#F43F5E',
    };
  }
  return {
    text: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
    icon: 'flat',
    label: 'Stable',
    colorHex: '#64748B',
  };
}

export function formatRelativeTime(dateInput: string | Date | number): string {
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      return 'Recently';
    }
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 0) {
      return 'just now';
    }
    if (diffSec < 60) {
      return 'just now';
    }
    if (diffSec < 3600) {
      const mins = Math.floor(diffSec / 60);
      return `${mins}m ago`;
    }
    if (diffSec < 86400) {
      const hours = Math.floor(diffSec / 3600);
      return `${hours}h ago`;
    }
    if (diffSec < 172800) {
      return 'yesterday';
    }
    if (diffSec < 2592000) {
      const days = Math.floor(diffSec / 86400);
      return `${days}d ago`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

// ==========================================
// 2. Inflation & Volatility Math
// ==========================================

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

      // extract category if key is category:item
      const category = key.includes(':') ? key.split(':')[0] : 'general';
      categoryCurrentSum[category] = (categoryCurrentSum[category] || 0) + current * weight;
      categoryBaseSum[category] = (categoryBaseSum[category] || 0) + base * weight;
    }
  });

  const indexValue = weightedBaseSum > 0 ? Number(((weightedCurrentSum / weightedBaseSum) * 100).toFixed(2)) : 100.0;
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
    categoryBreakdown,
    itemsCount,
    timestamp: new Date().toISOString(),
  };
}

export function calculateStorePriceVariance(
  storePrices: Array<{ storeId: string; storeName: string; price: number }>
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
    const diffPercentFromMin = minPrice > 0 ? Number((((sp.price - minPrice) / minPrice) * 100).toFixed(2)) : 0;
    const diffFromAverage = Number((sp.price - avgPrice).toFixed(2));
    const isCheapest = sp.price === minPrice;

    return {
      storeId: sp.storeId,
      storeName: sp.storeName,
      price: sp.price,
      diffFromMin,
      diffPercentFromMin,
      diffFromAverage,
      isCheapest,
    };
  });
}

export function calculateStandardDeviation(values: number[]): { mean: number; stdDev: number; sampleCount: number } {
  if (!values || values.length === 0) {
    return { mean: 0, stdDev: 0, sampleCount: 0 };
  }
  const n = values.length;
  const mean = values.reduce((sum, v) => sum + v, 0) / n;
  if (n < 2) {
    return { mean, stdDev: 0, sampleCount: n };
  }
  // Bessel-corrected sample variance
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (n - 1);
  const stdDev = Math.sqrt(variance);
  return { mean, stdDev, sampleCount: n };
}

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
  };
}

// ==========================================
// 3. Reactive Simulation State Manager
// ==========================================

export class OpenPriceStateEngine {
  private products: Product[];
  private stores: Store[];
  private watchlist: WatchlistItem[];
  private karma: ContributionKarma;
  private moderationQueue: ModerationItem[];
  private currentRole: UserRole;

  constructor() {
    this.products = JSON.parse(JSON.stringify(SEED_PRODUCTS));
    this.stores = JSON.parse(JSON.stringify(SEED_STORES));
    this.watchlist = [];
    this.karma = {
      totalPoints: 420,
      verifiedSubmissions: 28,
      pendingSubmissions: 2,
      rankTitle: 'Community Scout',
      recentActivities: [
        { id: 'act-1', description: 'Shelf Tag Verified: Whole Milk', points: 15, timestamp: new Date().toISOString() },
      ],
    };
    this.moderationQueue = [];
    this.currentRole = 'public';
  }

  // Products
  getProducts(): Product[] {
    return [...this.products];
  }

  getProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  searchProducts(query: string, category?: ProductCategory, sortBy?: string): Product[] {
    let result = [...this.products];
    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }
    if (category && category !== ('all' as any)) {
      result = result.filter((p) => p.category === category);
    }
    if (sortBy === 'biggest_drop') {
      result.sort((a, b) => a.priceDeltaPercent - b.priceDeltaPercent);
    } else if (sortBy === 'price_hike') {
      result.sort((a, b) => b.priceDeltaPercent - a.priceDeltaPercent);
    } else if (sortBy === 'lowest_price') {
      result.sort((a, b) => a.currentLowestPrice - b.currentLowestPrice);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }

  // Submission & Ingestion
  submitPrice(submission: {
    productId: string;
    storeId: string;
    storeName: string;
    price: number;
    sourceType: 'photo_shelf' | 'promo_pamphlet' | 'receipt' | 'web_crawler' | 'manual';
    proofImageUrl?: string;
    confidenceScore?: number;
  }): { success: boolean; isOutlier: boolean; moderationId?: string; pricePoint?: PricePoint } {
    const product = this.getProductById(submission.productId);
    if (!product) {
      return { success: false, isOutlier: false };
    }

    const histPrices = product.historicalPrices.map((p) => p.price);
    const outlierReport = detectPriceOutlier(submission.price, histPrices, 3.0);
    const isLowConfidence = submission.confidenceScore !== undefined && submission.confidenceScore < 0.8;

    const pricePoint: PricePoint = {
      id: `pp-sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      productId: submission.productId,
      storeId: submission.storeId,
      storeName: submission.storeName,
      price: submission.price,
      currency: 'USD',
      unit: product.unit,
      timestamp: new Date().toISOString(),
      sourceType: submission.sourceType,
      proofImageUrl: submission.proofImageUrl,
      confidenceScore: submission.confidenceScore ? Math.round(submission.confidenceScore * 100) : 95,
      isVerified: !outlierReport.isOutlier && !isLowConfidence,
      isOutlier: outlierReport.isOutlier,
      outlierSigma: outlierReport.zScore,
    };

    if (outlierReport.isOutlier || isLowConfidence) {
      const modItem: ModerationItem = {
        id: `mod-${Date.now()}`,
        pricePointId: pricePoint.id,
        productId: product.id,
        productName: product.name,
        storeName: submission.storeName,
        submittedPrice: submission.price,
        previousPrice: product.currentLowestPrice,
        proofImageUrl: submission.proofImageUrl,
        flagReason: outlierReport.isOutlier ? 'outlier_variance' : 'ocr_low_confidence',
        status: 'pending',
        submittedAt: new Date().toISOString(),
      };
      this.moderationQueue.push(modItem);
      return { success: true, isOutlier: true, moderationId: modItem.id, pricePoint };
    }

    // Normal verified addition
    product.historicalPrices.push(pricePoint);
    product.totalSubmissionsCount++;
    if (submission.price < product.currentLowestPrice) {
      product.currentLowestPrice = submission.price;
      product.trendStatus = 'price_drop';
    }
    const currentPrices = product.historicalPrices.map((p) => p.price);
    product.averagePrice = Number(
      (currentPrices.reduce((a, b) => a + b, 0) / currentPrices.length).toFixed(2)
    );

    // Award karma
    this.addKarma(15, `Verified price log for ${product.name}`);

    return { success: true, isOutlier: false, pricePoint };
  }

  // Moderation
  getModerationQueue(): ModerationItem[] {
    return [...this.moderationQueue];
  }

  resolveModeration(id: string, action: 'approve' | 'reject' | 'adjust', adjustedPrice?: number): boolean {
    const itemIdx = this.moderationQueue.findIndex((m) => m.id === id);
    if (itemIdx === -1) return false;

    const item = this.moderationQueue[itemIdx];
    if (action === 'approve') {
      item.status = 'approved';
      const product = this.getProductById(item.productId);
      if (product) {
        product.historicalPrices.push({
          id: item.pricePointId,
          productId: item.productId,
          storeId: 'store-verified',
          storeName: item.storeName,
          price: item.submittedPrice,
          currency: 'USD',
          unit: product.unit,
          timestamp: item.submittedAt,
          sourceType: 'manual',
          isVerified: true,
        });
      }
    } else if (action === 'adjust' && adjustedPrice !== undefined) {
      item.status = 'approved';
      item.submittedPrice = adjustedPrice;
      const product = this.getProductById(item.productId);
      if (product) {
        product.historicalPrices.push({
          id: item.pricePointId,
          productId: item.productId,
          storeId: 'store-adjusted',
          storeName: item.storeName,
          price: adjustedPrice,
          currency: 'USD',
          unit: product.unit,
          timestamp: item.submittedAt,
          sourceType: 'manual',
          isVerified: true,
        });
      }
    } else {
      item.status = 'rejected';
    }

    this.moderationQueue.splice(itemIdx, 1);
    return true;
  }

  // Watchlist & Alerts
  getWatchlist(): WatchlistItem[] {
    return [...this.watchlist];
  }

  toggleWatchlist(productId: string, targetPrice?: number): boolean {
    const idx = this.watchlist.findIndex((w) => w.productId === productId);
    if (idx >= 0) {
      this.watchlist.splice(idx, 1);
      return false; // removed
    }
    const product = this.getProductById(productId);
    if (!product) return false;
    this.watchlist.push({
      id: `watch-${productId}`,
      productId,
      productName: product.name,
      targetPrice: targetPrice ?? product.currentLowestPrice,
      notifyOnPriceDrop: true,
      notifyOnInflationSpike: true,
      addedAt: new Date().toISOString(),
    });
    return true; // added
  }

  checkWatchlistAlerts(): Array<{ item: WatchlistItem; triggered: boolean; currentPrice: number; savings: number }> {
    return this.watchlist.map((w) => {
      const product = this.getProductById(w.productId);
      const currentPrice = product ? product.currentLowestPrice : 0;
      const target = w.targetPrice ?? 0;
      const triggered = currentPrice > 0 && target > 0 && currentPrice <= target;
      return {
        item: w,
        triggered,
        currentPrice,
        savings: triggered ? Number((target - currentPrice).toFixed(2)) : 0,
      };
    });
  }

  // Karma & Reputation
  getKarma(): ContributionKarma {
    return { ...this.karma };
  }

  addKarma(points: number, reason: string): ContributionKarma {
    this.karma.totalPoints += points;
    this.karma.verifiedSubmissions += 1;
    if (this.karma.totalPoints >= 500) {
      this.karma.rankTitle = 'Price Master';
    } else if (this.karma.totalPoints >= 250) {
      this.karma.rankTitle = 'Price Hunter';
    }
    this.karma.recentActivities.unshift({
      id: `act-${Date.now()}`,
      description: reason,
      points,
      timestamp: new Date().toISOString(),
    });
    return { ...this.karma };
  }

  // Role Management
  getRole(): UserRole {
    return this.currentRole;
  }

  setRole(role: UserRole): void {
    this.currentRole = role;
  }

  // Basket Optimizer Math
  calculateBasketOptimization(productIds: string[]): {
    singleStoreTotals: Record<string, number>;
    cheapestSingleStore: { storeId: string; storeName: string; total: number };
    splitTripTotal: number;
    splitTripSavings: number;
    splitTripPlan: Array<{ productId: string; productName: string; bestStoreId: string; bestStoreName: string; bestPrice: number }>;
  } {
    const singleStoreTotals: Record<string, number> = {};
    const splitTripPlan: Array<{ productId: string; productName: string; bestStoreId: string; bestStoreName: string; bestPrice: number }> = [];

    const productsToOptimize = productIds.map((id) => this.getProductById(id)).filter(Boolean) as Product[];

    // Calculate store totals
    this.stores.forEach((store) => {
      let storeSum = 0;
      productsToOptimize.forEach((prod) => {
        const storePrices = prod.historicalPrices.filter((hp) => hp.storeId === store.id);
        const latestPrice = storePrices.length > 0 ? storePrices[storePrices.length - 1].price : prod.averagePrice;
        storeSum += latestPrice;
      });
      singleStoreTotals[store.id] = Number(storeSum.toFixed(2));
    });

    // Find best single store
    let bestSingleStoreId = this.stores[0].id;
    let minSingleTotal = singleStoreTotals[bestSingleStoreId] || 999999;
    Object.entries(singleStoreTotals).forEach(([sId, total]) => {
      if (total < minSingleTotal) {
        minSingleTotal = total;
        bestSingleStoreId = sId;
      }
    });

    const bestSingleStoreObj = this.stores.find((s) => s.id === bestSingleStoreId)!;

    // Calculate split trip
    let splitTripTotal = 0;
    productsToOptimize.forEach((prod) => {
      let bestItemPrice = 999999;
      let bestItemStore = this.stores[0];
      this.stores.forEach((store) => {
        const storePrices = prod.historicalPrices.filter((hp) => hp.storeId === store.id);
        const price = storePrices.length > 0 ? storePrices[storePrices.length - 1].price : prod.averagePrice;
        if (price < bestItemPrice) {
          bestItemPrice = price;
          bestItemStore = store;
        }
      });
      splitTripTotal += bestItemPrice;
      splitTripPlan.push({
        productId: prod.id,
        productName: prod.name,
        bestStoreId: bestItemStore.id,
        bestStoreName: bestItemStore.name,
        bestPrice: bestItemPrice,
      });
    });

    splitTripTotal = Number(splitTripTotal.toFixed(2));
    const splitTripSavings = Number((minSingleTotal - splitTripTotal).toFixed(2));

    return {
      singleStoreTotals,
      cheapestSingleStore: {
        storeId: bestSingleStoreId,
        storeName: bestSingleStoreObj ? bestSingleStoreObj.name : 'Target',
        total: minSingleTotal,
      },
      splitTripTotal,
      splitTripSavings,
      splitTripPlan,
    };
  }
}
