'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Rocket } from 'lucide-react';
import { saveOnboardingStep } from '@/server/actions/onboarding';
import { FormError } from '@/components/auth';
import { BrandLogo } from '@/components/BrandLogo';
import { ProgressBar } from '@/components/ui';

const GOALS = [
  {
    id: 'sell',
    label: 'Vendre des produits',
    desc: 'Produits digitaux, services, merch.',
  },
  {
    id: 'course',
    label: 'Créer une formation',
    desc: 'Transmettez et vendez votre savoir.',
  },
  {
    id: 'reseller',
    label: 'Devenir revendeur',
    desc: 'Vendez l’Académie Nuvra (90/10).',
  },
  {
    id: 'audience',
    label: 'Développer une audience',
    desc: 'Lien en bio, email, communauté.',
  },
  {
    id: 'business',
    label: 'Construire une vraie activité',
    desc: 'Tunnels, CRM, automatisations — tout.',
  },
];

const CHECKLIST = [
  'Connecter votre prestataire de paiement (Paramètres → Paiements)',
  'Créer votre premier produit ou votre première formation',
  'Publier une page de vente',
  'Configurer votre lien Nuvra (/@pseudo)',
  'Découvrir l’Académie Nuvra',
];

export default function OnboardingClient({ username }: { username: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [activity, setActivity] = useState('');
  const [goal, setGoal] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [handle, setHandle] = useState(username);
  const [checked, setChecked] = useState<number[]>([]);

  function next(
    mutations: Partial<Parameters<typeof saveOnboardingStep>[0]> = {},
  ) {
    setError(null);
    startTransition(async () => {
      const res = await saveOnboardingStep({
        ...mutations,
        step: mutations.step ?? step,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setStep((s) => Math.min(5, s + 1));
    });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-950 px-4 py-10">
      <div className="mb-8">
        <BrandLogo size="lg" orientation="stacked" />
      </div>
      <div className="card w-full max-w-xl p-7">
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
            <span>Étape {step} sur 5</span>
            <span>{Math.round((step / 5) * 100)}%</span>
          </div>
          <ProgressBar value={step} max={5} />
        </div>

        <FormError error={error} />

        {step === 1 && (
          <div>
            <h1 className="text-lg font-semibold text-zinc-100">
              Comment devons-nous vous appeler ?
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Ce nom apparaîtra sur vos pages publiques.
            </p>
            <div className="mt-5">
              <label className="label" htmlFor="ob-name">
                Votre nom
              </label>
              <input
                id="ob-name"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Camille Martin"
                minLength={2}
                required
              />
            </div>
            <button
              className="btn-primary mt-5 w-full"
              disabled={pending || name.trim().length < 2}
              onClick={() => next({ step: 1, name: name.trim() })}
            >
              Continuer
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-lg font-semibold text-zinc-100">
              Quelle est votre activité ?
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Une phrase courte sur ce que vous faites.
            </p>
            <div className="mt-5">
              <label className="label" htmlFor="ob-activity">
                Activité
              </label>
              <input
                id="ob-activity"
                className="input"
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                placeholder="Coaching sportif, formations design, jeux indés…"
              />
            </div>
            <button
              className="btn-primary mt-5 w-full"
              disabled={pending}
              onClick={() =>
                next({ step: 2, activity: activity || 'Créateur digital' })
              }
            >
              Continuer
            </button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="text-lg font-semibold text-zinc-100">
              Quel est votre objectif principal ?
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Nous adaptons votre tableau de bord et votre checklist.
            </p>
            <div className="mt-6 grid gap-2.5">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGoal(g.id)}
                  className={`rounded-lg border px-4 py-3 text-left transition ${
                    goal === g.id
                      ? 'border-nuvra-500 bg-nuvra-500/10'
                      : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                  }`}
                >
                  <div className="section-title">{g.label}</div>
                  <div className="text-xs text-zinc-500">{g.desc}</div>
                </button>
              ))}
            </div>
            <button
              className="btn-primary mt-5 w-full"
              disabled={pending || !goal}
              onClick={() => next({ step: 3, goal })}
            >
              Continuer
            </button>
          </div>
        )}

        {step === 4 && (
          <div>
            <h1 className="text-lg font-semibold text-zinc-100">
              Personnalisez votre espace
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Modifiable à tout moment dans les paramètres.
            </p>
            <div className="mt-6 space-y-4">
              <div>
                <label className="label" htmlFor="ob-ws">
                  Nom de l’espace
                </label>
                <input
                  id="ob-ws"
                  className="input"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="Studio Camille"
                />
              </div>
              <div>
                <label className="label" htmlFor="ob-handle">
                  Votre identifiant de lien Nuvra
                </label>
                <div className="flex items-center gap-0">
                  <span className="rounded-l-lg border border-r-0 border-white/10 bg-ink-900 px-3 py-2.5 text-sm text-zinc-500">
                    /@
                  </span>
                  <input
                    id="ob-handle"
                    className="input rounded-l-none"
                    value={handle}
                    onChange={(e) =>
                      setHandle(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))
                    }
                    placeholder="camille"
                  />
                </div>
              </div>
            </div>
            <button
              className="btn-primary mt-5 w-full"
              disabled={pending}
              onClick={() =>
                next({
                  step: 4,
                  workspaceName: workspaceName || undefined,
                  username: handle,
                })
              }
            >
              Continuer
            </button>
          </div>
        )}

        {step === 5 && (
          <div>
            <h1 className="text-lg font-semibold text-zinc-100">
              Checklist de lancement
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Cochez au fur et à mesure — votre tableau de bord suit aussi la
              progression.
            </p>
            <div className="mt-6 space-y-2">
              {CHECKLIST.map((item, i) => (
                <label
                  key={item}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-3 text-sm text-zinc-300"
                >
                  <input
                    type="checkbox"
                    checked={checked.includes(i)}
                    onChange={() =>
                      setChecked((c) =>
                        c.includes(i) ? c.filter((x) => x !== i) : [...c, i],
                      )
                    }
                    className="h-4 w-4 accent-[#1B51F5]"
                  />
                  {item}
                </label>
              ))}
            </div>
            <button
              className="btn-primary mt-5 w-full"
              disabled={pending}
              onClick={() => {
                startTransition(async () => {
                  await saveOnboardingStep({ step: 5 });
                  router.push('/dashboard');
                  router.refresh();
                });
              }}
            >
              <Rocket className="h-4 w-4" /> Ouvrir mon tableau de bord
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
