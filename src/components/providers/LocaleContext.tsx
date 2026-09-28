'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  SupportedLocale,
  TRANSLATIONS,
  TranslationKey,
} from '@/lib/i18n/translations';

interface LocaleContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatDate: (dateString: string) => string;
}

const STORAGE_KEY = 'openprice_user_locale';

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>('en');

  // Initialize from localStorage or navigator.language
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as SupportedLocale | null;
      if (stored && ['en', 'es', 'de', 'fr'].includes(stored)) {
        setLocaleState(stored);
        document.documentElement.lang = stored;
        return;
      }

      // Check browser preferred language
      const browserLang = navigator.language?.slice(0, 2) as SupportedLocale;
      if (['en', 'es', 'de', 'fr'].includes(browserLang)) {
        setLocaleState(browserLang);
        document.documentElement.lang = browserLang;
      }
    } catch {
      // Ignore localStorage access issues in restricted environments
    }
  }, []);

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.documentElement.lang = newLocale;
      // Dispatch custom event for non-react subscribers
      window.dispatchEvent(new CustomEvent('openprice:locale-change', { detail: newLocale }));
    } catch {
      // Ignore
    }
  }, []);

  // Translate string with optional param interpolation: {count}, {store}, etc.
  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      const langDict = TRANSLATIONS[locale] || TRANSLATIONS.en;
      let text: string = (langDict as Record<string, string>)[key] || TRANSLATIONS.en[key] || key;

      if (params) {
        Object.entries(params).forEach(([paramKey, paramVal]) => {
          text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
        });
      }

      return text;
    },
    [locale]
  );

  // Currency formatter adhering to active locale
  const formatCurrency = useCallback(
    (amount: number, currency: string = 'USD'): string => {
      if (isNaN(amount) || !isFinite(amount)) return '$0.00';
      try {
        const localeCode = locale === 'en' ? 'en-US' : locale === 'es' ? 'es-ES' : locale === 'de' ? 'de-DE' : 'fr-FR';
        return new Intl.NumberFormat(localeCode, {
          style: 'currency',
          currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount);
      } catch {
        return `$${amount.toFixed(2)}`;
      }
    },
    [locale]
  );

  // General number formatter
  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions): string => {
      if (isNaN(value) || !isFinite(value)) return '0';
      try {
        const localeCode = locale === 'en' ? 'en-US' : locale === 'es' ? 'es-ES' : locale === 'de' ? 'de-DE' : 'fr-FR';
        return new Intl.NumberFormat(localeCode, options).format(value);
      } catch {
        return value.toString();
      }
    },
    [locale]
  );

  // Date formatter
  const formatDate = useCallback(
    (dateString: string): string => {
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        const localeCode = locale === 'en' ? 'en-US' : locale === 'es' ? 'es-ES' : locale === 'de' ? 'de-DE' : 'fr-FR';
        return new Intl.DateTimeFormat(localeCode, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }).format(date);
      } catch {
        return dateString;
      }
    },
    [locale]
  );

  return (
    <LocaleContext.Provider
      value={{
        locale,
        setLocale,
        t,
        formatCurrency,
        formatNumber,
        formatDate,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LocaleContext);
  if (!context) {
    // Graceful fallback if invoked outside LocaleProvider
    const fallbackT = (key: TranslationKey, params?: Record<string, string | number>): string => {
      let text: string = TRANSLATIONS.en[key] || key;
      if (params) {
        Object.entries(params).forEach(([paramKey, paramVal]) => {
          text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
        });
      }
      return text;
    };

    return {
      locale: 'en' as SupportedLocale,
      setLocale: () => {},
      t: fallbackT,
      formatCurrency: (amount: number) => `$${amount.toFixed(2)}`,
      formatNumber: (value: number) => value.toLocaleString(),
      formatDate: (date: string) => date,
    };
  }
  return context;
}
