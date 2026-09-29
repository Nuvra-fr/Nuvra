import Link from 'next/link';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="glass-panel animate-panelIn w-full max-w-md rounded-3xl p-8 text-center sm:p-10">
        <BrandLogo href="/" />
        <div className="mt-7 text-[52px] font-semibold leading-none tracking-tight text-white">404</div>
        <h1 className="mt-3 text-lg font-semibold text-zinc-100">Cette page n’existe pas</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          Le lien est peut-être erroné, ou la page a été déplacée.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn-primary w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4" /> Retour à l’accueil
          </Link>
          <Link href="/dashboard" className="btn-secondary w-full sm:w-auto">
            <LayoutDashboard className="h-4 w-4" /> Tableau de bord
          </Link>
        </div>
      </div>
    </main>
  );
}
