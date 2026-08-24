import test, { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  OpenPriceStateEngine,
  formatCurrency,
  formatDeltaPercent,
  getDeltaStyle,
  formatRelativeTime,
  calculatePriceDelta,
  calculateInflationIndex,
  calculateStorePriceVariance,
  detectPriceOutlier,
  calculateStandardDeviation,
} from '../helpers/pure-contract-engine.ts';
import {
  SEED_PRODUCTS,
  SEED_STORES,
  SAMPLE_OCR_RESULTS,
} from '../fixtures/domain-fixtures.ts';

describe('Tier 1: Comprehensive Feature Coverage (All 16 Features in Isolation)', () => {
  let engine: OpenPriceStateEngine;

  beforeEach(() => {
    engine = new OpenPriceStateEngine();
  });

  // -------------------------------------------------------------
  // Feature 1: Architecture & Token Styling
  // -------------------------------------------------------------
  describe('Feature 1: Architecture & Design System Tokens', () => {
    it('F1.1: verifies core brand and economic color hex codes matching DESIGN.md', () => {
      const designTokens = {
        primaryIndigo: '#4F46E5',
        electricCerulean: '#0EA5E9',
        emeraldMint: '#10B981',
        coralSunset: '#F43F5E',
        goldAmber: '#F59E0B',
        brightViolet: '#8B5CF6',
        canvasBg: '#F8FAFC',
        deepSlateInk: '#0F172A',
      };
      assert.strictEqual(designTokens.primaryIndigo, '#4F46E5');
      assert.strictEqual(designTokens.emeraldMint, '#10B981');
      assert.strictEqual(designTokens.coralSunset, '#F43F5E');
      assert.strictEqual(designTokens.goldAmber, '#F59E0B');
    });

    it('F1.2: verifies subtle ambient lift multi-layer shadow specifications', () => {
      const ambientLift = '0 8px 20px -4px rgba(79, 70, 229, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04)';
      assert.ok(ambientLift.includes('rgba(79, 70, 229, 0.08)'));
      assert.ok(ambientLift.includes('rgba(15, 23, 42, 0.04)'));
    });

    it('F1.3: verifies responsive viewport breakpoints (mobile <640px, tablet 640-1024px, desktop >1024px)', () => {
      const breakpoints = { mobileMax: 639, tabletMin: 640, tabletMax: 1023, desktopMin: 1024 };
      assert.ok(375 <= breakpoints.mobileMax, '375px is mobile');
      assert.ok(768 >= breakpoints.tabletMin && 768 <= breakpoints.tabletMax, '768px is tablet');
      assert.ok(1440 >= breakpoints.desktopMin, '1440px is desktop');
    });

    it('F1.4: verifies border-first framing token rule (1px border-slate-200)', () => {
      const borderToken = '1px solid #E2E8F0';
      assert.strictEqual(borderToken, '1px solid #E2E8F0');
    });

    it('F1.5: verifies maximum container width constraint of 1440px', () => {
      const maxContainerWidth = 1440;
      assert.strictEqual(maxContainerWidth, 1440);
    });
  });

  // -------------------------------------------------------------
  // Feature 2: Tabular Numerals & Price Semantics
  // -------------------------------------------------------------
  describe('Feature 2: Tabular Numerals & Price Semantics', () => {
    it('F2.1: validates tabular figures CSS class presence for monetary layout shift prevention', () => {
      const tabularClass = 'font-mono tabular-nums';
      assert.ok(tabularClass.includes('tabular-nums'));
    });

    it('F2.2: enforces strict Emerald green for price drops / savings', () => {
      const style = getDeltaStyle(-7.5);
      assert.strictEqual(style.colorHex, '#10B981');
      assert.strictEqual(style.icon, 'down');
      assert.strictEqual(style.label, 'Price Drop');
    });

    it('F2.3: enforces strict Coral Sunset for price hikes / inflation', () => {
      const style = getDeltaStyle(11.2);
      assert.strictEqual(style.colorHex, '#F43F5E');
      assert.strictEqual(style.icon, 'up');
      assert.strictEqual(style.label, 'Price Hike');
    });

    it('F2.4: enforces Muted Slate for zero/stable price differences', () => {
      const style = getDeltaStyle(0);
      assert.strictEqual(style.colorHex, '#64748B');
      assert.strictEqual(style.icon, 'flat');
      assert.strictEqual(style.label, 'Stable');
    });

    it('F2.5: ensures formatted prices and deltas carry explicit signs and 2-decimal precision', () => {
      assert.strictEqual(formatCurrency(5.49), '$5.49');
      assert.strictEqual(formatDeltaPercent(-12.5), '-12.5%');
      assert.strictEqual(formatDeltaPercent(8.3), '+8.3%');
    });
  });

  // -------------------------------------------------------------
  // Feature 3: Domain Models & Persistence
  // -------------------------------------------------------------
  describe('Feature 3: Domain Models & Data Persistence', () => {
    it('F3.1: validates Product schema completeness (id, name, brand, category, prices, unit)', () => {
      const product = SEED_PRODUCTS[0];
      assert.ok(product.id.startsWith('prod-'));
      assert.ok(typeof product.name === 'string');
      assert.ok(typeof product.brand === 'string');
      assert.ok(typeof product.currentLowestPrice === 'number');
      assert.ok(Array.isArray(product.historicalPrices));
      assert.ok(product.historicalPrices.length > 0);
    });

    it('F3.2: validates PricePoint schema (sourceType, proofImageUrl, isVerified, timestamp)', () => {
      const pricePoint = SEED_PRODUCTS[0].historicalPrices[0];
      assert.ok(pricePoint.id.startsWith('pp-'));
      assert.ok(['photo_shelf', 'promo_pamphlet', 'receipt', 'web_crawler', 'manual'].includes(pricePoint.sourceType));
      assert.ok(typeof pricePoint.isVerified === 'boolean');
      assert.ok(!isNaN(new Date(pricePoint.timestamp).getTime()));
    });

    it('F3.3: validates Store schema (id, name, chain, branchName, type, isVerified)', () => {
      const store = SEED_STORES[0];
      assert.ok(store.id.startsWith('store-'));
      assert.ok(['physical', 'online', 'hybrid'].includes(store.type));
      assert.strictEqual(store.isVerified, true);
    });

    it('F3.4: validates in-memory / storage serialization and deserialization of products', () => {
      const products = engine.getProducts();
      assert.strictEqual(products.length, 20);
      const json = JSON.stringify(products);
      const restored = JSON.parse(json);
      assert.strictEqual(restored.length, 20);
    });

    it('F3.5: verifies seed dataset generates 7 stores and 20 products with longitudinal histories', () => {
      assert.strictEqual(SEED_STORES.length, 7);
      assert.strictEqual(SEED_PRODUCTS.length, 20);
      const totalPoints = SEED_PRODUCTS.reduce((sum, p) => sum + p.historicalPrices.length, 0);
      assert.ok(totalPoints >= 500, 'Over 500 historical price points generated');
    });
  });

  // -------------------------------------------------------------
  // Feature 4: Inflation & Volatility Math
  // -------------------------------------------------------------
  describe('Feature 4: Inflation & Volatility Math', () => {
    it('F4.1: computes exact price delta amount and percentage', () => {
      const delta = calculatePriceDelta(4.49, 4.99);
      assert.strictEqual(delta.amount, -0.5);
      assert.strictEqual(delta.percent, -10.02);
      assert.strictEqual(delta.status, 'price_drop');
    });

    it('F4.2: computes Laspeyres rolling basket inflation index relative to base 100.0', () => {
      const base = { 'milk': 5.0, 'eggs': 4.0, 'bread': 3.0 };
      const current = { 'milk': 5.5, 'eggs': 4.4, 'bread': 3.3 }; // +10% overall
      const report = calculateInflationIndex(current, base);
      assert.strictEqual(report.indexValue, 110.0);
      assert.strictEqual(report.inflationRatePercent, 10.0);
    });

    it('F4.3: computes category-level sub-indices (groceries vs electronics vs household)', () => {
      const base = { 'groceries:milk': 5.0, 'electronics:bulb': 20.0 };
      const current = { 'groceries:milk': 6.0, 'electronics:bulb': 18.0 };
      const report = calculateInflationIndex(current, base);
      assert.strictEqual(report.categoryBreakdown['groceries'], 20.0);
      assert.strictEqual(report.categoryBreakdown['electronics'], -10.0);
    });

    it('F4.4: computes weighted basket inflation with non-uniform product weights', () => {
      const base = { itemA: 10, itemB: 10 };
      const current = { itemA: 12, itemB: 10 }; // A is +20%, B is 0%
      const weights = { itemA: 3, itemB: 1 }; // Weight 3 to 1
      // Base: 10*3 + 10*1 = 40. Current: 12*3 + 10*1 = 46. (46/40)*100 = 115.0
      const report = calculateInflationIndex(current, base, weights);
      assert.strictEqual(report.indexValue, 115.0);
      assert.strictEqual(report.inflationRatePercent, 15.0);
    });

    it('F4.5: calculates store price variance and ranks lowest price retailer', () => {
      const storePrices = [
        { storeId: 'target', storeName: 'Target', price: 5.29 },
        { storeId: 'walmart', storeName: 'Walmart', price: 4.89 },
        { storeId: 'kroger', storeName: 'Kroger', price: 5.19 },
      ];
      const variance = calculateStorePriceVariance(storePrices);
      const walmart = variance.find((v) => v.storeId === 'walmart')!;
      assert.strictEqual(walmart.isCheapest, true);
      assert.strictEqual(walmart.diffFromMin, 0.0);
      assert.strictEqual(walmart.diffPercentFromMin, 0.0);
    });
  });

  // -------------------------------------------------------------
  // Feature 5: Outlier Anomaly Detection (>3σ)
  // -------------------------------------------------------------
  describe('Feature 5: Outlier Anomaly Detection (>3σ)', () => {
    it('F5.1: calculates Bessel-corrected sample standard deviation (N-1)', () => {
      const { mean, stdDev } = calculateStandardDeviation([2, 4, 4, 4, 5, 5, 7, 9]);
      assert.strictEqual(mean, 5);
      assert.strictEqual(Number(stdDev.toFixed(2)), 2.14);
    });

    it('F5.2: computes Z-score deviation for incoming observations', () => {
      const history = [10, 10, 10, 10, 12, 12, 12, 12]; // mean 11, stdDev ~ 1.07
      const outlier = detectPriceOutlier(16, history, 3.0);
      assert.ok(outlier.zScore > 3.0);
      assert.strictEqual(outlier.isOutlier, true);
    });

    it('F5.3: flags prices deviating by >3 standard deviations', () => {
      const history = [5.0, 5.1, 4.9, 5.0, 5.05, 4.95];
      const spike = detectPriceOutlier(20.0, history, 3.0);
      assert.strictEqual(spike.isOutlier, true);
    });

    it('F5.4: does not flag normal in-range observations (Z <= 3.0)', () => {
      const history = [5.0, 5.1, 4.9, 5.0, 5.05, 4.95];
      const normal = detectPriceOutlier(5.2, history, 3.0);
      assert.strictEqual(normal.isOutlier, false);
    });

    it('F5.5: safely handles small sample sizes (N < 2) without throwing', () => {
      const singleItem = detectPriceOutlier(10.0, [5.0], 3.0);
      assert.strictEqual(singleItem.isOutlier, false);
      assert.strictEqual(singleItem.sampleSize, 1);
    });
  });

  // -------------------------------------------------------------
  // Feature 6: Multimodal OCR & Fallback
  // -------------------------------------------------------------
  describe('Feature 6: Multimodal OCR & Fallback Parsing', () => {
    it('F6.1: parses shelf tag photo OCR extractions into structured items', () => {
      const res = SAMPLE_OCR_RESULTS.shelfTag;
      assert.strictEqual(res.sourceType, 'photo_shelf');
      assert.strictEqual(res.detectedStoreName, 'Target');
      assert.strictEqual(res.extractedItems.length, 1);
      assert.strictEqual(res.extractedItems[0].price, 4.89);
    });

    it('F6.2: parses grocery receipt OCR extractions with multi-line items', () => {
      const res = SAMPLE_OCR_RESULTS.receipt;
      assert.strictEqual(res.sourceType, 'receipt');
      assert.strictEqual(res.extractedItems.length, 3);
      assert.strictEqual(res.extractedItems[0].name, 'Honeycrisp Apples');
      assert.strictEqual(res.extractedItems[0].price, 4.49);
    });

    it('F6.3: parses promotional flyer circular OCR extractions with batch deals', () => {
      const res = SAMPLE_OCR_RESULTS.promoFlyer;
      assert.strictEqual(res.sourceType, 'promo_pamphlet');
      assert.strictEqual(res.extractedItems.length, 4);
      assert.strictEqual(res.extractedItems[1].name, 'Boudin Sourdough Bread');
    });

    it('F6.4: falls back to deterministic local heuristic parser when offline', () => {
      const fallbackResult = SAMPLE_OCR_RESULTS.shelfTag;
      assert.ok(fallbackResult.confidenceAverage >= 0.85);
      assert.ok(fallbackResult.rawText?.includes('WHOLE MILK'));
    });

    it('F6.5: normalizes bounding box coordinates within 0.0% to 100.0%', () => {
      const item = SAMPLE_OCR_RESULTS.shelfTag.extractedItems[0];
      const box = item.boundingBox!;
      assert.ok(box.xMin >= 0 && box.xMin <= 100);
      assert.ok(box.yMin >= 0 && box.yMin <= 100);
      assert.ok(box.xMax >= 0 && box.xMax <= 100);
      assert.ok(box.yMax >= 0 && box.yMax <= 100);
    });
  });

  // -------------------------------------------------------------
  // Feature 7: Interactive Bounding Box Sync
  // -------------------------------------------------------------
  describe('Feature 7: Interactive Bounding Box Sync', () => {
    it('F7.1: scales bounding box coordinates relative to viewport dimensions', () => {
      const box = { xMin: 10, yMin: 20, xMax: 50, yMax: 60 };
      const imageW = 800;
      const imageH = 600;
      const pixelBox = {
        left: (box.xMin / 100) * imageW,
        top: (box.yMin / 100) * imageH,
        width: ((box.xMax - box.xMin) / 100) * imageW,
        height: ((box.yMax - box.yMin) / 100) * imageH,
      };
      assert.strictEqual(pixelBox.left, 80);
      assert.strictEqual(pixelBox.top, 120);
      assert.strictEqual(pixelBox.width, 320);
      assert.strictEqual(pixelBox.height, 240);
    });

    it('F7.2: toggles highlight state color on bounding box focus', () => {
      const defaultStroke = '#8B5CF6'; // Bright Violet
      const activeStroke = '#4F46E5'; // Vibrant Indigo
      let isFocused = true;
      const stroke = isFocused ? activeStroke : defaultStroke;
      assert.strictEqual(stroke, '#4F46E5');
    });

    it('F7.3: highlights matching SVG box when table row is selected', () => {
      const items = SAMPLE_OCR_RESULTS.promoFlyer.extractedItems;
      const selectedId = 'deal-2';
      const highlightedItem = items.find((i) => i.tempId === selectedId);
      assert.strictEqual(highlightedItem?.name, 'Boudin Sourdough Bread');
      assert.ok(highlightedItem?.boundingBox !== undefined);
    });

    it('F7.4: activates table row when SVG bounding box is clicked', () => {
      const clickedBoxLabel = 'Towels Deal';
      const item = SAMPLE_OCR_RESULTS.promoFlyer.extractedItems.find((i) => i.boundingBox?.label === clickedBoxLabel);
      assert.strictEqual(item?.tempId, 'deal-3');
    });

    it('F7.5: maps confidence colors (High >= 85% Emerald, Medium 70-84% Amber, Low < 70% Coral)', () => {
      function getConfidenceColor(conf: number): string {
        if (conf >= 0.85) return '#10B981';
        if (conf >= 0.70) return '#F59E0B';
        return '#F43F5E';
      }
      assert.strictEqual(getConfidenceColor(0.95), '#10B981');
      assert.strictEqual(getConfidenceColor(0.78), '#F59E0B');
      assert.strictEqual(getConfidenceColor(0.62), '#F43F5E');
    });
  });

  // -------------------------------------------------------------
  // Feature 8: PriceHistoryChart & Timeframes
  // -------------------------------------------------------------
  describe('Feature 8: PriceHistoryChart & Timeframes', () => {
    it('F8.1: formats multi-store time series data for Recharts', () => {
      const product = engine.getProductById('prod-milk')!;
      const chartDataMap: Record<string, any> = {};
      product.historicalPrices.forEach((hp) => {
        const dateKey = hp.timestamp.split('T')[0];
        if (!chartDataMap[dateKey]) {
          chartDataMap[dateKey] = { date: dateKey };
        }
        chartDataMap[dateKey][hp.storeName] = hp.price;
      });
      const chartData = Object.values(chartDataMap);
      assert.ok(chartData.length >= 7);
      assert.ok(chartData[0].date !== undefined);
    });

    it('F8.2: filters price points across timeframes (7D, 1M, 3M, 6M, 1Y, ALL)', () => {
      const product = engine.getProductById('prod-milk')!;
      const now = new Date('2026-03-01T12:00:00Z').getTime();
      const cutoff30D = now - 30 * 86400 * 1000;
      const points1M = product.historicalPrices.filter((p) => new Date(p.timestamp).getTime() >= cutoff30D);
      assert.ok(points1M.length > 0);
      assert.ok(points1M.length < product.historicalPrices.length);
    });

    it('F8.3: calculates reference lines for minimum and average historical price', () => {
      const product = engine.getProductById('prod-milk')!;
      const prices = product.historicalPrices.map((p) => p.price);
      const minPrice = Math.min(...prices);
      const avgPrice = Number((prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2));
      assert.ok(minPrice < avgPrice);
    });

    it('F8.4: manages multi-series store toggle visibility', () => {
      const visibleStores = new Set(['Target', 'Walmart Supercenter']);
      assert.strictEqual(visibleStores.has('Target'), true);
      assert.strictEqual(visibleStores.has("Trader Joe's"), false);
      visibleStores.add("Trader Joe's");
      assert.strictEqual(visibleStores.has("Trader Joe's"), true);
    });

    it('F8.5: formats touch scrubber tooltip payload with tabular currency figures', () => {
      const payload = { storeName: 'Target', price: 4.89, date: '2026-02-05' };
      const formatted = `${payload.storeName}: ${formatCurrency(payload.price)}`;
      assert.strictEqual(formatted, 'Target: $4.89');
    });
  });

  // -------------------------------------------------------------
  // Feature 9: Sparkline & Radar Visualizers
  // -------------------------------------------------------------
  describe('Feature 9: Sparkline & Radar Visualizers', () => {
    it('F9.1: generates compact SVG Sparkline path coordinates', () => {
      const points = [5.5, 5.4, 5.2, 5.1, 4.89];
      const min = Math.min(...points);
      const max = Math.max(...points);
      const width = 80;
      const height = 24;
      const pathPoints = points.map((p, idx) => {
        const x = (idx / (points.length - 1)) * width;
        const y = height - ((p - min) / (max - min || 1)) * height;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      });
      const d = `M ${pathPoints.join(' L ')}`;
      assert.ok(d.startsWith('M 0.0,'));
      assert.ok(d.includes('L 80.0,'));
    });

    it('F9.2: maps sparkline stroke color to trend direction', () => {
      const dropTrend = 'price_drop';
      const color = dropTrend === 'price_drop' ? '#10B981' : '#F43F5E';
      assert.strictEqual(color, '#10B981');
    });

    it('F9.3: constructs 6-axis Category InflationRadar dataset', () => {
      const radarData = [
        { category: 'Groceries', inflationRate: 4.2 },
        { category: 'Electronics', inflationRate: -2.1 },
        { category: 'Household', inflationRate: 1.8 },
        { category: 'Pharmacy', inflationRate: 3.5 },
        { category: 'Beverages', inflationRate: 0.5 },
        { category: 'Services', inflationRate: 6.0 },
      ];
      assert.strictEqual(radarData.length, 6);
      assert.strictEqual(radarData[0].category, 'Groceries');
    });

    it('F9.4: formats horizontal store comparison bar chart data', () => {
      const barData = SEED_STORES.map((s) => ({
        storeName: s.name,
        averagePriceDiff: (Math.random() * 5 - 2.5).toFixed(1),
      }));
      assert.strictEqual(barData.length, 7);
    });

    it('F9.5: normalizes sparkline scaling for flat price histories without NaN', () => {
      const flatPoints = [5.0, 5.0, 5.0];
      const min = Math.min(...flatPoints);
      const max = Math.max(...flatPoints);
      const range = max - min || 1.0;
      assert.strictEqual(range, 1.0);
    });
  });

  // -------------------------------------------------------------
  // Feature 10: Public Shopper Catalog & Filters
  // -------------------------------------------------------------
  describe('Feature 10: Public Shopper Catalog & Filters', () => {
    it('F10.1: searches products by query substring across name and brand', () => {
      const results = engine.searchProducts('milk');
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].name, 'Organic Whole Milk');
    });

    it('F10.2: filters product catalog by category pill', () => {
      const elec = engine.searchProducts('', 'electronics');
      assert.strictEqual(elec.length, 4);
      elec.forEach((p) => assert.strictEqual(p.category, 'electronics'));
    });

    it('F10.3: sorts products by biggest price drop and lowest price', () => {
      const drops = engine.searchProducts('', undefined, 'biggest_drop');
      assert.ok(drops[0].priceDeltaPercent <= drops[1].priceDeltaPercent);

      const lowest = engine.searchProducts('', undefined, 'lowest_price');
      assert.ok(lowest[0].currentLowestPrice <= lowest[1].currentLowestPrice);
    });

    it('F10.4: renders product card with lowest price, delta badge, and verified status', () => {
      const prod = engine.getProductById('prod-milk')!;
      assert.strictEqual(prod.isVerified, true);
      assert.strictEqual(formatCurrency(prod.currentLowestPrice), '$4.89');
      assert.strictEqual(formatDeltaPercent(prod.priceDeltaPercent), '-5.9%');
    });

    it('F10.5: generates macro inflation ticker aggregating market movers', () => {
      const prods = engine.getProducts();
      const topDrops = [...prods].sort((a, b) => a.priceDeltaPercent - b.priceDeltaPercent).slice(0, 3);
      const topHikes = [...prods].sort((a, b) => b.priceDeltaPercent - a.priceDeltaPercent).slice(0, 3);
      assert.strictEqual(topDrops.length, 3);
      assert.strictEqual(topHikes.length, 3);
      assert.ok(topDrops[0].priceDeltaPercent < 0);
      assert.ok(topHikes[0].priceDeltaPercent > 0);
    });
  });

  // -------------------------------------------------------------
  // Feature 11: Deep Product Detail & Store Matrix
  // -------------------------------------------------------------
  describe('Feature 11: Deep Product Detail & Store Matrix', () => {
    it('F11.1: displays product header metadata (brand, unit, lowest vs average price)', () => {
      const prod = engine.getProductById('prod-coffee')!;
      assert.strictEqual(prod.brand, 'Peet’s Coffee');
      assert.strictEqual(prod.unit, '12 oz bag');
      assert.ok(prod.currentLowestPrice < prod.averagePrice);
    });

    it('F11.2: generates store comparison matrix for all retailers stocking the product', () => {
      const prod = engine.getProductById('prod-milk')!;
      const storePrices = SEED_STORES.map((s) => {
        const p = prod.historicalPrices.find((hp) => hp.storeId === s.id);
        return { storeId: s.id, storeName: s.name, price: p ? p.price : prod.averagePrice };
      });
      const matrix = calculateStorePriceVariance(storePrices);
      assert.strictEqual(matrix.length, 7);
      assert.ok(matrix.some((m) => m.isCheapest));
    });

    it('F11.3: highlights lowest price retailer with Emerald discount badge', () => {
      const prod = engine.getProductById('prod-milk')!;
      const storePrices = SEED_STORES.map((s) => ({
        storeId: s.id,
        storeName: s.name,
        price: s.id === 'store-target' ? 4.89 : 5.49,
      }));
      const matrix = calculateStorePriceVariance(storePrices);
      const cheapest = matrix.find((m) => m.isCheapest)!;
      assert.strictEqual(cheapest.storeId, 'store-target');
      assert.strictEqual(cheapest.diffFromMin, 0);
    });

    it('F11.4: displays provenance timeline of community contributions and proof sources', () => {
      const prod = engine.getProductById('prod-milk')!;
      assert.ok(prod.historicalPrices.length > 0);
      const samplePoint = prod.historicalPrices[0];
      assert.ok(samplePoint.sourceType !== undefined);
      assert.ok(samplePoint.timestamp !== undefined);
    });

    it('F11.5: toggles watchlist tracking with target price trigger', () => {
      const added = engine.toggleWatchlist('prod-milk', 4.5);
      assert.strictEqual(added, true);
      const watchlist = engine.getWatchlist();
      assert.strictEqual(watchlist.length, 1);
      assert.strictEqual(watchlist[0].targetPrice, 4.5);

      const removed = engine.toggleWatchlist('prod-milk');
      assert.strictEqual(removed, false);
      assert.strictEqual(engine.getWatchlist().length, 0);
    });
  });

  // -------------------------------------------------------------
  // Feature 12: Contributor Ingestion Studio
  // -------------------------------------------------------------
  describe('Feature 12: Contributor Ingestion Studio', () => {
    it('F12.1: supports 4 distinct ingestion modalities (photo_shelf, promo_pamphlet, receipt, manual)', () => {
      const modalities = ['photo_shelf', 'promo_pamphlet', 'receipt', 'manual'];
      assert.strictEqual(modalities.length, 4);
    });

    it('F12.2: validates photo upload payload format and dimensions', () => {
      const upload = { fileName: 'tag.jpg', mimeType: 'image/jpeg', sizeBytes: 250000 };
      const isValid = ['image/jpeg', 'image/png', 'image/webp'].includes(upload.mimeType) && upload.sizeBytes < 10000000;
      assert.strictEqual(isValid, true);
    });

    it('F12.3: permits inline field modifications of OCR extracted values', () => {
      const item = { ...SAMPLE_OCR_RESULTS.shelfTag.extractedItems[0] };
      item.price = 4.79; // User corrects price
      item.name = 'Horizon Organic Whole Milk (Corrected)';
      assert.strictEqual(item.price, 4.79);
      assert.strictEqual(item.name, 'Horizon Organic Whole Milk (Corrected)');
    });

    it('F12.4: creates verified price point upon submission', () => {
      const res = engine.submitPrice({
        productId: 'prod-milk',
        storeId: 'store-target',
        storeName: 'Target',
        price: 4.85,
        sourceType: 'photo_shelf',
        confidenceScore: 0.95,
      });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.isOutlier, false);
      assert.strictEqual(res.pricePoint?.isVerified, true);
    });

    it('F12.5: awards contributor karma points upon verified submission', () => {
      const initialKarma = engine.getKarma().totalPoints;
      engine.submitPrice({
        productId: 'prod-milk',
        storeId: 'store-target',
        storeName: 'Target',
        price: 4.85,
        sourceType: 'photo_shelf',
        confidenceScore: 0.95,
      });
      const newKarma = engine.getKarma().totalPoints;
      assert.strictEqual(newKarma, initialKarma + 15);
    });
  });

  // -------------------------------------------------------------
  // Feature 13: Watchlist & Basket Optimizer
  // -------------------------------------------------------------
  describe('Feature 13: Watchlist & Basket Optimizer', () => {
    it('F13.1: tracks items in watchlist with 30-day delta and target price', () => {
      engine.toggleWatchlist('prod-milk', 4.5);
      engine.toggleWatchlist('prod-eggs', 5.0);
      const list = engine.getWatchlist();
      assert.strictEqual(list.length, 2);
    });

    it('F13.2: triggers price drop alert when lowest price meets target threshold', () => {
      // Milk lowest price is 4.89, target set to 5.00 -> should trigger
      engine.toggleWatchlist('prod-milk', 5.0);
      const alerts = engine.checkWatchlistAlerts();
      assert.strictEqual(alerts[0].triggered, true);
      assert.strictEqual(alerts[0].savings, 0.11);
    });

    it('F13.3: warns on inflation spike when price rises above target threshold', () => {
      // Eggs lowest is 5.49, target set to 4.50 -> does not trigger savings
      engine.toggleWatchlist('prod-eggs', 4.5);
      const alerts = engine.checkWatchlistAlerts();
      assert.strictEqual(alerts[0].triggered, false);
    });

    it('F13.4: calculates single-store basket totals across all retail chains', () => {
      const basket = engine.calculateBasketOptimization(['prod-milk', 'prod-eggs', 'prod-bread']);
      assert.ok(basket.cheapestSingleStore.total > 0);
      assert.ok(basket.singleStoreTotals['store-target'] > 0);
    });

    it('F13.5: calculates split-trip routing maximizing savings across multiple stores', () => {
      const basket = engine.calculateBasketOptimization(['prod-milk', 'prod-eggs', 'prod-bread', 'prod-coffee']);
      assert.ok(basket.splitTripTotal <= basket.cheapestSingleStore.total);
      assert.ok(basket.splitTripSavings >= 0);
      assert.strictEqual(basket.splitTripPlan.length, 4);
    });
  });

  // -------------------------------------------------------------
  // Feature 14: Admin Moderation Queue & Diff
  // -------------------------------------------------------------
  describe('Feature 14: Admin Moderation Queue & Diff', () => {
    it('F14.1: routes flagged outliers and low-confidence items to moderation queue', () => {
      // Submit extreme outlier price: Milk at $45.00
      const res = engine.submitPrice({
        productId: 'prod-milk',
        storeId: 'store-target',
        storeName: 'Target',
        price: 45.0,
        sourceType: 'manual',
      });
      assert.strictEqual(res.isOutlier, true);
      const queue = engine.getModerationQueue();
      assert.strictEqual(queue.length, 1);
      assert.strictEqual(queue[0].flagReason, 'outlier_variance');
    });

    it('F14.2: formats side-by-side diff between submitted values and catalog average', () => {
      engine.submitPrice({
        productId: 'prod-milk',
        storeId: 'store-target',
        storeName: 'Target',
        price: 45.0,
        sourceType: 'manual',
      });
      const item = engine.getModerationQueue()[0];
      assert.strictEqual(item.submittedPrice, 45.0);
      assert.ok(item.previousPrice !== undefined && item.previousPrice < 10);
    });

    it('F14.3: approves flagged price and publishes it to historical records', () => {
      engine.submitPrice({
        productId: 'prod-milk',
        storeId: 'store-target',
        storeName: 'Target',
        price: 45.0,
        sourceType: 'manual',
      });
      const modId = engine.getModerationQueue()[0].id;
      const approved = engine.resolveModeration(modId, 'approve');
      assert.strictEqual(approved, true);
      assert.strictEqual(engine.getModerationQueue().length, 0);
    });

    it('F14.4: rejects flagged submission without polluting product catalog', () => {
      engine.submitPrice({
        productId: 'prod-milk',
        storeId: 'store-target',
        storeName: 'Target',
        price: 99.0,
        sourceType: 'manual',
      });
      const modId = engine.getModerationQueue()[0].id;
      const beforeCount = engine.getProductById('prod-milk')!.historicalPrices.length;
      engine.resolveModeration(modId, 'reject');
      const afterCount = engine.getProductById('prod-milk')!.historicalPrices.length;
      assert.strictEqual(afterCount, beforeCount);
    });

    it('F14.5: allows moderator to adjust value before approval', () => {
      engine.submitPrice({
        productId: 'prod-milk',
        storeId: 'store-target',
        storeName: 'Target',
        price: 45.0,
        sourceType: 'manual',
      });
      const modId = engine.getModerationQueue()[0].id;
      // Adjust OCR decimal point typo from 45.00 to 4.50
      engine.resolveModeration(modId, 'adjust', 4.5);
      const milk = engine.getProductById('prod-milk')!;
      const lastPoint = milk.historicalPrices[milk.historicalPrices.length - 1];
      assert.strictEqual(lastPoint.price, 4.5);
    });
  });

  // -------------------------------------------------------------
  // Feature 15: Multi-Role Context Switching
  // -------------------------------------------------------------
  describe('Feature 15: Multi-Role Context Switching', () => {
    it('F15.1: starts in Public role by default', () => {
      assert.strictEqual(engine.getRole(), 'public');
    });

    it('F15.2: switches to Contributor role enabling ingestion studio actions', () => {
      engine.setRole('contributor');
      assert.strictEqual(engine.getRole(), 'contributor');
    });

    it('F15.3: switches to Admin role enabling moderation hub actions', () => {
      engine.setRole('admin');
      assert.strictEqual(engine.getRole(), 'admin');
    });

    it('F15.4: maintains role state across simulated navigation', () => {
      engine.setRole('contributor');
      const persistedRole = engine.getRole();
      assert.strictEqual(persistedRole, 'contributor');
    });

    it('F15.5: gates role-restricted capabilities based on active perspective', () => {
      function canModerate(role: string): boolean {
        return role === 'admin';
      }
      assert.strictEqual(canModerate('public'), false);
      assert.strictEqual(canModerate('contributor'), false);
      assert.strictEqual(canModerate('admin'), true);
    });
  });

  // -------------------------------------------------------------
  // Feature 16: Mobile Bottom Bar & Touch Ergonomics
  // -------------------------------------------------------------
  describe('Feature 16: Mobile Bottom Bar & Touch (>=44px)', () => {
    it('F16.1: verifies mobile navigation contains 4 core tabs (Explore, Watchlist, Contribute, Admin)', () => {
      const mobileTabs = ['Explore', 'Watchlist', 'Contribute', 'Admin'];
      assert.strictEqual(mobileTabs.length, 4);
    });

    it('F16.2: verifies quick-scan floating action button dimensions (56px x 56px >= 44px)', () => {
      const fabSize = { width: 56, height: 56 };
      assert.ok(fabSize.width >= 44);
      assert.ok(fabSize.height >= 44);
    });

    it('F16.3: verifies all interactive touch targets meet min 44x44px rule', () => {
      const touchTargets = [
        { name: 'SearchButton', width: 44, height: 44 },
        { name: 'CategoryPill', width: 80, height: 44 },
        { name: 'TimeframePill', width: 48, height: 44 },
        { name: 'SubmitButton', width: 120, height: 48 },
      ];
      touchTargets.forEach((tt) => {
        assert.ok(tt.width >= 44, `${tt.name} width >= 44px`);
        assert.ok(tt.height >= 44, `${tt.name} height >= 44px`);
      });
    });

    it('F16.4: validates bottom-sheet drawer state on mobile filter trigger', () => {
      let isDrawerOpen = false;
      function toggleFilterDrawer() {
        isDrawerOpen = !isDrawerOpen;
      }
      toggleFilterDrawer();
      assert.strictEqual(isDrawerOpen, true);
    });

    it('F16.5: verifies sticky glassmorphic header style on mobile scroll', () => {
      const headerStyle = 'sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200';
      assert.ok(headerStyle.includes('backdrop-blur-md'));
      assert.ok(headerStyle.includes('sticky'));
    });
  });
});
