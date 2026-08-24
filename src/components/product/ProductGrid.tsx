'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  SlidersHorizontal,
  ShoppingBag,
  Camera,
} from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { Product, ProductCategory } from '@/types';
import { CATEGORY_METADATA } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export type ProductSortOption =
  | 'lowest_price'
  | 'biggest_drop'
  | 'recent_hike'
  | 'most_stores'
  | 'verified_first';

export interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  watchlistedIds?: string[];
  onToggleWatchlist?: (product: Product) => void;
  onCompare?: (product: Product) => void;
  showFilters?: boolean;
  selectedCategory?: ProductCategory | 'all';
  onCategoryChange?: (category: ProductCategory | 'all') => void;
  className?: string;
}

export function ProductGrid({
  products,
  isLoading = false,
  watchlistedIds = [],
  onToggleWatchlist,
  onCompare,
  showFilters = true,
  selectedCategory = 'all',
  onCategoryChange,
  className,
}: ProductGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [internalCategory, setInternalCategory] = useState<ProductCategory | 'all'>('all');
  const [sortOption, setSortOption] = useState<ProductSortOption>('lowest_price');

  // Synchronize search query across components and URL
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const initialQ = urlParams.get('q');
      if (initialQ) setSearchQuery(initialQ);
    }

    const handleSearchSync = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (typeof customEvent.detail === 'string') {
        setSearchQuery(customEvent.detail);
      }
    };

    window.addEventListener('openprice:search-sync', handleSearchSync);
    return () => window.removeEventListener('openprice:search-sync', handleSearchSync);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    window.dispatchEvent(new CustomEvent('openprice:search-sync', { detail: value }));
  };

  const activeCategory = selectedCategory !== 'all' ? selectedCategory : internalCategory;

  const handleCategorySelect = (category: ProductCategory | 'all') => {
    if (onCategoryChange) {
      onCategoryChange(category);
    } else {
      setInternalCategory(category);
    }
  };

  // Dynamic Category counts reflecting current active search filter
  const categoriesList: Array<{ id: ProductCategory | 'all'; label: string; count: number }> = useMemo(() => {
    const searchFiltered = searchQuery.trim()
      ? products.filter((p) => {
          const q = searchQuery.toLowerCase().trim();
          return (
            p.name.toLowerCase().includes(q) ||
            p.brand?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q) ||
            p.tags?.some((t) => t.toLowerCase().includes(q))
          );
        })
      : products;

    const counts: Record<string, number> = {};
    searchFiltered.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });

    const allCats: Array<{ id: ProductCategory | 'all'; label: string; count: number }> = [
      { id: 'all', label: 'All Items', count: searchFiltered.length },
    ];

    Object.keys(CATEGORY_METADATA).forEach((catKey) => {
      const key = catKey as ProductCategory;
      allCats.push({
        id: key,
        label: CATEGORY_METADATA[key]?.displayName || key,
        count: counts[key] || 0,
      });
    });

    return allCats;
  }, [products, searchQuery]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Filter by Category
    if (activeCategory !== 'all') {
      list = list.filter((p) => p.category === activeCategory);
    }

    // Filter by Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort
    switch (sortOption) {
      case 'lowest_price':
        list.sort((a, b) => a.currentLowestPrice - b.currentLowestPrice);
        break;
      case 'biggest_drop':
        list.sort((a, b) => a.priceDeltaPercent - b.priceDeltaPercent);
        break;
      case 'recent_hike':
        list.sort((a, b) => b.priceDeltaPercent - a.priceDeltaPercent);
        break;
      case 'most_stores':
        list.sort((a, b) => (b.trackedStoresCount || 0) - (a.trackedStoresCount || 0));
        break;
      case 'verified_first':
        list.sort((a, b) => (b.isVerified ? 1 : 0) - (a.isVerified ? 1 : 0));
        break;
    }

    return list;
  }, [products, activeCategory, searchQuery, sortOption]);

  const watchlistSet = useMemo(() => new Set(watchlistedIds), [watchlistedIds]);

  return (
    <div className={cn('w-full flex flex-col space-y-6', className)}>
      {/* Search, Filter & Sort Controls */}
      {showFilters && (
        <div className="flex flex-col gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-surface">
          {/* Top Bar: Search Input & Sort Selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1">
              <Input
                id="main-product-search"
                type="search"
                placeholder="Search products, brands, or categories... (Press /)"
                aria-label="Search catalog products"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                clearable
                onClear={() => handleSearchChange('')}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="relative flex items-center w-full sm:w-auto">
                <SlidersHorizontal className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as ProductSortOption)}
                  aria-label="Sort products"
                  className="w-full sm:w-auto min-h-[44px] pl-9 pr-8 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer appearance-none"
                >
                  <option value="lowest_price">Lowest Price First</option>
                  <option value="biggest_drop">Biggest Price Drops</option>
                  <option value="recent_hike">Recent Price Spikes</option>
                  <option value="most_stores">Most Tracked Stores</option>
                  <option value="verified_first">Verified First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Filter Pills (Horizontal Scroll with Gradient Mask) */}
          <div className="relative">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 pt-1 scroll-smooth">
              {categoriesList.map((cat) => {
                const isSelected = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all select-none min-h-[36px]',
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/20'
                        : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                    )}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={cn(
                        'px-1.5 py-0.2 rounded-full text-[10px] font-mono',
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-white text-slate-500 border border-slate-200/60'
                      )}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
            {/* Gradient mask to indicate horizontal scrollability on small screens */}
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent sm:hidden" />
          </div>
        </div>
      )}

      {/* Results Header Count */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500">
        <span>
          Showing <strong className="text-slate-800 font-mono tabular-nums">{filteredProducts.length}</strong>{' '}
          {filteredProducts.length === 1 ? 'item' : 'items'}
        </span>
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-indigo-600 hover:underline font-semibold"
          >
            Clear search
          </button>
        )}
      </div>

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-surface"
            >
              <div className="flex justify-between">
                <Skeleton width={80} height={20} className="rounded-full" />
                <Skeleton width={60} height={16} />
              </div>
              <Skeleton width="80%" height={24} />
              <Skeleton width="50%" height={16} />
              <Skeleton height={36} />
              <div className="flex justify-between items-center pt-2">
                <Skeleton width={90} height={32} className="rounded-xl" />
                <Skeleton width={70} height={32} className="rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        /* Product Card Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isWatchlisted={watchlistSet.has(product.id)}
              onToggleWatchlist={onToggleWatchlist}
              onCompare={onCompare}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200/90 shadow-surface text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h4 className="text-lg font-bold text-slate-900 mb-1">
            No matching products found
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6">
            We couldn&apos;t find anything matching &quot;{searchQuery || activeCategory}&quot;. Try adjusting your search query or category filter.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                handleCategorySelect('all');
              }}
            >
              Reset Filters
            </Button>
            <Link
              href={searchQuery.trim() ? `/contribute?name=${encodeURIComponent(searchQuery.trim())}` : '/contribute'}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-ambient-lift transition-all touch-target"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Log price for {searchQuery.trim() ? `"${searchQuery.trim()}"` : 'a new item'}</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
