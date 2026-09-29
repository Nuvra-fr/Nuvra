import type { Metadata } from 'next';
import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { Mail, Zap } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  contacts,
  emailCampaigns,
  emailLogs,
  emailSequenceSteps,
  emailSequences,
} from '@/db/schema';
import { emailProvider } from '@/lib/email';
import {
  EmptyState,
  PageHeader,
  StatusBadge,
  Badge,
  InlineAlert,
} from '@/components/ui';
import { formatDateTime, timeAgo } from '@/lib/utils';
import NewCampaignDialog from './NewCampaignDialog';
import SendCampaignButton from './SendCampaignButton';

export const metadata: Metadata = { title: 'Emails' };

export default async function EmailsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const ctx = await requireUser();
  const sp = await searchParams;
  const tab =
    sp.tab === 'sequences'
      ? 'sequences'
      : sp.tab === 'outbox'
        ? 'outbox'
        : 'campaigns';

  const campaigns = await db
    .select()
    .from(emailCampaigns)
    .where(eq(emailCampaigns.workspaceId, ctx.workspace.id))
    .orderBy(desc(emailCampaigns.updatedAt))
    .all();

  const sequences = await db
    .select()
    .from(emailSequences)
    .where(eq(emailSequences.workspaceId, ctx.workspace.id))
    .orderBy(desc(emailSequences.updatedAt))
    .all();

  const outbox = await db
    .select()
    .from(emailLogs)
    .orderBy(desc(emailLogs.createdAt))
    .limit(60)
    .all();

  const contactCount = (
    await db
      .select({ id: contacts.id })
      .from(contacts)
      .where(eq(contacts.workspaceId, ctx.workspace.id))
      .all()
  ).length;

  return (
    <div>
      <PageHeader
        title="Emails"
        description="Campagnes, séquences automatiques et file d’envoi."
        actions={tab === 'campaigns' ? <NewCampaignDialog /> : null}
      />

      <div className="mb-5">
        <InlineAlert
          tone={emailProvider() === 'RESEND' ? 'success' : 'warning'}
        >
          Delivery provider:{' '}
          <strong>
            {emailProvider() === 'RESEND'
              ? 'Resend (livraison réelle)'
              : 'File d’envoi Nuvra'}
          </strong>
          {emailProvider() === 'OUTBOX' ? (
            <>
              {' '}
              — aucun <code>RESEND_API_KEY</code> configuré : chaque message est
              enregistré et visible ci-dessous dans la file d&apos;envoi au lieu
              d&apos;être livré. Définissez la clé pour livrer réellement.
            </>
          ) : null}
        </InlineAlert>
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-white/[0.07]">
        {[
          { id: 'campaigns', label: 'Campagnes', href: '/dashboard/emails' },
          {
            id: 'sequences',
            label: 'Séquences',
            href: '/dashboard/emails?tab=sequences',
          },
          {
            id: 'outbox',
            label: 'File d’envoi',
            href: '/dashboard/emails?tab=outbox',
          },
        ].map((t) => (
          <Link
            key={t.id}
            href={t.href}
            className={`whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-medium ${
              tab === t.id
                ? 'border-nuvra-500 text-zinc-100'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {tab === 'campaigns' &&
        (campaigns.length === 0 ? (
          <EmptyState
            icon={<Mail className="h-8 w-8" />}
            title="Aucune campagne"
            description={`Envoyez une campagne à vos ${contactCount} contact(s), avec segments et personnalisation.`}
            action={<NewCampaignDialog />}
          />
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Campagne</th>
                  <th>Segment</th>
                  <th>Statut</th>
                  <th>Envoyés</th>
                  <th>Mis à jour</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="font-medium text-zinc-200">{c.name}</div>
                      <div className="text-xs text-zinc-600">{c.subject}</div>
                    </td>
                    <td className="text-zinc-500">{c.segment}</td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="tabular-nums text-zinc-500">
                      {c.sentCount}
                    </td>
                    <td className="text-zinc-500">{timeAgo(c.updatedAt)}</td>
                    <td>
                      <div className="flex justify-end gap-2">
                        {c.status !== 'SENT' ? (
                          <SendCampaignButton id={c.id} />
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

      {tab === 'sequences' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Link
              href="/dashboard/emails?tab=sequences"
              className="btn-secondary !text-xs"
            >
              <Zap className="h-3.5 w-3.5" /> Astuce : les séquences se
              déclenchent sur des événements métier
            </Link>
          </div>
          {sequences.length === 0 ? (
            <EmptyState
              icon={<Zap className="h-8 w-8" />}
              title="Aucune séquence"
              description="Une séquence envoie des emails programmés quand un déclencheur se produit : lead.created, purchase.completed, course.started…"
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {await Promise.all(
                sequences.map(async (s) => {
                  const steps = await db
                    .select()
                    .from(emailSequenceSteps)
                    .where(eq(emailSequenceSteps.sequenceId, s.id))
                    .all();
                  return (
                    <div key={s.id} className="card card-body">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="section-title">{s.name}</div>
                          <div className="text-xs text-zinc-600">
                            on {s.triggerEvent}
                          </div>
                        </div>
                        <Badge tone={s.active ? 'green' : 'default'}>
                          {s.active ? 'ACTIVE' : 'PAUSED'}
                        </Badge>
                      </div>
                      <div className="mt-3 space-y-1.5">
                        {steps.map((st, i) => (
                          <div
                            key={st.id}
                            className="flex items-center gap-2 text-xs text-zinc-500"
                          >
                            <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px]">
                              {i === 0 ? 'now' : `+${st.delayHours}h`}
                            </span>
                            <span className="truncate">{st.subject}</span>
                          </div>
                        ))}
                        {steps.length === 0 ? (
                          <span className="text-xs text-zinc-600">
                            Aucune étape
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                }),
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'outbox' && (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>À</th>
                <th>Objet</th>
                <th>Canal</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {outbox.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-zinc-600">
                    No messages recorded yet.
                  </td>
                </tr>
              ) : (
                outbox.map((e) => (
                  <tr key={e.id}>
                    <td className="text-zinc-300">{e.toEmail}</td>
                    <td className="text-zinc-400">{e.subject}</td>
                    <td>
                      <Badge tone={e.channel === 'RESEND' ? 'green' : 'purple'}>
                        {e.channel}
                      </Badge>
                    </td>
                    <td>
                      <StatusBadge status={e.status} />
                    </td>
                    <td className="text-zinc-500">
                      {formatDateTime(e.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
