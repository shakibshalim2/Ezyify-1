/**
 * EZYIFY Escrow System Utilities
 * Helper functions for escrow calculations, timelines, and validations
 */

// Commission and fee calculations
export const PLATFORM_FEE_PERCENTAGE = 0.05; // 5%
export const PROCESSING_FEE_PERCENTAGE = 0.02; // 2%
export const WITHDRAWAL_FEE = 0.50; // $0.50 flat fee

export const DAILY_WITHDRAWAL_LIMIT = 500;
export const WEEKLY_WITHDRAWAL_LIMIT = 2000;
export const MINIMUM_WITHDRAWAL = 5;

export const ESCROW_HOLD_DAYS = 7;
export const MINIMUM_ACCOUNT_AGE_DAYS = 7;
export const PAYMENT_METHOD_VERIFICATION_HOURS = 24;
export const MAX_PAYMENT_METHODS = 5;

/**
 * Calculate seller earnings after platform commission
 */
export function calculateSellerEarnings(grossAmount: number): {
  grossAmount: number;
  platformFee: number;
  processingFee: number;
  netEarnings: number;
} {
  const platformFee = grossAmount * PLATFORM_FEE_PERCENTAGE;
  const processingFee = grossAmount * PROCESSING_FEE_PERCENTAGE;
  const netEarnings = grossAmount - platformFee - processingFee;

  return {
    grossAmount,
    platformFee,
    processingFee,
    netEarnings
  };
}

/**
 * Calculate withdrawal net amount after fees
 */
export function calculateWithdrawalAmount(amount: number): {
  requestedAmount: number;
  withdrawalFee: number;
  netAmount: number;
} {
  return {
    requestedAmount: amount,
    withdrawalFee: WITHDRAWAL_FEE,
    netAmount: amount - WITHDRAWAL_FEE
  };
}

/**
 * Calculate escrow release date
 */
export function calculateEscrowReleaseDate(deliveryDate: Date): Date {
  const releaseDate = new Date(deliveryDate);
  releaseDate.setDate(releaseDate.getDate() + ESCROW_HOLD_DAYS);
  return releaseDate;
}

/**
 * Check if escrow hold period has passed
 */
export function isEscrowHoldExpired(deliveryDate: Date): boolean {
  const releaseDate = calculateEscrowReleaseDate(deliveryDate);
  return new Date() >= releaseDate;
}

/**
 * Get days remaining in escrow hold
 */
export function getDaysRemainingInEscrow(deliveryDate: Date): number {
  const releaseDate = calculateEscrowReleaseDate(deliveryDate);
  const today = new Date();
  const diffTime = releaseDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Format currency consistently
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format relative date (e.g., "2 days ago")
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
  const years = Math.floor(diffDays / 365);
  return `${years} year${years > 1 ? 's' : ''} ago`;
}

/**
 * Check if account age meets minimum requirement
 */
export function isAccountOldEnough(accountCreatedDate: Date): boolean {
  const now = new Date();
  const diffTime = now.getTime() - accountCreatedDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= MINIMUM_ACCOUNT_AGE_DAYS;
}

/**
 * Get account age in days
 */
export function getAccountAgeDays(accountCreatedDate: Date): number {
  const now = new Date();
  const diffTime = now.getTime() - accountCreatedDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Validate withdrawal request
 */
export interface WithdrawalValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateWithdrawal(
  amount: number,
  availableBalance: number,
  dailyUsed: number,
  weeklyUsed: number,
  isKYCVerified: boolean,
  accountAge: number
): WithdrawalValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Critical checks
  if (!isKYCVerified) {
    errors.push('KYC verification required before withdrawal');
  }

  if (accountAge < MINIMUM_ACCOUNT_AGE_DAYS) {
    errors.push(`Account must be at least ${MINIMUM_ACCOUNT_AGE_DAYS} days old`);
  }

  if (amount < MINIMUM_WITHDRAWAL) {
    errors.push(`Minimum withdrawal amount is ${formatCurrency(MINIMUM_WITHDRAWAL)}`);
  }

  if (amount > availableBalance) {
    errors.push('Insufficient available balance');
  }

  if (dailyUsed + amount > DAILY_WITHDRAWAL_LIMIT) {
    errors.push(`Daily withdrawal limit of ${formatCurrency(DAILY_WITHDRAWAL_LIMIT)} exceeded`);
  }

  if (weeklyUsed + amount > WEEKLY_WITHDRAWAL_LIMIT) {
    errors.push(`Weekly withdrawal limit of ${formatCurrency(WEEKLY_WITHDRAWAL_LIMIT)} exceeded`);
  }

  // Warning checks
  if (amount > 100 && accountAge < 14) {
    warnings.push('Large withdrawals from new accounts may require manual review');
  }

  if (dailyUsed + amount > DAILY_WITHDRAWAL_LIMIT * 0.8) {
    warnings.push('Approaching daily withdrawal limit');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Calculate security score based on multiple factors
 */
export interface SecurityScoreFactors {
  kycVerified: boolean;
  twoFactorEnabled: boolean;
  accountAgeDays: number;
  verifiedPaymentMethods: number;
  cleanTransactionHistory: boolean;
}

export function calculateSecurityScore(factors: SecurityScoreFactors): number {
  let score = 0;

  // KYC verified: 25 points
  if (factors.kycVerified) score += 25;

  // 2FA enabled: 20 points
  if (factors.twoFactorEnabled) score += 20;

  // Account age: 15 points (full points at 45+ days)
  const ageScore = Math.min(15, (factors.accountAgeDays / 45) * 15);
  score += ageScore;

  // Verified payment methods: 15 points (3 points per method, max 5 methods)
  const methodScore = Math.min(15, factors.verifiedPaymentMethods * 3);
  score += methodScore;

  // Clean transaction history: 25 points
  if (factors.cleanTransactionHistory) score += 25;

  return Math.round(score);
}

/**
 * Get risk level based on security score
 */
export type RiskLevel = 'low' | 'medium' | 'high';

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 85) return 'low';
  if (score >= 60) return 'medium';
  return 'high';
}

/**
 * Mask account number for display
 */
export function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length <= 4) return accountNumber;
  const lastFour = accountNumber.slice(-4);
  const masked = '•'.repeat(Math.min(accountNumber.length - 4, 8));
  return `${masked}${lastFour}`;
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string, format: 'short' | 'long' | 'full' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    case 'long':
      return d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    case 'full':
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    default:
      return d.toLocaleDateString();
  }
}

/**
 * Check if payment method verification period has passed
 */
export function isPaymentMethodVerified(addedDate: Date): boolean {
  const now = new Date();
  const diffTime = now.getTime() - addedDate.getTime();
  const diffHours = diffTime / (1000 * 60 * 60);
  return diffHours >= PAYMENT_METHOD_VERIFICATION_HOURS;
}

/**
 * Get hours remaining for payment method verification
 */
export function getVerificationHoursRemaining(addedDate: Date): number {
  const now = new Date();
  const diffTime = now.getTime() - addedDate.getTime();
  const diffHours = diffTime / (1000 * 60 * 60);
  const remaining = PAYMENT_METHOD_VERIFICATION_HOURS - diffHours;
  return Math.max(0, Math.ceil(remaining));
}

/**
 * Generate order status message for escrow
 */
export function getEscrowStatusMessage(
  orderStatus: 'pending' | 'shipped' | 'delivered' | 'confirmed' | 'released',
  deliveryDate?: Date
): string {
  switch (orderStatus) {
    case 'pending':
      return 'Payment held in escrow. Processing your order...';
    case 'shipped':
      return 'Payment secured in escrow. Your order is on the way!';
    case 'delivered':
      if (deliveryDate) {
        const daysRemaining = getDaysRemainingInEscrow(deliveryDate);
        return `Delivery confirmed. Funds will be released to seller in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}.`;
      }
      return 'Delivery confirmed. Escrow hold period active.';
    case 'confirmed':
      return 'You confirmed delivery. Escrow hold period active.';
    case 'released':
      return 'Funds released to seller. Thank you for your purchase!';
    default:
      return 'Payment protected by escrow.';
  }
}
