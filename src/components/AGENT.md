# Component Architecture Agent Guide (`src/components/AGENT.md`)

This guide governs the creation, styling, accessibility, and composition of UI components in OpenPrice.

---

## 1. Component Hierarchy & Organization

```
src/components/
├── ui/                           # Atomic, reusable design primitives
│   ├── Button.tsx                # Primary, secondary, ghost, and danger buttons
│   ├── Input.tsx                 # Text fields with icon slots & validation states
│   ├── Badge.tsx                 # Semantic status pills (Verified, OCR, Outlier)
│   ├── Card.tsx                  # Clean 1px border container with subtle tonal hover
│   ├── Modal.tsx                 # Accessible dialog with focus trap & backdrop blur
│   └── Tabs.tsx                  # Animated pill or underline tab controls
├── charts/                       # Interactive telemetry & data visualizations
│   ├── PriceHistoryChart.tsx     # Multi-store time-series chart with touch scrubber
│   ├── Sparkline.tsx             # Ultra-compact 7-day or 30-day inline trend line
│   ├── InflationRadar.tsx        # Category-level inflation barometer chart
│   └── StoreComparisonChart.tsx  # Horizontal store price variance bar chart
├── ocr/                          # Multimodal AI vision & extraction UI
│   ├── PhotoUploader.tsx         # Drag-and-drop & mobile camera file trigger
│   ├── PamphletViewer.tsx        # Multi-deal brochure viewer with zoom/pan
│   ├── BoundingBoxOverlay.tsx    # Interactive highlighted boxes over parsed tags
│   └── ExtractedFieldEditor.tsx  # Instant editable table of parsed items & prices
├── navigation/                   # Global layout and routing elements
│   ├── Header.tsx                # Top navigation with global search & role switcher
│   ├── DesktopSidebar.tsx        # Left persistent navigation and category tree
│   ├── MobileBottomBar.tsx       # Bottom bar with thumb-accessible routes
│   └── QuickScanFAB.tsx          # Floating action button triggering camera OCR
├── product/                      # Domain-specific product cards & tables
│   ├── ProductCard.tsx           # Lively card with photo, price tag, and sparkline
│   ├── ProductGrid.tsx           # Responsive 1-col (mobile) to 3-col (desktop) grid
│   ├── StoreComparisonTable.tsx  # Dense matrix comparing retailer prices & stock
│   └── PriceBadge.tsx            # Semantic green/red/slate tabular price tag
└── moderation/                   # Admin & Curator review elements
    ├── ModerationQueueItem.tsx   # Review card comparing raw image vs extracted data
    └── OutlierAlertBanner.tsx    # Anomaly detector banner for questionable price spikes
```

---

## 2. Key Component Directives & Best Practices

### PriceBadge (`src/components/product/PriceBadge.tsx`)
- Must accept `price`, `previousPrice`, `currency`, and `size`.
- Calculate price delta automatically:
  - If `price < previousPrice`: Apply emerald styling (`text-emerald-700 bg-emerald-50 border-emerald-200`) with a `TrendingDown` icon.
  - If `price > previousPrice`: Apply coral-rose styling (`text-rose-700 bg-rose-50 border-rose-200`) with a `TrendingUp` icon.
  - If equal: Apply neutral slate styling (`text-slate-700 bg-slate-100 border-slate-200`) with a `Minus` icon.
- Always wrap the number in `font-mono tabular-nums`.

### PriceHistoryChart (`src/components/charts/PriceHistoryChart.tsx`)
- Built with **Recharts** (`ResponsiveContainer`, `LineChart`, `Line`, `XAxis`, `YAxis`, `Tooltip`, `ReferenceLine`).
- Support multiple timeframe filters: `7D`, `1M`, `3M`, `6M`, `1Y`, `ALL`.
- Support multi-store line overlays with distinct colorways and toggleable store legend.
- Implement responsive touch tooltip that snaps to the nearest data point on mobile screens.

### BoundingBoxOverlay (`src/components/ocr/BoundingBoxOverlay.tsx`)
- Renders bounding box overlays on uploaded store photos or promo flyers.
- Highlights active box on hover / click and synchronizes focus with the corresponding row in `ExtractedFieldEditor`.
- Visual confidence indicator (Green for >=90%, Amber for 70-89%, Red for <70%).

---

## 3. Accessibility & Interaction Invariants

1. **Focus Rings:** All interactive elements must have visible, high-contrast focus rings (`focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none`).
2. **Touch Targets:** Minimum `44px x 44px` on mobile viewports for all buttons, tab triggers, and icon buttons.
3. **Color Contrast:** All badge text and background combinations must maintain a minimum contrast ratio of `4.5:1` against their respective backgrounds.
4. **Keyboard Navigable Modals:** Dialogs and bottom-sheet drawers must trap focus and close on `Escape` key press.
