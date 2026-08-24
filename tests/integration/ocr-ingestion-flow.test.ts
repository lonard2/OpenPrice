import test, { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { parseVisionDocument, getOfflineFallbackResult } from '../../src/lib/openrouter.ts';
import {
  getStoredProducts,
  getStoredProductById,
  savePriceSubmission,
  getModerationQueue,
  resolveModerationItem,
  getStoredKarma,
} from '../../src/lib/storage.ts';
import type { ExtractedPriceItem, OcrParseRequest } from '../../src/types/index.ts';

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

describe('Integration Flow: Multimodal OCR Ingestion Pipeline', () => {
  beforeEach(() => {
    (globalThis as any).localStorage = new MockLocalStorage();
    (globalThis as any).window = {
      localStorage: (globalThis as any).localStorage,
      dispatchEvent: () => true,
      addEventListener: () => {},
      removeEventListener: () => {},
    };
  });

  it('Step 1: Parses shelf photo and produces structured extracted items with catalog auto-match', async () => {
    const request: OcrParseRequest = {
      imageUrl: '/samples/shelf-tag-milk.jpg',
      sourceType: 'photo_shelf',
    };

    const response = await parseVisionDocument(request, { apiKey: '' });
    assert.strictEqual(response.success, true);
    assert.strictEqual(response.result.sourceType, 'photo_shelf');
    assert.strictEqual(response.result.detectedStoreName, 'Target');
    assert.strictEqual(response.result.extractedItems.length, 1);

    const milkItem = response.result.extractedItems[0];
    assert.strictEqual(milkItem.name, 'Horizon Organic Whole Milk');
    assert.strictEqual(milkItem.price, 4.89);
    assert.strictEqual(milkItem.originalPrice, 5.49);
    assert.strictEqual(milkItem.matchedProductId, 'prod-milk');
    assert.ok(milkItem.confidence >= 0.90, 'High confidence shelf tag');
    assert.ok(milkItem.boundingBox !== undefined);
  });

  it('Step 2: Simulates field editing in ExtractedFieldEditor', () => {
    const rawResult = getOfflineFallbackResult({
      imageUrl: '/samples/shelf-tag-milk.jpg',
      sourceType: 'photo_shelf',
    });

    const items: ExtractedPriceItem[] = rawResult.extractedItems;
    assert.strictEqual(items.length, 1);

    // User corrects the price slightly from $4.89 to $4.79 and adds notes
    const editedItems: ExtractedPriceItem[] = items.map((item) => {
      if (item.tempId === items[0].tempId) {
        return {
          ...item,
          price: 4.79,
          notes: 'Target RedCard member discount applied',
        };
      }
      return item;
    });

    assert.strictEqual(editedItems[0].price, 4.79);
    assert.strictEqual(editedItems[0].notes, 'Target RedCard member discount applied');
  });

  it('Step 3: Ingests verified high-confidence OCR item into product storage', () => {
    const initialProduct = getStoredProductById('prod-milk')!;
    const initialCount = initialProduct.historicalPrices.length;

    const submissionResult = savePriceSubmission({
      productId: 'prod-milk',
      price: 4.79,
      originalPrice: 5.49,
      storeId: 'store-target',
      storeName: 'Target',
      sourceType: 'photo_shelf',
      confidenceScore: 96,
      proofImageUrl: '/samples/shelf-tag-milk.jpg',
      contributorName: 'Community Contributor',
      unit: '1 Gallon',
    });

    assert.strictEqual(submissionResult.success, true);
    assert.strictEqual(submissionResult.isOutlier, false);

    const updatedProduct = getStoredProductById('prod-milk')!;
    assert.strictEqual(updatedProduct.historicalPrices.length, initialCount + 1);

    const latestPrice = updatedProduct.historicalPrices[updatedProduct.historicalPrices.length - 1];
    assert.strictEqual(latestPrice.price, 4.79);
    assert.strictEqual(latestPrice.sourceType, 'photo_shelf');
    assert.strictEqual(latestPrice.isVerified, true);
  });

  it('Step 4: Quarantines low-confidence OCR item (<80%) into Moderation Queue with flagReason "ocr_low_confidence"', () => {
    const queueBefore = getModerationQueue().length;

    const submissionResult = savePriceSubmission({
      productId: 'prod-bread',
      price: 3.99,
      storeId: 'store-walmart',
      storeName: 'Walmart Supercenter',
      sourceType: 'promo_pamphlet',
      confidenceScore: 65, // < 80%
      proofImageUrl: '/samples/weekly-flyer-circular.jpg',
      contributorName: 'Blurry Camera User',
    });

    assert.strictEqual(submissionResult.success, true);
    assert.strictEqual(submissionResult.pricePoint.isVerified, false);

    const queueAfter = getModerationQueue();
    assert.strictEqual(queueAfter.length, queueBefore + 1);

    const quarantinedItem = queueAfter.find((item) => item.pricePoint?.confidenceScore === 65)!;
    assert.ok(quarantinedItem !== undefined);
    assert.strictEqual(quarantinedItem.flagReason, 'ocr_low_confidence');
    assert.strictEqual(quarantinedItem.status, 'pending');

    // Admin approves quarantined item
    resolveModerationItem(quarantinedItem.id, 'approve');

    // After approval, item is integrated into product and removed from pending queue
    const resolvedQueue = getModerationQueue();
    assert.strictEqual(resolvedQueue.length, queueBefore);

    const breadProduct = getStoredProductById('prod-bread')!;
    const approvedPrice = breadProduct.historicalPrices.find((hp) => hp.id === (quarantinedItem.pricePointId || quarantinedItem.pricePoint?.id));
    assert.ok(approvedPrice !== undefined, 'Approved price integrated into product historical record');
    assert.strictEqual(approvedPrice?.isVerified, true);
  });

  it('Step 5: Flyer batch import extracts 4 promotional deals and calculates total savings', async () => {
    const flyerRequest: OcrParseRequest = {
      imageUrl: '/samples/weekly-flyer-circular.jpg',
      sourceType: 'promo_pamphlet',
    };

    const response = await parseVisionDocument(flyerRequest, { apiKey: '' });
    assert.strictEqual(response.success, true);
    assert.strictEqual(response.result.extractedItems.length, 4);

    const deals = response.result.extractedItems;
    const selectedDeals = deals.filter((d) => d.selected);
    assert.strictEqual(selectedDeals.length, 4);

    const totalDealsPrice = selectedDeals.reduce((sum, d) => sum + d.price, 0);
    const totalOriginalPrice = selectedDeals.reduce((sum, d) => sum + (d.originalPrice || d.price), 0);
    const totalSavings = totalOriginalPrice - totalDealsPrice;

    assert.strictEqual(Number(totalDealsPrice.toFixed(2)), 25.76);
    assert.strictEqual(Number(totalOriginalPrice.toFixed(2)), 31.36);
    assert.strictEqual(Number(totalSavings.toFixed(2)), 5.60);
  });
});
