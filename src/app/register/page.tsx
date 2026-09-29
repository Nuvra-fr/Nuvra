import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell, RegisterForm } from '@/components/auth';

export const metadata: Metadata = { title: 'Créer un compte' };

export default function RegisterPage() {
  return (
    <AuthShell
      title="Commencer gratuitement"
      subtitle="Sans carte bancaire. La plateforme Nuvra est gratuite."
      footer={
        <>
          Vous avez déjà un compte ?{' '}
          <Link
            href="/login"
            className="font-medium text-nuvra-400 hover:text-nuvra-300"
          >
            Se connecter
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
