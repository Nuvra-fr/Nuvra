'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Plus } from 'lucide-react';
import { updateAutomationAction, deleteAutomationAction } from '@/server/actions/automations';
import { AUTOMATION_ACTIONS, type AutomationActionType } from '@/lib/constants';
import { FormError } from '@/components/auth';

interface ActionItem {
  type: AutomationActionType;
  config: Record<string, unknown>;
}

export default function AutomationClient({
  automationId,
  active,
  initialActions,
}: {
  automationId: string;
  active: boolean;
  initialActions: ActionItem[];
}) {
  const router = useRouter();
  const [actions, setActions] = useState<ActionItem[]>(initialActions);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error ?? 'Failed');
      else {
        setSaved(true);
        router.refresh();
      }
    });
  }

  return (
    <div>
      <FormError error={error} />
      <div className="space-y-3">
        {actions.map((a, i) => (
          <div key={i} className="rounded-lg border border-white/[0.07] bg-ink-900 p-3.5">
            <div className="flex items-center gap-2">
              <span className="rounded bg-nuvra-500/15 px-2 py-0.5 text-[11px] font-semibold text-nuvra-300">
                {i + 1}
              </span>
              <select
                className="input !w-auto !py-1.5 !text-xs"
                value={a.type}
                onChange={(e) => {
                  const next = [...actions];
                  next[i] = { ...a, type: e.target.value as AutomationActionType };
                  setActions(next);
                }}
              >
                {AUTOMATION_ACTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <button
                className="btn-ghost !p-1.5 ml-auto"
                onClick={() => setActions(actions.filter((_, j) => j !== i))}
                aria-label="Remove action"
              >
                <Trash2 className="h-3.5 w-3.5 text-zinc-600" />
              </button>
            </div>
            <textarea
              className="input mt-2 !text-xs"
              rows={2}
              placeholder={
                a.type === 'send_email' ? 'subject | body' : a.type === 'webhook' ? 'https://webhook-url' : 'config JSON'
              }
              defaultValue={
                a.type === 'send_email'
                  ? `${String(a.config.subject ?? '')} | ${String(a.config.body ?? '')}`
                  : a.type === 'webhook'
                    ? String(a.config.url ?? '')
                    : JSON.stringify(a.config)
              }
              onBlur={(e) => {
                const v = e.target.value;
                let config: Record<string, unknown>;
                if (a.type === 'send_email') {
                  const [subject, body] = v.split('|');
                  config = { subject: (subject ?? '').trim(), body: (body ?? '').trim() };
                } else if (a.type === 'webhook') {
                  config = { url: v.trim() };
                } else {
                  try {
                    config = JSON.parse(v || '{}');
                  } catch {
                    setError('Invalid JSON in action config');
                    return;
                  }
                }
                const next = [...actions];
                next[i] = { ...a, config };
                setActions(next);
              }}
            />
          </div>
        ))}
      </div>

      <button
        className="mt-3 w-full rounded-lg border border-dashed border-white/15 py-2.5 text-xs text-zinc-500 hover:border-nuvra-500/40 hover:text-nuvra-300"
        onClick={() => setActions([...actions, { type: 'send_email', config: { subject: '', body: '' } }])}
      >
        <Plus className="mr-1 inline h-3.5 w-3.5" /> Add action
      </button>

      <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4">
        <button
          className="btn-danger !py-2 !text-xs"
          disabled={pending}
          onClick={() => {
            if (!confirm('Delete this automation?')) return;
            run(async () => {
              const res = await deleteAutomationAction(automationId);
              if (res.ok) router.push('/dashboard/automations');
              return res;
            });
          }}
        >
          Delete
        </button>
        <div className="flex items-center gap-3">
          {saved ? <span className="text-xs text-emerald-400">Saved ✓</span> : null}
          <label className="flex items-center gap-2 text-xs text-zinc-400">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => run(() => updateAutomationAction(automationId, { active: e.target.checked }))}
              className="h-4 w-4 accent-[#1B51F5]"
            />
            Active
          </label>
          <button
            className="btn-primary !py-2"
            disabled={pending}
            onClick={() => run(() => updateAutomationAction(automationId, { actions }))}
          >
            {pending ? 'Saving…' : 'Save workflow'}
          </button>
        </div>
      </div>
    </div>
  );
}
