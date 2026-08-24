'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Tag, Search, Shield, UploadCloud, Users, Sparkles, X } from 'lucide-react';
import { useRoleView } from '@/components/providers/RoleContext';
import { UserRole } from '@/types/user';

export function Header() {
  const { role, setRole } = useRoleView();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');

  // Synchronize search query across header and catalog components
  useEffect(() => {
    // Check initial URL search param if present
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

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // Broadcast to page & grid components
    window.dispatchEvent(new CustomEvent('openprice:search-sync', { detail: value }));

    // If not currently on homepage, typing or submitting navigates to /?q=...
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

  const roleOptions: { id: UserRole; label: string; icon: React.ReactNode }[] = [
    { id: 'public', label: 'Public', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'contributor', label: 'Contributor', icon: <UploadCloud className="w-3.5 h-3.5" /> },
    { id: 'admin', label: 'Admin', icon: <Shield className="w-3.5 h-3.5" /> },
  ];

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

        {/* Role Perspective Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl bg-slate-100/90 p-1 border border-slate-200/80 shadow-inner">
            {roleOptions.map((opt) => {
              const isActive = role === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setRole(opt.id)}
                  aria-label={`Switch to ${opt.label} perspective`}
                  aria-pressed={isActive}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all touch-target min-h-[36px] ${
                    isActive
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  {opt.icon}
                  <span className="hidden sm:inline">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
