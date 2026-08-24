# Architecture & Foundation Survey Report (`survey_report.md`)
**OpenPrice — Modern Crowdsourced & Multi-Source Price Tracking Platform**
*Author: survey_explorer_1 (Architecture & Foundation Lead Explorer)*
*Date: 2026-08-24*
*Integrity Mode: Development / Greenfield Scaffold Survey*

---

## 1. Executive Summary & Repository Baseline

### 1.1 Baseline Assessment
The OpenPrice repository is currently an organized greenfield project with governance documentation (`AGENT.md`, `CHECKLIST.md`, `DESIGN.md`, `PRODUCT.md`, `ORIGINAL_REQUEST.md`, `TEAM.md`, `README.md`) and directory skeletons (`src/app/`, `src/components/`, `src/lib/`, `src/types/` each containing scoped `AGENT.md` guidelines). 

Node environment is **Node v26.7.0** and **npm v11.19.0**.

The repository has no active build manifests (`package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `src/app/layout.tsx`, `src/app/globals.css`). The role of this Architectural Survey is to define the exact configuration files, design tokens, layout boundaries, package dependencies, and provider shells to enable zero-friction execution for all downstream development roles.

### 1.2 Core Architectural Objectives
1. **Scaffold Next.js 15+ App Router with React 19 & TypeScript:** Strict type checking, `@/*` path aliases, zero-error type safety.
2. **Translate `DESIGN.md` into Exact Tailwind Tokens & CSS Variables:** "The Community Exchange" aesthetic, Subtle Ambient Lift, strict semantic price direction colors (Emerald Mint `#10B981`, Coral Sunset `#F43F5E`, Muted Slate `#64748B`), tabular numerals (`font-variant-numeric: tabular-nums`), 44x44px mobile touch targets, and rounded geometry (`rounded-xl` / `rounded-2xl`).
3. **Establish Multi-Role Layout Shell & Provider Architecture:** RootLayout containing global `RoleProvider` (supporting `public`, `contributor`, `admin`), sticky glassmorphic header, persistent desktop sidebar, and mobile sticky bottom navigation with a quick-scan floating action button (FAB).
4. **Coordinate Clean Module Boundaries:** Maintain separation across UI primitives (`src/components/ui/`), telemetry charts (`src/components/charts/`), multimodal OCR (`src/components/ocr/`), product matrices (`src/components/product/`), math engines (`src/lib/inflation.ts`), and strict domain models (`src/types/`).

---

## 2. Framework & Tooling Architecture

### 2.1 Framework & Runtime
- **Next.js 15+ (App Router):** Server Components by default for SEO/meta tags; Client Components (`"use client"`) for interactive Recharts, upload zones, drag-and-drop OCR bounding boxes, and role context switching.
- **React 19 & React DOM 19:** Utilizing latest React features with modern hooks and clean state management.
- **TypeScript 5.x:** Strict mode enabled with bundler module resolution and incremental builds.
- **Tailwind CSS 3.4+ / PostCSS / Autoprefixer:** High-performance utility classes with custom theme extensions matching the `DESIGN.md` design system.

### 2.2 Package Manifest Specifications (`package.json`)

The required `package.json` configuration for OpenPrice:

```json
{
  "name": "openprice",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "node --test"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "lucide-react": "^1.16.0",
    "next": "^15.2.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "recharts": "^2.15.1",
    "tailwind-merge": "^3.0.2"
  },
  "devDependencies": {
    "@types/node": "^22.13.0",
    "@types/react": "^19.0.8",
    "@types/react-dom": "^19.0.3",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.20.0",
    "eslint-config-next": "^15.2.0",
    "postcss": "^8.5.2",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.3"
  }
}
```

### 2.3 TypeScript Configuration (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

### 2.4 Next.js Configuration (`next.config.ts`)

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
```

### 2.5 PostCSS Configuration (`postcss.config.mjs`)

```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
```

---

## 3. Design System & Token Architecture

The OpenPrice design system ("The Community Exchange") defined in `DESIGN.md` prioritizes warm, energetic appeal, high-contrast numeric clarity, and subtle multi-layered depth.

### 3.1 Color Palette Token Mapping

| Token Name | Hex Code | OKLCH Equivalent | Semantic Purpose & Usage Invariant |
|---|---|---|---|
| **Canvas Background** | `#F8FAFC` | `oklch(98% 0.005 240)` | Neutral ground for daytime clarity (`bg-slate-50`). |
| **Card Surface** | `#FFFFFF` | `oklch(100% 0 0)` | Pure card and modal surface container. |
| **Subtle Tonal Tint** | `#F1F5F9` | `oklch(96% 0.01 240)` | Inactive input backgrounds, table headers, inactive pills. |
| **Border Hairline** | `#E2E8F0` | `oklch(92% 0.01 240)` | Crisp 1px structural framing (`border-slate-200`). |
| **Muted Slate** | `#64748B` | `oklch(55% 0.04 240)` | Secondary text, timestamps, unit labels, unchanged price indicator. |
| **Deep Slate Ink** | `#0F172A` | `oklch(20% 0.03 260)` | High-contrast text for headings, primary numbers, strong structure. |
| **Vibrant Indigo** | `#4F46E5` | `oklch(53% 0.24 280)` | Primary brand color, main nav active states, primary CTA buttons. |
| **Electric Cerulean** | `#0EA5E9` | `oklch(68% 0.17 235)` | Active search filters, active tabs, link accents. |
| **Emerald Mint** | `#10B981` | `oklch(70% 0.17 155)` | **Strict:** Price drops, savings, best deals, verified discount badges. |
| **Coral Sunset** | `#F43F5E` | `oklch(62% 0.22 25)` | **Strict:** Price hikes, inflation spikes, out-of-stock items, outlier alerts. |
| **Gold Amber** | `#F59E0B` | `oklch(75% 0.18 70)` | Contributor karma points, trending item badges, moderation tags. |
| **Bright Violet** | `#8B5CF6` | `oklch(62% 0.23 295)` | AI vision/OCR extraction indicators, receipt parsing badges. |

### 3.2 Named Design Invariants

1. **The Price Direction Rule:**
   - Emerald Mint (`#10B981` / `text-emerald-700 bg-emerald-50 border-emerald-200`) strictly represents price decreases and savings.
   - Coral Sunset (`#F43F5E` / `text-rose-700 bg-rose-50 border-rose-200`) strictly represents price increases and inflation.
   - Muted Slate (`#64748B` / `text-slate-700 bg-slate-100 border-slate-200`) represents unchanged / stable prices.
   - *Never use red for a price drop or green for a price hike.*

2. **The Tabular Numerals Rule:**
   - All currency figures, percentages, timestamps, chart axes, and delta badges must use `font-mono tabular-nums` (`font-variant-numeric: tabular-nums; font-feature-settings: "tnum"`).
   - This eliminates layout jitter and width fluctuation during live filtering, searching, or chart scrubbing.

3. **The Subtle Ambient Lift Rule:**
   - Rest State Card: `box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)` + `border border-slate-200`.
   - Hover / Active Lift: `box-shadow: 0 8px 20px -4px rgba(79, 70, 229, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04)`.
   - Floating Lightbox / Header: `box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)`.
   - Translucent Glass: `bg-white/85 backdrop-blur-md border border-slate-200/80`.

4. **The Mobile Touch Rule:**
   - Minimum interactive touch target of `44px x 44px` on mobile screens for all buttons, tab triggers, filter pills, and navigation icons.

5. **The Verified Ribbon Rule:**
   - Verified submissions and OCR confirmed deals feature an angled top-right ribbon badge (`rounded-tr-2xl rounded-bl-lg px-2.5 py-0.5 text-xs font-semibold`).

### 3.3 Tailwind Configuration Specification (`tailwind.config.ts`)

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          indigo: '#4F46E5',
          cerulean: '#0EA5E9',
          violet: '#8B5CF6',
          amber: '#F59E0B',
        },
        economic: {
          drop: '#10B981', // Emerald Mint - Savings/Drop
          hike: '#F43F5E', // Coral Sunset - Inflation/Hike
          stable: '#64748B', // Muted Slate - Stable
        },
        surface: {
          canvas: '#F8FAFC',
          card: '#FFFFFF',
          tint: '#F1F5F9',
          hairline: '#E2E8F0',
          ink: '#0F172A',
          muted: '#64748B',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        surface: '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)',
        'ambient-lift': '0 8px 20px -4px rgba(79, 70, 229, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04)',
        floating: '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',
      },
      borderRadius: {
        '2xl': '1rem', // 16px
        '3xl': '1.25rem', // 20px
      },
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
    },
  },
  plugins: [],
};

export default config;
```

### 3.4 Global CSS Specification (`src/app/globals.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-sans: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

@layer base {
  body {
    @apply bg-slate-50 text-slate-900 antialiased min-h-screen selection:bg-indigo-100 selection:text-indigo-900;
    font-feature-settings: "cv02", "cv03", "cv04", "cv11";
  }

  /* Strict Tabular Numerals Invariant */
  .tabular-nums,
  .font-mono,
  input[type="number"],
  .price-numeral {
    font-variant-numeric: tabular-nums;
    font-feature-settings: "tnum";
  }
}

@layer components {
  /* Subtle Ambient Lift Utilities */
  .card-surface {
    @apply bg-white border border-slate-200/90 rounded-2xl shadow-surface transition-all duration-200;
  }
  
  .card-ambient-hover {
    @apply hover:border-indigo-200/80 hover:shadow-ambient-lift hover:-translate-y-0.5;
  }

  .glass-header {
    @apply bg-white/85 backdrop-blur-md border-b border-slate-200/80;
  }

  .glass-card {
    @apply bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl;
  }

  /* Verified Ribbon Badge */
  .verified-ribbon {
    @apply absolute top-0 right-0 rounded-tr-2xl rounded-bl-xl bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-0.5 shadow-sm;
  }

  /* Mobile Touch Target Enforcement */
  .touch-target {
    @apply min-h-[44px] min-w-[44px] flex items-center justify-center;
  }
}
```

---

## 4. Layout Architecture & Provider Shell

### 4.1 Multi-Role Experience Shell

OpenPrice accommodates three concurrent user perspectives:
1. **Public Shopper (`public`):** Consumer product discovery, price comparisons, inflation trends.
2. **Contributor (`contributor`):** Ingestion studio (photo OCR, flyer batch parsing, manual price log), personal watchlist, karma scores.
3. **Admin / Curator (`admin`):** Submission moderation queue, photo diff inspector, outlier price resolver, taxonomy manager.

To support seamless real-time switching across all pages and components without requiring hard server redirects, a client-side `RoleProvider` encapsulates the operational context.

#### `src/components/providers/RoleContext.tsx`
```typescript
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '@/types/user';

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isContributor: boolean;
  isAdmin: boolean;
  isPublic: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('public');

  useEffect(() => {
    const saved = localStorage.getItem('openprice_user_role') as UserRole;
    if (saved && ['public', 'contributor', 'admin'].includes(saved)) {
      setRoleState(saved);
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('openprice_user_role', newRole);
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        isContributor: role === 'contributor',
        isAdmin: role === 'admin',
        isPublic: role === 'public',
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRoleView() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRoleView must be used within a RoleProvider');
  }
  return context;
}
```

### 4.2 Root Layout Shell Architecture (`src/app/layout.tsx`)

```tsx
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
      <body className="flex min-h-screen flex-col font-sans">
        <RoleProvider>
          {/* Sticky Glassmorphic Header */}
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

          {/* Mobile Bottom Navigation & Floating Camera Action */}
          <MobileBottomBar />
          <QuickScanFAB />
        </RoleProvider>
      </body>
    </html>
  );
}
```

### 4.3 Responsive Viewport Adaptation Blueprint

```
+------------------------------------------------------------------------------------+
|                                    HEADER                                          |
|  [Logo: OpenPrice]    [Search Catalog / Aisle...]       [Role Switcher: Pub/Con/Adm]|
+------------------------------------------------------------------------------------+
|  DESKTOP SIDEBAR      | CENTRAL APPLICATION SURFACE        | RIGHT TELEMETRY RADAR  |
|  (hidden < 1024px)    |                                    | (adaptive drawer / col)|
|  - Explorer Home      | - Macro Inflation Ticker           | - Store Price Variance |
|  - Ingestion Studio   | - Category Filter Pills            | - Category Inflation   |
|  - Watchlist Alerts   | - Product Cards with Sparklines    | - Recent Outliers      |
|  - Admin Moderation   | - Longitudinal Price Charts        |                        |
|  - Community Karma    | - Bounding Box OCR Inspector       |                        |
+------------------------------------------------------------------------------------+
|  MOBILE BOTTOM BAR (hidden >= 1024px)                                              |
|  [Explore]        [Watchlist]        [(+) QUICK SCAN FAB]       [Studio]   [Admin] |
+------------------------------------------------------------------------------------+
```

- **Mobile (<640px):** Single-column layout, sticky glass search header (`h-14`), 16px screen padding, bottom sheet filters, thumb-friendly navigation bar (`h-16`) with elevated central camera scan FAB (`56px x 56px`).
- **Tablet (640px–1024px):** 2-column adaptive layout, collapsable filter drawers, touch scrubber for price history charts.
- **Desktop (>1024px):** 3-column dense dashboard layout capped at `1440px` max width. Left sidebar (256px), central main matrix (fluid), right analysis drawer (320px).

---

## 5. UI Helper & Class Merger Specification (`src/lib/utils.ts`)

To ensure standard class name composition across all atomic UI components, `src/lib/utils.ts` must provide the standard `cn()` utility:

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 6. Implementation Checklist & File Roadmap

To complete Phase 1 and Phase 2 of `CHECKLIST.md`, the Foundation implementation tasks are structured as follows:

| Order | Target File Path | Purpose | Downstream Dependents |
|---|---|---|---|
| **1** | `/package.json` | Project dependencies, scripts, build tasks | `npm install`, all build/test pipelines |
| **2** | `/tsconfig.json` | TypeScript compiler rules, `@/*` path aliases | Type checker, all imports |
| **3** | `/next.config.ts` | Next.js configuration & image remote patterns | Next.js build |
| **4** | `/postcss.config.mjs` | PostCSS Tailwind & Autoprefixer plugin config | CSS processing |
| **5** | `/tailwind.config.ts` | Tokens mapping `DESIGN.md` colors, fonts, shadows | All UI components & styling |
| **6** | `src/lib/utils.ts` | `cn()` helper with `clsx` & `tailwind-merge` | All UI components |
| **7** | `src/app/globals.css` | Global Tailwind directives, tabular nums, glass cards | RootLayout, typography |
| **8** | `src/components/providers/RoleContext.tsx` | Role context & hook (`useRoleView`) | Header, sidebar, role views |
| **9** | `src/app/layout.tsx` | Root layout with Google Fonts, RoleProvider, shell | All App Router pages |

---

## 7. Verification Protocol & Quality Gates

To verify successful implementation of the Architecture & Foundation layer:

1. **Dependency Installation & Tree Resolution:**
   - Execute `npm install` to resolve and install packages cleanly.
2. **Type Safety & Alias Resolution:**
   - Execute `npx tsc --noEmit` (or `npm run type-check`) to verify zero TypeScript errors and ensure `@/` path alias maps accurately to `./src/`.
3. **Build & Bundle Verification:**
   - Execute `npm run build` to verify clean Next.js 15+ compilation and production bundle generation.
4. **Token & Design System Compliance:**
   - Verify that all CSS variables and Tailwind classes (`bg-brand-indigo`, `text-economic-drop`, `text-economic-hike`, `shadow-ambient-lift`, `tabular-nums`) compile accurately without purge issues.
5. **No Placeholder Stubs & No Emojis:**
   - Verify code contains no `// TODO` stubs, empty dummy functions, or decorative emojis.
