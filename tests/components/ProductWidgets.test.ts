import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateStorePriceVariance } from '../../src/lib/inflation.ts';
import { formatCurrency, formatDeltaPercent } from '../../src/lib/formatters.ts';
import { SEED_PRODUCTS, SEED_STORES } from '../../src/lib/mock-data.ts';

describe('Component Logic & Contracts: Product Widgets', () => {
  describe('ProductCard & Grid Filtering', () => {
    it('verifies product data fields for ProductCard rendering', () => {
      const product = SEED_PRODUCTS[0];
      assert.ok(product.id);
      assert.ok(product.name);
      assert.ok(product.brand);
      assert.ok(product.currentLowestPrice > 0);
      assert.ok(typeof product.priceDeltaPercent === 'number');
      assert.ok(product.historicalPrices.length > 0);
    });

    it('filters products by category correctly', () => {
      const groceries = SEED_PRODUCTS.filter((p) => p.category === 'groceries');
      const beverages = SEED_PRODUCTS.filter((p) => p.category === 'beverages');
      assert.ok(groceries.length > 0);
      assert.ok(beverages.length > 0);
      groceries.forEach((p) => assert.strictEqual(p.category, 'groceries'));
      beverages.forEach((p) => assert.strictEqual(p.category, 'beverages'));
    });

    it('sorts products by lowest price first', () => {
      const sorted = [...SEED_PRODUCTS].sort(
        (a, b) => a.currentLowestPrice - b.currentLowestPrice
      );
      for (let i = 1; i < sorted.length; i++) {
        assert.ok(
          sorted[i].currentLowestPrice >= sorted[i - 1].currentLowestPrice,
          'Ascending order verified'
        );
      }
    });

    it('sorts products by biggest price drop first', () => {
      const sorted = [...SEED_PRODUCTS].sort(
        (a, b) => a.priceDeltaPercent - b.priceDeltaPercent
      );
      for (let i = 1; i < sorted.length; i++) {
        assert.ok(
          sorted[i].priceDeltaPercent >= sorted[i - 1].priceDeltaPercent,
          'Biggest negative percentage drop first'
        );
      }
    });
  });

  describe('StoreComparisonTable Calculations', () => {
    it('identifies lowest price retailer and calculates variance vs lowest', () => {
      const storeInputs = [
        { storeId: 'store-1', storeName: 'Store A', price: 4.50 },
        { storeId: 'store-2', storeName: 'Store B', price: 3.99 },
        { storeId: 'store-3', storeName: 'Store C', price: 5.20 },
      ];

      const comparisons = calculateStorePriceVariance(storeInputs);
      assert.strictEqual(comparisons.length, 3);

      const cheapest = comparisons.find((c) => c.isCheapest);
      assert.ok(cheapest);
      assert.strictEqual(cheapest.storeName, 'Store B');
      assert.strictEqual(cheapest.price, 3.99);
      assert.strictEqual(cheapest.diffFromMin, 0);

      const storeA = comparisons.find((c) => c.storeId === 'store-1')!;
      assert.strictEqual(storeA.diffFromMin, 0.51);
      assert.strictEqual(storeA.diffPercentFromMin, 12.78);

      const storeC = comparisons.find((c) => c.storeId === 'store-3')!;
      assert.strictEqual(storeC.diffFromMin, 1.21);
      assert.strictEqual(storeC.diffPercentFromMin, 30.33);
    });
  });

  describe('ProvenanceTimeline Sorting & Provenance Badges', () => {
    it('sorts historical price point submissions descending by timestamp', () => {
      const product = SEED_PRODUCTS[0];
      const history = [...product.historicalPrices].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      for (let i = 1; i < history.length; i++) {
        const prevTime = new Date(history[i - 1].timestamp).getTime();
        const currTime = new Date(history[i].timestamp).getTime();
        assert.ok(prevTime >= currTime, 'Chronological descending order');
      }
    });

    it('verifies supported observation source types', () => {
      const validSources = ['photo_shelf', 'promo_pamphlet', 'receipt', 'web_crawler', 'manual'];
      SEED_PRODUCTS.forEach((p) => {
        p.historicalPrices.forEach((hp) => {
          assert.ok(
            validSources.includes(hp.sourceType),
            `Valid source type: ${hp.sourceType}`
          );
        });
      });
    });
  });
});
