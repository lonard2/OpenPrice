import type { Metadata, Viewport } from 'next';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { RoleProvider } from '@/components/providers/RoleContext';
import { Header } from '@/components/navigation/Header';
import { DesktopSidebar } from '@/components/navigation/DesktopSidebar';
import { MobileBottomBar } from '@/components/navigation/MobileBottomBar';
import { QuickScanFAB } from '@/components/navigation/QuickScanFAB';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'OpenPrice — Crowdsourced Price Intelligence & Inflation Tracker',
  description:
    'Track prices from store photos, pamphlets, receipts, and e-commerce listings in a community-verified historical index with live inflation telemetry.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#4F46E5',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable}`}>
      <body className="flex min-h-screen flex-col font-sans bg-slate-50 text-slate-900">
        <RoleProvider>
          {/* Glassmorphic Sticky Header */}
          <Header />

          {/* Core Responsive Viewport Container */}
          <div className="mx-auto flex w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8 pb-20 lg:pb-8 pt-4 sm:pt-6 gap-6">
            {/* Desktop Persistent Navigation Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-20">
                <DesktopSidebar />
              </div>
            </aside>

            {/* Central Main Surface */}
            <main className="flex-1 min-w-0">
              {children}
            </main>
          </div>

          {/* Mobile Bottom Navigation & Quick-Scan Floating Action */}
          <MobileBottomBar />
          <QuickScanFAB />
        </RoleProvider>
      </body>
    </html>
  );
}
