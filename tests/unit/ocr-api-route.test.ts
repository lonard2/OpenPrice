import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { POST } from '../../src/app/api/ocr/parse/route.ts';

describe('API Route: POST /api/ocr/parse', () => {
  it('returns 400 when request body is not valid JSON or empty', async () => {
    const req = new Request('http://localhost:3000/api/ocr/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid-non-json',
    });

    const res = await POST(req);
    assert.strictEqual(res.status, 400);

    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert.ok(json.error.includes('Invalid JSON'));
  });

  it('returns 400 when neither imageBase64 nor imageUrl is provided', async () => {
    const req = new Request('http://localhost:3000/api/ocr/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceType: 'photo_shelf' }),
    });

    const res = await POST(req);
    assert.strictEqual(res.status, 400);

    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert.ok(json.error.includes('Either "imageBase64" or "imageUrl" must be provided'));
  });

  it('returns 400 when sourceType is missing or invalid', async () => {
    const req = new Request('http://localhost:3000/api/ocr/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl: '/samples/shelf-tag-milk.jpg',
        sourceType: 'unknown_source_type',
      }),
    });

    const res = await POST(req);
    assert.strictEqual(res.status, 400);

    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert.ok(json.error.includes('Invalid or missing "sourceType"'));
  });

  it('returns 200 with structured OcrParseResult on valid shelf photo request', async () => {
    const req = new Request('http://localhost:3000/api/ocr/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl: '/samples/shelf-tag-milk.jpg',
        sourceType: 'photo_shelf',
      }),
    });

    const res = await POST(req);
    assert.strictEqual(res.status, 200);

    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.result !== undefined);
    assert.strictEqual(json.result.sourceType, 'photo_shelf');
    assert.strictEqual(json.result.detectedStoreName, 'Target');
    assert.strictEqual(json.result.extractedItems.length, 1);
    assert.strictEqual(json.result.extractedItems[0].price, 4.89);
    assert.strictEqual(json.result.extractedItems[0].matchedProductId, 'prod-milk');
  });

  it('returns 200 with structured 4 deals on promotional flyer request', async () => {
    const req = new Request('http://localhost:3000/api/ocr/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl: '/samples/weekly-flyer-circular.jpg',
        sourceType: 'promo_pamphlet',
      }),
    });

    const res = await POST(req);
    assert.strictEqual(res.status, 200);

    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.result.sourceType, 'promo_pamphlet');
    assert.strictEqual(json.result.detectedStoreName, 'Walmart Supercenter');
    assert.strictEqual(json.result.extractedItems.length, 4);
  });

  it('returns 200 with structured 3 items on supermarket receipt request', async () => {
    const req = new Request('http://localhost:3000/api/ocr/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: 'data:image/jpeg;base64,mockReceiptData',
        sourceType: 'receipt',
      }),
    });

    const res = await POST(req);
    assert.strictEqual(res.status, 200);

    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.result.sourceType, 'receipt');
    assert.strictEqual(json.result.detectedStoreName, "Trader Joe's");
    assert.strictEqual(json.result.extractedItems.length, 3);
  });
});
