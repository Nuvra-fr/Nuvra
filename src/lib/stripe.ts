import Stripe from 'stripe';

// ─────────────────────────────────────────────────────────────
// Stripe adapter. When STRIPE_SECRET_KEY is absent, Nuvra runs in
// explicit TEST MODE (paymentsMode() === 'test') — the UI labels it
// loudly; no real money ever moves in test mode.
// ─────────────────────────────────────────────────────────────

let stripeClient: Stripe | null = null;

function readEnv(key: string): string | undefined {
  const v = process.env[key]?.trim();
  return v ? v : undefined;
}

/**
 * Résolution compatible Vercel Marketplace :
 * - priorité au nom exact (STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET)
 * - sinon, accepte tout nom se terminant par _STRIPE_SECRET_KEY / _STRIPE_WEBHOOK_SECRET
 *   ex: Nuvra_STRIPE_SECRET_KEY (comme le fait src/lib/db.ts pour Turso)
 */
function resolveStripeEnv(exactKey: string, suffix: string): string | undefined {
  const exact = readEnv(exactKey);
  if (exact) return exact;
  for (const k of Object.keys(process.env)) {
    if (!k.endsWith(suffix)) continue;
    const v = readEnv(k);
    if (v) return v;
  }
  return undefined;
}

export function getStripeSecretKey(): string | undefined {
  return resolveStripeEnv('STRIPE_SECRET_KEY', '_STRIPE_SECRET_KEY');
}

export function getStripeWebhookSecret(): string | undefined {
  return resolveStripeEnv('STRIPE_WEBHOOK_SECRET', '_STRIPE_WEBHOOK_SECRET');
}

export function paymentsMode(): 'stripe' | 'test' {
  return getStripeSecretKey() ? 'stripe' : 'test';
}

export function stripeConfigured(): boolean {
  return paymentsMode() === 'stripe';
}

export function getStripe(): Stripe | null {
  if (!stripeConfigured()) return null;
  if (!stripeClient) {
    const secret = getStripeSecretKey();
    if (!secret) return null;
    stripeClient = new Stripe(secret, {
      apiVersion: undefined, // use account default
      appInfo: { name: 'Nuvra', version: '0.1.0' },
    });
  }
  return stripeClient;
}

export function constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
  const secret = getStripeWebhookSecret();
  if (!secret) {
    throw new Error(
      'STRIPE_WEBHOOK_SECRET is not configured — add STRIPE_WEBHOOK_SECRET (or a prefixed *_STRIPE_WEBHOOK_SECRET) in Vercel Environment Variables and redeploy',
    );
  }
  const stripe = getStripe();
  if (!stripe) throw new Error('Stripe is not configured (set STRIPE_SECRET_KEY)');
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
    payment_method_types: ['card'],
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
    payment_method_types: ['card'],
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
