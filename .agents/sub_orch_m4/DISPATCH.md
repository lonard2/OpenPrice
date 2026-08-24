## 2026-08-24T06:04:08Z
You are the Milestone 4 Lead Worker (sub_orch_m4: Multimodal AI / OCR Vision Parsing Pipeline).
Your working directory is /Users/lonard/Desktop/OpenPrice/.agents/sub_orch_m4.
You are invoked by orchestrator (conversation ID: eacff3d4-5acc-403a-9fc1-29e816b4bb7d).

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. An auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

CRITICAL INSTRUCTIONS:
1. Initialize your BRIEFING.md and progress.md.
2. Read /Users/lonard/Desktop/OpenPrice/ORIGINAL_REQUEST.md, PROJECT.md, and the OCR blueprints in /Users/lonard/Desktop/OpenPrice/.agents/survey_explorer_2/survey_report.md.
3. Implement the complete Multimodal AI / OCR vision parsing subsystem:
   - `src/lib/openrouter.ts`:
     * OpenRouter multimodal vision API client (using `process.env.OPENROUTER_API_KEY`, default model `google/gemini-2.5-flash` or `openai/gpt-4o-mini`).
     * Structured JSON prompt enforcing strict 0.0%–100.0% normalized bounding box coordinates (`xMin`, `yMin`, `xMax`, `yMax`).
     * Deterministic offline fallback parser handling sample shelf tags, promotional flyers, and supermarket receipts with realistic bounding boxes and confidence scores.
   - `src/app/api/ocr/parse/route.ts`:
     * `POST /api/ocr/parse` API route handler supporting `imageBase64`, `imageUrl`, and `sourceType` ('photo_shelf' | 'promo_pamphlet' | 'receipt').
     * Returns structured `OcrParseResult` with HTTP 200 (or structured error response on invalid input).
   - `src/components/ocr/`:
     * `PhotoUploader.tsx`: Drag-and-drop zone, camera capture trigger, preset sample selector for demo shelf tags/flyers/receipts.
     * `BoundingBoxOverlay.tsx`: Interactive SVG coordinate layer (`viewBox="0 0 100 100"`) with color-coded confidence boxes (Emerald >=0.90, Amber 0.70-0.89, Coral <0.70), hover/focus highlight states, detected price badges.
     * `ExtractedFieldEditor.tsx`: Responsive editable table of extracted items with real-time field editing (product name, brand, category, detected price, original price, confidence, selection checkboxes).
     * **Live Two-Way Synchronization**: Hovering a table row highlights the corresponding bounding box on the image canvas; clicking a bounding box on the image scrolls and focuses the respective table row.
     * `PamphletViewer.tsx`: Pan/zoom multi-item flyer canvas with deal callout badges and bulk "Select All" / "Batch Import" controls.
     * `src/components/ocr/index.ts`: Clean barrel export.
4. Add OCR tests in `tests/` and execute `npm test`, `npm run type-check`, and `npm run build` to verify 100% passing tests and zero build errors.
5. Write your handoff report to /Users/lonard/Desktop/OpenPrice/.agents/sub_orch_m4/handoff.md.
6. Notify parent via send_message (Recipient: "eacff3d4-5acc-403a-9fc1-29e816b4bb7d", RecipientName: "parent").
