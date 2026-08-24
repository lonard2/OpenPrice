'use client';

import React from 'react';
import Link from 'next/link';
import { Camera } from 'lucide-react';

export function QuickScanFAB() {
  return (
    <div className="fixed bottom-20 right-6 z-20 hidden md:block lg:hidden">
      <Link
        href="/contribute"
        className="flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-white shadow-ambient-lift hover:bg-indigo-700 active:scale-95 transition-all touch-target"
        aria-label="Quick Scan Price Tag or Receipt"
      >
        <Camera className="h-5 w-5" />
        <span className="text-xs font-bold uppercase tracking-wider">Quick Scan</span>
      </Link>
    </div>
  );
}
