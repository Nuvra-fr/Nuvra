import { requireUser } from '@/lib/auth';
import { paymentsMode } from '@/lib/stripe';
import { unreadCount } from '@/lib/notifications';
import DashboardChrome from '@/components/DashboardChrome';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireUser();

  return (
    <DashboardChrome
      user={{
        name: ctx.user.name,
        email: ctx.user.email,
        role: ctx.user.role,
      }}
      workspace={{
        name: ctx.workspace.name,
        slug: ctx.workspace.slug,
        plan: ctx.workspace.plan,
      }}
      unread={unreadCount(ctx.user.id)}
      testMode={paymentsMode() === 'test'}
    >
      {children}
    </DashboardChrome>
  );
}
