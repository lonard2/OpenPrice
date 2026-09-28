'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useTranslation } from '@/components/providers/LocaleContext';
import { SUPPORTED_LOCALES, SupportedLocale } from '@/lib/i18n/translations';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const activeLocaleInfo = SUPPORTED_LOCALES.find((l) => l.code === locale) || SUPPORTED_LOCALES[0];

  const handleSelectLocale = (code: SupportedLocale) => {
    setLocale(code);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Change language. Current language: ${activeLocaleInfo.name}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={cn(
          'flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl border border-slate-200/90 bg-slate-50 hover:bg-slate-100/90 text-xs font-semibold text-slate-700 transition-all touch-target min-h-[44px] shadow-2xs active:scale-[0.98]',
          isOpen && 'ring-2 ring-indigo-500/20 border-indigo-400 bg-white'
        )}
      >
        <span className="text-sm leading-none" role="img" aria-hidden="true">
          {activeLocaleInfo.flag}
        </span>
        <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] hidden sm:inline">
          {activeLocaleInfo.code}
        </span>
        <ChevronDown className={cn('w-3.5 h-3.5 text-slate-400 transition-transform duration-200', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label={t('language')}
          className="absolute right-0 mt-2 w-48 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Globe className="w-3 h-3 text-indigo-600" />
            <span>{t('language')}</span>
          </div>

          <div className="py-1">
            {SUPPORTED_LOCALES.map((item) => {
              const isSelected = item.code === locale;
              return (
                <button
                  key={item.code}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectLocale(item.code)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors touch-target min-h-[44px]',
                    isSelected
                      ? 'bg-indigo-50/80 text-indigo-900 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base" role="img" aria-hidden="true">
                      {item.flag}
                    </span>
                    <div className="flex flex-col text-left">
                      <span className="leading-tight">{item.nativeName}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{item.name}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
