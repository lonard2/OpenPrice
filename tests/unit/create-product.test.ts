import test, { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  getStoredProducts,
  getStoredProductById,
  saveCustomProduct,
  savePriceSubmission,
  getStoredKarma,
  addKarmaPoints,
  resetStorageToDefaults,
} from '../../src/lib/storage.ts';
import type { Product } from '../../src/types/product.ts';

// Mock localStorage for Node test runner
class MockLocalStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] ?? null;
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

describe('Unit Tests: From-Scratch Product & Price Creation', () => {
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

  it('creates and persists a grocery product from scratch with full details and price', () => {
    const newProduct: Product = {
      id: 'prod-custom-oats',
      name: 'Organic Rolled Oats Gluten-Free',
      brand: "Bob's Red Mill",
      category: 'groceries',
      unit: '32 oz bag',
      description: 'Whole grain gluten free rolled oats for breakfast and baking.',
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
      currentLowestPrice: 6.49,
      currentHighestPrice: 6.49,
      averagePrice: 6.49,
      previousPrice: 7.99,
      trendStatus: 'price_drop',
      priceDeltaPercent: -18.8,
      priceDeltaAmount: -1.50,
      trackedStoresCount: 1,
      totalSubmissionsCount: 1,
      tags: ['groceries', 'oats', 'gluten-free', 'breakfast'],
      isVerified: true,
      historicalPrices: [],
    };

    saveCustomProduct(newProduct);
    const retrieved = getStoredProductById('prod-custom-oats');
    assert.ok(retrieved);
    assert.strictEqual(retrieved?.name, 'Organic Rolled Oats Gluten-Free');
    assert.strictEqual(retrieved?.unit, '32 oz bag');
    assert.strictEqual(retrieved?.currentLowestPrice, 6.49);
    assert.strictEqual(retrieved?.previousPrice, 7.99);
    assert.strictEqual(retrieved?.trendStatus, 'price_drop');

    // Submit initial price observation
    const priceResult = savePriceSubmission({
      productId: 'prod-custom-oats',
      price: 6.49,
      originalPrice: 7.99,
      storeId: 'store-target',
      storeName: 'Target',
      unit: '32 oz bag',
      sourceType: 'manual',
      notes: 'Shelf sticker verified in aisle 4',
    });

    assert.strictEqual(priceResult.success, true);
    assert.strictEqual(priceResult.isOutlier, false);
  });

  it('creates a digital subscription item from scratch with monthly billing unit', () => {
    const subscriptionProduct: Product = {
      id: 'prod-custom-saas',
      name: 'Pro Cloud Developer Workspace',
      brand: 'CloudDev Direct',
      category: 'subscriptions',
      unit: '/user/mo',
      description: 'Dedicated GPU container environment for cloud development.',
      imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400',
      currentLowestPrice: 29.00,
      currentHighestPrice: 29.00,
      averagePrice: 29.00,
      previousPrice: 29.00,
      trendStatus: 'new',
      priceDeltaPercent: 0.0,
      trackedStoresCount: 1,
      totalSubmissionsCount: 1,
      tags: ['subscriptions', 'saas', 'cloud'],
      isVerified: true,
      historicalPrices: [],
    };

    saveCustomProduct(subscriptionProduct);
    const retrieved = getStoredProductById('prod-custom-saas');
    assert.ok(retrieved);
    assert.strictEqual(retrieved?.category, 'subscriptions');
    assert.strictEqual(retrieved?.unit, '/user/mo');
    assert.strictEqual(retrieved?.currentLowestPrice, 29.00);
  });

  it('creates an automotive vehicle item with MSRP unit and dealership store attribution', () => {
    const carProduct: Product = {
      id: 'prod-custom-scooter',
      name: 'Electric Urban Commuter Scooter 500W',
      brand: 'VoltGlide',
      category: 'vehicles_automotive',
      unit: 'OTD cash',
      description: 'High-torque urban foldable scooter with dual disc brakes.',
      imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400',
      currentLowestPrice: 799.00,
      currentHighestPrice: 799.00,
      averagePrice: 799.00,
      previousPrice: 899.00,
      trendStatus: 'price_drop',
      priceDeltaPercent: -11.1,
      priceDeltaAmount: -100.00,
      trackedStoresCount: 1,
      totalSubmissionsCount: 1,
      tags: ['vehicles_automotive', 'scooter', 'ev'],
      isVerified: true,
      historicalPrices: [],
    };

    saveCustomProduct(carProduct);
    const retrieved = getStoredProductById('prod-custom-scooter');
    assert.ok(retrieved);
    assert.strictEqual(retrieved?.category, 'vehicles_automotive');
    assert.strictEqual(retrieved?.unit, 'OTD cash');
    assert.strictEqual(retrieved?.currentLowestPrice, 799.00);
  });

  it('awards +25 karma points for catalog discovery upon creating a product from scratch', () => {
    const initialKarma = getStoredKarma();
    const initialPoints = initialKarma.totalPoints;

    addKarmaPoints(25, 'Catalog Discovery: Created new product profile');

    const updatedKarma = getStoredKarma();
    assert.strictEqual(updatedKarma.totalPoints, initialPoints + 25);
    assert.strictEqual(updatedKarma.verifiedSubmissions, initialKarma.verifiedSubmissions + 1);
  });
});
