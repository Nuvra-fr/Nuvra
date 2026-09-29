// ─────────────────────────────────────────────────────────────
// Payment-claim verification.
//
// A Stripe Checkout Session is a *claim* that an order was paid. It must never
// be trusted on its own: the session has to be bound to the exact order it is
// used to finalize, and the amount actually charged has to match the amount the
// order asks for. Without these checks, anyone who paid any order could replay
// their `cs_…` session id against another (more expensive) pending order and
// have it marked PAID — see the regression test in tests/payment-integrity.test.ts.
//
// Pure functions, no I/O: the caller retrieves the session from Stripe and the
// order from the database, then asks this module whether finalizing is allowed.
// ─────────────────────────────────────────────────────────────

/** The subset of a Stripe Checkout Session the verification needs. */
export interface CheckoutSessionClaim {
  id?: string | null;
  payment_status?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  metadata?: Record<string, string> | null;
}

/** The subset of a Nuvra order the verification needs. */
export interface OrderClaim {
  id: string;
  totalCents: number;
  currency: string;
  /** PENDING | PAID | REFUNDED | PARTIALLY_REFUNDED | FAILED | CANCELED */
  status: string;
  /** LIVE | TEST — a Stripe session may only finalize a LIVE order. */
  mode: string;
}

export type ClaimRejection =
  | 'not_paid'
  | 'wrong_order'
  | 'amount_mismatch'
  | 'currency_mismatch'
  | 'order_not_pending'
  | 'order_not_live';

export type ClaimVerdict =
  { ok: true } | { ok: false; reason: ClaimRejection; detail: string };

export function verifyCheckoutSessionForOrder(
  session: CheckoutSessionClaim,
  order: OrderClaim,
): ClaimVerdict {
  if (session.payment_status !== 'paid') {
    return {
      ok: false,
      reason: 'not_paid',
      detail: `session ${session.id ?? '?'} : statut ${session.payment_status ?? 'inconnu'}`,
    };
  }

  const claimedOrderId = session.metadata?.orderId?.trim();
  if (!claimedOrderId || claimedOrderId !== order.id) {
    return {
      ok: false,
      reason: 'wrong_order',
      detail: `la session ${session.id ?? '?'} appartient à la commande ${claimedOrderId ?? '(aucune)'}, pas à ${order.id}`,
    };
  }

  if (session.amount_total !== order.totalCents) {
    return {
      ok: false,
      reason: 'amount_mismatch',
      detail: `la session a encaissé ${session.amount_total ?? '?'} ${session.currency ?? ''}, la commande demande ${order.totalCents} ${order.currency}`,
    };
  }

  if ((session.currency ?? '').toLowerCase() !== order.currency.toLowerCase()) {
    return {
      ok: false,
      reason: 'currency_mismatch',
      detail: `devise de la session ${session.currency ?? '?'} ≠ devise de la commande ${order.currency}`,
    };
  }

  if (order.status !== 'PENDING') {
    return {
      ok: false,
      reason: 'order_not_pending',
      detail: `commande ${order.id} : statut ${order.status}`,
    };
  }

  if (order.mode !== 'LIVE') {
    return {
      ok: false,
      reason: 'order_not_live',
      detail: `commande ${order.id} en mode ${order.mode} — Stripe ne peut pas finaliser une commande de test`,
    };
  }

  return { ok: true };
}
