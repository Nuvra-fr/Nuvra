'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function AcademyError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[nuvra:academy]', error);
  }, [error]);

  return (
    <div className="card card-body flex flex-col items-center px-6 py-14 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10">
        <AlertTriangle className="h-5 w-5 text-amber-300" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-zinc-100">
        Impossible de charger ce contenu
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
        Votre progression est intacte. Rechargez la leçon — si l&apos;erreur
        persiste, contactez le support avec la référence
        {error.digest ? ` ${error.digest}` : ''}.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <button type="button" onClick={reset} className="btn-primary">
          <RefreshCw className="h-4 w-4" /> Réessayer
        </button>
        <Link href="/dashboard/academy" className="btn-ghost">
          Retour à mon parcours
        </Link>
        <Link href="/dashboard/help" className="btn-ghost">
          Support
        </Link>
      </div>
    </div>
  );
}
