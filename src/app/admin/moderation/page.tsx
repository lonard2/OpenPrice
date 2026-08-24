'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit2,
  Camera,
  Layers,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useRoleView } from '@/components/providers/RoleContext';
import {
  getModerationQueue,
  resolveModerationItem,
  getStoredProducts,
  savePriceSubmission,
  subscribeToStorageChanges,
} from '@/lib/storage';
import { formatCurrency, formatRelativeTime } from '@/lib/formatters';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import type { ModerationItem } from '@/types';

export default function AdminModerationPage() {
  const { role, setRole } = useRoleView();
  const [queue, setQueue] = useState<ModerationItem[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Adjust Price Modal state
  const [adjustingItem, setAdjustingItem] = useState<ModerationItem | null>(null);
  const [adjustedPriceInput, setAdjustedPriceInput] = useState<string>('');

  // Proof Lightbox Modal state
  const [previewProof, setPreviewProof] = useState<string | null>(null);

  // Load moderation queue
  useEffect(() => {
    const loadQueue = () => {
      setQueue(getModerationQueue());
    };

    loadQueue();
    const unsubscribe = subscribeToStorageChanges(loadQueue);
    return () => unsubscribe();
  }, []);

  // Handle Approve
  const handleApprove = (id: string, productName: string) => {
    resolveModerationItem(id, 'approve');
    setFeedback(`Approved submission for "${productName}". Price point integrated into historical catalog.`);
    setTimeout(() => setFeedback(null), 4000);
  };

  // Handle Reject
  const handleReject = (id: string, productName: string) => {
    resolveModerationItem(id, 'reject');
    setFeedback(`Rejected submission for "${productName}". Anomaly discarded without affecting price index.`);
    setTimeout(() => setFeedback(null), 4000);
  };

  // Handle Adjust and Approve
  const handleAdjustSubmit = () => {
    if (!adjustingItem) return;
    const priceNum = parseFloat(adjustedPriceInput);
    if (isNaN(priceNum) || priceNum <= 0) return;

    resolveModerationItem(adjustingItem.id, 'adjust', priceNum);
    setFeedback(`Adjusted price to ${formatCurrency(priceNum)} and approved for "${adjustingItem.productName}".`);
    setAdjustingItem(null);
    setTimeout(() => setFeedback(null), 4000);
  };

  // Seed sample flagged items for testing
  const handleSeedQueue = () => {
    const prods = getStoredProducts();
    const milk = prods.find((p) => p.id === 'prod-milk') || prods[0];

    // Submit an extreme $45.00 price spike to trigger >3σ outlier detection
    if (milk) {
      savePriceSubmission({
        productId: milk.id,
        price: 45.0,
        storeId: 'store-target',
        storeName: 'Target Supercenter',
        proofImageUrl: '/samples/shelf-tag-milk.jpg',
        notes: 'Possible OCR decimal point slip ($45.00 instead of $4.50)',
        contributorName: 'Mobile Scanner User',
        sourceType: 'photo_shelf',
      });
    }

    setFeedback('Generated sample >3σ outlier price submission for review.');
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Admin Header Banner */}
      <section className="bg-gradient-to-br from-amber-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/30 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin / Community Curator Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Submission Moderation Queue
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Review flagged crowdsourced submissions, verify proof documents, and resolve statistical &gt;3σ price outliers to maintain catalog integrity.
            </p>

            {role !== 'admin' && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors"
                >
                  <span>Switch perspective to Admin</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 min-w-[200px] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Pending Submissions
                </span>
                <p className="text-2xl font-extrabold font-mono text-amber-400 tabular-nums">
                  {queue.length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            <Link
              href="/admin/taxonomy"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all"
            >
              <Layers className="w-4 h-4" />
              <span>Store & Taxonomy Manager</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Action Feedback Banner */}
      {feedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-900 flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Moderation Queue Content */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Flagged Items Requiring Curator Action ({queue.length})
          </h3>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSeedQueue}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Simulate Flagged Outlier
          </Button>
        </div>

        {queue.length === 0 ? (
          /* Empty Queue State */
          <div className="p-10 sm:p-14 text-center bg-white rounded-3xl border border-slate-200/90 shadow-surface space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900">
                Moderation Queue is Clear
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                All community submissions have been verified and processed. No pending statistical outliers or low-confidence scans.
              </p>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleSeedQueue}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Seed Anomaly Submission for Review
              </Button>
            </div>
          </div>
        ) : (
          /* Queue Items List */
          <div className="space-y-4">
            {queue.map((item) => {
              const isVarianceOutlier = item.flagReason === 'outlier_variance';

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-surface hover:shadow-ambient-lift transition-all space-y-5"
                >
                  {/* Top Bar: Flag Badge & Timestamp */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outlier"
                        size="sm"
                        icon={<AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                      >
                        {isVarianceOutlier ? 'Statistical Outlier (>3σ)' : 'Low OCR Confidence (<80%)'}
                      </Badge>

                      <span className="text-xs text-slate-500">
                        Product: <strong className="text-slate-900">{item.productName}</strong>
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono">
                      Submitted {formatRelativeTime(item.submittedAt)}
                    </span>
                  </div>

                  {/* Side-by-Side Diff Inspector */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                    {/* Left: Proof Document Photo */}
                    <div className="md:col-span-4 bg-slate-950 rounded-2xl p-2 flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden group">
                      {item.proofImageUrl ? (
                        <>
                          <div className="relative w-full h-36">
                            <Image
                              src={item.proofImageUrl}
                              alt={`Proof for ${item.productName}`}
                              fill
                              unoptimized
                              className="object-contain rounded-xl"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setPreviewProof(item.proofImageUrl!)}
                            className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold gap-1.5 transition-opacity"
                          >
                            <Camera className="w-4 h-4" />
                            <span>Enlarge Proof Photo</span>
                          </button>
                        </>
                      ) : (
                        <div className="text-slate-500 text-xs flex flex-col items-center gap-1">
                          <Camera className="w-6 h-6 text-slate-600" />
                          <span>No proof image attached</span>
                        </div>
                      )}
                    </div>

                    {/* Middle: Side-by-Side Metric Comparison */}
                    <div className="md:col-span-5 space-y-3">
                      <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400">
                            Submitted Price
                          </span>
                          <p className="text-lg font-extrabold font-mono text-rose-600 tabular-nums">
                            {formatCurrency(item.submittedPrice)}
                          </p>
                          <span className="text-[11px] text-slate-500">
                            Observed at {item.storeName}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400">
                            Historical Lowest
                          </span>
                          <p className="text-lg font-extrabold font-mono text-slate-900 tabular-nums">
                            {formatCurrency(item.previousPrice || 4.89)}
                          </p>
                          <span className="text-[11px] text-emerald-600 font-semibold">
                            Normal catalog range
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 space-y-1">
                        <p>
                          Contributor: <strong className="text-slate-900">{item.contributorName || 'Community Member'}</strong>
                        </p>
                        {item.pricePoint?.notes && (
                          <p className="italic text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            &quot;{item.pricePoint.notes}&quot;
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Moderator Action Buttons */}
                    <div className="md:col-span-3 flex flex-col gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApprove(item.id, item.productName)}
                        leftIcon={<CheckCircle2 className="w-4 h-4" />}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white"
                      >
                        Approve Price
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAdjustingItem(item);
                          setAdjustedPriceInput(
                            item.submittedPrice > 20
                              ? (item.submittedPrice / 10).toFixed(2)
                              : item.submittedPrice.toFixed(2)
                          );
                        }}
                        leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                      >
                        Adjust & Approve
                      </Button>

                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleReject(item.id, item.productName)}
                        leftIcon={<XCircle className="w-4 h-4" />}
                      >
                        Reject & Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Adjust Price Modal */}
      {adjustingItem && (
        <Modal
          isOpen={Boolean(adjustingItem)}
          onClose={() => setAdjustingItem(null)}
          title="Adjust & Approve Submission"
          description={`Correct typographic or OCR scan errors before integrating into catalog for ${adjustingItem.productName}.`}
          size="sm"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAdjustingItem(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAdjustSubmit}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Save & Approve
              </Button>
            </div>
          }
        >
          <div className="space-y-4 py-2">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Original Submitted</span>
                <p className="text-base font-bold font-mono text-rose-600">
                  {formatCurrency(adjustingItem.submittedPrice)}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-slate-400">Store</span>
                <p className="text-xs font-semibold text-slate-800">
                  {adjustingItem.storeName}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Corrected Verified Price ($):
              </label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={adjustedPriceInput}
                onChange={(e) => setAdjustedPriceInput(e.target.value)}
                leftIcon={<span className="text-xs font-mono font-bold text-slate-400">$</span>}
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Proof Lightbox Modal */}
      {previewProof && (
        <Modal
          isOpen={Boolean(previewProof)}
          onClose={() => setPreviewProof(null)}
          title="Original Proof Document"
          size="lg"
        >
          <div className="relative w-full h-96 bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center p-2">
            <Image
              src={previewProof}
              alt="Proof Document"
              fill
              unoptimized
              className="object-contain rounded-xl shadow-lg"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
