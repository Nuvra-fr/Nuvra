import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { videoAssets } from '@/db/schema';
import { getAcademyAccess } from '@/lib/academy';
import { verifyMediaGrant } from '@/lib/media-signing';

export const dynamic = 'force-dynamic';

/**
 * Private Academy media.
 *
 * The URL is only valid for the enrolled learner, for five minutes, and the
 * entitlement is re-checked at stream time — a leaked link stops working as
 * soon as the sale is refunded. A SCRIPTED asset has no file: it answers 404
 * rather than pretending to be a video.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ assetId: string }> },
) {
  const { assetId } = await params;
  const url = new URL(request.url);
  const verdict = verifyMediaGrant({
    assetId,
    userId: url.searchParams.get('u'),
    expiresAt: url.searchParams.get('exp'),
    sig: url.searchParams.get('sig'),
  });
  if (!verdict.ok) {
    return NextResponse.json(
      { error: 'Lien vidéo non valide ou expiré' },
      { status: verdict.reason === 'expired' ? 410 : 403 },
    );
  }

  let ctx;
  try {
    ctx = await requireUser();
  } catch {
    return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
  }
  const access = await getAcademyAccess(ctx.user.id);
  if (!access.granted) {
    return NextResponse.json({ error: 'Accès Académie requis' }, { status: 403 });
  }

  const asset = await db
    .select()
    .from(videoAssets)
    .where(eq(videoAssets.id, assetId))
    .get();
  if (!asset) return NextResponse.json({ error: 'Média introuvable' }, { status: 404 });
  if (asset.status !== 'UPLOADED' || !asset.playbackUrl) {
    return NextResponse.json(
      { error: 'Cette vidéo est un script en attente de tournage' },
      { status: 409 },
    );
  }

  // The file itself lives outside the public folder (object storage key) or
  // on the configured media host. Nothing is ever streamed from /public.
  const storageKey = asset.storageKey ?? asset.playbackUrl!;
  if (!/^https:\/\//.test(storageKey)) {
    return NextResponse.json(
      { error: 'Fichier vidéo non hébergé — configurez la clé de stockage dans Admin → Académie.' },
      { status: 501 },
    );
  }

  const upstream = await fetch(storageKey, {
    headers: { Range: request.headers.get('range') ?? '' },
    cache: 'no-store',
  });
  const headers = new Headers();
  for (const h of ['content-type', 'content-length', 'content-range', 'accept-ranges']) {
    const v = upstream.headers.get(h);
    if (v) headers.set(h, v);
  }
  headers.set('Cache-Control', 'private, max-age=60, no-store');
  headers.set('X-Content-Type-Options', 'nosniff');
  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers,
  });
}
