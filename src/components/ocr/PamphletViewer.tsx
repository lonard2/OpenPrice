'use client';

import React, { useState, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Tag,
  Sparkles,
  ShoppingBag,
  Percent,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { Badge } from '../ui/Badge.tsx';
import { BoundingBoxOverlay } from './BoundingBoxOverlay.tsx';
import { formatCurrency } from '../../lib/formatters.ts';
import { cn } from '../../lib/utils.ts';
import type { ExtractedPriceItem } from '../../types/index.ts';

export interface PamphletViewerProps {
  imageUrl: string;
  imageAlt?: string;
  items: ExtractedPriceItem[];
  selectedItemId?: string | null;
  hoveredItemId?: string | null;
  onItemSelect?: (tempId: string) => void;
  onItemHover?: (tempId: string | null) => void;
  onSelectionChange?: (selectedItemIds: string[]) => void;
  onBatchImport?: (selectedItems: ExtractedPriceItem[]) => void;
  isImporting?: boolean;
  className?: string;
}

export function PamphletViewer({
  imageUrl,
  imageAlt = 'Promotional flyer or circular document',
  items,
  selectedItemId,
  hoveredItemId,
  onItemSelect,
  onItemHover,
  onSelectionChange,
  onBatchImport,
  isImporting = false,
  className,
}: PamphletViewerProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showDealsOverlay, setShowDealsOverlay] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(prev - 0.25, 0.75);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && zoom > 1) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Bulk Selection stats
  const selectedItems = items.filter((item) => item.selected);
  const allSelected = items.length > 0 && selectedItems.length === items.length;

  const selectedPriceTotal = selectedItems.reduce((sum, item) => sum + item.price, 0);

  const totalSavings = selectedItems.reduce((sum, item) => {
    if (item.originalPrice && item.originalPrice > item.price) {
      return sum + (item.originalPrice - item.price);
    }
    return sum;
  }, 0);

  const handleToggleSelectAll = () => {
    const nextSelected = !allSelected;
    const updated = items.map((item) => ({ ...item, selected: nextSelected }));
    onSelectionChange?.(updated.filter((i) => i.selected).map((i) => i.tempId));
  };

  return (
    <div className={cn('flex flex-col gap-3 bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-surface', className)}>
      {/* Top Controls Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Badge variant="ocr" size="sm" icon={<Sparkles className="w-3 h-3 text-indigo-600" />}>
            Flyer Canvas
          </Badge>
          <span className="text-xs font-semibold text-slate-700">
            {items.length} Deals Detected
          </span>
          {totalSavings > 0 && (
            <Badge variant="drop" size="sm" icon={<Percent className="w-3 h-3 text-emerald-700" />}>
              Save {formatCurrency(totalSavings)} Total
            </Badge>
          )}
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200/80">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= 0.75}
              aria-label="Zoom out"
              className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-white transition-colors disabled:opacity-40"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-semibold text-slate-700 px-2 min-w-[44px] text-center select-none tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= 3.0}
              aria-label="Zoom in"
              className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-white transition-colors disabled:opacity-40"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              aria-label="Reset zoom"
              title="Reset Zoom"
              className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-white transition-colors ml-1 border-l border-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowDealsOverlay(!showDealsOverlay)}
            leftIcon={<Tag className="w-3.5 h-3.5" />}
          >
            {showDealsOverlay ? 'Hide Overlay' : 'Show Overlay'}
          </Button>
        </div>
      </div>

      {/* Interactive Pan/Zoom Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={cn(
          'relative w-full h-[400px] sm:h-[500px] bg-slate-900 rounded-2xl overflow-hidden select-none',
          zoom > 1 ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
        )}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isPanning ? 'none' : 'transform 0.15s ease-out',
          }}
          className="relative w-full h-full flex items-center justify-center"
        >
          {/* Document / Flyer Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={imageAlt}
            draggable={false}
            className="max-w-full max-h-full object-contain rounded-lg pointer-events-none select-none"
          />

          {/* SVG Bounding Boxes Layer */}
          {showDealsOverlay && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-full h-full max-w-full max-h-full">
                <BoundingBoxOverlay
                  items={items}
                  selectedItemId={selectedItemId}
                  hoveredItemId={hoveredItemId}
                  onItemSelect={onItemSelect}
                  onItemHover={onItemHover}
                  showLabels={true}
                  showPriceBadges={true}
                />
              </div>
            </div>
          )}

          {/* Floating Deal Callouts on Flyer */}
          {showDealsOverlay &&
            items.map((item) => {
              if (!item.boundingBox) return null;
              const hasDiscount = item.originalPrice && item.originalPrice > item.price;
              const discountPct = hasDiscount
                ? ((item.price - item.originalPrice!) / item.originalPrice!) * 100
                : 0;

              const isItemActive = selectedItemId === item.tempId || hoveredItemId === item.tempId;

              return (
                <div
                  key={`deal-callout-${item.tempId}`}
                  style={{
                    position: 'absolute',
                    left: `${item.boundingBox.xMin}%`,
                    top: `${item.boundingBox.yMin}%`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onItemSelect?.(item.tempId);
                  }}
                  onMouseEnter={() => onItemHover?.(item.tempId)}
                  onMouseLeave={() => onItemHover?.(null)}
                  className={cn(
                    'pointer-events-auto cursor-pointer transition-all duration-150 transform -translate-y-full -translate-x-1',
                    isItemActive ? 'scale-110 z-30' : 'z-20 hover:scale-105'
                  )}
                >
                  <div
                    className={cn(
                      'flex items-center gap-1.5 px-2 py-0.5 rounded-lg shadow-md border text-[11px] font-bold select-none',
                      hasDiscount
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-900/90 text-white border-slate-700',
                      isItemActive && 'ring-2 ring-indigo-400'
                    )}
                  >
                    <span className="font-mono tabular-nums">{formatCurrency(item.price)}</span>
                    {hasDiscount && (
                      <span className="bg-emerald-700/80 px-1 py-0.2 rounded text-[9px] font-semibold">
                        -{Math.round(Math.abs(discountPct))}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Pan Hint Overlay when Zoomed */}
        {zoom > 1 && (
          <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm text-slate-300 text-[11px] px-2.5 py-1 rounded-xl pointer-events-none select-none border border-slate-700">
            Click & drag to pan circular
          </div>
        )}
      </div>

      {/* Bulk Action Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleToggleSelectAll}
            leftIcon={allSelected ? <Square className="w-3.5 h-3.5" /> : <CheckSquare className="w-3.5 h-3.5" />}
          >
            {allSelected ? 'Deselect All' : 'Select All Deals'}
          </Button>

          <div className="text-xs text-slate-600 font-medium">
            <span className="font-bold text-slate-900">{selectedItems.length}</span> of {items.length} selected
            {selectedPriceTotal > 0 && (
              <span className="ml-1.5 text-slate-500 font-mono tabular-nums">
                ({formatCurrency(selectedPriceTotal)})
              </span>
            )}
          </div>
        </div>

        {onBatchImport && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            isLoading={isImporting}
            disabled={selectedItems.length === 0}
            onClick={() => onBatchImport(selectedItems)}
            leftIcon={<ShoppingBag className="w-4 h-4" />}
          >
            Batch Ingest {selectedItems.length} Deals
          </Button>
        )}
      </div>
    </div>
  );
}
