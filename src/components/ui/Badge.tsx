'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'verified'
  | 'ocr'
  | 'outlier'
  | 'pending'
  | 'category'
  | 'brand'
  | 'drop'
  | 'hike'
  | 'stable';

export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ocr: 'bg-violet-50 text-violet-700 border-violet-200',
  outlier: 'bg-rose-50 text-rose-700 border-rose-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  category: 'bg-slate-100 text-slate-700 border-slate-200',
  brand: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  drop: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  hike: 'bg-rose-100 text-rose-800 border-rose-300',
  stable: 'bg-slate-100 text-slate-800 border-slate-300',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[11px] gap-1',
  md: 'px-2.5 py-0.5 text-xs gap-1.5',
  lg: 'px-3 py-1 text-sm gap-2',
};

export function Badge({
  className,
  variant = 'category',
  size = 'md',
  icon,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border shrink-0 leading-none transition-colors select-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {icon && (
        <span className="inline-flex shrink-0 items-center justify-center">
          {icon}
        </span>
      )}
      {children && <span>{children}</span>}
    </span>
  );
}
