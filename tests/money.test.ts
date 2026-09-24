import { describe, expect, it } from 'vitest';
import {
  academySplit,
  applyCoupon,
  assertCents,
  creatorSplit,
  estimateProcessorFee,
  formatCents,
  platformFeeFor,
  refundSplit,
  splitByBps,
} from '@/lib/money';

describe('splitByBps', () => {
  it('splits 90/10 for a 9000 bps recipient', () => {
    expect(splitByBps(19700, 9000)).toEqual({ sellerCents: 17730, platformCents: 1970 });
  });

  it('gives the whole amount at 10000 bps', () => {
    expect(splitByBps(4900, 10000)).toEqual({ sellerCents: 4900, platformCents: 0 });
  });

  it('gives nothing at 0 bps', () => {
    expect(splitByBps(4900, 0)).toEqual({ sellerCents: 0, platformCents: 4900 });
  });

  it('floors the seller share and keeps the remainder on the platform side', () => {
    // 333 * 1/3 style rounding: 100 cents at 3333 bps → seller 33, platform 67
    const s = splitByBps(100, 3333);
    expect(s.sellerCents + s.platformCents).toBe(100);
    expect(s.sellerCents).toBe(Math.floor((100 * 3333) / 10000));
  });

  it('rejects out-of-range bps', () => {
    expect(() => splitByBps(100, 10001)).toThrow();
    expect(() => splitByBps(100, -1)).toThrow();
    expect(() => splitByBps(100, 10.5)).toThrow();
  });

  it('rejects non-integer cents', () => {
    expect(() => splitByBps(10.5, 5000)).toThrow();
    expect(() => splitByBps(-1, 5000)).toThrow();
  });
});

describe('academySplit (reseller 90/10, admin-configurable bps)', () => {
  it('defaults to reseller 90 % / Nuvra 10 %', () => {
    expect(academySplit(19700)).toEqual({ sellerCents: 17730, platformCents: 1970 });
  });

  it('honours a custom reseller bps', () => {
    expect(academySplit(10000, 8000)).toEqual({ sellerCents: 8000, platformCents: 2000 });
  });
});

describe('creatorSplit (platform fee on FREE, 0 % on Pro+)', () => {
  it('takes 10 % (1000 bps) from a FREE creator — the rest goes to the creator', () => {
    expect(creatorSplit(4900, 'FREE', 1000)).toEqual({ sellerCents: 4410, platformCents: 490 });
    expect(creatorSplit(1900, 'FREE', 1000)).toEqual({ sellerCents: 1710, platformCents: 190 });
    expect(creatorSplit(1, 'FREE', 1000)).toEqual({ sellerCents: 1, platformCents: 0 });
  });

  it('takes 0 % on PRO, BUSINESS and AGENCY', () => {
    expect(creatorSplit(4900, 'PRO')).toEqual({ sellerCents: 4900, platformCents: 0 });
    expect(creatorSplit(4900, 'BUSINESS')).toEqual({ sellerCents: 4900, platformCents: 0 });
    expect(creatorSplit(4900, 'AGENCY')).toEqual({ sellerCents: 4900, platformCents: 0 });
  });

  it('uses the admin-configured free commission bps', () => {
    expect(creatorSplit(10000, 'FREE', 500)).toEqual({ sellerCents: 9500, platformCents: 500 });
    expect(creatorSplit(10000, 'FREE', 0)).toEqual({ sellerCents: 10000, platformCents: 0 });
  });

  it('never loses a cent: seller + platform always equals gross', () => {
    for (const cents of [1, 7, 99, 1234, 4900, 19700, 129999]) {
      const s = creatorSplit(cents, 'FREE', 1000);
      expect(s.sellerCents + s.platformCents).toBe(cents);
    }
  });
});

describe('platformFeeFor', () => {
  it('matches creatorSplit platform side', () => {
    expect(platformFeeFor(4900, 'FREE', 1000)).toBe(490);
    expect(platformFeeFor(4900, 'PRO', 1000)).toBe(0);
  });
});

describe('refundSplit', () => {
  it('returns the same proportions as the original sale', () => {
    expect(refundSplit(19700, 19700, 9000)).toEqual({ sellerCents: 17730, platformCents: 1970 });
    expect(refundSplit(4900, 4900, 9000)).toEqual({ sellerCents: 4410, platformCents: 490 });
  });

  it('handles partial refunds', () => {
    const r = refundSplit(10000, 2500, 9000);
    expect(r.sellerCents + r.platformCents).toBe(2500);
    expect(r.sellerCents).toBe(2250);
  });

  it('rejects refunds above the original amount', () => {
    expect(() => refundSplit(1000, 1001, 9000)).toThrow();
  });
});

describe('applyCoupon', () => {
  it('applies percent-off and floors', () => {
    expect(applyCoupon(10000, 20)).toBe(8000);
    expect(applyCoupon(999, 15)).toBe(849); // 849.15 → 849
  });

  it('caps at free', () => {
    expect(applyCoupon(5000, 100)).toBe(0);
    expect(applyCoupon(5000, 150)).toBe(0);
  });

  it('is identity for <= 0 %', () => {
    expect(applyCoupon(5000, 0)).toBe(5000);
    expect(applyCoupon(5000, -5)).toBe(5000);
  });
});

describe('estimateProcessorFee (never hidden — display-only helper)', () => {
  it('computes 2.9 % + 30¢', () => {
    expect(estimateProcessorFee(1000)).toBe(59); // 29 + 30
    expect(estimateProcessorFee(0)).toBe(0);
  });
});

describe('formatCents', () => {
  it('formats USD and EUR', () => {
    expect(formatCents(129900)).toBe('$1,299.00');
    expect(formatCents(4900, 'eur')).toBe('€49.00');
    expect(formatCents(5)).toBe('$0.05');
  });
});

describe('assertCents', () => {
  it('accepts non-negative integers only', () => {
    expect(() => assertCents(0, 'x')).not.toThrow();
    expect(() => assertCents(-1, 'x')).toThrow();
    expect(() => assertCents(1.5, 'x')).toThrow();
  });
});
