'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Rocket } from 'lucide-react';
import { saveOnboardingStep } from '@/server/actions/onboarding';
import { Logo, FormError } from '@/components/auth';
import { ProgressBar } from '@/components/ui';

const GOALS = [
  { id: 'sell', label: 'Sell products', desc: 'Digital products, services, merch.' },
  { id: 'course', label: 'Create a course', desc: 'Teach and sell your knowledge.' },
  { id: 'reseller', label: 'Become a reseller', desc: 'Sell Nuvra Academy (90/10).' },
  { id: 'audience', label: 'Grow an audience', desc: 'Link-in-bio, email, community.' },
  { id: 'business', label: 'Build a full business', desc: 'Funnels, CRM, automations, the works.' },
];

const CHECKLIST = [
  'Connect your payment provider (Settings → Payments)',
  'Create your first product or course',
  'Publish a landing page',
  'Set up your Nuvra Link (/@username)',
  'Explore Nuvra Academy',
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

  function next(mutations: Partial<Parameters<typeof saveOnboardingStep>[0]> = {}) {
    setError(null);
    startTransition(async () => {
      const res = await saveOnboardingStep({ ...mutations, step: mutations.step ?? step });
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
        <Logo />
      </div>
      <div className="card w-full max-w-xl p-7">
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
            <span>Step {step} of 5</span>
            <span>{Math.round((step / 5) * 100)}%</span>
          </div>
          <ProgressBar value={step} max={5} />
        </div>

        <FormError error={error} />

        {step === 1 && (
          <div>
            <h1 className="text-lg font-semibold text-zinc-100">What should we call you?</h1>
            <p className="mt-1 text-sm text-zinc-500">This appears on your public pages.</p>
            <div className="mt-5">
              <label className="label" htmlFor="ob-name">Your name</label>
              <input
                id="ob-name"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Martin"
                minLength={2}
                required
              />
            </div>
            <button
              className="btn-primary mt-5 w-full"
              disabled={pending || name.trim().length < 2}
              onClick={() => next({ step: 1, name: name.trim() })}
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-lg font-semibold text-zinc-100">What&apos;s your activity?</h1>
            <p className="mt-1 text-sm text-zinc-500">A short line about what you do.</p>
            <div className="mt-5">
              <label className="label" htmlFor="ob-activity">Activity</label>
              <input
                id="ob-activity"
                className="input"
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                placeholder="Fitness coaching, design courses, indie games…"
              />
            </div>
            <button
              className="btn-primary mt-5 w-full"
              disabled={pending}
              onClick={() => next({ step: 2, activity: activity || 'Digital creator' })}
            >
              Continue
            </button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="text-lg font-semibold text-zinc-100">What&apos;s your main goal?</h1>
            <p className="mt-1 text-sm text-zinc-500">We&apos;ll tailor your dashboard and checklist.</p>
            <div className="mt-5 grid gap-2.5">
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
                  <div className="text-sm font-semibold text-zinc-200">{g.label}</div>
                  <div className="text-xs text-zinc-500">{g.desc}</div>
                </button>
              ))}
            </div>
            <button
              className="btn-primary mt-5 w-full"
              disabled={pending || !goal}
              onClick={() => next({ step: 3, goal })}
            >
              Continue
            </button>
          </div>
        )}

        {step === 4 && (
          <div>
            <h1 className="text-lg font-semibold text-zinc-100">Personalize your workspace</h1>
            <p className="mt-1 text-sm text-zinc-500">You can change these anytime in Settings.</p>
            <div className="mt-5 space-y-4">
              <div>
                <label className="label" htmlFor="ob-ws">Workspace name</label>
                <input
                  id="ob-ws"
                  className="input"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="Alex Studio"
                />
              </div>
              <div>
                <label className="label" htmlFor="ob-handle">Your Nuvra Link handle</label>
                <div className="flex items-center gap-0">
                  <span className="rounded-l-lg border border-r-0 border-white/10 bg-ink-900 px-3 py-2.5 text-sm text-zinc-500">
                    /@
                  </span>
                  <input
                    id="ob-handle"
                    className="input rounded-l-none"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                    placeholder="alex"
                  />
                </div>
              </div>
            </div>
            <button
              className="btn-primary mt-5 w-full"
              disabled={pending}
              onClick={() => next({ step: 4, workspaceName: workspaceName || undefined, username: handle })}
            >
              Continue
            </button>
          </div>
        )}

        {step === 5 && (
          <div>
            <h1 className="text-lg font-semibold text-zinc-100">Launch checklist</h1>
            <p className="mt-1 text-sm text-zinc-500">Tick things off as you go — your dashboard tracks progress too.</p>
            <div className="mt-5 space-y-2">
              {CHECKLIST.map((item, i) => (
                <label
                  key={item}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-3 text-sm text-zinc-300"
                >
                  <input
                    type="checkbox"
                    checked={checked.includes(i)}
                    onChange={() =>
                      setChecked((c) => (c.includes(i) ? c.filter((x) => x !== i) : [...c, i]))
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
              <Rocket className="h-4 w-4" /> Open my dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
