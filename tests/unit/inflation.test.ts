import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePriceDelta,
  calculateInflationIndex,
  calculateStorePriceVariance,
  detectPriceOutlier,
  calculateStandardDeviation,
} from '../../src/lib/inflation.ts';

describe('Unit Tests: inflation.ts', () => {
  describe('calculatePriceDelta', () => {
    it('calculates price decrease correctly (savings / price drop)', () => {
      const result = calculatePriceDelta(3.99, 4.99);
      assert.strictEqual(result.amount, -1.0);
      assert.strictEqual(result.percent, -20.04);
      assert.strictEqual(result.status, 'price_drop');
    });

    it('calculates price increase correctly (hike / inflation)', () => {
      const result = calculatePriceDelta(5.5, 5.0);
      assert.strictEqual(result.amount, 0.5);
      assert.strictEqual(result.percent, 10.0);
      assert.strictEqual(result.status, 'price_hike');
    });

    it('calculates unchanged price correctly (stable)', () => {
      const result = calculatePriceDelta(4.0, 4.0);
      assert.strictEqual(result.amount, 0.0);
      assert.strictEqual(result.percent, 0.0);
      assert.strictEqual(result.status, 'stable');
    });

    it('avoids division by zero when previous price is 0', () => {
      const result = calculatePriceDelta(5.0, 0);
      assert.strictEqual(result.amount, 5.0);
      assert.strictEqual(result.percent, 0);
      assert.strictEqual(result.status, 'price_hike');
    });

    it('handles floating point precision cleanly without arithmetic artifacts', () => {
      const result = calculatePriceDelta(0.3, 0.1);
      assert.strictEqual(result.amount, 0.2);
      assert.strictEqual(result.percent, 200.0);
    });

    it('handles extreme magnitude price changes', () => {
      const result = calculatePriceDelta(1000.0, 10.0);
      assert.strictEqual(result.amount, 990.0);
      assert.strictEqual(result.percent, 9900.0);
      assert.strictEqual(result.status, 'price_hike');
    });

    it('handles NaN inputs safely', () => {
      const result = calculatePriceDelta(NaN, 5.0);
      assert.strictEqual(result.amount, 0);
      assert.strictEqual(result.percent, 0);
      assert.strictEqual(result.status, 'stable');
    });
  });

  describe('calculateInflationIndex (Laspeyres Rolling Basket)', () => {
    it('returns base index 100.0 and 0.0% inflation rate when prices are unchanged', () => {
      const current = { 'groceries:milk': 5.0, 'groceries:bread': 4.0, 'household:soap': 3.0 };
      const base = { 'groceries:milk': 5.0, 'groceries:bread': 4.0, 'household:soap': 3.0 };
      const report = calculateInflationIndex(current, base);

      assert.strictEqual(report.indexValue, 100.0);
      assert.strictEqual(report.baseIndex, 100.0);
      assert.strictEqual(report.inflationRatePercent, 0.0);
      assert.strictEqual(report.itemsCount, 3);
    });

    it('calculates 100% inflation (index 200.0) when all prices double', () => {
      const base = { 'groceries:milk': 5.0, 'groceries:bread': 4.0 };
      const current = { 'groceries:milk': 10.0, 'groceries:bread': 8.0 };
      const report = calculateInflationIndex(current, base);

      assert.strictEqual(report.indexValue, 200.0);
      assert.strictEqual(report.inflationRatePercent, 100.0);
    });

    it('applies basket weights proportionally', () => {
      // Milk has weight 4, bread has weight 1
      const base = { 'groceries:milk': 10.0, 'groceries:bread': 10.0 };
      // Milk stays at 10, Bread triples to 30
      const current = { 'groceries:milk': 10.0, 'groceries:bread': 30.0 };
      const weights = { 'groceries:milk': 4.0, 'groceries:bread': 1.0 };

      // Base sum: 10*4 + 10*1 = 50
      // Current sum: 10*4 + 30*1 = 70
      // Index: (70 / 50) * 100 = 140.0 (+40%)
      const report = calculateInflationIndex(current, base, weights);
      assert.strictEqual(report.indexValue, 140.0);
      assert.strictEqual(report.inflationRatePercent, 40.0);
    });

    it('computes category breakdowns correctly', () => {
      const base = {
        'groceries:milk': 5.0,
        'groceries:bread': 5.0,
        'electronics:cable': 20.0,
      };
      const current = {
        'groceries:milk': 6.0, // +20%
        'groceries:bread': 6.0, // +20%
        'electronics:cable': 18.0, // -10%
      };
      const report = calculateInflationIndex(current, base);

      assert.strictEqual(report.categoryBreakdown['groceries'], 20.0);
      assert.strictEqual(report.categoryBreakdown['electronics'], -10.0);
    });

    it('handles empty or invalid basket safely without division by zero', () => {
      const report = calculateInflationIndex({}, {});
      assert.strictEqual(report.indexValue, 100.0);
      assert.strictEqual(report.inflationRatePercent, 0.0);
      assert.strictEqual(report.itemsCount, 0);
    });
  });

  describe('calculateStorePriceVariance', () => {
    it('identifies cheapest retailer and calculates price variance', () => {
      const storePrices = [
        { storeId: 'target', storeName: 'Target', price: 4.89 },
        { storeId: 'walmart', storeName: 'Walmart', price: 4.49 }, // Cheapest
        { storeId: 'wholefoods', storeName: 'Whole Foods', price: 5.99 },
      ];

      const comparison = calculateStorePriceVariance(storePrices);
      assert.strictEqual(comparison.length, 3);

      const walmart = comparison.find((c) => c.storeId === 'walmart')!;
      assert.strictEqual(walmart.isCheapest, true);
      assert.strictEqual(walmart.diffFromMin, 0.0);
      assert.strictEqual(walmart.diffPercentFromMin, 0.0);

      const wholeFoods = comparison.find((c) => c.storeId === 'wholefoods')!;
      assert.strictEqual(wholeFoods.isCheapest, false);
      assert.strictEqual(wholeFoods.diffFromMin, 1.5);
      assert.strictEqual(wholeFoods.diffPercentFromMin, 33.41);
    });

    it('handles single store comparison', () => {
      const storePrices = [{ storeId: 'target', storeName: 'Target', price: 10.0 }];
      const comparison = calculateStorePriceVariance(storePrices);
      assert.strictEqual(comparison.length, 1);
      assert.strictEqual(comparison[0].isCheapest, true);
      assert.strictEqual(comparison[0].diffFromMin, 0.0);
      assert.strictEqual(comparison[0].diffFromAverage, 0.0);
    });

    it('handles multiple stores with identical minimum prices', () => {
      const storePrices = [
        { storeId: 's1', storeName: 'Store 1', price: 5.0 },
        { storeId: 's2', storeName: 'Store 2', price: 5.0 },
        { storeId: 's3', storeName: 'Store 3', price: 6.0 },
      ];
      const comparison = calculateStorePriceVariance(storePrices);
      const s1 = comparison.find((c) => c.storeId === 's1')!;
      const s2 = comparison.find((c) => c.storeId === 's2')!;
      assert.strictEqual(s1.isCheapest, true);
      assert.strictEqual(s2.isCheapest, true);
    });

    it('handles empty input array', () => {
      const comparison = calculateStorePriceVariance([]);
      assert.deepStrictEqual(comparison, []);
    });
  });

  describe('calculateStandardDeviation & detectPriceOutlier (>3σ Bessel)', () => {
    it('calculates sample mean and Bessel-corrected sample standard deviation (N-1)', () => {
      // Sample: [10, 12, 14, 16, 18], mean = 14
      // Variances: (16 + 4 + 0 + 4 + 16) / 4 = 40 / 4 = 10
      // StdDev: sqrt(10) = 3.162277...
      const stats = calculateStandardDeviation([10, 12, 14, 16, 18]);
      assert.strictEqual(stats.mean, 14);
      assert.strictEqual(Number(stats.stdDev.toFixed(2)), 3.16);
      assert.strictEqual(stats.sampleCount, 5);
    });

    it('does not flag normal prices within 3-sigma threshold', () => {
      const historical = [5.0, 5.2, 4.9, 5.1, 5.0, 5.15, 4.95, 5.05];
      const result = detectPriceOutlier(5.3, historical, 3.0);
      assert.strictEqual(result.isOutlier, false);
      assert.ok(result.zScore < 3.0);
      assert.strictEqual(result.sampleSize, 8);
    });

    it('flags extreme price spikes with Z > 3.0 as outliers', () => {
      const historical = [5.0, 5.2, 4.9, 5.1, 5.0, 5.15, 4.95, 5.05];
      // Massive spike to $25.00
      const result = detectPriceOutlier(25.0, historical, 3.0);
      assert.strictEqual(result.isOutlier, true);
      assert.ok(result.zScore > 3.0);
      assert.strictEqual(result.originalPrice, 25.0);
    });

    it('flags extreme price drops (e.g. $0.10 typo) with Z > 3.0 as outliers', () => {
      const historical = [50.0, 52.0, 48.0, 51.0, 49.0, 50.5];
      // Extreme drop to $0.50
      const result = detectPriceOutlier(0.5, historical, 3.0);
      assert.strictEqual(result.isOutlier, true);
      assert.ok(result.zScore > 3.0);
    });

    it('does not flag outliers when sample size is insufficient (N < 2)', () => {
      const result = detectPriceOutlier(100.0, [5.0], 3.0);
      assert.strictEqual(result.isOutlier, false);
      assert.strictEqual(result.sampleSize, 1);
    });

    it('handles identical historical prices (zero standard deviation)', () => {
      const historical = [5.0, 5.0, 5.0, 5.0];
      const normalResult = detectPriceOutlier(5.0, historical, 3.0);
      assert.strictEqual(normalResult.isOutlier, false);

      const diffResult = detectPriceOutlier(15.0, historical, 3.0);
      assert.strictEqual(diffResult.isOutlier, true);
    });

    it('respects custom threshold sigma values (e.g. 2.0 or 4.0)', () => {
      const historical = [10.0, 12.0, 11.0, 10.5, 11.5]; // stdDev ~ 0.79
      // Price 13.0 -> Z = (13 - 11) / 0.79 = 2.53
      const reportStrict = detectPriceOutlier(13.0, historical, 2.0); // Z > 2.0 -> outlier
      assert.strictEqual(reportStrict.isOutlier, true);

      const reportLenient = detectPriceOutlier(13.0, historical, 4.0); // Z < 4.0 -> not outlier
      assert.strictEqual(reportLenient.isOutlier, false);
    });
  });
});
