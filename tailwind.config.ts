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
          drop: '#10B981', // Emerald Mint - Savings/Price Drop
          hike: '#F43F5E', // Coral Sunset - Inflation/Price Hike
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
