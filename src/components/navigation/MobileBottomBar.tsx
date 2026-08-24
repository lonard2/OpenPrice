'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Bookmark, Camera, ShieldCheck } from 'lucide-react';
import { useRoleView } from '@/components/providers/RoleContext';

export function MobileBottomBar() {
  const pathname = usePathname();
  const { isAdmin } = useRoleView();

  const navItems = [
    {
      name: 'Explore',
      href: '/',
      icon: ShoppingBag,
    },
    {
      name: 'Watchlist',
      href: '/watchlist',
      icon: Bookmark,
    },
    {
      name: 'Scan',
      href: '/contribute',
      icon: Camera,
      highlight: true,
    },
    {
      name: isAdmin ? 'Admin' : 'Studio',
      href: isAdmin ? '/admin/moderation' : '/contribute',
      icon: ShieldCheck,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 lg:hidden glass-header border-t border-slate-200/90 shadow-lg pb-safe"
      aria-label="Mobile Navigation"
    >
      <div className="flex h-16 items-center justify-around px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.highlight) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-6 group touch-target"
                aria-label={item.name}
              >
                <div className="flex h-13 w-13 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-4 ring-white group-active:scale-95 transition-transform">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold text-indigo-600 mt-0.5">{item.name}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl touch-target transition-colors ${
                isActive
                  ? 'text-indigo-600 font-semibold'
                  : 'text-slate-500 hover:text-slate-900 active:bg-slate-100'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
