import test, { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  getStoredProducts,
  getStoredProductById,
  saveCustomProduct,
  deleteProduct,
  getStoredStores,
  savePriceSubmission,
  getStoredWatchlist,
  toggleWatchlistProduct,
  getStoredKarma,
  addKarmaPoints,
  getModerationQueue,
  resolveModerationItem,
  getStoredRole,
  setStoredRole,
  resetStorageToDefaults,
} from '../../src/lib/storage.ts';
import type { Product } from '../../src/types/product.ts';

// Mock browser localStorage and window in Node environment
class MockLocalStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] !== undefined ? this.store[key] : null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

describe('Unit Tests: storage.ts', () => {
  beforeEach(() => {
    (globalThis as any).localStorage = new MockLocalStorage();
    (globalThis as any).window = {
      localStorage: (globalThis as any).localStorage,
      dispatchEvent: () => true,
      addEventListener: () => {},
      removeEventListener: () => {},
    };
    resetStorageToDefaults();
  });

  describe('Products Storage', () => {
    it('returns seed products on initial call', () => {
      const products = getStoredProducts();
      assert.ok(products.length >= 20);
      assert.strictEqual(products[0].id, 'prod-milk');
    });

    it('retrieves product by id', () => {
      const product = getStoredProductById('prod-milk');
      assert.ok(product);
      assert.strictEqual(product?.name, 'Organic Whole Milk');
    });

    it('saves a new custom product and persists to storage', () => {
      const custom: Product = {
        id: 'prod-custom-tea',
        name: 'Organic Matcha Green Tea',
        brand: 'Ippodo',
        category: 'beverages',
        unit: '100g tin',
        description: 'Ceremonial grade Japanese Uji matcha powder.',
        imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400',
        currentLowestPrice: 28.50,
        currentHighestPrice: 34.00,
        averagePrice: 31.25,
        previousPrice: 31.25,
        trendStatus: 'stable',
        priceDeltaPercent: 0.0,
        trackedStoresCount: 2,
        totalSubmissionsCount: 5,
        historicalPrices: [],
      };

      saveCustomProduct(custom);
      const retrieved = getStoredProductById('prod-custom-tea');
      assert.ok(retrieved);
      assert.strictEqual(retrieved?.name, 'Organic Matcha Green Tea');
      assert.strictEqual(retrieved?.category, 'beverages');
    });

    it('deletes product by id', () => {
      const custom: Product = {
        id: 'prod-to-delete',
        name: 'Temporary Item',
        brand: 'Brand',
        category: 'household',
        unit: '1 unit',
        description: 'Test',
        imageUrl: '',
        currentLowestPrice: 5.0,
        currentHighestPrice: 5.0,
        averagePrice: 5.0,
        previousPrice: 5.0,
        trendStatus: 'stable',
        priceDeltaPercent: 0.0,
        trackedStoresCount: 1,
        totalSubmissionsCount: 1,
        historicalPrices: [],
      };
      saveCustomProduct(custom);
      assert.ok(getStoredProductById('prod-to-delete'));

      const deleted = deleteProduct('prod-to-delete');
      assert.strictEqual(deleted, true);
      assert.strictEqual(getStoredProductById('prod-to-delete'), undefined);
    });
  });

  describe('Stores Storage', () => {
    it('returns all 7 seed stores', () => {
      const stores = getStoredStores();
      assert.strictEqual(stores.length, 7);
      assert.ok(stores.some((s) => s.id === 'store-target'));
      assert.ok(stores.some((s) => s.id === 'store-walmart'));
      assert.ok(stores.some((s) => s.id === 'store-trader-joes'));
    });
  });

  describe('Price Submissions & Anomaly Quarantining', () => {
    it('accepts normal verified price and updates product stats', () => {
      const initial = getStoredProductById('prod-milk')!;
      const initialSubmissions = initial.totalSubmissionsCount;

      const result = savePriceSubmission({
        productId: 'prod-milk',
        price: 4.79, // Normal price drop
        storeId: 'store-target',
        storeName: 'Target',
        confidenceScore: 98,
      });

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.isOutlier, false);
      assert.strictEqual(result.pricePoint.isVerified, true);

      const updated = getStoredProductById('prod-milk')!;
      assert.strictEqual(updated.totalSubmissionsCount, initialSubmissions + 1);
      assert.strictEqual(updated.currentLowestPrice, 4.79);
    });

    it('quarantines statistical outlier (>3σ price spike) and places into moderation queue', () => {
      const result = savePriceSubmission({
        productId: 'prod-milk',
        price: 35.00, // Massive $35 spike vs ~$5.50 baseline
        storeId: 'store-target',
        storeName: 'Target',
        confidenceScore: 95,
      });

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.isOutlier, true);
      assert.strictEqual(result.pricePoint.isVerified, false);
      assert.ok(result.moderationId);

      const queue = getModerationQueue();
      assert.ok(queue.length > 0);
      const modItem = queue.find((m) => m.id === result.moderationId);
      assert.ok(modItem);
      assert.strictEqual(modItem?.submittedPrice, 35.00);
      assert.strictEqual(modItem?.flagReason, 'outlier_variance');
    });

    it('quarantines low OCR confidence items (<80%) to moderation queue', () => {
      const result = savePriceSubmission({
        productId: 'prod-bread',
        price: 4.25,
        storeId: 'store-target',
        storeName: 'Target',
        confidenceScore: 65, // Low confidence
      });

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.isOutlier, true);
      const queue = getModerationQueue();
      const modItem = queue.find((m) => m.id === result.moderationId);
      assert.ok(modItem);
      assert.strictEqual(modItem?.flagReason, 'ocr_low_confidence');
    });
  });

  describe('Watchlist Management', () => {
    it('toggles product into watchlist and removes on second toggle', () => {
      const product = getStoredProductById('prod-milk')!;

      // Add to watchlist
      const added = toggleWatchlistProduct(product, 4.50);
      assert.strictEqual(added, true);
      let watchlist = getStoredWatchlist();
      assert.strictEqual(watchlist.length, 1);
      assert.strictEqual(watchlist[0].productId, 'prod-milk');
      assert.strictEqual(watchlist[0].targetPrice, 4.50);

      // Remove from watchlist
      const removed = toggleWatchlistProduct(product);
      assert.strictEqual(removed, false);
      watchlist = getStoredWatchlist();
      assert.strictEqual(watchlist.length, 0);
    });
  });

  describe('Karma & Gamification', () => {
    it('awards points and promotes rank tiers dynamically', () => {
      const initialKarma = getStoredKarma();
      const initialPoints = initialKarma.totalPoints;

      const updatedKarma = addKarmaPoints(100, 'Uploaded 5 verified receipts');
      assert.strictEqual(updatedKarma.totalPoints, initialPoints + 100);
      assert.ok(updatedKarma.recentActivities.length > 0);
      assert.strictEqual(updatedKarma.recentActivities[0].description, 'Uploaded 5 verified receipts');
    });
  });

  describe('Moderation Resolution', () => {
    it('approves quarantined item and integrates into product historical prices', () => {
      const submission = savePriceSubmission({
        productId: 'prod-eggs',
        price: 25.00,
        storeId: 'store-target',
        storeName: 'Target',
      });
      assert.strictEqual(submission.isOutlier, true);

      const queueBefore = getModerationQueue();
      const modItem = queueBefore[0];
      assert.ok(modItem);

      resolveModerationItem(modItem.id, 'approve');

      const queueAfter = getModerationQueue();
      assert.strictEqual(queueAfter.length, queueBefore.length - 1);

      const product = getStoredProductById('prod-eggs')!;
      const point = product.historicalPrices.find((p) => p.id === modItem.pricePointId);
      assert.ok(point);
      assert.strictEqual(point?.isVerified, true);
    });

    it('rejects quarantined item and drops without polluting product history', () => {
      const submission = savePriceSubmission({
        productId: 'prod-bread',
        price: 99.00,
        storeId: 'store-target',
        storeName: 'Target',
      });
      assert.strictEqual(submission.isOutlier, true);

      const queueBefore = getModerationQueue();
      const modItem = queueBefore[0];
      resolveModerationItem(modItem.id, 'reject');

      const product = getStoredProductById('prod-bread')!;
      const point = product.historicalPrices.find((p) => p.price === 99.00);
      assert.strictEqual(point, undefined);
    });
  });

  describe('Role Management', () => {
    it('retrieves and updates stored role', () => {
      assert.strictEqual(getStoredRole(), 'public');
      setStoredRole('contributor');
      assert.strictEqual(getStoredRole(), 'contributor');
      setStoredRole('admin');
      assert.strictEqual(getStoredRole(), 'admin');
    });
  });
});
