import { z } from 'zod';
import { IdSchema, IsoDateSchema, MoneySchema } from './common.js';
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
