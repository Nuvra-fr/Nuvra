import { processDueEmails } from '@/lib/email';
import { processWaitingRuns } from '@/lib/events';

/**
 * Scheduled maintenance endpoint:
 *  • delivers due SCHEDULED emails (sequence delays)
 *  • resumes automations paused by a `wait` action
 *
 * Protect with CRON_SECRET. Two accepted forms:
 *   • `x-cron-secret: <secret>`            (manual calls, CI, uptime checks)
 *   • `Authorization: Bearer <secret>`     (Vercel Cron sends this automatically)
 * Works locally without a secret ONLY when NODE_ENV=development.
 */
export async function POST(req: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  const bearer = req.headers.get('authorization');
  const provided = req.headers.get('x-cron-secret') ?? (bearer?.startsWith('Bearer ') ? bearer.slice(7) : null);
  const isDev = process.env.NODE_ENV === 'development';

  if (secret) {
    if (provided !== secret) {
      return Response.json({ ok: false, error: 'Invalid cron secret' }, { status: 401 });
    }
  } else if (!isDev) {
    return Response.json(
      { ok: false, error: 'CRON_SECRET is not configured — refusing to run in production' },
      { status: 503 },
    );
  }

  const emails = await processDueEmails();
  const runs = await processWaitingRuns();
  return Response.json({ ok: true, emails, runs });
}

export async function GET(req: Request): Promise<Response> {
  return POST(req);
}
