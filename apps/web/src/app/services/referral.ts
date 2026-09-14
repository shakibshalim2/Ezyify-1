// Centralized Referral & Commission Engine
// All financial calculations go through this module.
// In production, commission amounts and attribution must be validated server-side.

// ── Types ────────────────────────────────────────────────────────────────────

export type CommissionType = 'percent' | 'fixed';
export type CommissionStatus = 'pending' | 'confirmed' | 'cancelled' | 'refunded' | 'reversed' | 'paid';
export type AttributionModel = 'last' | 'first';
export type ReferralSource = 'repost' | 'share';

export interface CommissionRule {
  type: CommissionType;
  rate: number;          // percent: 0–100, fixed: dollar amount
  maxCommission?: number;
}

export interface ProductReferralConfig {
  enabled: boolean;
  commission: CommissionRule;
  attributionModel: AttributionModel;
  confirmationPeriodDays: number;
  eligibleChannels: ReferralSource[];
}

export interface ReferralAttribution {
  referralId: string;
  referrerId: string;
  productId: string;
  sellerId: string;
  repostId?: string;
  shareId?: string;
  source: ReferralSource;
  campaignId?: string;
  clickTimestamp: number;
  attributionStatus: 'pending' | 'attributed' | 'expired' | 'invalid';
  orderId?: string;
  commissionId?: string;
}

export interface Commission {
  id: string;
  referralId: string;
  referrerId: string;
  productId: string;
  sellerId: string;
  orderId: string;
  orderValue: number;
  commissionRule: CommissionRule;
  commissionAmount: number;
  status: CommissionStatus;
  source: ReferralSource;
  createdAt: number;
  confirmedAt?: number;
  paidAt?: number;
  productName?: string;
  productImage?: string;
}

export interface ReferralEarningsSummary {
  pendingAmount: number;
  confirmedAmount: number;
  paidAmount: number;
  totalClicks: number;
  totalSales: number;
  commissions: Commission[];
}

// ── Platform defaults (Admin-configurable in production) ─────────────────────

const PLATFORM_DEFAULTS: {
  globalDefault: CommissionRule;
  categoryRules: Record<string, CommissionRule>;
  confirmationPeriodDays: number;
  attributionModel: AttributionModel;
  attributionWindowDays: number;
  selfReferralAllowed: boolean;
} = {
  globalDefault: { type: 'percent', rate: 5 },
  categoryRules: {
    Electronics: { type: 'percent', rate: 3, maxCommission: 50 },
    Fashion:     { type: 'percent', rate: 7 },
    Beauty:      { type: 'percent', rate: 8 },
    Sports:      { type: 'percent', rate: 6 },
    Home:        { type: 'percent', rate: 5 },
    Grocery:     { type: 'percent', rate: 2, maxCommission: 10 },
  },
  confirmationPeriodDays: 14,
  attributionModel: 'last',
  attributionWindowDays: 30,
  selfReferralAllowed: false,
};

// ── Commission Engine ─────────────────────────────────────────────────────────

export const CommissionEngine = {
  /**
   * Calculate commission for a given order.
   * Single authoritative source — never duplicate this logic in components.
   */
  calculate(orderValue: number, rule: CommissionRule): number {
    let amount: number;
    if (rule.type === 'percent') {
      amount = (orderValue * rule.rate) / 100;
    } else {
      amount = rule.rate;
    }
    if (rule.maxCommission !== undefined) {
      amount = Math.min(amount, rule.maxCommission);
    }
    return Math.round(amount * 100) / 100;
  },

  /** Preview commission for display on product page (not a financial record). */
  preview(productPrice: number, category?: string): { amount: number; rule: CommissionRule } {
    const rule: CommissionRule = (category ? PLATFORM_DEFAULTS.categoryRules[category] : undefined)
      ?? PLATFORM_DEFAULTS.globalDefault;
    return { amount: this.calculate(productPrice, rule), rule };
  },

  getRuleForCategory(category?: string): CommissionRule {
    return (category ? PLATFORM_DEFAULTS.categoryRules[category] : undefined)
      ?? PLATFORM_DEFAULTS.globalDefault;
  },
};

// ── Referral Service ──────────────────────────────────────────────────────────

const REFERRAL_STORAGE_KEY = 'ezyify_referrals';
const COMMISSION_STORAGE_KEY = 'ezyify_commissions';
const CURRENT_USER_ID = 'user_me'; // In production, from auth context

function loadReferrals(): ReferralAttribution[] {
  try {
    const raw = localStorage.getItem(REFERRAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveReferrals(referrals: ReferralAttribution[]): void {
  try {
    localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(referrals));
  } catch {
    // Storage unavailable
  }
}

function loadCommissions(): Commission[] {
  try {
    const raw = localStorage.getItem(COMMISSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCommissions(commissions: Commission[]): void {
  try {
    localStorage.setItem(COMMISSION_STORAGE_KEY, JSON.stringify(commissions));
  } catch {
    // Storage unavailable
  }
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const ReferralService = {
  /**
   * Create a referral attribution when user reposts or shares a product.
   * Returns the referral ID to attach to URLs/feed items.
   */
  createReferral(params: {
    productId: string;
    sellerId: string;
    source: ReferralSource;
    campaignId?: string;
  }): ReferralAttribution {
    const referralId = generateId('ref');
    const attribution: ReferralAttribution = {
      referralId,
      referrerId: CURRENT_USER_ID,
      productId: params.productId,
      sellerId: params.sellerId,
      source: params.source,
      campaignId: params.campaignId,
      clickTimestamp: Date.now(),
      attributionStatus: 'pending',
    };
    if (params.source === 'repost') {
      attribution.repostId = generateId('rp');
    } else {
      attribution.shareId = generateId('sh');
    }
    const all = loadReferrals();
    all.push(attribution);
    saveReferrals(all);
    return attribution;
  },

  /**
   * Build a referral-tagged product URL.
   * Users never construct this manually — it is generated automatically.
   */
  buildReferralUrl(productId: string, referralId: string): string {
    const base = `${window.location.origin}/product/${productId}`;
    return `${base}?ref=${referralId}`;
  },

  /**
   * Check anti-abuse: prevent self-referral.
   * In production, this validation runs server-side only.
   */
  isSelfReferral(buyerUserId: string, referrerId: string): boolean {
    if (PLATFORM_DEFAULTS.selfReferralAllowed) return false;
    return buyerUserId === referrerId;
  },

  /**
   * Simulate attributing a purchase to the last eligible referral.
   * In production, this is a server-side transaction.
   */
  attributePurchase(params: {
    productId: string;
    buyerUserId: string;
    orderId: string;
    orderValue: number;
    category?: string;
    productName?: string;
    productImage?: string;
  }): Commission | null {
    const referrals = loadReferrals();
    const windowMs = PLATFORM_DEFAULTS.attributionWindowDays * 24 * 60 * 60 * 1000;
    const now = Date.now();

    // Find eligible referrals within attribution window
    const eligible = referrals.filter(r =>
      r.productId === params.productId &&
      r.attributionStatus === 'pending' &&
      now - r.clickTimestamp <= windowMs &&
      !this.isSelfReferral(params.buyerUserId, r.referrerId)
    );

    if (eligible.length === 0) return null;

    // Apply attribution model (last by default)
    const sorted = [...eligible].sort((a, b) => b.clickTimestamp - a.clickTimestamp);
    const attributed = PLATFORM_DEFAULTS.attributionModel === 'first' ? sorted[sorted.length - 1] : sorted[0];

    // Mark referral as attributed
    const updated = referrals.map(r =>
      r.referralId === attributed.referralId
        ? { ...r, attributionStatus: 'attributed' as const, orderId: params.orderId }
        : r
    );
    saveReferrals(updated);

    // Create commission record
    const rule = CommissionEngine.getRuleForCategory(params.category);
    const commissionAmount = CommissionEngine.calculate(params.orderValue, rule);
    const commission: Commission = {
      id: generateId('com'),
      referralId: attributed.referralId,
      referrerId: attributed.referrerId,
      productId: params.productId,
      sellerId: attributed.sellerId,
      orderId: params.orderId,
      orderValue: params.orderValue,
      commissionRule: rule,
      commissionAmount,
      status: 'pending',
      source: attributed.source,
      createdAt: now,
      productName: params.productName,
      productImage: params.productImage,
    };

    const commissions = loadCommissions();
    commissions.push(commission);
    saveCommissions(commissions);

    return commission;
  },

  /**
   * Confirm a commission after the return window passes.
   * In production, this is triggered by a backend job.
   */
  confirmCommission(commissionId: string): void {
    const commissions = loadCommissions().map(c =>
      c.id === commissionId
        ? { ...c, status: 'confirmed' as CommissionStatus, confirmedAt: Date.now() }
        : c
    );
    saveCommissions(commissions);
  },

  /**
   * Cancel/reverse a commission due to order cancellation or refund.
   */
  reverseCommission(orderId: string, reason: 'cancelled' | 'refunded'): void {
    const status: CommissionStatus = reason === 'refunded' ? 'refunded' : 'cancelled';
    const commissions = loadCommissions().map(c =>
      c.orderId === orderId && ['pending', 'confirmed'].includes(c.status)
        ? { ...c, status }
        : c
    );
    saveCommissions(commissions);
  },

  /** Get earnings summary for current user. */
  getEarningsSummary(): ReferralEarningsSummary {
    const commissions = loadCommissions().filter(c => c.referrerId === CURRENT_USER_ID);

    // Seed demo data if empty
    if (commissions.length === 0) {
      return this._demoEarnings();
    }

    const pending   = commissions.filter(c => c.status === 'pending');
    const confirmed = commissions.filter(c => c.status === 'confirmed');
    const paid      = commissions.filter(c => c.status === 'paid');

    return {
      pendingAmount:   pending.reduce((s, c) => s + c.commissionAmount, 0),
      confirmedAmount: confirmed.reduce((s, c) => s + c.commissionAmount, 0),
      paidAmount:      paid.reduce((s, c) => s + c.commissionAmount, 0),
      totalClicks:     loadReferrals().filter(r => r.referrerId === CURRENT_USER_ID).length,
      totalSales:      commissions.filter(c => c.status !== 'cancelled' && c.status !== 'reversed').length,
      commissions,
    };
  },

  /** Demo seed — used only when no real commissions exist yet. */
  _demoEarnings(): ReferralEarningsSummary {
    const now = Date.now();
    const day = 86400000;
    const demo: Commission[] = [
      {
        id: 'com_demo_1', referralId: 'ref_demo_1', referrerId: CURRENT_USER_ID,
        productId: 'p1', sellerId: 's1', orderId: 'ord_001',
        orderValue: 89.99, commissionRule: { type: 'percent', rate: 7 },
        commissionAmount: 6.30, status: 'confirmed', source: 'repost',
        createdAt: now - 5 * day, confirmedAt: now - 1 * day,
        productName: 'Premium Fashion Top', productImage: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=80',
      },
      {
        id: 'com_demo_2', referralId: 'ref_demo_2', referrerId: CURRENT_USER_ID,
        productId: 'p2', sellerId: 's1', orderId: 'ord_002',
        orderValue: 45.00, commissionRule: { type: 'percent', rate: 5 },
        commissionAmount: 2.25, status: 'pending', source: 'share',
        createdAt: now - 2 * day,
        productName: 'Wireless Earbuds', productImage: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=80',
      },
      {
        id: 'com_demo_3', referralId: 'ref_demo_3', referrerId: CURRENT_USER_ID,
        productId: 'p3', sellerId: 's2', orderId: 'ord_003',
        orderValue: 120.00, commissionRule: { type: 'percent', rate: 3, maxCommission: 50 },
        commissionAmount: 3.60, status: 'pending', source: 'repost',
        createdAt: now - 1 * day,
        productName: 'Smart Watch Pro', productImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80',
      },
      {
        id: 'com_demo_4', referralId: 'ref_demo_4', referrerId: CURRENT_USER_ID,
        productId: 'p4', sellerId: 's3', orderId: 'ord_004',
        orderValue: 35.00, commissionRule: { type: 'percent', rate: 8 },
        commissionAmount: 2.80, status: 'paid', source: 'repost',
        createdAt: now - 20 * day, confirmedAt: now - 8 * day, paidAt: now - 3 * day,
        productName: 'Skincare Bundle', productImage: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=80',
      },
    ];
    return {
      pendingAmount:   demo.filter(c => c.status === 'pending').reduce((s, c) => s + c.commissionAmount, 0),
      confirmedAmount: demo.filter(c => c.status === 'confirmed').reduce((s, c) => s + c.commissionAmount, 0),
      paidAmount:      demo.filter(c => c.status === 'paid').reduce((s, c) => s + c.commissionAmount, 0),
      totalClicks: 47,
      totalSales: 4,
      commissions: demo,
    };
  },

  /** Check if user has already reposted this product. */
  hasReposted(productId: string): boolean {
    return loadReferrals().some(
      r => r.productId === productId && r.referrerId === CURRENT_USER_ID && r.source === 'repost'
    );
  },
};
