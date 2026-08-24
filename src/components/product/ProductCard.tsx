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

  // Identify winning/cheapest store name
  const cheapestStoreName = React.useMemo(() => {
    if (!product.historicalPrices || product.historicalPrices.length === 0) return null;
    const match = product.historicalPrices.find((p) => p.price === product.currentLowestPrice);
    return match ? match.storeName : null;
  }, [product.historicalPrices, product.currentLowestPrice]);

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
        'group flex flex-col justify-between h-full border border-slate-200/90 hover:border-indigo-300 transition-all duration-200 cursor-pointer shadow-surface hover:shadow-ambient-lift rounded-2xl',
        className
      )}
    >
      {/* Top Header & Identity Cluster */}
      <div className="p-5 sm:p-6 pb-4 space-y-2.5">
        {/* Row 1: Category & Unit Badges (clear of top-right Verified ribbon) */}
        <div className="flex items-center gap-1.5 flex-wrap min-h-[26px] pr-20">
          <Badge variant="category" size="sm" className="capitalize text-[11px] shrink-0 font-semibold">
            {product.category}
          </Badge>
          {product.unit && (
            <span className="inline-flex items-center text-[10px] font-semibold text-slate-600 bg-slate-100/90 border border-slate-200/80 px-2 py-0.5 rounded-md truncate max-w-[130px]">
              {product.unit}
            </span>
          )}
        </div>

        {/* Row 2 & 3: Brand Eyebrow + Product Title */}
        <div className="space-y-1">
          {product.brand ? (
            <span className="block text-[11px] font-bold uppercase tracking-wider text-indigo-600 truncate">
              {product.brand}
            </span>
          ) : (
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Generic Item
            </span>
          )}

          <Link
            href={`/product/${product.id}`}
            className="block group-hover:text-indigo-600 transition-colors focus-visible:outline-none focus-visible:underline"
          >
            <h4 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug break-words">
              {product.name}
            </h4>
          </Link>
        </div>

        {/* Row 4: Full 2-line Description */}
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-[2.25rem]">
          {product.description || 'Verified crowdsourced price observation across major tracked retailers.'}
        </p>
      </div>

      {/* Middle Telemetry: 30D Trend & Sparkline Strip */}
      <div className="px-5 sm:px-6 py-2.5 bg-slate-50/80 border-y border-slate-100 flex items-center justify-between gap-3">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            30D Movement
          </span>
          <div className="flex items-center gap-1.5 mt-0.5 whitespace-nowrap">
            {hasPriceDrop ? (
              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 font-mono tabular-nums">
                <TrendingDown className="w-3.5 h-3.5 shrink-0" />
                {formatDeltaPercent(product.priceDeltaPercent)}
              </span>
            ) : hasPriceHike ? (
              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-rose-600 font-mono tabular-nums">
                <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                {formatDeltaPercent(product.priceDeltaPercent)}
              </span>
            ) : (
              <span className="text-xs font-semibold text-slate-500 font-mono tabular-nums">
                Stable (0.0%)
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

      {/* Bottom Surface: Price, Store Provenance & Action Controls */}
      <div className="p-5 sm:p-6 pt-4 flex flex-col justify-between flex-1 gap-4">
        {/* Main Lowest Price Block & Retailer Provenance */}
        <div className="space-y-2">
          {/* Micro-Header: Label & Store Count Badge */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Lowest Price
            </span>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100/90 border border-slate-200/60 px-2 py-0.5 rounded-lg shrink-0">
              <StoreIcon className="w-3 h-3 text-slate-400" />
              <span>
                {product.trackedStoresCount || 1} {product.trackedStoresCount === 1 ? 'store' : 'stores'}
              </span>
            </div>
          </div>

          {/* Price Badge + Winning Store Pill */}
          <div className="flex items-center gap-2 flex-wrap">
            <PriceBadge
              price={product.currentLowestPrice}
              previousPrice={product.previousPrice}
              size="md"
              showIcon
            />
            {cheapestStoreName && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200/70 px-2.5 py-1 rounded-xl truncate max-w-full">
                <span className="text-slate-400 font-normal text-[11px]">at</span>
                <strong className="text-slate-900 font-bold truncate">{cheapestStoreName}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons: Uniform h-11 Flex Toolbar with Optical Centering */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center gap-3">
          {/* Watchlist Toggle - Fixed 44x44px ergonomic touch target */}
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
              'w-11 h-11 shrink-0 inline-flex items-center justify-center rounded-xl border transition-all text-xs font-medium touch-target shadow-2xs',
              isWatchlisted
                ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            <Bookmark
              className={cn('w-4 h-4', isWatchlisted && 'fill-amber-500 text-amber-600')}
            />
          </button>

          {/* Compare Trigger - Fixed h-11 Flex-1 with Optical Vertical Centering */}
          {onCompare ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCompare(product);
              }}
              aria-label={`Compare prices for ${product.name}`}
              className="flex-1 h-11 px-3.5 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold leading-none text-slate-700 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors whitespace-nowrap touch-target shadow-2xs"
            >
              <Scale className="w-3.5 h-3.5 shrink-0 text-slate-500" />
              <span>Compare</span>
            </button>
          ) : null}

          {/* View Details Link - Fixed h-11 Flex-1 with Optical Vertical Centering */}
          <Link
            href={`/product/${product.id}`}
            aria-label={`View details for ${product.name}`}
            className="flex-1 h-11 px-3.5 inline-flex items-center justify-center gap-1.5 text-xs font-bold leading-none text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors whitespace-nowrap touch-target"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
