import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getConfidenceColor } from '../../src/lib/openrouter.ts';
import type { ExtractedPriceItem } from '../../src/types/ocr.ts';
import { formatCurrency } from '../../src/lib/formatters.ts';

describe('Component Logic & Contracts: BoundingBoxOverlay', () => {
  describe('Confidence Color Encoding Tiering', () => {
    it('applies Emerald Mint (#10B981) for high confidence (>= 0.90)', () => {
      const color95 = getConfidenceColor(0.95);
      assert.strictEqual(color95.stroke, '#10B981');
      assert.strictEqual(color95.badgeBg, '#10B981');
      assert.strictEqual(color95.tier, 'high');

      const color90 = getConfidenceColor(0.90);
      assert.strictEqual(color90.stroke, '#10B981');
      assert.strictEqual(color90.tier, 'high');
    });

    it('applies Amber Warning (#F59E0B) for medium confidence (0.70 - 0.89)', () => {
      const color85 = getConfidenceColor(0.85);
      assert.strictEqual(color85.stroke, '#F59E0B');
      assert.strictEqual(color85.badgeBg, '#F59E0B');
      assert.strictEqual(color85.tier, 'medium');

      const color70 = getConfidenceColor(0.70);
      assert.strictEqual(color70.stroke, '#F59E0B');
      assert.strictEqual(color70.tier, 'medium');
    });

    it('applies Coral Sunset / Rose (#F43F5E) for low confidence (< 0.70)', () => {
      const color65 = getConfidenceColor(0.65);
      assert.strictEqual(color65.stroke, '#F43F5E');
      assert.strictEqual(color65.badgeBg, '#F43F5E');
      assert.strictEqual(color65.tier, 'low');

      const color40 = getConfidenceColor(0.40);
      assert.strictEqual(color40.stroke, '#F43F5E');
      assert.strictEqual(color40.tier, 'low');
    });
  });

  describe('Bounding Box Coordinate Contracts', () => {
    it('calculates width and height from normalized percentage coordinates', () => {
      const sampleItem: ExtractedPriceItem = {
        tempId: 'test-1',
        name: 'Organic Whole Milk',
        price: 4.89,
        confidence: 0.96,
        selected: true,
        boundingBox: {
          xMin: 12.5,
          yMin: 22.0,
          xMax: 84.0,
          yMax: 68.0,
          confidence: 0.96,
        },
      };

      const box = sampleItem.boundingBox!;
      const width = box.xMax - box.xMin;
      const height = box.yMax - box.yMin;

      assert.strictEqual(width, 71.5);
      assert.strictEqual(height, 46.0);
      assert.ok(box.xMin >= 0 && box.xMax <= 100);
      assert.ok(box.yMin >= 0 && box.yMax <= 100);
    });

    it('formats price badge labels with tabular currency', () => {
      const price1 = 4.89;
      const price2 = 11.99;
      const price3 = 0.99;

      assert.strictEqual(formatCurrency(price1), '$4.89');
      assert.strictEqual(formatCurrency(price2), '$11.99');
      assert.strictEqual(formatCurrency(price3), '$0.99');
    });

    it('handles multiple non-overlapping promotional flyer items', () => {
      const deals: ExtractedPriceItem[] = [
        {
          tempId: 'd1',
          name: 'Eggs',
          price: 5.49,
          confidence: 0.92,
          selected: true,
          boundingBox: { xMin: 5.0, yMin: 8.0, xMax: 48.0, yMax: 45.0 },
        },
        {
          tempId: 'd2',
          name: 'Bread',
          price: 3.99,
          confidence: 0.89,
          selected: true,
          boundingBox: { xMin: 52.0, yMin: 8.0, xMax: 95.0, yMax: 45.0 },
        },
      ];

      // Verify deals do not collide on X axis
      assert.ok(deals[0].boundingBox!.xMax < deals[1].boundingBox!.xMin);
    });
  });
});
