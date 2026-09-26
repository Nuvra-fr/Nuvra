import type { Metadata } from 'next';
import Link from 'next/link';
import { eq, and, isNull, gt } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, emailVerificationTokens } from '@/db/schema';
import { sha256 } from '@/lib/auth';
import { Logo } from '@/components/auth';

export const metadata: Metadata = { title: 'Verify email' };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  let status: 'ok' | 'invalid' | 'missing' = 'missing';

  if (token) {
    const row = await db
      .select()
      .from(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.tokenHash, sha256(token)),
          isNull(emailVerificationTokens.usedAt),
          gt(emailVerificationTokens.expiresAt, new Date()),
        ),
      )
      .get();
    if (row) {
      await db.update(users).set({ emailVerifiedAt: new Date() }).where(eq(users.id, row.userId)).run();
      await db.update(emailVerificationTokens)
        .set({ usedAt: new Date() })
        .where(eq(emailVerificationTokens.id, row.id))
        .run();
      status = 'ok';
    } else {
      status = 'invalid';
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="card w-full max-w-md p-7 text-center">
        {status === 'ok' ? (
          <>
            <h1 className="text-lg font-semibold text-emerald-300">Email verified</h1>
            <p className="mt-2 text-sm text-zinc-500">Your account is fully set up.</p>
            <Link href="/dashboard" className="btn-primary mt-5 inline-flex">
              Open dashboard
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-lg font-semibold text-zinc-100">
              {status === 'invalid' ? 'Link invalid or expired' : 'Missing verification token'}
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              You can keep using Nuvra — request a fresh link from your profile settings.
            </p>
            <Link href="/login" className="btn-secondary mt-5 inline-flex">
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
