import type { Metadata } from 'next';
import Link from 'next/link';
import { eq, and, isNull, gt } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, emailVerificationTokens } from '@/db/schema';
import { sha256 } from '@/lib/auth';
import { BrandLogo } from '@/components/BrandLogo';

export const metadata: Metadata = { title: 'Vérification de l’email' };

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
      await db
        .update(users)
        .set({ emailVerifiedAt: new Date() })
        .where(eq(users.id, row.userId))
        .run();
      await db
        .update(emailVerificationTokens)
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
        <BrandLogo size="lg" orientation="stacked" />
      </div>
      <div className="card w-full max-w-md p-7 text-center">
        {status === 'ok' ? (
          <>
            <h1 className="text-lg font-semibold text-emerald-300">
              Email vérifié
            </h1>
            <p className="mt-2 text-sm text-zinc-500">Votre compte est prêt.</p>
            <Link href="/dashboard" className="btn-primary mt-5 inline-flex">
              Ouvrir le tableau de bord
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-lg font-semibold text-zinc-100">
              {status === 'invalid'
                ? 'Lien invalide ou expiré'
                : 'Jeton de vérification manquant'}
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Vous pouvez continuer à utiliser Nuvra — demandez un nouveau lien
              depuis votre profil.
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
