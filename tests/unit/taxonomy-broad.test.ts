import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CATEGORY_METADATA, SEED_PRODUCTS, SEED_STORES } from '../../src/lib/mock-data.ts';
import { getStoredCategoryMetadata, getStoredProducts, getStoredStores } from '../../src/lib/storage.ts';

describe('Unit Tests: Broad Multi-Sector Taxonomy (Subscriptions & Automotive)', () => {
  it('contains subscriptions and vehicles_automotive categories in CATEGORY_METADATA', () => {
    assert.ok(CATEGORY_METADATA.subscriptions);
    assert.strictEqual(CATEGORY_METADATA.subscriptions.displayName, 'Subscriptions & Digital Services');
    assert.ok(CATEGORY_METADATA.subscriptions.standardUnits?.includes('/month'));
    assert.ok(CATEGORY_METADATA.subscriptions.standardUnits?.includes('/year'));

    assert.ok(CATEGORY_METADATA.vehicles_automotive);
    assert.strictEqual(CATEGORY_METADATA.vehicles_automotive.displayName, 'Vehicles & Automotive');
    assert.ok(CATEGORY_METADATA.vehicles_automotive.standardUnits?.includes('OTD cash'));
    assert.ok(CATEGORY_METADATA.vehicles_automotive.standardUnits?.includes('MSRP'));
    assert.ok(CATEGORY_METADATA.vehicles_automotive.standardUnits?.includes('lease/mo'));
  });

  it('guarantees all category basket weights sum to exactly 1.00', () => {
    const totalWeight = Object.values(CATEGORY_METADATA).reduce(
      (sum, cat) => sum + cat.inflationBasketWeight,
      0
    );
    assert.strictEqual(Number(totalWeight.toFixed(2)), 1.00);
  });

  it('provides realistic seed products for subscription services', () => {
    const streaming = SEED_PRODUCTS.find((p) => p.id === 'prod-streaming-family');
    assert.ok(streaming);
    assert.strictEqual(streaming?.category, 'subscriptions');
    assert.strictEqual(streaming?.unit, '/month');
    assert.strictEqual(streaming?.brand, 'StreamMax Direct');
    assert.ok(streaming?.currentLowestPrice && streaming.currentLowestPrice > 0);

    const gym = SEED_PRODUCTS.find((p) => p.id === 'prod-gym-membership');
    assert.ok(gym);
    assert.strictEqual(gym?.category, 'subscriptions');
    assert.strictEqual(gym?.unit, '/month');
  });

  it('provides realistic seed products for automotive and motorcycles', () => {
    const ev = SEED_PRODUCTS.find((p) => p.id === 'prod-commuter-ev');
    assert.ok(ev);
    assert.strictEqual(ev?.category, 'vehicles_automotive');
    assert.strictEqual(ev?.unit, 'MSRP');
    assert.strictEqual(ev?.currentLowestPrice, 27990.00);

    const moto = SEED_PRODUCTS.find((p) => p.id === 'prod-commuter-motorcycle');
    assert.ok(moto);
    assert.strictEqual(moto?.category, 'vehicles_automotive');
    assert.strictEqual(moto?.unit, 'OTD cash');
    assert.strictEqual(moto?.currentLowestPrice, 3499.00);
  });

  it('provides digital platform and auto dealer stores in SEED_STORES', () => {
    const digital = SEED_STORES.find((s) => s.id === 'store-direct-sub');
    assert.ok(digital);
    assert.strictEqual(digital?.type, 'online');

    const autoDealer = SEED_STORES.find((s) => s.id === 'store-metro-motors');
    assert.ok(autoDealer);
    assert.strictEqual(autoDealer?.type, 'hybrid');
  });
});
