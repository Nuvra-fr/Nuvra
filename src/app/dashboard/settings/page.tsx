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

export const metadata: Metadata = { title: 'Paramètres' };

export default async function SettingsPage() {
  const ctx = await requireUser();
  const domains = await db
    .select()
    .from(customDomains)
    .where(eq(customDomains.workspaceId, ctx.workspace.id))
    .all();

  const integrations = [
    {
      name: 'Stripe (payments)',
      ok: paymentsMode() === 'stripe',
      hint:
        paymentsMode() === 'stripe' ? 'configured' : 'set STRIPE_SECRET_KEY',
    },
    {
      name: 'Fournisseur d’email',
      ok: emailProvider() === 'RESEND',
      hint:
        emailProvider() === 'RESEND'
          ? 'Resend actif'
          : 'définir RESEND_API_KEY (sinon file d’envoi)',
    },
    {
      name: 'Nuvra AI',
      ok: aiProviderConfigured() && (await flagEnabled('ai')),
      hint: aiProviderConfigured()
        ? (await flagEnabled('ai'))
          ? 'configured'
          : 'option désactivée'
        : 'set AI_API_KEY',
    },
    {
      name: 'Option marketplace',
      ok: flagEnabled('marketplace'),
      hint: (await flagEnabled('marketplace'))
        ? 'activé'
        : 'désactivé par l’admin',
    },
    {
      name: 'Option affiliation',
      ok: flagEnabled('affiliates'),
      hint: (await flagEnabled('affiliates'))
        ? 'activé'
        : 'désactivé par l’admin',
    },
    {
      name: 'Option domaines personnalisés',
      ok: flagEnabled('customDomains'),
      hint: (await flagEnabled('customDomains'))
        ? 'activé'
        : 'désactivé par l’admin',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Paramètres"
        description="Espace de travail, intégrations et domaines."
        actions={
          <Link href="/dashboard/settings/billing" className="btn-secondary">
            <CreditCard className="h-4 w-4" /> Facturation & plan
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <WorkspaceForm
          initialName={ctx.workspace.name}
          initialSlug={ctx.workspace.slug}
          username={ctx.profile?.username ?? ''}
        />

        <Card padded>
          <div className="mb-4 flex items-center gap-2 section-title">
            <Shield className="h-4 w-4 text-nuvra-400" /> État des intégrations
          </div>
          <div className="space-y-2.5">
            {integrations.map((i) => (
              <div
                key={i.name}
                className="flex items-center justify-between rounded-xl border border-white/[0.07] px-3.5 py-2.5"
              >
                <div>
                  <div className="text-sm text-zinc-300">{i.name}</div>
                  <div className="text-[11px] text-zinc-600">{i.hint}</div>
                </div>
                <Badge tone={i.ok ? 'green' : 'amber'}>
                  {i.ok ? 'OK' : 'SETUP'}
                </Badge>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11px] text-zinc-600">
            Rien n&apos;est simulé : les fonctions qui demandent une clé
            affichent les étapes de configuration jusqu&apos;à la connexion
            (voir .env.example).
          </p>
        </Card>

        <Card padded className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-2 section-title">
            <Globe className="h-4 w-4 text-nuvra-400" /> Custom domains
          </div>
          {!(await flagEnabled('customDomains')) ? (
            <InlineAlert tone="warning">
              Les domaines personnalisés sont inclus dans Nuvra Pro et
              actuellement bloqués par l’option <code>customDomains</code>.
            </InlineAlert>
          ) : null}
          <DomainForm
            domains={domains.map((d) => ({
              id: d.id,
              domain: d.domain,
              status: d.status,
            }))}
          />
        </Card>
      </div>
    </div>
  );
}
