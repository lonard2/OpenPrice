---
name: OpenPrice
description: Community-verified crowdsourced grocery price intelligence and longitudinal inflation index
colors:
  primary: "#4F46E5"
  secondary: "#0EA5E9"
  drop: "#10B981"
  hike: "#F43F5E"
  amber: "#F59E0B"
  violet: "#8B5CF6"
  indigo-light: "#6366F1"
  pink: "#EC4899"
  canvas: "#F8FAFC"
  surface: "#FFFFFF"
  tint: "#F1F5F9"
  hairline: "#E2E8F0"
  muted: "#64748B"
  ink: "#0F172A"
typography:
  display:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.25rem)"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.25
  title:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
  caption:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.4
  micro:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 600
    lineHeight: 1.3
  nano:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "0.5625rem"
    fontWeight: 700
    lineHeight: 1.2
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.4
    fontFeature: "tnum"
rounded:
  md: "8px"
  lg: "10px"
  xl: "12px"
  "2xl": "16px"
  "3xl": "20px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  touch: "44px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "10px 20px"
    height: "{spacing.touch}"
  button-primary-hover:
    backgroundColor: "#4338CA"
  button-secondary:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "10px 16px"
    height: "{spacing.touch}"
  card-surface:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.2xl}"
    padding: "20px"
  chip-filter:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.muted}"
    rounded: "{rounded.xl}"
    padding: "8px 14px"
    height: "{spacing.touch}"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "10px 16px"
    height: "{spacing.touch}"
---

# Design System: OpenPrice

## Overview

**Creative North Star: "The Community Exchange"**

OpenPrice is a friendly, civic crowdsourced price intelligence and inflation tracking platform. It rejects sterile financial grayness, generic AI gradient meshes, and coupon spam in favor of an energetic, welcoming, and intuitive consumer experience. The system radiates civic transparency and community momentum: high-visibility price cards, soft rounded geometry, smooth glassmorphic headers, tactile OCR scan interactions, and clear economic signals that empower everyday shoppers to track inflation, beat price hikes, and share real savings.

The visual language balances consumer friendliness with analytical rigor. Price cards feature clean verified ribbon badges, live bounding box synchronization for receipt and flyer scans, and smooth tabular counters that make checking price histories satisfying and effortless across mobile, tablet, and desktop screens.

**Key Characteristics:**
- **Warm & Energetic Civic Authority:** Friendly rounded geometry, inviting micro-interactions, and vibrant semantic color coding that make price tracking feel like a collaborative community effort.
- **Subtle Ambient Lift:** Gentle multi-layer diffused card shadows, floating navigation headers with soft backdrop blurs, and tactile interactive states (`active:scale-[0.98]`).
- **Tactile Multimodal Telemetry:** Interactive bounding boxes on uploaded shelf photos and receipts that highlight on hover, paired with corner-clipped verification ribbons.
- **Absolute Numeric Clarity:** Tabular numeral alignment (`font-variant-numeric: tabular-nums`) ensuring prices and inflation percentages never jitter or shift layouts during live updates.
- **Civic Methodology Transparency:** Integrated disclosures for Laspeyres rolling weighted index, Bessel-corrected outlier rejection (>3 sigma), and multimodal OCR provenance.

## Colors

The palette is energetic, bright, and strictly semantic, pairing an approachable indigo/cerulean foundation with clear economic direction indicators.

### Primary
- **Vibrant Indigo** (`#4F46E5`): Primary brand color used for main navigation active states, primary CTA buttons, and key interactive highlights.
- **Electric Cerulean** (`#0EA5E9`): Complementary energetic blue used for search filters, active tabs, and link accents.

### Secondary
- **Emerald Mint** (`#10B981`): Positive economic indicator used exclusively for price drops, bargains, lowest store prices, and verified discount badges.
- **Coral Sunset** (`#F43F5E`): Warning and alert color used exclusively for price hikes, inflation spikes, out-of-stock items, and outlier price alerts.

### Tertiary
- **Gold Amber** (`#F59E0B`): Community karma points, trending item badges, and pending moderation tags.
- **Bright Violet** (`#8B5CF6`): AI vision and OCR extraction indicators and receipt parsing badges.

### Neutral
- **Canvas Slate** (`#F8FAFC`): Base background for clean, bright daytime readability.
- **Pure Card Surface** (`#FFFFFF`): Crisp white card and container surface.
- **Subtle Tonal Tint** (`#F1F5F9`): Inactive input backgrounds, table header fills, and inactive filter pills.
- **Border Hairline** (`#E2E8F0`): Subtle 1px structural framing for cards and inputs.
- **Muted Body Slate** (`#64748B`): Secondary text, timestamps, unit labels, and contributor notes.
- **Deep Slate Ink** (`#0F172A`): High-contrast text for headings and primary price numbers.

### Named Rules
**The Price Direction Rule.** Color is never arbitrary on price figures: emerald green strictly represents price decreases and savings; coral sunset red strictly represents price increases, hikes, and inflation; neutral slate represents stable prices.
**The Ribbon Hierarchy Rule.** Verified community submissions and high-confidence OCR items carry a subtle top-right corner ribbon tag to immediately telegraph provenance without cluttering the card body.

## Typography

**Display Font:** Outfit (fallback: system-ui, sans-serif)
**Body Font:** Outfit (fallback: system-ui, sans-serif)
**Numeric & Mono Font:** JetBrains Mono (fallback: ui-monospace, monospace)

**Character:** Friendly rounded Neo-Grotesque letterforms paired with fixed-width tabular monospace numerals for mathematical precision.

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

OpenPrice is engineered for device-specific fluidity with a strict 44px touch target floor:
- **Mobile (<640px):** Single-column stream, sticky glassmorphic search header (`backdrop-blur-md bg-white/85`), persistent bottom navigation bar (Explore, Scan/Upload, Watchlist, Profile/Admin), floating camera quick-scan trigger, bottom-sheet drawers for quick price logging and filter controls, 16px horizontal screen padding.
- **Tablet (640px to 1024px):** Adaptive 2-column layout (item catalog + synchronized price chart side drawer), collapsible sidebar navigation, touch-friendly chart scrubbers.
- **Desktop (>1024px):** Three-tier layout: left persistent navigation sidebar (with quick view switcher between Public, Contributor Studio, and Admin Hub), central analytics and item matrix, and right-hand live price comparison and inflation radar drawer. Max container width capped at `1440px`.

### Spacing Scale
Consistent 4px/8px modular scale: `4px` (xs), `8px` (sm), `12px`, `16px` (md), `20px`, `24px` (lg), `32px` (xl), `48px`.

## Elevation & Depth

OpenPrice utilizes a **Subtle Ambient Lift** philosophy: soft, diffused multi-layer shadows paired with crisp 1px borders (`border-slate-200/90`) and gentle glassmorphic backdrop blurs for elevated floating controls.

### Shadow Vocabulary
- **Subtle Surface** (`box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)`): Card rest state with border.
- **Interactive Ambient Lift** (`box-shadow: 0 8px 20px -4px rgba(79, 70, 229, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04)`): Card hover, floating action button, dropdown menus.
- **Floating Header / Modal** (`box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)`): Upload modal, photo inspection lightbox, admin moderation drawers.

### Named Rules
**The Glass-and-Glow Rule.** Floating headers and bottom navigation bars use translucent glass backgrounds (`bg-white/85 backdrop-blur-md`) with a subtle 1px border (`border-slate-200/80`) to remain grounded and legible over scrolling content.

## Shapes

- **Base Corner Radius:** Moderately rounded `10px` to `12px` (`rounded-xl`) for buttons, inputs, filter pills, and table wrappers.
- **Card Containers:** Soft `16px` to `20px` (`rounded-2xl`) for inviting, modern containment.
- **Status & Trend Chips:** Fully pill-shaped `9999px` (`rounded-full`) for high scanability.
- **Action Camera / Upload Hub:** Prominent rounded circular trigger (`52px x 52px`, `rounded-full`) on mobile bottom navigation.
- **Verified Corner Ribbon:** Clipped angled ribbon tag (`rounded-tr-2xl rounded-bl-xl`) in the top-right corner of verified product cards and receipt images.

## Components

### Buttons
- **Shape:** Rounded rectangle (`rounded-xl` / 12px), minimum height 44px (`min-h-[44px] touch-target`).
- **Primary:** Vibrant Indigo background (`#4F46E5`), crisp white text, 10px 20px padding.
- **Hover / Active:** Transition to `#4338CA`, elevation lift, and tactile active press (`active:scale-[0.98]`).
- **Secondary / Ghost:** Subtle tonal tint (`#F1F5F9`), slate ink text (`#0F172A`), 1px hairline border (`#E2E8F0`).

### Chips & Filter Pills
- **Style:** Compact pill (`rounded-xl`), 8px 14px padding, minimum height 44px for touch ergonomics.
- **State:** Unselected items use `#F1F5F9` background with `#64748B` text; active item uses `#4F46E5` background with white text and tabular counter pill.

### Cards & Containers
- **Corner Style:** Soft rounded (`rounded-2xl` / 16px).
- **Background:** Crisp pure white (`#FFFFFF`) on `#F8FAFC` canvas.
- **Shadow Strategy:** Subtle surface rest shadow + 1px hairline border; elevates to ambient lift shadow on hover.
- **Internal Padding:** 20px to 24px (`p-5` to `p-6`).

### Inputs & Fields
- **Style:** Pure white background, 1px slate-200 border, `rounded-xl` geometry, 44px touch height.
- **Focus:** 2px focus ring (`focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`).
- **Error:** Rose tint background (`bg-rose-50/50`) with rose border (`border-rose-400`) and clear text feedback.

### Navigation
- **Desktop:** Sticky glassmorphic top header (64px) paired with persistent left sidebar (256px width) for view switching.
- **Mobile:** Fixed bottom navigation bar (64px + safe area padding) with centered scan FAB.

### Signature Component: Inflation Radar Strip
- **Description:** Horizontal economic telemetry strip situated directly beneath the hero. Displays community CPI basket change, 30-day price trends, and verified store count with live pulse indicators.

## Do's and Don'ts

### Do:
- **Do** show timestamp, store location, and verification source (e.g. "Parsed from Promo Flyer", "User Shelf Photo", "Online Store") alongside every price entry.
- **Do** provide instant visual feedback on photo/pamphlet OCR uploads with bounding boxes that synchronize highlights with the editable table on hover.
- **Do** ensure interactive charts have responsive touch-scrubbers and tooltip crosshairs for mobile and desktop alike.
- **Do** display clean verified ribbon badges in the top-right corner of verified community submissions.
- **Do** enforce minimum 44x44px touch bounding boxes on all interactive filters and buttons.

### Don't:
- **Don't** use em-dashes (—) in headlines, eyebrows, pills, buttons, or body copy; use standard hyphens.
- **Don't** use ambiguous colors for price fluctuations (never use red for a price drop or green for a price hike).
- **Don't** clutter screens with generic AI sparkles, neon glows, or diffuse gradient mesh blobs.
- **Don't** bury the camera/receipt upload action behind multiple menu layers on mobile screens.
- **Don't** render unformatted numbers; always include the currency symbol, decimal precision, and tabular numeral alignment.
