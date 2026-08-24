/**
 * OpenPrice SSR-Safe Reactive LocalStorage Persistence Engine
 * Manages products, price submissions, moderation items, watchlists, karma, and cross-view sync.
 */

import type {
  Product,
  Store,
  PricePoint,
  WatchlistItem,
  ContributionKarma,
  ModerationItem,
  UserRole,
} from '../types/index.ts';
import { SEED_PRODUCTS, SEED_STORES } from './mock-data.ts';
import { detectPriceOutlier } from './inflation.ts';

const STORAGE_KEYS = {
  PRODUCTS: 'openprice_custom_products',
  STORES: 'openprice_custom_stores',
  WATCHLIST: 'openprice_watchlist',
  KARMA: 'openprice_karma_state',
  MODERATION: 'openprice_moderation_queue',
  ROLE: 'openprice_user_role',
} as const;

const EVENT_NAME = 'openprice-storage-change';

/**
 * Checks if code is executing in a browser environment.
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * Dispatches custom event for reactive UI updates across components and tabs.
 */
function notifyStorageChange(): void {
  if (isBrowser()) {
    try {
      window.dispatchEvent(new CustomEvent(EVENT_NAME));
    } catch {
      // Ignore in environments where CustomEvent is unavailable
    }
  }
}

/**
 * Subscribes a listener callback to storage changes.
 */
export function subscribeToStorageChanges(callback: () => void): () => void {
  if (!isBrowser()) return () => {};
  const handler = () => callback();
  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener('storage', handler);
  };
}

/**
 * Safe JSON parser with fallback.
 */
function safeJsonParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

// ============================================================================
// Products Storage
// ============================================================================

/**
 * Retrieves all stored products, merging user custom products with default seed products.
 */
export function getStoredProducts(): Product[] {
  if (!isBrowser()) {
    return SEED_PRODUCTS;
  }

  const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (!raw) {
    // Initialize default seed products in storage
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(SEED_PRODUCTS));
    return SEED_PRODUCTS;
  }

  const products = safeJsonParse<Product[]>(raw, SEED_PRODUCTS);
  return products.length > 0 ? products : SEED_PRODUCTS;
}

/**
 * Retrieves a single product by its unique identifier.
 */
export function getStoredProductById(id: string): Product | undefined {
  const products = getStoredProducts();
  return products.find((p) => p.id === id);
}

/**
 * Saves a new custom product or updates an existing product.
 */
export function saveCustomProduct(product: Product): Product {
  if (!isBrowser()) return product;

  const products = getStoredProducts();
  const index = products.findIndex((p) => p.id === product.id);

  if (index >= 0) {
    products[index] = { ...product, updatedAt: new Date().toISOString() };
  } else {
    products.unshift({
      ...product,
      createdAt: product.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  notifyStorageChange();
  return product;
}

/**
 * Deletes a product from storage by ID.
 */
export function deleteProduct(id: string): boolean {
  if (!isBrowser()) return false;

  const products = getStoredProducts();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) return false;

  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
  notifyStorageChange();
  return true;
}

// ============================================================================
// Stores Storage
// ============================================================================

/**
 * Retrieves all retail stores.
 */
export function getStoredStores(): Store[] {
  if (!isBrowser()) return SEED_STORES;

  const raw = localStorage.getItem(STORAGE_KEYS.STORES);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(SEED_STORES));
    return SEED_STORES;
  }

  return safeJsonParse<Store[]>(raw, SEED_STORES);
}

// ============================================================================
// Price Submissions & Outlier Ingestion
// ============================================================================

export interface SavePriceSubmissionResult {
  success: boolean;
  pricePoint: PricePoint;
  isOutlier: boolean;
  moderationId?: string;
}

/**
 * Saves a crowdsourced price submission.
 * Performs statistical >3σ outlier detection:
 * - If verified: adds to product history, updates metrics, awards karma.
 * - If outlier: flags for moderation and queues in ModerationItems.
 */
export function savePriceSubmission(
  submission: Partial<PricePoint> & {
    productId: string;
    price: number;
    storeId?: string;
    storeName?: string;
  }
): SavePriceSubmissionResult {
  const products = getStoredProducts();
  const productIndex = products.findIndex((p) => p.id === submission.productId);

  if (productIndex === -1) {
    throw new Error(`Product with ID "${submission.productId}" not found.`);
  }

  const product = products[productIndex];
  const historicalPrices = product.historicalPrices.map((hp) => hp.price);
  const outlierReport = detectPriceOutlier(submission.price, historicalPrices, 3.0);

  const confidence = submission.confidenceScore ?? 95;
  const isLowConfidence = confidence < 80;
  const isOutlier = outlierReport.isOutlier || isLowConfidence;

  const pricePoint: PricePoint = {
    id: submission.id || `pp-sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    productId: submission.productId,
    storeId: submission.storeId || 'store-target',
    storeName: submission.storeName || 'Target',
    price: submission.price,
    originalPrice: submission.originalPrice,
    currency: submission.currency || 'USD',
    unit: submission.unit || product.unit,
    timestamp: submission.timestamp || new Date().toISOString(),
    sourceType: submission.sourceType || 'manual',
    confidenceScore: confidence,
    proofImageUrl: submission.proofImageUrl,
    contributorId: submission.contributorId || 'contrib-user',
    contributorName: submission.contributorName || 'Community Contributor',
    isVerified: !isOutlier,
    isOutlier: outlierReport.isOutlier,
    outlierZScore: outlierReport.zScore,
    outlierSigma: outlierReport.zScore,
    notes: submission.notes,
  };

  if (isOutlier) {
    const moderationItem: ModerationItem = {
      id: `mod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      pricePointId: pricePoint.id,
      productId: product.id,
      productName: product.name,
      storeName: pricePoint.storeName,
      submittedPrice: pricePoint.price,
      previousPrice: product.currentLowestPrice,
      proofImageUrl: pricePoint.proofImageUrl,
      flagReason: outlierReport.isOutlier ? 'outlier_variance' : 'ocr_low_confidence',
      status: 'pending',
      submittedAt: pricePoint.timestamp,
      contributorId: pricePoint.contributorId,
      contributorName: pricePoint.contributorName,
      pricePoint,
      product,
    };

    if (isBrowser()) {
      const queue = getModerationQueue();
      queue.unshift(moderationItem);
      localStorage.setItem(STORAGE_KEYS.MODERATION, JSON.stringify(queue));
      notifyStorageChange();
    }

    return {
      success: true,
      pricePoint,
      isOutlier: true,
      moderationId: moderationItem.id,
    };
  }

  // Verified submission: add to product history and recompute metrics
  product.historicalPrices.push(pricePoint);
  product.totalSubmissionsCount++;
  product.updatedAt = new Date().toISOString();

  if (submission.price < product.currentLowestPrice) {
    product.currentLowestPrice = submission.price;
    product.trendStatus = 'price_drop';
  } else if (submission.price > product.currentHighestPrice) {
    product.currentHighestPrice = submission.price;
  }

  const allPrices = product.historicalPrices.map((p) => p.price);
  product.averagePrice = Number((allPrices.reduce((a, b) => a + b, 0) / allPrices.length).toFixed(2));

  if (isBrowser()) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    addKarmaPoints(15, `Submitted verified price for ${product.name}`);
    notifyStorageChange();
  }

  return {
    success: true,
    pricePoint,
    isOutlier: false,
  };
}

// ============================================================================
// Watchlist Management
// ============================================================================

/**
 * Retrieves the user's saved watchlist.
 */
export function getStoredWatchlist(): WatchlistItem[] {
  if (!isBrowser()) return [];

  const raw = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
  return safeJsonParse<WatchlistItem[]>(raw, []);
}

/**
 * Toggles a product in the user's watchlist.
 * @returns true if added, false if removed
 */
export function toggleWatchlistProduct(product: Product, targetPrice?: number): boolean {
  if (!isBrowser()) return false;

  const watchlist = getStoredWatchlist();
  const index = watchlist.findIndex((w) => w.productId === product.id);

  if (index >= 0) {
    watchlist.splice(index, 1);
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
    notifyStorageChange();
    return false; // Removed
  }

  const newItem: WatchlistItem = {
    id: `watch-${product.id}`,
    productId: product.id,
    productName: product.name,
    category: product.category,
    initialPrice: product.currentLowestPrice,
    currentPrice: product.currentLowestPrice,
    lowestTrackedPrice: product.currentLowestPrice,
    targetPrice: targetPrice ?? product.currentLowestPrice,
    notifyOnPriceDrop: true,
    notifyOnInflationSpike: true,
    addedAt: new Date().toISOString(),
  };

  watchlist.push(newItem);
  localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
  notifyStorageChange();
  return true; // Added
}

// ============================================================================
// Contributor Karma & Gamification
// ============================================================================

const DEFAULT_KARMA: ContributionKarma = {
  totalPoints: 420,
  tier: 'Eagle Eye',
  rankTitle: 'Community Scout',
  verifiedSubmissions: 28,
  pendingSubmissions: 2,
  rejectedSubmissions: 0,
  streakDays: 5,
  weeklyGoal: { target: 10, completed: 7 },
  badges: [
    {
      id: 'badge-first-scan',
      name: 'First Tag Scanned',
      description: 'Successfully uploaded and verified first shelf tag photo',
      icon: 'Camera',
      unlockedAt: '2026-08-01T10:00:00.000Z',
    },
    {
      id: 'badge-eagle-eye',
      name: 'Eagle Eye',
      description: 'Logged 25+ verified prices with 95%+ confidence',
      icon: 'Eye',
      unlockedAt: '2026-08-15T14:30:00.000Z',
    },
  ],
  recentActivities: [
    {
      id: 'act-1',
      description: 'Verified shelf tag photo for Organic Whole Milk',
      points: 15,
      timestamp: '2026-08-24T09:15:00.000Z',
    },
    {
      id: 'act-2',
      description: 'Imported 4 flyer deals for Walmart Supercenter',
      points: 40,
      timestamp: '2026-08-23T16:00:00.000Z',
    },
  ],
};

/**
 * Retrieves the current contributor karma state.
 */
export function getStoredKarma(): ContributionKarma {
  if (!isBrowser()) return DEFAULT_KARMA;

  const raw = localStorage.getItem(STORAGE_KEYS.KARMA);
  return safeJsonParse<ContributionKarma>(raw, DEFAULT_KARMA);
}

/**
 * Adds karma points and calculates rank progression.
 */
export function addKarmaPoints(points: number, reason: string): ContributionKarma {
  if (!isBrowser()) return DEFAULT_KARMA;

  const karma = getStoredKarma();
  karma.totalPoints += points;
  karma.verifiedSubmissions += 1;

  // Rank and tier progression
  if (karma.totalPoints >= 1000) {
    karma.tier = 'Grand Arbiter';
    karma.rankTitle = 'Grand Arbiter';
  } else if (karma.totalPoints >= 500) {
    karma.tier = 'Master Curator';
    karma.rankTitle = 'Master Curator';
  } else if (karma.totalPoints >= 250) {
    karma.tier = 'Price Hunter';
    karma.rankTitle = 'Price Hunter';
  } else if (karma.totalPoints >= 100) {
    karma.tier = 'Eagle Eye';
    karma.rankTitle = 'Eagle Eye';
  } else {
    karma.tier = 'Novice Scout';
    karma.rankTitle = 'Novice Scout';
  }

  if (!karma.recentActivities) karma.recentActivities = [];
  karma.recentActivities.unshift({
    id: `act-${Date.now()}`,
    description: reason,
    points,
    timestamp: new Date().toISOString(),
  });

  localStorage.setItem(STORAGE_KEYS.KARMA, JSON.stringify(karma));
  notifyStorageChange();
  return karma;
}

// ============================================================================
// Moderation Queue Management
// ============================================================================

/**
 * Retrieves the pending moderation items queue.
 */
export function getModerationQueue(): ModerationItem[] {
  if (!isBrowser()) return [];

  const raw = localStorage.getItem(STORAGE_KEYS.MODERATION);
  return safeJsonParse<ModerationItem[]>(raw, []);
}

/**
 * Resolves a moderation item (approve, reject, or adjust price).
 */
export function resolveModerationItem(
  id: string,
  action: 'approve' | 'reject' | 'adjust',
  adjustedPrice?: number
): void {
  if (!isBrowser()) return;

  const queue = getModerationQueue();
  const itemIndex = queue.findIndex((m) => m.id === id);
  if (itemIndex === -1) return;

  const item = queue[itemIndex];

  if (action === 'approve' || action === 'adjust') {
    const finalPrice = action === 'adjust' && adjustedPrice !== undefined
      ? adjustedPrice
      : item.submittedPrice;

    const products = getStoredProducts();
    const product = products.find((p) => p.id === item.productId);

    if (product) {
      const verifiedPoint: PricePoint = {
        id: item.pricePointId,
        productId: item.productId,
        storeId: 'store-target',
        storeName: item.storeName,
        price: finalPrice,
        currency: 'USD',
        unit: product.unit,
        timestamp: item.submittedAt,
        sourceType: 'manual',
        isVerified: true,
        proofImageUrl: item.proofImageUrl,
      };

      product.historicalPrices.push(verifiedPoint);
      product.totalSubmissionsCount++;
      if (finalPrice < product.currentLowestPrice) {
        product.currentLowestPrice = finalPrice;
        product.trendStatus = 'price_drop';
      }
      const prices = product.historicalPrices.map((p) => p.price);
      product.averagePrice = Number((prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2));
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    }
  }

  // Remove from pending queue
  queue.splice(itemIndex, 1);
  localStorage.setItem(STORAGE_KEYS.MODERATION, JSON.stringify(queue));
  notifyStorageChange();
}

// ============================================================================
// User Role Preference
// ============================================================================

/**
 * Retrieves the stored user role preference.
 */
export function getStoredRole(): UserRole {
  if (!isBrowser()) return 'public';
  const role = localStorage.getItem(STORAGE_KEYS.ROLE);
  if (role === 'public' || role === 'contributor' || role === 'admin') {
    return role;
  }
  return 'public';
}

/**
 * Sets the active user role preference.
 */
export function setStoredRole(role: UserRole): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.ROLE, role);
  notifyStorageChange();
}

/**
 * Resets storage to default seed values.
 */
export function resetStorageToDefaults(): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(SEED_PRODUCTS));
  localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(SEED_STORES));
  localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.KARMA, JSON.stringify(DEFAULT_KARMA));
  localStorage.setItem(STORAGE_KEYS.MODERATION, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.ROLE, 'public');
  notifyStorageChange();
}
