'use client';

import React, { useState, useEffect } from 'react';
import {
  Camera,
  FileSpreadsheet,
  Edit3,
  Globe,
  Award,
  Sparkles,
  CheckCircle2,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { useRoleView } from '@/components/providers/RoleContext';
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PhotoUploader } from '@/components/ocr/PhotoUploader';
import { BoundingBoxOverlay } from '@/components/ocr/BoundingBoxOverlay';
import { ExtractedFieldEditor } from '@/components/ocr/ExtractedFieldEditor';
import { PamphletViewer } from '@/components/ocr/PamphletViewer';
import {
  getStoredKarma,
  addKarmaPoints,
  savePriceSubmission,
  getStoredProducts,
  getStoredStores,
  subscribeToStorageChanges,
} from '@/lib/storage';
import { formatCurrency, formatRelativeTime } from '@/lib/formatters';
import type {
  ExtractedPriceItem,
  OcrParseResponse,
  ContributionKarma,
  ProductCategory,
} from '@/types';
import { CATEGORY_METADATA } from '@/lib/mock-data';

const CATEGORIES: ProductCategory[] = [
  'groceries',
  'beverages',
  'household',
  'pharmacy',
  'electronics',
  'apparel',
  'services',
];

export default function ContributePage() {
  const { role, setRole } = useRoleView();
  const [activeTab, setActiveTab] = useState<string>('photo-ocr');
  const [karma, setKarma] = useState<ContributionKarma>(getStoredKarma());
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Tab 1 (Photo OCR) state
  const [ocrImageUrl, setOcrImageUrl] = useState<string>('/samples/shelf-tag-milk.jpg');
  const [extractedItems, setExtractedItems] = useState<ExtractedPriceItem[]>([
    {
      tempId: 'init-1',
      name: 'Organic Whole Milk 1 Gallon',
      category: 'groceries',
      price: 4.89,
      originalPrice: 5.49,
      unit: '1 gal',
      confidence: 0.96,
      selected: true,
      boundingBox: { xMin: 18.5, yMin: 28.0, xMax: 81.5, yMax: 72.0 },
      matchedProductId: 'prod-milk',
    },
  ]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>('init-1');
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [isSavingOcr, setIsSavingOcr] = useState(false);

  // Tab 2 (Flyer) state
  const [flyerItems, setFlyerItems] = useState<ExtractedPriceItem[]>([
    {
      tempId: 'deal-1',
      name: 'Honeycrisp Apples Fresh',
      category: 'groceries',
      price: 1.99,
      originalPrice: 2.99,
      unit: '1 lb',
      confidence: 0.94,
      selected: true,
      boundingBox: { xMin: 8.0, yMin: 12.0, xMax: 46.0, yMax: 48.0 },
      matchedProductId: 'prod-apples',
    },
    {
      tempId: 'deal-2',
      name: 'Fair Trade Dark Roast Coffee Beans',
      category: 'beverages',
      price: 9.99,
      originalPrice: 12.99,
      unit: '12 oz',
      confidence: 0.91,
      selected: true,
      boundingBox: { xMin: 54.0, yMin: 12.0, xMax: 92.0, yMax: 48.0 },
      matchedProductId: 'prod-coffee',
    },
    {
      tempId: 'deal-3',
      name: 'Large Grade A Brown Eggs (12pk)',
      category: 'groceries',
      price: 3.49,
      originalPrice: 4.29,
      unit: 'dozen',
      confidence: 0.95,
      selected: true,
      boundingBox: { xMin: 8.0, yMin: 54.0, xMax: 46.0, yMax: 90.0 },
      matchedProductId: 'prod-eggs',
    },
    {
      tempId: 'deal-4',
      name: 'Artisan Sourdough Loaf Bread',
      category: 'groceries',
      price: 3.99,
      originalPrice: 4.79,
      unit: '24 oz loaf',
      confidence: 0.89,
      selected: true,
      boundingBox: { xMin: 54.0, yMin: 54.0, xMax: 92.0, yMax: 90.0 },
      matchedProductId: 'prod-bread',
    },
  ]);
  const [isImportingFlyer, setIsImportingFlyer] = useState(false);

  // Tab 3 (Manual Form) state
  const [manualForm, setManualForm] = useState({
    productId: 'prod-milk',
    productName: '',
    category: 'groceries' as ProductCategory,
    brand: '',
    storeId: 'store-target',
    price: '4.89',
    originalPrice: '5.29',
    unit: '1 gal',
    proofUrl: '',
    notes: 'Observed in dairy aisle refrigerated section',
  });
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  // Tab 4 (Web URL) state
  const [webUrl, setWebUrl] = useState('https://www.target.com/p/good-gather-organic-whole-milk-1gal/-/A-123456');
  const [isParsingWeb, setIsParsingWeb] = useState(false);
  const [webParsedPreview, setWebParsedPreview] = useState<{
    name: string;
    brand: string;
    category: ProductCategory;
    storeName: string;
    price: number;
    unit: string;
  } | null>(null);

  // Load Karma on storage change
  useEffect(() => {
    const loadKarma = () => setKarma(getStoredKarma());
    loadKarma();
    const unsubscribe = subscribeToStorageChanges(loadKarma);
    return () => unsubscribe();
  }, []);

  const products = getStoredProducts();
  const stores = getStoredStores();

  // OCR Parse Response Callback
  const handleOcrComplete = (res: OcrParseResponse) => {
    if (res.result) {
      if (res.result.extractedItems && res.result.extractedItems.length > 0) {
        setExtractedItems(res.result.extractedItems);
        setSelectedItemId(res.result.extractedItems[0]?.tempId || null);
      }
    }
  };

  // Save OCR extracted items
  const handleSaveOcrItems = (selected: ExtractedPriceItem[]) => {
    setIsSavingOcr(true);
    try {
      let outlierCount = 0;

      selected.forEach((item) => {
        const prodId = item.matchedProductId || products[0]?.id || 'prod-milk';
        const result = savePriceSubmission({
          productId: prodId,
          price: item.price,
          originalPrice: item.originalPrice,
          unit: item.unit,
          sourceType: 'photo_shelf',
          confidenceScore: Math.round(item.confidence * 100),
          proofImageUrl: ocrImageUrl,
          notes: `OCR Shelf Tag parse: ${item.name}`,
        });

        if (result.isOutlier) {
          outlierCount++;
        }
      });

      const awarded = addKarmaPoints(15 * selected.length, `Logged ${selected.length} shelf tag observations`);
      setKarma(awarded);

      setSuccessMessage(
        `Successfully logged ${selected.length} items! (+${15 * selected.length} Karma points awarded)${
          outlierCount > 0 ? ` Note: ${outlierCount} flagged item(s) sent to moderation.` : ''
        }`
      );
      setTimeout(() => setSuccessMessage(null), 5000);
    } finally {
      setIsSavingOcr(false);
    }
  };

  // Batch import flyer deals
  const handleBatchImportFlyer = (selected: ExtractedPriceItem[]) => {
    setIsImportingFlyer(true);
    try {
      selected.forEach((item) => {
        const prodId = item.matchedProductId || products[0]?.id || 'prod-apples';
        savePriceSubmission({
          productId: prodId,
          price: item.price,
          originalPrice: item.originalPrice,
          unit: item.unit,
          sourceType: 'promo_pamphlet',
          confidenceScore: Math.round(item.confidence * 100),
          proofImageUrl: '/samples/weekly-flyer-circular.jpg',
          notes: `Weekly circular deal: ${item.name}`,
        });
      });

      const awarded = addKarmaPoints(10 * selected.length, `Batch imported ${selected.length} flyer deals`);
      setKarma(awarded);

      setSuccessMessage(`Successfully ingested ${selected.length} circular deals into catalog! (+${10 * selected.length} Karma)`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } finally {
      setIsImportingFlyer(false);
    }
  };

  // Submit Manual Form
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingManual(true);

    try {
      const priceNum = parseFloat(manualForm.price);
      if (isNaN(priceNum) || priceNum <= 0) return;

      const origPriceNum = manualForm.originalPrice ? parseFloat(manualForm.originalPrice) : undefined;
      const selectedStore = stores.find((s) => s.id === manualForm.storeId);

      const result = savePriceSubmission({
        productId: manualForm.productId,
        price: priceNum,
        originalPrice: origPriceNum,
        storeId: manualForm.storeId,
        storeName: selectedStore?.name || 'Target',
        unit: manualForm.unit,
        sourceType: 'manual',
        proofImageUrl: manualForm.proofUrl || undefined,
        notes: manualForm.notes,
      });

      if (result.isOutlier) {
        setSuccessMessage('Submission flagged as a statistical price outlier (>3σ). Routed to Admin Moderation Queue for review.');
      } else {
        const awarded = addKarmaPoints(15, `Manually recorded price for ${manualForm.productId}`);
        setKarma(awarded);
        setSuccessMessage('Verified price point successfully recorded to product ledger! (+15 Karma points)');
      }

      setTimeout(() => setSuccessMessage(null), 5000);
    } finally {
      setIsSubmittingManual(false);
    }
  };

  // Parse Web URL
  const handleParseWebUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!webUrl.trim()) return;

    setIsParsingWeb(true);
    setTimeout(() => {
      // Simulate fast web crawler extraction
      setWebParsedPreview({
        name: 'Organic Whole Milk 1 Gallon',
        brand: 'Good & Gather',
        category: 'groceries',
        storeName: 'Target Online',
        price: 4.89,
        unit: '1 gal',
      });
      setIsParsingWeb(false);
    }, 600);
  };

  // Ingest Web Parsed Item
  const handleIngestWebParsed = () => {
    if (!webParsedPreview) return;

    savePriceSubmission({
      productId: 'prod-milk',
      price: webParsedPreview.price,
      storeId: 'store-target',
      storeName: webParsedPreview.storeName,
      unit: webParsedPreview.unit,
      sourceType: 'web_crawler',
      notes: `Web synced from ${webUrl}`,
    });

    const awarded = addKarmaPoints(20, 'Imported verified web listing');
    setKarma(awarded);
    setSuccessMessage('Web listing synced and added to price index! (+20 Karma points)');
    setWebParsedPreview(null);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const weeklyCompleted = karma.weeklyGoal?.completed || 0;
  const weeklyTarget = karma.weeklyGoal?.target || 10;
  const badgeCount = karma.badges?.length || 0;

  return (
    <div className="space-y-6">
      {/* Contributor Header Banner */}
      <section className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 text-violet-200 border border-violet-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-violet-300" />
              <span>Contributor Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Crowdsource Real-World Prices
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Upload store shelf tag photos, circular weekly flyers, receipts, or online listings. Multimodal AI parses products, prices, and coordinates with real-time verification.
            </p>

            {role !== 'contributor' && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setRole('contributor')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-colors"
                >
                  <span>Switch perspective to Contributor</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Karma Points Dashboard Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 min-w-[280px] shrink-0 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Rank & Tier
                  </span>
                  <h4 className="text-sm font-bold text-white leading-tight">
                    {karma.rankTitle || 'Community Scout'}
                  </h4>
                </div>
              </div>

              <div className="flex flex-col items-end font-mono">
                <span className="text-xl font-extrabold text-amber-400 tabular-nums">
                  {karma.totalPoints}
                </span>
                <span className="text-[10px] text-slate-400 uppercase">Karma Pts</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-300">
                <span>Weekly Goal ({weeklyCompleted}/{weeklyTarget})</span>
                <span className="font-mono">{Math.round((weeklyCompleted / weeklyTarget) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (weeklyCompleted / weeklyTarget) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Streak & Badges */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
              <span className="inline-flex items-center gap-1 text-amber-300 font-semibold">
                <Flame className="w-3.5 h-3.5" />
                {karma.streakDays || 5} Day Streak
              </span>
              <span className="text-slate-400">
                {badgeCount} Badges Earned
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-900 flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 4 Ingestion Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} variant="pills">
        <TabList aria-label="Ingestion methods">
          <Tab value="photo-ocr" icon={<Camera className="w-4 h-4" />}>
            Shelf Tag OCR
          </Tab>
          <Tab value="flyer-circular" icon={<FileSpreadsheet className="w-4 h-4" />}>
            Weekly Circular Flyer
          </Tab>
          <Tab value="manual-crud" icon={<Edit3 className="w-4 h-4" />}>
            Manual Entry
          </Tab>
          <Tab value="web-url" icon={<Globe className="w-4 h-4" />}>
            Web URL Parser
          </Tab>
        </TabList>

        {/* TAB 1: Shelf Photo OCR */}
        <TabPanel value="photo-ocr" className="space-y-6">
          <PhotoUploader
            initialSourceType="photo_shelf"
            onImageSelected={(data) => {
              if (data.imageUrl) setOcrImageUrl(data.imageUrl);
            }}
            onParseComplete={handleOcrComplete}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Interactive Image Preview with Bounding Box Overlay */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-4 shadow-surface flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Interactive Document Preview
                </span>
                <Badge variant="ocr" size="sm">
                  {extractedItems.length} Bounding Boxes
                </Badge>
              </div>

              <div className="relative w-full h-[360px] bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ocrImageUrl}
                  alt="Shelf Tag Scan"
                  className="max-w-full max-h-full object-contain pointer-events-none select-none"
                />

                <BoundingBoxOverlay
                  items={extractedItems}
                  selectedItemId={selectedItemId}
                  hoveredItemId={hoveredItemId}
                  onItemSelect={setSelectedItemId}
                  onItemHover={setHoveredItemId}
                  showLabels={true}
                  showPriceBadges={true}
                />
              </div>

              <p className="text-[11px] text-slate-400 text-center">
                Click bounding boxes to highlight & edit corresponding item fields
              </p>
            </div>

            {/* Extracted Field Table Editor */}
            <div className="lg:col-span-7">
              <ExtractedFieldEditor
                items={extractedItems}
                selectedItemId={selectedItemId}
                hoveredItemId={hoveredItemId}
                onItemsChange={setExtractedItems}
                onItemSelect={setSelectedItemId}
                onItemHover={setHoveredItemId}
                onSaveSelected={handleSaveOcrItems}
                isSaving={isSavingOcr}
              />
            </div>
          </div>
        </TabPanel>

        {/* TAB 2: Weekly Circular Flyer Parser */}
        <TabPanel value="flyer-circular" className="space-y-6">
          <PamphletViewer
            imageUrl="/samples/weekly-flyer-circular.jpg"
            imageAlt="Weekly Supermarket Circular"
            items={flyerItems}
            onSelectionChange={(selectedIds) => {
              const idSet = new Set(selectedIds);
              setFlyerItems((prev) =>
                prev.map((i) => ({ ...i, selected: idSet.has(i.tempId) }))
              );
            }}
            onBatchImport={handleBatchImportFlyer}
            isImporting={isImportingFlyer}
          />
        </TabPanel>

        {/* TAB 3: Manual Price Logger */}
        <TabPanel value="manual-crud" className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-surface max-w-2xl mx-auto">
            <div className="space-y-1 mb-6">
              <h3 className="text-lg font-bold text-slate-900">
                Log Direct Store Observation
              </h3>
              <p className="text-xs text-slate-500">
                Manually record a store price point with optional proof photo and observational notes.
              </p>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              {/* Product Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Target Product Catalog Item
                </label>
                <select
                  value={manualForm.productId}
                  onChange={(e) => setManualForm({ ...manualForm, productId: e.target.value })}
                  className="w-full min-h-[44px] px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.brand || 'Generic'} - {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              {/* Store Select */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Retailer Store
                  </label>
                  <select
                    value={manualForm.storeId}
                    onChange={(e) => setManualForm({ ...manualForm, storeId: e.target.value })}
                    className="w-full min-h-[44px] px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Category
                  </label>
                  <select
                    value={manualForm.category}
                    onChange={(e) => setManualForm({ ...manualForm, category: e.target.value as ProductCategory })}
                    className="w-full min-h-[44px] px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 capitalize"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_METADATA[c]?.displayName || c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price & Was Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Observed Price ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={manualForm.price}
                    onChange={(e) => setManualForm({ ...manualForm, price: e.target.value })}
                    leftIcon={<span className="text-xs font-mono font-bold text-slate-400">$</span>}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Original Price ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="Optional"
                    value={manualForm.originalPrice}
                    onChange={(e) => setManualForm({ ...manualForm, originalPrice: e.target.value })}
                    leftIcon={<span className="text-xs font-mono font-bold text-slate-400">$</span>}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Unit
                  </label>
                  <Input
                    type="text"
                    value={manualForm.unit}
                    onChange={(e) => setManualForm({ ...manualForm, unit: e.target.value })}
                    placeholder="e.g. 1 gal, 1 lb"
                  />
                </div>
              </div>

              {/* Proof Image URL & Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Proof Photo URL (Optional)
                </label>
                <Input
                  type="url"
                  placeholder="https://example.com/shelf-photo.jpg"
                  value={manualForm.proofUrl}
                  onChange={(e) => setManualForm({ ...manualForm, proofUrl: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Observational Notes
                </label>
                <textarea
                  rows={2}
                  value={manualForm.notes}
                  onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                  placeholder="e.g. Clearance endcap shelf tag, promotional member discount"
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmittingManual}
                  className="w-full"
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Submit Price Observation (+15 Karma)
                </Button>
              </div>
            </form>
          </div>
        </TabPanel>

        {/* TAB 4: Web URL Parser */}
        <TabPanel value="web-url" className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-surface max-w-2xl mx-auto space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                Web Listing Synchronizer
              </h3>
              <p className="text-xs text-slate-500">
                Paste an e-commerce or grocery delivery URL to extract real-time online pricing.
              </p>
            </div>

            <form onSubmit={handleParseWebUrl} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Store Product URL
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="url"
                      required
                      value={webUrl}
                      onChange={(e) => setWebUrl(e.target.value)}
                      placeholder="https://www.target.com/p/..."
                      leftIcon={<Globe className="w-4 h-4 text-slate-400" />}
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isParsingWeb}
                  >
                    Fetch Listing
                  </Button>
                </div>
              </div>
            </form>

            {/* Extracted Preview */}
            {webParsedPreview && (
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Extracted Web Listing
                  </span>
                  <Badge variant="verified" size="sm">
                    Synced from {webParsedPreview.storeName}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-900">
                    {webParsedPreview.name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Brand: <strong className="text-slate-700">{webParsedPreview.brand}</strong> • Unit: {webParsedPreview.unit}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Online Price</span>
                    <p className="text-lg font-bold font-mono text-slate-900">
                      {formatCurrency(webParsedPreview.price)}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleIngestWebParsed}
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Ingest into Index (+20 Karma)
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabPanel>
      </Tabs>

      {/* Karma Activity Feed */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-surface space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Recent Contribution Activity
            </h3>
            <p className="text-xs text-slate-500">
              Audited karma ledger and community contribution streaks
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
              {karma.verifiedSubmissions} Verified Observations
            </span>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {karma.recentActivities.map((act) => (
            <div key={act.id} className="py-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-slate-800">
                  {act.description}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono font-bold text-emerald-600">
                  +{act.points} pts
                </span>
                <span className="text-slate-400 text-[11px]">
                  {formatRelativeTime(act.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
