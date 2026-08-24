'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export function Skeleton({
  variant = 'rectangular',
  width,
  height,
  count = 1,
  className,
  style,
  ...props
}: SkeletonProps) {
  const customStyles: React.CSSProperties = {
    ...style,
    width: width !== undefined ? width : undefined,
    height: height !== undefined ? height : undefined,
  };

  const elements = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={cn(
        'animate-pulse bg-slate-200/80 shrink-0',
        variant === 'circular' && 'rounded-full',
        variant === 'text' && 'h-4 w-full rounded-md',
        variant === 'rectangular' && 'rounded-xl w-full h-24',
        className
      )}
      style={customStyles}
      {...props}
    />
  ));

  if (count === 1) {
    return elements[0];
  }

  return <div className="space-y-2 w-full">{elements}</div>;
}
