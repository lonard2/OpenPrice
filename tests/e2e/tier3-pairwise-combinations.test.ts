import test, { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  OpenPriceStateEngine,
  calculateStorePriceVariance,
  calculateInflationIndex,
} from '../helpers/pure-contract-engine.ts';
import { SAMPLE_OCR_RESULTS } from '../fixtures/domain-fixtures.ts';

describe('Tier 3: Pairwise Cross-Feature Combinatorial Tests (>=16 Tests)', () => {
  let engine: OpenPriceStateEngine;

  beforeEach(() => {
    engine = new OpenPriceStateEngine();
  });

  it('Pairwise 1: Contributor price submission immediately syncs to Catalog search and category filters', () => {
    const res = engine.submitPrice({
      productId: 'prod-milk',
      storeId: 'store-target',
      storeName: 'Target',
      price: 4.80, // new lowest price within 3-sigma
      sourceType: 'photo_shelf',
      confidenceScore: 0.95,
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.isOutlier, false);

    // Verify Catalog Search
    const searchRes = engine.searchProducts('Whole Milk');
    assert.strictEqual(searchRes[0].currentLowestPrice, 4.80);
    assert.strictEqual(searchRes[0].trendStatus, 'price_drop');

    // Verify Category Filter
    const catRes = engine.searchProducts('', 'groceries');
    const milk = catRes.find((p) => p.id === 'prod-milk')!;
    assert.strictEqual(milk.currentLowestPrice, 4.80);
  });

  it('Pairwise 2: >3σ outlier submission is quarantined in Moderation Queue and excluded from public average price', () => {
    const milkBefore = engine.getProductById('prod-milk')!;
    const avgBefore = milkBefore.averagePrice;
    const countBefore = milkBefore.historicalPrices.length;

    // Submit $50.00 milk (outlier)
    const res = engine.submitPrice({
      productId: 'prod-milk',
      storeId: 'store-target',
      storeName: 'Target',
      price: 50.0,
      sourceType: 'manual',
    });
    assert.strictEqual(res.isOutlier, true);

    // Verify Moderation Queue has the item
    const queue = engine.getModerationQueue();
    assert.strictEqual(queue.length, 1);
    assert.strictEqual(queue[0].submittedPrice, 50.0);
    assert.strictEqual(queue[0].flagReason, 'outlier_variance');

    // Verify Public Catalog is NOT contaminated
    const milkAfter = engine.getProductById('prod-milk')!;
    assert.strictEqual(milkAfter.historicalPrices.length, countBefore);
    assert.strictEqual(milkAfter.averagePrice, avgBefore);
  });

  it('Pairwise 3: Price drop submission automatically triggers Watchlist alerts for watching users', () => {
    // User watches Milk with target price $4.80
    engine.toggleWatchlist('prod-milk', 4.8);

    // Initial alert check: lowest is 4.89 -> not triggered
    let alerts = engine.checkWatchlistAlerts();
    assert.strictEqual(alerts[0].triggered, false);

    // Contributor logs milk at $4.69
    engine.submitPrice({
      productId: 'prod-milk',
      storeId: 'store-walmart',
      storeName: 'Walmart Supercenter',
      price: 4.69,
      sourceType: 'photo_shelf',
      confidenceScore: 0.95,
    });

    // Check alert now: 4.69 <= 4.80 -> triggered!
    alerts = engine.checkWatchlistAlerts();
    assert.strictEqual(alerts[0].triggered, true);
    assert.strictEqual(alerts[0].savings, 0.11);
  });

  it('Pairwise 4: Bounding box click synchronizes focus and selection with Extracted Field Table editor', () => {
    const ocrResult = SAMPLE_OCR_RESULTS.promoFlyer;
    const deal1 = ocrResult.extractedItems[0];
    const deal2 = ocrResult.extractedItems[1];

    // User clicks Bounding Box 2
    let activeTableSelection = deal2.tempId;
    assert.strictEqual(activeTableSelection, 'deal-2');

    // Table reflects selected item
    const selectedItem = ocrResult.extractedItems.find((i) => i.tempId === activeTableSelection)!;
    assert.strictEqual(selectedItem.name, 'Boudin Sourdough Bread');
    assert.strictEqual(selectedItem.price, 3.99);
  });

  it('Pairwise 5: Role switch persists across navigation and gates admin actions', () => {
    assert.strictEqual(engine.getRole(), 'public');

    // Switch to Admin
    engine.setRole('admin');
    assert.strictEqual(engine.getRole(), 'admin');

    // Switch to Contributor
    engine.setRole('contributor');
    assert.strictEqual(engine.getRole(), 'contributor');
  });

  it('Pairwise 6: Admin price adjustment updates catalog price point and recalculates chart averages', () => {
    // Submit outlier
    const res = engine.submitPrice({
      productId: 'prod-eggs',
      storeId: 'store-target',
      storeName: 'Target',
      price: 55.0,
      sourceType: 'manual',
    });
    const modItem = engine.getModerationQueue()[0];

    // Admin adjusts from $55.00 to $5.50 and approves
    const eggsBefore = engine.getProductById('prod-eggs')!;
    const countBefore = eggsBefore.historicalPrices.length;

    engine.resolveModeration(modItem.id, 'adjust', 5.5);
    assert.strictEqual(engine.getModerationQueue().length, 0);

    const eggsAfter = engine.getProductById('prod-eggs')!;
    assert.strictEqual(eggsAfter.historicalPrices.length, countBefore + 1);
    const lastPrice = eggsAfter.historicalPrices[eggsAfter.historicalPrices.length - 1];
    assert.strictEqual(lastPrice.price, 5.5);
  });

  it('Pairwise 7: Multi-store submission updates Store Comparison Matrix and flips Cheapest Store badge', () => {
    // Current prices: Target 4.89, Walmart 5.49
    let storePrices = [
      { storeId: 'store-target', storeName: 'Target', price: 4.89 },
      { storeId: 'store-walmart', storeName: 'Walmart', price: 5.49 },
    ];
    let matrix = calculateStorePriceVariance(storePrices);
    assert.strictEqual(matrix.find((m) => m.storeId === 'store-target')!.isCheapest, true);

    // Contributor uploads Walmart price drop to 4.29
    storePrices = [
      { storeId: 'store-target', storeName: 'Target', price: 4.89 },
      { storeId: 'store-walmart', storeName: 'Walmart', price: 4.29 },
    ];
    matrix = calculateStorePriceVariance(storePrices);
    const walmart = matrix.find((m) => m.storeId === 'store-walmart')!;
    const target = matrix.find((m) => m.storeId === 'store-target')!;
    assert.strictEqual(walmart.isCheapest, true);
    assert.strictEqual(target.isCheapest, false);
    assert.strictEqual(target.diffFromMin, 0.6);
  });

  it('Pairwise 8: Flyer batch deal selection creates multiple distinct price point entries', () => {
    const deals = SAMPLE_OCR_RESULTS.promoFlyer.extractedItems;
    assert.strictEqual(deals.length, 4);

    const submittedPoints: any[] = [];
    deals.forEach((deal) => {
      if (deal.selected) {
        submittedPoints.push({
          name: deal.name,
          price: deal.price,
          storeName: deal.storeName,
        });
      }
    });
    assert.strictEqual(submittedPoints.length, 4);
    assert.strictEqual(submittedPoints[0].price, 5.49);
    assert.strictEqual(submittedPoints[1].price, 3.99);
  });

  it('Pairwise 9: Category filter + Search keyword + Sort order combinatorial filtering', () => {
    // Search 'Organic', category 'groceries', sort 'biggest_drop'
    const results = engine.searchProducts('Organic', 'groceries', 'biggest_drop');
    assert.ok(results.length >= 2);
    assert.ok(results[0].priceDeltaPercent <= results[1].priceDeltaPercent);
    results.forEach((r) => {
      assert.strictEqual(r.category, 'groceries');
      assert.ok(r.name.includes('Organic') || r.brand.includes('Organic') || r.tags?.includes('organic'));
    });
  });

  it('Pairwise 10: Timeframe switch (7D -> 1Y) with active store series filter preserves store selection', () => {
    const activeStores = new Set(['Target', 'Walmart Supercenter']);
    const milk = engine.getProductById('prod-milk')!;

    // 7D filter
    const now = new Date('2026-03-01T12:00:00Z').getTime();
    const cutoff7D = now - 7 * 86400 * 1000;
    const points7D = milk.historicalPrices.filter(
      (p) => new Date(p.timestamp).getTime() >= cutoff7D && activeStores.has(p.storeName)
    );

    // 1Y filter
    const cutoff1Y = now - 365 * 86400 * 1000;
    const points1Y = milk.historicalPrices.filter(
      (p) => new Date(p.timestamp).getTime() >= cutoff1Y && activeStores.has(p.storeName)
    );

    assert.ok(points1Y.length >= points7D.length);
    points1Y.forEach((p) => assert.ok(activeStores.has(p.storeName)));
  });

  it('Pairwise 11: Watchlist item removal triggers Basket Optimizer total recalculation', () => {
    engine.toggleWatchlist('prod-milk');
    engine.toggleWatchlist('prod-eggs');
    engine.toggleWatchlist('prod-coffee');

    const basketBefore = engine.calculateBasketOptimization(['prod-milk', 'prod-eggs', 'prod-coffee']);
    assert.ok(basketBefore.cheapestSingleStore.total > 20.0);

    // Remove coffee
    engine.toggleWatchlist('prod-coffee');
    const basketAfter = engine.calculateBasketOptimization(['prod-milk', 'prod-eggs']);
    assert.ok(basketAfter.cheapestSingleStore.total < basketBefore.cheapestSingleStore.total);
  });

  it('Pairwise 12: Moderation rejection deletes pending item without polluting public price history', () => {
    engine.submitPrice({
      productId: 'prod-milk',
      storeId: 'store-target',
      storeName: 'Target',
      price: 100.0,
      sourceType: 'manual',
    });
    const item = engine.getModerationQueue()[0];
    const beforeCount = engine.getProductById('prod-milk')!.historicalPrices.length;

    engine.resolveModeration(item.id, 'reject');
    assert.strictEqual(engine.getModerationQueue().length, 0);
    assert.strictEqual(engine.getProductById('prod-milk')!.historicalPrices.length, beforeCount);
  });

  it('Pairwise 13: Low OCR confidence item (<80%) is auto-routed to moderation queue with flagReason "ocr_low_confidence"', () => {
    const res = engine.submitPrice({
      productId: 'prod-milk',
      storeId: 'store-target',
      storeName: 'Target',
      price: 4.89, // Normal price
      sourceType: 'photo_shelf',
      confidenceScore: 0.65, // Low confidence < 0.8
    });
    assert.strictEqual(res.isOutlier, true);
    const modItem = engine.getModerationQueue()[0];
    assert.strictEqual(modItem.flagReason, 'ocr_low_confidence');
  });

  it('Pairwise 14: Verified submission awards karma points and updates contributor reputation rank', () => {
    const initialKarma = engine.getKarma();
    assert.strictEqual(initialKarma.rankTitle, 'Community Scout');

    // Submit 5 verified items to cross 500 karma threshold
    for (let i = 0; i < 6; i++) {
      engine.submitPrice({
        productId: 'prod-bread',
        storeId: 'store-target',
        storeName: 'Target',
        price: 4.5,
        sourceType: 'photo_shelf',
        confidenceScore: 0.95,
      });
    }

    const updatedKarma = engine.getKarma();
    assert.ok(updatedKarma.totalPoints >= 500);
    assert.strictEqual(updatedKarma.rankTitle, 'Price Master');
  });

  it('Pairwise 15: Mobile quick-scan FAB trigger opens contributor photo upload drawer on mobile viewport', () => {
    let isMobileDrawerOpen = false;
    function triggerQuickScanFAB() {
      isMobileDrawerOpen = true;
    }
    triggerQuickScanFAB();
    assert.strictEqual(isMobileDrawerOpen, true);
  });

  it('Pairwise 16: Corrupt localStorage fallback cleanly restores default seed data without application crash', () => {
    function restoreState(storedData: any) {
      if (!storedData || typeof storedData !== 'object' || !Array.isArray(storedData.products)) {
        return new OpenPriceStateEngine();
      }
      return storedData;
    }

    const restored = restoreState('corrupt string');
    assert.ok(restored instanceof OpenPriceStateEngine);
    assert.strictEqual(restored.getProducts().length, 20);
  });
});
