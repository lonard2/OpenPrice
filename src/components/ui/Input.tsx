'use client';

import React, { forwardRef, useId } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isNumeric?: boolean;
  clearable?: boolean;
  onClear?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      id,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      isNumeric = false,
      clearable = false,
      onClear,
      value,
      disabled,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const hasValue = value !== undefined && value !== '' && value !== null;
    const showClear = clearable && hasValue && !disabled && Boolean(onClear);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-slate-700 tracking-tight"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center justify-center text-slate-400 pointer-events-none shrink-0">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            value={value}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className={cn(
              'w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-sm text-slate-900',
              'placeholder:text-slate-400 transition-all duration-150',
              'focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20',
              'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed',
              'min-h-[44px]',
              leftIcon ? 'pl-10' : 'pl-3.5',
              showClear || rightIcon ? 'pr-10' : 'pr-3.5',
              isNumeric && 'font-mono tabular-nums text-right',
              error &&
                'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 text-rose-900',
              className
            )}
            {...props}
          />

          {showClear ? (
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear input"
              className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            rightIcon && (
              <div className="absolute right-3.5 flex items-center justify-center text-slate-400 pointer-events-none shrink-0">
                {rightIcon}
              </div>
            )
          )}
        </div>

        {error && (
          <p id={errorId} className="text-xs font-medium text-rose-600">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={helperId} className="text-xs text-slate-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
