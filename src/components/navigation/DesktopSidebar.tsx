'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShoppingBag, 
  Camera, 
  Bookmark, 
  CheckCircle2, 
  Layers, 
  TrendingUp, 
  ShieldCheck, 
  Award,
  ChevronRight
} from 'lucide-react';
import { useRoleView } from '@/components/providers/RoleContext';

export function DesktopSidebar() {
  const pathname = usePathname();
  const { role, isContributor, isAdmin } = useRoleView();

  const primaryNav = [
    {
      name: 'Product Catalog',
      href: '/',
      icon: ShoppingBag,
      description: 'Search & compare items',
      visibleTo: 'all',
    },
    {
      name: 'Ingestion Studio',
      href: '/contribute',
      icon: Camera,
      description: 'Upload tags, receipts, flyers',
      visibleTo: 'contributor',
      badge: 'OCR',
    },
    {
      name: 'Watchlist & Alerts',
      href: '/watchlist',
      icon: Bookmark,
      description: 'Price drops & alerts',
      visibleTo: 'contributor',
    },
    {
      name: 'Moderation Queue',
      href: '/admin/moderation',
      icon: CheckCircle2,
      description: 'Review submissions & outliers',
      visibleTo: 'admin',
      badge: 'Audit',
    },
    {
      name: 'Taxonomy Manager',
      href: '/admin/taxonomy',
      icon: Layers,
      description: 'Stores, categories & units',
      visibleTo: 'admin',
    },
  ];

  return (
    <nav className="flex flex-col gap-6" aria-label="Desktop Navigation">
      {/* Navigation Links Group */}
      <div className="card-surface p-3 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Navigation ({role.toUpperCase()})
        </div>
        {primaryNav.map((item) => {
          const isActive = pathname === item.href;
          const isItemVisible =
            item.visibleTo === 'all' ||
            (item.visibleTo === 'contributor' && (isContributor || isAdmin)) ||
            (item.visibleTo === 'admin' && isAdmin);

          if (!isItemVisible) return null;

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-1.5 rounded-lg ${
                    isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm leading-tight">{item.name}</span>
                  <span className="text-[11px] text-slate-400 font-normal">{item.description}</span>
                </div>
              </div>
              {item.badge ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
                  {item.badge}
                </span>
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Community Inflation Barometer Card */}
      <div className="card-surface p-4 bg-gradient-to-br from-slate-900 to-indigo-950 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Community CPI
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            -0.8% 30D
          </span>
        </div>
        <div className="text-2xl font-bold font-mono tabular-nums text-white mb-1">
          104.2 <span className="text-xs font-normal text-slate-400">pts</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Grocery basket prices stabilized across 7 monitored regional chains this week.
        </p>
      </div>

      {/* Contributor Karma or Trust Shield */}
      {isContributor || isAdmin ? (
        <div className="card-surface p-4 border-amber-200/80 bg-amber-50/40">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-900">Contributor Tier 2</div>
              <div className="text-[11px] text-amber-700">420 Karma Points</div>
            </div>
          </div>
          <div className="w-full bg-amber-200/60 rounded-full h-1.5 mt-2">
            <div className="bg-amber-500 h-1.5 rounded-full w-3/4" />
          </div>
          <div className="text-[10px] text-amber-700 mt-1.5 text-right font-medium">
            80 pts to Top Scout
          </div>
        </div>
      ) : (
        <div className="card-surface p-4 border-indigo-100 bg-indigo-50/40">
          <div className="flex items-center gap-2.5 mb-1">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-indigo-950">Verified Provenance</span>
          </div>
          <p className="text-xs text-indigo-900/80 leading-relaxed">
            All prices backed by shelf photos, promotional flyers, or verified receipt OCR.
          </p>
        </div>
      )}
    </nav>
  );
}
