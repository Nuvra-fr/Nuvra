import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell, RegisterForm } from '@/components/auth';

export const metadata: Metadata = { title: 'Create account' };

export default function RegisterPage() {
  return (
    <AuthShell
      title="Start for free"
      subtitle="No credit card. The Nuvra platform is free to use."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-nuvra-400 hover:text-nuvra-300">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
