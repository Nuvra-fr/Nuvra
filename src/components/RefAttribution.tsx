'use client';

import { useEffect } from 'react';

/**
 * Attribution: `?ref=CODE` (and its aliases `?aff=`, `?reseller=`) sets a
 * 30-day first-party cookie so referrals survive navigation to checkout.
 * The server-side checkout action reads these cookies as a fallback when
 * the explicit URL parameter is missing.
 */
const PARAMS: [string, string][] = [
  ['ref', 'nuvra_ref'],
  ['aff', 'nuvra_aff'],
  ['reseller', 'nuvra_reseller'],
];

export default function RefAttribution() {
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      let changed = false;
      for (const [param, cookie] of PARAMS) {
        const value = url.searchParams.get(param);
        if (value) {
          document.cookie = `${cookie}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
          url.searchParams.delete(param);
          changed = true;
        }
      }
      if (changed) window.history.replaceState({}, '', url.toString());
    } catch {
      // never block navigation on attribution
    }
  }, []);
  return null;
}
