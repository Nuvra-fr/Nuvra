import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { getAcademyAccess, evaluateNuvraAction } from '@/lib/academy';

export const dynamic = 'force-dynamic';

const query = z.object({
  check: z.string().min(1).max(60),
});

/**
 * Completion check for a "Lab Nuvra" button.
 *
 * The client calls this when the learner comes back from the builder: the
 * button turns green only when the object really exists in the workspace.
 */
export async function GET(request: Request) {
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
  const parsed = query.safeParse(
    Object.fromEntries(new URL(request.url).searchParams.entries()),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: 'Vérification invalide' }, { status: 400 });
  }
  const state = await evaluateNuvraAction(
    ctx.workspace.id,
    ctx.user.id,
    parsed.data.check,
    access.enrollment?.id,
  );
  return NextResponse.json(state);
}
