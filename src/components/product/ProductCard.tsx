'use client';

import React from 'react';
import Link from 'next/link';
import {
  Bookmark,
  Scale,
  Store as StoreIcon,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PriceBadge } from '@/components/product/PriceBadge';
import { Sparkline } from '@/components/charts/Sparkline';
import { formatDeltaPercent } from '@/lib/formatters';
import type { Product } from '@/types';
import { cn } from '@/lib/utils';

export interface ProductCardProps {
  product: Product;
  isWatchlisted?: boolean;
  onToggleWatchlist?: (product: Product) => void;
  onCompare?: (product: Product) => void;
  className?: string;
}

export function ProductCard({
  product,
  isWatchlisted = false,
  onToggleWatchlist,
  onCompare,
  className,
}: ProductCardProps) {
  // Extract historical sparkline points
  const sparklineData =
    product.historicalPrices && product.historicalPrices.length > 0
      ? product.historicalPrices.slice(-30).map((p) => p.price)
      : [product.previousPrice || product.currentLowestPrice, product.currentLowestPrice];

  const hasPriceDrop = product.priceDeltaPercent < -0.01;
  const hasPriceHike = product.priceDeltaPercent > 0.01;

  return (
    <Card
      isInteractive
      verifiedRibbon={product.isVerified ? 'Verified' : false}
      className={cn(
        'group flex flex-col justify-between h-full border border-slate-200/90 hover:border-indigo-300 transition-all duration-200',
        className
      )}
    >
      {/* Top Header / Badges */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-2 mb-2 pr-16">
          <Badge variant="category" size="sm" className="capitalize text-[11px]">
            {product.category}
          </Badge>
          {product.brand && (
            <span className="text-xs font-semibold text-slate-500 truncate max-w-[120px]">
              {product.brand}
            </span>
          )}
        </div>

        {/* Product Title */}
        <Link
          href={`/product/${product.id}`}
          className="block group-hover:text-indigo-600 transition-colors focus-visible:outline-none focus-visible:underline"
        >
          <h4 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug">
            {product.name}
          </h4>
        </Link>

        {/* Description or Unit */}
        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
          Unit: <span className="font-medium text-slate-700">{product.unit || 'unit'}</span>
          {product.description && ` • ${product.description}`}
        </p>
      </div>

      {/* Sparkline & Delta Strip */}
      <div className="px-5 py-2.5 bg-slate-50/70 border-y border-slate-100 flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
            30D Trend
          </span>
          <div className="flex items-center gap-1 mt-0.5">
            {hasPriceDrop ? (
              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 font-mono tabular-nums">
                <TrendingDown className="w-3.5 h-3.5" />
                {formatDeltaPercent(product.priceDeltaPercent)}
              </span>
            ) : hasPriceHike ? (
              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-rose-600 font-mono tabular-nums">
                <TrendingUp className="w-3.5 h-3.5" />
                {formatDeltaPercent(product.priceDeltaPercent)}
              </span>
            ) : (
              <span className="text-xs font-semibold text-slate-500 font-mono tabular-nums">
                Stable
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0">
          <Sparkline
            data={sparklineData}
            width={90}
            height={28}
            strokeWidth={2}
          />
        </div>
      </div>

      {/* Pricing & Footer Actions */}
      <div className="p-5 pt-3.5 flex flex-col gap-3">
        {/* Main Lowest Price Badge */}
        <div className="flex items-end justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Lowest Price
            </span>
            <PriceBadge
              price={product.currentLowestPrice}
              previousPrice={product.previousPrice}
              size="md"
              showIcon
              className="mt-0.5"
            />
          </div>

          {/* Store Availability Count */}
          <div className="flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100/80 px-2.5 py-1 rounded-lg shrink-0">
            <StoreIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>{product.trackedStoresCount || 1} stores</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            {/* Watchlist Toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleWatchlist?.(product);
              }}
              aria-label={
                isWatchlisted ? `Remove ${product.name} from watchlist` : `Add ${product.name} to watchlist`
              }
              className={cn(
                'min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border transition-all text-xs font-medium',
                isWatchlisted
                  ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Bookmark
                className={cn('w-4 h-4', isWatchlisted && 'fill-amber-500 text-amber-600')}
              />
            </button>

            {/* Compare Trigger */}
            {onCompare && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onCompare(product);
                }}
                aria-label={`Compare prices for ${product.name}`}
                className="min-h-[44px] px-3 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
              >
                <Scale className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Compare</span>
              </button>
            )}
          </div>

          {/* View Details Link */}
          <Link
            href={`/product/${product.id}`}
            aria-label={`View details for ${product.name}`}
            className="min-h-[44px] px-3.5 inline-flex items-center justify-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors shrink-0"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
