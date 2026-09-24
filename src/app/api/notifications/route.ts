import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { listNotifications, markAllRead } from '@/lib/notifications';

export async function GET(): Promise<Response> {
  const ctx = await getSession();
  if (!ctx) return NextResponse.json({ ok: false, error: 'Unauthenticated' }, { status: 401 });
  const items = listNotifications(ctx.user.id, 15).map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    link: n.link,
    readAt: n.readAt?.toISOString() ?? null,
    createdAt: n.createdAt.toISOString(),
  }));
  return NextResponse.json({ ok: true, items });
}

export async function POST(): Promise<Response> {
  const ctx = await getSession();
  if (!ctx) return NextResponse.json({ ok: false, error: 'Unauthenticated' }, { status: 401 });
  markAllRead(ctx.user.id);
  return NextResponse.json({ ok: true });
}
