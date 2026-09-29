'use client';

import { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="glass-panel animate-panelIn w-full max-w-md rounded-3xl p-8 text-center sm:p-10">
        <BrandLogo href="/" />
        <h1 className="mt-7 text-lg font-semibold text-zinc-100">Une erreur est survenue</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          La page n’a pas pu s’afficher. Réessayez — si le problème persiste, revenez dans un instant.
        </p>
        <button onClick={reset} className="btn-primary mt-7 w-full sm:w-auto">
          <RefreshCw className="h-4 w-4" /> Réessayer
        </button>
      </div>
    </main>
  );
}
