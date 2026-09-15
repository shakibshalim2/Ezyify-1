import { z } from 'zod';
import { IdSchema, IsoDateSchema, MoneySchema, PaginationSchema } from './common.js';
import { ProductSummarySchema } from './catalog.js';
import { UserSummarySchema } from './user.js';

export const CartItemSchema = z.object({
  productId: IdSchema,
  variantId: IdSchema.nullable(),
  quantity: z.number().int().min(1).max(99),
  product: ProductSummarySchema,
});
export type CartItem = z.infer<typeof CartItemSchema>;

export const CartSchema = z.object({
  items: z.array(CartItemSchema),
  subtotal: MoneySchema,
  shipping: MoneySchema,
  discount: MoneySchema,
  total: MoneySchema,
  couponCode: z.string().nullable(),
});
export type Cart = z.infer<typeof CartSchema>;

export const OrderStatusSchema = z.enum([
  'pending_payment',
  'paid',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
  'completed',
  'cancelled',
  'refund_requested',
  'refunded',
  'disputed',
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

/** Escrow state machine: held → released | refunded | disputed. */
export const EscrowStatusSchema = z.enum(['held', 'released', 'refunded', 'disputed']);
export type EscrowStatus = z.infer<typeof EscrowStatusSchema>;

export const OrderItemSchema = z.object({
  id: IdSchema,
  productId: IdSchema,
  name: z.string(),
  imageUrl: z.string().url(),
  variant: z.string().nullable(),
  quantity: z.number().int().min(1),
  unitPrice: MoneySchema,
});

/** Latest refund case on an order. `rejected` keeps the order in `refund_requested` so the buyer can withdraw or escalate. */
export const RefundCaseStatusSchema = z.enum(['requested', 'rejected', 'disputed', 'refunded', 'withdrawn']);
export const RefundCaseSchema = z.object({
  id: IdSchema,
  status: RefundCaseStatusSchema,
  reason: z.string(),
  itemIds: z.array(IdSchema),
  sellerResponse: z.string().nullable(),
  disputeReason: z.string().nullable(),
  resolution: z.string().nullable(),
  requestedAt: IsoDateSchema,
  resolvedAt: IsoDateSchema.nullable(),
});
export type RefundCase = z.infer<typeof RefundCaseSchema>;

export const REFUND_REASONS = [
  { id: 'not_received', label: 'Never arrived' },
  { id: 'damaged', label: 'Arrived damaged' },
  { id: 'not_as_described', label: 'Not as described' },
  { id: 'wrong_item', label: 'Wrong item or size' },
  { id: 'changed_mind', label: 'Changed my mind' },
  { id: 'other', label: 'Something else' },
] as const;
export const RefundRequestBodySchema = z.object({
  reason: z.string().trim().min(3, 'Tell the seller what went wrong').max(500),
  itemIds: z.array(IdSchema).default([]),
});
export type RefundRequestBody = z.input<typeof RefundRequestBodySchema>;
export const DeclineRefundRequestSchema = z.object({ response: z.string().trim().min(5, 'Explain your decision to the buyer').max(500) });
export type DeclineRefundRequest = z.infer<typeof DeclineRefundRequestSchema>;
export const DisputeRequestSchema = z.object({ reason: z.string().trim().min(10, 'Describe the problem in a bit more detail').max(1000) });
export type DisputeRequest = z.infer<typeof DisputeRequestSchema>;
export const ResolveDisputeRequestSchema = z.object({ decision: z.enum(['refund', 'release']), note: z.string().trim().min(5, 'Leave a short note for both parties').max(500) });
export type ResolveDisputeRequest = z.infer<typeof ResolveDisputeRequestSchema>;

export const OrderSchema = z.object({
  id: IdSchema,
  orderNumber: z.string(),
  status: OrderStatusSchema,
  escrow: z.object({
    status: EscrowStatusSchema,
    autoReleaseAt: IsoDateSchema.nullable(),
  }),
  seller: UserSummarySchema,
  buyer: UserSummarySchema,
  /** Snapshot of where the parcel goes — only what a seller needs to ship; no full address book exposure. */
  shippingTo: z.object({ recipient: z.string(), city: z.string(), region: z.string().nullable(), country: z.string() }),
  paymentMethod: z.enum(['wallet', 'card', 'bank_transfer', 'cod']),
  note: z.string().nullable(),
  items: z.array(OrderItemSchema).min(1),
  subtotal: MoneySchema,
  shipping: MoneySchema,
  total: MoneySchema,
  tracking: z
    .object({ carrier: z.string(), number: z.string(), url: z.string().url().nullable() })
    .nullable(),
  refund: RefundCaseSchema.nullable().default(null),
  placedAt: IsoDateSchema,
  deliveredAt: IsoDateSchema.nullable(),
});
export type Order = z.infer<typeof OrderSchema>;

export const ShipOrderRequestSchema = z.object({
  carrier: z.string().min(1).max(60),
  number: z.string().min(1).max(80),
  url: z.string().url().optional(),
});
export type ShipOrderRequest = z.infer<typeof ShipOrderRequestSchema>;

/** Seller‑side order counts for hub tabs; `needsAction` = paid (accept) + processing (ship) + refund_requested (decide). */
export const SellerOrdersSummarySchema = z.object({
  total: z.number().int().min(0),
  needsAction: z.number().int().min(0),
  toShip: z.number().int().min(0),
  inTransit: z.number().int().min(0),
  completed: z.number().int().min(0),
  refunds: z.number().int().min(0),
});
export type SellerOrdersSummary = z.infer<typeof SellerOrdersSummarySchema>;

/** Seller overview (`GET /seller/dashboard`): 30‑day window vs the previous 30 days, plus what needs attention today. */
export const SellerDashboardSchema = z.object({
  currency: MoneySchema.shape.currency,
  window: z.object({ from: IsoDateSchema, to: IsoDateSchema, days: z.number().int().min(1) }),
  gross: z.object({ current: MoneySchema, previous: MoneySchema }),
  orders: z.object({ current: z.number().int().min(0), previous: z.number().int().min(0) }),
  averageOrder: z.object({ current: MoneySchema, previous: MoneySchema }),
  escrowHeld: MoneySchema,
  paidOut: MoneySchema,
  rating: z.object({ average: z.number().min(0).max(5), count: z.number().int().min(0) }),
  series: z.array(z.object({ date: z.string(), gross: z.number().int().min(0), orders: z.number().int().min(0) })),
  attention: z.object({ toShip: z.number().int().min(0), refundRequests: z.number().int().min(0), lowStock: z.number().int().min(0), outOfStock: z.number().int().min(0) }),
});
export type SellerDashboard = z.infer<typeof SellerDashboardSchema>;

/** Seller analytics (`GET /seller/analytics`): everything is computed from real order lines in the window. */
export const SellerAnalyticsSchema = z.object({
  currency: MoneySchema.shape.currency,
  window: z.object({ from: IsoDateSchema, to: IsoDateSchema, days: z.number().int().min(1) }),
  totals: z.object({ gross: MoneySchema, orders: z.number().int().min(0), units: z.number().int().min(0), averageOrder: MoneySchema }),
  series: z.array(z.object({ date: z.string(), gross: z.number().int().min(0), orders: z.number().int().min(0), units: z.number().int().min(0) })),
  topProducts: z.array(z.object({ id: IdSchema, name: z.string(), imageUrl: z.string().url(), units: z.number().int().min(0), orders: z.number().int().min(0), gross: MoneySchema, share: z.number().min(0).max(1) })),
  categories: z.array(z.object({ name: z.string(), gross: MoneySchema, units: z.number().int().min(0), share: z.number().min(0).max(1) })),
  customers: z.object({ unique: z.number().int().min(0), repeat: z.number().int().min(0), firstTime: z.number().int().min(0) }),
  fulfillment: z.object({
    /** Mean hours from payment to shipment for orders shipped in the window; null when nothing shipped. */
    avgHoursToShip: z.number().min(0).nullable(),
    completionRate: z.number().min(0).max(1),
    refundRate: z.number().min(0).max(1),
    cancelRate: z.number().min(0).max(1),
  }),
  paymentMix: z.array(z.object({ method: z.enum(['wallet', 'card', 'bank_transfer', 'cod']), orders: z.number().int().min(0), share: z.number().min(0).max(1) })),
});
export type SellerAnalytics = z.infer<typeof SellerAnalyticsSchema>;

/** Seller customers (`GET /seller/customers`): buyers aggregated from the seller's paid orders — no email/phone exposure. */
export const SellerCustomerSchema = z.object({
  user: UserSummarySchema,
  orders: z.number().int().min(1),
  spent: MoneySchema,
  firstOrderAt: IsoDateSchema,
  lastOrderAt: IsoDateSchema,
  /** City/country of the most recent shipment — what a seller needs for logistics, nothing more. */
  lastShippedTo: z.object({ city: z.string(), country: z.string() }).nullable(),
  openOrders: z.number().int().min(0),
});
export type SellerCustomer = z.infer<typeof SellerCustomerSchema>;

export const SellerCustomersResponseSchema = z.object({
  items: z.array(SellerCustomerSchema),
  pagination: PaginationSchema,
  summary: z.object({ total: z.number().int().min(0), repeat: z.number().int().min(0), averageOrder: MoneySchema, averageLifetime: MoneySchema }),
});
export type SellerCustomersResponse = z.infer<typeof SellerCustomersResponseSchema>;
export type SellerCustomerSort = 'recent' | 'spent' | 'orders';

export const OrderEventSchema = z.object({
  status: OrderStatusSchema,
  at: IsoDateSchema,
  note: z.string().nullable(),
});

export const CheckoutRequestSchema = z.object({
  addressId: IdSchema,
  paymentMethod: z.enum(['wallet', 'card', 'bank_transfer', 'cod']),
  couponCode: z.string().optional(),
  note: z.string().max(500).optional(),
});
export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>;

export const WalletSchema = z.object({
  balance: MoneySchema,
  pending: MoneySchema,
  currency: MoneySchema.shape.currency,
});
export type Wallet = z.infer<typeof WalletSchema>;

export const PayoutMethodSchema = z.object({
  id: IdSchema,
  type: z.enum(['bank_account', 'ewallet']),
  label: z.string(),
  holderName: z.string(),
  institution: z.string(),
  /** Only the last 4 digits ever leave the server. */
  accountLast4: z.string().length(4),
  country: z.string().length(2),
  isDefault: z.boolean(),
  createdAt: IsoDateSchema,
});
export type PayoutMethod = z.infer<typeof PayoutMethodSchema>;

export const CreatePayoutMethodRequestSchema = z.object({
  type: z.enum(['bank_account', 'ewallet']).default('bank_account'),
  label: z.string().trim().min(1).max(30),
  holderName: z.string().trim().min(2).max(80),
  institution: z.string().trim().min(2).max(80),
  accountNumber: z.string().trim().regex(/^[0-9A-Za-z-]{6,34}$/, 'Enter a valid account number'),
  routing: z.string().trim().max(34).optional(),
  country: z.string().length(2).default('ID'),
  isDefault: z.boolean().default(false),
});
export type CreatePayoutMethodRequest = z.infer<typeof CreatePayoutMethodRequestSchema>;

export const TransactionSchema = z.object({
  id: IdSchema,
  type: z.enum(['topup', 'purchase', 'refund', 'commission', 'withdrawal', 'transfer']),
  direction: z.enum(['in', 'out']),
  amount: MoneySchema,
  status: z.enum(['pending', 'completed', 'failed']),
  description: z.string(),
  createdAt: IsoDateSchema,
});
export type Transaction = z.infer<typeof TransactionSchema>;

/** Seller earnings (`GET /seller/earnings`): escrow → wallet → bank, with a daily payout series. */
export const SellerEarningsSchema = z.object({
  currency: MoneySchema.shape.currency,
  available: MoneySchema,
  pendingWithdrawal: MoneySchema,
  escrowHeld: MoneySchema,
  paidOutAllTime: MoneySchema,
  /** Month‑to‑date, and the same day range of the previous month for an honest comparison. */
  paidOutThisMonth: MoneySchema,
  paidOutLastMonth: MoneySchema,
  platformFeeAllTime: MoneySchema,
  feeBps: z.number().int().min(0).max(10_000),
  withdrawalMin: MoneySchema,
  series: z.array(z.object({ date: z.string(), released: z.number().int().min(0), withdrawn: z.number().int().min(0) })),
  recentPayouts: z.array(TransactionSchema),
});
export type SellerEarnings = z.infer<typeof SellerEarningsSchema>;


/** Address book entry (GET/POST /addresses). Country is ISO‑3166‑1 alpha‑2. */
export const AddressSchema = z.object({
  id: IdSchema,
  label: z.string().min(1).max(30),
  recipient: z.string().min(1).max(80),
  phone: z.string().min(6).max(20),
  line1: z.string().min(1).max(120),
  line2: z.string().max(120).nullable().optional(),
  city: z.string().min(1).max(80),
  region: z.string().max(80).nullable().optional(),
  postal: z.string().min(2).max(12),
  country: z.string().length(2),
  isDefault: z.boolean().default(false),
});
export type Address = z.infer<typeof AddressSchema>;
export const CreateAddressRequestSchema = AddressSchema.omit({ id: true }).extend({
  line2: z.string().max(120).optional(),
  region: z.string().max(80).optional(),
  isDefault: z.boolean().optional(),
});
export type CreateAddressRequest = z.infer<typeof CreateAddressRequestSchema>;
