import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { contacts, contactActivities, workspaces } from '@/db/schema';
import { jsonError, jsonOk, readJson } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';
import { emitEvent } from '@/lib/events';
import { getIp } from '@/lib/auth';

const schema = z.object({
  workspaceId: z.string().min(1).optional(),
  pagePath: z.string().max(300).optional(),
  email: z.string().email(),
  name: z.string().max(120).optional(),
});

/** Public lead capture — called by the form block on published pages. */
export async function POST(req: Request): Promise<Response> {
  const ip = await getIp();
  const rl = rateLimit(`lead:${ip ?? 'unknown'}`, 20, 60);
  if (!rl.ok) return jsonError('Too many submissions. Try again shortly.', 429);

  const body = await readJson(req);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError('A valid email is required.');

  let workspaceId = parsed.data.workspaceId ?? null;

  // Resolve workspace from the page path when not provided directly
  if (!workspaceId && parsed.data.pagePath) {
    const parts = parsed.data.pagePath.split('/').filter(Boolean);
    if (parts[0] === 'p' && parts[1]) {
      const ws = db.select().from(workspaces).where(eq(workspaces.slug, parts[1])).get();
      workspaceId = ws?.id ?? null;
    }
  }
  if (!workspaceId) return jsonError('Unknown workspace.', 404);

  const email = parsed.data.email.toLowerCase().trim();
  let contact = db
    .select()
    .from(contacts)
    .where(and(eq(contacts.workspaceId, workspaceId), eq(contacts.email, email)))
    .get();

  if (!contact) {
    contact = db
      .insert(contacts)
      .values({
        workspaceId,
        email,
        name: parsed.data.name ?? null,
        status: 'LEAD',
        source: parsed.data.pagePath ? 'funnel' : 'manual',
      })
      .returning()
      .get();
    db.insert(contactActivities)
      .values({ contactId: contact.id, type: 'lead.created', summary: `Captured from ${parsed.data.pagePath ?? 'form'}` })
      .run();
    emitEvent({
      name: 'lead.created',
      workspaceId,
      payload: { email, name: parsed.data.name ?? '', contactId: contact.id, path: parsed.data.pagePath },
    });
  }

  return jsonOk({ contactId: contact.id });
}
