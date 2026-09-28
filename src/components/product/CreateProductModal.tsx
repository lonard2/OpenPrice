'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  PlusCircle,
  Tag,
  Building2,
  Calendar,
  FileText,
  DollarSign,
  Sparkles,
  Image as ImageIcon,
  AlertCircle,
  Barcode,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useTranslation } from '@/components/providers/LocaleContext';
import {
  getStoredCategoryMetadata,
  getStoredStores,
  saveCustomProduct,
  savePriceSubmission,
  addKarmaPoints,
  saveStore,
} from '@/lib/storage';
import type { Product, Store, ProductCategory } from '@/types';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newProduct: Product) => void;
  initialCategory?: ProductCategory;
  initialName?: string;
}

export function CreateProductModal({
  isOpen,
  onClose,
  onSuccess,
  initialCategory,
  initialName = '',
}: CreateProductModalProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Loaded metadata and stores
  const [categories, setCategories] = useState<Record<string, { id: string; displayName: string; standardUnits?: string[] }>>({});
  const [stores, setStores] = useState<Store[]>([]);

  // Form State
  const [name, setName] = useState(initialName);
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<ProductCategory>(initialCategory || 'groceries');
  const [unit, setUnit] = useState('each');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [barcode, setBarcode] = useState('');

  // Initial Price State
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [storeId, setStoreId] = useState('');
  const [customStoreName, setCustomStoreName] = useState('');
  const [isCustomStore, setIsCustomStore] = useState(false);
  const [observedDate, setObservedDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync initial metadata and stores when opened
  useEffect(() => {
    if (isOpen) {
      const meta = getStoredCategoryMetadata();
      setCategories(meta);
      const loadedStores = getStoredStores();
      setStores(loadedStores);

      if (loadedStores.length > 0 && !storeId) {
        setStoreId(loadedStores[0].id);
      }

      if (initialCategory && meta[initialCategory]) {
        setCategory(initialCategory);
        if (meta[initialCategory].standardUnits?.[0]) {
          setUnit(meta[initialCategory].standardUnits[0]);
        }
      } else if (meta.groceries?.standardUnits?.[0]) {
        setUnit(meta.groceries.standardUnits[0]);
      }

      if (initialName) {
        setName(initialName);
      }

      setValidationError(null);

      // Focus first input after modal opens
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialCategory, initialName]);

  // Keyboard accessibility (Escape to close, Cmd+Enter to submit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, name, price, category, unit, brand, storeId, customStoreName, isCustomStore, onClose]);

  // Update default unit when category changes if user hasn't heavily customized
  const handleCategoryChange = (newCat: ProductCategory) => {
    setCategory(newCat);
    const catMeta = categories[newCat];
    if (catMeta?.standardUnits && catMeta.standardUnits.length > 0) {
      setUnit(catMeta.standardUnits[0]);
    }
  };

  const activeCategoryMeta = categories[category];
  const unitPresets = activeCategoryMeta?.standardUnits || ['each', 'unit', 'pack'];

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setValidationError(null);

    // Validate Name
    const trimmedName = name.trim();
    if (!trimmedName) {
      setValidationError('Please enter a product name.');
      return;
    }

    // Validate Price
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setValidationError('Please enter a valid price greater than $0.00.');
      return;
    }

    const numericOriginalPrice = originalPrice ? parseFloat(originalPrice) : undefined;
    if (numericOriginalPrice !== undefined && (isNaN(numericOriginalPrice) || numericOriginalPrice <= 0)) {
      setValidationError('Original price must be a valid positive number if provided.');
      return;
    }

    setIsSubmitting(true);

    try {
      const nowIso = new Date().toISOString();
      const productId = `prod-custom-${Date.now()}`;

      // Handle store selection or custom store creation
      let targetStoreId = storeId;
      let targetStoreName = 'Target';

      if (isCustomStore && customStoreName.trim()) {
        const newStoreId = `store-custom-${Date.now()}`;
        const newStoreObj: Store = {
          id: newStoreId,
          name: customStoreName.trim(),
          chain: 'Independent / Direct',
          branchName: 'User Added Store',
          type: 'physical',
          city: 'Local',
          state: 'Regional',
          color: '#6366F1',
          isVerified: false,
        };
        saveStore(newStoreObj);
        targetStoreId = newStoreId;
        targetStoreName = customStoreName.trim();
      } else {
        const found = stores.find((s) => s.id === storeId);
        if (found) {
          targetStoreName = found.name;
        }
      }

      // Calculate price delta if originalPrice is provided
      let priceDeltaPercent = 0.0;
      let priceDeltaAmount = 0.0;
      let trendStatus: Product['trendStatus'] = 'new';

      if (numericOriginalPrice && numericOriginalPrice > numericPrice) {
        priceDeltaAmount = -(numericOriginalPrice - numericPrice);
        priceDeltaPercent = -Number((((numericOriginalPrice - numericPrice) / numericOriginalPrice) * 100).toFixed(1));
        trendStatus = 'price_drop';
      } else if (numericOriginalPrice && numericOriginalPrice < numericPrice) {
        priceDeltaAmount = numericPrice - numericOriginalPrice;
        priceDeltaPercent = Number((((numericPrice - numericOriginalPrice) / numericOriginalPrice) * 100).toFixed(1));
        trendStatus = 'price_hike';
      }

      // 1. Construct new Product
      const newProduct: Product = {
        id: productId,
        name: trimmedName,
        brand: brand.trim() || 'Generic / Direct',
        category,
        unit: unit.trim() || 'each',
        description: description.trim() || `${trimmedName} tracked on OpenPrice`,
        imageUrl:
          imageUrl.trim() ||
          'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
        currentLowestPrice: numericPrice,
        currentHighestPrice: numericPrice,
        averagePrice: numericPrice,
        previousPrice: numericOriginalPrice || numericPrice,
        trendStatus,
        priceDeltaPercent,
        priceDeltaAmount,
        trackedStoresCount: 1,
        totalSubmissionsCount: 1,
        tags: [
          category.toLowerCase(),
          brand.trim().toLowerCase() || 'generic',
          'community-created',
        ],
        isVerified: true,
        createdAt: nowIso,
        updatedAt: nowIso,
        historicalPrices: [],
      };

      // 2. Persist Product
      saveCustomProduct(newProduct);

      // 3. Construct and persist initial PricePoint
      savePriceSubmission({
        productId,
        price: numericPrice,
        originalPrice: numericOriginalPrice,
        storeId: targetStoreId,
        storeName: targetStoreName,
        unit: newProduct.unit,
        sourceType: 'manual',
        proofImageUrl: undefined,
        notes: notes.trim() || 'Initial catalog creation observation',
        timestamp: observedDate ? new Date(observedDate + 'T12:00:00Z').toISOString() : nowIso,
      });

      // 4. Award Contributor Discovery Karma (+25 Points)
      addKarmaPoints(25, `Catalog Discovery: Added ${trimmedName}`);

      // 5. Notify reactive listeners across application
      window.dispatchEvent(
        new CustomEvent('openprice:product-created', { detail: newProduct })
      );

      showToast({
        type: 'success',
        message: t('createSuccessTitle'),
        description: t('createSuccessDescription'),
      });

      if (onSuccess) {
        onSuccess(newProduct);
      }

      onClose();
    } catch {
      setValidationError('Failed to save product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-product-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden my-6 animate-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="create-product-title" className="text-base sm:text-lg font-bold text-slate-900">
                {t('createModalTitle')}
              </h2>
              <p className="text-xs text-slate-500 line-clamp-1">
                {t('createModalSubtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors touch-target min-h-[44px] min-w-[44px]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div
            role="alert"
            className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200/90 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-semibold">{validationError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section 1: Specifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-600" />
                {t('productDetailsTab')}
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                Specification & Classification
              </span>
            </div>

            {/* Product Name */}
            <div className="space-y-1.5">
              <label htmlFor="create-product-name" className="text-xs font-bold text-slate-700">
                {t('nameLabel')} <span className="text-rose-500">*</span>
              </label>
              <Input
                id="create-product-name"
                ref={firstInputRef}
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder={t('namePlaceholder')}
              />
            </div>

            {/* Brand & Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="create-product-brand" className="text-xs font-bold text-slate-700">
                  {t('brandLabel')}
                </label>
                <Input
                  id="create-product-brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder={t('brandPlaceholder')}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="create-product-category" className="text-xs font-bold text-slate-700">
                  {t('categoryLabel')} <span className="text-rose-500">*</span>
                </label>
                <select
                  id="create-product-category"
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value as ProductCategory)}
                  className="w-full min-h-[44px] px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {Object.values(categories).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.displayName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Measurement Unit & Category Preset Pills */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label htmlFor="create-product-unit" className="text-xs font-bold text-slate-700">
                  {t('unitLabel')} <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-500">
                  {t('unitPresetHint')}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-1">
                {unitPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setUnit(preset)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors touch-target min-h-[32px] ${
                      unit === preset
                        ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <Input
                id="create-product-unit"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder={t('unitPlaceholder')}
              />
            </div>

            {/* Optional Description */}
            <div className="space-y-1.5">
              <label htmlFor="create-product-desc" className="text-xs font-bold text-slate-700">
                {t('descriptionLabel')}
              </label>
              <textarea
                id="create-product-desc"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('descriptionPlaceholder')}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
              />
            </div>

            {/* Barcode & Image URL Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="create-product-barcode" className="text-xs font-bold text-slate-700">
                  {t('barcodeLabel')}
                </label>
                <Input
                  id="create-product-barcode"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder={t('barcodePlaceholder')}
                  leftIcon={<Barcode className="w-4 h-4 text-slate-400" />}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="create-product-image" className="text-xs font-bold text-slate-700">
                  {t('imageUrlLabel')}
                </label>
                <Input
                  id="create-product-image"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder={t('imageUrlPlaceholder')}
                  leftIcon={<ImageIcon className="w-4 h-4 text-slate-400" />}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Observation */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                {t('pricingTab')}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                +25 Karma Discovery
              </span>
            </div>

            {/* Price Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="create-product-price" className="text-xs font-bold text-slate-700">
                  {t('priceLabel')} <span className="text-rose-500">*</span>
                </label>
                <Input
                  id="create-product-price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="0.00"
                  leftIcon={<DollarSign className="w-4 h-4 text-slate-400" />}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="create-product-original-price" className="text-xs font-bold text-slate-700">
                  {t('originalPriceLabel')}
                </label>
                <Input
                  id="create-product-original-price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="0.00"
                  leftIcon={<DollarSign className="w-4 h-4 text-slate-400" />}
                />
                <p className="text-[10px] text-slate-500">
                  {t('originalPriceHint')}
                </p>
              </div>
            </div>

            {/* Store & Date Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="create-product-store" className="text-xs font-bold text-slate-700">
                    {t('storeLabel')} <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomStore(!isCustomStore)}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    {isCustomStore ? 'Select Existing Store' : '+ Custom Store'}
                  </button>
                </div>

                {isCustomStore ? (
                  <Input
                    id="create-product-custom-store"
                    required
                    value={customStoreName}
                    onChange={(e) => setCustomStoreName(e.target.value)}
                    placeholder="Enter store or dealer name..."
                    leftIcon={<Building2 className="w-4 h-4 text-slate-400" />}
                  />
                ) : (
                  <select
                    id="create-product-store"
                    value={storeId}
                    onChange={(e) => setStoreId(e.target.value)}
                    className="w-full min-h-[44px] px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.branchName})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="create-product-date" className="text-xs font-bold text-slate-700">
                  {t('observedDateLabel')} <span className="text-rose-500">*</span>
                </label>
                <Input
                  id="create-product-date"
                  type="date"
                  required
                  value={observedDate}
                  onChange={(e) => setObservedDate(e.target.value)}
                  leftIcon={<Calendar className="w-4 h-4 text-slate-400" />}
                />
              </div>
            </div>

            {/* Observation Notes */}
            <div className="space-y-1.5">
              <label htmlFor="create-product-notes" className="text-xs font-bold text-slate-700">
                {t('notesLabel')}
              </label>
              <Input
                id="create-product-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('notesPlaceholder')}
                leftIcon={<FileText className="w-4 h-4 text-slate-400" />}
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              className="w-full sm:w-auto min-h-[44px] touch-target"
            >
              {t('cancelButton')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              className="w-full sm:w-auto min-h-[44px] touch-target font-bold"
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              <span>{t('createProductButton')}</span>
              <kbd className="hidden sm:inline-flex items-center ml-2 px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded bg-white/20 text-white border border-white/30">
                ⌘ Enter
              </kbd>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
