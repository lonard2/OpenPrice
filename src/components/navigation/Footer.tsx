import React from 'react';
import Link from 'next/link';
import { Tag, ShieldCheck, Scale, Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200/90 bg-white mt-12 py-10 text-xs text-slate-500">
      <div className="mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Brand & Civic Mission */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs group-hover:bg-indigo-700 transition-colors">
                <Tag className="h-4 w-4 rotate-12" />
              </div>
              <span className="text-base font-extrabold tracking-tight text-slate-900 font-sans">
                Open<span className="text-indigo-600">Price</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              Open, community-verified retail price intelligence and longitudinal inflation tracking for everyday shoppers.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900">
              Platform Navigation
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-indigo-600 transition-colors inline-flex items-center py-1">
                  Product Catalog
                </Link>
              </li>
              <li>
                <Link href="/contribute" className="hover:text-indigo-600 transition-colors inline-flex items-center py-1">
                  Ingestion Studio
                </Link>
              </li>
              <li>
                <Link href="/watchlist" className="hover:text-indigo-600 transition-colors inline-flex items-center py-1">
                  Watchlist & Alerts
                </Link>
              </li>
              <li>
                <Link href="/admin/moderation" className="hover:text-indigo-600 transition-colors inline-flex items-center py-1">
                  Moderation Queue
                </Link>
              </li>
              <li>
                <Link href="/admin/taxonomy" className="hover:text-indigo-600 transition-colors inline-flex items-center py-1">
                  Taxonomy Manager
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Methodology & Standards */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900">
              Methodology & Integrity
            </h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-1.5 leading-relaxed">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Bessel-corrected &gt;3σ outlier rejection filters</span>
              </li>
              <li className="flex items-start gap-1.5 leading-relaxed">
                <Scale className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                <span>Laspeyres rolling basket inflation index</span>
              </li>
              <li className="flex items-start gap-1.5 leading-relaxed">
                <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>Multimodal OCR vision with ground-truth verification</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Open Data & Provenance */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900">
              Civic Transparency
            </h4>
            <p className="leading-relaxed">
              OpenPrice contains zero sponsored retailer placements, affiliate kickbacks, or tracking trackers. All price observations are public domain.
            </p>
            <div className="pt-1">
              <a
                href="https://github.com/lonard2/OpenPrice"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold transition-colors touch-target min-h-[44px]"
              >
                <Github className="w-4 h-4" />
                <span>View Source on GitHub</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} OpenPrice Contributors. Built for consumer price transparency.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-slate-600 transition-colors">
              Terms of Use
            </Link>
            <span>&bull;</span>
            <Link href="/" className="hover:text-slate-600 transition-colors">
              Privacy Policy
            </Link>
            <span>&bull;</span>
            <Link href="/contribute" className="hover:text-slate-600 transition-colors">
              API Documentation
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
