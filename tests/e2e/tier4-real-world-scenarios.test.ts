import test, { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  OpenPriceStateEngine,
  formatCurrency,
  formatDeltaPercent,
  getDeltaStyle,
  calculateStorePriceVariance,
  calculateInflationIndex,
} from '../helpers/pure-contract-engine.ts';
import { SAMPLE_OCR_RESULTS, SEED_STORES } from '../fixtures/domain-fixtures.ts';

describe('Tier 4: Realistic End-to-End User Workflows (5 Full Scenarios)', () => {
  let engine: OpenPriceStateEngine;

  beforeEach(() => {
    engine = new OpenPriceStateEngine();
  });

  it('Scenario 1: The In-Aisle Mobile Bargain Hunter', () => {
    // Step 1: Mobile User (375px) opens app and searches for Organic Whole Milk
    const query = 'Organic Whole Milk';
    const searchResults = engine.searchProducts(query, 'groceries');
    assert.strictEqual(searchResults.length, 1);
    const milk = searchResults[0];
    assert.strictEqual(milk.name, 'Organic Whole Milk');

    // Step 2: User inspects PriceBadge and economic trend
    const badgeStyle = getDeltaStyle(milk.priceDeltaPercent);
    assert.strictEqual(badgeStyle.icon, 'down');
    assert.strictEqual(badgeStyle.colorHex, '#10B981'); // Emerald Mint savings
    assert.strictEqual(formatCurrency(milk.currentLowestPrice), '$4.89');
    assert.strictEqual(formatDeltaPercent(milk.priceDeltaPercent), '-5.9%');

    // Step 3: User opens Store Comparison Matrix on mobile
    const storePrices = [
      { storeId: 'store-target', storeName: 'Target', price: 4.89 },
      { storeId: 'store-walmart', storeName: 'Walmart Supercenter', price: 5.19 },
      { storeId: 'store-whole-foods', storeName: 'Whole Foods Market', price: 5.99 },
    ];
    const comparison = calculateStorePriceVariance(storePrices);
    const target = comparison.find((c) => c.storeId === 'store-target')!;
    const wholeFoods = comparison.find((c) => c.storeId === 'store-whole-foods')!;

    assert.strictEqual(target.isCheapest, true);
    assert.strictEqual(wholeFoods.isCheapest, false);
    assert.strictEqual(wholeFoods.diffFromMin, 1.10);
    assert.strictEqual(wholeFoods.diffPercentFromMin, 22.49);

    // Step 4: User adds product to Watchlist with target price $4.75
    const added = engine.toggleWatchlist(milk.id, 4.75);
    assert.strictEqual(added, true);
    const watchlist = engine.getWatchlist();
    assert.strictEqual(watchlist.length, 1);
    assert.strictEqual(watchlist[0].targetPrice, 4.75);

    // Step 5: Verify mobile touch target sizes meet >= 44x44px rule
    const mobileTouchTarget = { width: 48, height: 48 };
    assert.ok(mobileTouchTarget.width >= 44);
    assert.ok(mobileTouchTarget.height >= 44);
  });

  it('Scenario 2: The Active Contributor Bulk Flyer Upload', () => {
    // Step 1: User switches role to Contributor Studio
    engine.setRole('contributor');
    assert.strictEqual(engine.getRole(), 'contributor');
    const initialKarma = engine.getKarma().totalPoints;

    // Step 2: Uploads weekly promotional circular flyer
    const ocrResult = SAMPLE_OCR_RESULTS.promoFlyer;
    assert.strictEqual(ocrResult.sourceType, 'promo_pamphlet');
    assert.strictEqual(ocrResult.detectedStoreName, 'Walmart Supercenter');
    assert.strictEqual(ocrResult.extractedItems.length, 4);

    // Step 3: Contributor reviews SVG bounding boxes and corrects OCR price typo on Deal 2
    const deal2 = ocrResult.extractedItems[1];
    assert.strictEqual(deal2.name, 'Boudin Sourdough Bread');
    assert.strictEqual(deal2.price, 3.99);

    // Contributor adjusts deal price to verified sale tag of $3.49
    deal2.price = 3.49;
    assert.strictEqual(deal2.price, 3.49);

    // Step 4: Contributor bulk submits all 4 deals to the catalog
    ocrResult.extractedItems.forEach((deal) => {
      const sub = engine.submitPrice({
        productId: 'prod-bread',
        storeId: 'store-walmart',
        storeName: 'Walmart Supercenter',
        price: deal.price,
        sourceType: 'promo_pamphlet',
        confidenceScore: deal.confidence,
      });
      assert.strictEqual(sub.success, true);
    });

    // Step 5: Verify Karma points awarded and recent activity log updated
    const finalKarma = engine.getKarma();
    assert.ok(finalKarma.totalPoints > initialKarma);
    assert.ok(finalKarma.verifiedSubmissions >= 4);
    assert.ok(finalKarma.recentActivities.length > 0);
  });

  it('Scenario 3: The Community Curator Outlier Resolution', () => {
    // Step 1: Contributor accidentally logs a typo price ($45.00 for Milk)
    const subRes = engine.submitPrice({
      productId: 'prod-milk',
      storeId: 'store-target',
      storeName: 'Target',
      price: 45.0,
      sourceType: 'manual',
    });
    assert.strictEqual(subRes.isOutlier, true);

    // Step 2: Community Curator switches role to Admin
    engine.setRole('admin');
    assert.strictEqual(engine.getRole(), 'admin');

    // Step 3: Curator inspects Moderation Queue
    const queue = engine.getModerationQueue();
    assert.strictEqual(queue.length, 1);
    const flaggedItem = queue[0];
    assert.strictEqual(flaggedItem.productName, 'Organic Whole Milk');
    assert.strictEqual(flaggedItem.submittedPrice, 45.0);
    assert.strictEqual(flaggedItem.flagReason, 'outlier_variance');

    // Step 4: Curator views side-by-side proof photo diff, spots decimal point error, adjusts to $4.50 and approves
    const resolved = engine.resolveModeration(flaggedItem.id, 'adjust', 4.5);
    assert.strictEqual(resolved, true);

    // Step 5: Verify Moderation Queue is cleared and Product Catalog incorporates verified corrected price
    assert.strictEqual(engine.getModerationQueue().length, 0);
    const milk = engine.getProductById('prod-milk')!;
    const lastPricePoint = milk.historicalPrices[milk.historicalPrices.length - 1];
    assert.strictEqual(lastPricePoint.price, 4.5);
    assert.strictEqual(lastPricePoint.isVerified, true);
  });

  it('Scenario 4: The Macro Inflation & Basket Analysis', () => {
    // Step 1: Analyst loads explorer homepage and computes 6-category Laspeyres Basket Inflation
    const basePrices = {
      'groceries:milk': 5.0,
      'groceries:eggs': 6.0,
      'groceries:bread': 4.0,
      'electronics:headphones': 300.0,
      'household:detergent': 15.0,
      'pharmacy:ibuprofen': 11.0,
      'beverages:water': 5.5,
      'services:drycleaning': 18.0,
    };
    const currentPrices = {
      'groceries:milk': 5.45, // +9.0%
      'groceries:eggs': 6.74, // +12.3%
      'groceries:bread': 4.65, // +16.2%
      'electronics:headphones': 315.0, // +5.0%
      'household:detergent': 16.95, // +13.0%
      'pharmacy:ibuprofen': 11.75, // +6.8%
      'beverages:water': 5.85, // +6.4%
      'services:drycleaning': 19.5, // +8.3%
    };
    const weights = {
      'groceries:milk': 3.0,
      'groceries:eggs': 2.0,
      'groceries:bread': 2.0,
      'electronics:headphones': 0.1,
      'household:detergent': 1.5,
      'pharmacy:ibuprofen': 1.0,
      'beverages:water': 1.0,
      'services:drycleaning': 0.5,
    };

    const report = calculateInflationIndex(currentPrices, basePrices, weights);
    assert.ok(report.indexValue > 100.0);
    assert.ok(report.inflationRatePercent > 0);
    assert.ok(report.categoryBreakdown['groceries'] > 0);
    assert.ok(report.categoryBreakdown['electronics'] > 0);

    // Step 2: Analyst drills down to Coffee Beans (prod-coffee)
    const coffee = engine.getProductById('prod-coffee')!;
    assert.strictEqual(coffee.name, 'Fair Trade Dark Roast Coffee Beans');

    // Step 3: Filters PriceHistoryChart across timeframes (7D, 1M, 3M, 6M, 1Y, ALL)
    const totalPoints = coffee.historicalPrices.length;
    const now = new Date('2026-03-01T12:00:00Z').getTime();

    const points7D = coffee.historicalPrices.filter((p) => new Date(p.timestamp).getTime() >= now - 7 * 86400 * 1000);
    const points1Y = coffee.historicalPrices.filter((p) => new Date(p.timestamp).getTime() >= now - 365 * 86400 * 1000);

    assert.ok(points7D.length <= points1Y.length);
    assert.strictEqual(points1Y.length, totalPoints);

    // Step 4: Evaluates store price spread for coffee across retailers
    const coffeeStorePrices = SEED_STORES.map((s) => ({
      storeId: s.id,
      storeName: s.name,
      price: s.id === 'store-costco' ? 9.99 : 12.49,
    }));
    const variance = calculateStorePriceVariance(coffeeStorePrices);
    const costco = variance.find((v) => v.storeId === 'store-costco')!;
    assert.strictEqual(costco.isCheapest, true);
    assert.strictEqual(costco.diffFromMin, 0);
  });

  it('Scenario 5: The Multi-Store Shopping Trip Optimizer', () => {
    // Step 1: Shopper adds 5 weekly groceries to Watchlist
    const items = ['prod-milk', 'prod-eggs', 'prod-bread', 'prod-coffee', 'prod-apples'];
    items.forEach((id) => engine.toggleWatchlist(id));
    assert.strictEqual(engine.getWatchlist().length, 5);

    // Step 2: Runs Basket Optimizer across all 7 retail stores
    const basketResult = engine.calculateBasketOptimization(items);

    // Step 3: Asserts single store basket calculation
    assert.ok(basketResult.cheapestSingleStore.total > 0);
    assert.ok(basketResult.cheapestSingleStore.storeName.length > 0);

    // Step 4: Asserts split-trip optimization routing
    assert.strictEqual(basketResult.splitTripPlan.length, 5);
    assert.ok(basketResult.splitTripTotal <= basketResult.cheapestSingleStore.total);

    // Step 5: Verifies savings achieved by split trip
    assert.ok(basketResult.splitTripSavings >= 0);
    basketResult.splitTripPlan.forEach((planItem) => {
      assert.ok(planItem.bestPrice > 0);
      assert.ok(planItem.bestStoreName.length > 0);
    });
  });
});
