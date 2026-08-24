'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Camera,
  FileText,
  Receipt,
  Globe,
  User,
  CheckCircle2,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatRelativeTime } from '@/lib/formatters';
import type { PricePoint, PriceSourceType } from '@/types';
import { cn } from '@/lib/utils';

export interface ProvenanceTimelineProps {
  history: PricePoint[];
  currency?: string;
  className?: string;
}

const sourceIcons: Record<PriceSourceType, React.ElementType> = {
  photo_shelf: Camera,
  promo_pamphlet: FileText,
  receipt: Receipt,
  web_crawler: Globe,
  manual: User,
};

const sourceLabels: Record<PriceSourceType, string> = {
  photo_shelf: 'Shelf Tag Photo OCR',
  promo_pamphlet: 'Promotional Flyer Scan',
  receipt: 'Receipt Scan OCR',
  web_crawler: 'Web Crawler Sync',
  manual: 'Community Manual Entry',
};

export function ProvenanceTimeline({
  history,
  currency = 'USD',
  className,
}: ProvenanceTimelineProps) {
  const [selectedProof, setSelectedProof] = useState<PricePoint | null>(null);

  if (!history || history.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
        No provenance timeline submissions recorded yet.
      </div>
    );
  }

  // Sort descending by timestamp
  const sorted = [...history].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className={cn('w-full flex flex-col space-y-4', className)}>
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {sorted.map((item, index) => {
          const Icon = sourceIcons[item.sourceType] || Camera;
          const isFirst = index === 0;

          return (
            <div key={item.id} className="relative group">
              {/* Timeline Bullet Node */}
              <div
                className={cn(
                  'absolute -left-6 sm:-left-8 top-1.5 w-6 sm:w-8 h-6 sm:h-8 rounded-full border-2 flex items-center justify-center transition-colors',
                  isFirst
                    ? 'bg-indigo-600 border-white ring-4 ring-indigo-100 text-white'
                    : 'bg-white border-slate-300 text-slate-500 group-hover:border-indigo-400 group-hover:text-indigo-600'
                )}
              >
                <Icon className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              </div>

              {/* Feed Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-surface hover:shadow-ambient-lift hover:border-slate-300 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={
                        item.sourceType === 'photo_shelf' || item.sourceType === 'promo_pamphlet'
                          ? 'ocr'
                          : 'brand'
                      }
                      size="sm"
                    >
                      {sourceLabels[item.sourceType] || item.sourceType}
                    </Badge>

                    {item.isVerified && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified
                      </span>
                    )}

                    {item.isOutlier && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        Flagged Anomaly
                      </span>
                    )}

                    {item.confidenceScore !== undefined && (
                      <span className="text-[11px] font-mono font-medium text-slate-400">
                        {item.confidenceScore}% confidence
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-slate-400 font-medium">
                    {formatRelativeTime(item.timestamp)}
                  </span>
                </div>

                {/* Body Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 items-center">
                  {/* Price & Store */}
                  <div className="sm:col-span-2 space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-extrabold font-mono tabular-nums text-slate-900">
                        {formatCurrency(item.price, currency)}
                      </span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="text-xs text-slate-400 line-through font-mono tabular-nums">
                          {formatCurrency(item.originalPrice, currency)}
                        </span>
                      )}
                      <span className="text-xs text-slate-500">{item.unit}</span>
                    </div>

                    <p className="text-xs font-semibold text-slate-700">
                      Observed at <span className="text-indigo-600">{item.storeName}</span>
                    </p>

                    {item.notes && (
                      <p className="text-xs text-slate-500 italic mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        &quot;{item.notes}&quot;
                      </p>
                    )}
                  </div>

                  {/* Contributor / Proof Photo Thumbnail */}
                  <div className="flex sm:flex-col sm:items-end justify-between items-center gap-2">
                    {item.contributorName && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-semibold">{item.contributorName}</span>
                      </div>
                    )}

                    {item.proofImageUrl ? (
                      <button
                        type="button"
                        onClick={() => setSelectedProof(item)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>View Proof</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        No photo attached
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Proof Lightbox Modal */}
      {selectedProof && (
        <Modal
          isOpen={Boolean(selectedProof)}
          onClose={() => setSelectedProof(null)}
          title="Submission Proof Document"
          description={`Observed at ${selectedProof.storeName} on ${new Date(
            selectedProof.timestamp
          ).toLocaleDateString()}`}
          size="lg"
        >
          <div className="flex flex-col space-y-4">
            <div className="relative w-full h-80 rounded-xl bg-slate-950 flex items-center justify-center p-2 overflow-hidden">
              <Image
                src={selectedProof.proofImageUrl || ''}
                alt={`Proof photo for ${selectedProof.storeName}`}
                fill
                unoptimized
                className="object-contain rounded-lg shadow-lg"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200">
              <div>
                Recorded Price:{' '}
                <strong className="text-slate-900 font-mono">
                  {formatCurrency(selectedProof.price, currency)}
                </strong>{' '}
                ({selectedProof.unit})
              </div>
              <Badge variant="verified" size="sm">
                Confidence: {selectedProof.confidenceScore || 95}%
              </Badge>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
