import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell, LoginForm } from '@/components/auth';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your Nuvra workspace."
      footer={
        <>
          New to Nuvra?{' '}
          <Link href="/register" className="font-medium text-nuvra-400 hover:text-nuvra-300">
            Create a free account
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
