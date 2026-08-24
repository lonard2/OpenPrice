'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Tag,
  Search,
  Shield,
  UploadCloud,
  Users,
  Sparkles,
  X,
  Bookmark,
  ChevronDown,
  Check,
} from 'lucide-react';
import { useRoleView } from '@/components/providers/RoleContext';
import { UserRole } from '@/types/user';
import { cn } from '@/lib/utils';

export function Header() {
  const { role, setRole } = useRoleView();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const roleMenuRef = useRef<HTMLDivElement>(null);

  // Synchronize search query across header and catalog components
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const initialQ = urlParams.get('q');
      if (initialQ) setSearchQuery(initialQ);
    }

    const handleSearchSync = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (typeof customEvent.detail === 'string') {
        setSearchQuery(customEvent.detail);
      }
    };

    window.addEventListener('openprice:search-sync', handleSearchSync);
    return () => window.removeEventListener('openprice:search-sync', handleSearchSync);
  }, []);

  // Close role popover when clicking outside or pressing Escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setIsRoleMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsRoleMenuOpen(false);
      }
    };

    if (isRoleMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRoleMenuOpen]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    window.dispatchEvent(new CustomEvent('openprice:search-sync', { detail: value }));

    if (pathname !== '/' && value.trim()) {
      router.push(`/?q=${encodeURIComponent(value)}`);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pathname !== '/') {
      router.push(`/?q=${encodeURIComponent(searchQuery)}`);
    } else {
      const searchInput = document.getElementById('main-product-search') as HTMLInputElement | null;
      if (searchInput) {
        searchInput.focus();
      }
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    window.dispatchEvent(new CustomEvent('openprice:search-sync', { detail: '' }));
  };

  const roleOptions: { id: UserRole; label: string; description: string; icon: React.ReactNode }[] = [
    { id: 'public', label: 'Public View', description: 'Consumer search & price comparisons', icon: <Users className="w-4 h-4 text-slate-500" /> },
    { id: 'contributor', label: 'Contributor', description: 'OCR ingestion studio & receipt logging', icon: <UploadCloud className="w-4 h-4 text-indigo-600" /> },
    { id: 'admin', label: 'Admin Studio', description: 'Audit moderation & taxonomy manager', icon: <Shield className="w-4 h-4 text-amber-600" /> },
  ];

  const currentRoleConfig = roleOptions.find((r) => r.id === role) || roleOptions[0];

  return (
    <header className="sticky top-0 z-40 w-full glass-header shadow-sm transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl 2xl:max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20 group-hover:bg-indigo-700 transition-colors">
              <Tag className="h-5 w-5 rotate-12" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">
                  Open<span className="text-indigo-600">Price</span>
                </span>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  <Sparkles className="w-2.5 h-2.5" /> LIVE
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500 -mt-1 hidden sm:inline">
                Crowdsourced Price Index
              </span>
            </div>
          </Link>
        </div>

        {/* Global Synchronized Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 max-w-md mx-4"
          role="search"
        >
          <div className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              id="header-global-search"
              type="search"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search groceries, electronics, stores... (/)"
              aria-label="Search OpenPrice catalog"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/90 py-2 pl-10 pr-9 text-sm text-slate-900 placeholder-slate-400 hover:border-indigo-300 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear search input"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 touch-target"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>
        </form>

        {/* Consumer Actions & Relocated Perspective Popover */}
        <div className="flex items-center gap-2.5">
          {/* Primary Action: Log Price / Contribute */}
          <Link
            href="/contribute"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs touch-target min-h-[38px]"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Log Price</span>
          </Link>

          {/* Quick Watchlist Action */}
          <Link
            href="/watchlist"
            aria-label="View Watchlist"
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-indigo-600 transition-colors shrink-0 touch-target shadow-2xs"
          >
            <Bookmark className="w-4 h-4" />
          </Link>

          {/* Compact Role / Perspective Dropdown */}
          <div className="relative" ref={roleMenuRef}>
            <button
              type="button"
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              aria-label={`Current perspective: ${currentRoleConfig.label}. Click to switch.`}
              aria-expanded={isRoleMenuOpen}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200/90 bg-slate-50 hover:bg-slate-100/90 text-xs font-semibold text-slate-700 transition-all touch-target min-h-[36px] shadow-2xs"
            >
              <div className="flex items-center gap-1">
                {currentRoleConfig.icon}
                <span className="hidden sm:inline capitalize">{role}</span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>

            {/* Dropdown Menu Panel */}
            {isRoleMenuOpen && (
              <div
                role="menu"
                aria-label="Perspective switcher menu"
                className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white border border-slate-200/90 shadow-ambient-lift p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
              >
                <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch App Perspective
                  </span>
                </div>

                <div className="space-y-1">
                  {roleOptions.map((opt) => {
                    const isSelected = role === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setRole(opt.id);
                          setIsRoleMenuOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-colors',
                          isSelected
                            ? 'bg-indigo-50 text-indigo-900 font-semibold'
                            : 'hover:bg-slate-50 text-slate-700'
                        )}
                      >
                        <div className="mt-0.5 shrink-0">{opt.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold leading-tight">{opt.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                          </div>
                          <p className="text-[11px] text-slate-500 font-normal leading-snug mt-0.5">
                            {opt.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
