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
