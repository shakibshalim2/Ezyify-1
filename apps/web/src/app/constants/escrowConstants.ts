/**
 * EZYIFY Escrow System Constants
 * Centralized configuration for all escrow-related values
 */

// ============================================================================
// FINANCIAL CONSTANTS
// ============================================================================

export const FINANCIAL = {
  // Commission & Fees
  PLATFORM_FEE_PERCENTAGE: 0.05,      // 5%
  PROCESSING_FEE_PERCENTAGE: 0.02,    // 2%
  TOTAL_COMMISSION_PERCENTAGE: 0.07,  // 7% (5% + 2%)
  WITHDRAWAL_FEE: 0.50,               // $0.50 flat fee

  // Withdrawal Limits
  MINIMUM_WITHDRAWAL: 5,              // $5
  DAILY_WITHDRAWAL_LIMIT: 500,        // $500
  WEEKLY_WITHDRAWAL_LIMIT: 2000,      // $2,000
  MONTHLY_WITHDRAWAL_LIMIT: 8000,     // $8,000 (informational)

  // Payment Processing
  MINIMUM_ORDER_AMOUNT: 1,            // $1
  MAXIMUM_ORDER_AMOUNT: 10000,        // $10,000 per order
} as const;

// ============================================================================
// TIME-BASED CONSTANTS
// ============================================================================

export const TIME_PERIODS = {
  // Escrow Timeline
  ESCROW_HOLD_DAYS: 7,                           // 7 days after delivery
  AUTO_CONFIRM_DELIVERY_DAYS: 7,                 // Auto-confirm if buyer doesn't confirm
  DISPUTE_WINDOW_DAYS: 30,                       // 30 days to file dispute after delivery
  
  // Account Requirements
  MINIMUM_ACCOUNT_AGE_DAYS: 7,                   // Account must be 7 days old
  RECOMMENDED_ACCOUNT_AGE_DAYS: 14,              // Recommended for higher limits
  ESTABLISHED_ACCOUNT_AGE_DAYS: 45,              // For security score bonus

  // Verification Periods
  PAYMENT_METHOD_VERIFICATION_HOURS: 24,         // 24 hours to verify new payment method
  KYC_VERIFICATION_HOURS: 48,                    // 48 hours for KYC review
  EMAIL_VERIFICATION_HOURS: 24,                  // 24 hours to verify email

  // Limit Reset Periods
  DAILY_LIMIT_RESET_HOUR_UTC: 0,                 // Midnight UTC
  WEEKLY_LIMIT_RESET_DAY: 0,                     // Sunday (0 = Sunday)
  
  // Session & Cache
  SESSION_TIMEOUT_MINUTES: 30,                   // 30 minutes inactivity
  CACHE_TTL_MINUTES: 15,                         // 15 minutes cache
} as const;

// ============================================================================
// SECURITY CONSTANTS
// ============================================================================

export const SECURITY = {
  // Security Score Points
  SCORE_KYC_VERIFIED: 25,
  SCORE_2FA_ENABLED: 20,
  SCORE_ACCOUNT_AGE_MAX: 15,                    // Max points for account age
  SCORE_PAYMENT_METHODS_MAX: 15,                // Max points for verified methods
  SCORE_CLEAN_HISTORY: 25,                      // Clean transaction history
  SCORE_TOTAL_MAX: 100,

  // Security Score Thresholds
  SCORE_LOW_RISK_THRESHOLD: 85,                 // >= 85 = Low risk
  SCORE_MEDIUM_RISK_THRESHOLD: 60,              // 60-84 = Medium risk
  // < 60 = High risk

  // Account Restrictions
  MAX_FAILED_LOGIN_ATTEMPTS: 5,
  LOGIN_LOCKOUT_DURATION_MINUTES: 30,
  MAX_WITHDRAWAL_ATTEMPTS_PER_HOUR: 10,
  MAX_PASSWORD_RESET_REQUESTS_PER_DAY: 3,

  // Fraud Detection
  VELOCITY_CHECK_WINDOW_HOURS: 24,              // Check activity in last 24h
  MAX_WITHDRAWALS_PER_DAY: 10,                  // Max number of withdrawal attempts
  SUSPICIOUS_ACTIVITY_THRESHOLD: 5,             // Flag after 5 suspicious events
  
  // Payment Methods
  MAX_PAYMENT_METHODS: 5,
  MIN_PAYMENT_METHODS: 1,
  PAYMENT_METHOD_CHANGE_COOLDOWN_HOURS: 24,     // Wait period after adding method
} as const;

// ============================================================================
// STATUS ENUMS
// ============================================================================

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  IN_TRANSIT: 'in-transit',
  DELIVERED: 'delivered',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  CAPTURED: 'captured',
  IN_ESCROW: 'in-escrow',
  HOLDING: 'holding',
  RELEASED: 'released',
  REFUNDED: 'refunded',
  FAILED: 'failed',
  DISPUTED: 'disputed',
} as const;

export const WITHDRAWAL_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  APPROVED: 'approved',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  UNDER_REVIEW: 'under-review',
  FLAGGED: 'flagged',
  BLOCKED: 'blocked',
} as const;

export const KYC_STATUS = {
  NOT_STARTED: 'not-started',
  IN_PROGRESS: 'in-progress',
  PENDING_REVIEW: 'pending-review',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
} as const;

export const DISPUTE_STATUS = {
  OPEN: 'open',
  UNDER_REVIEW: 'under-review',
  WAITING_BUYER: 'waiting-buyer',
  WAITING_SELLER: 'waiting-seller',
  ESCALATED: 'escalated',
  RESOLVED_BUYER: 'resolved-buyer',
  RESOLVED_SELLER: 'resolved-seller',
  RESOLVED_PARTIAL: 'resolved-partial',
  CLOSED: 'closed',
} as const;

// ============================================================================
// PAYMENT METHOD TYPES
// ============================================================================

export const PAYMENT_METHOD_TYPE = {
  BANK_TRANSFER: 'bank-transfer',
  PAYPAL: 'paypal',
  STRIPE_CONNECT: 'stripe-connect',
  VENMO: 'venmo',
  CASH_APP: 'cash-app',
} as const;

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHOD_TYPE.BANK_TRANSFER]: 'Bank Transfer',
  [PAYMENT_METHOD_TYPE.PAYPAL]: 'PayPal',
  [PAYMENT_METHOD_TYPE.STRIPE_CONNECT]: 'Stripe Connect',
  [PAYMENT_METHOD_TYPE.VENMO]: 'Venmo',
  [PAYMENT_METHOD_TYPE.CASH_APP]: 'Cash App',
} as const;

export const PAYMENT_METHOD_PROCESSING_TIME = {
  [PAYMENT_METHOD_TYPE.BANK_TRANSFER]: '1-3 business days',
  [PAYMENT_METHOD_TYPE.PAYPAL]: 'Instant',
  [PAYMENT_METHOD_TYPE.STRIPE_CONNECT]: '1-2 business days',
  [PAYMENT_METHOD_TYPE.VENMO]: 'Instant',
  [PAYMENT_METHOD_TYPE.CASH_APP]: 'Instant',
} as const;

// ============================================================================
// RISK LEVELS
// ============================================================================

export const RISK_LEVEL = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const RISK_LEVEL_LABELS = {
  [RISK_LEVEL.LOW]: 'Low Risk',
  [RISK_LEVEL.MEDIUM]: 'Medium Risk',
  [RISK_LEVEL.HIGH]: 'High Risk',
  [RISK_LEVEL.CRITICAL]: 'Critical Risk',
} as const;

export const RISK_LEVEL_COLORS = {
  [RISK_LEVEL.LOW]: 'green',
  [RISK_LEVEL.MEDIUM]: 'yellow',
  [RISK_LEVEL.HIGH]: 'orange',
  [RISK_LEVEL.CRITICAL]: 'red',
} as const;

// ============================================================================
// ALERT TYPES
// ============================================================================

export const ALERT_TYPE = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
} as const;

// ============================================================================
// EVENT TYPES (for logging/analytics)
// ============================================================================

export const EVENT_TYPE = {
  // Withdrawal Events
  WITHDRAWAL_INITIATED: 'withdrawal.initiated',
  WITHDRAWAL_COMPLETED: 'withdrawal.completed',
  WITHDRAWAL_FAILED: 'withdrawal.failed',
  WITHDRAWAL_FLAGGED: 'withdrawal.flagged',
  
  // Escrow Events
  ESCROW_CAPTURED: 'escrow.captured',
  ESCROW_RELEASED: 'escrow.released',
  ESCROW_FROZEN: 'escrow.frozen',
  DELIVERY_CONFIRMED: 'delivery.confirmed',
  
  // Security Events
  LOGIN_SUCCESS: 'security.login.success',
  LOGIN_FAILED: 'security.login.failed',
  PASSWORD_CHANGED: 'security.password.changed',
  TWO_FA_ENABLED: 'security.2fa.enabled',
  SUSPICIOUS_ACTIVITY: 'security.suspicious.activity',
  ACCOUNT_LOCKED: 'security.account.locked',
  
  // KYC Events
  KYC_STARTED: 'kyc.started',
  KYC_SUBMITTED: 'kyc.submitted',
  KYC_VERIFIED: 'kyc.verified',
  KYC_REJECTED: 'kyc.rejected',
  
  // Payment Method Events
  PAYMENT_METHOD_ADDED: 'payment.method.added',
  PAYMENT_METHOD_VERIFIED: 'payment.method.verified',
  PAYMENT_METHOD_REMOVED: 'payment.method.removed',
  
  // Dispute Events
  DISPUTE_FILED: 'dispute.filed',
  DISPUTE_RESOLVED: 'dispute.resolved',
  REFUND_REQUESTED: 'refund.requested',
  REFUND_APPROVED: 'refund.approved',
} as const;

// ============================================================================
// NOTIFICATION PREFERENCES
// ============================================================================

export const NOTIFICATION_TYPE = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  IN_APP: 'in-app',
} as const;

export const NOTIFICATION_TRIGGER = {
  WITHDRAWAL_COMPLETED: 'withdrawal_completed',
  WITHDRAWAL_FAILED: 'withdrawal_failed',
  ESCROW_RELEASED: 'escrow_released',
  DELIVERY_CONFIRMED: 'delivery_confirmed',
  PAYMENT_RECEIVED: 'payment_received',
  SECURITY_ALERT: 'security_alert',
  KYC_VERIFIED: 'kyc_verified',
  DISPUTE_FILED: 'dispute_filed',
} as const;

// ============================================================================
// ERROR CODES
// ============================================================================

export const ERROR_CODE = {
  // Authentication Errors
  AUTH_INVALID_CREDENTIALS: 'AUTH_001',
  AUTH_SESSION_EXPIRED: 'AUTH_002',
  AUTH_ACCOUNT_LOCKED: 'AUTH_003',
  
  // KYC Errors
  KYC_NOT_VERIFIED: 'KYC_001',
  KYC_DOCUMENTS_MISSING: 'KYC_002',
  KYC_VERIFICATION_FAILED: 'KYC_003',
  
  // Withdrawal Errors
  WITHDRAWAL_INSUFFICIENT_BALANCE: 'WD_001',
  WITHDRAWAL_DAILY_LIMIT_EXCEEDED: 'WD_002',
  WITHDRAWAL_WEEKLY_LIMIT_EXCEEDED: 'WD_003',
  WITHDRAWAL_ACCOUNT_TOO_NEW: 'WD_004',
  WITHDRAWAL_NO_PAYMENT_METHOD: 'WD_005',
  WITHDRAWAL_FLAGGED: 'WD_006',
  WITHDRAWAL_MINIMUM_NOT_MET: 'WD_007',
  
  // Payment Method Errors
  PM_MAX_METHODS_REACHED: 'PM_001',
  PM_VERIFICATION_PENDING: 'PM_002',
  PM_INVALID_DETAILS: 'PM_003',
  PM_ALREADY_EXISTS: 'PM_004',
  
  // Escrow Errors
  ESCROW_FUNDS_FROZEN: 'ESC_001',
  ESCROW_DISPUTE_ACTIVE: 'ESC_002',
  ESCROW_HOLD_ACTIVE: 'ESC_003',
  
  // General Errors
  INTERNAL_SERVER_ERROR: 'ERR_500',
  NETWORK_ERROR: 'ERR_NETWORK',
  VALIDATION_ERROR: 'ERR_VALIDATION',
} as const;

// ============================================================================
// REGEX PATTERNS
// ============================================================================

export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  POSTAL_CODE: /^[A-Z0-9]{3,10}$/i,
  ACCOUNT_NUMBER: /^[0-9]{8,20}$/,
  ROUTING_NUMBER: /^[0-9]{9}$/,
  AMOUNT: /^\d+(\.\d{1,2})?$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
} as const;

// ============================================================================
// API ENDPOINTS (for reference)
// ============================================================================

export const API_ENDPOINTS = {
  // Seller Endpoints
  SELLER_BALANCE: '/api/seller/balance',
  SELLER_WITHDRAW: '/api/seller/withdraw',
  SELLER_WITHDRAWAL_HISTORY: '/api/seller/withdrawal-history',
  SELLER_EARNINGS: '/api/seller/earnings',
  SELLER_SECURITY_SCORE: '/api/seller/security-score',
  SELLER_SECURITY_EVENTS: '/api/seller/security-events',
  
  // Payment Methods
  PAYMENT_METHODS: '/api/seller/payment-methods',
  PAYMENT_METHOD_ADD: '/api/seller/payment-methods/add',
  PAYMENT_METHOD_VERIFY: '/api/seller/payment-methods/verify',
  PAYMENT_METHOD_DELETE: '/api/seller/payment-methods/delete',
  
  // KYC
  KYC_START: '/api/seller/kyc/start',
  KYC_SUBMIT: '/api/seller/kyc/submit',
  KYC_STATUS: '/api/seller/kyc/status',
  
  // Orders & Escrow
  ORDER_DETAILS: '/api/orders/:orderId',
  CONFIRM_DELIVERY: '/api/orders/:orderId/confirm-delivery',
  ESCROW_STATUS: '/api/orders/:orderId/escrow-status',
  
  // Disputes & Refunds
  FILE_DISPUTE: '/api/orders/:orderId/dispute',
  REQUEST_REFUND: '/api/orders/:orderId/refund',
} as const;

// ============================================================================
// FEATURE FLAGS (for gradual rollout)
// ============================================================================

export const FEATURE_FLAGS = {
  ESCROW_SYSTEM_ENABLED: true,
  SECURITY_MONITORING_ENABLED: true,
  KYC_REQUIRED_FOR_WITHDRAWAL: true,
  TWO_FACTOR_AUTHENTICATION: true,
  BIOMETRIC_AUTHENTICATION: false,          // Future feature
  MULTI_CURRENCY_SUPPORT: false,            // Future feature
  AUTOMATED_FRAUD_DETECTION: true,
  REAL_TIME_NOTIFICATIONS: true,
} as const;

// ============================================================================
// SUPPORT INFORMATION
// ============================================================================

export const SUPPORT = {
  EMAIL: 'seller-support@ezyify.com',
  PHONE: '1-800-EZYIFY-1',
  LIVE_CHAT_HOURS: '9 AM - 9 PM EST',
  EMERGENCY_CONTACT: 'security@ezyify.com',
  RESPONSE_TIME_HOURS: 24,
} as const;

// ============================================================================
// EXPORT ALL
// ============================================================================

export const ESCROW_CONSTANTS = {
  FINANCIAL,
  TIME_PERIODS,
  SECURITY,
  ORDER_STATUS,
  PAYMENT_STATUS,
  WITHDRAWAL_STATUS,
  KYC_STATUS,
  DISPUTE_STATUS,
  PAYMENT_METHOD_TYPE,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_PROCESSING_TIME,
  RISK_LEVEL,
  RISK_LEVEL_LABELS,
  RISK_LEVEL_COLORS,
  ALERT_TYPE,
  EVENT_TYPE,
  NOTIFICATION_TYPE,
  NOTIFICATION_TRIGGER,
  ERROR_CODE,
  REGEX_PATTERNS,
  API_ENDPOINTS,
  FEATURE_FLAGS,
  SUPPORT,
} as const;

export default ESCROW_CONSTANTS;
