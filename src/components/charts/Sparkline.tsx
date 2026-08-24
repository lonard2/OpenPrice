'use client';

import React, { useId } from 'react';
import { cn } from '@/lib/utils';

export interface SparklinePoint {
  price: number;
  timestamp?: string;
}

export interface SparklineProps {
  data: number[] | SparklinePoint[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  showGradient?: boolean;
  showLastPointDot?: boolean;
  className?: string;
  color?: string; // Optional forced color override
}

export function Sparkline({
  data,
  width = 100,
  height = 32,
  strokeWidth = 2,
  showGradient = true,
  showLastPointDot = true,
  className,
  color,
}: SparklineProps) {
  const gradientId = useId();

  // Normalize data points
  const rawValues: number[] = (data || [])
    .map((item) => (typeof item === 'number' ? item : item?.price))
    .filter((v) => typeof v === 'number' && !isNaN(v) && isFinite(v));

  if (rawValues.length === 0) {
    return (
      <div
        className={cn('flex items-center justify-center text-slate-300 text-xs', className)}
        style={{ width, height }}
      >
        <span className="text-[10px] italic">No data</span>
      </div>
    );
  }

  const padding = strokeWidth + 2;
  const usableWidth = Math.max(width - padding * 2, 1);
  const usableHeight = Math.max(height - padding * 2, 1);

  const firstVal = rawValues[0];
  const lastVal = rawValues[rawValues.length - 1];
  const delta = lastVal - firstVal;

  // Strict Price Direction: Drop = Emerald, Hike = Coral/Rose, Stable = Slate
  let strokeColor = '#64748B'; // slate-500
  let fillColor = '#94A3B8'; // slate-400

  if (color) {
    strokeColor = color;
    fillColor = color;
  } else if (delta < -0.001) {
    strokeColor = '#10B981'; // emerald-500
    fillColor = '#10B981';
  } else if (delta > 0.001) {
    strokeColor = '#F43F5E'; // rose-500
    fillColor = '#F43F5E';
  }

  // Handle single data point
  if (rawValues.length === 1) {
    const centerY = height / 2;
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={cn('overflow-visible select-none shrink-0', className)}
        aria-hidden="true"
      >
        <line
          x1={padding}
          y1={centerY}
          x2={width - padding}
          y2={centerY}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray="2 2"
          opacity={0.5}
        />
        <circle
          cx={width / 2}
          cy={centerY}
          r={strokeWidth + 1}
          fill={strokeColor}
        />
      </svg>
    );
  }

  const minVal = Math.min(...rawValues);
  const maxVal = Math.max(...rawValues);
  const valRange = maxVal - minVal || 1;

  // Compute SVG coordinates
  const points = rawValues.map((val, idx) => {
    const x = padding + (idx / (rawValues.length - 1)) * usableWidth;
    const y = padding + (1 - (val - minVal) / valRange) * usableHeight;
    return { x, y };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}` : `${acc} L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${(height - padding).toFixed(1)} L ${points[0].x.toFixed(1)} ${(height - padding).toFixed(1)} Z`;

  const lastPoint = points[points.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('overflow-visible select-none shrink-0', className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillColor} stopOpacity={0.25} />
          <stop offset="100%" stopColor={fillColor} stopOpacity={0.0} />
        </linearGradient>
      </defs>

      {showGradient && (
        <path d={areaD} fill={`url(#${gradientId})`} />
      )}

      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {showLastPointDot && (
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r={strokeWidth + 1.5}
          fill={strokeColor}
          stroke="#FFFFFF"
          strokeWidth={1.5}
        />
      )}
    </svg>
  );
}
