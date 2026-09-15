'use client';

import React, { useState, useEffect } from 'react';
import {
  Camera,
  FileSpreadsheet,
  Edit3,
  Globe,
  Award,
  CheckCircle2,
  Flame,
  ArrowRight,
  UploadCloud,
  Keyboard,
  X,
  Store as StoreIcon,
  Calendar,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  AlertTriangle,
  TrendingDown,
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
import { useToast } from '@/components/ui/Toast';
import {
  getStoredKarma,
  addKarmaPoints,
  savePriceSubmission,
  getStoredProducts,
  getStoredStores,
  subscribeToStorageChanges,
} from '@/lib/storage';
import { formatCurrency, formatRelativeTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';
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

const SAMPLE_FLYER_DEALS: Record<string, ExtractedPriceItem[]> = {
  'target-circular': [
    {
      tempId: 'deal-target-1',
      name: 'Honeycrisp Apples Fresh',
      category: 'groceries',
      price: 1.99,
      originalPrice: 2.99,
      unit: '1 lb',
      confidence: 0.94,
      selected: true,
      boundingBox: { xMin: 8.0, yMin: 12.0, xMax: 46.0, yMax: 48.0 },
      matchedProductId: 'prod-apples',
      storeName: 'Target',
    },
    {
      tempId: 'deal-target-2',
      name: 'Fair Trade Dark Roast Coffee Beans',
      category: 'beverages',
      price: 9.99,
      originalPrice: 12.99,
      unit: '12 oz',
      confidence: 0.91,
      selected: true,
      boundingBox: { xMin: 54.0, yMin: 12.0, xMax: 92.0, yMax: 48.0 },
      matchedProductId: 'prod-coffee',
      storeName: 'Target',
    },
    {
      tempId: 'deal-target-3',
      name: 'Large Grade A Brown Eggs (12pk)',
      category: 'groceries',
      price: 3.49,
      originalPrice: 4.29,
      unit: 'dozen',
      confidence: 0.95,
      selected: true,
      boundingBox: { xMin: 8.0, yMin: 54.0, xMax: 46.0, yMax: 90.0 },
      matchedProductId: 'prod-eggs',
      storeName: 'Target',
    },
    {
      tempId: 'deal-target-4',
      name: 'Artisan Sourdough Loaf Bread',
      category: 'groceries',
      price: 3.99,
      originalPrice: 4.79,
      unit: '24 oz loaf',
      confidence: 0.89,
      selected: true,
      boundingBox: { xMin: 54.0, yMin: 54.0, xMax: 92.0, yMax: 90.0 },
      matchedProductId: 'prod-bread',
      storeName: 'Target',
    },
  ],
  'aldi-circular': [
    {
      tempId: 'deal-aldi-1',
      name: 'Friendly Farms Whole Vitamin D Milk',
      category: 'groceries',
      price: 2.79,
      originalPrice: 3.29,
      unit: '1 gal',
      confidence: 0.96,
      selected: true,
      boundingBox: { xMin: 18.0, yMin: 22.0, xMax: 82.0, yMax: 78.0 },
      matchedProductId: 'prod-milk',
      storeName: 'Aldi',
    },
  ],
  'kroger-circular': [
    {
      tempId: 'deal-kroger-1',
      name: 'Extra Virgin Olive Oil Cold Pressed',
      category: 'groceries',
      price: 13.99,
      originalPrice: 16.50,
      unit: '500 ml',
      confidence: 0.93,
      selected: true,
      boundingBox: { xMin: 15.0, yMin: 16.0, xMax: 85.0, yMax: 38.0 },
      matchedProductId: 'prod-olive-oil',
      storeName: 'Ralphs / QFC',
    },
    {
      tempId: 'deal-kroger-2',
      name: 'Pure Butter Unsalted Sticks',
      category: 'groceries',
      price: 4.29,
      originalPrice: 5.00,
      unit: '8 oz',
      confidence: 0.91,
      selected: true,
      boundingBox: { xMin: 15.0, yMin: 42.0, xMax: 85.0, yMax: 62.0 },
      matchedProductId: 'prod-butter',
      storeName: 'Ralphs / QFC',
    },
    {
      tempId: 'deal-kroger-3',
      name: 'Organic Jasmine Long Grain Rice',
      category: 'groceries',
      price: 7.49,
      originalPrice: 8.50,
      unit: '5 lb bag',
      confidence: 0.95,
      selected: true,
      boundingBox: { xMin: 15.0, yMin: 66.0, xMax: 85.0, yMax: 86.0 },
      matchedProductId: 'prod-rice',
      storeName: 'Ralphs / QFC',
    },
  ],
};

const CIRCULAR_SAMPLES = [
  {
    id: 'target-circular',
    name: 'Target Weekly Ad',
    store: 'Target',
    imageUrl: '/samples/weekly-flyer-circular.jpg',
    dealsCount: 4,
    validityDate: 'Valid Sep 14 - Sep 20',
    items: SAMPLE_FLYER_DEALS['target-circular'],
  },
  {
    id: 'aldi-circular',
    name: 'Aldi Fresh Savers',
    store: 'Aldi',
    imageUrl: '/samples/shelf-tag-milk.jpg',
    dealsCount: 1,
    validityDate: 'Valid Sep 17 - Sep 23',
    items: SAMPLE_FLYER_DEALS['aldi-circular'],
  },
  {
    id: 'kroger-circular',
    name: 'Kroger Supermarket Deals',
    store: 'Kroger',
    imageUrl: '/samples/receipt-supermarket.jpg',
    dealsCount: 3,
    validityDate: 'Valid Sep 13 - Sep 19',
    items: SAMPLE_FLYER_DEALS['kroger-circular'],
  },
];

const WEB_SAMPLE_URLS = [
  {
    id: 'target-milk',
    retailer: 'Target',
    item: 'Good & Gather Milk ($4.89)',
    url: 'https://www.target.com/p/good-gather-organic-whole-milk-1gal/-/A-123456',
    preview: {
      name: 'Organic Whole Milk 1 Gallon',
      brand: 'Good & Gather',
      category: 'groceries' as ProductCategory,
      storeName: 'Target Online',
      price: 4.89,
      unit: '1 gal',
    },
  },
  {
    id: 'walmart-eggs',
    retailer: 'Walmart',
    item: 'Great Value Eggs ($3.49)',
    url: 'https://www.walmart.com/ip/great-value-large-white-eggs-12-count/145051',
    preview: {
      name: 'Large Grade A White Eggs (12 count)',
      brand: 'Great Value',
      category: 'groceries' as ProductCategory,
      storeName: 'Walmart Grocery',
      price: 3.49,
      unit: 'dozen',
    },
  },
  {
    id: 'kroger-coffee',
    retailer: 'Kroger',
    item: 'Private Selection Coffee ($9.99)',
    url: 'https://www.kroger.com/p/private-selection-ground-coffee-12oz/00011110',
    preview: {
      name: 'Private Selection Medium Roast Ground Coffee',
      brand: 'Private Selection',
      category: 'groceries' as ProductCategory,
      storeName: 'Kroger Online',
      price: 9.99,
      unit: '12 oz bag',
    },
  },
  {
    id: 'aldi-beef',
    retailer: 'Aldi',
    item: 'Fresh Ground Beef ($4.49/lb)',
    url: 'https://www.aldi.us/en/products/fresh-meat-seafood/fresh-beef/',
    preview: {
      name: '100% Lean Ground Beef 85/15',
      brand: 'USDA Choice',
      category: 'groceries' as ProductCategory,
      storeName: 'Aldi Market',
      price: 4.49,
      unit: '1 lb pack',
    },
  },
];

export default function ContributePage() {
  const { role, setRole } = useRoleView();
  const { showToast } = useToast();
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
  const [ocrStoreId, setOcrStoreId] = useState<string>('store-target');
  const [ocrDate, setOcrDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [ocrSourceType, setOcrSourceType] = useState<'photo_shelf' | 'receipt' | 'promo_pamphlet'>('photo_shelf');
  const [ocrZoom, setOcrZoom] = useState<number>(1);
  const [ocrPan, setOcrPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isOcrPanning, setIsOcrPanning] = useState(false);
  const [startOcrPan, setStartOcrPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [ocrFitWidth, setOcrFitWidth] = useState(false);

  // Tab 2 (Flyer) state
  const [flyerImageUrl, setFlyerImageUrl] = useState<string>('/samples/weekly-flyer-circular.jpg');
  const [flyerItems, setFlyerItems] = useState<ExtractedPriceItem[]>(SAMPLE_FLYER_DEALS['target-circular']);
  const [selectedFlyerItemId, setSelectedFlyerItemId] = useState<string | null>(null);
  const [hoveredFlyerItemId, setHoveredFlyerItemId] = useState<string | null>(null);
  const [isImportingFlyer, setIsImportingFlyer] = useState(false);

  // Tab 3 (Manual Form) state
  const [manualForm, setManualForm] = useState({
    productId: 'prod-milk',
    productName: 'Organic Whole Milk 1 Gallon',
    category: 'groceries' as ProductCategory,
    brand: 'Good & Gather',
    storeId: 'store-target',
    price: '',
    originalPrice: '',
    unit: '1 gal',
    proofUrl: '',
    notes: '',
  });
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState<string>('');
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
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Global Keyboard Shortcuts for Ingestion Studio (1-4 tabs, ? help, Esc close)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isInputFocused = ['INPUT', 'TEXTAREA', 'SELECT'].includes(
        (e.target as HTMLElement)?.tagName
      );

      // Escape closes modal
      if (e.key === 'Escape') {
        setShowShortcutsModal(false);
        return;
      }

      // '?' opens shortcuts cheat-sheet when not typing in an input
      if (e.key === '?' && !isInputFocused) {
        e.preventDefault();
        setShowShortcutsModal((prev) => !prev);
        return;
      }

      // Quick tab switching 1-4 when not typing
      if (!isInputFocused && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (e.key === '1') {
          e.preventDefault();
          setActiveTab('photo-ocr');
        } else if (e.key === '2') {
          e.preventDefault();
          setActiveTab('flyer-circular');
        } else if (e.key === '3') {
          e.preventDefault();
          setActiveTab('manual-crud');
        } else if (e.key === '4') {
          e.preventDefault();
          setActiveTab('web-url');
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Load Karma on storage change
  useEffect(() => {
    const loadKarma = () => setKarma(getStoredKarma());
    loadKarma();
    const unsubscribe = subscribeToStorageChanges(loadKarma);
    return () => unsubscribe();
  }, []);

  const products = getStoredProducts();
  const stores = getStoredStores();

  // Custom flyer upload handler
  const handleCustomFlyerUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setFlyerImageUrl(dataUrl);
      setSelectedFlyerItemId(null);
      setHoveredFlyerItemId(null);
      setFlyerItems([
        {
          tempId: `custom-deal-${Date.now()}-1`,
          name: 'Detected Promotional Deal 1',
          category: 'groceries',
          price: 4.99,
          originalPrice: 6.49,
          unit: '1 item',
          confidence: 0.91,
          selected: true,
          boundingBox: { xMin: 15.0, yMin: 20.0, xMax: 48.0, yMax: 50.0 },
          matchedProductId: 'prod-milk',
          storeName: 'Local Store',
        },
        {
          tempId: `custom-deal-${Date.now()}-2`,
          name: 'Detected Promotional Deal 2',
          category: 'groceries',
          price: 2.49,
          originalPrice: 3.29,
          unit: '1 item',
          confidence: 0.88,
          selected: true,
          boundingBox: { xMin: 52.0, yMin: 20.0, xMax: 85.0, yMax: 50.0 },
          matchedProductId: 'prod-bread',
          storeName: 'Local Store',
        },
      ]);
      showToast({
        type: 'info',
        message: 'Flyer Uploaded & Ready',
        description: 'Pan and zoom the canvas to inspect deals and batch import.',
      });
    };
    reader.readAsDataURL(file);
  };

  // Preset circular selector handler
  const handleSelectCircularSample = (sample: (typeof CIRCULAR_SAMPLES)[number]) => {
    setFlyerImageUrl(sample.imageUrl);
    setFlyerItems(sample.items);
    setSelectedFlyerItemId(null);
    setHoveredFlyerItemId(null);
    showToast({
      type: 'info',
      message: `Loaded ${sample.name}`,
      description: `${sample.store} circular loaded with ${sample.items.length} verified deals.`,
    });
  };

  // Proof photo file picker handler for manual form
  const handleProofFileSelect = (file: File) => {
    setProofFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setProofPreview(dataUrl);
      setManualForm((prev) => ({ ...prev, proofUrl: dataUrl }));
      showToast({
        type: 'success',
        message: 'Proof Photo Attached',
        description: `${file.name} attached to manual price submission.`,
      });
    };
    reader.readAsDataURL(file);
  };

  // Reset Tab 3 manual form fields
  const handleResetManualForm = () => {
    setManualForm((prev) => ({
      ...prev,
      price: '',
      originalPrice: '',
      proofUrl: '',
      notes: '',
    }));
    setProofPreview(null);
    setProofFileName('');
    showToast({
      type: 'info',
      message: 'Form Reset',
      description: 'Price, notes, and proof photo cleared.',
    });
  };

  // Populate demo observation sample
  const handleFillSampleManual = () => {
    setManualForm({
      productId: 'prod-milk',
      productName: 'Organic Whole Milk 1 Gallon',
      category: 'groceries',
      brand: 'Good & Gather',
      storeId: 'store-target',
      price: '4.89',
      originalPrice: '5.29',
      unit: '1 gal',
      proofUrl: '/samples/shelf-tag-milk.jpg',
      notes: 'Observed in dairy aisle refrigerated section',
    });
    setProofPreview('/samples/shelf-tag-milk.jpg');
    setProofFileName('shelf-tag-milk.jpg');
    showToast({
      type: 'info',
      message: 'Sample Observation Loaded',
      description: 'Demo shelf tag price point loaded into form.',
    });
  };

  // Handle product change in Tab 3 with automatic unit/category synchronization
  const handleManualProductChange = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    setManualForm((prev) => ({
      ...prev,
      productId,
      productName: prod?.name || '',
      category: prod?.category || prev.category,
      unit: prod?.unit || prev.unit,
      brand: prod?.brand || prev.brand,
    }));
  };

  // Reset Tab 1 document zoom & pan when image changes
  useEffect(() => {
    setOcrZoom(1);
    setOcrPan({ x: 0, y: 0 });
    setOcrFitWidth(false);
  }, [ocrImageUrl]);

  const handleOcrZoomIn = () => {
    setOcrZoom((prev) => Math.min(prev + 0.25, 3.0));
  };

  const handleOcrZoomOut = () => {
    setOcrZoom((prev) => {
      const next = Math.max(prev - 0.25, 0.75);
      if (next === 1) setOcrPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleOcrResetZoom = () => {
    setOcrZoom(1);
    setOcrPan({ x: 0, y: 0 });
    setOcrFitWidth(false);
  };

  const handleToggleOcrFitWidth = () => {
    setOcrFitWidth((prev) => {
      const next = !prev;
      if (next) {
        setOcrZoom(1.5);
        setOcrPan({ x: 0, y: 0 });
      } else {
        setOcrZoom(1);
        setOcrPan({ x: 0, y: 0 });
      }
      return next;
    });
  };

  const handleOcrMouseDown = (e: React.MouseEvent) => {
    if (ocrZoom > 1 || ocrFitWidth) {
      setIsOcrPanning(true);
      setStartOcrPan({ x: e.clientX - ocrPan.x, y: e.clientY - ocrPan.y });
    }
  };

  const handleOcrMouseMove = (e: React.MouseEvent) => {
    if (isOcrPanning && (ocrZoom > 1 || ocrFitWidth)) {
      setOcrPan({
        x: e.clientX - startOcrPan.x,
        y: e.clientY - startOcrPan.y,
      });
    }
  };

  const handleOcrMouseUp = () => {
    setIsOcrPanning(false);
  };

  // OCR Parse Response Callback
  const handleOcrComplete = (res: OcrParseResponse) => {
    if (res.result) {
      if (res.result.extractedItems && res.result.extractedItems.length > 0) {
        setExtractedItems(res.result.extractedItems);
        setSelectedItemId(res.result.extractedItems[0]?.tempId || null);
      }
      if (res.result.sourceType) {
        setOcrSourceType(res.result.sourceType);
      }
      if (res.result.detectedStoreName) {
        const storeQuery = res.result.detectedStoreName.toLowerCase();
        const matchedStore = stores.find(
          (s) =>
            s.name.toLowerCase().includes(storeQuery) ||
            storeQuery.includes(s.name.toLowerCase()) ||
            (s.chain && s.chain.toLowerCase().includes(storeQuery))
        );
        if (matchedStore) {
          setOcrStoreId(matchedStore.id);
        }
      }
      if (res.result.detectedDate) {
        setOcrDate(res.result.detectedDate);
      }
    }
  };

  // Save OCR extracted items
  const handleSaveOcrItems = (selected: ExtractedPriceItem[]) => {
    setIsSavingOcr(true);
    try {
      let outlierCount = 0;
      const selectedStore = stores.find((s) => s.id === ocrStoreId);
      const storeName = selectedStore?.name || 'Target';
      const submissionTimestamp = ocrDate ? `${ocrDate}T12:00:00.000Z` : new Date().toISOString();

      selected.forEach((item) => {
        const prodId = item.matchedProductId || products[0]?.id || 'prod-milk';
        const itemStoreId = item.storeName
          ? stores.find((s) => s.name.toLowerCase() === item.storeName?.toLowerCase())?.id || ocrStoreId
          : ocrStoreId;
        const itemStoreName = item.storeName || storeName;

        const result = savePriceSubmission({
          productId: prodId,
          price: item.price,
          originalPrice: item.originalPrice,
          storeId: itemStoreId,
          storeName: itemStoreName,
          timestamp: submissionTimestamp,
          unit: item.unit,
          sourceType: ocrSourceType,
          confidenceScore: Math.round(item.confidence * 100),
          proofImageUrl: ocrImageUrl,
          notes: item.notes || `OCR ${ocrSourceType === 'receipt' ? 'Receipt' : 'Shelf Tag'} parse: ${item.name}`,
        });

        if (result.isOutlier) {
          outlierCount++;
        }
      });

      const docLabel = ocrSourceType === 'receipt' ? 'receipt' : 'shelf tag';
      const awarded = addKarmaPoints(15 * selected.length, `Logged ${selected.length} ${docLabel} observations at ${storeName}`);
      setKarma(awarded);

      showToast({
        type: 'success',
        message: `Logged ${selected.length} ${docLabel} observation${selected.length > 1 ? 's' : ''} at ${storeName}`,
        description: `+${15 * selected.length} Karma points awarded to your rank!`,
      });

      setSuccessMessage(
        `Successfully logged ${selected.length} items at ${storeName}! (+${15 * selected.length} Karma points awarded)${
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
        const itemStoreId = item.storeName
          ? stores.find((s) => s.name.toLowerCase() === item.storeName?.toLowerCase())?.id || 'store-walmart'
          : 'store-walmart';
        const itemStoreName = item.storeName || 'Walmart Supercenter';

        savePriceSubmission({
          productId: prodId,
          price: item.price,
          originalPrice: item.originalPrice,
          storeId: itemStoreId,
          storeName: itemStoreName,
          unit: item.unit,
          sourceType: 'promo_pamphlet',
          confidenceScore: Math.round(item.confidence * 100),
          proofImageUrl: flyerImageUrl || '/samples/weekly-flyer-circular.jpg',
          notes: item.notes || `Weekly circular deal: ${item.name}`,
        });
      });

      const awarded = addKarmaPoints(10 * selected.length, `Batch imported ${selected.length} flyer deals`);
      setKarma(awarded);

      showToast({
        type: 'success',
        message: `Ingested ${selected.length} circular deal${selected.length > 1 ? 's' : ''}`,
        description: `+${10 * selected.length} Karma points awarded`,
      });

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
        showToast({
          type: 'warning',
          message: 'Price Flagged for Moderation (>3σ)',
          description: 'Statistical anomaly detected. Routed to verification queue.',
        });
        setSuccessMessage('Submission flagged as a statistical price outlier (>3σ). Routed to Admin Moderation Queue for review.');
      } else {
        setKarma(getStoredKarma());
        showToast({
          type: 'success',
          message: 'Price Observation Recorded (+15 Karma)',
          description: 'Verified price point added to community index.',
        });
        setSuccessMessage('Verified price point successfully recorded to product ledger! (+15 Karma points)');
      }

      // Reset form fields after submission while retaining store
      setManualForm((prev) => ({
        ...prev,
        price: '',
        originalPrice: '',
        proofUrl: '',
        notes: '',
      }));
      setProofPreview(null);
      setProofFileName('');

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
    showToast({
      type: 'success',
      message: 'Web Listing Synced (+20 Karma)',
      description: 'E-commerce price verified and catalog updated.',
    });
    setSuccessMessage('Web listing synced and added to price index! (+20 Karma points)');
    setWebParsedPreview(null);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const weeklyCompleted = karma.weeklyGoal?.completed || 0;
  const weeklyTarget = karma.weeklyGoal?.target || 10;
  const badgeCount = karma.badges?.length || 0;

  const selectedManualProduct = products.find((p) => p.id === manualForm.productId);
  const manualPriceNum = parseFloat(manualForm.price) || 0;

  return (
    <div className="space-y-6">
      {/* Contributor Header Banner */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-surface">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Crowdsource Real-World Prices
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Upload store shelf tag photos, circular weekly flyers, receipts, or online listings. Multimodal AI parses products, prices, and coordinates with real-time verification into the community price ledger.
            </p>

            {role !== 'contributor' && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setRole('contributor')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-xs touch-target min-h-[44px]"
                >
                  <span>Switch perspective to Contributor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Karma Points Dashboard Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/80 shadow-surface min-w-[280px] shrink-0 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    Rank & Tier
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">
                    {karma.rankTitle || 'Community Scout'}
                  </h4>
                </div>
              </div>

              <div className="flex flex-col items-end font-mono">
                <span className="text-xl font-extrabold text-amber-600 tabular-nums">
                  {karma.totalPoints}
                </span>
                <span className="text-[10px] text-slate-600 font-semibold uppercase">Karma Pts</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-600">
                <span>Weekly Goal ({weeklyCompleted}/{weeklyTarget})</span>
                <span className="font-mono font-bold text-slate-700">{Math.round((weeklyCompleted / weeklyTarget) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (weeklyCompleted / weeklyTarget) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                <Flame className="w-3.5 h-3.5" />
                {karma.streakDays || 5} Day Streak
              </span>
              <span className="text-slate-600 font-medium">
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

      {/* 4 Ingestion Tabs with Shortcuts Trigger */}
      <Tabs value={activeTab} onValueChange={setActiveTab} variant="pills">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <TabList aria-label="Ingestion methods">
            <Tab value="photo-ocr" icon={<Camera className="w-4 h-4" />}>
              1. Photo & Receipt OCR
            </Tab>
            <Tab value="flyer-circular" icon={<FileSpreadsheet className="w-4 h-4" />}>
              2. Store Flyers & Circulars
            </Tab>
            <Tab value="manual-crud" icon={<Edit3 className="w-4 h-4" />}>
              3. Direct Manual Log
            </Tab>
            <Tab value="web-url" icon={<Globe className="w-4 h-4" />}>
              4. Web Listing Importer
            </Tab>
          </TabList>

          <button
            type="button"
            onClick={() => setShowShortcutsModal(true)}
            aria-label="Keyboard Shortcuts (?)"
            title="Keyboard Shortcuts (?)"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-xl border border-slate-200 transition-colors touch-target min-h-[44px] shrink-0 self-start sm:self-auto"
          >
            <Keyboard className="w-4 h-4 text-indigo-600" />
            <span>Shortcuts</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px] text-slate-700 font-bold">
              ?
            </kbd>
          </button>
        </div>

        {/* TAB 1: Multimodal Shelf Photo & Receipt OCR */}
        <TabPanel value="photo-ocr" className="space-y-6">
          <PhotoUploader
            initialSourceType="photo_shelf"
            onImageSelected={(data) => {
              if (data.imageUrl) setOcrImageUrl(data.imageUrl);
              if (data.sourceType) {
                setOcrSourceType(data.sourceType);
                if (data.sourceType === 'receipt') {
                  const tjs = stores.find((s) => s.id === 'store-trader-joes');
                  if (tjs) setOcrStoreId(tjs.id);
                } else if (data.sourceType === 'promo_pamphlet') {
                  const wm = stores.find((s) => s.id === 'store-walmart');
                  if (wm) setOcrStoreId(wm.id);
                } else {
                  const tgt = stores.find((s) => s.id === 'store-target');
                  if (tgt) setOcrStoreId(tgt.id);
                }
              }
            }}
            onParseComplete={handleOcrComplete}
          />

          {/* Document Provenance & Retailer Attribution Header */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-surface">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <StoreIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      Document Provenance & Attribution
                    </h3>
                    <Badge variant="category" size="sm">
                      {ocrSourceType === 'receipt' ? 'Receipt' : ocrSourceType === 'promo_pamphlet' ? 'Circular' : 'Shelf Tag'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    Verify retailer location and receipt date before committing prices to public ledger
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Store Selector */}
                <div className="flex items-center gap-2">
                  <label htmlFor="ocr-store-select" className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                    Store:
                  </label>
                  <select
                    id="ocr-store-select"
                    value={ocrStoreId}
                    onChange={(e) => setOcrStoreId(e.target.value)}
                    aria-label="Verified Store Location"
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-h-[44px]"
                  >
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.city || s.branchName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Observation Date */}
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <label htmlFor="ocr-date-input" className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                    Date:
                  </label>
                  <input
                    id="ocr-date-input"
                    type="date"
                    value={ocrDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setOcrDate(e.target.value)}
                    aria-label="Receipt or Observation Date"
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-h-[44px]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Interactive Image Preview with Bounding Box Overlay */}
            <div className="xl:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-4 shadow-surface flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    Interactive Document Preview
                  </span>
                  <Badge variant="ocr" size="sm">
                    {extractedItems.length} Bounding Boxes
                  </Badge>
                </div>

                {/* Document Zoom & View Controls */}
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200/80">
                    <button
                      type="button"
                      onClick={handleOcrZoomOut}
                      disabled={ocrZoom <= 0.75}
                      aria-label="Zoom out (-)"
                      title="Zoom Out (-)"
                      className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded-lg hover:bg-white transition-colors disabled:opacity-40 touch-target min-h-[44px] min-w-[32px]"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-mono font-semibold text-slate-700 px-1.5 min-w-[38px] text-center select-none tabular-nums">
                      {Math.round(ocrZoom * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={handleOcrZoomIn}
                      disabled={ocrZoom >= 3.0}
                      aria-label="Zoom in (+)"
                      title="Zoom In (+)"
                      className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded-lg hover:bg-white transition-colors disabled:opacity-40 touch-target min-h-[44px] min-w-[32px]"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleOcrResetZoom}
                      aria-label="Reset zoom (0)"
                      title="Reset Zoom (0)"
                      className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded-lg hover:bg-white transition-colors ml-0.5 border-l border-slate-200 touch-target min-h-[44px] min-w-[32px]"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleOcrFitWidth}
                    aria-label={ocrFitWidth ? 'Fit Entire Document' : 'Fit Document Width'}
                    title={ocrFitWidth ? 'Fit to Viewport' : 'Fit Receipt Width (Readable print)'}
                    className={cn(
                      'px-2.5 py-1 text-[11px] font-semibold rounded-xl border transition-colors touch-target min-h-[44px] flex items-center gap-1.5',
                      ocrFitWidth
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700'
                    )}
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span className="hidden sm:inline">{ocrFitWidth ? 'Fit View' : 'Fit Width'}</span>
                  </button>
                </div>
              </div>

              {/* Document Preview Viewport Frame with Zoom & Pan Canvas */}
              <div
                tabIndex={0}
                role="region"
                aria-label="Receipt preview canvas. Drag to pan when zoomed."
                onMouseDown={handleOcrMouseDown}
                onMouseMove={handleOcrMouseMove}
                onMouseUp={handleOcrMouseUp}
                onMouseLeave={handleOcrMouseUp}
                className={cn(
                  'relative w-full h-[400px] bg-slate-950/95 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800/80 shadow-inner select-none focus:outline-none focus:ring-2 focus:ring-indigo-500',
                  ocrZoom > 1 || ocrFitWidth
                    ? isOcrPanning
                      ? 'cursor-grabbing'
                      : 'cursor-grab'
                    : 'cursor-default'
                )}
              >
                <div
                  style={{
                    transform: `translate(${ocrPan.x}px, ${ocrPan.y}px) scale(${ocrZoom})`,
                    transformOrigin: 'center center',
                    transition: isOcrPanning ? 'none' : 'transform 0.15s ease-out',
                  }}
                  className="relative w-full h-full flex items-center justify-center p-2"
                >
                  {/* Intrinsic Image Container */}
                  <div className="relative inline-flex items-center justify-center max-w-full max-h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ocrImageUrl}
                      alt="Receipt or Shelf Tag Document"
                      className={cn(
                        'block rounded-lg pointer-events-none select-none shadow-md',
                        ocrFitWidth
                          ? 'w-full max-w-[380px] h-auto object-contain'
                          : 'max-h-[384px] max-w-full w-auto h-auto object-contain'
                      )}
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
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-1">
                <span>Click bounding boxes to highlight items</span>
                <span>Drag to pan when zoomed</span>
              </div>
            </div>

            {/* Extracted Field Table Editor */}
            <div className="xl:col-span-7">
              <ExtractedFieldEditor
                items={extractedItems}
                selectedItemId={selectedItemId}
                hoveredItemId={hoveredItemId}
                onItemsChange={setExtractedItems}
                onItemSelect={setSelectedItemId}
                onItemHover={setHoveredItemId}
                onSaveSelected={handleSaveOcrItems}
                isSaving={isSavingOcr}
                storeName={stores.find((s) => s.id === ocrStoreId)?.name || 'Target'}
                documentDate={ocrDate}
              />
            </div>
          </div>
        </TabPanel>

        {/* TAB 2: Store Flyers & Weekly Circulars */}
        <TabPanel value="flyer-circular" className="space-y-6">
          {/* Circular Selector & Upload Bar */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-surface space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Select or Upload Store Flyer & Weekly Circular
                </h3>
                <p className="text-xs text-slate-500">
                  Inspect multi-deal promotional flyers with pan/zoom canvas and batch price ingestion
                </p>
              </div>

              {/* Upload Custom Flyer Button */}
              <label
                htmlFor="custom-flyer-input"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200/80 cursor-pointer transition-colors shadow-2xs touch-target min-h-[44px] shrink-0"
              >
                <UploadCloud className="w-4 h-4 text-indigo-600" />
                <span>Upload Custom Flyer</span>
                <input
                  id="custom-flyer-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCustomFlyerUpload(file);
                  }}
                />
              </label>
            </div>

            {/* Circular Sample Presets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {CIRCULAR_SAMPLES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSelectCircularSample(sample)}
                  className={cn(
                    'p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-start justify-between gap-2 touch-target min-h-[44px]',
                    flyerImageUrl === sample.imageUrl
                      ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50/80 shadow-surface'
                  )}
                >
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900">{sample.name}</p>
                    <p className="text-[11px] text-slate-500">{sample.store} • {sample.dealsCount} verified deals</p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-700 bg-indigo-50/80 px-1.5 py-0.5 rounded-md">
                      <Calendar className="w-2.5 h-2.5" />
                      {sample.validityDate}
                    </span>
                  </div>
                  <Badge variant={flyerImageUrl === sample.imageUrl ? 'verified' : 'category'} size="sm">
                    {sample.store}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          <PamphletViewer
            imageUrl={flyerImageUrl}
            imageAlt="Weekly Supermarket Circular"
            items={flyerItems}
            selectedItemId={selectedFlyerItemId}
            hoveredItemId={hoveredFlyerItemId}
            onItemSelect={(tempId) => {
              setSelectedFlyerItemId((prev) => (prev === tempId ? null : tempId));
            }}
            onItemHover={(tempId) => {
              setHoveredFlyerItemId(tempId);
            }}
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

        {/* TAB 3: Direct Manual Observation */}
        <TabPanel value="manual-crud" className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-surface max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  Log Direct Store Observation
                </h3>
                <p className="text-xs text-slate-500">
                  Manually record a store price point with empirical photo evidence and observational notes.
                </p>
              </div>
              <button
                type="button"
                onClick={handleFillSampleManual}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200/80 transition-colors touch-target min-h-[44px] shrink-0 self-start sm:self-auto"
              >
                Fill Demo Sample
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              {/* Product Select */}
              <div className="space-y-1.5">
                <label htmlFor="manual-product-select" className="text-xs font-bold text-slate-700">
                  Target Product Catalog Item
                </label>
                <select
                  id="manual-product-select"
                  value={manualForm.productId}
                  onChange={(e) => handleManualProductChange(e.target.value)}
                  className="w-full min-h-[44px] px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.brand || 'Generic'} - {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              {/* Market Reference & Price Benchmark Card */}
              {selectedManualProduct && (
                <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/90 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        {selectedManualProduct.name}
                      </span>
                      <Badge variant="category" size="sm" className="capitalize text-[11px]">
                        {selectedManualProduct.category}
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      Catalog Unit: <span className="font-semibold text-slate-700">{selectedManualProduct.unit}</span>
                    </span>
                  </div>

                  {/* 3-column stats */}
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/80">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/60 text-center">
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                        Community Avg
                      </p>
                      <p className="text-sm font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                        {formatCurrency(selectedManualProduct.averagePrice)}
                      </p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/60 text-center">
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                        Historical Range
                      </p>
                      <p className="text-sm font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                        {formatCurrency(selectedManualProduct.currentLowestPrice)} - {formatCurrency(selectedManualProduct.currentHighestPrice)}
                      </p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/60 text-center">
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                        Sample Data
                      </p>
                      <p className="text-sm font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                        {selectedManualProduct.totalSubmissionsCount || 1} verified
                      </p>
                    </div>
                  </div>

                  {/* Pre-flight price check feedback */}
                  {manualPriceNum > 0 && manualPriceNum < selectedManualProduct.currentLowestPrice && (
                    <div className="flex items-start gap-2 p-2.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs text-emerald-800">
                      <TrendingDown className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Potential new community low!</span> Current catalog low is{' '}
                        <span className="font-mono font-bold tabular-nums">{formatCurrency(selectedManualProduct.currentLowestPrice)}</span>.
                        Your observation will update the community benchmark.
                      </div>
                    </div>
                  )}

                  {manualPriceNum > 0 && manualPriceNum > selectedManualProduct.currentHighestPrice * 1.5 && (
                    <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-800">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Price notice:</span> Observed price ({formatCurrency(manualPriceNum)}) is significantly higher than historical range ({formatCurrency(selectedManualProduct.currentLowestPrice)} - {formatCurrency(selectedManualProduct.currentHighestPrice)}). Please verify decimal placement or attach proof photo evidence.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Store Select */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="manual-store-select" className="text-xs font-bold text-slate-700">
                    Retailer Store
                  </label>
                  <select
                    id="manual-store-select"
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
                  <label htmlFor="manual-category-select" className="text-xs font-bold text-slate-700">
                    Category
                  </label>
                  <select
                    id="manual-category-select"
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
                  <label htmlFor="manual-price-input" className="text-xs font-bold text-slate-700">
                    Observed Price ($)
                  </label>
                  <Input
                    id="manual-price-input"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={manualForm.price}
                    onChange={(e) => setManualForm({ ...manualForm, price: e.target.value })}
                    leftIcon={<span className="text-xs font-mono font-bold text-slate-500">$</span>}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="manual-original-price-input" className="text-xs font-bold text-slate-700">
                    Original Price ($)
                  </label>
                  <Input
                    id="manual-original-price-input"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="Optional"
                    value={manualForm.originalPrice}
                    onChange={(e) => setManualForm({ ...manualForm, originalPrice: e.target.value })}
                    leftIcon={<span className="text-xs font-mono font-bold text-slate-500">$</span>}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="manual-unit-input" className="text-xs font-bold text-slate-700">
                    Unit
                  </label>
                  <Input
                    id="manual-unit-input"
                    type="text"
                    value={manualForm.unit}
                    onChange={(e) => setManualForm({ ...manualForm, unit: e.target.value })}
                    placeholder="e.g. 1 gal, 1 lb"
                  />
                </div>
              </div>

              {/* Proof Photo Upload / Camera Capture */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Proof Photo Evidence (Optional)</span>
                  <span className="text-[11px] font-normal text-slate-500">Camera tag / receipt photo</span>
                </label>

                {proofPreview ? (
                  <div className="relative p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={proofPreview}
                      alt="Proof preview"
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {proofFileName || 'Proof Image Attached'}
                      </p>
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Evidence attached to submission
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setProofPreview(null);
                        setProofFileName('');
                        setManualForm({ ...manualForm, proofUrl: '' });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors touch-target min-h-[44px]"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <label
                      htmlFor="manual-proof-file-input"
                      className="flex items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-dashed border-slate-300 hover:border-indigo-300 text-xs font-semibold text-slate-700 cursor-pointer transition-colors touch-target min-h-[44px]"
                    >
                      <UploadCloud className="w-4 h-4 text-indigo-600" />
                      <span>Upload Photo File</span>
                      <input
                        id="manual-proof-file-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleProofFileSelect(file);
                        }}
                      />
                    </label>

                    <label
                      htmlFor="manual-proof-camera-input"
                      className="flex items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-dashed border-slate-300 hover:border-indigo-300 text-xs font-semibold text-slate-700 cursor-pointer transition-colors touch-target min-h-[44px]"
                    >
                      <Camera className="w-4 h-4 text-indigo-600" />
                      <span>Snap Camera Photo</span>
                      <input
                        id="manual-proof-camera-input"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleProofFileSelect(file);
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="manual-notes-input" className="text-xs font-bold text-slate-700">
                  Observational Notes
                </label>
                <textarea
                  id="manual-notes-input"
                  rows={2}
                  value={manualForm.notes}
                  onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                  placeholder="e.g. Clearance endcap shelf tag, promotional member discount"
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmittingManual}
                  className="flex-1 w-full min-h-[44px]"
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Submit Price Observation (+15 Karma)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleResetManualForm}
                  className="w-full sm:w-auto min-h-[44px]"
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                >
                  Clear Form
                </Button>
              </div>
            </form>
          </div>
        </TabPanel>

        {/* TAB 4: Web URL Metadata Importer */}
        <TabPanel value="web-url" className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-surface max-w-2xl mx-auto space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                Online Retailer Web Scraper & Importer
              </h3>
              <p className="text-xs text-slate-500">
                Paste a direct product listing URL from supported retailers (Target, Walmart, Kroger, Amazon Fresh) to extract and index current pricing.
              </p>
            </div>

            {/* Quick Fill Test Retailer Links */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                Quick-test supported online retailers:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {WEB_SAMPLE_URLS.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => {
                      setWebUrl(sample.url);
                      setWebParsedPreview(sample.preview);
                      showToast({
                        type: 'info',
                        message: `Loaded ${sample.retailer} Listing`,
                        description: sample.item,
                      });
                    }}
                    className={cn(
                      'p-2.5 rounded-xl border text-left transition-all touch-target min-h-[44px] flex items-center justify-between gap-2',
                      webUrl === sample.url
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold ring-2 ring-indigo-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                    )}
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                        {sample.retailer}
                      </span>
                      <p className="text-xs font-medium truncate">{sample.item}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleParseWebUrl} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="web-url-input" className="text-xs font-bold text-slate-700">
                  Store Product URL
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <Input
                      id="web-url-input"
                      type="url"
                      required
                      value={webUrl}
                      onChange={(e) => setWebUrl(e.target.value)}
                      placeholder="https://www.target.com/p/..."
                      leftIcon={<Globe className="w-4 h-4 text-slate-500" />}
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isParsingWeb}
                    className="min-h-[44px] shrink-0"
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
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
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
                  <p className="text-xs text-slate-600">
                    Brand: <strong className="text-slate-800">{webParsedPreview.brand}</strong> • Unit: {webParsedPreview.unit}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500">Online Price</span>
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
                    className="min-h-[44px]"
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
                <span className="text-slate-500 text-[11px]">
                  {formatRelativeTime(act.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="shortcuts-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowShortcutsModal(false)}
        >
          <div
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xl max-w-lg w-full space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Keyboard className="w-4 h-4" />
                </div>
                <h3 id="shortcuts-modal-title" className="text-base font-bold text-slate-900">
                  Ingestion Studio Accelerators
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                aria-label="Close shortcuts dialog"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors touch-target min-h-[44px]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                  Navigation & Mode Switching
                </h4>
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 font-medium">Switch to Shelf Photo OCR</span>
                    <kbd className="px-2 py-0.5 rounded bg-white border border-slate-300 font-mono text-[11px] font-bold text-slate-800">1</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 font-medium">Switch to Store Flyers & Circulars</span>
                    <kbd className="px-2 py-0.5 rounded bg-white border border-slate-300 font-mono text-[11px] font-bold text-slate-800">2</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 font-medium">Switch to Manual Log</span>
                    <kbd className="px-2 py-0.5 rounded bg-white border border-slate-300 font-mono text-[11px] font-bold text-slate-800">3</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 font-medium">Switch to Web Listing Importer</span>
                    <kbd className="px-2 py-0.5 rounded bg-white border border-slate-300 font-mono text-[11px] font-bold text-slate-800">4</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 font-medium">Toggle this shortcuts cheat sheet</span>
                    <kbd className="px-2 py-0.5 rounded bg-white border border-slate-300 font-mono text-[11px] font-bold text-slate-800">?</kbd>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                  Extracted Items Ledger & Bounding Boxes
                </h4>
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 font-medium">Next / Previous Item</span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-2 py-0.5 rounded bg-white border border-slate-300 font-mono text-[11px] font-bold text-slate-800">J</kbd>
                      <span className="text-slate-500 font-medium">/</span>
                      <kbd className="px-2 py-0.5 rounded bg-white border border-slate-300 font-mono text-[11px] font-bold text-slate-800">K</kbd>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 font-medium">Toggle Selection Checkbox</span>
                    <kbd className="px-2 py-0.5 rounded bg-white border border-slate-300 font-mono text-[11px] font-bold text-slate-800">Space</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 font-medium">Batch Save / Ingest Selected</span>
                    <kbd className="px-2 py-0.5 rounded bg-white border border-slate-300 font-mono text-[11px] font-bold text-slate-800">⌘ + Enter</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 font-medium">Add New Manual Row</span>
                    <kbd className="px-2 py-0.5 rounded bg-white border border-slate-300 font-mono text-[11px] font-bold text-slate-800">A</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 font-medium">Delete Active Line Item</span>
                    <kbd className="px-2 py-0.5 rounded bg-white border border-slate-300 font-mono text-[11px] font-bold text-slate-800">D</kbd>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                  Circular Flyer Zoom & Pan
                </h4>
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 font-medium">Zoom In / Zoom Out</span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-2 py-0.5 rounded bg-white border border-slate-300 font-mono text-[11px] font-bold text-slate-800">+</kbd>
                      <span className="text-slate-500 font-medium">/</span>
                      <kbd className="px-2 py-0.5 rounded bg-white border border-slate-300 font-mono text-[11px] font-bold text-slate-800">-</kbd>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 font-medium">Pan Flyer Canvas</span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[11px] font-bold text-slate-800">←</kbd>
                      <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[11px] font-bold text-slate-800">↑</kbd>
                      <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[11px] font-bold text-slate-800">→</kbd>
                      <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[11px] font-bold text-slate-800">↓</kbd>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 font-medium">Reset Zoom & Pan to 100%</span>
                    <kbd className="px-2 py-0.5 rounded bg-white border border-slate-300 font-mono text-[11px] font-bold text-slate-800">0</kbd>
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => setShowShortcutsModal(false)}
              className="w-full min-h-[44px]"
            >
              Got it, Close (Esc)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
