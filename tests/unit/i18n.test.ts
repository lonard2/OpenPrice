import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TRANSLATIONS, SUPPORTED_LOCALES } from '../../src/lib/i18n/translations.ts';
import type { SupportedLocale, TranslationKey } from '../../src/lib/i18n/translations.ts';
import { formatCurrency } from '../../src/lib/formatters.ts';

describe('Unit Tests: Multi-Language i18n & Localization', () => {
  it('supports all 4 core languages (en, es, de, fr)', () => {
    const codes = SUPPORTED_LOCALES.map((l) => l.code);
    assert.strictEqual(codes.length, 4);
    assert.ok(codes.includes('en'));
    assert.ok(codes.includes('es'));
    assert.ok(codes.includes('de'));
    assert.ok(codes.includes('fr'));
  });

  it('guarantees complete translation coverage across all supported locales', () => {
    const enKeys = Object.keys(TRANSLATIONS.en) as TranslationKey[];
    const locales: SupportedLocale[] = ['es', 'de', 'fr'];

    for (const loc of locales) {
      const locDict = TRANSLATIONS[loc] as Record<string, string>;
      for (const key of enKeys) {
        assert.ok(
          locDict[key] && locDict[key].trim().length > 0,
          `Locale "${loc}" is missing valid translation for key "${key}"`
        );
      }
    }
  });

  it('strictly enforces the ZERO EM-DASH invariant across all translations', () => {
    const emDash = '\u2014'; // '—'
    const locales = Object.keys(TRANSLATIONS) as SupportedLocale[];

    for (const loc of locales) {
      const dict = TRANSLATIONS[loc] as Record<string, string>;
      for (const [key, value] of Object.entries(dict)) {
        assert.ok(
          !value.includes(emDash),
          `Translation key "${key}" in locale "${loc}" contains forbidden em-dash: "${value}"`
        );
      }
    }
  });

  it('correctly handles template parameter interpolation ({count}, {store})', () => {
    const template = TRANSLATIONS.en.trackedAtStores; // 'Tracked at {count} stores'
    const interpolated = template.replace('{count}', '5');
    assert.strictEqual(interpolated, 'Tracked at 5 stores');

    const esTemplate = TRANSLATIONS.es.lowestAtStore; // 'Más bajo en {store}'
    const esInterpolated = esTemplate.replace('{store}', 'Walmart');
    assert.strictEqual(esInterpolated, 'Más bajo en Walmart');

    const deTemplate = TRANSLATIONS.de.showingItems; // '{count} Artikel angezeigt'
    const deInterpolated = deTemplate.replace('{count}', '12');
    assert.strictEqual(deInterpolated, '12 Artikel angezeigt');
  });

  it('formats currency cleanly with optional locale support', () => {
    const usdUS = formatCurrency(24.5, 'USD', false, 'en-US');
    assert.strictEqual(usdUS, '$24.50');

    // Negative amounts
    const negUS = formatCurrency(-3.25, 'USD', false, 'en-US');
    assert.strictEqual(negUS, '-$3.25');

    // Zero amounts
    const zero = formatCurrency(0, 'USD', false, 'en-US');
    assert.strictEqual(zero, '$0.00');
  });
});
