import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateInflationIndex } from '../../src/lib/inflation.ts';
import { SEED_PRODUCTS, CATEGORY_METADATA } from '../../src/lib/mock-data.ts';

describe('Component Logic & Contracts: Telemetry Visualizations', () => {
  describe('PriceHistoryChart Time Series & Cutoff Calculation', () => {
    it('filters time series prices by timeframe correctly (7D, 1M, 3M, 1Y, ALL)', () => {
      const product = SEED_PRODUCTS[0];
      const now = Date.now();

      const timeframes = [
        { id: '7D', days: 7 },
        { id: '1M', days: 30 },
        { id: '3M', days: 90 },
        { id: '6M', days: 180 },
        { id: '1Y', days: 365 },
      ];

      timeframes.forEach((tf) => {
        const cutoff = now - tf.days * 24 * 60 * 60 * 1000;
        const filtered = product.historicalPrices.filter(
          (p) => new Date(p.timestamp).getTime() >= cutoff
        );
        assert.ok(Array.isArray(filtered));
        filtered.forEach((p) => {
          assert.ok(
            new Date(p.timestamp).getTime() >= cutoff,
            `Point timestamp within ${tf.id} window`
          );
        });
      });
    });

    it('identifies lowest price benchmark and rolling average benchmark', () => {
      const product = SEED_PRODUCTS[0];
      const prices = product.historicalPrices.map((p) => p.price);
      const minPrice = Math.min(...prices);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

      assert.ok(minPrice > 0);
      assert.ok(avgPrice >= minPrice);
      assert.ok(minPrice <= product.currentHighestPrice);
    });
  });

  describe('Sparkline SVG Path Mathematics', () => {
    it('computes trend line direction (Emerald for drop, Rose for hike, Slate for stable)', () => {
      const dropSeries = [10.0, 9.5, 9.0, 8.5];
      const hikeSeries = [5.0, 5.5, 6.0, 6.5];
      const flatSeries = [4.0, 4.0, 4.0, 4.0];

      const getSparklineColor = (data: number[]) => {
        const delta = data[data.length - 1] - data[0];
        if (delta < -0.001) return '#10B981'; // emerald
        if (delta > 0.001) return '#F43F5E'; // rose
        return '#64748B'; // slate
      };

      assert.strictEqual(getSparklineColor(dropSeries), '#10B981');
      assert.strictEqual(getSparklineColor(hikeSeries), '#F43F5E');
      assert.strictEqual(getSparklineColor(flatSeries), '#64748B');
    });

    it('normalizes SVG coordinates within bounding dimensions without NaN', () => {
      const values = [3.5, 4.2, 3.8, 3.2, 4.5];
      const width = 100;
      const height = 32;
      const padding = 4;
      const usableWidth = width - padding * 2;
      const usableHeight = height - padding * 2;

      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min || 1;

      const points = values.map((val, idx) => {
        const x = padding + (idx / (values.length - 1)) * usableWidth;
        const y = padding + (1 - (val - min) / range) * usableHeight;
        return { x, y };
      });

      assert.strictEqual(points.length, values.length);
      points.forEach((pt) => {
        assert.ok(!isNaN(pt.x) && isFinite(pt.x));
        assert.ok(!isNaN(pt.y) && isFinite(pt.y));
        assert.ok(pt.x >= padding && pt.x <= width - padding);
        assert.ok(pt.y >= padding && pt.y <= height - padding);
      });
    });
  });

  describe('InflationRadar 6-Axis Category Barometer', () => {
    it('verifies category basket weighting and Laspeyres inflation calculation', () => {
      const currentPrices: Record<string, number> = {
        'groceries:milk': 3.79,
        'groceries:eggs': 4.29,
        'beverages:coffee': 12.99,
        'household:detergent': 14.50,
      };
      const basePrices: Record<string, number> = {
        'groceries:milk': 3.49,
        'groceries:eggs': 3.99,
        'beverages:coffee': 11.99,
        'household:detergent': 13.99,
      };
      const weights: Record<string, number> = {
        'groceries:milk': 0.20,
        'groceries:eggs': 0.15,
        'beverages:coffee': 0.15,
        'household:detergent': 0.15,
      };

      const report = calculateInflationIndex(currentPrices, basePrices, weights);
      assert.ok(report.indexValue > 100.0, 'Inflation index above baseline 100.0');
      assert.ok(report.inflationRatePercent > 0);
      assert.ok(report.categoryBreakdown.groceries !== undefined);
      assert.ok(report.categoryBreakdown.beverages !== undefined);
      assert.ok(report.categoryBreakdown.household !== undefined);
    });

    it('verifies all core product categories defined in taxonomy', () => {
      const categories = Object.keys(CATEGORY_METADATA);
      assert.ok(categories.includes('groceries'));
      assert.ok(categories.includes('beverages'));
      assert.ok(categories.includes('household'));
      assert.ok(categories.includes('pharmacy'));
      assert.ok(categories.includes('electronics'));
      assert.ok(categories.includes('apparel'));
      assert.ok(categories.includes('services'));
    });
  });
});
