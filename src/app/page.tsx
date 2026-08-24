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
  HelpCircle,
} from 'lucide-react';
import { useRoleView } from '@/components/providers/RoleContext';
import { ProductGrid } from '@/components/product/ProductGrid';
import { StoreComparisonTable } from '@/components/product/StoreComparisonTable';
import { StoreComparisonChart } from '@/components/charts/StoreComparisonChart';
import { Drawer } from '@/components/ui/Drawer';
import { PriceBadge } from '@/components/product/PriceBadge';
import { Tooltip } from '@/components/ui/Tooltip';
import { useToast } from '@/components/ui/Toast';
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
  const { showToast } = useToast();
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

  // Global Keyboard Shortcut: '/' or 'Cmd+K' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        const mainInput = document.getElementById('main-product-search') as HTMLInputElement | null;
        const headerInput = document.getElementById('header-global-search') as HTMLInputElement | null;
        if (mainInput) {
          mainInput.focus();
          mainInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (headerInput) {
          headerInput.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle Watchlist toggle with feedback toast
  const handleToggleWatchlist = (product: Product) => {
    const isCurrentlySaved = watchlistedIds.includes(product.id);
    toggleWatchlistProduct(product);
    const updated = getStoredWatchlist();
    setWatchlistedIds(updated.map((w) => w.productId));

    if (!isCurrentlySaved) {
      showToast({
        type: 'success',
        message: `Saved to Watchlist`,
        description: product.name,
        action: {
          label: 'Undo',
          onClick: () => {
            toggleWatchlistProduct(product);
            const rolledBack = getStoredWatchlist();
            setWatchlistedIds(rolledBack.map((w) => w.productId));
          },
        },
      });
    } else {
      showToast({
        type: 'info',
        message: `Removed from Watchlist`,
        description: product.name,
        action: {
          label: 'Undo',
          onClick: () => {
            toggleWatchlistProduct(product);
            const rolledBack = getStoredWatchlist();
            setWatchlistedIds(rolledBack.map((w) => w.productId));
          },
        },
      });
    }
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
      {/* Daylight Community Exchange Hero Banner */}
      <section className="bg-gradient-to-br from-indigo-50/60 via-white to-sky-50/50 rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-ambient-lift relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/80 text-indigo-700 border border-indigo-200/80 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Community Exchange • Active Role: <strong className="uppercase text-indigo-900">{role}</strong></span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Open Crowdsourced Price Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Track inflation across everyday essentials, spot verified retail price drops, and compare store prices with open community data.
            </p>
          </div>

          {/* Real-time Economic Telemetry Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            {/* 30D Inflation Rate */}
            <div className="bg-white/90 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Inflation (30D)
                </span>
                <Tooltip content="Laspeyres weighted basket index across all tracked goods relative to 30 days ago.">
                  <HelpCircle className="w-3 h-3 text-slate-400 cursor-pointer" />
                </Tooltip>
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <TrendingUp className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="text-lg font-mono font-extrabold text-slate-900 tabular-nums">
                  {inflationReport ? formatDeltaPercent(inflationReport.compositeInflationRate ?? inflationReport.inflationRatePercent) : '+3.9%'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1">Rolling Basket</span>
            </div>

            {/* Tracked Catalog Items */}
            <div className="bg-white/90 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Tracked Items
              </span>
              <div className="flex items-center gap-1.5 mt-1.5">
                <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-lg font-mono font-extrabold text-slate-900 tabular-nums">
                  {products.length}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1">7 Retailer Chains</span>
            </div>

            {/* Active Price Drops */}
            <div className="bg-white/90 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Price Drops
              </span>
              <div className="flex items-center gap-1.5 mt-1.5">
                <TrendingDown className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-lg font-mono font-extrabold text-emerald-600 tabular-nums">
                  {products.filter((p) => p.priceDeltaPercent < -0.01).length}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1">Deals Below Average</span>
            </div>
          </div>
        </div>

        {/* Quick Action Navigation Bar */}
        <div className="mt-5 pt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/contribute"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-ambient-lift transition-all touch-target"
            >
              <Camera className="w-4 h-4" />
              <span>Log Shelf Tag or Receipt</span>
            </Link>

            <Link
              href="/watchlist"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-all touch-target"
            >
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>Watchlist & Alerts</span>
            </Link>

            {role === 'admin' && (
              <Link
                href="/admin/moderation"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-200 text-xs font-bold transition-all touch-target"
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Moderation Queue</span>
              </Link>
            )}
          </div>

          {/* Search Shortcut Hint */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white border border-slate-300 rounded text-slate-700 shadow-2xs">
              /
            </kbd>
            <span>or</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white border border-slate-300 rounded text-slate-700 shadow-2xs">
              ⌘K
            </kbd>
            <span>to search anytime</span>
          </div>
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
                  <span>View Full Price History</span>
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
