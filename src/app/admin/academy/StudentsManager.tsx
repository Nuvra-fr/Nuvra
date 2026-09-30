'use client';

import { useState, useTransition } from 'react';
import { Loader2, Plus, ShieldCheck, ShieldX } from 'lucide-react';
import { Badge, InlineAlert, ProgressBar } from '@/components/ui';
import {
  adminEnrollUserAction,
  adminGrantAccessAction,
  adminRevokeAccessAction,
} from '@/server/actions/academy';

export interface StudentRow {
  enrollmentId: string;
  userId: string;
  name: string;
  email: string;
  source: string;
  progressPct: number;
  completed: boolean;
  completedAt: string | null;
  lastActivity: string;
  doneLessons: number;
  totalLessons: number;
  entitlement: string;
  entitlementNote: string | null;
}

export default function StudentsManager({ rows }: { rows: StudentRow[] }) {
  const [email, setEmail] = useState('');
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(
    null,
  );
  const [query, setQuery] = useState('');

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setMessage(null);
    start(async () => {
      const res = await fn();
      setMessage(
        res.ok
          ? { tone: 'success', text: 'C’est fait — la liste est à jour.' }
          : { tone: 'error', text: res.error ?? 'Action impossible' },
      );
    });
  }

  const filtered = rows.filter(
    (r) =>
      !query.trim() ||
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.email.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <section className="card card-body">
        <h2 className="section-title">Inscrire un apprenant</h2>
        <p className="mt-1.5 text-xs text-zinc-500">
          Crée l&apos;inscription <em>et</em> l&apos;entitlement actif : les deux
          sont nécessaires pour ouvrir l&apos;Académie.
        </p>
        <form
          className="mt-3 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!email.trim()) return;
            const value = email.trim();
            run(async () => {
              const res = await adminEnrollUserAction(value);
              if (res.ok) setEmail('');
              return res;
            });
          }}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="apprenant@exemple.com"
            aria-label="Email de l'apprenant"
            className="min-w-0 flex-1 rounded-xl border border-white/[0.1] bg-ink-900 px-3.5 py-2.5 text-sm text-zinc-200 outline-none focus:border-nuvra-500/60"
          />
          <button type="submit" disabled={pending} className="btn-primary btn-sm">
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            Inscrire
          </button>
        </form>
      </section>

      {message ? (
        <InlineAlert tone={message.tone}>{message.text}</InlineAlert>
      ) : null}

      <section className="card overflow-hidden">
        <div className="card-head">
          <div>
            <h2 className="section-title">Apprenants</h2>
            <p className="section-subtitle">
              {rows.length} inscription{rows.length > 1 ? 's' : ''} · accès,
              progression, fin de parcours
            </p>
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher…"
            aria-label="Rechercher un apprenant"
            className="w-48 rounded-xl border border-white/[0.1] bg-ink-900 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-nuvra-500/60"
          />
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Apprenant</th>
                <th>Source</th>
                <th>Progression</th>
                <th>Accès</th>
                <th>Dernière activité</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-zinc-600">
                    Aucun apprenant ne correspond.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.enrollmentId}>
                    <td>
                      <div className="font-medium text-zinc-200">{r.name}</div>
                      <div className="text-[11px] text-zinc-600">{r.email}</div>
                    </td>
                    <td className="text-zinc-400">{r.source}</td>
                    <td className="min-w-[140px]">
                      <div className="flex items-center gap-2">
                        <span className="w-20">
                          <ProgressBar value={r.progressPct} />
                        </span>
                        <span className="tabular-nums text-xs text-zinc-400">
                          {r.progressPct} %
                        </span>
                      </div>
                      <div className="mt-1 text-[11px] text-zinc-600">
                        {r.doneLessons}/{r.totalLessons} leçons
                        {r.completedAt
                          ? ` · terminé le ${new Date(r.completedAt).toLocaleDateString('fr-FR')}`
                          : ''}
                      </div>
                    </td>
                    <td>
                      {r.entitlement === 'ACTIVE' ? (
                        <Badge tone="green">actif</Badge>
                      ) : r.entitlement === 'REVOKED' ? (
                        <Badge tone="red">révoqué</Badge>
                      ) : r.entitlement === 'SUSPENDED' ? (
                        <Badge tone="amber">suspendu</Badge>
                      ) : (
                        <Badge tone="red">aucun</Badge>
                      )}
                      {r.entitlementNote ? (
                        <div className="mt-1 max-w-[160px] truncate text-[11px] text-zinc-600">
                          {r.entitlementNote}
                        </div>
                      ) : null}
                    </td>
                    <td className="text-xs text-zinc-500">
                      {new Date(r.lastActivity).toLocaleDateString('fr-FR')}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1.5">
                        {r.entitlement === 'ACTIVE' ? (
                          <button
                            type="button"
                            disabled={pending}
                            title="Révoquer l'accès (l'historique est conservé)"
                            aria-label={`Révoquer l'accès de ${r.name}`}
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Révoquer l'accès de ${r.name} ? Ses leçons, quiz et certificat sont conservés.`,
                                )
                              ) {
                                run(() =>
                                  adminRevokeAccessAction(
                                    r.userId,
                                    'Révocation manuelle par un administrateur',
                                  ),
                                );
                              }
                            }}
                            className="btn-ghost !p-1.5 text-red-300"
                          >
                            <ShieldX className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={pending}
                            title="Activer l'accès"
                            aria-label={`Activer l'accès de ${r.name}`}
                            onClick={() =>
                              run(async () => {
                                const res = await adminEnrollUserAction(r.email);
                                if (res.ok)
                                  await adminGrantAccessAction(
                                    r.email,
                                    'Accès réactivé par un administrateur',
                                  );
                                return res;
                              })
                            }
                            className="btn-ghost !p-1.5 text-emerald-300"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
