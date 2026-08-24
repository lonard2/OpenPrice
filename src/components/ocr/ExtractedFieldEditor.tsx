'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Link as LinkIcon,
  Layers,
  Save,
  CheckSquare,
  Square,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { Badge } from '../ui/Badge.tsx';
import { cn } from '../../lib/utils.ts';
import { formatCurrency } from '../../lib/formatters.ts';
import type { ExtractedPriceItem, ProductCategory } from '../../types/index.ts';
import { CATEGORY_METADATA, SEED_PRODUCTS } from '../../lib/mock-data.ts';

export interface ExtractedFieldEditorProps {
  items: ExtractedPriceItem[];
  selectedItemId?: string | null;
  hoveredItemId?: string | null;
  onItemsChange: (items: ExtractedPriceItem[]) => void;
  onItemSelect?: (tempId: string) => void;
  onItemHover?: (tempId: string | null) => void;
  onSaveSelected?: (selectedItems: ExtractedPriceItem[]) => void;
  isSaving?: boolean;
  className?: string;
}

const CATEGORIES: ProductCategory[] = [
  'groceries',
  'beverages',
  'household',
  'pharmacy',
  'electronics',
  'apparel',
  'services',
];

export function ExtractedFieldEditor({
  items,
  selectedItemId,
  hoveredItemId,
  onItemsChange,
  onItemSelect,
  onItemHover,
  onSaveSelected,
  isSaving = false,
  className,
}: ExtractedFieldEditorProps) {
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('');

  // Auto-scroll table row into view when selectedItemId changes
  useEffect(() => {
    if (selectedItemId && rowRefs.current[selectedItemId]) {
      rowRefs.current[selectedItemId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedItemId]);

  // Announce active item selection to screen readers
  useEffect(() => {
    if (!selectedItemId) return;
    const idx = items.findIndex((i) => i.tempId === selectedItemId);
    if (idx !== -1) {
      const item = items[idx];
      setLiveAnnouncement(
        `Selected ${item.name || 'unnamed item'}, price ${formatCurrency(item.price || 0)}, ${Math.round((item.confidence || 1) * 100)}% confidence, row ${idx + 1} of ${items.length}.`
      );
    }
  }, [selectedItemId, items]);

  const handleFieldChange = <K extends keyof ExtractedPriceItem>(
    tempId: string,
    field: K,
    value: ExtractedPriceItem[K]
  ) => {
    const updated = items.map((item) => {
      if (item.tempId === tempId) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onItemsChange(updated);
  };

  const handleToggleSelect = useCallback(
    (tempId: string) => {
      const target = items.find((i) => i.tempId === tempId);
      const updated = items.map((item) => {
        if (item.tempId === tempId) {
          return { ...item, selected: !item.selected };
        }
        return item;
      });
      onItemsChange(updated);
      if (target) {
        setLiveAnnouncement(
          `${target.name || 'Item'} ${!target.selected ? 'included in' : 'removed from'} batch selection.`
        );
      }
    },
    [items, onItemsChange]
  );

  const handleSelectAll = (select: boolean) => {
    const updated = items.map((item) => ({ ...item, selected: select }));
    onItemsChange(updated);
    setLiveAnnouncement(select ? `Selected all ${items.length} items.` : 'Deselected all items.');
  };

  const handleDeleteItem = useCallback(
    (tempId: string) => {
      const target = items.find((i) => i.tempId === tempId);
      const updated = items.filter((item) => item.tempId !== tempId);
      onItemsChange(updated);
      if (selectedItemId === tempId) {
        onItemSelect?.('');
      }
      setLiveAnnouncement(`Deleted ${target?.name || 'item'}. ${updated.length} items remaining.`);
    },
    [items, onItemsChange, selectedItemId, onItemSelect]
  );

  const handleAddItem = useCallback(() => {
    const newItem: ExtractedPriceItem = {
      tempId: `custom-item-${Date.now()}`,
      name: 'New Product Item',
      category: 'groceries',
      price: 0.99,
      unit: 'each',
      confidence: 1.0,
      selected: true,
    };
    onItemsChange([...items, newItem]);
    onItemSelect?.(newItem.tempId);
    setLiveAnnouncement(`Added new row. Total ${items.length + 1} items.`);
  }, [items, onItemsChange, onItemSelect]);

  const getItemErrors = useCallback((item: ExtractedPriceItem) => {
    const errors: { name?: string; price?: string; originalPrice?: string } = {};
    if (!item.name || !item.name.trim()) {
      errors.name = 'Name is required';
    }
    if (isNaN(item.price) || item.price <= 0) {
      errors.price = 'Price must be > $0';
    }
    if (item.originalPrice !== undefined && (isNaN(item.originalPrice) || item.originalPrice <= 0)) {
      errors.originalPrice = 'Must be > $0';
    }
    return errors;
  }, []);

  const getPriceDeviationHint = useCallback((item: ExtractedPriceItem) => {
    if (!item.matchedProductId || isNaN(item.price) || item.price <= 0) return null;
    const product = SEED_PRODUCTS.find((p) => p.id === item.matchedProductId);
    if (!product) return null;
    const baseline = product.averagePrice || product.currentLowestPrice;
    if (!baseline || baseline <= 0) return null;

    if (item.price >= baseline * 1.6) {
      return {
        type: 'high',
        baseline,
        message: `Typical is ~${formatCurrency(baseline)}. Check for decimal typo.`,
      };
    }
    if (item.price <= baseline * 0.45) {
      return {
        type: 'low',
        baseline,
        message: `Typical is ~${formatCurrency(baseline)}. Check unit quantity.`,
      };
    }
    return null;
  }, []);

  const selectedItems = items.filter((item) => item.selected);
  const allSelected = items.length > 0 && selectedItems.length === items.length;

  const hasInvalidSelectedItems = selectedItems.some((item) => {
    const errs = getItemErrors(item);
    return Object.keys(errs).length > 0;
  });

  // Power contributor keyboard accelerators (J/K navigate, Space toggle, Cmd+Enter save, A add)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputFocused = ['INPUT', 'TEXTAREA', 'SELECT'].includes(
        (e.target as HTMLElement)?.tagName
      );

      // Cmd+Enter or Ctrl+Enter to batch save selected items
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (selectedItems.length > 0 && onSaveSelected && !isSaving && !hasInvalidSelectedItems) {
          setLiveAnnouncement(`Saving ${selectedItems.length} verified items to ledger.`);
          onSaveSelected(selectedItems);
        }
        return;
      }

      // If user is editing a form field, don't hijack J/K/Space/A/D
      if (isInputFocused) return;

      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (items.length === 0) return;
        const currentIndex = items.findIndex((i) => i.tempId === selectedItemId);
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        onItemSelect?.(items[nextIndex].tempId);
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (items.length === 0) return;
        const currentIndex = items.findIndex((i) => i.tempId === selectedItemId);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        onItemSelect?.(items[prevIndex].tempId);
      } else if (e.key === ' ' || e.key === 'x') {
        e.preventDefault();
        if (selectedItemId) {
          handleToggleSelect(selectedItemId);
        }
      } else if (e.key === 'a') {
        e.preventDefault();
        handleAddItem();
      } else if (e.key === 'd' || e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (selectedItemId) {
          handleDeleteItem(selectedItemId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    items,
    selectedItemId,
    selectedItems,
    onSaveSelected,
    isSaving,
    hasInvalidSelectedItems,
    handleToggleSelect,
    handleAddItem,
    handleDeleteItem,
    onItemSelect,
  ]);

  return (
    <div className={cn('w-full flex flex-col gap-4 bg-white rounded-3xl border border-slate-200/90 p-5 shadow-surface', className)}>
      {/* Screen Reader Live Region */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {liveAnnouncement}
      </div>

      {/* Header & Bulk Selection Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
            {items.length}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 leading-tight">
              Extracted Line Items
            </h4>
            <p className="text-xs text-slate-500">
              {selectedItems.length} of {items.length} items selected for ingestion
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hasInvalidSelectedItems && selectedItems.length > 0 && (
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              Fix invalid rows before saving
            </span>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSelectAll(!allSelected)}
            leftIcon={allSelected ? <Square className="w-3.5 h-3.5" /> : <CheckSquare className="w-3.5 h-3.5" />}
            className="min-h-[44px] touch-target"
          >
            {allSelected ? 'Deselect All' : 'Select All'}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddItem}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="min-h-[44px] touch-target"
          >
            Add Item
          </Button>

          {onSaveSelected && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isSaving}
              disabled={selectedItems.length === 0 || hasInvalidSelectedItems}
              onClick={() => !hasInvalidSelectedItems && onSaveSelected(selectedItems)}
              leftIcon={<Save className="w-3.5 h-3.5" />}
              className="min-h-[44px] touch-target"
            >
              Save ({selectedItems.length})
            </Button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
          <Layers className="w-10 h-10 text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">No items extracted</p>
          <p className="text-xs text-slate-500 max-w-xs">
            Upload a store photo or click &quot;Add Item&quot; to manually record price observations.
          </p>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleAddItem}
            leftIcon={<Plus className="w-4 h-4" />}
            className="mt-2"
          >
            Add Manual Item
          </Button>
        </div>
      ) : (
        <>
          {/* Mobile Adaptive Card Stack (<640px) */}
          <div className="space-y-3 block sm:hidden">
            {items.map((item, idx) => {
              const isSelected = selectedItemId === item.tempId;
              const isHovered = hoveredItemId === item.tempId;
              const isActive = isSelected || isHovered;
              const matchedProduct = item.matchedProductId
                ? SEED_PRODUCTS.find((p) => p.id === item.matchedProductId)
                : null;
              const confidencePct = Math.round(item.confidence * 100);
              const errors = getItemErrors(item);
              const priceHint = getPriceDeviationHint(item);

              return (
                <div
                  key={item.tempId}
                  onClick={() => onItemSelect?.(item.tempId)}
                  className={cn(
                    'p-4 rounded-2xl border transition-all duration-150 space-y-3 bg-white text-left',
                    isActive
                      ? 'border-indigo-400 ring-2 ring-indigo-500/20 bg-indigo-50/30'
                      : 'border-slate-200/90 shadow-2xs'
                  )}
                >
                  {/* Top Bar: Checkbox + Status Tag + Delete */}
                  <div className="flex items-center justify-between gap-2">
                    <label
                      className="inline-flex items-center gap-2 cursor-pointer touch-target min-h-[44px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => handleToggleSelect(item.tempId)}
                        aria-label={`Select ${item.name}`}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-700">
                        Item {idx + 1}
                      </span>
                    </label>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {confidencePct >= 90 ? (
                        <Badge variant="verified" size="sm">
                          {confidencePct}%
                        </Badge>
                      ) : confidencePct >= 70 ? (
                        <Badge variant="pending" size="sm">
                          {confidencePct}%
                        </Badge>
                      ) : (
                        <Badge variant="outlier" size="sm" icon={<AlertTriangle className="w-3 h-3 text-rose-600" />}>
                          {confidencePct}%
                        </Badge>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.tempId)}
                        aria-label={`Delete ${item.name}`}
                        className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors touch-target"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Name & Brand */}
                  <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
                    <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleFieldChange(item.tempId, 'name', e.target.value)}
                      placeholder="Product Name"
                      aria-label="Product Name"
                      aria-invalid={!!errors.name}
                      className={cn(
                        'w-full font-semibold bg-white border rounded-xl focus:outline-none px-3 py-2 text-xs min-h-[44px]',
                        errors.name
                          ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:border-rose-500'
                          : 'border-slate-200/90 text-slate-900 focus:border-indigo-500'
                      )}
                    />
                    {errors.name && (
                      <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        {errors.name}
                      </span>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={item.brand || ''}
                        onChange={(e) => handleFieldChange(item.tempId, 'brand', e.target.value)}
                        placeholder="Brand (optional)"
                        aria-label="Brand"
                        className="text-xs text-slate-700 bg-white border border-slate-200/90 focus:border-indigo-500 focus:outline-none px-3 py-1.5 rounded-xl flex-1 min-h-[38px]"
                      />
                      {matchedProduct && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-indigo-600 font-medium bg-indigo-50 border border-indigo-200/80 px-2 py-1.5 rounded-xl truncate max-w-[140px]" title={`Matched to catalog: ${matchedProduct.name}`}>
                          <LinkIcon className="w-3 h-3 shrink-0" />
                          {matchedProduct.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing & Category Grid */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1" onClick={(e) => e.stopPropagation()}>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1">
                        Price ($)
                      </label>
                      <div className="relative flex items-center">
                        <span className={cn('absolute left-2.5 text-xs font-semibold', errors.price ? 'text-rose-500' : 'text-slate-500')}>$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.price}
                          onChange={(e) =>
                            handleFieldChange(
                              item.tempId,
                              'price',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          aria-label="Current Price"
                          aria-invalid={!!errors.price}
                          className={cn(
                            'w-full pl-6 pr-2.5 py-2 font-mono tabular-nums text-xs font-bold bg-white border rounded-xl focus:outline-none min-h-[44px]',
                            errors.price
                              ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:border-rose-500'
                              : 'border-slate-200/90 text-slate-900 focus:ring-1 focus:ring-indigo-500'
                          )}
                        />
                      </div>
                      {errors.price ? (
                        <span className="text-[10px] font-semibold text-rose-600 mt-1 block">
                          {errors.price}
                        </span>
                      ) : priceHint ? (
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded flex items-center gap-1 mt-1">
                          <AlertTriangle className="w-2.5 h-2.5 shrink-0 text-amber-600" />
                          {priceHint.message}
                        </span>
                      ) : null}
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1">
                        Was ($)
                      </label>
                      <div className="relative flex items-center">
                        <span className={cn('absolute left-2.5 text-xs font-semibold', errors.originalPrice ? 'text-rose-500' : 'text-slate-500')}>$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.originalPrice ?? ''}
                          onChange={(e) =>
                            handleFieldChange(
                              item.tempId,
                              'originalPrice',
                              e.target.value ? parseFloat(e.target.value) : undefined
                            )
                          }
                          placeholder="—"
                          aria-label="Original Price"
                          aria-invalid={!!errors.originalPrice}
                          className={cn(
                            'w-full pl-6 pr-2.5 py-2 font-mono tabular-nums text-xs bg-white border rounded-xl focus:outline-none min-h-[44px]',
                            errors.originalPrice
                              ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:border-rose-500'
                              : 'border-slate-200/90 text-slate-500 focus:ring-1 focus:ring-indigo-500'
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1">
                        Category
                      </label>
                      <select
                        value={item.category || 'groceries'}
                        onChange={(e) => handleFieldChange(item.tempId, 'category', e.target.value as ProductCategory)}
                        aria-label="Category"
                        className="w-full bg-white border border-slate-200/90 rounded-xl px-2.5 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 capitalize min-h-[44px]"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {CATEGORY_METADATA[cat]?.displayName || cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1">
                        Unit
                      </label>
                      <input
                        type="text"
                        value={item.unit || ''}
                        onChange={(e) => handleFieldChange(item.tempId, 'unit', e.target.value)}
                        placeholder="each, 1 lb"
                        aria-label="Unit"
                        className="w-full px-2.5 py-2 text-xs text-slate-700 bg-white border border-slate-200/90 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[44px]"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop High-Density Table (>=640px) */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 hidden sm:block">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200/80 text-[11px]">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <span className="sr-only">Select</span>
                </th>
                <th className="py-3 px-3 min-w-[200px]">Product Name & Brand</th>
                <th className="py-3 px-3 min-w-[130px]">Category</th>
                <th className="py-3 px-3 min-w-[100px] text-right">Price ($)</th>
                <th className="py-3 px-3 min-w-[100px] text-right">Was ($)</th>
                <th className="py-3 px-3 min-w-[90px]">Unit</th>
                <th className="py-3 px-3 min-w-[110px] text-center">Confidence</th>
                <th className="py-3 px-3 w-12 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => {
                const isSelected = selectedItemId === item.tempId;
                const isHovered = hoveredItemId === item.tempId;
                const isActive = isSelected || isHovered;

                const matchedProduct = item.matchedProductId
                  ? SEED_PRODUCTS.find((p) => p.id === item.matchedProductId)
                  : null;

                const confidencePct = Math.round(item.confidence * 100);
                const errors = getItemErrors(item);
                const priceHint = getPriceDeviationHint(item);

                return (
                  <tr
                    key={item.tempId}
                    ref={(el) => {
                      rowRefs.current[item.tempId] = el;
                    }}
                    onClick={() => onItemSelect?.(item.tempId)}
                    onMouseEnter={() => onItemHover?.(item.tempId)}
                    onMouseLeave={() => onItemHover?.(null)}
                    className={cn(
                      'transition-colors duration-150 cursor-pointer',
                      isActive ? 'bg-indigo-50/70' : 'hover:bg-slate-50/70',
                      isSelected && 'ring-1 ring-inset ring-indigo-500'
                    )}
                  >
                    {/* Checkbox */}
                    <td
                      className="py-2 px-1 sm:px-3 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSelect(item.tempId);
                      }}
                    >
                      <label className="w-10 h-10 inline-flex items-center justify-center cursor-pointer touch-target">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => handleToggleSelect(item.tempId)}
                          aria-label={`Select ${item.name}`}
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                        />
                      </label>
                    </td>

                    {/* Product Name & Brand */}
                    <td className="py-3 px-3">
                      <div className="flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleFieldChange(item.tempId, 'name', e.target.value)}
                          placeholder="Product Name"
                          aria-label="Product Name"
                          aria-invalid={!!errors.name}
                          className={cn(
                            'w-full font-semibold bg-transparent border-b hover:border-slate-300 focus:bg-white focus:outline-none px-1.5 py-1 rounded transition-all text-xs min-h-[36px]',
                            errors.name
                              ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:border-rose-500'
                              : 'border-transparent text-slate-900 focus:border-indigo-500'
                          )}
                        />
                        {errors.name && (
                          <span className="text-[10px] font-semibold text-rose-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
                            {errors.name}
                          </span>
                        )}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item.brand || ''}
                            onChange={(e) => handleFieldChange(item.tempId, 'brand', e.target.value)}
                            placeholder="Brand (optional)"
                            aria-label="Brand"
                            className="text-[11px] text-slate-500 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:outline-none px-1.5 py-0.5 rounded transition-all w-28"
                          />
                          {matchedProduct && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-indigo-600 font-medium bg-indigo-50 border border-indigo-200/80 px-1.5 py-0.5 rounded-md truncate max-w-[140px]" title={`Matched to catalog: ${matchedProduct.name}`}>
                              <LinkIcon className="w-2.5 h-2.5 shrink-0" />
                              Catalog: {matchedProduct.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category Selector */}
                    <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={item.category || 'groceries'}
                        onChange={(e) => handleFieldChange(item.tempId, 'category', e.target.value as ProductCategory)}
                        aria-label="Category"
                        className="w-full bg-white border border-slate-200/90 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 capitalize min-h-[36px]"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {CATEGORY_METADATA[cat]?.displayName || cat}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Price Input */}
                    <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col items-end">
                        <div className="relative inline-flex items-center">
                          <span className={cn('absolute left-2 text-xs font-semibold', errors.price ? 'text-rose-500' : 'text-slate-500')}>$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.price}
                            onChange={(e) =>
                              handleFieldChange(
                                item.tempId,
                                'price',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            aria-label="Current Price"
                            aria-invalid={!!errors.price}
                            className={cn(
                              'w-20 pl-5 pr-2 py-1 text-right font-mono tabular-nums text-xs font-bold bg-white border rounded-lg focus:outline-none min-h-[36px]',
                              errors.price
                                ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:border-rose-500'
                                : 'border-slate-200/90 text-slate-900 focus:ring-1 focus:ring-indigo-500'
                            )}
                          />
                        </div>
                        {errors.price ? (
                          <span className="text-[10px] font-semibold text-rose-600 text-right mt-0.5 whitespace-nowrap">
                            {errors.price}
                          </span>
                        ) : priceHint ? (
                          <span
                            className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded flex items-center gap-1 mt-0.5 whitespace-nowrap"
                            title={priceHint.message}
                          >
                            <AlertTriangle className="w-2.5 h-2.5 shrink-0 text-amber-600" />
                            ~{formatCurrency(priceHint.baseline)} base
                          </span>
                        ) : null}
                      </div>
                    </td>

                    {/* Original Was Price Input */}
                    <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col items-end">
                        <div className="relative inline-flex items-center">
                          <span className={cn('absolute left-2 text-xs font-semibold', errors.originalPrice ? 'text-rose-500' : 'text-slate-500')}>$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.originalPrice ?? ''}
                            onChange={(e) =>
                              handleFieldChange(
                                item.tempId,
                                'originalPrice',
                                e.target.value ? parseFloat(e.target.value) : undefined
                              )
                            }
                            placeholder="—"
                            aria-label="Original Price"
                            aria-invalid={!!errors.originalPrice}
                            className={cn(
                              'w-20 pl-5 pr-2 py-1 text-right font-mono tabular-nums text-xs bg-white border rounded-lg focus:outline-none min-h-[36px]',
                              errors.originalPrice
                                ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:border-rose-500'
                                : 'border-slate-200/90 text-slate-500 focus:ring-1 focus:ring-indigo-500'
                            )}
                          />
                        </div>
                        {errors.originalPrice && (
                          <span className="text-[10px] font-semibold text-rose-600 text-right mt-0.5 whitespace-nowrap">
                            {errors.originalPrice}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Unit */}
                    <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={item.unit || ''}
                        onChange={(e) => handleFieldChange(item.tempId, 'unit', e.target.value)}
                        placeholder="each"
                        aria-label="Unit"
                        className="w-20 px-2 py-1 text-xs text-slate-700 bg-white border border-slate-200/90 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[36px]"
                      />
                    </td>

                    {/* Confidence Badge */}
                    <td className="py-3 px-3 text-center">
                      {confidencePct >= 90 ? (
                        <Badge variant="verified" size="sm">
                          {confidencePct}% High
                        </Badge>
                      ) : confidencePct >= 70 ? (
                        <Badge variant="pending" size="sm">
                          {confidencePct}% Review
                        </Badge>
                      ) : (
                        <Badge variant="outlier" size="sm" icon={<AlertTriangle className="w-3 h-3 text-rose-600" />}>
                          {confidencePct}% Low
                        </Badge>
                      )}
                    </td>

                    {/* Delete Action */}
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.tempId)}
                        aria-label={`Delete ${item.name}`}
                        className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-1 focus:ring-rose-500 touch-target mx-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </>
      )}

      {/* Keyboard Shortcuts & Quick Action Hint Bar */}
      {items.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-slate-700">Keyboard Accelerators:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px] text-slate-700 font-bold">
              J / K
            </kbd>
            <span>Navigate</span>
            <span className="text-slate-300">•</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px] text-slate-700 font-bold">
              Space
            </kbd>
            <span>Toggle</span>
            <span className="text-slate-300">•</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px] text-slate-700 font-bold">
              ⌘↵
            </kbd>
            <span>Batch Save</span>
            <span className="text-slate-300">•</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px] text-slate-700 font-bold">
              A
            </kbd>
            <span>Add Item</span>
          </div>

          <span className="text-slate-600 font-semibold tabular-nums">
            {selectedItems.length} of {items.length} items staged
          </span>
        </div>
      )}
    </div>
  );
}
