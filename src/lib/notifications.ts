import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { memberships, notifications } from '@/db/schema';
import { and, isNull } from 'drizzle-orm';

export interface NotifyInput {
  type: string;
  title: string;
  body?: string | null;
  link?: string | null;
}

/** Notify every member of a workspace (used by sales, refunds, payments). */
export async function notifyWorkspaceOwners(workspaceId: string, input: NotifyInput): Promise<void> {
  const rows = await db
    .select({ userId: memberships.userId })
    .from(memberships)
    .where(eq(memberships.workspaceId, workspaceId))
    .all();
  if (rows.length === 0) return;
  for (const { userId } of rows) {
    await db.insert(notifications)
      .values({
        userId,
        workspaceId,
        type: input.type,
        title: input.title,
        body: input.body ?? null,
        link: input.link ?? null,
      })
      .run();
  }
}

export async function listNotifications(userId: string, limit = 20) {
  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .all();
}

export async function unreadCount(userId: string): Promise<number> {
  return (await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)))
    .all()).length;
}

export async function markAllRead(userId: string): Promise<void> {
  await db.update(notifications).set({ readAt: new Date() }).where(eq(notifications.userId, userId)).run();
}
