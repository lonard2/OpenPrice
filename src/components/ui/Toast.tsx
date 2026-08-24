'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  CheckCircle2,
  Bookmark,
  AlertCircle,
  AlertTriangle,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  id?: string;
  message: string;
  description?: string;
  type?: ToastType;
  duration?: number;
  action?: ToastAction;
}

export interface ToastItem extends ToastOptions {
  id: string;
  type: ToastType;
  duration: number;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => string;
  dismissToast: (id: string) => void;
  toasts: ToastItem[];
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (options: ToastOptions): string => {
      const id = options.id || `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const type = options.type || 'info';
      const duration = options.duration ?? 4500;

      const newToast: ToastItem = {
        ...options,
        id,
        type,
        duration,
      };

      setToasts((prev) => {
        // Keep maximum 3 concurrent toasts
        const filtered = prev.filter((t) => t.id !== id);
        return [...filtered, newToast].slice(-3);
      });

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast, toasts }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <aside
      aria-label="Notifications"
      className="fixed bottom-20 left-4 right-4 sm:bottom-6 sm:left-auto sm:right-6 z-50 flex flex-col gap-2 max-w-sm sm:w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </aside>
  );
}

interface ToastCardProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

function ToastCard({ toast, onDismiss }: ToastCardProps) {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />;
      case 'info':
      default:
        return <Bookmark className="w-4 h-4 text-indigo-600 shrink-0" />;
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'pointer-events-auto flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-ambient-lift text-slate-800 text-sm transition-all duration-200 animate-in fade-in slide-in-from-bottom-2'
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-slate-100">
          {getIcon()}
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <p className="font-semibold text-xs sm:text-sm text-slate-900 leading-snug line-clamp-2">
            {toast.message}
          </p>
          {toast.description && (
            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
              {toast.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action?.onClick();
              onDismiss(toast.id);
            }}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors touch-target"
          >
            {toast.action.label}
          </button>
        )}

        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          aria-label="Dismiss notification"
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors touch-target"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
