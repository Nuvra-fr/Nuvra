import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell, ForgotPasswordForm } from '@/components/auth';

export const metadata: Metadata = { title: 'Mot de passe oublié' };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Réinitialiser votre mot de passe"
      subtitle="Nous vous envoyons un lien sécurisé par email."
      footer={
        <Link
          href="/login"
          className="font-medium text-nuvra-400 hover:text-nuvra-300"
        >
          Retour à la connexion
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
