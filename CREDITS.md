# Third-Party Licenses & Attribution

OpenPrice makes use of several open-source software packages, design systems, and external APIs. We gratefully acknowledge the creators, maintainers, and contributors of the following projects:

---

## 1. Core Framework & Libraries

### Next.js
- **Project:** [Next.js](https://nextjs.org/)
- **Author/Owner:** Vercel, Inc.
- **License:** MIT License
- **Copyright:** Copyright (c) 2024 Vercel, Inc.
- **Usage:** Full-stack web framework (App Router, Server & Client Components, Route Handlers, Optimization).

### React & React DOM
- **Project:** [React](https://react.dev/)
- **Author/Owner:** Meta Platforms, Inc. & React Open Source Contributors
- **License:** MIT License
- **Copyright:** Copyright (c) Meta Platforms, Inc. and affiliates.
- **Usage:** Declarative component UI library and reconciliation engine.

### Tailwind CSS & PostCSS
- **Project:** [Tailwind CSS](https://tailwindcss.com/)
- **Author/Owner:** Tailwind Labs, Inc.
- **License:** MIT License
- **Copyright:** Copyright (c) Tailwind Labs, Inc.
- **Usage:** Utility-first CSS framework for typography, layout, semantic color tokens, and responsive ergonomics.

### Lucide Icons
- **Project:** [Lucide React](https://lucide.dev/)
- **Author/Owner:** Lucide Contributors / Feather Icons
- **License:** ISC License / MIT License
- **Copyright:** Copyright (c) 2022-2024 Lucide Contributors
- **Usage:** Clean, accessible vector icons for telemetry indicators, action buttons, and navigation.

### Recharts
- **Project:** [Recharts](https://recharts.org/)
- **Author/Owner:** Recharts Group
- **License:** MIT License
- **Copyright:** Copyright (c) 2015-2024 Recharts Group
- **Usage:** SVG-based data telemetry components (`LineChart`, `BarChart`, `RadarChart`, `ResponsiveContainer`).

### Clsx & Tailwind Merge
- **Project:** [clsx](https://github.com/lukeed/clsx) & [tailwind-merge](https://github.com/dcastil/tailwind-merge)
- **Author/Owner:** Luke Edwards & Dany Castillo
- **License:** MIT License
- **Copyright:** Copyright (c) Luke Edwards, Copyright (c) 2022 Dany Castillo
- **Usage:** Conditional class string composition and tailwind class conflict resolution (`src/lib/utils.ts`).

---

## 2. Multimodal AI & Vision Services

### OpenRouter API
- **Service:** [OpenRouter](https://openrouter.ai/)
- **Provider:** OpenRouter Inc.
- **Usage:** Multimodal vision inference pipeline for automated document OCR parsing (`/api/ocr/parse`), structured bounding box extraction, and catalog item matching with deterministic offline heuristic fallback.

---

## 3. Fonts & Typography

### Google Fonts: Outfit & JetBrains Mono
- **Typefaces:** [Outfit](https://fonts.google.com/specimen/Outfit) & [JetBrains Mono](https://www.jetbrains.com/lp/mono/)
- **License:** SIL Open Font License, 1.1
- **Copyright:** Copyright (c) Outfit Project Authors, Copyright (c) 2020 JetBrains s.r.o.
- **Usage:** Modern geometric sans-serif for editorial layouts and monospace font with tabular numerals (`font-mono tabular-nums`) for currency and metrics.

---

## 4. Software License Notice

Unless otherwise specified, all original source code created for OpenPrice is licensed under the MIT License.
See the [LICENSE](./LICENSE) file for the full text.
