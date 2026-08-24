'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  Bell,
  Trash2,
  Sparkles,
  ShoppingBag,
  Store as StoreIcon,
  Plus,
  Minus,
  CheckCircle2,
  Split,
  ChevronRight,
  Zap,
} from 'lucide-react';
import {
  getStoredWatchlist,
  getStoredProducts,
  toggleWatchlistProduct,
  getStoredStores,
  subscribeToStorageChanges,
} from '@/lib/storage';
import { formatCurrency } from '@/lib/formatters';
import { PriceBadge } from '@/components/product/PriceBadge';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import type { Product, WatchlistItem, Store } from '@/types';
import { cn } from '@/lib/utils';

export default function WatchlistPage() {
  const { showToast } = useToast();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);

  // Basket quantities state: Record<productId, quantity>
  const [basketQuantities, setBasketQuantities] = useState<Record<string, number>>({});

  // Alert Edit Modal state
  const [editingItem, setEditingItem] = useState<WatchlistItem | null>(null);
  const [newTargetPrice, setNewTargetPrice] = useState<number>(0);

  // Load state and subscribe
  useEffect(() => {
    const load = () => {
      const storedWatchlist = getStoredWatchlist();
      setWatchlist(storedWatchlist);

      const storedProds = getStoredProducts();
      setProducts(storedProds);

      setStores(getStoredStores());

      // Initialize basket quantities for all watchlisted items
      setBasketQuantities((prev) => {
        const next = { ...prev };
        storedWatchlist.forEach((w) => {
          if (next[w.productId] === undefined) {
            next[w.productId] = 1;
          }
        });
        return next;
      });
    };

    load();
    const unsubscribe = subscribeToStorageChanges(load);
    return () => unsubscribe();
  }, []);

  // Remove from watchlist with Undo toast
  const handleRemove = (product: Product) => {
    toggleWatchlistProduct(product);
    showToast({
      type: 'info',
      message: 'Removed from Watchlist',
      description: product.name,
      action: {
        label: 'Undo',
        onClick: () => {
          toggleWatchlistProduct(product);
        },
      },
    });
  };

  // Add popular sample essentials if watchlist is empty
  const handleSeedWatchlist = () => {
    const essentials = ['prod-milk', 'prod-eggs', 'prod-bread', 'prod-coffee', 'prod-apples'];
    essentials.forEach((id) => {
      const p = products.find((prod) => prod.id === id);
      if (p) {
        toggleWatchlistProduct(p, p.currentLowestPrice * 0.95);
      }
    });
    showToast({
      type: 'success',
      message: 'Added 5 Grocery Essentials to Watchlist',
      description: 'Milk, Eggs, Sourdough, Coffee Beans, and Honeycrisp Apples',
    });
  };

  // Save updated alert target price
  const handleSaveAlert = () => {
    if (!editingItem) return;
    const prod = products.find((p) => p.id === editingItem.productId);
    if (prod) {
      // Re-toggle with new target price
      toggleWatchlistProduct(prod, newTargetPrice);
      showToast({
        type: 'success',
        message: 'Price Alert Updated',
        description: `Target set to ${formatCurrency(newTargetPrice)} for ${prod.name}`,
      });
    }
    setEditingItem(null);
  };

  // Adjust basket quantity
  const handleQuantityChange = (productId: string, delta: number) => {
    setBasketQuantities((prev) => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  // Join watchlisted items with full product data
  const watchlistProducts = useMemo(() => {
    return watchlist.map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      return {
        ...item,
        product: prod,
      };
    });
  }, [watchlist, products]);

  // ==========================================================================
  // Shopping Basket Optimizer Math
  // ==========================================================================
  const basketOptimization = useMemo(() => {
    const activeBasketItems = watchlistProducts.filter(
      (item) => (basketQuantities[item.productId] || 0) > 0 && item.product
    );

    if (activeBasketItems.length === 0 || stores.length === 0) {
      return null;
    }

    // 1. Single Store Totals: Calculate total basket cost if bought 100% at each store
    const singleStoreResults: Array<{
      storeId: string;
      storeName: string;
      storeType: string;
      totalCost: number;
      availableItemsCount: number;
      missingItemsCount: number;
    }> = stores.map((store) => {
      let totalCost = 0;
      let availableItemsCount = 0;
      let missingItemsCount = 0;

      activeBasketItems.forEach((item) => {
        const prod = item.product!;
        const qty = basketQuantities[item.productId] || 1;

        // Find store's historical/latest price point for this product
        const storePricePoint = prod.historicalPrices.find((hp) => hp.storeId === store.id);
        const price = storePricePoint?.price || prod.currentLowestPrice * 1.15; // default fallback if store unlisted

        if (storePricePoint) {
          availableItemsCount++;
        } else {
          missingItemsCount++;
        }

        totalCost += price * qty;
      });

      return {
        storeId: store.id,
        storeName: store.name,
        storeType: store.type,
        totalCost: Number(totalCost.toFixed(2)),
        availableItemsCount,
        missingItemsCount,
      };
    });

    singleStoreResults.sort((a, b) => a.totalCost - b.totalCost);
    const bestSingleStore = singleStoreResults[0];

    // 2. Optimal Split-Trip Calculation: Pick cheapest store per item
    let splitTripTotal = 0;
    const splitTripBreakdownByStore: Record<
      string,
      {
        storeName: string;
        items: Array<{ productName: string; unitPrice: number; qty: number; subtotal: number }>;
        subtotal: number;
      }
    > = {};

    activeBasketItems.forEach((item) => {
      const prod = item.product!;
      const qty = basketQuantities[item.productId] || 1;

      // Find cheapest price across all stores for this product
      let lowestPrice = prod.currentLowestPrice;
      let cheapestStoreName = 'Target';

      if (prod.historicalPrices && prod.historicalPrices.length > 0) {
        prod.historicalPrices.forEach((hp) => {
          if (hp.price <= lowestPrice) {
            lowestPrice = hp.price;
            cheapestStoreName = hp.storeName;
          }
        });
      }

      const itemSubtotal = Number((lowestPrice * qty).toFixed(2));
      splitTripTotal += itemSubtotal;

      if (!splitTripBreakdownByStore[cheapestStoreName]) {
        splitTripBreakdownByStore[cheapestStoreName] = {
          storeName: cheapestStoreName,
          items: [],
          subtotal: 0,
        };
      }

      splitTripBreakdownByStore[cheapestStoreName].items.push({
        productName: prod.name,
        unitPrice: lowestPrice,
        qty,
        subtotal: itemSubtotal,
      });
      splitTripBreakdownByStore[cheapestStoreName].subtotal += itemSubtotal;
    });

    splitTripTotal = Number(splitTripTotal.toFixed(2));
    const totalSavingsDollar = Number((bestSingleStore.totalCost - splitTripTotal).toFixed(2));
    const totalSavingsPercent =
      bestSingleStore.totalCost > 0
        ? Number(((totalSavingsDollar / bestSingleStore.totalCost) * 100).toFixed(1))
        : 0;

    return {
      activeItemCount: activeBasketItems.length,
      singleStoreResults,
      bestSingleStore,
      splitTripTotal,
      splitTripBreakdownByStore: Object.values(splitTripBreakdownByStore),
      totalSavingsDollar,
      totalSavingsPercent,
    };
  }, [watchlistProducts, basketQuantities, stores]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-surface">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
              <Bookmark className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>Personal Watchlist & Basket Optimizer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Tracked Items & Smart Routing
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              Monitor price drop thresholds, configure alerts, and calculate maximum savings comparing single-store checkouts vs multi-store split trips.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-2 rounded-xl">
              {watchlist.length} {watchlist.length === 1 ? 'Tracked Item' : 'Tracked Items'}
            </span>
          </div>
        </div>
      </section>

      {/* Main Grid: Watchlist on Left, Optimizer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Watchlist Tracked Items (7 cols) */}
        <section className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Tracked Products & Alerts
            </h3>
            {watchlist.length > 0 && (
              <span className="text-xs text-slate-500">
                Quantity in basket shown on right
              </span>
            )}
          </div>

          {watchlist.length === 0 ? (
            /* Empty State */
            <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-surface space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Bookmark className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">
                  Your watchlist is currently empty
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Add products to track price movements, set custom drop alerts, and calculate multi-store basket savings.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSeedWatchlist}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  Add 5 Popular Essentials
                </Button>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  <span>Browse Catalog</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            /* Watchlist Product Rows */
            <div className="space-y-3">
              {watchlistProducts.map((item) => {
                const prod = item.product;
                if (!prod) return null;

                const hasDroppedBelowTarget =
                  item.targetPrice && prod.currentLowestPrice <= item.targetPrice;
                const qty = basketQuantities[item.productId] || 0;

                return (
                  <div
                    key={item.productId}
                    className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-surface hover:shadow-ambient-lift transition-all space-y-3"
                  >
                    {/* Top Row: Title, Category & Delete */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="category" size="sm" className="capitalize">
                            {prod.category}
                          </Badge>
                          {prod.brand && (
                            <span className="text-xs font-semibold text-slate-500 truncate">
                              {prod.brand}
                            </span>
                          )}
                        </div>
                        <Link
                          href={`/product/${prod.id}`}
                          className="font-bold text-sm text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1 block"
                        >
                          {prod.name}
                        </Link>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemove(prod)}
                        aria-label={`Remove ${prod.name} from watchlist`}
                        className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Middle: Prices & Drop Alert Trigger */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                      <div className="flex items-baseline gap-2">
                        <PriceBadge
                          price={prod.currentLowestPrice}
                          previousPrice={prod.previousPrice}
                          size="md"
                          showIcon
                        />
                        <span className="text-xs text-slate-500 font-medium">
                          ({prod.unit})
                        </span>
                      </div>

                      {/* Alert Target Price Pill */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem(item);
                          setNewTargetPrice(item.targetPrice || prod.currentLowestPrice * 0.95);
                        }}
                        className={cn(
                          'inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-colors',
                          hasDroppedBelowTarget
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        )}
                      >
                        <Bell className="w-3.5 h-3.5 text-indigo-600" />
                        <span>
                          Alert: <strong className="font-mono tabular-nums">{formatCurrency(item.targetPrice || prod.currentLowestPrice)}</strong>
                        </span>
                      </button>
                    </div>

                    {/* Bottom: Basket Quantity Selector */}
                    <div className="flex items-center justify-between pt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="font-semibold">Quantity in Basket Optimizer:</span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(prod.id, -1)}
                          disabled={qty <= 0}
                          aria-label="Decrease quantity"
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center font-bold font-mono text-slate-900 tabular-nums">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(prod.id, 1)}
                          aria-label="Increase quantity"
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right Column: Shopping Basket Optimizer (5 cols) */}
        <section className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Basket Trip Optimizer
            </h3>
            {basketOptimization && (
              <Badge variant="verified" size="sm">
                {basketOptimization.activeItemCount} items selected
              </Badge>
            )}
          </div>

          {!basketOptimization ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200/90 shadow-surface space-y-3">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">
                No items in active basket
              </h4>
              <p className="text-xs text-slate-500">
                Increase item quantities in your watchlist on the left to calculate optimal routing and split-trip savings.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Savings Highlight Hero Card */}
              <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-emerald-800/50 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Split-Trip Savings
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-400 text-emerald-950">
                    Save {basketOptimization.totalSavingsPercent}%
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-300">Optimal Split Trip Total:</span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 tabular-nums">
                      {formatCurrency(basketOptimization.splitTripTotal)}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400">Total Savings:</span>
                    <p className="text-base font-extrabold font-mono text-white tabular-nums">
                      +{formatCurrency(basketOptimization.totalSavingsDollar)}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 text-[11px] text-slate-300 flex items-center justify-between">
                  <span>Best Single Store ({basketOptimization.bestSingleStore.storeName}):</span>
                  <strong className="font-mono text-white tabular-nums">
                    {formatCurrency(basketOptimization.bestSingleStore.totalCost)}
                  </strong>
                </div>
              </div>

              {/* Single-Store Ranking Table */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-surface space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Single-Store Checkout Ranking
                </h4>

                <div className="divide-y divide-slate-100 text-xs">
                  {basketOptimization.singleStoreResults.map((res, idx) => {
                    const isWinner = idx === 0;
                    return (
                      <div
                        key={res.storeId}
                        className={cn(
                          'py-2.5 flex items-center justify-between transition-colors px-2 rounded-xl',
                          isWinner ? 'bg-emerald-50/70 font-semibold' : ''
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 text-slate-400 font-mono text-[11px]">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-slate-900">
                            {res.storeName}
                          </span>
                          {isWinner && (
                            <span className="text-[9px] font-bold uppercase bg-emerald-600 text-white px-1.5 py-0.2 rounded-full">
                              Best 1-Stop
                            </span>
                          )}
                        </div>

                        <span
                          className={cn(
                            'font-mono tabular-nums font-bold',
                            isWinner ? 'text-emerald-700 text-sm' : 'text-slate-700'
                          )}
                        >
                          {formatCurrency(res.totalCost)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Optimal Split-Trip Multi-Store Routing Breakdown */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-surface space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Split className="w-3.5 h-3.5 text-indigo-600" />
                    Split-Trip Routing Breakdown
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    {basketOptimization.splitTripBreakdownByStore.length} Stores
                  </span>
                </div>

                <div className="space-y-3">
                  {basketOptimization.splitTripBreakdownByStore.map((storeGroup) => (
                    <div
                      key={storeGroup.storeName}
                      className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900 pb-1 border-b border-slate-200">
                        <span className="flex items-center gap-1.5">
                          <StoreIcon className="w-3.5 h-3.5 text-indigo-600" />
                          {storeGroup.storeName}
                        </span>
                        <span className="font-mono text-emerald-700 tabular-nums">
                          {formatCurrency(storeGroup.subtotal)}
                        </span>
                      </div>

                      <div className="space-y-1 pt-1 text-[11px] text-slate-600">
                        {storeGroup.items.map((i, iIdx) => (
                          <div key={iIdx} className="flex items-center justify-between">
                            <span className="truncate max-w-[180px]">
                              {i.qty}x {i.productName}
                            </span>
                            <span className="font-mono tabular-nums">
                              {formatCurrency(i.subtotal)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Edit Alert Target Price Modal */}
      {editingItem && (
        <Modal
          isOpen={Boolean(editingItem)}
          onClose={() => setEditingItem(null)}
          title="Update Target Price Alert"
          description={`Set your threshold alert price for ${editingItem.productName}.`}
          size="sm"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingItem(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveAlert}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Save Alert
              </Button>
            </div>
          }
        >
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Target Price ($):
              </label>
              <Input
                type="number"
                step="0.05"
                min="0.01"
                value={newTargetPrice}
                onChange={(e) => setNewTargetPrice(parseFloat(e.target.value) || 0)}
                leftIcon={<span className="text-xs font-mono font-bold text-slate-400">$</span>}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Current Lowest: <strong className="font-mono text-slate-800">{formatCurrency(editingItem.currentPrice || 0)}</strong>
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
