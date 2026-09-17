'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  Store as StoreIcon,
  Plus,
  CheckCircle2,
  Globe,
  ArrowLeft,
  Percent,
  Sliders,
  Scale,
  Sparkles,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import {
  getStoredStores,
  saveStoredStores,
  getStoredProducts,
  getStoredCategoryMetadata,
  saveCategoryWeight,
  saveCategoryWeights,
  resetCategoryWeights,
  subscribeToStorageChanges,
} from '@/lib/storage';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import type { Store, ProductCategory, CategoryMetadata } from '@/types';

const STANDARD_UNITS: Record<ProductCategory, string[]> = {
  groceries: ['1 gal', '1 lb', '12 oz', 'dozen', 'loaf', 'each'],
  beverages: ['12 oz', '16 oz', '2 L', '6-pack', '1 gal', 'can'],
  household: ['pack', 'box', 'roll', 'count', 'bottle', 'each'],
  pharmacy: ['100 ct', 'bottle', 'box', 'tube', 'pack', 'unit'],
  electronics: ['each', 'unit', 'pack', 'set'],
  apparel: ['each', 'pair', 'pack', 'unit'],
  services: ['hr', 'session', 'visit', 'month'],
};

export default function AdminTaxonomyPage() {
  const [stores, setStores] = useState<Store[]>(() => getStoredStores());
  const [products] = useState(() => getStoredProducts());
  const [categoryMetadata, setCategoryMetadata] = useState<Record<ProductCategory, CategoryMetadata>>(() =>
    getStoredCategoryMetadata()
  );
  const [activeTab, setActiveTab] = useState<'stores' | 'categories'>('stores');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Subscribe to external/cross-tab storage modifications
  useEffect(() => {
    const unsubscribe = subscribeToStorageChanges(() => {
      setStores(getStoredStores());
      setCategoryMetadata(getStoredCategoryMetadata());
    });
    return unsubscribe;
  }, []);

  // Compute total basket weight for Laspeyres index calibration
  const totalBasketWeight = Object.values(categoryMetadata).reduce(
    (sum, cat) => sum + (cat.inflationBasketWeight || 0),
    0
  );
  const totalBasketPercent = Math.round(totalBasketWeight * 100);
  const isBasketCalibrated = Math.abs(totalBasketWeight - 1.0) < 0.005;

  // Add / Edit Store Modal state
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [storeForm, setStoreForm] = useState<{
    name: string;
    chain: string;
    branchName: string;
    type: 'physical' | 'online' | 'hybrid';
    color: string;
  }>({
    name: '',
    chain: '',
    branchName: 'Main Branch',
    type: 'physical',
    color: '#4F46E5',
  });

  // Edit Category Weight Modal state
  const [editingCategory, setEditingCategory] = useState<{
    key: ProductCategory;
    name: string;
    weight: number;
    units: string[];
  } | null>(null);
  const [categoryWeightInput, setCategoryWeightInput] = useState<string>('0.15');

  // Open Add Store modal
  const handleOpenAddStore = () => {
    setEditingStore(null);
    setStoreForm({
      name: '',
      chain: '',
      branchName: 'Main Branch',
      type: 'physical',
      color: '#4F46E5',
    });
    setIsStoreModalOpen(true);
  };

  // Open Edit Store modal
  const handleOpenEditStore = (store: Store) => {
    setEditingStore(store);
    setStoreForm({
      name: store.name,
      chain: store.chain || store.name,
      branchName: store.branchName || 'Main Store',
      type: store.type || 'physical',
      color: store.color || '#4F46E5',
    });
    setIsStoreModalOpen(true);
  };

  // Save Store Form
  const handleSaveStore = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = storeForm.name.trim();
    if (!trimmedName) return;

    if (editingStore) {
      // Update existing store and persist
      const updated = stores.map((s) =>
        s.id === editingStore.id
          ? {
              ...s,
              name: trimmedName,
              chain: storeForm.chain.trim() || trimmedName,
              branchName: storeForm.branchName.trim() || 'Main Branch',
              type: storeForm.type,
              color: storeForm.color,
            }
          : s
      );
      saveStoredStores(updated);
      setStores(updated);
      setFeedback(`Updated store "${trimmedName}".`);
    } else {
      // Add new store and persist
      const newStore: Store = {
        id: `store-${Date.now()}`,
        name: trimmedName,
        chain: storeForm.chain.trim() || trimmedName,
        branchName: storeForm.branchName.trim() || 'Main Branch',
        type: storeForm.type,
        color: storeForm.color,
      };
      const updated = [...stores, newStore];
      saveStoredStores(updated);
      setStores(updated);
      setFeedback(`Added new store "${trimmedName}" to directory.`);
    }

    setIsStoreModalOpen(false);
    setTimeout(() => setFeedback(null), 4000);
  };

  // Save Category Weight adjustment
  const handleSaveCategoryWeight = () => {
    if (!editingCategory) return;
    const weightNum = parseFloat(categoryWeightInput);
    if (!isNaN(weightNum) && weightNum > 0 && weightNum <= 1.0) {
      saveCategoryWeight(editingCategory.key, weightNum);
      setCategoryMetadata(getStoredCategoryMetadata());
      setFeedback(
        `Updated inflation basket weight for "${editingCategory.name}" to ${(weightNum * 100).toFixed(0)}%.`
      );
    }
    setEditingCategory(null);
    setTimeout(() => setFeedback(null), 4000);
  };

  // Auto-balance category weights to sum precisely 100% (1.00)
  const handleAutoBalanceWeights = () => {
    if (totalBasketWeight <= 0) return;
    const entries = Object.entries(categoryMetadata) as [ProductCategory, CategoryMetadata][];
    const weights: Partial<Record<ProductCategory, number>> = {};
    let accumulated = 0;

    entries.forEach(([key, meta], idx) => {
      if (idx === entries.length - 1) {
        const remainder = Math.round((1.0 - accumulated) * 100) / 100;
        weights[key] = Math.max(0.01, remainder);
      } else {
        const normalized = Math.round(((meta.inflationBasketWeight || 0.1) / totalBasketWeight) * 100) / 100;
        const clamped = Math.max(0.01, normalized);
        weights[key] = clamped;
        accumulated += clamped;
      }
    });

    saveCategoryWeights(weights as Record<ProductCategory, number>);
    setCategoryMetadata(getStoredCategoryMetadata());
    setFeedback('Auto-balanced Laspeyres category basket weights to sum exactly 100%.');
    setTimeout(() => setFeedback(null), 4000);
  };

  // Reset category weights back to standard seed defaults
  const handleResetWeights = () => {
    resetCategoryWeights();
    setCategoryMetadata(getStoredCategoryMetadata());
    setFeedback('Reset category weights to standard index benchmarks.');
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Back Link and Header Pill */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/moderation"
          className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white border border-slate-200/80 transition-all shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Moderation</span>
        </Link>

        <Badge variant="category" size="sm">
          System Administration
        </Badge>
      </div>

      {/* Main Header Banner */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-surface">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Layers className="w-7 h-7 text-indigo-600 shrink-0" aria-hidden="true" />
              <span>Stores & Category Taxonomy</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              Configure retailer store directories, category taxonomy definitions, measurement units, and Laspeyres inflation index weights.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('stores')}
              className={`min-h-[44px] px-4 py-2.5 text-xs font-bold rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                activeTab === 'stores'
                  ? 'bg-indigo-600 text-white shadow-ambient-lift'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Retailer Directory ({stores.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('categories')}
              className={`min-h-[44px] px-4 py-2.5 text-xs font-bold rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                activeTab === 'categories'
                  ? 'bg-indigo-600 text-white shadow-ambient-lift'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Category Taxonomy
            </button>
          </div>
        </div>
      </section>

      {/* Feedback Notification Banner */}
      {feedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-900 flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="min-h-[44px] px-3 py-2 text-emerald-700 hover:text-emerald-950 font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: STORES DIRECTORY */}
      {activeTab === 'stores' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Configured Retailers & Chains ({stores.length})
            </h3>

            <Button
              variant="primary"
              size="md"
              className="min-h-[44px]"
              onClick={handleOpenAddStore}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Retailer
            </Button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-5">Store Name & Chain</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Brand Accent</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stores.map((store) => (
                    <tr key={store.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shrink-0 shadow-2xs"
                            style={{ backgroundColor: store.color || '#4F46E5' }}
                          >
                            <StoreIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-sm block">
                              {store.name}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Chain: {store.chain || store.name} ({store.branchName})
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <Badge variant="category" size="sm" className="capitalize">
                          {store.type === 'online' ? (
                            <Globe className="w-3 h-3 text-indigo-600" />
                          ) : (
                            <StoreIcon className="w-3 h-3 text-slate-500" />
                          )}
                          <span>{store.type}</span>
                        </Badge>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs shrink-0"
                            style={{ backgroundColor: store.color || '#4F46E5' }}
                          />
                          <span className="font-mono text-slate-600 font-medium tabular-nums">
                            {store.color || '#4F46E5'}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          ● Active
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenEditStore(store)}
                          className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* TAB 2: CATEGORY & UNIT TAXONOMY */}
      {activeTab === 'categories' && (
        <section className="space-y-5">
          {/* Basket Calibration & Allocation Bar */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-surface space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-sm font-bold text-slate-900">
                    Laspeyres Inflation Index Weight Allocation
                  </h4>
                  {isBasketCalibrated ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Calibrated (100%)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      Misaligned ({totalBasketPercent}%)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  The composite price index calculates inflation as a fixed-weight Laspeyres basket. Category weights should sum to 100% (1.00).
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleAutoBalanceWeights}
                  disabled={isBasketCalibrated}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Auto-Balance to 100%</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetWeights}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reset Defaults</span>
                </button>
              </div>
            </div>

            {/* Visual Multi-Segment Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Total Allocated Basket Weight:</span>
                <span
                  className={`font-mono font-bold text-sm tabular-nums ${
                    isBasketCalibrated ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {totalBasketPercent}% / 100%
                </span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden flex shadow-inner">
                {Object.entries(categoryMetadata).map(([catKey, meta]) => {
                  const pct = Math.max(0, (meta.inflationBasketWeight || 0) * 100);
                  return (
                    <div
                      key={catKey}
                      style={{ width: `${pct}%`, backgroundColor: meta.colorAccent || '#4F46E5' }}
                      className="h-full transition-all hover:opacity-85"
                      title={`${meta.displayName}: ${pct.toFixed(0)}%`}
                    />
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-500 pt-1">
                {Object.entries(categoryMetadata).map(([catKey, meta]) => (
                  <span key={catKey} className="inline-flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: meta.colorAccent || '#4F46E5' }}
                    />
                    <span>{meta.displayName}:</span>
                    <strong className="font-mono text-slate-700 tabular-nums font-bold">
                      {((meta.inflationBasketWeight || 0) * 100).toFixed(0)}%
                    </strong>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <h3 className="text-base font-bold text-slate-900">
              Canonical Product Categories & Index Weights
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.entries(categoryMetadata).map(([catKey, meta]) => {
              const categoryKey = catKey as ProductCategory;
              const count = products.filter((p) => p.category === categoryKey).length;
              const commonUnits = STANDARD_UNITS[categoryKey] || ['each', 'unit'];

              return (
                <div
                  key={catKey}
                  className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-surface flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                          style={{ backgroundColor: meta.colorAccent || '#4F46E5' }}
                        />
                        <h4 className="text-base font-bold text-slate-900">
                          {meta.displayName}
                        </h4>
                      </div>
                      <Badge variant="category" size="sm" className="tabular-nums">
                        {count} {count === 1 ? 'item' : 'items'}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      {meta.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <Percent className="w-3.5 h-3.5 text-indigo-600" />
                        Basket Weight:
                      </span>
                      <strong className="font-mono text-indigo-600 font-bold text-sm tabular-nums">
                        {((meta.inflationBasketWeight || 0) * 100).toFixed(0)}%
                      </strong>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">
                        Standard Units:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {commonUnits.map((unit) => (
                          <span
                            key={unit}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-mono"
                          >
                            {unit}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory({
                          key: categoryKey,
                          name: meta.displayName,
                          weight: meta.inflationBasketWeight,
                          units: commonUnits,
                        });
                        setCategoryWeightInput(meta.inflationBasketWeight.toString());
                      }}
                      className="w-full min-h-[44px] py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors border border-slate-200/80 flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Adjust Basket Weight</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Add / Edit Store Modal */}
      <Modal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        title={editingStore ? `Edit Retailer: ${editingStore.name}` : 'Add New Retailer Store'}
        description="Configure store details for crowdsourced price observations."
        size="md"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              size="md"
              className="min-h-[44px]"
              onClick={() => setIsStoreModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              className="min-h-[44px]"
              onClick={handleSaveStore}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              {editingStore ? 'Update Store' : 'Create Store'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveStore} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label htmlFor="retailer-name-input" className="text-xs font-bold text-slate-700">
              Retailer Store Name
            </label>
            <Input
              id="retailer-name-input"
              type="text"
              required
              placeholder="e.g. Target Supercenter"
              value={storeForm.name}
              onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="retailer-chain-input" className="text-xs font-bold text-slate-700">
                Chain Parent
              </label>
              <Input
                id="retailer-chain-input"
                type="text"
                placeholder="e.g. Target"
                value={storeForm.chain}
                onChange={(e) => setStoreForm({ ...storeForm, chain: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="retailer-type-select" className="text-xs font-bold text-slate-700">
                Store Type
              </label>
              <select
                id="retailer-type-select"
                value={storeForm.type}
                onChange={(e) =>
                  setStoreForm({ ...storeForm, type: e.target.value as 'physical' | 'online' | 'hybrid' })
                }
                className="w-full min-h-[44px] px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="physical">Physical Brick & Mortar</option>
                <option value="online">Online / E-Commerce Delivery</option>
                <option value="hybrid">Hybrid Omnichannel</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="retailer-branch-input" className="text-xs font-bold text-slate-700">
                Branch Location / Subtitle
              </label>
              <Input
                id="retailer-branch-input"
                type="text"
                placeholder="e.g. Downtown Metro"
                value={storeForm.branchName}
                onChange={(e) => setStoreForm({ ...storeForm, branchName: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="retailer-color-hex" className="text-xs font-bold text-slate-700">
                Brand Accent Color Hex
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="retailer-color-picker"
                  aria-label="Pick brand color"
                  type="color"
                  value={storeForm.color}
                  onChange={(e) => setStoreForm({ ...storeForm, color: e.target.value })}
                  className="w-11 h-11 rounded-xl border border-slate-200 p-0.5 cursor-pointer shrink-0"
                />
                <Input
                  id="retailer-color-hex"
                  type="text"
                  value={storeForm.color}
                  onChange={(e) => setStoreForm({ ...storeForm, color: e.target.value })}
                />
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* Adjust Category Weight Modal */}
      {editingCategory && (
        <Modal
          isOpen={Boolean(editingCategory)}
          onClose={() => setEditingCategory(null)}
          title={`Adjust Weight: ${editingCategory.name}`}
          description="Modify this category's proportional contribution to the composite Laspeyres inflation index."
          size="sm"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="md"
                className="min-h-[44px]"
                onClick={() => setEditingCategory(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                className="min-h-[44px]"
                onClick={handleSaveCategoryWeight}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Save Weight
              </Button>
            </div>
          }
        >
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <label htmlFor="basket-weight-input" className="text-xs font-bold text-slate-700">
                Laspeyres Basket Weight (0.01 - 1.00):
              </label>
              <Input
                id="basket-weight-input"
                type="number"
                step="0.01"
                min="0.01"
                max="1.0"
                value={categoryWeightInput}
                onChange={(e) => setCategoryWeightInput(e.target.value)}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              A weight of 0.35 represents 35% of total basket composition.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
