'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import type { StorePriceComparison } from '@/types';
import { cn } from '@/lib/utils';

export interface StoreComparisonChartProps {
  comparisons: StorePriceComparison[];
  currency?: string;
  height?: number;
  className?: string;
  onSelectStore?: (store: StorePriceComparison) => void;
}

interface ChartBarData {
  storeId: string;
  storeName: string;
  price: number;
  diffFromMin: number;
  diffPercent: number;
  isCheapest: boolean;
  storeType: string;
  raw: StorePriceComparison;
}

interface TooltipPayloadEntry {
  payload: ChartBarData;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}

export function StoreComparisonChart({
  comparisons = [],
  currency = 'USD',
  height = 280,
  className,
  onSelectStore,
}: StoreComparisonChartProps) {
  if (!comparisons || comparisons.length === 0) {
    return (
      <div
        className={cn(
          'w-full flex items-center justify-center p-8 bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm',
          className
        )}
        style={{ height }}
      >
        No store comparison data available
      </div>
    );
  }

  // Sort ascending by price (cheapest first)
  const sorted = [...comparisons].sort((a, b) => a.price - b.price);
  const minPrice = sorted[0]?.price || 0;

  // Chart data mapping
  const chartData: ChartBarData[] = sorted.map((item) => {
    const diffFromMin = item.diffFromMin ?? (item.price - minPrice);
    const diffPercent = minPrice > 0 ? ((item.price - minPrice) / minPrice) * 100 : 0;
    const isCheapest = item.isCheapest || item.price === minPrice;

    return {
      storeId: item.storeId,
      storeName: item.storeName,
      price: item.price,
      diffFromMin,
      diffPercent,
      isCheapest,
      storeType: item.storeType || 'physical',
      raw: item,
    };
  });

  // Custom Horizontal Bar Tooltip
  const CustomBarTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (!active || !payload || payload.length === 0) return null;
    const data = payload[0]?.payload;
    if (!data) return null;

    return (
      <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs min-w-[190px] backdrop-blur-md">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
          <span className="font-bold text-slate-200">{data.storeName}</span>
          {data.isCheapest && (
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" /> Best Value
            </span>
          )}
        </div>

        <div className="space-y-1 pt-2 font-mono tabular-nums">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans">Price:</span>
            <strong
              className={cn(
                'text-sm font-bold',
                data.isCheapest ? 'text-emerald-400' : 'text-white'
              )}
            >
              {formatCurrency(data.price, currency)}
            </strong>
          </div>

          {!data.isCheapest && (
            <div className="flex items-center justify-between text-[11px] text-rose-400">
              <span className="text-slate-400 font-sans">Variance:</span>
              <span>
                +{formatCurrency(data.diffFromMin, currency)} (+{data.diffPercent.toFixed(1)}%)
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn(
        'w-full bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-surface flex flex-col space-y-4',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-base font-bold text-slate-900 leading-tight">
            Store Price Ranking
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked from lowest to highest retailer price
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Lowest: <strong className="font-mono">{formatCurrency(minPrice, currency)}</strong></span>
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="w-full relative" style={{ height: Math.max(height, chartData.length * 48 + 50) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />

            <XAxis
              type="number"
              domain={['auto', 'auto']}
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              axisLine={{ stroke: '#E2E8F0' }}
              tickLine={false}
              tickFormatter={(val) => `$${val}`}
            />

            <YAxis
              type="category"
              dataKey="storeName"
              width={100}
              tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
              axisLine={{ stroke: '#E2E8F0' }}
              tickLine={false}
            />

            <Tooltip content={<CustomBarTooltip />} />

            <Bar
              dataKey="price"
              radius={[0, 8, 8, 0]}
              barSize={24}
              onClick={(entry) => onSelectStore?.(entry.raw)}
              cursor={onSelectStore ? 'pointer' : 'default'}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.isCheapest
                      ? '#10B981' // Emerald for cheapest
                      : index === 1
                      ? '#0EA5E9' // Cerulean
                      : index === 2
                      ? '#4F46E5' // Indigo
                      : '#94A3B8' // Slate for expensive
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
