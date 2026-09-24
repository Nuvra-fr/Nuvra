import type { Metadata } from 'next';
import { desc } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { emailLogs } from '@/db/schema';
import { PageHeader, StatusBadge, Badge, InlineAlert, Stat } from '@/components/ui';
import { formatDateTime } from '@/lib/utils';
import { emailProvider } from '@/lib/email';
import RunQueueButton from './RunQueueButton';

export const metadata: Metadata = { title: 'Admin — Email queue' };

export default async function AdminEmailsPage() {
  await requireAdmin();
  const rows = db.select().from(emailLogs).orderBy(desc(emailLogs.createdAt)).limit(200).all();
  const scheduled = rows.filter((r) => r.status === 'SCHEDULED').length;
  const queued = rows.filter((r) => r.status === 'QUEUED').length;
  const failed = rows.filter((r) => r.status === 'FAILED').length;

  return (
    <div>
      <PageHeader
        title="Email queue / outbox"
        description="Every message Nuvra attempted to send. With no provider configured, messages stay here — undelivered, clearly labeled."
        actions={<RunQueueButton />}
      />

      <div className="mb-5">
        <InlineAlert tone={emailProvider() === 'RESEND' ? 'success' : 'warning'}>
          Provider: <strong>{emailProvider() === 'RESEND' ? 'Resend (live delivery)' : 'OUTBOX (not delivered)'}</strong>
          {emailProvider() === 'OUTBOX' ? ' — set RESEND_API_KEY to deliver for real.' : ''}
        </InlineAlert>
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <Stat label="Scheduled" value={String(scheduled)} hint="delayed sequence steps" />
        <Stat label="In outbox" value={String(queued)} />
        <Stat label="Failed" value={String(failed)} />
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>To</th>
              <th>Subject</th>
              <th>Channel</th>
              <th>Status</th>
              <th>Related</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-zinc-600">No emails recorded.</td></tr>
            ) : (
              rows.map((e) => (
                <tr key={e.id}>
                  <td className="text-zinc-300">{e.toEmail}</td>
                  <td>
                    <div className="text-zinc-300">{e.subject}</div>
                    <details className="text-[11px] text-zinc-600">
                      <summary className="cursor-pointer text-nuvra-500">preview</summary>
                      <pre className="mt-1 max-w-md whitespace-pre-wrap rounded bg-ink-900 p-2 text-[11px] text-zinc-500">{e.body.slice(0, 500)}</pre>
                    </details>
                  </td>
                  <td><Badge tone={e.channel === 'RESEND' ? 'green' : 'purple'}>{e.channel}</Badge></td>
                  <td><StatusBadge status={e.status} /></td>
                  <td className="text-[11px] text-zinc-600">{e.relatedTo ?? '—'}</td>
                  <td className="text-zinc-500">{formatDateTime(e.scheduledAt ?? e.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
