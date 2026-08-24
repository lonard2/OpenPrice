/**
 * OpenPrice Multimodal AI / OCR Vision Parsing API Route
 * POST /api/ocr/parse
 */

import { parseVisionDocument } from '../../../../lib/openrouter.ts';
import type { OcrParseRequest, OcrParseResponse } from '../../../../types/index.ts';

const VALID_SOURCE_TYPES = ['photo_shelf', 'promo_pamphlet', 'receipt'] as const;
type ValidSourceType = (typeof VALID_SOURCE_TYPES)[number];

export async function POST(req: Request): Promise<Response> {
  try {
    let body: Partial<OcrParseRequest>;
    try {
      body = await req.json();
    } catch {
      return Response.json(
        {
          success: false,
          error: 'Invalid JSON request payload.',
        },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object') {
      return Response.json(
        {
          success: false,
          error: 'Request body must be a valid JSON object.',
        },
        { status: 400 }
      );
    }

    const { imageBase64, imageUrl, sourceType } = body;

    // Validate image input
    if (!imageBase64 && !imageUrl) {
      return Response.json(
        {
          success: false,
          error: 'Either "imageBase64" or "imageUrl" must be provided.',
        },
        { status: 400 }
      );
    }

    if (imageBase64 && typeof imageBase64 !== 'string') {
      return Response.json(
        {
          success: false,
          error: '"imageBase64" must be a string.',
        },
        { status: 400 }
      );
    }

    if (imageUrl && typeof imageUrl !== 'string') {
      return Response.json(
        {
          success: false,
          error: '"imageUrl" must be a string.',
        },
        { status: 400 }
      );
    }

    // Validate sourceType
    if (!sourceType || !VALID_SOURCE_TYPES.includes(sourceType as ValidSourceType)) {
      return Response.json(
        {
          success: false,
          error: `Invalid or missing "sourceType". Must be one of: ${VALID_SOURCE_TYPES.join(', ')}.`,
        },
        { status: 400 }
      );
    }

    const parseRequest: OcrParseRequest = {
      imageBase64: imageBase64?.trim(),
      imageUrl: imageUrl?.trim(),
      sourceType: sourceType as ValidSourceType,
    };

    const response: OcrParseResponse = await parseVisionDocument(parseRequest);

    return Response.json(response, { status: 200 });
  } catch (error) {
    console.error('Unhandled error in /api/ocr/parse:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal OCR processing error.',
      },
      { status: 500 }
    );
  }
}
