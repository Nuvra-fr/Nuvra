import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth';
import { getAllConfig, flagEnabled } from '@/lib/config';
import { PageHeader, InlineAlert } from '@/components/ui';
import BusinessSettingsForm from './BusinessSettingsForm';
import FlagsForm from './FlagsForm';

export const metadata: Metadata = { title: 'Admin — Paramètres' };

export default async function AdminSettingsPage() {
  await requireAdmin();
  const cfg = await getAllConfig();

  return (
    <div>
      <PageHeader
        title="Paramètres plateforme"
        description="Prix, commissions, quotas et options — modifiables sans toucher au code."
      />

      <div className="mb-5">
        <InlineAlert tone="info">
          Chaque valeur ci-dessous est lue en direct par le paiement, le grand
          livre et l&apos;interface. Nothing is hardcoded in the frontend.
        </InlineAlert>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BusinessSettingsForm
          initial={{
            academyPrice: Number(cfg['academy.priceCents'] ?? 19700),
            proPrice: Number(cfg['pro.priceCents'] ?? 2900),
            businessPrice: Number(cfg['business.priceCents'] ?? 9900),
            freeCommissionBps: Number(cfg['commission.freeBps'] ?? 1000),
            resellerBps: Number(cfg['commission.resellerBps'] ?? 9000),
            payoutHoldDays: Number(cfg['payouts.holdDays'] ?? 7),
            aiFreeCredits: Number(cfg['ai.freeCredits'] ?? 20),
            aiProCredits: Number(cfg['ai.proCredits'] ?? 200),
          }}
        />
        <FlagsForm
          flags={{
            ai: await flagEnabled('ai'),
            marketplace: await flagEnabled('marketplace'),
            affiliates: await flagEnabled('affiliates'),
            customDomains: await flagEnabled('customDomains'),
            templates: await flagEnabled('templates'),
            advancedAnalytics: await flagEnabled('advancedAnalytics'),
            beta: await flagEnabled('beta'),
          }}
        />
      </div>
    </div>
  );
}
