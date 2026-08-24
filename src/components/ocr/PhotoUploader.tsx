'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  UploadCloud,
  Camera,
  FileImage,
  Sparkles,
  Tag,
  Receipt,
  FileSpreadsheet,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { Badge } from '../ui/Badge.tsx';
import { cn } from '../../lib/utils.ts';
import type { OcrParseRequest, OcrParseResponse } from '../../types/index.ts';

export interface PhotoUploaderProps {
  onImageSelected?: (data: {
    imageUrl: string;
    imageBase64?: string;
    sourceType: 'photo_shelf' | 'promo_pamphlet' | 'receipt';
    file?: File;
  }) => void;
  onParseComplete?: (response: OcrParseResponse) => void;
  isProcessing?: boolean;
  className?: string;
  initialSourceType?: 'photo_shelf' | 'promo_pamphlet' | 'receipt';
}

interface PresetSample {
  id: string;
  title: string;
  subtitle: string;
  sourceType: 'photo_shelf' | 'promo_pamphlet' | 'receipt';
  imageUrl: string;
  icon: React.ComponentType<{ className?: string }>;
  itemCount: number;
}

const PRESET_SAMPLES: PresetSample[] = [
  {
    id: 'shelf-tag',
    title: 'Store Shelf Tag',
    subtitle: 'Target • Organic Milk ($4.89)',
    sourceType: 'photo_shelf',
    imageUrl: '/samples/shelf-tag-milk.jpg',
    icon: Tag,
    itemCount: 1,
  },
  {
    id: 'promo-flyer',
    title: 'Weekly Circular Flyer',
    subtitle: 'Walmart • 4 Discount Deals',
    sourceType: 'promo_pamphlet',
    imageUrl: '/samples/weekly-flyer-circular.jpg',
    icon: FileSpreadsheet,
    itemCount: 4,
  },
  {
    id: 'receipt',
    title: 'Supermarket Receipt',
    subtitle: "Trader Joe's • 3 Itemized Items",
    sourceType: 'receipt',
    imageUrl: '/samples/grocery-receipt-trader-joes.jpg',
    icon: Receipt,
    itemCount: 3,
  },
];

export function PhotoUploader({
  onImageSelected,
  onParseComplete,
  isProcessing = false,
  className,
  initialSourceType = 'photo_shelf',
}: PhotoUploaderProps) {
  const [sourceType, setSourceType] = useState<'photo_shelf' | 'promo_pamphlet' | 'receipt'>(
    initialSourceType
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [internalLoading, setInternalLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const activeLoading = isProcessing || internalLoading;

  const processFile = useCallback(
    (file: File) => {
      setError(null);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file (JPEG, PNG, WebP, etc.).');
        return;
      }

      // Validate file size (max 12MB)
      if (file.size > 12 * 1024 * 1024) {
        setError('Image size exceeds 12MB limit. Please select a smaller photo.');
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        setPreviewUrl(base64Data);

        onImageSelected?.({
          imageUrl: base64Data,
          imageBase64: base64Data,
          sourceType,
          file,
        });

        // Trigger OCR parsing if onParseComplete is subscribed
        if (onParseComplete) {
          setInternalLoading(true);
          try {
            const res = await fetch('/api/ocr/parse', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                imageBase64: base64Data,
                sourceType,
              } satisfies OcrParseRequest),
            });

            const data: OcrParseResponse = await res.json();
            if (data.success) {
              onParseComplete(data);
            } else {
              const errPayload = data as unknown as { error?: string };
              setError(errPayload.error || 'Failed to analyze image with multimodal AI.');
            }
          } catch {
            setError('Network error while communicating with OCR service.');
          } finally {
            setInternalLoading(false);
          }
        }
      };

      reader.onerror = () => {
        setError('Failed to read image file.');
      };

      reader.readAsDataURL(file);
    },
    [sourceType, onImageSelected, onParseComplete]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handlePresetSelect = async (preset: PresetSample) => {
    setError(null);
    setSourceType(preset.sourceType);
    setPreviewUrl(preset.imageUrl);

    onImageSelected?.({
      imageUrl: preset.imageUrl,
      sourceType: preset.sourceType,
    });

    if (onParseComplete) {
      setInternalLoading(true);
      try {
        const res = await fetch('/api/ocr/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: preset.imageUrl,
            sourceType: preset.sourceType,
          } satisfies OcrParseRequest),
        });

        const data: OcrParseResponse = await res.json();
        if (data.success) {
          onParseComplete(data);
        } else {
          const errPayload = data as unknown as { error?: string };
          setError(errPayload.error || 'Failed to parse preset document.');
        }
      } catch {
        setError('Network error while loading preset sample.');
      } finally {
        setInternalLoading(false);
      }
    }
  };

  return (
    <div className={cn('w-full flex flex-col gap-5', className)}>
      {/* Source Type Selector Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
        <span className="text-xs font-semibold text-slate-700 px-2 flex items-center gap-1.5">
          <Tag className="w-4 h-4 text-indigo-600" />
          Document Type:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setSourceType('photo_shelf')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-xl transition-all duration-150 flex items-center gap-1.5 min-h-[36px] select-none',
              sourceType === 'photo_shelf'
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/90'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            )}
          >
            <Tag className="w-3.5 h-3.5" />
            Shelf Tag
          </button>
          <button
            type="button"
            onClick={() => setSourceType('promo_pamphlet')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-xl transition-all duration-150 flex items-center gap-1.5 min-h-[36px] select-none',
              sourceType === 'promo_pamphlet'
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/90'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            )}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Weekly Flyer
          </button>
          <button
            type="button"
            onClick={() => setSourceType('receipt')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-xl transition-all duration-150 flex items-center gap-1.5 min-h-[36px] select-none',
              sourceType === 'receipt'
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/90'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            )}
          >
            <Receipt className="w-3.5 h-3.5" />
            Receipt
          </button>
        </div>
      </div>

      {/* Main Drag-and-Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !activeLoading && fileInputRef.current?.click()}
        role="region"
        aria-label="Photo upload drop zone"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={cn(
          'relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-200 cursor-pointer select-none',
          'flex flex-col items-center justify-center gap-4 bg-white',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
          isDragOver
            ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99] shadow-inner'
            : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50 shadow-surface',
          activeLoading && 'pointer-events-none opacity-80'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
          className="hidden"
          aria-label="Upload photo file"
        />

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
          className="hidden"
          aria-label="Take camera photo"
        />

        {activeLoading ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-slate-900">
                Analyzing document with Multimodal AI...
              </p>
              <p className="text-xs text-slate-500">
                Extracting store headers, bounding boxes, prices, and catalog matches
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm transition-transform duration-200 group-hover:scale-105">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div className="flex flex-col gap-1 max-w-sm">
              <p className="text-base font-semibold text-slate-900">
                Drag & drop your store photo here
              </p>
              <p className="text-xs text-slate-500">
                Supports shelf tags, multi-item weekly circulars, and supermarket receipts (JPG, PNG, WebP up to 12MB)
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                leftIcon={<FileImage className="w-4 h-4" />}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Browse Files
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<Camera className="w-4 h-4" />}
                onClick={(e) => {
                  e.stopPropagation();
                  cameraInputRef.current?.click();
                }}
              >
                Take Photo
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <p className="flex-1 font-medium">{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-600 hover:text-rose-800 font-semibold text-xs px-2 py-1 rounded-lg hover:bg-rose-100/60"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Preset Demo Samples */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Or try realistic demo documents:
          </span>
          <span className="text-[11px] text-slate-500">Instant one-click demo</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PRESET_SAMPLES.map((sample) => {
            const Icon = sample.icon;
            const isCurrent = previewUrl === sample.imageUrl;

            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => handlePresetSelect(sample)}
                disabled={activeLoading}
                className={cn(
                  'p-3.5 rounded-2xl border text-left transition-all duration-200 select-none flex items-start gap-3',
                  isCurrent
                    ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50/80 shadow-surface',
                  'active:scale-[0.98] disabled:opacity-50'
                )}
              >
                <div
                  className={
                    isCurrent
                      ? 'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 bg-indigo-600 text-white'
                      : 'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 bg-slate-100 text-slate-800'
                  }
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {sample.title}
                    </span>
                    <Badge variant="category" size="sm">
                      {sample.itemCount} {sample.itemCount === 1 ? 'item' : 'items'}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-slate-500 truncate mt-0.5">
                    {sample.subtitle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
