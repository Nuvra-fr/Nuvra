/**
 * Next.js instrumentation hook — runs once when the server process starts
 * (`next start` / `next dev`), never during `next build`.
 * Applies migrations and provisions the first admin (see src/lib/startup.ts).
 *
 * The bootstrap is strictly Node-only (libSQL, `node:fs`, `node:crypto`), but
 * `next dev` compiles this file for the Edge runtime as well (to support edge
 * middleware instrumentation) — and the Edge compiler rejects `node:` scheme
 * imports, which used to fail the whole dev server with
 * `UnhandledSchemeError: Reading from "node:crypto" is not handled`.
 *
 * The positive `=== 'nodejs'` form below is required: Next replaces
 * `process.env.NEXT_RUNTIME` at compile time, so webpack folds the branch away
 * and never resolves the Node-only module graph in the Edge pass.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { runStartupTasks } = await import('@/lib/startup');
    await runStartupTasks();
  }
}
