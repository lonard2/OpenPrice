'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Camera,
  BarChart3,
  Scale,
  Sparkles,
  Layers,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { useRoleView } from '@/components/providers/RoleContext';
import { ProductGrid } from '@/components/product/ProductGrid';
import { StoreComparisonTable } from '@/components/product/StoreComparisonTable';
import { StoreComparisonChart } from '@/components/charts/StoreComparisonChart';
import { Drawer } from '@/components/ui/Drawer';
import { PriceBadge } from '@/components/product/PriceBadge';
import {
  getStoredProducts,
  getStoredWatchlist,
  toggleWatchlistProduct,
  subscribeToStorageChanges,
} from '@/lib/storage';
import { calculateInflationIndex, calculateStorePriceVariance } from '@/lib/inflation';
import { formatDeltaPercent } from '@/lib/formatters';
import { CATEGORY_METADATA } from '@/lib/mock-data';
import type { Product, ProductCategory, StorePriceComparison, PriceSourceType } from '@/types';

export default function HomePage() {
  const { role } = useRoleView();
  const [products, setProducts] = useState<Product[]>([]);
  const [watchlistedIds, setWatchlistedIds] = useState<string[]>([]);
  const [comparedProduct, setComparedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');

  // Load products and watchlist from reactive storage
  useEffect(() => {
    const loadData = () => {
      const storedProducts = getStoredProducts();
      setProducts(storedProducts);

      const watchlist = getStoredWatchlist();
      setWatchlistedIds(watchlist.map((w) => w.productId));
    };

    loadData();
    const unsubscribe = subscribeToStorageChanges(loadData);
    return () => unsubscribe();
  }, []);

  // Handle Watchlist toggle
  const handleToggleWatchlist = (product: Product) => {
    toggleWatchlistProduct(product);
    const updated = getStoredWatchlist();
    setWatchlistedIds(updated.map((w) => w.productId));
  };

  // Handle Compare drawer open
  const handleCompare = (product: Product) => {
    setComparedProduct(product);
  };

  // Compute Macro Inflation Metrics
  const inflationReport = useMemo(() => {
    if (products.length === 0) return null;

    const currentPrices: Record<string, number> = {};
    const basePrices: Record<string, number> = {};
    const weights: Record<string, number> = {};

    products.forEach((p) => {
      currentPrices[p.id] = p.currentLowestPrice;
      basePrices[p.id] = p.previousPrice || p.currentLowestPrice;
      const catWeight = CATEGORY_METADATA[p.category]?.inflationBasketWeight || 0.15;
      weights[p.id] = catWeight / 10;
    });

    return calculateInflationIndex(currentPrices, basePrices, weights);
  }, [products]);

  // Compute Store Comparisons for drawer
  const comparedStoreVariances = useMemo<StorePriceComparison[]>(() => {
    if (!comparedProduct || !comparedProduct.historicalPrices) return [];

    const latestByStore = new Map<string, { storeId: string; storeName: string; price: number; sourceType?: PriceSourceType; isVerified?: boolean; timestamp?: string }>();

    comparedProduct.historicalPrices.forEach((hp) => {
      latestByStore.set(hp.storeId, {
        storeId: hp.storeId,
        storeName: hp.storeName,
        price: hp.price,
        sourceType: hp.sourceType,
        isVerified: hp.isVerified,
        timestamp: hp.timestamp,
      });
    });

    const storePrices = Array.from(latestByStore.values());
    if (storePrices.length === 0) {
      storePrices.push({
        storeId: 'store-target',
        storeName: 'Target',
        price: comparedProduct.currentLowestPrice,
      });
    }

    return calculateStorePriceVariance(storePrices);
  }, [comparedProduct]);

  return (
    <div className="space-y-6">
      {/* Macro Inflation & Community Ticker Strip */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Community Exchange • Active Role: <strong className="text-white uppercase">{role}</strong></span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Open Crowdsourced Price Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Verify physical store observations, circular flyers, receipts, and online listings in an open longitudinal price ledger with live inflation telemetry.
            </p>
          </div>

          {/* Inflation Barometer Metric Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            {/* Laspeyres Composite Rate */}
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 flex flex-col justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Laspeyres Index
              </span>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-lg font-mono font-extrabold text-white tabular-nums">
                  {inflationReport ? formatDeltaPercent(inflationReport.compositeInflationRate ?? inflationReport.inflationRatePercent) : '+3.9%'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1">30D Rolling Basket</span>
            </div>

            {/* Tracked Catalog Count */}
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 flex flex-col justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Tracked Items
              </span>
              <div className="flex items-center gap-1 mt-1">
                <Layers className="w-4 h-4 text-indigo-300 shrink-0" />
                <span className="text-lg font-mono font-extrabold text-white tabular-nums">
                  {products.length}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1">7 Retailer Chains</span>
            </div>

            {/* Price Drops Today */}
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 flex flex-col justify-between col-span-2 sm:col-span-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Active Drops
              </span>
              <div className="flex items-center gap-1 mt-1">
                <TrendingDown className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-lg font-mono font-extrabold text-emerald-400 tabular-nums">
                  {products.filter((p) => p.priceDeltaPercent < -0.01).length}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1">Deals Below Average</span>
            </div>
          </div>
        </div>

        {/* Quick Action Navigation Bar */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-3">
          <Link
            href="/contribute"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-ambient-lift transition-all touch-target"
          >
            <Camera className="w-4 h-4" />
            <span>Log Store Shelf Tag or Receipt</span>
          </Link>

          <Link
            href="/watchlist"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all touch-target"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Watchlist & Basket Optimizer</span>
          </Link>

          {role === 'admin' && (
            <Link
              href="/admin/moderation"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 text-xs font-semibold transition-all touch-target"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Moderation Hub</span>
            </Link>
          )}
        </div>
      </section>

      {/* Main Catalog & Filterable Product Grid */}
      <section className="space-y-4">
        <ProductGrid
          products={products}
          watchlistedIds={watchlistedIds}
          onToggleWatchlist={handleToggleWatchlist}
          onCompare={handleCompare}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </section>

      {/* Quick Store Comparison Drawer */}
      <Drawer
        isOpen={Boolean(comparedProduct)}
        onClose={() => setComparedProduct(null)}
        position="bottom"
        title={
          comparedProduct && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Store Price Comparison
                </h3>
                <p className="text-xs text-slate-500 font-normal">
                  {comparedProduct.name} ({comparedProduct.unit})
                </p>
              </div>
            </div>
          )
        }
        footer={
          comparedProduct && (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <PriceBadge
                  price={comparedProduct.currentLowestPrice}
                  previousPrice={comparedProduct.previousPrice}
                  size="md"
                  showIcon
                />
                <span className="text-xs text-slate-500">Lowest observed price</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setComparedProduct(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Close
                </button>
                <Link
                  href={`/product/${comparedProduct.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-ambient-lift transition-all"
                >
                  <span>Full Telemetry</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )
        }
      >
        {comparedProduct && (
          <div className="space-y-6 py-2">
            {/* Store Comparison Bar Chart */}
            <StoreComparisonChart
              comparisons={comparedStoreVariances}
              height={220}
            />

            {/* Store Price Matrix Table */}
            <StoreComparisonTable
              comparisons={comparedStoreVariances}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
}
