'use client';

import React from 'react';
import Link from 'next/link';
import { Tag, Search, Shield, UploadCloud, Users, Sparkles } from 'lucide-react';
import { useRoleView } from '@/components/providers/RoleContext';
import { UserRole } from '@/types/user';

export function Header() {
  const { role, setRole } = useRoleView();

  const roleOptions: { id: UserRole; label: string; icon: React.ReactNode }[] = [
    { id: 'public', label: 'Public', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'contributor', label: 'Contributor', icon: <UploadCloud className="w-3.5 h-3.5" /> },
    { id: 'admin', label: 'Admin', icon: <Shield className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-header shadow-sm transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
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

        {/* Global Search Shell */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              readOnly
              onClick={() => {
                const searchInput = document.getElementById('main-product-search') as HTMLInputElement | null;
                if (searchInput) {
                  searchInput.focus();
                  searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                  window.location.href = '/';
                }
              }}
              placeholder="Search groceries, electronics, stores... (Press /)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 hover:border-indigo-300 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
            />
          </div>
        </div>

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
