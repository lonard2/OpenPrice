# E2E Test Infra: OpenPrice

## Test Philosophy
- **Opaque-Box & Requirement-Driven:** Derived from `ORIGINAL_REQUEST.md`, `PRODUCT.md`, `DESIGN.md`, and `TEAM.md`, independent of internal implementation details.
- **Methodology:** Category-Partition + Boundary Value Analysis (BVA) + Pairwise Combinatorial Testing + Real-World Persona Workloads + Adversarial Hardening.
- **Verification Semantics:** Every test produces deterministic exit codes and explicit objective assertions.

---

## Feature Inventory & Test Mapping
| # | Feature | Requirement | Tier 1 (Features) | Tier 2 (Boundary) | Tier 3 (Pairwise) | Tier 4 (Workloads) |
|---|---|---|:---:|:---:|:---:|:---:|
| 1 | Architecture & Token Styling | R1, DESIGN.md | 5 | 5 | ✓ | ✓ |
| 2 | Tabular Numerals & Price Semantics | R1, DESIGN.md | 5 | 5 | ✓ | ✓ |
| 3 | Domain Models & Persistence | R2, TEAM.md | 5 | 5 | ✓ | ✓ |
| 4 | Inflation & Volatility Math | R2, TEAM.md | 5 | 5 | ✓ | ✓ |
| 5 | Outlier Anomaly Detection (>3σ) | R2, TEAM.md | 5 | 5 | ✓ | ✓ |
| 6 | Multimodal OCR & Fallback | R3, TEAM.md | 5 | 5 | ✓ | ✓ |
| 7 | Interactive Bounding Box Sync | R3, DESIGN.md | 5 | 5 | ✓ | ✓ |
| 8 | PriceHistoryChart & Timeframes | R4, TEAM.md | 5 | 5 | ✓ | ✓ |
| 9 | Sparkline & Radar Visualizers | R4, TEAM.md | 5 | 5 | ✓ | ✓ |
| 10 | Public Shopper Catalog & Filters | R5, TEAM.md | 5 | 5 | ✓ | ✓ |
| 11 | Deep Product Detail & Store Matrix | R5, TEAM.md | 5 | 5 | ✓ | ✓ |
| 12 | Contributor Ingestion Studio | R5, TEAM.md | 5 | 5 | ✓ | ✓ |
| 13 | Watchlist & Basket Optimizer | R5, TEAM.md | 5 | 5 | ✓ | ✓ |
| 14 | Admin Moderation Queue & Diff | R5, TEAM.md | 5 | 5 | ✓ | ✓ |
| 15 | Multi-Role Context Switching | R5, TEAM.md | 5 | 5 | ✓ | ✓ |
| 16 | Mobile Bottom Bar & Touch (>=44px)| R5, DESIGN.md | 5 | 5 | ✓ | ✓ |

---

## Test Architecture
- **Test Runner:** Node.js native test runner (`node --test`) or custom robust test harness executing TypeScript/TSX tests.
- **Pass/Fail Semantics:** Exit code `0` on 100% pass; non-zero exit code with assertion stack traces on failure.
- **Directory Layout:**
  - `tests/unit/`: Pure function assertions (`formatters.test.ts`, `inflation.test.ts`).
  - `tests/components/`: Component rendering, tabular class verification, color token assertions.
  - `tests/integration/`: Role context switching, client store events, API route verification.
  - `tests/e2e/`:
    - `tier1-feature-coverage.test.ts`
    - `tier2-boundary-cases.test.ts`
    - `tier3-pairwise-combinations.test.ts`
    - `tier4-real-world-scenarios.test.ts`
    - `tier5-adversarial-hardening.test.ts`

---

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|---|---|---|
| 1 | The In-Aisle Mobile Bargain Hunter | Mobile bottom bar, search, category filter, PriceBadge, store comparison matrix, add to watchlist | Medium |
| 2 | The Active Contributor Bulk Flyer Upload | Contributor studio, flyer OCR parse, bounding box sync, deal selection, karma points increment | High |
| 3 | The Community Curator Outlier Resolution | Admin role switch, moderation queue, side-by-side diff inspector, >3σ alert, price correction & approve | High |
| 4 | The Macro Inflation & Basket Analysis | Macro ticker, InflationRadar, multi-store PriceHistoryChart timeframes (7D to ALL), store variance | Medium |
| 5 | The Multi-Store Shopping Trip Optimizer | Watchlist multi-item selection, basket pricing calculation across stores, split-trip routing recommendation | High |

---

## Coverage Thresholds
- **Tier 1 (Feature Coverage):** $\ge 5 \times 16 = 80$ test cases.
- **Tier 2 (Boundary & Corner):** $\ge 5 \times 16 = 80$ test cases.
- **Tier 3 (Cross-Feature Pairwise):** $\ge 16$ test cases.
- **Tier 4 (Real-World Application Scenarios):** $\ge 5$ end-to-end user workflows.
- **Total Minimum Target:** $\ge 181$ test cases.
