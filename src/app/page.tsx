'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Camera,
  BarChart3,
  Scale,
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
  getStoredCategoryMetadata,
  toggleWatchlistProduct,
  subscribeToStorageChanges,
} from '@/lib/storage';
import { computeCatalogInflation, calculateStorePriceVariance } from '@/lib/inflation';
import { formatDeltaPercent } from '@/lib/formatters';
import type { Product, ProductCategory, CategoryMetadata, StorePriceComparison, PriceSourceType } from '@/types';

export default function HomePage() {
  const { role } = useRoleView();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [watchlistedIds, setWatchlistedIds] = useState<string[]>([]);
  const [comparedProduct, setComparedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [categoryMetadata, setCategoryMetadata] = useState<Record<ProductCategory, CategoryMetadata>>(() =>
    getStoredCategoryMetadata()
  );

  // Load products, watchlist, and category weights from reactive storage
  useEffect(() => {
    const loadData = () => {
      const storedProducts = getStoredProducts();
      setProducts(storedProducts);

      const watchlist = getStoredWatchlist();
      setWatchlistedIds(watchlist.map((w) => w.productId));

      setCategoryMetadata(getStoredCategoryMetadata());
    };

    loadData();
    const unsubscribe = subscribeToStorageChanges(loadData);
    return () => unsubscribe();
  }, []);

  // Global Keyboard Shortcut: '/' or 'Cmd+K' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent stealing focus away from open modal Compare Drawer
      if (comparedProduct) return;

      if (
        (e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        document.activeElement?.tagName !== 'SELECT'
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
  }, [comparedProduct]);

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

  // Compute Macro Inflation Metrics with calibrated category weights
  const inflationReport = useMemo(() => {
    return computeCatalogInflation(products, categoryMetadata);
  }, [products, categoryMetadata]);

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
      {/* Editorial Civic Hero Section */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-surface space-y-5">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Community Price Index • Multi-Store Telemetry</span>
        </div>

        <div className="space-y-2 max-w-3xl">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Open, crowdsourced retail price intelligence.
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
            Track grocery inflation across everyday essentials, compare store prices across retail chains, and audit local shelf tags with community verification.
          </p>
        </div>

        {/* Quick Action Navigation Bar */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/contribute"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all touch-target active:scale-[0.98]"
            >
              <Camera className="w-4 h-4" />
              <span>Log Shelf Tag or Receipt</span>
            </Link>

            <Link
              href="/watchlist"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/90 transition-all touch-target active:scale-[0.98]"
            >
              <BarChart3 className="w-4 h-4 text-slate-600" />
              <span>Watchlist & Alerts</span>
            </Link>

            {role === 'admin' && (
              <Link
                href="/admin/moderation"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-200 text-xs font-bold transition-all touch-target"
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Moderation Queue</span>
              </Link>
            )}
          </div>

          {/* Search Shortcut Hint */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
            <span>Search anytime:</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-100 border border-slate-200 rounded text-slate-600 shadow-2xs">
              /
            </kbd>
            <span>or</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-100 border border-slate-200 rounded text-slate-600 shadow-2xs">
              ⌘K
            </kbd>
          </div>
        </div>
      </section>

      {/* Standalone Inflation & Community Telemetry Strip */}
      <section
        aria-label="Market Telemetry Barometer"
        className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-surface grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80"
      >
        {/* 30D Inflation Rate */}
        <div className="px-4 py-3 sm:py-1 first:pl-2 flex items-center justify-between sm:block">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <span>30-Day Inflation</span>
            <Tooltip content="Calculated by tracking price changes across a standard basket of everyday groceries relative to 30 days ago.">
              <button
                type="button"
                aria-label="30-day inflation calculation methodology"
                className="min-h-[44px] min-w-[44px] -my-2 -mx-2.5 rounded-lg text-slate-500 hover:text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 inline-flex items-center justify-center cursor-pointer touch-target"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <TrendingUp className="w-5 h-5 text-rose-500 shrink-0" />
            <span className="text-xl font-mono font-extrabold text-slate-900 tabular-nums">
              {inflationReport ? formatDeltaPercent(inflationReport.compositeInflationRate ?? inflationReport.inflationRatePercent) : '+3.9%'}
            </span>
            <span className="text-xs text-slate-500 hidden xl:inline">Rolling Basket</span>
          </div>
        </div>

        {/* Tracked Catalog Items */}
        <div className="px-4 py-3 sm:py-1 flex items-center justify-between sm:block">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Tracked Essentials
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Layers className="w-5 h-5 text-indigo-600 shrink-0" />
            <span className="text-xl font-mono font-extrabold text-slate-900 tabular-nums">
              {products.length} Items
            </span>
            <span className="text-xs text-slate-500 hidden xl:inline">7 Retailer Chains</span>
          </div>
        </div>

        {/* Active Price Drops */}
        <div className="px-4 py-3 sm:py-1 last:pr-2 flex items-center justify-between sm:block">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Active Price Drops
          </div>
          <div className="flex items-center gap-2 mt-1">
            <TrendingDown className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xl font-mono font-extrabold text-emerald-600 tabular-nums">
              {products.filter((p) => p.priceDeltaPercent < -0.01).length} Deals
            </span>
            <span className="text-xs text-slate-500 hidden xl:inline">Below 30D Average</span>
          </div>
        </div>
      </section>

      {/* Main Catalog & Filterable Product Grid */}
      <section className="space-y-4" aria-labelledby="catalog-heading">
        <h2 id="catalog-heading" className="sr-only">
          Community Product Catalog
        </h2>
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
                <span className="block text-base font-bold text-slate-900">
                  Store Price Comparison
                </span>
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
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setComparedProduct(null)}
                  className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors touch-target min-h-[44px] active:scale-[0.98]"
                >
                  Close
                </button>
                <Link
                  href={`/product/${comparedProduct.id}`}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-ambient-lift transition-all touch-target min-h-[44px] active:scale-[0.98]"
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
