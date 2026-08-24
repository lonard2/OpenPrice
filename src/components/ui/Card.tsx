'use client';

import React, { forwardRef } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  isInteractive?: boolean;
  verifiedRibbon?: boolean | string;
  variant?: 'default' | 'flat' | 'glass';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      isInteractive = false,
      verifiedRibbon = false,
      variant = 'default',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-2xl transition-all duration-200 overflow-hidden text-left',
          variant === 'default' &&
            'bg-white border border-slate-200/90 shadow-surface',
          variant === 'flat' && 'bg-slate-50 border border-slate-200/70',
          variant === 'glass' &&
            'bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-surface',
          isInteractive &&
            'hover:border-indigo-200 hover:shadow-ambient-lift hover:-translate-y-0.5 cursor-pointer',
          className
        )}
        {...props}
      >
        {verifiedRibbon && (
          <div
            className="absolute top-0 right-0 z-10 flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-bl-xl rounded-tr-2xl shadow-sm"
            aria-label="Community Verified Price"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-100" />
            <span>
              {typeof verifiedRibbon === 'string' ? verifiedRibbon : 'Verified'}
            </span>
          </div>
        )}
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-5 sm:p-6 pb-3', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'font-semibold text-slate-900 text-base sm:text-lg leading-tight tracking-tight',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-xs sm:text-sm text-slate-500', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-5 sm:p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center p-5 sm:p-6 pt-0 border-t border-slate-100 mt-4',
      className
    )}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';
