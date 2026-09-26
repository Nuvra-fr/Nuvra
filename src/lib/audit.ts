import { db } from '@/lib/db';
import { auditLogs } from '@/db/schema';

export async function audit(
  action: string,
  opts: { actorUserId?: string | null; target?: string | null; meta?: unknown; ip?: string | null } = {},
): Promise<void> {
  try {
    await db.insert(auditLogs)
      .values({
        action,
        actorUserId: opts.actorUserId ?? null,
        target: opts.target ?? null,
        meta: JSON.stringify(opts.meta ?? {}),
        ip: opts.ip ?? null,
      })
      .run();
  } catch {
    // Auditing must never break the main flow
  }
}
