/**
 * OpenPrice User, Moderation & Karma Domain Models
 */

import type { ProductCategory, PricePoint, Product } from './product.ts';

export type UserRole = 'public' | 'contributor' | 'admin';

export interface KarmaBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface ContributionKarma {
  totalPoints: number;
  tier?: 'Novice Scout' | 'Eagle Eye' | 'Price Hunter' | 'Master Curator' | 'Grand Arbiter' | string;
  rankTitle?: string;
  verifiedSubmissions: number;
  pendingSubmissions: number;
  rejectedSubmissions?: number;
  badges?: KarmaBadge[];
  streakDays?: number;
  weeklyGoal?: { target: number; completed: number };
  recentActivities: Array<{
    id: string;
    description: string;
    points: number;
    timestamp: string;
  }>;
}

export interface WatchlistItem {
  id: string;
  productId: string;
  productName: string;
  category?: ProductCategory;
  initialPrice?: number;
  currentPrice?: number;
  lowestTrackedPrice?: number;
  targetPrice?: number;
  notifyOnPriceDrop: boolean;
  notifyOnInflationSpike: boolean;
  addedAt: string;
}

export interface ModerationItem {
  id: string;
  pricePointId: string;
  productId: string;
  productName: string;
  storeName: string;
  submittedPrice: number;
  previousPrice?: number;
  proofImageUrl?: string;
  flagReason: 'outlier_variance' | 'ocr_low_confidence' | 'user_reported' | 'duplicate';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  contributorId?: string;
  contributorName?: string;
  reviewerNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  pricePoint?: PricePoint;
  product?: Product;
}
