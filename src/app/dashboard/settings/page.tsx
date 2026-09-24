import type { Metadata } from 'next';
import Link from 'next/link';
import { CreditCard, Globe, Shield } from 'lucide-react';
import { eq } from 'drizzle-orm';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { customDomains } from '@/db/schema';
import { paymentsMode } from '@/lib/stripe';
import { emailProvider } from '@/lib/email';
import { aiProviderConfigured } from '@/lib/ai';
import { flagEnabled } from '@/lib/config';
import { PageHeader, Badge, InlineAlert, Card } from '@/components/ui';
import WorkspaceForm from './WorkspaceForm';
import DomainForm from './DomainForm';

export const metadata: Metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const ctx = await requireUser();
  const domains = db.select().from(customDomains).where(eq(customDomains.workspaceId, ctx.workspace.id)).all();

  const integrations = [
    { name: 'Stripe (payments)', ok: paymentsMode() === 'stripe', hint: paymentsMode() === 'stripe' ? 'configured' : 'set STRIPE_SECRET_KEY' },
    { name: 'Email provider', ok: emailProvider() === 'RESEND', hint: emailProvider() === 'RESEND' ? 'Resend live' : 'set RESEND_API_KEY (outbox otherwise)' },
    { name: 'Nuvra AI', ok: aiProviderConfigured() && flagEnabled('ai'), hint: aiProviderConfigured() ? (flagEnabled('ai') ? 'configured' : 'flag disabled') : 'set AI_API_KEY' },
    { name: 'Marketplace flag', ok: flagEnabled('marketplace'), hint: flagEnabled('marketplace') ? 'enabled' : 'disabled by admin' },
    { name: 'Affiliates flag', ok: flagEnabled('affiliates'), hint: flagEnabled('affiliates') ? 'enabled' : 'disabled by admin' },
    { name: 'Custom domains flag', ok: flagEnabled('customDomains'), hint: flagEnabled('customDomains') ? 'enabled' : 'disabled by admin' },
  ];

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Workspace, integrations and domains."
        actions={
          <Link href="/dashboard/settings/billing" className="btn-secondary">
            <CreditCard className="h-4 w-4" /> Billing & plan
          </Link>
        }
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <WorkspaceForm
          initialName={ctx.workspace.name}
          initialSlug={ctx.workspace.slug}
          username={ctx.profile?.username ?? ''}
        />

        <Card padded>
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-200">
            <Shield className="h-4 w-4 text-nuvra-400" /> Integrations status
          </div>
          <div className="space-y-2.5">
            {integrations.map((i) => (
              <div key={i.name} className="flex items-center justify-between rounded-lg border border-white/[0.07] px-3.5 py-2.5">
                <div>
                  <div className="text-sm text-zinc-300">{i.name}</div>
                  <div className="text-[11px] text-zinc-600">{i.hint}</div>
                </div>
                <Badge tone={i.ok ? 'green' : 'amber'}>{i.ok ? 'OK' : 'SETUP'}</Badge>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11px] text-zinc-600">
            Nothing is faked: features requiring a credential show precise setup instructions until
            you connect them (see .env.example).
          </p>
        </Card>

        <Card padded className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-200">
            <Globe className="h-4 w-4 text-nuvra-400" /> Custom domains
          </div>
          {!flagEnabled('customDomains') ? (
            <InlineAlert tone="warning">
              Custom domains are available on Nuvra Pro and currently gated by the{' '}
              <code>customDomains</code> feature flag (disabled by admin).
            </InlineAlert>
          ) : null}
          <DomainForm domains={domains.map((d) => ({ id: d.id, domain: d.domain, status: d.status }))} />
        </Card>
      </div>
    </div>
  );
}
