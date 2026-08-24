# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
delegated: Next.js (App Router, React, TypeScript, Tailwind CSS) for full-stack responsive web application with built-in API routes, dynamic chart rendering, and multi-source AI/OCR price parsing capabilities.

## Users
- Everyday Consumers & Bargain Hunters: Shoppers tracking groceries, tech, retail goods, and services to spot inflation trends, detect fake discounts, and find the lowest store prices.
- Community Contributors: Active shoppers who snap photos of store shelf tags, upload promotional pamphlets/receipts, or log prices on the go to build an open, crowdsourced price database.
- Community Curators & Admins: Moderators who verify parsed data, resolve outlier prices, manage product categories/stores, and monitor tracking accuracy.

## Product Purpose
OpenPrice is a lively, modern, crowdsourced and multi-source price tracking and intelligence platform. It turns store shelf photos, promotional pamphlets, e-commerce listings, and everyday observations into historical price charts, inflation trackers, and price hike alerts across mobile, tablet, and desktop devices.

## Positioning
Unlike single-retailer trackers or static coupon sites, OpenPrice connects real-world offline retail observations (shelf photos, flyers, receipts) with online data into a unified, community-verified historical index with macro trend analysis (inflation, price hikes, stock rarity).

## Operating Context
- On Mobile: Fast in-store logging, snapping camera photos of shelf tags/receipts, barcode/QR lookup, and aisle price comparisons.
- On Tablet / Desktop: Rich price history charts, multi-store comparison matrix, batch pamphlet parsing, community contribution review, and admin moderation.

## Capabilities and Constraints
- Multi-source Ingestion: Manual input/CRUD, photo & pamphlet upload with AI vision/OCR extraction, and website/URL parsing.
- Dynamic Visualizations: Interactive price history charts, inflation trends, store-by-store comparison matrices, and demand/rarity indicators.
- Multi-view Architecture:
  - Public View: Searchable catalog, price change trends, store comparisons, and interactive history charts.
  - Logged-in / Contributor View: Price submission studio (photo/pamphlet parsing & manual entry), watchlist alerts, and contributor reputation metrics.
  - Admin / Moderator View: Submission review queue, conflict & outlier resolution, and category/store taxonomy management.
- Responsive UX: Touch-optimized mobile layout with bottom navigation and quick-action camera trigger; spacious desktop dashboard with data-dense charts and controls.

## Brand Commitments
- Name: OpenPrice
- Voice & Tone: Engaging, lively, transparent, reliable, community-driven, and crisp.

## Evidence on Hand
- Initial greenfield repository; configured with OpenRouter API environment for multi-modal vision parsing assistance. Seed data includes realistic multi-category items (groceries, electronics, household essentials) and longitudinal price points across multiple retail stores.

## Product Principles
1. Low-Friction Multi-Source Capture: Snapping a photo of a shelf tag or uploading a promo pamphlet must swiftly parse prices into structured, editable data with minimal friction.
2. Radical Transparency: Display complete historical price timelines, confidence scores, and source evidence (photos, links) to expose real price movements.
3. Engaging & Lively Experience: Price tracking should feel rewarding and dynamic with real-time updates, clear visual charts, and satisfying feedback rather than dry spreadsheets.
4. Universal Fluidity: Perfectly tailored responsive experiences for in-store mobile shoppers, tablet browsers, and power desktop analysts.

## Accessibility & Inclusion
- Accessible color contrast for chart series and status indicators (using color + icon + text badges for price drops/hikes).
- Accessible keyboard navigation and ARIA landmarks across all modals, drawers, and form controls.
- Touch-friendly target sizes (min 44x44px) for one-handed mobile logging.
