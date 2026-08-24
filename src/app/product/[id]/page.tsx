'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bookmark,
  Bell,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Store as StoreIcon,
  Layers,
  Info,
  ExternalLink,
} from 'lucide-react';
import {
  getStoredProductById,
  getStoredWatchlist,
  toggleWatchlistProduct,
  getStoredStores,
  subscribeToStorageChanges,
} from '@/lib/storage';
import { calculateStorePriceVariance } from '@/lib/inflation';
import { formatCurrency, formatDeltaPercent } from '@/lib/formatters';
import { PriceBadge } from '@/components/product/PriceBadge';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { PriceHistoryChart } from '@/components/charts/PriceHistoryChart';
import { StoreComparisonTable } from '@/components/product/StoreComparisonTable';
import { StoreComparisonChart } from '@/components/charts/StoreComparisonChart';
import { ProvenanceTimeline } from '@/components/product/ProvenanceTimeline';
import { useToast } from '@/components/ui/Toast';
import type { Product, StorePriceComparison, PriceSourceType } from '@/types';
import { cn } from '@/lib/utils';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertTargetPrice, setAlertTargetPrice] = useState<number>(0);
  const [alertSavedSuccess, setAlertSavedSuccess] = useState(false);

  // Load product from storage and subscribe to changes
  useEffect(() => {
    const loadProduct = () => {
      if (!productId) return;
      const found = getStoredProductById(productId);
      if (found) {
        setProduct(found);
        setAlertTargetPrice(found.currentLowestPrice * 0.95); // default alert at 5% drop
      }

      const watchlist = getStoredWatchlist();
      const watchItem = watchlist.find((w) => w.productId === productId);
      setIsWatchlisted(Boolean(watchItem));
      if (watchItem?.targetPrice) {
        setAlertTargetPrice(watchItem.targetPrice);
      }
    };

    loadProduct();
    const unsubscribe = subscribeToStorageChanges(loadProduct);
    return () => unsubscribe();
  }, [productId]);

  const stores = useMemo(() => getStoredStores(), []);

  // Compute store comparisons
  const storeComparisons = useMemo<StorePriceComparison[]>(() => {
    if (!product || !product.historicalPrices) return [];

    const latestByStore = new Map<string, { storeId: string; storeName: string; price: number; sourceType?: PriceSourceType; isVerified?: boolean; timestamp?: string }>();

    product.historicalPrices.forEach((hp) => {
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
        price: product.currentLowestPrice,
      });
    }

    return calculateStorePriceVariance(storePrices);
  }, [product]);

  // Handle Watchlist toggle with feedback toast
  const handleToggleWatchlist = () => {
    if (!product) return;
    const added = toggleWatchlistProduct(product, alertTargetPrice);
    setIsWatchlisted(added);

    if (added) {
      showToast({
        type: 'success',
        message: 'Saved to Watchlist',
        description: product.name,
        action: {
          label: 'Undo',
          onClick: () => {
            toggleWatchlistProduct(product);
            setIsWatchlisted(false);
          },
        },
      });
    } else {
      showToast({
        type: 'info',
        message: 'Removed from Watchlist',
        description: product.name,
        action: {
          label: 'Undo',
          onClick: () => {
            toggleWatchlistProduct(product, alertTargetPrice);
            setIsWatchlisted(true);
          },
        },
      });
    }
  };

  // Handle Save Price Alert
  const handleSavePriceAlert = () => {
    if (!product) return;
    toggleWatchlistProduct(product, alertTargetPrice);
    setIsWatchlisted(true);
    setAlertSavedSuccess(true);
    showToast({
      type: 'success',
      message: `Price alert set at ${formatCurrency(alertTargetPrice)}`,
      description: `We'll notify you when ${product.name} drops below target.`,
    });
    setTimeout(() => {
      setAlertSavedSuccess(false);
      setIsAlertModalOpen(false);
    }, 1200);
  };

  // 404 Not Found View
  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Info className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-sm text-slate-500 max-w-md">
          We couldn&apos;t locate product &quot;{productId}&quot; in the community catalog.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>
    );
  }

  const hasPriceDrop = product.priceDeltaPercent < -0.01;
  const hasPriceHike = product.priceDeltaPercent > 0.01;

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb & Back Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white border border-slate-200/80 transition-all shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <Badge variant="category" size="sm" className="capitalize">
            {product.category}
          </Badge>
          {product.isVerified && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Verified Item
            </span>
          )}
        </div>
      </div>

      {/* Main Product Header Card */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-surface">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Product Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                {product.brand || 'Generic'}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-medium text-slate-500">
                Unit: <strong className="text-slate-800">{product.unit || 'unit'}</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {product.name}
            </h1>

            {product.description && (
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
                {product.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
                <StoreIcon className="w-3.5 h-3.5 text-slate-400" />
                {product.trackedStoresCount || 1} Stores Tracked
              </span>
              <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                {product.totalSubmissionsCount || 1} Verified Observations
              </span>
            </div>
          </div>

          {/* Right: Pricing Highlights & Watchlist Action */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 shrink-0">
            <div className="flex flex-col items-start sm:items-end">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Lowest Observed Price
              </span>
              <PriceBadge
                price={product.currentLowestPrice}
                previousPrice={product.previousPrice}
                size="lg"
                showIcon
                className="mt-1"
              />
              <div className="flex items-center gap-1 mt-1 text-xs font-mono tabular-nums">
                {hasPriceDrop ? (
                  <span className="inline-flex items-center gap-0.5 font-bold text-emerald-600">
                    <TrendingDown className="w-3.5 h-3.5" />
                    {formatDeltaPercent(product.priceDeltaPercent)} vs Last Period
                  </span>
                ) : hasPriceHike ? (
                  <span className="inline-flex items-center gap-0.5 font-bold text-rose-600">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {formatDeltaPercent(product.priceDeltaPercent)} vs Last Period
                  </span>
                ) : (
                  <span className="text-slate-500 font-semibold">Stable Price</span>
                )}
              </div>
            </div>

            {/* Watchlist & Price Drop Alert Trigger */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleToggleWatchlist}
                className={cn(
                  'min-h-[44px] px-3.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all select-none',
                  isWatchlisted
                    ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                )}
              >
                <Bookmark className={cn('w-4 h-4', isWatchlisted && 'fill-amber-500 text-amber-600')} />
                <span>{isWatchlisted ? 'Watchlisted' : 'Add to Watchlist'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAlertModalOpen(true)}
                className="min-h-[44px] px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 text-xs font-bold shadow-ambient-lift transition-all"
              >
                <Bell className="w-4 h-4" />
                <span>Set Alert</span>
              </button>
            </div>
          </div>
        </div>

        {/* Statistical Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              All-Time Lowest
            </span>
            <span className="text-base font-bold font-mono text-emerald-600 mt-0.5 tabular-nums">
              {formatCurrency(product.currentLowestPrice)}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              All-Time Highest
            </span>
            <span className="text-base font-bold font-mono text-slate-900 mt-0.5 tabular-nums">
              {formatCurrency(product.currentHighestPrice || product.currentLowestPrice * 1.3)}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Longitudinal Average
            </span>
            <span className="text-base font-bold font-mono text-slate-900 mt-0.5 tabular-nums">
              {formatCurrency(product.averagePrice || product.currentLowestPrice * 1.1)}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Price Spread
            </span>
            <span className="text-base font-bold font-mono text-indigo-600 mt-0.5 tabular-nums">
              {formatCurrency(
                (product.currentHighestPrice || product.currentLowestPrice * 1.3) -
                  product.currentLowestPrice
              )}
            </span>
          </div>
        </div>
      </section>

      {/* Primary Telemetry: Historical Multi-Store Price Chart */}
      <section className="space-y-3">
        <PriceHistoryChart
          historicalPrices={product.historicalPrices || []}
          stores={stores}
          height={360}
          initialTimeframe="3M"
        />
      </section>

      {/* Store Comparisons: Table & Bar Chart */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-base font-bold text-slate-900">
            Current Retailer Price Matrix
          </h3>
          <StoreComparisonTable comparisons={storeComparisons} />
        </div>

        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-900">
            Store Variance Ranking
          </h3>
          <StoreComparisonChart comparisons={storeComparisons} height={280} />
        </div>
      </section>

      {/* Provenance Feed & Verification Timeline */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Provenance Timeline & Proof Documents
            </h3>
            <p className="text-xs text-slate-500">
              Community audits, shelf photos, and OCR verification logs
            </p>
          </div>

          <Link
            href="/contribute"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors"
          >
            <span>Submit Observation</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ProvenanceTimeline history={product.historicalPrices || []} />
      </section>

      {/* Price Drop Alert Modal */}
      <Modal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        title="Set Price Drop Alert"
        description={`Receive instant notifications when ${product.name} drops below your target price.`}
        size="md"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAlertModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSavePriceAlert}
              leftIcon={<Bell className="w-3.5 h-3.5" />}
            >
              {alertSavedSuccess ? 'Alert Saved!' : 'Activate Alert'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          {alertSavedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Price drop alert target configured and saved to your watchlist!</span>
            </div>
          )}

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Current Lowest</span>
              <p className="text-sm font-bold font-mono text-slate-900">
                {formatCurrency(product.currentLowestPrice)}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Suggested Target</span>
              <p className="text-sm font-bold font-mono text-emerald-600">
                {formatCurrency(product.currentLowestPrice * 0.9)} (-10%)
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Notify me when price drops below ($):
            </label>
            <Input
              type="number"
              step="0.05"
              min="0.01"
              value={alertTargetPrice}
              onChange={(e) => setAlertTargetPrice(parseFloat(e.target.value) || 0)}
              leftIcon={<span className="text-slate-400 text-xs font-mono font-bold">$</span>}
            />
          </div>

          <div className="space-y-2 pt-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="notify-drop"
                defaultChecked
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="notify-drop" className="font-medium cursor-pointer">
                Notify on verified community shelf price drop
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="notify-spike"
                defaultChecked
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="notify-spike" className="font-medium cursor-pointer">
                Notify on macroeconomic category inflation spike (&gt;5%)
              </label>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
