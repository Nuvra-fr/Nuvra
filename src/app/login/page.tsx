import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell, LoginForm } from '@/components/auth';

export const metadata: Metadata = { title: 'Connexion' };

export default function LoginPage() {
  return (
    <AuthShell
      title="Bon retour"
      subtitle="Connectez-vous à votre espace Nuvra."
      footer={
        <>
          Nouveau sur Nuvra ?{' '}
          <Link
            href="/register"
            className="font-medium text-nuvra-400 hover:text-nuvra-300"
          >
            Créer un compte gratuit
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
