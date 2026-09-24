import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell, ResetPasswordForm } from '@/components/auth';

export const metadata: Metadata = { title: 'New password' };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <AuthShell
      title="Choose a new password"
      subtitle="This link is valid for one hour."
      footer={
        <Link href="/login" className="font-medium text-nuvra-400 hover:text-nuvra-300">
          Back to sign in
        </Link>
      }
    >
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <p className="text-sm text-zinc-500">
          Missing token. Request a new link on the{' '}
          <Link href="/forgot-password" className="text-nuvra-400">
            forgot password page
          </Link>
          .
        </p>
      )}
    </AuthShell>
  );
}
