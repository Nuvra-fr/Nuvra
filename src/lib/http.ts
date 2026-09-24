export function jsonOk(data: Record<string, unknown> = {}, init?: ResponseInit): Response {
  return Response.json({ ok: true, ...data }, init);
}

export function jsonError(error: string, status = 400, extra?: Record<string, unknown>): Response {
  return Response.json({ ok: false, error, ...extra }, { status });
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json();
    if (body && typeof body === 'object') return body as Record<string, unknown>;
    return {};
  } catch {
    return {};
  }
}
