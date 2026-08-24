/**
 * OpenPrice Multimodal OCR & Vision Domain Models
 */

import type { ProductCategory } from './product.ts';

export interface BoundingBox {
  xMin: number; // Percentage: 0.0 to 100.0
  yMin: number; // Percentage: 0.0 to 100.0
  xMax: number; // Percentage: 0.0 to 100.0
  yMax: number; // Percentage: 0.0 to 100.0
  label?: string;
  confidence?: number; // 0.0 to 1.0
}

export interface ExtractedPriceItem {
  tempId: string;
  name: string;
  brand?: string;
  category?: ProductCategory;
  price: number;
  originalPrice?: number;
  unit?: string;
  confidence: number; // 0.0 to 1.0
  boundingBox?: BoundingBox;
  storeName?: string;
  notes?: string;
  selected: boolean;
  matchedProductId?: string; // Auto-matched catalog product ID
}

export interface OcrParseResult {
  id?: string;
  sourceImageUrl: string;
  imageWidth?: number;
  imageHeight?: number;
  detectedStoreName?: string;
  detectedDate?: string;
  sourceType: 'photo_shelf' | 'promo_pamphlet' | 'receipt';
  extractedItems: ExtractedPriceItem[];
  rawText?: string;
  processingTimeMs: number;
  confidenceAverage?: number;
  modelUsed?: string;
}

export interface OcrParseRequest {
  imageBase64?: string;
  imageUrl?: string;
  sourceType: 'photo_shelf' | 'promo_pamphlet' | 'receipt';
}

export interface OcrParseResponse {
  success: boolean;
  result: OcrParseResult;
  source: 'openrouter' | 'fallback';
}
