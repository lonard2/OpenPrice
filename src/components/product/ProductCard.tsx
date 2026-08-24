'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

  // Extract historical sparkline points
  const sparklineData =
    product.historicalPrices && product.historicalPrices.length > 0
      ? product.historicalPrices.slice(-30).map((p) => p.price)
      : [product.previousPrice || product.currentLowestPrice, product.currentLowestPrice];

  const hasPriceDrop = product.priceDeltaPercent < -0.01;
  const hasPriceHike = product.priceDeltaPercent > 0.01;

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, select')) return;
    router.push(`/product/${product.id}`);
  };

  return (
    <Card
      isInteractive
      onClick={handleCardClick}
      verifiedRibbon={product.isVerified ? 'Verified' : false}
      className={cn(
        'group flex flex-col justify-between h-full border border-slate-200/90 hover:border-indigo-300 transition-all duration-200 cursor-pointer',
        className
      )}
    >
      {/* Top Header / Badges */}
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2 pr-20">
          <Badge variant="category" size="sm" className="capitalize text-[11px]">
            {product.category}
          </Badge>
          {product.brand && (
            <span className="text-xs font-semibold text-slate-500 truncate max-w-[100px] sm:max-w-[120px]">
              {product.brand}
            </span>
          )}
        </div>

        {/* Product Title */}
        <Link
          href={`/product/${product.id}`}
          className="block group-hover:text-indigo-600 transition-colors focus-visible:outline-none focus-visible:underline"
        >
          <h4 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug break-words">
            {product.name}
          </h4>
        </Link>

        {/* Description or Unit */}
        <p className="text-xs text-slate-500 mt-1 line-clamp-1 truncate">
          Unit: <span className="font-semibold text-slate-700">{product.unit || 'unit'}</span>
          {product.description && ` • ${product.description}`}
        </p>
      </div>

      {/* Sparkline & Delta Strip */}
      <div className="px-4 sm:px-5 py-2.5 bg-slate-50/70 border-y border-slate-100 flex items-center justify-between gap-2">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            30D Trend
          </span>
          <div className="flex items-center gap-1 mt-0.5 whitespace-nowrap">
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

        <div className="shrink-0 flex items-center">
          <Sparkline
            data={sparklineData}
            width={84}
            height={26}
            strokeWidth={2}
          />
        </div>
      </div>

      {/* Pricing & Footer Actions */}
      <div className="p-4 sm:p-5 pt-3 flex flex-col gap-3">
        {/* Main Lowest Price Badge */}
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div className="flex flex-col min-w-0">
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
          <div className="flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100/90 px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap">
            <StoreIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>{product.trackedStoresCount || 1} {product.trackedStoresCount === 1 ? 'store' : 'stores'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 min-w-0">
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
                'min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border transition-all text-xs font-medium shrink-0 touch-target',
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
                className="min-h-[40px] px-2.5 sm:px-3 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors whitespace-nowrap touch-target"
              >
                <Scale className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Compare</span>
              </button>
            )}
          </div>

          {/* View Details Link */}
          <Link
            href={`/product/${product.id}`}
            aria-label={`View details for ${product.name}`}
            className="min-h-[40px] px-3 sm:px-3.5 inline-flex items-center justify-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors shrink-0 ml-auto whitespace-nowrap touch-target"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
