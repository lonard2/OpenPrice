---
name: OpenPrice
description: Friendly, lively crowdsourced and multi-source price tracking community platform
---

<!-- SEED: established with the user before implementation; re-run /impeccable document once there's code to capture the actual tokens and components. -->

# Design System: OpenPrice

## Overview

**Creative North Star: "The Community Exchange"**

OpenPrice is a friendly, ultra-approachable, and lively crowdsourced price intelligence platform. It rejects sterile financial terminal grayness and cluttered coupon spam in favor of an energetic, welcoming, and intuitive consumer experience. The system radiates warmth and community momentum: high-visibility price cards, soft rounded geometry, smooth glassmorphic headers, tactile OCR scan interactions, and clear economic signals that empower everyday shoppers to track inflation, beat price hikes, and share real savings.

The visual language balances consumer friendliness with analytical clarity. Price cards feature clean verified ribbon badges, live bounding box sync for receipt/flyer scans, and smooth tabular counters that make checking price histories satisfying and effortless across mobile, tablet, and desktop screens.

**Key Characteristics:**
- **Warm & Energetic Appeal:** Friendly rounded geometry, inviting micro-interactions, and vibrant color coding that make price tracking feel like a collaborative community game.
- **Subtle Ambient Lift:** Gentle multi-layer diffused card shadows, floating navigation headers with soft backdrop blurs, and tactile interactive states.
- **Tactile Multimodal Telemetry:** Interactive bounding boxes on uploaded shelf photos and receipts that highlight on hover, paired with corner-pinned verification ribbons.
- **Absolute Numeric Clarity:** Tabular numeral alignment (`font-variant-numeric: tabular-nums`) ensuring prices and inflation percentages never jitter or shift layouts during live updates.

## Colors

The palette is energetic, bright, and strictly semantic, pairing an approachable indigo/cerulean foundation with clear economic direction indicators.

### Primary
- **Vibrant Indigo** (`#4F46E5` / `oklch(53% 0.24 280)`): Primary brand color used for main navigation active states, primary CTA buttons, and key interactive highlights.
- **Electric Cerulean** (`#0EA5E9` / `oklch(68% 0.17 235)`): Complementary energetic blue used for search filters, active tabs, and link accents.

### Secondary
- **Emerald Mint** (`#10B981` / `oklch(70% 0.17 155)`): Positive economic indicator used exclusively for price drops, bargains, lowest store prices, and verified discount badges.
- **Coral Sunset** (`#F43F5E` / `oklch(62% 0.22 25)`): Warning and alert color used exclusively for price hikes, inflation spikes, out-of-stock items, and outlier price alerts.

### Tertiary
- **Gold Amber** (`#F59E0B` / `oklch(75% 0.18 70)`): Community karma points, trending item badges, and pending moderation tags.
- **Bright Violet** (`#8B5CF6` / `oklch(62% 0.23 295)`): AI vision/OCR extraction indicators and receipt parsing badges.

### Neutral
- **Crisp Canvas Paper** (`#F8FAFC` / `oklch(98% 0.005 240)`): Base background for clean, bright daytime readability.
- **Pure Card Surface** (`#FFFFFF`): Crisp white card and container surface.
- **Subtle Tonal Tint** (`#F1F5F9`): Inactive input backgrounds, table header fills, and inactive filter pills.
- **Border Hairline** (`#E2E8F0`): Subtle 1px structural framing for cards and inputs.
- **Muted Body Slate** (`#64748B`): Secondary text, timestamps, unit labels, and contributor notes.
- **Deep Slate Ink** (`#0F172A`): High-contrast text for headings and primary price numbers.

### Named Rules
**The Price Direction Rule.** Color is never arbitrary on price figures: emerald green strictly represents price decreases and savings; coral sunset red strictly represents price increases, hikes, and inflation; neutral slate represents stable prices.
**The Ribbon Hierarchy Rule.** Verified community submissions and high-confidence OCR items carry a subtle top-right corner ribbon tag to immediately telegraph provenance without cluttering the card body.

## Typography

**Display & Headline Font:** Rounded Neo-Grotesque Sans (`Outfit`, `Plus Jakarta Sans`, `system-ui`, `sans-serif`) with friendly open letterforms and warm curves.
**Body & Interface Font:** Clean Accessible Sans (`Outfit`, `Inter`, `sans-serif`) optimized for high readability across dense product matrices and mobile screens.
**Numeric & Mono Font:** Tabular Monospace (`JetBrains Mono`, `ui-monospace`, `monospace`) with fixed-width numerals (`font-feature-settings: "tnum"`) for perfect vertical alignment in price columns and charts.

### Hierarchy
- **Display Hero** (Weight: 800, Size: `clamp(2rem, 5vw, 3.25rem)`, Line Height: 1.15, Letter Spacing: `-0.02em`): Hero headlines and community milestone banners.
- **Headline 1** (Weight: 700, Size: `1.75rem` / `28px`, Line Height: 1.25): Page titles and major view headers.
- **Title / Card Heading** (Weight: 600, Size: `1.125rem` / `18px`, Line Height: 1.35): Product names, store comparison headers, chart legends.
- **Body Regular** (Weight: 400, Size: `0.9375rem` / `15px`, Line Height: 1.5): Descriptions, community notes, moderation remarks.
- **Body Medium / Action** (Weight: 500, Size: `0.875rem` / `14px`, Line Height: 1.4): Button labels, filter options, table cell text.
- **Numeric Price Display** (Weight: 700, Size: `1.25rem` to `2.25rem`, Tabular Figures): Current price, lowest price, historical high.
- **Micro Badge / Ribbon** (Weight: 600, Size: `0.75rem` / `12px`, Letter Spacing: `0.03em`, Uppercase): Category tags, OCR confidence scores, store aisle indicators.

### Named Rules
**The Tabular Numerals Rule.** All monetary amounts, percentage deltas, timestamps, and chart axis labels must use tabular figures (`font-variant-numeric: tabular-nums`) so numbers do not cause layout shifts during live data filtering or updates.

## Layout

OpenPrice is engineered for device-specific fluidity:
- **Mobile (<640px):** Single-column stream, sticky glassmorphic search header (`backdrop-blur-md bg-white/90`), persistent bottom navigation bar (Explore, Scan/Upload, Watchlist, Profile/Admin), floating camera quick-scan trigger, bottom-sheet drawers for quick price logging and filter controls, 16px horizontal screen padding.
- **Tablet (640px–1024px):** Adaptive 2-column layout (item catalog + synchronized price chart side drawer), collapsible sidebar navigation, touch-friendly chart scrubbers.
- **Desktop (>1024px):** Three-tier layout: left persistent navigation sidebar (with quick view switcher between Public, Contributor Studio, and Admin Hub), central analytics/item matrix, and right-hand live price comparison & inflation radar drawer. Max container width capped at `1440px`.

### Spacing Scale
Consistent 4px/8px modular scale: `4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`, `48px`.

## Elevation & Depth

OpenPrice utilizes a **Subtle Ambient Lift** philosophy: soft, diffused multi-layer shadows paired with crisp 1px borders (`border-slate-200`) and gentle glassmorphic backdrop blurs for elevated floating controls.

### Shadow Vocabulary
- **Subtle Surface** (`box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)`): Card rest state with border.
- **Interactive Ambient Lift** (`box-shadow: 0 8px 20px -4px rgba(79, 70, 229, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04)`): Card hover, floating action button, dropdown menus.
- **Floating Header / Modal** (`box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)`): Upload modal, photo inspection lightbox, admin moderation drawers.

### Named Rules
**The Glass-and-Glow Rule.** Floating headers and bottom navigation bars use translucent glass backgrounds (`bg-white/80 backdrop-blur-md`) with a subtle 1px border (`border-slate-200/80`) to remain grounded and legible over scrolling content.

## Shapes

- **Base Corner Radius:** Moderately rounded `10px` to `12px` (`rounded-xl`) for buttons, inputs, filter pills, and table wrappers.
- **Card Containers:** Soft `16px` to `20px` (`rounded-2xl`) for inviting, modern containment.
- **Status & Trend Chips:** Fully pill-shaped `9999px` (`rounded-full`) for high scanability.
- **Action Camera / Upload Hub:** Prominent rounded circular trigger (`56px x 56px`, `rounded-full`) on mobile bottom navigation.
- **Verified Corner Ribbon:** Clipped angled ribbon tag (`rounded-tr-2xl rounded-bl-lg`) in the top-right corner of verified product cards and receipt images.

## Do's and Don'ts

### Do:
- **Do** show timestamp, store location, and verification source (e.g., "Parsed from Promo Flyer", "User Shelf Photo", "Online Store") alongside every price entry.
- **Do** provide instant visual feedback on photo/pamphlet OCR uploads with bounding boxes that synchronize highlights with the editable table on hover.
- **Do** ensure interactive charts have responsive touch-scrubbers and tooltip crosshairs for mobile and desktop alike.
- **Do** display clean verified ribbon badges in the top-right corner of verified community submissions.

### Don't:
- **Don't** use ambiguous colors for price fluctuations (never use red for a price drop or green for a price hike).
- **Don't** bury the camera/receipt upload action behind multiple menu layers on mobile screens.
- **Don't** clutter mobile cards with full multi-year charts; render compact sparklines on cards and expand into full interactive timeframes upon selection.
- **Don't** render unformatted numbers; always include the currency symbol, decimal precision, and delta trend indicator.
