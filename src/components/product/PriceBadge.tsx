'use client';

import React from 'react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDeltaPercent } from '@/lib/formatters';

export type PriceBadgeSize = 'sm' | 'md' | 'lg' | 'hero';

export interface PriceBadgeProps {
  price: number;
  previousPrice?: number;
  currency?: string;
  unit?: string;
  size?: PriceBadgeSize;
  showDelta?: boolean;
  showPercent?: boolean;
  showIcon?: boolean;
  className?: string;
}

const sizeContainerStyles: Record<PriceBadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs gap-1.5 rounded-lg',
  md: 'px-2.5 py-1 text-sm gap-2 rounded-xl',
  lg: 'px-3.5 py-1.5 text-base gap-2.5 rounded-xl',
  hero: 'px-4 py-2 text-xl sm:text-2xl gap-3 rounded-2xl',
};

const priceTextStyles: Record<PriceBadgeSize, string> = {
  sm: 'text-xs font-bold font-mono tabular-nums',
  md: 'text-sm font-bold font-mono tabular-nums',
  lg: 'text-base sm:text-lg font-extrabold font-mono tabular-nums',
  hero: 'text-2xl sm:text-3xl font-black font-mono tabular-nums tracking-tight',
};

export function PriceBadge({
  price,
  previousPrice,
  currency = 'USD',
  unit,
  size = 'md',
  showDelta = false,
  showPercent = false,
  showIcon = true,
  className,
}: PriceBadgeProps) {
  const hasPrevious = previousPrice !== undefined && previousPrice > 0;
  const deltaAmount = hasPrevious ? price - previousPrice : 0;
  const deltaPercent = hasPrevious
    ? ((price - previousPrice) / previousPrice) * 100
    : 0;

  // Strict Price Direction Rule
  let colorStyles = 'bg-slate-100 text-slate-700 border-slate-200/90';
  let Icon = Minus;
  let iconColor = 'text-slate-500';
  let trendLabel = 'Stable price';

  if (hasPrevious) {
    if (deltaAmount < -0.001) {
      // Price Drop / Consumer Savings -> Emerald Mint
      colorStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      Icon = TrendingDown;
      iconColor = 'text-emerald-600';
      trendLabel = 'Price drop';
    } else if (deltaAmount > 0.001) {
      // Price Hike / Inflation -> Coral Rose
      colorStyles = 'bg-rose-50 text-rose-700 border-rose-200';
      Icon = TrendingUp;
      iconColor = 'text-rose-600';
      trendLabel = 'Price hike';
    }
  }

  const iconSizes: Record<PriceBadgeSize, string> = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
    hero: 'w-6 h-6',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center border transition-colors select-none font-medium',
        sizeContainerStyles[size],
        colorStyles,
        className
      )}
      aria-label={`${trendLabel}: ${formatCurrency(price, currency)}${unit ? ` ${unit}` : ''}`}
    >
      {showIcon && (
        <span className="inline-flex shrink-0 items-center justify-center">
          <Icon className={cn(iconSizes[size], iconColor)} aria-hidden="true" />
        </span>
      )}

      {/* Main Price */}
      <span className={priceTextStyles[size]}>
        {formatCurrency(price, currency)}
      </span>

      {/* Unit label if present */}
      {unit && (
        <span className="text-xs font-normal opacity-75 font-sans">
          {unit}
        </span>
      )}

      {/* Optional delta amount */}
      {showDelta && hasPrevious && Math.abs(deltaAmount) > 0.001 && (
        <span className="text-[11px] font-mono tabular-nums font-semibold opacity-90">
          ({deltaAmount > 0 ? '+' : ''}
          {formatCurrency(deltaAmount, currency)})
        </span>
      )}

      {/* Optional delta percent */}
      {showPercent && hasPrevious && Math.abs(deltaPercent) > 0.01 && (
        <span className="text-[11px] font-mono tabular-nums font-semibold px-1.5 py-0.5 rounded bg-white/70 shadow-2xs">
          {formatDeltaPercent(deltaPercent)}
        </span>
      )}
    </div>
  );
}
