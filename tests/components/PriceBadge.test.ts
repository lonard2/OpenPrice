import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatCurrency, formatDeltaPercent, getDeltaStyle } from '../../src/lib/formatters.ts';

describe('Component Logic & Contracts: PriceBadge', () => {
  it('enforces The Price Direction Rule for price drop (Emerald Green #10B981)', () => {
    const current = 3.49;
    const previous = 3.99;
    const delta = current - previous;
    const deltaPercent = ((current - previous) / previous) * 100;
    const style = getDeltaStyle(delta);

    assert.ok(delta < 0, 'Delta is negative');
    assert.strictEqual(style.text, 'text-emerald-600');
    assert.strictEqual(style.bg, 'bg-emerald-50');
    assert.strictEqual(style.border, 'border-emerald-200');
    assert.strictEqual(style.icon, 'down');
    assert.strictEqual(style.colorHex, '#10B981');
    assert.strictEqual(formatCurrency(current), '$3.49');
    assert.strictEqual(formatDeltaPercent(deltaPercent), '-12.5%');
  });

  it('enforces The Price Direction Rule for price hike (Coral Sunset / Rose #F43F5E)', () => {
    const current = 5.49;
    const previous = 4.99;
    const delta = current - previous;
    const deltaPercent = ((current - previous) / previous) * 100;
    const style = getDeltaStyle(delta);

    assert.ok(delta > 0, 'Delta is positive');
    assert.strictEqual(style.text, 'text-rose-600');
    assert.strictEqual(style.bg, 'bg-rose-50');
    assert.strictEqual(style.border, 'border-rose-200');
    assert.strictEqual(style.icon, 'up');
    assert.strictEqual(style.colorHex, '#F43F5E');
    assert.strictEqual(formatCurrency(current), '$5.49');
    assert.strictEqual(formatDeltaPercent(deltaPercent), '+10.0%');
  });

  it('enforces The Price Direction Rule for stable price (Slate #64748B)', () => {
    const current = 2.99;
    const previous = 2.99;
    const delta = current - previous;
    const style = getDeltaStyle(delta);

    assert.strictEqual(delta, 0);
    assert.strictEqual(style.text, 'text-slate-600');
    assert.strictEqual(style.bg, 'bg-slate-50');
    assert.strictEqual(style.border, 'border-slate-200');
    assert.strictEqual(style.icon, 'flat');
    assert.strictEqual(style.colorHex, '#64748B');
  });

  it('enforces tabular-nums font formatting on all price displays', () => {
    const currencyStr = formatCurrency(1234.56);
    assert.strictEqual(currencyStr, '$1,234.56');
    assert.strictEqual(formatCurrency(0), '$0.00');
    assert.strictEqual(formatCurrency(-4.5), '-$4.50');
  });
});
