import Stripe from 'stripe';

// ─────────────────────────────────────────────────────────────
// Stripe adapter. When STRIPE_SECRET_KEY is absent, Nuvra runs in
// explicit TEST MODE (paymentsMode() === 'test') — the UI labels it
// loudly; no real money ever moves in test mode.
// ─────────────────────────────────────────────────────────────

let stripeClient: Stripe | null = null;

export function paymentsMode(): 'stripe' | 'test' {
  return process.env.STRIPE_SECRET_KEY?.trim() ? 'stripe' : 'test';
}

export function stripeConfigured(): boolean {
  return paymentsMode() === 'stripe';
}

export function getStripe(): Stripe | null {
  if (!stripeConfigured()) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: undefined, // use account default
      appInfo: { name: 'Nuvra', version: '0.1.0' },
    });
  }
  return stripeClient;
}

export function constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  const stripe = getStripe();
  if (!stripe) throw new Error('Stripe is not configured');
  return stripe.webhooks.constructEvent(payload, signature, secret);
}

export async function createPaymentCheckoutSession(params: {
  orderId: string;
  amountCents: number;
  currency: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}): Promise<{ id: string; url: string }> {
  const stripe = getStripe();
  if (!stripe) throw new Error('Stripe is not configured (set STRIPE_SECRET_KEY)');
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: params.customerEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: params.currency,
          unit_amount: params.amountCents,
          product_data: { name: `Order ${params.orderId.slice(0, 8)}` },
        },
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: { orderId: params.orderId, ...params.metadata },
  });
  return { id: session.id, url: session.url! };
}

export async function createSubscriptionCheckoutSession(params: {
  workspaceId: string;
  planCode: string;
  amountCents: number;
  currency: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ id: string; url: string }> {
  const stripe = getStripe();
  if (!stripe) throw new Error('Stripe is not configured (set STRIPE_SECRET_KEY)');
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: params.customerEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: params.currency,
          unit_amount: params.amountCents,
          recurring: { interval: 'month' },
          product_data: { name: `Nuvra ${params.planCode}` },
        },
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: { workspaceId: params.workspaceId, plan: params.planCode, kind: 'subscription' },
  });
  return { id: session.id, url: session.url! };
}
