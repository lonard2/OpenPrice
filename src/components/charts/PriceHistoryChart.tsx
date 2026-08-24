'use client';

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { Info, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import type { PricePoint, Store, TimeframeFilter } from '@/types';
import { cn } from '@/lib/utils';

export interface PriceHistoryChartProps {
  historicalPrices: PricePoint[];
  stores?: Store[];
  currency?: string;
  height?: number;
  className?: string;
  initialTimeframe?: TimeframeFilter;
}

const STORE_COLOR_PALETTE = [
  '#4F46E5', // Indigo
  '#10B981', // Emerald
  '#0EA5E9', // Cerulean
  '#F59E0B', // Amber
  '#8B5CF6', // Violet
  '#F43F5E', // Rose
  '#14B8A6', // Teal
  '#6366F1', // Indigo Accent
];

const TIMEFRAMES: Array<{ id: TimeframeFilter; label: string; days: number }> = [
  { id: '7D', label: '7D', days: 7 },
  { id: '1M', label: '1M', days: 30 },
  { id: '3M', label: '3M', days: 90 },
  { id: '6M', label: '6M', days: 180 },
  { id: '1Y', label: '1Y', days: 365 },
  { id: 'ALL', label: 'ALL', days: Infinity },
];

export interface PriceHistorySourceMeta {
  sourceType: string;
  isVerified: boolean;
  confidence?: number;
}

export interface ChartRowData {
  date: string;
  displayDate: string;
  fullDate: string;
  sources: Record<string, PriceHistorySourceMeta>;
  [key: string]: number | string | Record<string, PriceHistorySourceMeta> | undefined;
}

interface TooltipPayloadItem {
  dataKey: string;
  name: string;
  value: number;
  color: string;
  payload: ChartRowData;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

export function PriceHistoryChart({
  historicalPrices = [],
  stores = [],
  currency = 'USD',
  height = 320,
  className,
  initialTimeframe = '3M',
}: PriceHistoryChartProps) {
  const [timeframe, setTimeframe] = useState<TimeframeFilter>(initialTimeframe);
  const [hiddenStores, setHiddenStores] = useState<Set<string>>(new Set());

  // Filter prices by timeframe
  const filteredPrices = useMemo(() => {
    if (!historicalPrices || historicalPrices.length === 0) return [];

    const tf = TIMEFRAMES.find((t) => t.id === timeframe);
    if (!tf || tf.days === Infinity) {
      return [...historicalPrices].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    }

    const cutoffTime = Date.now() - tf.days * 24 * 60 * 60 * 1000;
    const filtered = historicalPrices.filter(
      (p) => new Date(p.timestamp).getTime() >= cutoffTime
    );

    // If filtered is empty, fall back to all sorted
    if (filtered.length === 0) {
      return [...historicalPrices].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    }

    return filtered.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [historicalPrices, timeframe]);

  // Extract unique stores and assign colors
  const storeMap = useMemo(() => {
    const map = new Map<string, { id: string; name: string; color: string }>();
    let colorIdx = 0;

    historicalPrices.forEach((p) => {
      if (!map.has(p.storeId)) {
        const foundStore = stores.find((s) => s.id === p.storeId);
        map.set(p.storeId, {
          id: p.storeId,
          name: p.storeName || foundStore?.name || `Store ${p.storeId}`,
          color: foundStore?.color || STORE_COLOR_PALETTE[colorIdx % STORE_COLOR_PALETTE.length],
        });
        colorIdx++;
      }
    });

    return map;
  }, [historicalPrices, stores]);

  // Aggregate time series into chart data rows
  const chartData = useMemo<ChartRowData[]>(() => {
    if (filteredPrices.length === 0) return [];

    // Group by formatted date or timestamp
    const dateMap = new Map<string, ChartRowData>();

    filteredPrices.forEach((p) => {
      const dateKey = new Date(p.timestamp).toISOString().split('T')[0];
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {
          date: dateKey,
          displayDate: new Date(p.timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          fullDate: new Date(p.timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          sources: {},
        });
      }

      const row = dateMap.get(dateKey)!;
      row[p.storeId] = p.price;
      row.sources[p.storeId] = {
        sourceType: p.sourceType,
        isVerified: p.isVerified,
        confidence: p.confidenceScore,
      };
    });

    return Array.from(dateMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [filteredPrices]);

  // Benchmark stats: Lowest Price & Rolling Average
  const { minPrice, avgPrice } = useMemo(() => {
    const values = filteredPrices.map((p) => p.price).filter((p) => !isNaN(p) && p > 0);
    if (values.length === 0) {
      return { minPrice: 0, avgPrice: 0 };
    }
    const min = Math.min(...values);
    const avg = values.reduce((acc, c) => acc + c, 0) / values.length;
    return { minPrice: min, avgPrice: avg };
  }, [filteredPrices]);

  const toggleStore = (storeId: string) => {
    setHiddenStores((prev) => {
      const next = new Set(prev);
      if (next.has(storeId)) {
        next.delete(storeId);
      } else {
        next.add(storeId);
      }
      return next;
    });
  };

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (!active || !payload || payload.length === 0) return null;

    const rowData = payload[0]?.payload;
    const dateLabel = rowData?.fullDate || label;

    return (
      <div className="bg-slate-900/95 text-white p-3.5 rounded-xl shadow-xl border border-slate-800 text-xs min-w-[200px] backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-800 text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            {dateLabel}
          </span>
          <span className="text-[10px] uppercase tracking-wider font-mono">
            {payload.length} {payload.length === 1 ? 'store' : 'stores'}
          </span>
        </div>

        <div className="space-y-2 pt-2">
          {payload.map((entry) => {
            const storeMeta = storeMap.get(entry.dataKey);
            const sourceInfo = rowData?.sources?.[entry.dataKey];
            const isCheapestPoint = entry.value === minPrice;

            return (
              <div
                key={entry.dataKey}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="font-semibold text-slate-200 truncate max-w-[110px]">
                    {storeMeta?.name || entry.name}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 font-mono tabular-nums shrink-0">
                  <span
                    className={cn(
                      'font-bold',
                      isCheapestPoint ? 'text-emerald-400' : 'text-white'
                    )}
                  >
                    {formatCurrency(entry.value, currency)}
                  </span>
                  {sourceInfo?.isVerified && (
                    <span
                      title="Verified submission"
                      className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Handle single price point or empty state
  if (historicalPrices.length === 0) {
    return (
      <div
        className={cn(
          'w-full flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm',
          className
        )}
        style={{ height }}
      >
        <Info className="w-6 h-6 mb-2 text-slate-300" />
        <p className="font-medium text-slate-600">No historical price points recorded yet</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-full bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-surface flex flex-col space-y-4',
        className
      )}
    >
      {/* Header: Title & Timeframe Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-base font-bold text-slate-900 leading-tight">
            Historical Price Telemetry
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Multi-store price movements and benchmark thresholds
          </p>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 self-start sm:self-auto">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.id}
              type="button"
              onClick={() => setTimeframe(tf.id)}
              className={cn(
                'px-2.5 py-1 text-xs font-bold rounded-lg transition-all select-none',
                timeframe === tf.id
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              )}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Benchmark Badges */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {minPrice > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
            <span className="w-2 h-0.5 bg-emerald-500 rounded" />
            <span>All-Time Lowest:</span>
            <strong className="font-mono tabular-nums font-bold">
              {formatCurrency(minPrice, currency)}
            </strong>
          </div>
        )}

        {avgPrice > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium">
            <span className="w-2 h-0.5 bg-slate-400 rounded" />
            <span>Average:</span>
            <strong className="font-mono tabular-nums font-bold">
              {formatCurrency(avgPrice, currency)}
            </strong>
          </div>
        )}
      </div>

      {/* Recharts Chart Container */}
      <div className="w-full relative" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />

            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              axisLine={{ stroke: '#E2E8F0' }}
              tickLine={false}
            />

            <YAxis
              domain={['auto', 'auto']}
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              axisLine={{ stroke: '#E2E8F0' }}
              tickLine={false}
              tickFormatter={(val) => `$${val}`}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Benchmark Reference Lines */}
            {minPrice > 0 && (
              <ReferenceLine
                y={minPrice}
                stroke="#10B981"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: 'Low',
                  position: 'insideTopRight',
                  fill: '#10B981',
                  fontSize: 10,
                  fontWeight: 'bold',
                }}
              />
            )}

            {avgPrice > 0 && (
              <ReferenceLine
                y={avgPrice}
                stroke="#94A3B8"
                strokeDasharray="2 2"
                strokeWidth={1}
              />
            )}

            {/* Store Series Lines */}
            {Array.from(storeMap.values()).map((store) => {
              if (hiddenStores.has(store.id)) return null;

              return (
                <Line
                  key={store.id}
                  type="monotone"
                  dataKey={store.id}
                  name={store.name}
                  stroke={store.color}
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: store.color, strokeWidth: 1.5, stroke: '#FFFFFF' }}
                  activeDot={{ r: 6, fill: store.color, stroke: '#FFFFFF', strokeWidth: 2 }}
                  connectNulls
                  isAnimationActive={true}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive Store Legend */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
        <span className="text-xs font-semibold text-slate-400 mr-1">
          Stores:
        </span>
        {Array.from(storeMap.values()).map((store) => {
          const isHidden = hiddenStores.has(store.id);
          return (
            <button
              key={store.id}
              type="button"
              onClick={() => toggleStore(store.id)}
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all',
                isHidden
                  ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-60 line-through'
                  : 'bg-white border-slate-200/90 text-slate-700 shadow-2xs hover:border-slate-300'
              )}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: store.color }}
              />
              <span>{store.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
