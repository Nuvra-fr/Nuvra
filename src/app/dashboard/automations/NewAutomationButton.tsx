'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { createAutomationAction } from '@/server/actions/automations';
import { AUTOMATION_TRIGGERS, AUTOMATION_ACTIONS, type AutomationActionType } from '@/lib/constants';
import { FormError } from '@/components/auth';

export default function NewAutomationButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState<string>('lead.created');
  const [action, setAction] = useState<string>('send_email');
  const [emailSubject, setEmailSubject] = useState('Welcome!');
  const [emailBody, setEmailBody] = useState('Thanks for joining — here is what to do next.');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const config =
        action === 'send_email'
          ? { subject: emailSubject, body: emailBody }
          : action === 'send_notification'
            ? { title: name || 'Notification', body: emailBody }
            : action === 'add_tag' || action === 'remove_tag'
              ? { tag: emailSubject }
              : action === 'webhook'
                ? { url: emailSubject }
                : { title: emailSubject };
      const res = await createAutomationAction({
        name,
        triggerEvent: trigger,
        actions: [{ type: action as AutomationActionType, config }],
      });
      if (!res.ok) setError(res.error);
      else {
        setOpen(false);
        router.push(`/dashboard/automations/${res.id}`);
        router.refresh();
      }
    });
  }

  return (
    <>
      <button className="btn-primary" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> New automation
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-10">
          <div className="absolute inset-0" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg rounded-xl border border-white/10 bg-ink-850 p-6 shadow-card">
            <h2 className="text-base font-semibold text-zinc-100">New automation</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="label">Name</label>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Welcome new leads" />
              </div>
              <div>
                <label className="label">Trigger</label>
                <select className="input" value={trigger} onChange={(e) => setTrigger(e.target.value)}>
                  {AUTOMATION_TRIGGERS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Action</label>
                <select className="input" value={action} onChange={(e) => setAction(e.target.value)}>
                  {AUTOMATION_ACTIONS.filter((a) => a !== 'wait').map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">
                  {action === 'send_email' ? 'Subject' : action === 'webhook' ? 'Webhook URL' : action.includes('tag') ? 'Tag' : 'Title'}
                </label>
                <input className="input" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
              </div>
              {action === 'send_email' || action === 'send_notification' ? (
                <div>
                  <label className="label">Body</label>
                  <textarea className="input" rows={4} value={emailBody} onChange={(e) => setEmailBody(e.target.value)} />
                </div>
              ) : null}
            </div>
            <FormError error={error} />
            <div className="mt-5 flex justify-end gap-2">
              <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={submit} disabled={pending || !name.trim()}>
                {pending ? 'Creating…' : 'Create automation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
