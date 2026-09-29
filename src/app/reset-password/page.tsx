import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell, ResetPasswordForm } from '@/components/auth';

export const metadata: Metadata = { title: 'Nouveau mot de passe' };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <AuthShell
      title="Choisissez un nouveau mot de passe"
      subtitle="Ce lien est valable une heure."
      footer={
        <Link
          href="/login"
          className="font-medium text-nuvra-400 hover:text-nuvra-300"
        >
          Retour à la connexion
        </Link>
      }
    >
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <p className="text-sm text-zinc-500">
          Jeton manquant. Demandez un nouveau lien depuis la{' '}
          <Link href="/forgot-password" className="text-nuvra-400">
            page mot de passe oublié
          </Link>
          .
        </p>
      )}
    </AuthShell>
  );
}
