'use client';

import React, { useEffect, useRef, useId } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DrawerPosition = 'bottom' | 'right' | 'left';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  position?: DrawerPosition;
  className?: string;
  hideCloseButton?: boolean;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  position = 'bottom',
  className,
  hideCloseButton = false,
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
  const generatedId = useId();
  const titleId = `${generatedId}-drawer-title`;
  const descId = `${generatedId}-drawer-desc`;

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && drawerRef.current) {
        const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      if (drawerRef.current) {
        const firstFocusable = drawerRef.current.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (firstFocusable) {
          firstFocusable.focus();
        } else {
          drawerRef.current.focus();
        }
      }
    }, 50);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      clearTimeout(timer);
      if (previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn(
          'fixed bg-white z-10 flex flex-col shadow-2xl transition-transform duration-300 ease-out text-left',
          position === 'bottom' &&
            'inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl border-t border-slate-200/90 animate-in slide-in-from-bottom duration-300',
          position === 'right' &&
            'inset-y-0 right-0 w-full max-w-md border-l border-slate-200/90 animate-in slide-in-from-right duration-300',
          position === 'left' &&
            'inset-y-0 left-0 w-full max-w-md border-r border-slate-200/90 animate-in slide-in-from-left duration-300',
          className
        )}
      >
        {/* Handle for Bottom Sheet */}
        {position === 'bottom' && (
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 rounded-full bg-slate-200" />
          </div>
        )}

        {/* Header */}
        {(title || !hideCloseButton) && (
          <div className="flex items-center justify-between p-5 pb-3 border-b border-slate-100 shrink-0">
            <div className="space-y-0.5 pr-6">
              {title && (
                <h2
                  id={titleId}
                  className="text-lg font-bold text-slate-900 leading-snug tracking-tight"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p id={descId} className="text-xs text-slate-500">
                  {description}
                </p>
              )}
            </div>

            {!hideCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close drawer"
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-4 bg-slate-50 border-t border-slate-100 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
