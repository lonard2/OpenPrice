'use client';

import React from 'react';
import type { ExtractedPriceItem } from '../../types/index.ts';
import { formatCurrency } from '../../lib/formatters.ts';
import { cn } from '../../lib/utils.ts';
import { getConfidenceColor } from '../../lib/openrouter.ts';

export { getConfidenceColor };

export interface BoundingBoxOverlayProps {
  items: ExtractedPriceItem[];
  selectedItemId?: string | null;
  hoveredItemId?: string | null;
  onItemSelect?: (tempId: string) => void;
  onItemHover?: (tempId: string | null) => void;
  showLabels?: boolean;
  showPriceBadges?: boolean;
  className?: string;
}

export function BoundingBoxOverlay({
  items,
  selectedItemId,
  hoveredItemId,
  onItemSelect,
  onItemHover,
  showLabels = true,
  showPriceBadges = true,
  className,
}: BoundingBoxOverlayProps) {
  // Sort so hovered/selected elements render on top of overlapping boxes
  const sortedItems = [...items].sort((a, b) => {
    const aActive = a.tempId === selectedItemId || a.tempId === hoveredItemId ? 1 : 0;
    const bActive = b.tempId === selectedItemId || b.tempId === hoveredItemId ? 1 : 0;
    return aActive - bActive;
  });

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={cn(
        'absolute inset-0 w-full h-full pointer-events-none select-none overflow-visible',
        className
      )}
      aria-label="Interactive OCR bounding box overlay"
    >
      <defs>
        <filter id="box-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="0.8" floodColor="#4F46E5" floodOpacity="0.6" />
        </filter>
        <filter id="badge-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="0.5" floodColor="#0F172A" floodOpacity="0.25" />
        </filter>
      </defs>

      {sortedItems.map((item) => {
        const box = item.boundingBox;
        if (!box) return null;

        const isSelected = selectedItemId === item.tempId;
        const isHovered = hoveredItemId === item.tempId;
        const isActive = isSelected || isHovered;

        const { stroke, fill, fillHover, badgeBg, badgeText } = getConfidenceColor(item.confidence);

        const width = Math.max(1, box.xMax - box.xMin);
        const height = Math.max(1, box.yMax - box.yMin);

        // Position badge above box, or below if too close to top edge
        const badgeY = box.yMin > 8 ? box.yMin - 1.5 : box.yMin + 5;
        const badgeX = Math.min(Math.max(box.xMin, 1), 75);

        const formattedPrice = formatCurrency(item.price);

        return (
          <g
            key={item.tempId}
            role="graphics-symbol"
            tabIndex={0}
            aria-label={`${item.name}, Price: ${formattedPrice}, Confidence: ${Math.round(
              item.confidence * 100
            )}%`}
            onClick={(e) => {
              e.stopPropagation();
              onItemSelect?.(item.tempId);
            }}
            onMouseEnter={() => onItemHover?.(item.tempId)}
            onMouseLeave={() => onItemHover?.(null)}
            onFocus={() => onItemHover?.(item.tempId)}
            onBlur={() => onItemHover?.(null)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onItemSelect?.(item.tempId);
              }
            }}
            className={cn(
              'pointer-events-auto cursor-pointer transition-all duration-150 focus:outline-none'
            )}
          >
            {/* Main Bounding Box Rectangle */}
            <rect
              x={box.xMin}
              y={box.yMin}
              width={width}
              height={height}
              rx={1.2}
              ry={1.2}
              fill={isActive ? fillHover : fill}
              stroke={isActive ? '#4F46E5' : stroke}
              strokeWidth={isActive ? 0.75 : 0.4}
              strokeDasharray={item.confidence < 0.7 ? '1.5 1' : undefined}
              filter={isActive ? 'url(#box-glow)' : undefined}
              className="transition-all duration-150"
            />

            {/* Corner Accent Markers on Active State */}
            {isActive && (
              <>
                {/* Top-Left Corner */}
                <rect x={box.xMin - 0.5} y={box.yMin - 0.5} width={1.8} height={1.8} fill="#4F46E5" rx={0.3} />
                {/* Top-Right Corner */}
                <rect x={box.xMax - 1.3} y={box.yMin - 0.5} width={1.8} height={1.8} fill="#4F46E5" rx={0.3} />
                {/* Bottom-Left Corner */}
                <rect x={box.xMin - 0.5} y={box.yMax - 1.3} width={1.8} height={1.8} fill="#4F46E5" rx={0.3} />
                {/* Bottom-Right Corner */}
                <rect x={box.xMax - 1.3} y={box.yMax - 1.3} width={1.8} height={1.8} fill="#4F46E5" rx={0.3} />
              </>
            )}

            {/* Detected Price & Confidence Tag Badge */}
            {showPriceBadges && (
              <g
                transform={`translate(${badgeX}, ${badgeY})`}
                filter="url(#badge-shadow)"
                className="transition-transform duration-150"
              >
                {/* Price Pill Background */}
                <rect
                  x={0}
                  y={-4.2}
                  width={showLabels ? 24 : 14}
                  height={5}
                  rx={1.5}
                  fill={isActive ? '#4F46E5' : badgeBg}
                  className="transition-colors duration-150"
                />

                {/* Price Text */}
                <text
                  x={1.8}
                  y={-0.8}
                  fill={badgeText}
                  fontSize="3"
                  fontWeight="bold"
                  fontFamily="Outfit, JetBrains Mono, monospace"
                  className="tabular-nums"
                >
                  {formattedPrice}
                </text>

                {/* Optional Confidence Tag */}
                {showLabels && (
                  <text
                    x={13.5}
                    y={-1.0}
                    fill="rgba(255, 255, 255, 0.9)"
                    fontSize="2.1"
                    fontFamily="Outfit, sans-serif"
                    fontWeight="500"
                  >
                    {Math.round(item.confidence * 100)}%
                  </text>
                )}
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
