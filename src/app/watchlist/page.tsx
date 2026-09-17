'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  Bell,
  Trash2,
  TrendingDown,
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
  setWatchlistAlert,
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

  // Itinerary Routing Mode: 'smart' (max 2 stores with friction gate), 'all' (absolute lowest), 'single' (1-stop)
  const [itineraryMode, setItineraryMode] = useState<'smart' | 'all' | 'single'>('smart');

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

      // Sync basket quantities with current watchlisted items, pruning orphaned keys
      setBasketQuantities((prev) => {
        const next: Record<string, number> = {};
        storedWatchlist.forEach((w) => {
          next[w.productId] = prev[w.productId] !== undefined ? prev[w.productId] : 1;
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
    setBasketQuantities((prev) => {
      const next = { ...prev };
      delete next[product.id];
      return next;
    });
    showToast({
      type: 'info',
      message: 'Removed from Watchlist',
      description: product.name,
      action: {
        label: 'Undo',
        onClick: () => {
          toggleWatchlistProduct(product);
          setBasketQuantities((prev) => ({ ...prev, [product.id]: 1 }));
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
      // Update target price non-destructively
      setWatchlistAlert(prod, newTargetPrice);
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
      let cheapestStoreName: string | null = null;
      if (prod?.historicalPrices && prod.historicalPrices.length > 0) {
        const match = prod.historicalPrices.find((p) => p.price === prod.currentLowestPrice);
        cheapestStoreName = match ? match.storeName : prod.historicalPrices[0]?.storeName || null;
      }
      return {
        ...item,
        product: prod,
        cheapestStoreName,
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

    // 2. Multi-Store Split-Trip Calculation
    // Build lookup of price for each active product at each store
    const itemStorePrice: Record<string, Record<string, { price: number; isListed: boolean }>> = {};
    activeBasketItems.forEach((item) => {
      const prod = item.product!;
      itemStorePrice[prod.id] = {};
      stores.forEach((store) => {
        const hp = prod.historicalPrices?.find((p) => p.storeId === store.id);
        if (hp) {
          itemStorePrice[prod.id][store.id] = { price: hp.price, isListed: true };
        } else {
          itemStorePrice[prod.id][store.id] = { price: prod.currentLowestPrice * 1.15, isListed: false };
        }
      });
    });

    let splitTripTotal = 0;
    const splitTripBreakdownByStore: Record<
      string,
      {
        storeName: string;
        items: Array<{ productName: string; unitPrice: number; qty: number; subtotal: number }>;
        subtotal: number;
      }
    > = {};

    if (itineraryMode === 'single') {
      // 1-Stop Mode: 100% from best single store
      splitTripTotal = bestSingleStore.totalCost;
      activeBasketItems.forEach((item) => {
        const prod = item.product!;
        const qty = basketQuantities[item.productId] || 1;
        const info = itemStorePrice[prod.id]?.[bestSingleStore.storeId];
        const unitPrice = info?.price || prod.currentLowestPrice;
        const subtotal = Number((unitPrice * qty).toFixed(2));

        if (!splitTripBreakdownByStore[bestSingleStore.storeName]) {
          splitTripBreakdownByStore[bestSingleStore.storeName] = {
            storeName: bestSingleStore.storeName,
            items: [],
            subtotal: 0,
          };
        }
        splitTripBreakdownByStore[bestSingleStore.storeName].items.push({
          productName: prod.name,
          unitPrice,
          qty,
          subtotal,
        });
        splitTripBreakdownByStore[bestSingleStore.storeName].subtotal += subtotal;
      });
    } else if (itineraryMode === 'smart') {
      // Smart Mode: Evaluate best 2-store combination vs best 1-store
      let bestPairCost = Infinity;
      let bestPair: [Store, Store] | null = null;

      for (let i = 0; i < stores.length; i++) {
        for (let j = i + 1; j < stores.length; j++) {
          const storeA = stores[i];
          const storeB = stores[j];
          let pairCost = 0;

          activeBasketItems.forEach((item) => {
            const prod = item.product!;
            const qty = basketQuantities[item.productId] || 1;
            const priceA = itemStorePrice[prod.id]?.[storeA.id]?.price || prod.currentLowestPrice * 1.15;
            const priceB = itemStorePrice[prod.id]?.[storeB.id]?.price || prod.currentLowestPrice * 1.15;
            pairCost += Math.min(priceA, priceB) * qty;
          });

          if (pairCost < bestPairCost) {
            bestPairCost = pairCost;
            bestPair = [storeA, storeB];
          }
        }
      }

      // Check if 2-store split beats 1-store by at least $2.50 (transit friction threshold)
      const potentialSavings = bestSingleStore.totalCost - bestPairCost;
      if (bestPair && potentialSavings >= 2.50) {
        // Recommend 2-store split trip
        const [storeA, storeB] = bestPair;
        activeBasketItems.forEach((item) => {
          const prod = item.product!;
          const qty = basketQuantities[item.productId] || 1;
          const priceA = itemStorePrice[prod.id]?.[storeA.id]?.price || prod.currentLowestPrice * 1.15;
          const priceB = itemStorePrice[prod.id]?.[storeB.id]?.price || prod.currentLowestPrice * 1.15;

          const chosenStore = priceA <= priceB ? storeA : storeB;
          const unitPrice = Math.min(priceA, priceB);
          const subtotal = Number((unitPrice * qty).toFixed(2));
          splitTripTotal += subtotal;

          if (!splitTripBreakdownByStore[chosenStore.name]) {
            splitTripBreakdownByStore[chosenStore.name] = {
              storeName: chosenStore.name,
              items: [],
              subtotal: 0,
            };
          }
          splitTripBreakdownByStore[chosenStore.name].items.push({
            productName: prod.name,
            unitPrice,
            qty,
            subtotal,
          });
          splitTripBreakdownByStore[chosenStore.name].subtotal += subtotal;
        });
      } else {
        // 1 store is recommended because savings does not clear driving friction
        splitTripTotal = bestSingleStore.totalCost;
        activeBasketItems.forEach((item) => {
          const prod = item.product!;
          const qty = basketQuantities[item.productId] || 1;
          const info = itemStorePrice[prod.id]?.[bestSingleStore.storeId];
          const unitPrice = info?.price || prod.currentLowestPrice;
          const subtotal = Number((unitPrice * qty).toFixed(2));

          if (!splitTripBreakdownByStore[bestSingleStore.storeName]) {
            splitTripBreakdownByStore[bestSingleStore.storeName] = {
              storeName: bestSingleStore.storeName,
              items: [],
              subtotal: 0,
            };
          }
          splitTripBreakdownByStore[bestSingleStore.storeName].items.push({
            productName: prod.name,
            unitPrice,
            qty,
            subtotal,
          });
          splitTripBreakdownByStore[bestSingleStore.storeName].subtotal += subtotal;
        });
      }
    } else {
      // 'all': Absolute lowest price across all stores
      activeBasketItems.forEach((item) => {
        const prod = item.product!;
        const qty = basketQuantities[item.productId] || 1;

        let lowestPrice = prod.currentLowestPrice;
        let cheapestStoreName = item.cheapestStoreName || prod.historicalPrices?.[0]?.storeName || stores[0]?.name || 'Local Store';

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
    }

    splitTripTotal = Number(splitTripTotal.toFixed(2));
    const totalSavingsDollar = Number(Math.max(0, bestSingleStore.totalCost - splitTripTotal).toFixed(2));
    const totalSavingsPercent =
      bestSingleStore.totalCost > 0
        ? Number(((totalSavingsDollar / bestSingleStore.totalCost) * 100).toFixed(1))
        : 0;

    const breakdownList = Object.values(splitTripBreakdownByStore);
    const storeCount = breakdownList.length;
    const transitFrictionPerStop = 2.50; // $2.50 estimated fuel and time per extra store stop
    const transitCost = storeCount > 1 ? Number(((storeCount - 1) * transitFrictionPerStop).toFixed(2)) : 0;
    const netSavingsDollar = Number(Math.max(0, totalSavingsDollar - transitCost).toFixed(2));
    const isSplitRecommended = storeCount > 1 && totalSavingsDollar >= 2.50;

    return {
      activeItemCount: activeBasketItems.length,
      itineraryMode,
      singleStoreResults,
      bestSingleStore,
      splitTripTotal,
      splitTripBreakdownByStore: breakdownList,
      totalSavingsDollar,
      totalSavingsPercent,
      storeCount,
      transitCost,
      netSavingsDollar,
      isSplitRecommended,
    };
  }, [watchlistProducts, basketQuantities, stores, itineraryMode]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-surface">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Tracked Items & Smart Routing
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              Monitor price drop thresholds, configure alerts, and calculate maximum savings comparing single-store checkouts vs multi-store split trips.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-2 rounded-xl tabular-nums">
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
                  size="md"
                  onClick={handleSeedWatchlist}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add 5 Popular Essentials
                </Button>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors touch-target"
                >
                  <span>Browse Catalog</span>
                  <ChevronRight className="w-4 h-4" />
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
                    {/* Top Identity Cluster with Packaging Thumbnail */}
                    <div className="flex items-start gap-3.5">
                      {/* Packaging Thumbnail */}
                      <Link
                        href={`/product/${prod.id}`}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 shrink-0 flex items-center justify-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        tabIndex={-1}
                        aria-hidden="true"
                      >
                        {prod.imageUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={prod.imageUrl}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                          />
                        ) : (
                          <ShoppingBag className="w-6 h-6 text-slate-400" />
                        )}
                      </Link>

                      {/* Info & Remove */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="category" size="sm" className="capitalize text-[10px]">
                                {prod.category}
                              </Badge>
                              {prod.brand && (
                                <span className="text-xs font-semibold text-slate-500 truncate max-w-[140px]">
                                  {prod.brand}
                                </span>
                              )}
                            </div>
                            <Link
                              href={`/product/${prod.id}`}
                              className="font-bold text-sm sm:text-base text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1 block tracking-tight"
                            >
                              {prod.name}
                            </Link>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemove(prod)}
                            aria-label={`Remove ${prod.name} from watchlist`}
                            className="min-h-[44px] min-w-[44px] p-2.5 inline-flex items-center justify-center text-slate-500 hover:text-rose-600 rounded-xl hover:bg-slate-100 transition-colors shrink-0 touch-target"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions Cluster: Price with Winning Store + Alert + Inline Stepper */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2 flex-wrap">
                        <PriceBadge
                          price={prod.currentLowestPrice}
                          previousPrice={prod.previousPrice}
                          storeName={item.cheapestStoreName || undefined}
                          unit={prod.unit ? `(${prod.unit})` : undefined}
                          size="md"
                          showIcon
                        />
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Alert Target Price Pill */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingItem(item);
                            setNewTargetPrice(item.targetPrice || prod.currentLowestPrice * 0.95);
                          }}
                          aria-haspopup="dialog"
                          aria-label={`Configure target price alert for ${prod.name}. Current alert: ${formatCurrency(item.targetPrice || prod.currentLowestPrice)}`}
                          className={cn(
                            'inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-xl text-xs font-semibold border transition-colors touch-target',
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

                        {/* Inline Basket Quantity Stepper */}
                        <div className="inline-flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/70">
                          <span className="text-[11px] font-semibold text-slate-500 pl-2 pr-0.5 hidden sm:inline">
                            Basket:
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(prod.id, -1)}
                            disabled={qty <= 0}
                            aria-label={`Decrease quantity of ${prod.name}`}
                            className="w-8 h-8 rounded-lg bg-white border border-slate-200/90 flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-colors touch-target min-w-[36px] min-h-[36px]"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center font-bold font-mono text-xs text-slate-900 tabular-nums">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(prod.id, 1)}
                            aria-label={`Increase quantity of ${prod.name}`}
                            className="w-8 h-8 rounded-lg bg-white border border-slate-200/90 flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors touch-target min-w-[36px] min-h-[36px]"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
              {/* Itinerary Routing Mode Selector */}
              <div className="flex items-center justify-between p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 text-xs">
                <button
                  type="button"
                  onClick={() => setItineraryMode('smart')}
                  className={cn(
                    'flex-1 py-1.5 px-2 rounded-xl font-bold transition-all text-center min-h-[38px] touch-target',
                    itineraryMode === 'smart'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  Smart 2-Stop
                </button>
                <button
                  type="button"
                  onClick={() => setItineraryMode('all')}
                  className={cn(
                    'flex-1 py-1.5 px-2 rounded-xl font-bold transition-all text-center min-h-[38px] touch-target',
                    itineraryMode === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  All Stores
                </button>
                <button
                  type="button"
                  onClick={() => setItineraryMode('single')}
                  className={cn(
                    'flex-1 py-1.5 px-2 rounded-xl font-bold transition-all text-center min-h-[38px] touch-target',
                    itineraryMode === 'single'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  1-Stop Only
                </button>
              </div>

              {/* Savings Highlight Hero Card */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-surface border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" />
                    {basketOptimization.isSplitRecommended
                      ? `Split-Trip Savings (${basketOptimization.storeCount} Stores)`
                      : 'Single-Store Trip Recommended'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-400 text-emerald-950 tabular-nums">
                    {basketOptimization.isSplitRecommended
                      ? `Save ${basketOptimization.totalSavingsPercent}%`
                      : 'Zero Driving Friction'}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-300">
                      {basketOptimization.isSplitRecommended ? 'Optimal Split Trip Total:' : 'Recommended 1-Stop Total:'}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 tabular-nums">
                      {formatCurrency(basketOptimization.splitTripTotal)}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400">
                      {basketOptimization.isSplitRecommended ? 'Gross Savings:' : 'Optimal Retailer:'}
                    </span>
                    <p className="text-base font-extrabold font-mono text-white tabular-nums">
                      {basketOptimization.isSplitRecommended
                        ? `+${formatCurrency(basketOptimization.totalSavingsDollar)}`
                        : basketOptimization.bestSingleStore.storeName}
                    </p>
                  </div>
                </div>

                {basketOptimization.isSplitRecommended ? (
                  <div className="pt-3 border-t border-white/10 text-[11px] text-slate-300 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span>Estimated Transit Friction ({basketOptimization.storeCount - 1} extra stop):</span>
                      <strong className="font-mono text-amber-300 tabular-nums">
                        -{formatCurrency(basketOptimization.transitCost)}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between font-bold text-white pt-1 border-t border-white/5">
                      <span>Net Estimated Benefit:</span>
                      <span className="font-mono text-emerald-400 tabular-nums">
                        +{formatCurrency(basketOptimization.netSavingsDollar)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 pt-1">
                      <span>Best 1-Stop Alternative ({basketOptimization.bestSingleStore.storeName}):</span>
                      <span className="font-mono text-slate-300 tabular-nums">
                        {formatCurrency(basketOptimization.bestSingleStore.totalCost)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-white/10 text-[11px] text-slate-300 flex items-center justify-between">
                    <span>
                      {itineraryMode === 'single'
                        ? `Best 1-Stop (${basketOptimization.bestSingleStore.storeName}):`
                        : `Split savings (<$2.50) is less than transit friction. 1-Stop at ${basketOptimization.bestSingleStore.storeName} is best:`}
                    </span>
                    <strong className="font-mono text-white tabular-nums">
                      {formatCurrency(basketOptimization.bestSingleStore.totalCost)}
                    </strong>
                  </div>
                )}
              </div>

              {/* Single-Store Ranking Table */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-surface space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Single-Store Checkout Ranking
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium font-mono tabular-nums">
                    {basketOptimization.activeItemCount} items evaluated
                  </span>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {basketOptimization.singleStoreResults.map((res, idx) => {
                    const isWinner = idx === 0;
                    const totalItems = res.availableItemsCount + res.missingItemsCount;
                    const allInStock = res.missingItemsCount === 0;

                    return (
                      <div
                        key={res.storeId}
                        className={cn(
                          'py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors px-2.5 rounded-xl',
                          isWinner ? 'bg-emerald-50/70 font-semibold' : ''
                        )}
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="w-5 text-slate-500 font-mono text-[11px] tabular-nums">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-slate-900">
                            {res.storeName}
                          </span>
                          {isWinner && (
                            <span className="text-[9px] font-bold uppercase bg-emerald-600 text-white px-1.5 py-0.5 rounded-full">
                              Best 1-Stop
                            </span>
                          )}
                          {allInStock ? (
                            <span className="text-[10px] font-medium text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              All {totalItems} in stock
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-md">
                              {res.availableItemsCount}/{totalItems} in stock ({res.missingItemsCount} estimated)
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2 pl-7 sm:pl-0">
                          <span
                            className={cn(
                              'font-mono tabular-nums font-bold',
                              isWinner ? 'text-emerald-700 text-sm sm:text-base' : 'text-slate-700 text-sm'
                            )}
                          >
                            {formatCurrency(res.totalCost)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {basketOptimization.singleStoreResults.some((r) => r.missingItemsCount > 0) && (
                  <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    * Note: Unlisted items are estimated at +15% of lowest verified market price.
                  </p>
                )}
              </div>

              {/* Optimal Split-Trip Multi-Store Routing Breakdown */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-surface space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Split className="w-3.5 h-3.5 text-indigo-600" />
                    Split-Trip Routing Breakdown
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium font-mono tabular-nums">
                    {basketOptimization.splitTripBreakdownByStore.length} {basketOptimization.splitTripBreakdownByStore.length === 1 ? 'Store' : 'Stores'}
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
      {editingItem && (() => {
        const basePrice = editingItem.currentPrice || products.find((p) => p.id === editingItem.productId)?.currentLowestPrice || 0;
        return (
          <Modal
            isOpen={Boolean(editingItem)}
            onClose={() => setEditingItem(null)}
            title="Update Target Price Alert"
            description={`Set your threshold alert price for ${editingItem.productName}.`}
            size="sm"
            footer={
              <div className="flex items-center justify-between w-full gap-3">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setEditingItem(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSaveAlert}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Save Alert
                </Button>
              </div>
            }
          >
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80">
                <span>Current Lowest Benchmark:</span>
                <strong className="font-mono tabular-nums text-slate-900 text-sm">{formatCurrency(basePrice)}</strong>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Quick Target Presets
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { label: '-5%', pct: 0.05 },
                    { label: '-10%', pct: 0.10 },
                    { label: '-15%', pct: 0.15 },
                    { label: '-20%', pct: 0.20 },
                  ].map((preset) => {
                    const presetValue = Number((basePrice * (1 - preset.pct)).toFixed(2));
                    const isSelected = Math.abs(newTargetPrice - presetValue) < 0.01;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setNewTargetPrice(presetValue)}
                        aria-label={`Set alert target to ${preset.label} discount (${formatCurrency(presetValue)})`}
                        className={cn(
                          'px-2.5 py-1.5 min-h-[36px] rounded-lg text-xs font-medium border transition-colors touch-target',
                          isSelected
                            ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        )}
                      >
                        <span>{preset.label}</span>
                        <span className="ml-1 font-mono text-[11px] text-slate-500 tabular-nums">
                          {formatCurrency(presetValue)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Input
                id="target-price-input"
                label="Target Price ($)"
                type="number"
                step="0.05"
                min="0.01"
                value={newTargetPrice}
                onChange={(e) => setNewTargetPrice(parseFloat(e.target.value) || 0)}
                leftIcon={<span className="text-xs font-mono font-bold text-slate-500">$</span>}
                isNumeric
              />

              {newTargetPrice > 0 && newTargetPrice < basePrice && (
                <p className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  Alert triggers when price drops by {formatCurrency(basePrice - newTargetPrice)} ({Math.round(((basePrice - newTargetPrice) / basePrice) * 100)}% off).
                </p>
              )}
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}
