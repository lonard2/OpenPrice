/**
 * Domain Test Fixtures and Reference Contract Engine for OpenPrice
 * Opaque-box requirement-driven fixtures for Unit, E2E, Boundary, and Workflow tests.
 */

import type { UserRole, WatchlistItem, ContributionKarma, ModerationItem } from '../../src/types/user.ts';

export type ProductCategory =
  | 'groceries'
  | 'electronics'
  | 'household'
  | 'pharmacy'
  | 'beverages'
  | 'services'
  | 'apparel';

export type PriceTrendStatus =
  | 'price_drop'
  | 'price_hike'
  | 'stable'
  | 'rare_stock'
  | 'demand_surge'
  | 'up'
  | 'down'
  | 'flat'
  | 'new'
  | 'outlier';

export interface Store {
  id: string;
  name: string;
  chain: string;
  branchName: string;
  type: 'physical' | 'online' | 'hybrid';
  city: string;
  isVerified: boolean;
  logoUrl?: string;
}

export interface PricePoint {
  id: string;
  productId: string;
  storeId: string;
  storeName: string;
  price: number;
  originalPrice?: number;
  currency: string;
  unit: string;
  timestamp: string; // ISO 8601
  sourceType: 'photo_shelf' | 'promo_pamphlet' | 'receipt' | 'web_crawler' | 'manual';
  confidenceScore?: number;
  proofImageUrl?: string;
  contributorId?: string;
  contributorName?: string;
  isVerified: boolean;
  isOutlier?: boolean;
  outlierSigma?: number;
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  unit: string;
  description: string;
  imageUrl: string;
  currentLowestPrice: number;
  currentHighestPrice: number;
  averagePrice: number;
  previousPrice: number;
  trendStatus: PriceTrendStatus;
  priceDeltaPercent: number;
  trackedStoresCount: number;
  totalSubmissionsCount: number;
  historicalPrices: PricePoint[];
  tags?: string[];
  isVerified: boolean;
}

export interface BoundingBox {
  xMin: number; // percentage 0 - 100
  yMin: number;
  xMax: number;
  yMax: number;
  confidence?: number;
  label?: string;
}

export interface ExtractedPriceItem {
  tempId: string;
  name: string;
  brand?: string;
  category?: ProductCategory;
  price: number;
  originalPrice?: number;
  unit?: string;
  confidence: number; // 0.0 - 1.0
  boundingBox?: BoundingBox;
  storeName?: string;
  notes?: string;
  selected: boolean;
}

export interface OcrParseResult {
  sourceImageUrl: string;
  detectedStoreName?: string;
  detectedDate?: string;
  sourceType: 'photo_shelf' | 'promo_pamphlet' | 'receipt';
  extractedItems: ExtractedPriceItem[];
  rawText?: string;
  processingTimeMs: number;
  confidenceAverage: number;
}

export interface InflationBasketReport {
  indexValue: number;
  baseIndex: number;
  inflationRatePercent: number;
  categoryBreakdown: Record<string, number>;
  itemsCount: number;
  timestamp: string;
}

export interface StorePriceComparison {
  storeId: string;
  storeName: string;
  price: number;
  diffFromMin: number;
  diffPercentFromMin: number;
  diffFromAverage: number;
  isCheapest: boolean;
}

export interface PriceOutlierReport {
  isOutlier: boolean;
  zScore: number;
  mean: number;
  standardDeviation: number;
  thresholdSigma: number;
  sampleSize: number;
  originalPrice: number;
}

// 7 Retail Stores
export const SEED_STORES: Store[] = [
  { id: 'store-target', name: 'Target', chain: 'Target Corp', branchName: 'Downtown Metro', type: 'physical', city: 'Seattle', isVerified: true },
  { id: 'store-walmart', name: 'Walmart Supercenter', chain: 'Walmart Inc', branchName: 'West Valley', type: 'physical', city: 'Renton', isVerified: true },
  { id: 'store-trader-joes', name: "Trader Joe's", chain: "Trader Joe's", branchName: 'Capitol Hill', type: 'physical', city: 'Seattle', isVerified: true },
  { id: 'store-whole-foods', name: 'Whole Foods Market', chain: 'Amazon Whole Foods', branchName: 'South Lake Union', type: 'hybrid', city: 'Seattle', isVerified: true },
  { id: 'store-kroger', name: 'Ralphs / QFC', chain: 'Kroger Co', branchName: 'University Village', type: 'physical', city: 'Seattle', isVerified: true },
  { id: 'store-costco', name: 'Costco Wholesale', chain: 'Costco Wholesale Corp', branchName: '4th Ave S', type: 'physical', city: 'Seattle', isVerified: true },
  { id: 'store-amazon-fresh', name: 'Amazon Fresh', chain: 'Amazon.com Inc', branchName: 'Central Fulfillment', type: 'online', city: 'Online', isVerified: true },
];

// Helper to create price points
export function generateLongitudinalPrices(productId: string, basePrice: number, stores: Store[]): PricePoint[] {
  const points: PricePoint[] = [];
  const dates = [
    '2025-09-01T10:00:00Z',
    '2025-10-15T14:30:00Z',
    '2025-11-20T11:00:00Z',
    '2025-12-18T09:15:00Z',
    '2026-01-10T16:45:00Z',
    '2026-02-05T13:20:00Z',
    '2026-03-01T10:00:00Z',
  ];

  stores.forEach((store, sIdx) => {
    // Variation per store
    const storeMultiplier = 0.92 + (sIdx * 0.03); // range 0.92 - 1.10
    dates.forEach((date, dIdx) => {
      // Historical trend slight inflation or drop
      const drift = 1 + (dIdx * 0.015) - (sIdx % 2 === 0 ? 0.02 : 0);
      const price = Number((basePrice * storeMultiplier * drift).toFixed(2));
      points.push({
        id: `pp-${productId}-${store.id}-${dIdx}`,
        productId,
        storeId: store.id,
        storeName: store.name,
        price,
        currency: 'USD',
        unit: 'unit',
        timestamp: date,
        sourceType: dIdx % 2 === 0 ? 'photo_shelf' : 'receipt',
        confidenceScore: 92 + (dIdx % 6),
        isVerified: true,
      });
    });
  });

  return points;
}

// 20 Tracked Products
export const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-milk',
    name: 'Organic Whole Milk',
    brand: 'Horizon Organic',
    category: 'groceries',
    unit: '1 Gallon',
    description: 'USDA certified organic whole milk with Vitamin D3.',
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400',
    currentLowestPrice: 4.89,
    currentHighestPrice: 6.29,
    averagePrice: 5.45,
    previousPrice: 5.79,
    trendStatus: 'price_drop',
    priceDeltaPercent: -5.87,
    trackedStoresCount: 7,
    totalSubmissionsCount: 49,
    historicalPrices: generateLongitudinalPrices('prod-milk', 5.50, SEED_STORES),
    isVerified: true,
    tags: ['dairy', 'organic', 'staple'],
  },
  {
    id: 'prod-eggs',
    name: 'Pasture-Raised Large Brown Eggs',
    brand: 'Vital Farms',
    category: 'groceries',
    unit: '12 ct',
    description: 'Pasture-raised grade A large brown eggs.',
    imageUrl: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=400',
    currentLowestPrice: 5.49,
    currentHighestPrice: 7.99,
    averagePrice: 6.74,
    previousPrice: 6.19,
    trendStatus: 'price_hike',
    priceDeltaPercent: 8.88,
    trackedStoresCount: 6,
    totalSubmissionsCount: 42,
    historicalPrices: generateLongitudinalPrices('prod-eggs', 6.20, SEED_STORES.slice(0, 6)),
    isVerified: true,
    tags: ['dairy', 'eggs', 'pasture-raised'],
  },
  {
    id: 'prod-bread',
    name: 'Artisanal San Francisco Sourdough',
    brand: 'Boudin Bakery',
    category: 'groceries',
    unit: '24 oz loaf',
    description: 'Naturally fermented sourdough bread loaf.',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
    currentLowestPrice: 3.99,
    currentHighestPrice: 5.49,
    averagePrice: 4.65,
    previousPrice: 4.65,
    trendStatus: 'stable',
    priceDeltaPercent: 0.0,
    trackedStoresCount: 5,
    totalSubmissionsCount: 35,
    historicalPrices: generateLongitudinalPrices('prod-bread', 4.50, SEED_STORES.slice(0, 5)),
    isVerified: true,
    tags: ['bakery', 'bread'],
  },
  {
    id: 'prod-coffee',
    name: 'Fair Trade Dark Roast Coffee Beans',
    brand: 'Peet’s Coffee',
    category: 'groceries',
    unit: '12 oz bag',
    description: 'Major Dickason’s Blend whole bean dark roast coffee.',
    imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
    currentLowestPrice: 9.99,
    currentHighestPrice: 14.49,
    averagePrice: 12.19,
    previousPrice: 12.99,
    trendStatus: 'price_drop',
    priceDeltaPercent: -6.16,
    trackedStoresCount: 7,
    totalSubmissionsCount: 49,
    historicalPrices: generateLongitudinalPrices('prod-coffee', 12.50, SEED_STORES),
    isVerified: true,
    tags: ['beverages', 'coffee'],
  },
  {
    id: 'prod-apples',
    name: 'Honeycrisp Apples',
    brand: 'Stemilt Growers',
    category: 'groceries',
    unit: '3 lb bag',
    description: 'Crisp and juicy sweet Washington Honeycrisp apples.',
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
    currentLowestPrice: 4.49,
    currentHighestPrice: 6.99,
    averagePrice: 5.65,
    previousPrice: 5.29,
    trendStatus: 'price_hike',
    priceDeltaPercent: 6.81,
    trackedStoresCount: 6,
    totalSubmissionsCount: 42,
    historicalPrices: generateLongitudinalPrices('prod-apples', 5.40, SEED_STORES.slice(0, 6)),
    isVerified: true,
    tags: ['produce', 'fruit'],
  },
  {
    id: 'prod-chicken',
    name: 'Organic Boneless Chicken Breasts',
    brand: 'Foster Farms',
    category: 'groceries',
    unit: '1 lb',
    description: 'Air-chilled organic boneless skinless chicken breasts.',
    imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400',
    currentLowestPrice: 6.99,
    currentHighestPrice: 9.49,
    averagePrice: 8.15,
    previousPrice: 8.15,
    trendStatus: 'stable',
    priceDeltaPercent: 0.0,
    trackedStoresCount: 5,
    totalSubmissionsCount: 35,
    historicalPrices: generateLongitudinalPrices('prod-chicken', 8.00, SEED_STORES.slice(0, 5)),
    isVerified: true,
    tags: ['meat', 'poultry', 'organic'],
  },
  {
    id: 'prod-olive-oil',
    name: 'Extra Virgin Cold-Pressed Olive Oil',
    brand: 'California Olive Ranch',
    category: 'groceries',
    unit: '500 ml bottle',
    description: '100% California extra virgin cold-pressed olive oil.',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400',
    currentLowestPrice: 13.99,
    currentHighestPrice: 18.99,
    averagePrice: 16.49,
    previousPrice: 17.99,
    trendStatus: 'price_drop',
    priceDeltaPercent: -8.34,
    trackedStoresCount: 6,
    totalSubmissionsCount: 42,
    historicalPrices: generateLongitudinalPrices('prod-olive-oil', 16.50, SEED_STORES.slice(0, 6)),
    isVerified: true,
    tags: ['pantry', 'oil'],
  },
  {
    id: 'prod-rice',
    name: 'Royal Jasmine White Rice',
    brand: 'Lundberg Family Farms',
    category: 'groceries',
    unit: '5 lb bag',
    description: 'Aromatic long grain California white jasmine rice.',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    currentLowestPrice: 7.49,
    currentHighestPrice: 9.99,
    averagePrice: 8.65,
    previousPrice: 8.65,
    trendStatus: 'stable',
    priceDeltaPercent: 0.0,
    trackedStoresCount: 5,
    totalSubmissionsCount: 35,
    historicalPrices: generateLongitudinalPrices('prod-rice', 8.50, SEED_STORES.slice(0, 5)),
    isVerified: true,
    tags: ['pantry', 'grain'],
  },
  {
    id: 'prod-butter',
    name: 'Pure Irish Grass-Fed Butter',
    brand: 'Kerrygold',
    category: 'groceries',
    unit: '8 oz (2 bars)',
    description: 'Imported salted butter made from grass-fed Irish cows.',
    imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400',
    currentLowestPrice: 4.29,
    currentHighestPrice: 5.99,
    averagePrice: 5.15,
    previousPrice: 4.89,
    trendStatus: 'price_hike',
    priceDeltaPercent: 5.32,
    trackedStoresCount: 6,
    totalSubmissionsCount: 42,
    historicalPrices: generateLongitudinalPrices('prod-butter', 5.00, SEED_STORES.slice(0, 6)),
    isVerified: true,
    tags: ['dairy', 'butter'],
  },
  {
    id: 'prod-salmon',
    name: 'Wild Alaskan Sockeye Salmon Fillet',
    brand: 'Ocean Beauty',
    category: 'groceries',
    unit: '1 lb',
    description: 'Sustainably caught wild Alaskan sockeye salmon fillet.',
    imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400',
    currentLowestPrice: 14.99,
    currentHighestPrice: 19.99,
    averagePrice: 17.45,
    previousPrice: 18.99,
    trendStatus: 'price_drop',
    priceDeltaPercent: -8.11,
    trackedStoresCount: 5,
    totalSubmissionsCount: 35,
    historicalPrices: generateLongitudinalPrices('prod-salmon', 17.50, SEED_STORES.slice(0, 5)),
    isVerified: true,
    tags: ['seafood', 'fresh'],
  },
  {
    id: 'prod-headphones',
    name: 'Wireless ANC Noise Cancelling Headphones',
    brand: 'Sony',
    category: 'electronics',
    unit: '1 unit',
    description: 'WH-1000XM5 wireless industry leading noise cancelling headphones.',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    currentLowestPrice: 329.99,
    currentHighestPrice: 399.99,
    averagePrice: 368.50,
    previousPrice: 399.99,
    trendStatus: 'price_drop',
    priceDeltaPercent: -7.87,
    trackedStoresCount: 4,
    totalSubmissionsCount: 28,
    historicalPrices: generateLongitudinalPrices('prod-headphones', 370.00, SEED_STORES.slice(0, 4)),
    isVerified: true,
    tags: ['audio', 'tech'],
  },
  {
    id: 'prod-charger',
    name: '65W Dual USB-C GaN Fast Wall Charger',
    brand: 'Anker',
    category: 'electronics',
    unit: '1 unit',
    description: 'Compact 65W fast charger with PowerIQ 4.0.',
    imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400',
    currentLowestPrice: 29.99,
    currentHighestPrice: 42.99,
    averagePrice: 36.45,
    previousPrice: 36.45,
    trendStatus: 'stable',
    priceDeltaPercent: 0.0,
    trackedStoresCount: 4,
    totalSubmissionsCount: 28,
    historicalPrices: generateLongitudinalPrices('prod-charger', 35.00, SEED_STORES.slice(0, 4)),
    isVerified: true,
    tags: ['accessories', 'power'],
  },
  {
    id: 'prod-cable',
    name: 'Braided USB-C to USB-C Cable (2m)',
    brand: 'Belkin',
    category: 'electronics',
    unit: '2m cable',
    description: 'Durable nylon braided 100W Power Delivery cable.',
    imageUrl: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=400',
    currentLowestPrice: 12.99,
    currentHighestPrice: 19.99,
    averagePrice: 15.95,
    previousPrice: 14.49,
    trendStatus: 'price_hike',
    priceDeltaPercent: 10.08,
    trackedStoresCount: 4,
    totalSubmissionsCount: 28,
    historicalPrices: generateLongitudinalPrices('prod-cable', 15.00, SEED_STORES.slice(0, 4)),
    isVerified: true,
    tags: ['cables', 'accessories'],
  },
  {
    id: 'prod-smart-bulb',
    name: 'Matter Smart Color LED Bulb 2-Pack',
    brand: 'Nanoleaf',
    category: 'electronics',
    unit: '2-pack',
    description: 'Thread and Matter enabled A19 smart multicolor light bulbs.',
    imageUrl: 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=400',
    currentLowestPrice: 24.99,
    currentHighestPrice: 34.99,
    averagePrice: 29.50,
    previousPrice: 32.99,
    trendStatus: 'price_drop',
    priceDeltaPercent: -10.58,
    trackedStoresCount: 4,
    totalSubmissionsCount: 28,
    historicalPrices: generateLongitudinalPrices('prod-smart-bulb', 30.00, SEED_STORES.slice(0, 4)),
    isVerified: true,
    tags: ['smarthome', 'lighting'],
  },
  {
    id: 'prod-detergent',
    name: 'Eco Laundry Detergent Pods (42 ct)',
    brand: 'Seventh Generation',
    category: 'household',
    unit: '42 count tub',
    description: 'Plant-based enzyme powered concentrated laundry detergent pods.',
    imageUrl: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400',
    currentLowestPrice: 14.49,
    currentHighestPrice: 19.49,
    averagePrice: 16.95,
    previousPrice: 15.99,
    trendStatus: 'price_hike',
    priceDeltaPercent: 6.0,
    trackedStoresCount: 6,
    totalSubmissionsCount: 42,
    historicalPrices: generateLongitudinalPrices('prod-detergent', 16.00, SEED_STORES.slice(0, 6)),
    isVerified: true,
    tags: ['cleaning', 'eco'],
  },
  {
    id: 'prod-paper-towels',
    name: 'Ultra Absorbent Paper Towels (6 Double Rolls)',
    brand: 'Bounty',
    category: 'household',
    unit: '6 double rolls',
    description: 'The Quicker Picker Upper 2-ply select-a-size paper towels.',
    imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400',
    currentLowestPrice: 11.99,
    currentHighestPrice: 16.99,
    averagePrice: 14.45,
    previousPrice: 14.45,
    trendStatus: 'stable',
    priceDeltaPercent: 0.0,
    trackedStoresCount: 6,
    totalSubmissionsCount: 42,
    historicalPrices: generateLongitudinalPrices('prod-paper-towels', 14.00, SEED_STORES.slice(0, 6)),
    isVerified: true,
    tags: ['paper', 'essentials'],
  },
  {
    id: 'prod-dish-soap',
    name: 'Plant-Based Dishwashing Liquid (28 oz)',
    brand: 'Method',
    category: 'household',
    unit: '28 fl oz',
    description: 'Biodegradable Clementine grease-fighting dish soap.',
    imageUrl: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400',
    currentLowestPrice: 3.99,
    currentHighestPrice: 5.49,
    averagePrice: 4.75,
    previousPrice: 4.99,
    trendStatus: 'price_drop',
    priceDeltaPercent: -4.81,
    trackedStoresCount: 5,
    totalSubmissionsCount: 35,
    historicalPrices: generateLongitudinalPrices('prod-dish-soap', 4.80, SEED_STORES.slice(0, 5)),
    isVerified: true,
    tags: ['cleaning', 'dish'],
  },
  {
    id: 'prod-ibuprofen',
    name: 'Ibuprofen Pain Reliever Tablets 200mg (100 ct)',
    brand: 'Advil',
    category: 'pharmacy',
    unit: '100 coated tablets',
    description: 'Fast acting NSAID pain and fever reducer.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
    currentLowestPrice: 9.49,
    currentHighestPrice: 13.99,
    averagePrice: 11.75,
    previousPrice: 11.20,
    trendStatus: 'price_hike',
    priceDeltaPercent: 4.91,
    trackedStoresCount: 5,
    totalSubmissionsCount: 35,
    historicalPrices: generateLongitudinalPrices('prod-ibuprofen', 11.50, SEED_STORES.slice(0, 5)),
    isVerified: true,
    tags: ['health', 'medication'],
  },
  {
    id: 'prod-sparkling-water',
    name: 'Natural Sparkling Mineral Water (12 pack)',
    brand: 'LaCroix',
    category: 'beverages',
    unit: '12 x 12 oz cans',
    description: 'Pamplemousse grapefruit 100% natural flavored sparkling water.',
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400',
    currentLowestPrice: 4.99,
    currentHighestPrice: 6.99,
    averagePrice: 5.85,
    previousPrice: 5.85,
    trendStatus: 'stable',
    priceDeltaPercent: 0.0,
    trackedStoresCount: 6,
    totalSubmissionsCount: 42,
    historicalPrices: generateLongitudinalPrices('prod-sparkling-water', 5.80, SEED_STORES.slice(0, 6)),
    isVerified: true,
    tags: ['beverages', 'water'],
  },
  {
    id: 'prod-dry-cleaning',
    name: 'Eco 2-Piece Wool Suit Dry Cleaning',
    brand: 'GreenEarth Cleaners',
    category: 'services',
    unit: '1 suit service',
    description: 'Silicone-based non-toxic eco garment dry cleaning.',
    imageUrl: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=400',
    currentLowestPrice: 16.00,
    currentHighestPrice: 24.00,
    averagePrice: 19.50,
    previousPrice: 18.00,
    trendStatus: 'price_hike',
    priceDeltaPercent: 8.33,
    trackedStoresCount: 3,
    totalSubmissionsCount: 21,
    historicalPrices: generateLongitudinalPrices('prod-dry-cleaning', 19.00, SEED_STORES.slice(0, 3)),
    isVerified: true,
    tags: ['services', 'cleaning'],
  },
];

// Sample OCR Results for Shelf Tags, Flyers, Receipts
export const SAMPLE_OCR_RESULTS: Record<string, OcrParseResult> = {
  shelfTag: {
    sourceImageUrl: '/samples/shelf-tag-milk.jpg',
    detectedStoreName: 'Target',
    detectedDate: '2026-08-20',
    sourceType: 'photo_shelf',
    processingTimeMs: 340,
    confidenceAverage: 0.94,
    rawText: 'HORIZON ORGANIC WHOLE MILK 1 GAL $4.89',
    extractedItems: [
      {
        tempId: 'item-1',
        name: 'Horizon Organic Whole Milk',
        brand: 'Horizon Organic',
        category: 'groceries',
        price: 4.89,
        originalPrice: 5.49,
        unit: '1 Gallon',
        confidence: 0.96,
        boundingBox: { xMin: 12.5, yMin: 22.0, xMax: 84.0, yMax: 68.0, confidence: 0.96, label: 'Price Tag' },
        storeName: 'Target',
        selected: true,
      },
    ],
  },
  promoFlyer: {
    sourceImageUrl: '/samples/weekly-flyer-circular.jpg',
    detectedStoreName: 'Walmart Supercenter',
    detectedDate: '2026-08-22',
    sourceType: 'promo_pamphlet',
    processingTimeMs: 820,
    confidenceAverage: 0.88,
    rawText: 'WEEKLY SAVINGS: Vital Farms Eggs $5.49 | Boudin Sourdough $3.99 | Bounty 6pk $11.99 | Kerrygold $4.29',
    extractedItems: [
      {
        tempId: 'deal-1',
        name: 'Vital Farms Pasture-Raised Eggs',
        brand: 'Vital Farms',
        category: 'groceries',
        price: 5.49,
        originalPrice: 6.49,
        unit: '12 ct',
        confidence: 0.92,
        boundingBox: { xMin: 5.0, yMin: 8.0, xMax: 48.0, yMax: 45.0, confidence: 0.92, label: 'Eggs Deal' },
        storeName: 'Walmart Supercenter',
        selected: true,
      },
      {
        tempId: 'deal-2',
        name: 'Boudin Sourdough Bread',
        brand: 'Boudin Bakery',
        category: 'groceries',
        price: 3.99,
        originalPrice: 4.69,
        unit: '24 oz',
        confidence: 0.89,
        boundingBox: { xMin: 52.0, yMin: 8.0, xMax: 95.0, yMax: 45.0, confidence: 0.89, label: 'Bread Deal' },
        storeName: 'Walmart Supercenter',
        selected: true,
      },
      {
        tempId: 'deal-3',
        name: 'Bounty Paper Towels 6 Double Rolls',
        brand: 'Bounty',
        category: 'household',
        price: 11.99,
        originalPrice: 14.99,
        unit: '6 rolls',
        confidence: 0.86,
        boundingBox: { xMin: 5.0, yMin: 52.0, xMax: 48.0, yMax: 92.0, confidence: 0.86, label: 'Towels Deal' },
        storeName: 'Walmart Supercenter',
        selected: true,
      },
      {
        tempId: 'deal-4',
        name: 'Kerrygold Pure Irish Butter',
        brand: 'Kerrygold',
        category: 'groceries',
        price: 4.29,
        originalPrice: 5.19,
        unit: '8 oz',
        confidence: 0.85,
        boundingBox: { xMin: 52.0, yMin: 52.0, xMax: 95.0, yMax: 92.0, confidence: 0.85, label: 'Butter Deal' },
        storeName: 'Walmart Supercenter',
        selected: true,
      },
    ],
  },
  receipt: {
    sourceImageUrl: '/samples/grocery-receipt-trader-joes.jpg',
    detectedStoreName: "Trader Joe's",
    detectedDate: '2026-08-23',
    sourceType: 'receipt',
    processingTimeMs: 610,
    confidenceAverage: 0.91,
    rawText: "TRADER JOE'S #124 - Honeycrisp Apples $4.49, Dark Roast Peet's $9.99, Method Soap $3.99, TOTAL $18.47",
    extractedItems: [
      {
        tempId: 'rec-1',
        name: 'Honeycrisp Apples',
        category: 'groceries',
        price: 4.49,
        confidence: 0.95,
        boundingBox: { xMin: 10.0, yMin: 25.0, xMax: 90.0, yMax: 32.0, confidence: 0.95, label: 'Item 1' },
        storeName: "Trader Joe's",
        selected: true,
      },
      {
        tempId: 'rec-2',
        name: "Peet's Coffee Beans 12oz",
        category: 'groceries',
        price: 9.99,
        confidence: 0.91,
        boundingBox: { xMin: 10.0, yMin: 34.0, xMax: 90.0, yMax: 41.0, confidence: 0.91, label: 'Item 2' },
        storeName: "Trader Joe's",
        selected: true,
      },
      {
        tempId: 'rec-3',
        name: 'Method Dish Soap 28oz',
        category: 'household',
        price: 3.99,
        confidence: 0.88,
        boundingBox: { xMin: 10.0, yMin: 43.0, xMax: 90.0, yMax: 50.0, confidence: 0.88, label: 'Item 3' },
        storeName: "Trader Joe's",
        selected: true,
      },
    ],
  },
};
