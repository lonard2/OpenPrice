'use client';

import React, { useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  Link as LinkIcon,
  Layers,
  Save,
  CheckSquare,
  Square,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { Badge } from '../ui/Badge.tsx';
import { cn } from '../../lib/utils.ts';
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

  // Auto-scroll table row into view when selectedItemId changes
  useEffect(() => {
    if (selectedItemId && rowRefs.current[selectedItemId]) {
      rowRefs.current[selectedItemId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedItemId]);

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

  const handleToggleSelect = (tempId: string) => {
    const updated = items.map((item) => {
      if (item.tempId === tempId) {
        return { ...item, selected: !item.selected };
      }
      return item;
    });
    onItemsChange(updated);
  };

  const handleSelectAll = (select: boolean) => {
    const updated = items.map((item) => ({ ...item, selected: select }));
    onItemsChange(updated);
  };

  const handleDeleteItem = (tempId: string) => {
    const updated = items.filter((item) => item.tempId !== tempId);
    onItemsChange(updated);
    if (selectedItemId === tempId) {
      onItemSelect?.('');
    }
  };

  const handleAddItem = () => {
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
  };

  const selectedItems = items.filter((item) => item.selected);
  const allSelected = items.length > 0 && selectedItems.length === items.length;

  return (
    <div className={cn('w-full flex flex-col gap-4 bg-white rounded-3xl border border-slate-200/90 p-5 shadow-surface', className)}>
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

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSelectAll(!allSelected)}
            leftIcon={allSelected ? <Square className="w-3.5 h-3.5" /> : <CheckSquare className="w-3.5 h-3.5" />}
          >
            {allSelected ? 'Deselect All' : 'Select All'}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddItem}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Item
          </Button>

          {onSaveSelected && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isSaving}
              disabled={selectedItems.length === 0}
              onClick={() => onSaveSelected(selectedItems)}
              leftIcon={<Save className="w-3.5 h-3.5" />}
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
        /* Responsive Table */
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
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
                      className="py-3 px-3 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSelect(item.tempId);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => handleToggleSelect(item.tempId)}
                        aria-label={`Select ${item.name}`}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      />
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
                          className="w-full font-semibold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:outline-none px-1.5 py-0.5 rounded transition-all text-xs"
                        />
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
                        className="w-full bg-white border border-slate-200/90 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 capitalize"
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
                      <div className="relative inline-flex items-center">
                        <span className="absolute left-2 text-slate-400 text-xs">$</span>
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
                          className="w-20 pl-5 pr-2 py-1 text-right font-mono tabular-nums text-xs font-bold text-slate-900 bg-white border border-slate-200/90 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </td>

                    {/* Original Was Price Input */}
                    <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-flex items-center">
                        <span className="absolute left-2 text-slate-400 text-xs">$</span>
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
                          className="w-20 pl-5 pr-2 py-1 text-right font-mono tabular-nums text-xs text-slate-500 bg-white border border-slate-200/90 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
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
                        className="w-20 px-2 py-1 text-xs text-slate-700 bg-white border border-slate-200/90 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors focus:outline-none focus:ring-1 focus:ring-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
