/**
 * OpenPrice Tabular Numeric & Semantic Direction Formatters
 * Adheres to The Community Exchange design system and Tabular Numeral rules.
 */

/**
 * Formats a currency amount with tabular spacing and invariant 2-decimal precision (or integer for JPY).
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  showSign: boolean = false
): string {
  if (isNaN(amount) || !isFinite(amount)) {
    return '$0.00';
  }

  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'CA$',
    AUD: 'A$',
  };

  const symbol = symbols[currency.toUpperCase()] || '$';
  const isJpy = currency.toUpperCase() === 'JPY';
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  let formattedNum: string;
  if (isJpy) {
    formattedNum = Math.round(absAmount).toLocaleString('en-US');
  } else {
    formattedNum = absAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  if (isNegative) {
    return `-${symbol}${formattedNum}`;
  }
  if (showSign && amount > 0) {
    return `+${symbol}${formattedNum}`;
  }
  return `${symbol}${formattedNum}`;
}

/**
 * Formats a percentage delta with explicit '+' or '-' sign.
 */
export function formatDeltaPercent(delta: number): string {
  if (isNaN(delta) || !isFinite(delta)) {
    return '0.0%';
  }
  if (delta > 0) {
    return `+${delta.toFixed(1)}%`;
  }
  if (delta < 0) {
    return `${delta.toFixed(1)}%`;
  }
  return '0.0%';
}

export interface DeltaStyleResult {
  text: string;
  bg: string;
  border: string;
  badgeClass: string;
  icon: 'up' | 'down' | 'flat';
  label: string;
  colorHex: string;
}

/**
 * Returns Tailwind classes and styling strictly enforcing The Price Direction Rule.
 * - Negative delta (Price Drop / Consumer Savings): Emerald Green (#10B981)
 * - Positive delta (Price Hike / Inflation): Coral Sunset / Rose (#F43F5E)
 * - Zero delta (Stable): Muted Slate (#64748B)
 */
export function getDeltaStyle(delta: number): DeltaStyleResult {
  if (delta < 0) {
    return {
      text: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: 'down',
      label: 'Price Drop',
      colorHex: '#10B981',
    };
  }
  if (delta > 0) {
    return {
      text: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
      icon: 'up',
      label: 'Price Hike',
      colorHex: '#F43F5E',
    };
  }
  return {
    text: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
    icon: 'flat',
    label: 'Stable',
    colorHex: '#64748B',
  };
}

/**
 * Formats relative time strings for community submission cards and feeds.
 */
export function formatRelativeTime(dateInput: string | Date | number): string {
  try {
    const date = typeof dateInput === 'string' || typeof dateInput === 'number'
      ? new Date(dateInput)
      : dateInput;

    if (isNaN(date.getTime())) {
      return 'Recently';
    }

    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 0 || diffSec < 60) {
      return 'just now';
    }
    if (diffSec < 3600) {
      const mins = Math.floor(diffSec / 60);
      return `${mins}m ago`;
    }
    if (diffSec < 86400) {
      const hours = Math.floor(diffSec / 3600);
      return `${hours}h ago`;
    }
    if (diffSec < 172800) {
      return 'yesterday';
    }
    if (diffSec < 2592000) {
      const days = Math.floor(diffSec / 86400);
      return `${days}d ago`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}
