'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { getStoredStores, getStoredProducts } from '@/lib/storage';
import { CATEGORY_METADATA } from '@/lib/mock-data';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import type { Store, ProductCategory } from '@/types';

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
  const [stores, setStores] = useState<Store[]>(getStoredStores());
  const [products] = useState(getStoredProducts());
  const [activeTab, setActiveTab] = useState<'stores' | 'categories'>('stores');
  const [feedback, setFeedback] = useState<string | null>(null);

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
    if (!storeForm.name.trim()) return;

    if (editingStore) {
      // Update store
      const updated = stores.map((s) =>
        s.id === editingStore.id
          ? {
              ...s,
              name: storeForm.name,
              chain: storeForm.chain,
              branchName: storeForm.branchName,
              type: storeForm.type,
              color: storeForm.color,
            }
          : s
      );
      setStores(updated);
      setFeedback(`Updated store "${storeForm.name}".`);
    } else {
      // Add new store
      const newStore: Store = {
        id: `store-${Date.now()}`,
        name: storeForm.name,
        chain: storeForm.chain || storeForm.name,
        branchName: storeForm.branchName,
        type: storeForm.type,
        color: storeForm.color,
      };
      setStores([...stores, newStore]);
      setFeedback(`Added new store "${storeForm.name}" to directory.`);
    }

    setIsStoreModalOpen(false);
    setTimeout(() => setFeedback(null), 4000);
  };

  // Save Category Weight adjustment
  const handleSaveCategoryWeight = () => {
    if (!editingCategory) return;
    const weightNum = parseFloat(categoryWeightInput);
    if (!isNaN(weightNum) && weightNum > 0) {
      if (CATEGORY_METADATA[editingCategory.key]) {
        CATEGORY_METADATA[editingCategory.key].inflationBasketWeight = weightNum;
      }
      setFeedback(`Updated inflation basket weight for "${editingCategory.name}" to ${(weightNum * 100).toFixed(0)}%.`);
    }
    setEditingCategory(null);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Back and Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/moderation"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white border border-slate-200/80 transition-all shadow-2xs"
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Taxonomy & Master Directories</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Stores & Category Taxonomy
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              Configure retailer store directories, category taxonomy definitions, measurement units, and Laspeyres inflation index weights.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('stores')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
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
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
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

      {/* Feedback Banner */}
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

      {/* TAB 1: STORES DIRECTORY */}
      {activeTab === 'stores' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Configured Retailers & Chains ({stores.length})
            </h3>

            <Button
              variant="primary"
              size="sm"
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
                            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shrink-0"
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
                          <span className="font-mono text-slate-600 font-medium">
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
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
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
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Canonical Product Categories & Index Weights
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.entries(CATEGORY_METADATA).map(([catKey, meta]) => {
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
                      <h4 className="text-base font-bold text-slate-900">
                        {meta.displayName}
                      </h4>
                      <Badge variant="category" size="sm">
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
                      <strong className="font-mono text-indigo-600 font-bold text-sm">
                        {(meta.inflationBasketWeight * 100).toFixed(0)}%
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
                      className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors border border-slate-200/80 flex items-center justify-center gap-1.5"
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
              size="sm"
              onClick={() => setIsStoreModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveStore}
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >
              {editingStore ? 'Update Store' : 'Create Store'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveStore} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Retailer Store Name
            </label>
            <Input
              type="text"
              required
              placeholder="e.g. Target Supercenter"
              value={storeForm.name}
              onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Chain Parent
              </label>
              <Input
                type="text"
                placeholder="e.g. Target"
                value={storeForm.chain}
                onChange={(e) => setStoreForm({ ...storeForm, chain: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Store Type
              </label>
              <select
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
              <label className="text-xs font-bold text-slate-700">
                Branch Location / Subtitle
              </label>
              <Input
                type="text"
                placeholder="e.g. Downtown Metro"
                value={storeForm.branchName}
                onChange={(e) => setStoreForm({ ...storeForm, branchName: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Brand Accent Color Hex
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={storeForm.color}
                  onChange={(e) => setStoreForm({ ...storeForm, color: e.target.value })}
                  className="w-10 h-10 rounded-xl border border-slate-200 p-0.5 cursor-pointer"
                />
                <Input
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
                size="sm"
                onClick={() => setEditingCategory(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveCategoryWeight}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Save Weight
              </Button>
            </div>
          }
        >
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Laspeyres Basket Weight (0.01 - 1.00):
              </label>
              <Input
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
