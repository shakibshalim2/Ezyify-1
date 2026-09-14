import { Inject, Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { ENV, type Env } from '../../config.js';
import { AuditService } from '../../common/audit.service.js';
import { ApiException, notFound, validation } from '../../common/errors.js';
import { WalletService } from '../wallet/wallet.service.js';
import { OrdersService } from '../orders/orders.service.js';

/**
 * Stripe adapter. Two flows:
 *  - wallet top-up: PaymentIntent with metadata.kind=topup → credit on `payment_intent.succeeded`
 *  - card checkout: PaymentIntent per order group → orders move pending_payment → paid on success
 * Webhooks are verified with the signing secret against the raw body and de-duplicated by event id (ASVS 13.2).
 */
@Injectable()
export class PaymentsService {
  private readonly log = new Logger(PaymentsService.name);
  private readonly stripe: Stripe | null;

  constructor(private readonly prisma: PrismaService, private readonly wallet: WalletService, private readonly orders: OrdersService, private readonly audit: AuditService, @Inject(ENV) private readonly env: Env) {
    this.stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY, { typescript: true }) : null;
  }

  get enabled() {
    return !!this.stripe;
  }

  async createTopupIntent(userId: string, amount: number, currency: string, idempotencyKey?: string) {
    const stripe = this.requireStripe();
    const intent = await stripe.paymentIntents.create(
      { amount, currency: currency.toLowerCase(), automatic_payment_methods: { enabled: true }, metadata: { kind: 'topup', userId } },
      idempotencyKey ? { idempotencyKey } : undefined,
    );
    return { clientSecret: intent.client_secret, intentId: intent.id, amount, currency };
  }

  /** Attaches a PaymentIntent to every order of a pending checkout so the client can confirm the card payment. */
  async createOrderIntent(userId: string, orderIds: string[], idempotencyKey?: string) {
    const stripe = this.requireStripe();
    const orders = await this.prisma.order.findMany({ where: { id: { in: orderIds }, buyerId: userId, status: 'pending_payment' } });
    if (!orders.length || orders.length !== orderIds.length) throw notFound('Pending order');
    const amount = orders.reduce((n, o) => n + o.total, 0);
    const intent = await stripe.paymentIntents.create(
      { amount, currency: orders[0].currency.toLowerCase(), automatic_payment_methods: { enabled: true }, metadata: { kind: 'order', userId, orderIds: orderIds.join(',') } },
      idempotencyKey ? { idempotencyKey } : undefined,
    );
    await this.prisma.order.updateMany({ where: { id: { in: orderIds } }, data: { paymentIntentId: intent.id } });
    return { clientSecret: intent.client_secret, intentId: intent.id, amount, currency: orders[0].currency };
  }

  /** Verifies signature, rejects replays, then applies the side-effect exactly once. */
  async handleWebhook(rawBody: Buffer | string, signature: string | undefined, ip?: string) {
    const stripe = this.requireStripe();
    if (!this.env.STRIPE_WEBHOOK_SECRET) throw new ApiException('SERVER_ERROR', 'Webhook secret not configured');
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature ?? '', this.env.STRIPE_WEBHOOK_SECRET);
    } catch (e) {
      await this.audit.log('payment.webhook_rejected', { ip, meta: { reason: (e as Error).message } });
      throw new ApiException('UNAUTHORIZED', 'Invalid webhook signature');
    }
    return this.applyEvent(event, ip);
  }

  /** Separated from signature verification so tests can drive it with synthetic events. */
  async applyEvent(event: Pick<Stripe.Event, 'id' | 'type' | 'data'>, ip?: string) {
    const seen = await this.prisma.webhookEvent.findUnique({ where: { id: event.id } });
    if (seen) return { received: true, duplicate: true };
    await this.prisma.webhookEvent.create({ data: { id: event.id, provider: 'stripe', type: event.type } });

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as Stripe.PaymentIntent;
      const meta = intent.metadata ?? {};
      if (meta.kind === 'topup' && meta.userId) {
        await this.wallet.credit(meta.userId, intent.amount, intent.currency.toUpperCase() as never, 'topup', 'Top up · Card', `stripe:${intent.id}`);
      } else if (meta.kind === 'order' && meta.orderIds) {
        for (const id of meta.orderIds.split(',')) {
          const order = await this.prisma.order.findUnique({ where: { id }, select: { status: true } });
          if (order?.status === 'pending_payment') await this.orders.transition(id, 'paid', 'system', 'stripe', `Card payment confirmed · ${intent.id}`);
        }
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object as Stripe.PaymentIntent;
      const ids = intent.metadata?.orderIds?.split(',') ?? [];
      for (const id of ids) {
        const order = await this.prisma.order.findUnique({ where: { id }, select: { status: true } });
        if (order?.status === 'pending_payment') await this.orders.transition(id, 'cancelled', 'system', 'stripe', 'Card payment failed');
      }
    } else if (event.type === 'charge.refunded') {
      this.log.log(`charge.refunded ${event.id} acknowledged; refunds are driven by the order state machine`);
    }
    await this.audit.log('payment.webhook', { ip, meta: { id: event.id, type: event.type } });
    return { received: true, duplicate: false };
  }

  private requireStripe() {
    if (!this.stripe) throw validation({ paymentMethod: 'Card payments are not enabled on this server' }, 'Payments unavailable');
    return this.stripe;
  }
}
