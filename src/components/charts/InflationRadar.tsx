'use client';

import React from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { formatDeltaPercent } from '@/lib/formatters';
import type { InflationBasketReport, ProductCategory } from '@/types';
import { CATEGORY_METADATA } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export interface InflationRadarItem {
  category: string;
  displayName: string;
  currentRate: number;    // e.g. +6.4% or -2.1%
  baselineRate?: number;   // e.g. +3.0%
  weight?: number;        // e.g. 0.35
}

export interface InflationRadarProps {
  report?: InflationBasketReport;
  customData?: InflationRadarItem[];
  height?: number;
  className?: string;
  onSelectCategory?: (category: ProductCategory) => void;
}

interface TooltipPayloadEntry {
  payload: InflationRadarItem;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}

export function InflationRadar({
  report,
  customData,
  height = 320,
  className,
  onSelectCategory,
}: InflationRadarProps) {
  // Build radar data points from report or customData
  const chartData: InflationRadarItem[] = React.useMemo(() => {
    if (customData && customData.length > 0) {
      return customData;
    }

    if (report && report.categoryBreakdown) {
      return Object.entries(report.categoryBreakdown).map(([catKey, rate]) => {
        const key = catKey as ProductCategory;
        const meta = CATEGORY_METADATA[key];
        return {
          category: catKey,
          displayName: meta?.displayName || catKey,
          currentRate: rate,
          baselineRate: 2.5, // Standard target inflation baseline
          weight: meta?.inflationBasketWeight || 0.15,
        };
      });
    }

    // Default representative basket data across standard categories
    return [
      { category: 'groceries', displayName: 'Groceries', currentRate: 4.8, baselineRate: 2.5, weight: 0.35 },
      { category: 'beverages', displayName: 'Beverages', currentRate: 3.2, baselineRate: 2.1, weight: 0.15 },
      { category: 'household', displayName: 'Household', currentRate: 5.4, baselineRate: 2.8, weight: 0.15 },
      { category: 'pharmacy', displayName: 'Pharmacy', currentRate: 2.1, baselineRate: 2.0, weight: 0.10 },
      { category: 'electronics', displayName: 'Electronics', currentRate: -1.5, baselineRate: 1.0, weight: 0.10 },
      { category: 'services', displayName: 'Services', currentRate: 6.2, baselineRate: 3.2, weight: 0.08 },
    ];
  }, [report, customData]);

  const maxInflation = Math.max(...chartData.map((d) => d.currentRate), 5);
  const compositeRate = report?.compositeInflationRate ?? report?.inflationRatePercent ?? 3.9;

  // Custom Radar Tooltip
  const CustomRadarTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (!active || !payload || payload.length === 0) return null;
    const data = payload[0]?.payload;
    if (!data) return null;

    const isHigh = data.currentRate > 4.0;
    const isDeflation = data.currentRate < 0;

    return (
      <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs min-w-[190px] backdrop-blur-md">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
          <span className="font-bold text-slate-200">{data.displayName}</span>
          {data.weight && (
            <span className="text-[10px] text-slate-400 font-mono">
              Weight: {(data.weight * 100).toFixed(0)}%
            </span>
          )}
        </div>

        <div className="space-y-1.5 pt-2 font-mono tabular-nums">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans">Current Inflation:</span>
            <strong
              className={cn(
                'font-bold text-sm',
                isDeflation
                  ? 'text-emerald-400'
                  : isHigh
                  ? 'text-rose-400'
                  : 'text-indigo-300'
              )}
            >
              {formatDeltaPercent(data.currentRate)}
            </strong>
          </div>

          {data.baselineRate !== undefined && (
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-sans">Baseline Target:</span>
              <span>{formatDeltaPercent(data.baselineRate)}</span>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="text-base font-bold text-slate-900 leading-tight">
            Category Inflation Barometer
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            6-Axis Laspeyres Weighted Basket Comparison
          </p>
        </div>

        {/* Composite Rate Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold font-mono tabular-nums self-start sm:self-auto">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Composite: {formatDeltaPercent(compositeRate)}</span>
        </div>
      </div>

      {/* Radar Chart Container */}
      <div className="w-full relative" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            data={chartData}
            margin={{ top: 10, right: 25, bottom: 10, left: 25 }}
          >
            <PolarGrid stroke="#E2E8F0" strokeDasharray="2 2" />

            <PolarAngleAxis
              dataKey="displayName"
              tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
            />

            <PolarRadiusAxis
              angle={30}
              domain={[0, Math.ceil(maxInflation + 2)]}
              tick={{ fontSize: 10, fill: '#94A3B8' }}
              tickFormatter={(val) => `${val}%`}
              stroke="#CBD5E1"
            />

            {/* Baseline target area */}
            <Radar
              name="Target Baseline"
              dataKey="baselineRate"
              stroke="#94A3B8"
              fill="#94A3B8"
              fillOpacity={0.15}
              strokeDasharray="3 3"
              strokeWidth={1.5}
            />

            {/* Current inflation area */}
            <Radar
              name="Current Inflation"
              dataKey="currentRate"
              stroke="#4F46E5"
              fill="#4F46E5"
              fillOpacity={0.35}
              strokeWidth={2.5}
            />

            <Tooltip content={<CustomRadarTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Category Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-indigo-600/40 border border-indigo-600" />
            <span className="font-medium">Current Month</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-200 border border-slate-400 border-dashed" />
            <span className="font-medium">Target Baseline</span>
          </div>
        </div>

        {onSelectCategory && (
          <div className="flex items-center gap-1">
            {chartData.map((d) => (
              <button
                key={d.category}
                type="button"
                onClick={() => onSelectCategory(d.category as ProductCategory)}
                className="px-2 py-0.5 rounded text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 font-medium transition-colors"
              >
                {d.displayName}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
