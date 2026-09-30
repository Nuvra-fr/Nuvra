import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { videoAssets } from '@/db/schema';
import { getAcademyAccess, getVideoProgressRow } from '@/lib/academy';
import { issueMediaGrant } from '@/lib/media-signing';
import { safeJson } from '@/lib/utils';

export const dynamic = 'force-dynamic';

/**
 * Entitlement-checked video descriptor for the Academy player.
 *
 * Returns the chapters, the transcript and the package (script + storyboard).
 * `playbackUrl` is only ever set for a real uploaded file, through a signed
 * five-minute URL. A scripted lesson gets `status: SCRIPTED` and no URL.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ assetId: string }> },
) {
  const { assetId } = await params;
  let ctx;
  try {
    ctx = await requireUser();
  } catch {
    return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
  }
  const access = await getAcademyAccess(ctx.user.id);
  if (!access.granted || !access.enrollment) {
    return NextResponse.json({ error: 'Accès Académie requis' }, { status: 403 });
  }

  const asset = await db
    .select()
    .from(videoAssets)
    .where(eq(videoAssets.id, assetId))
    .get();
  if (!asset) return NextResponse.json({ error: 'Média introuvable' }, { status: 404 });

  const base = {
    id: asset.id,
    title: asset.title,
    description: asset.description,
    status: asset.status,
    durationSec: asset.durationSec,
    thumbnailUrl: asset.thumbnailUrl,
    chapters: safeJson<{ title: string; time: number }[]>(asset.chapters, []),
    storyboard: safeJson<
      { time: string; visual: string; narration: string; onScreenText: string }[]
    >(asset.storyboard, []),
    script: asset.script,
    transcript: asset.transcript,
  };

  if (asset.status !== 'UPLOADED' || !asset.playbackUrl) {
    return NextResponse.json({ ...base, playbackUrl: null, progress: null });
  }

  const origin = new URL(request.url).origin;
  const grant = issueMediaGrant({ assetId: asset.id, userId: ctx.user.id, origin });
  const progress = await getVideoProgressRow(access.enrollment.id, asset.lessonId ?? '');

  return NextResponse.json({
    ...base,
    playbackUrl: grant.url,
    expiresIn: grant.expiresIn,
    progress: progress
      ? { positionSec: progress.positionSec, percent: progress.percent }
      : null,
  });
}
