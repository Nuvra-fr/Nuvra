/**
 * Next.js instrumentation hook — runs once when the server process starts
 * (`next start` / `next dev`), never during `next build`.
 * Applies migrations and provisions the first admin (see src/lib/startup.ts).
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  const { runStartupTasks } = await import('@/lib/startup');
  await runStartupTasks();
}
