import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeBoundingBox,
  matchCatalogProduct,
  normalizeExtractedItems,
  getOfflineFallbackResult,
  extractJsonFromResponse,
  parseVisionDocument,
  OCR_SYSTEM_PROMPT,
} from '../../src/lib/openrouter.ts';
import type { OcrParseRequest } from '../../src/types/ocr.ts';

describe('Unit Tests: OpenRouter Multimodal AI / OCR Vision Pipeline', () => {
  describe('normalizeBoundingBox', () => {
    it('clamps out-of-range coordinates strictly to [0.0, 100.0]', () => {
      const box = normalizeBoundingBox({
        xMin: -15.5,
        yMin: -5.0,
        xMax: 125.0,
        yMax: 110.0,
        confidence: 1.5,
      });

      assert.ok(box !== undefined);
      assert.strictEqual(box?.xMin, 0.0);
      assert.strictEqual(box?.yMin, 0.0);
      assert.strictEqual(box?.xMax, 100.0);
      assert.strictEqual(box?.yMax, 100.0);
      assert.strictEqual(box?.confidence, 1.0);
    });

    it('swaps inverted coordinates where min > max', () => {
      const box = normalizeBoundingBox({
        xMin: 80.0,
        xMax: 20.0,
        yMin: 90.0,
        yMax: 10.0,
      });

      assert.ok(box !== undefined);
      assert.strictEqual(box?.xMin, 20.0);
      assert.strictEqual(box?.xMax, 80.0);
      assert.strictEqual(box?.yMin, 10.0);
      assert.strictEqual(box?.yMax, 90.0);
    });

    it('enforces minimum width and height for point/collapsed boxes', () => {
      const box = normalizeBoundingBox({
        xMin: 50.0,
        xMax: 50.2,
        yMin: 30.0,
        yMax: 30.1,
      });

      assert.ok(box !== undefined);
      assert.ok((box?.xMax ?? 0) - (box?.xMin ?? 0) >= 1.0);
      assert.ok((box?.yMax ?? 0) - (box?.yMin ?? 0) >= 1.0);
    });

    it('returns undefined for null or undefined input', () => {
      assert.strictEqual(normalizeBoundingBox(null), undefined);
      assert.strictEqual(normalizeBoundingBox(undefined), undefined);
    });
  });

  describe('matchCatalogProduct', () => {
    it('matches exact and token product names from seed catalog', () => {
      const milkMatch = matchCatalogProduct('Horizon Organic Whole Milk 1 Gal');
      assert.strictEqual(milkMatch, 'prod-milk');

      const eggsMatch = matchCatalogProduct('Vital Farms Eggs Pasture Raised', 'Vital Farms');
      assert.strictEqual(eggsMatch, 'prod-eggs');

      const coffeeMatch = matchCatalogProduct("Peet's Major Dickason Dark Roast");
      assert.strictEqual(coffeeMatch, 'prod-coffee');
    });

    it('returns undefined when no reasonable catalog match exists', () => {
      const noMatch = matchCatalogProduct('Xylophone Quantum Antigravity Widget');
      assert.strictEqual(noMatch, undefined);
    });
  });

  describe('normalizeExtractedItems', () => {
    it('sanitizes categories, prices, and bounding boxes across items', () => {
      const raw = [
        {
          tempId: 'test-1',
          name: '  Organic Gala Apples  ',
          category: 'GROCERIES',
          price: '3.49',
          originalPrice: '4.29',
          confidence: 0.95,
          boundingBox: { xMin: 10, yMin: 20, xMax: 80, yMax: 60 },
        },
        {
          tempId: 'test-2',
          name: 'Invalid Category Item',
          category: 'invalid_cat',
          price: -5,
          confidence: 0.5,
        },
      ];

      const normalized = normalizeExtractedItems(raw, 'Target');
      assert.strictEqual(normalized.length, 2);

      // Item 1
      assert.strictEqual(normalized[0].name, 'Organic Gala Apples');
      assert.strictEqual(normalized[0].category, 'groceries');
      assert.strictEqual(normalized[0].price, 3.49);
      assert.strictEqual(normalized[0].originalPrice, 4.29);
      assert.strictEqual(normalized[0].confidence, 0.95);
      assert.strictEqual(normalized[0].storeName, 'Target');
      assert.strictEqual(normalized[0].selected, true);

      // Item 2 (fallback category & sanitized non-negative price)
      assert.strictEqual(normalized[1].category, 'groceries');
      assert.strictEqual(normalized[1].price, 0.01);
      assert.strictEqual(normalized[1].confidence, 0.5);
    });
  });

  describe('getOfflineFallbackResult', () => {
    it('returns ground-truth shelf tag data for photo_shelf', () => {
      const req: OcrParseRequest = {
        imageUrl: '/samples/shelf-tag-milk.jpg',
        sourceType: 'photo_shelf',
      };
      const res = getOfflineFallbackResult(req);

      assert.strictEqual(res.sourceType, 'photo_shelf');
      assert.strictEqual(res.detectedStoreName, 'Target');
      assert.strictEqual(res.extractedItems.length, 1);
      assert.strictEqual(res.extractedItems[0].price, 4.89);
      assert.strictEqual(res.extractedItems[0].matchedProductId, 'prod-milk');
      assert.ok(res.extractedItems[0].boundingBox !== undefined);
      assert.strictEqual(res.extractedItems[0].boundingBox?.xMin, 12.5);
    });

    it('returns 4 promotional deals for promo_pamphlet', () => {
      const req: OcrParseRequest = {
        imageUrl: '/samples/weekly-flyer-circular.jpg',
        sourceType: 'promo_pamphlet',
      };
      const res = getOfflineFallbackResult(req);

      assert.strictEqual(res.sourceType, 'promo_pamphlet');
      assert.strictEqual(res.detectedStoreName, 'Walmart Supercenter');
      assert.strictEqual(res.extractedItems.length, 4);
      assert.strictEqual(res.extractedItems[0].name, 'Vital Farms Pasture-Raised Eggs');
      assert.strictEqual(res.extractedItems[0].price, 5.49);
      assert.strictEqual(res.extractedItems[1].price, 3.99);
      assert.strictEqual(res.extractedItems[2].price, 11.99);
      assert.strictEqual(res.extractedItems[3].price, 4.29);
    });

    it('returns itemized grocery receipt for receipt', () => {
      const req: OcrParseRequest = {
        imageUrl: '/samples/grocery-receipt-trader-joes.jpg',
        sourceType: 'receipt',
      };
      const res = getOfflineFallbackResult(req);

      assert.strictEqual(res.sourceType, 'receipt');
      assert.strictEqual(res.detectedStoreName, "Trader Joe's");
      assert.strictEqual(res.extractedItems.length, 3);
      assert.strictEqual(res.extractedItems[0].name, 'Honeycrisp Apples');
      assert.strictEqual(res.extractedItems[1].name, "Peet's Coffee Beans 12oz");
      assert.strictEqual(res.extractedItems[2].name, 'Method Dish Soap 28oz');
    });
  });

  describe('extractJsonFromResponse', () => {
    it('parses raw JSON object string', () => {
      const raw = '{"detectedStoreName":"Costco","extractedItems":[]}';
      const parsed = extractJsonFromResponse(raw);
      assert.strictEqual(parsed.detectedStoreName, 'Costco');
    });

    it('strips ```json markdown fences', () => {
      const fenced = '```json\n{\n  "detectedStoreName": "Safeway",\n  "extractedItems": []\n}\n```';
      const parsed = extractJsonFromResponse(fenced);
      assert.strictEqual(parsed.detectedStoreName, 'Safeway');
    });

    it('strips generic ``` code fences', () => {
      const fenced = '```\n{\n  "detectedStoreName": "Kroger"\n}\n```';
      const parsed = extractJsonFromResponse(fenced);
      assert.strictEqual(parsed.detectedStoreName, 'Kroger');
    });

    it('extracts embedded JSON from surrounding text', () => {
      const text = 'Here is the analysis:\n\n{"detectedStoreName":"Whole Foods"}\n\nHope this helps!';
      const parsed = extractJsonFromResponse(text);
      assert.strictEqual(parsed.detectedStoreName, 'Whole Foods');
    });

    it('throws descriptive error on invalid content', () => {
      assert.throws(() => extractJsonFromResponse('This is not json at all'));
      assert.throws(() => extractJsonFromResponse(''));
    });
  });

  describe('parseVisionDocument', () => {
    it('uses deterministic offline fallback when no API key is provided', async () => {
      const req: OcrParseRequest = {
        imageUrl: '/samples/shelf-tag-milk.jpg',
        sourceType: 'photo_shelf',
      };
      const response = await parseVisionDocument(req, { apiKey: '' });

      assert.strictEqual(response.success, true);
      assert.strictEqual(response.source, 'fallback');
      assert.strictEqual(response.result.sourceType, 'photo_shelf');
      assert.strictEqual(response.result.extractedItems.length, 1);
    });

    it('throws error when neither imageBase64 nor imageUrl is given', async () => {
      const req: OcrParseRequest = {
        sourceType: 'photo_shelf',
      };
      await assert.rejects(async () => {
        await parseVisionDocument(req);
      }, /Either imageBase64 or imageUrl must be provided/);
    });

    it('verifies system prompt structure contains required constraints', () => {
      assert.ok(OCR_SYSTEM_PROMPT.includes('xMin'));
      assert.ok(OCR_SYSTEM_PROMPT.includes('yMin'));
      assert.ok(OCR_SYSTEM_PROMPT.includes('xMax'));
      assert.ok(OCR_SYSTEM_PROMPT.includes('yMax'));
      assert.ok(OCR_SYSTEM_PROMPT.includes('ProductCategory'));
      assert.ok(OCR_SYSTEM_PROMPT.includes('0.0 to 100.0'));
    });
  });
});
