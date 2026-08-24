import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatCurrency,
  formatDeltaPercent,
  getDeltaStyle,
  formatRelativeTime,
} from '../../src/lib/formatters.ts';

describe('Unit Tests: formatters.ts', () => {
  describe('formatCurrency', () => {
    it('formats standard USD positive amounts with 2 decimals', () => {
      assert.strictEqual(formatCurrency(4.99), '$4.99');
      assert.strictEqual(formatCurrency(19.95), '$19.95');
      assert.strictEqual(formatCurrency(100), '$100.00');
    });

    it('formats zero currency correctly', () => {
      assert.strictEqual(formatCurrency(0), '$0.00');
      assert.strictEqual(formatCurrency(-0), '$0.00');
    });

    it('formats negative currency with leading minus sign', () => {
      assert.strictEqual(formatCurrency(-3.5), '-$3.50');
      assert.strictEqual(formatCurrency(-0.99), '-$0.99');
      assert.strictEqual(formatCurrency(-120.45), '-$120.45');
    });

    it('supports showSign for positive numbers', () => {
      assert.strictEqual(formatCurrency(4.99, 'USD', true), '+$4.99');
      assert.strictEqual(formatCurrency(0, 'USD', true), '$0.00');
      assert.strictEqual(formatCurrency(-3.5, 'USD', true), '-$3.50');
    });

    it('supports international currencies (EUR, GBP, JPY, CAD, AUD)', () => {
      assert.strictEqual(formatCurrency(14.5, 'EUR'), '€14.50');
      assert.strictEqual(formatCurrency(9.99, 'GBP'), '£9.99');
      assert.strictEqual(formatCurrency(1500, 'JPY'), '¥1,500');
      assert.strictEqual(formatCurrency(24.99, 'CAD'), 'CA$24.99');
      assert.strictEqual(formatCurrency(18.75, 'AUD'), 'A$18.75');
    });

    it('formats large numbers with thousand separators', () => {
      assert.strictEqual(formatCurrency(1234567.89), '$1,234,567.89');
      assert.strictEqual(formatCurrency(10000000), '$10,000,000.00');
    });

    it('handles non-numeric, NaN, and Infinity inputs gracefully', () => {
      assert.strictEqual(formatCurrency(NaN), '$0.00');
      assert.strictEqual(formatCurrency(Infinity), '$0.00');
      assert.strictEqual(formatCurrency(-Infinity), '$0.00');
    });
  });

  describe('formatDeltaPercent', () => {
    it('formats positive percentage with explicit plus sign', () => {
      assert.strictEqual(formatDeltaPercent(12.5), '+12.5%');
      assert.strictEqual(formatDeltaPercent(0.8), '+0.8%');
      assert.strictEqual(formatDeltaPercent(100), '+100.0%');
    });

    it('formats negative percentage with explicit minus sign', () => {
      assert.strictEqual(formatDeltaPercent(-4.2), '-4.2%');
      assert.strictEqual(formatDeltaPercent(-15.75), '-15.8%');
      assert.strictEqual(formatDeltaPercent(-99.9), '-99.9%');
    });

    it('formats exact zero percentage', () => {
      assert.strictEqual(formatDeltaPercent(0), '0.0%');
      assert.strictEqual(formatDeltaPercent(-0), '0.0%');
    });

    it('formats extreme percentage swings', () => {
      assert.strictEqual(formatDeltaPercent(999.9), '+999.9%');
      assert.strictEqual(formatDeltaPercent(10000), '+10000.0%');
      assert.strictEqual(formatDeltaPercent(-99.99), '-100.0%');
    });

    it('handles NaN and Infinity inputs gracefully', () => {
      assert.strictEqual(formatDeltaPercent(NaN), '0.0%');
      assert.strictEqual(formatDeltaPercent(Infinity), '0.0%');
    });
  });

  describe('getDeltaStyle', () => {
    it('applies Emerald Green style strictly on negative delta (price drop / savings)', () => {
      const style = getDeltaStyle(-5.4);
      assert.strictEqual(style.text, 'text-emerald-600');
      assert.strictEqual(style.bg, 'bg-emerald-50');
      assert.strictEqual(style.border, 'border-emerald-200');
      assert.strictEqual(style.icon, 'down');
      assert.strictEqual(style.label, 'Price Drop');
      assert.strictEqual(style.colorHex, '#10B981');
    });

    it('applies Coral Sunset style strictly on positive delta (price hike / inflation)', () => {
      const style = getDeltaStyle(8.2);
      assert.strictEqual(style.text, 'text-rose-600');
      assert.strictEqual(style.bg, 'bg-rose-50');
      assert.strictEqual(style.border, 'border-rose-200');
      assert.strictEqual(style.icon, 'up');
      assert.strictEqual(style.label, 'Price Hike');
      assert.strictEqual(style.colorHex, '#F43F5E');
    });

    it('applies Muted Slate style on zero delta (stable price)', () => {
      const style = getDeltaStyle(0);
      assert.strictEqual(style.text, 'text-slate-600');
      assert.strictEqual(style.bg, 'bg-slate-50');
      assert.strictEqual(style.border, 'border-slate-200');
      assert.strictEqual(style.icon, 'flat');
      assert.strictEqual(style.label, 'Stable');
      assert.strictEqual(style.colorHex, '#64748B');
    });
  });

  describe('formatRelativeTime', () => {
    it('formats seconds ago as "just now"', () => {
      const now = new Date();
      assert.strictEqual(formatRelativeTime(now), 'just now');
      const thirtySecAgo = new Date(Date.now() - 30 * 1000);
      assert.strictEqual(formatRelativeTime(thirtySecAgo), 'just now');
    });

    it('formats minutes ago', () => {
      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
      assert.strictEqual(formatRelativeTime(fiveMinsAgo), '5m ago');
      const fortyMinsAgo = new Date(Date.now() - 40 * 60 * 1000);
      assert.strictEqual(formatRelativeTime(fortyMinsAgo), '40m ago');
    });

    it('formats hours ago', () => {
      const threeHoursAgo = new Date(Date.now() - 3 * 3600 * 1000);
      assert.strictEqual(formatRelativeTime(threeHoursAgo), '3h ago');
      const twentyHoursAgo = new Date(Date.now() - 20 * 3600 * 1000);
      assert.strictEqual(formatRelativeTime(twentyHoursAgo), '20h ago');
    });

    it('formats yesterday', () => {
      const yesterday = new Date(Date.now() - 25 * 3600 * 1000);
      assert.strictEqual(formatRelativeTime(yesterday), 'yesterday');
    });

    it('formats multiple days ago', () => {
      const fourDaysAgo = new Date(Date.now() - 4 * 86400 * 1000);
      assert.strictEqual(formatRelativeTime(fourDaysAgo), '4d ago');
    });

    it('accepts ISO strings, Date objects, and numeric timestamps', () => {
      const twoHoursAgo = Date.now() - 2 * 3600 * 1000;
      assert.strictEqual(formatRelativeTime(twoHoursAgo), '2h ago');
      assert.strictEqual(formatRelativeTime(new Date(twoHoursAgo).toISOString()), '2h ago');
      assert.strictEqual(formatRelativeTime(new Date(twoHoursAgo)), '2h ago');
    });

    it('handles invalid date strings gracefully', () => {
      assert.strictEqual(formatRelativeTime('invalid-date-format'), 'Recently');
      assert.strictEqual(formatRelativeTime(''), 'Recently');
    });
  });
});
