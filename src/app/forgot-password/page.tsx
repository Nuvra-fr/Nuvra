import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell, ForgotPasswordForm } from '@/components/auth';

export const metadata: Metadata = { title: 'Forgot password' };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a secure reset link."
      footer={
        <Link href="/login" className="font-medium text-nuvra-400 hover:text-nuvra-300">
          Back to sign in
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
