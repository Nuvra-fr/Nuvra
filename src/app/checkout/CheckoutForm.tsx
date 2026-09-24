'use client';

import { useState, useTransition } from 'react';
import { startCheckoutAction } from '@/server/actions/checkout';
import { FormError } from '@/components/auth';

export default function CheckoutForm({
  item,
  defaultName,
  defaultEmail,
  reseller,
  aff,
  requireAccount,
}: {
  item: string;
  defaultName: string;
  defaultEmail: string;
  reseller: string;
  aff: string;
  requireAccount: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [coupon, setCoupon] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await startCheckoutAction({
        item,
        name,
        email,
        coupon: coupon || undefined,
        reseller: reseller || undefined,
        aff: aff || undefined,
      });
      if (!res.ok) setError(res.error);
      // success redirects
    });
  }

  const emailLocked = requireAccount && !!defaultEmail;

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <FormError error={error} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="co-name">Name</label>
          <input
            id="co-name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required={!requireAccount}
          />
        </div>
        <div>
          <label className="label" htmlFor="co-email">Email</label>
          <input
            id="co-email"
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            readOnly={emailLocked}
            required
          />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="co-coupon">Coupon (optional)</label>
        <input
          id="co-coupon"
          className="input"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value.toUpperCase())}
          placeholder="LAUNCH10"
        />
      </div>
      <button className="btn-primary w-full py-3" disabled={pending}>
        {pending ? 'Redirecting…' : 'Continue to payment'}
      </button>
      <p className="text-center text-[11px] text-zinc-600">
        By purchasing you agree to our refund and creator terms.
      </p>
    </form>
  );
}
