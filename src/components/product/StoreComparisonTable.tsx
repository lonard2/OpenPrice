'use client';

import React from 'react';
import {
  CheckCircle2,
  Store as StoreIcon,
  Globe,
  Sparkles,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatRelativeTime } from '@/lib/formatters';
import type { StorePriceComparison } from '@/types';
import { cn } from '@/lib/utils';

export interface StoreComparisonTableProps {
  comparisons: StorePriceComparison[];
  currency?: string;
  onSelectStore?: (store: StorePriceComparison) => void;
  className?: string;
}

export function StoreComparisonTable({
  comparisons,
  currency = 'USD',
  onSelectStore,
  className,
}: StoreComparisonTableProps) {
  if (!comparisons || comparisons.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
        No store pricing data available for this product yet.
      </div>
    );
  }

  // Sort comparisons by price ascending (cheapest first)
  const sorted = [...comparisons].sort((a, b) => a.price - b.price);

  return (
    <div
      className={cn(
        'w-full bg-white rounded-2xl border border-slate-200/90 shadow-surface overflow-hidden',
        className
      )}
    >
      {/* Desktop & Tablet Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/90 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th scope="col" className="py-3.5 px-5">
                Retailer & Location
              </th>
              <th scope="col" className="py-3.5 px-4">
                Type
              </th>
              <th scope="col" className="py-3.5 px-4 text-right">
                Price
              </th>
              <th scope="col" className="py-3.5 px-4 text-right">
                Variance vs Lowest
              </th>
              <th scope="col" className="py-3.5 px-4 text-center">
                Stock
              </th>
              <th scope="col" className="py-3.5 px-4">
                Provenance
              </th>
              <th scope="col" className="py-3.5 px-4">
                Observed
              </th>
              {onSelectStore && (
                <th scope="col" className="py-3.5 px-4 text-center">
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {sorted.map((item) => {
              const isCheapest = item.isCheapest;
              const diffAmount = item.diffFromMin ?? item.diffFromLowestAmount ?? 0;
              const diffPercent = item.diffPercentFromMin ?? item.diffFromLowestPercent ?? 0;

              return (
                <tr
                  key={item.storeId}
                  className={cn(
                    'transition-colors',
                    isCheapest
                      ? 'bg-emerald-50/40 hover:bg-emerald-50/70'
                      : 'hover:bg-slate-50/80'
                  )}
                >
                  {/* Retailer Name */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border',
                          isCheapest
                            ? 'bg-emerald-100/80 border-emerald-300 text-emerald-700'
                            : 'bg-slate-100 border-slate-200 text-slate-600'
                        )}
                      >
                        <StoreIcon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">
                            {item.storeName}
                          </span>
                          {isCheapest && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white uppercase tracking-wider">
                              <Sparkles className="w-2.5 h-2.5" />
                              Best Value
                            </span>
                          )}
                        </div>
                        {item.chain && (
                          <span className="text-xs text-slate-500">
                            {item.chain}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Store Type */}
                  <td className="py-4 px-4">
                    <Badge variant="category" size="sm" className="capitalize">
                      {item.storeType === 'online' ? (
                        <Globe className="w-3 h-3 text-cerulean-600" />
                      ) : (
                        <StoreIcon className="w-3 h-3 text-slate-500" />
                      )}
                      <span>{item.storeType || 'Physical'}</span>
                    </Badge>
                  </td>

                  {/* Price */}
                  <td className="py-4 px-4 text-right">
                    <div className="flex flex-col items-end">
                      <span
                        className={cn(
                          'text-base font-bold font-mono tabular-nums',
                          isCheapest ? 'text-emerald-700 font-extrabold' : 'text-slate-900'
                        )}
                      >
                        {formatCurrency(item.price, currency)}
                      </span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="text-xs text-slate-400 line-through font-mono tabular-nums">
                          {formatCurrency(item.originalPrice, currency)}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Variance vs Lowest */}
                  <td className="py-4 px-4 text-right font-mono tabular-nums">
                    {isCheapest ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Cheapest
                      </span>
                    ) : (
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-slate-700">
                          +{formatCurrency(diffAmount, currency)}
                        </span>
                        {diffPercent > 0 && (
                          <span className="text-[11px] font-semibold text-rose-600">
                            (+{diffPercent.toFixed(1)}%)
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Stock Status */}
                  <td className="py-4 px-4 text-center">
                    {item.inStock !== false ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        In Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        Out of Stock
                      </span>
                    )}
                  </td>

                  {/* Provenance */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5">
                      {item.isVerified && (
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      <span className="text-xs text-slate-600 capitalize">
                        {item.sourceType
                          ? item.sourceType.replace('_', ' ')
                          : 'Shelf Tag OCR'}
                      </span>
                    </div>
                  </td>

                  {/* Last Observed */}
                  <td className="py-4 px-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{formatRelativeTime(item.lastUpdated || Date.now())}</span>
                    </div>
                  </td>

                  {/* Action Button */}
                  {onSelectStore && (
                    <td className="py-4 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => onSelectStore(item)}
                        className="px-3 py-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors min-h-[36px]"
                      >
                        Select
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View (<768px) */}
      <div className="block md:hidden divide-y divide-slate-100">
        {sorted.map((item) => {
          const isCheapest = item.isCheapest;
          const diffAmount = item.diffFromMin ?? item.diffFromLowestAmount ?? 0;
          const diffPercent = item.diffPercentFromMin ?? item.diffFromLowestPercent ?? 0;

          return (
            <div
              key={item.storeId}
              className={cn(
                'p-4 flex flex-col gap-3',
                isCheapest ? 'bg-emerald-50/40' : 'bg-white'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border',
                      isCheapest
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                        : 'bg-slate-100 border-slate-200 text-slate-600'
                    )}
                  >
                    <StoreIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">
                      {item.storeName}
                    </h5>
                    {item.chain && (
                      <p className="text-xs text-slate-500">{item.chain}</p>
                    )}
                  </div>
                </div>

                {isCheapest && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white uppercase">
                    Best Value
                  </span>
                )}
              </div>

              {/* Price & Variance */}
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">
                    Store Price
                  </span>
                  <span
                    className={cn(
                      'text-base font-bold font-mono tabular-nums',
                      isCheapest ? 'text-emerald-700' : 'text-slate-900'
                    )}
                  >
                    {formatCurrency(item.price, currency)}
                  </span>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">
                    Variance
                  </span>
                  {isCheapest ? (
                    <span className="text-xs font-bold text-emerald-600">
                      Lowest Price
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-rose-600 font-mono tabular-nums">
                      +{formatCurrency(diffAmount, currency)}{' '}
                      {diffPercent > 0 && `(+${diffPercent.toFixed(0)}%)`}
                    </span>
                  )}
                </div>
              </div>

              {/* Meta & Stock */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Badge variant="category" size="sm">
                    {item.storeType || 'physical'}
                  </Badge>
                  <span>{formatRelativeTime(item.lastUpdated || Date.now())}</span>
                </div>

                {item.inStock !== false ? (
                  <span className="text-emerald-700 font-semibold text-xs">
                    ● In Stock
                  </span>
                ) : (
                  <span className="text-rose-600 font-semibold text-xs">
                    ● Out of Stock
                  </span>
                )}
              </div>

              {onSelectStore && (
                <button
                  type="button"
                  onClick={() => onSelectStore(item)}
                  className="w-full min-h-[44px] py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
                >
                  Select Store
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
