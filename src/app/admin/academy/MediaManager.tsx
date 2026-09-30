'use client';

import { useState, useTransition } from 'react';
import { Check, Film, Loader2, Upload, Video } from 'lucide-react';
import { Badge, InlineAlert } from '@/components/ui';
import { adminSaveVideoAction } from '@/server/actions/academy';

export interface MediaVideo {
  id: string;
  status: 'SCRIPTED' | 'UPLOADED';
  title: string;
  durationSec: number;
  hasScript: boolean;
  hasStoryboard: boolean;
  hasTranscript: boolean;
  playbackUrl: string | null;
}

export default function MediaManager({
  modules,
  lessons,
}: {
  modules: { id: string; title: string; video: MediaVideo | null }[];
  lessons: { id: string; title: string; video: MediaVideo }[];
}) {
  const [pending, start] = useTransition();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(
    null,
  );

  function save(assetId: string, url: string) {
    const value = url.trim();
    if (!value) {
      setMessage({ tone: 'error', text: 'Collez l’URL du fichier vidéo réel.' });
      return;
    }
    setMessage(null);
    start(async () => {
      const res = await adminSaveVideoAction(assetId, {
        status: 'UPLOADED',
        playbackUrl: value,
        storageKey: value,
      });
      setMessage(
        res.ok
          ? { tone: 'success', text: 'Vidéo publiée — le lecteur est actif pour les apprenants.' }
          : { tone: 'error', text: res.error ?? 'Enregistrement impossible' },
      );
      if (res.ok) setDrafts((d) => ({ ...d, [assetId]: '' }));
    });
  }

  function revert(assetId: string) {
    setMessage(null);
    start(async () => {
      const res = await adminSaveVideoAction(assetId, {
        status: 'SCRIPTED',
        playbackUrl: null,
        storageKey: null,
      });
      setMessage(
        res.ok
          ? { tone: 'success', text: 'Video repassée en script (aucun lecteur affiché).' }
          : { tone: 'error', text: res.error ?? 'Action impossible' },
      );
    });
  }

  function row(v: MediaVideo, label: string) {
    return (
      <li key={v.id} className="card card-body">
        <div className="flex flex-wrap items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-sm font-medium text-zinc-200">
                {v.title}
              </span>
              {v.status === 'UPLOADED' ? (
                <Badge tone="green">publiée</Badge>
              ) : (
                <Badge tone="amber">script — en attente de fichier</Badge>
              )}
              {v.durationSec > 0 ? <Badge>{v.durationSec} s</Badge> : null}
            </div>
            <div className="mt-1.5 text-[11px] text-zinc-500">
              {label} · script {v.hasScript ? '✓' : '✗'} · storyboard{' '}
              {v.hasStoryboard ? '✓' : '✗'} · transcription{' '}
              {v.hasTranscript ? '✓' : '✗'}
            </div>
            {v.playbackUrl ? (
              <div className="mt-1.5 truncate font-mono text-[11px] text-zinc-600">
                {v.playbackUrl}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="min-w-0 flex-1 space-y-1">
            <span className="text-[11px] text-zinc-500">
              URL du fichier réel (stockage privé ou CDN signé)
            </span>
            <input
              value={drafts[v.id] ?? v.playbackUrl ?? ''}
              onChange={(e) => setDrafts((d) => ({ ...d, [v.id]: e.target.value }))}
              placeholder="https://stockage.nuvra.app/academy/....mp4"
              inputMode="url"
              className="w-full rounded-xl border border-white/[0.1] bg-ink-900 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-nuvra-500/60"
            />
          </label>
          <button
            type="button"
            disabled={pending}
            onClick={() => save(v.id, drafts[v.id] ?? v.playbackUrl ?? '')}
            className="btn-primary btn-sm"
          >
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            Publier la vidéo
          </button>
          {v.status === 'UPLOADED' ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => revert(v.id)}
              className="btn-ghost btn-sm"
            >
              Revenir au script
            </button>
          ) : null}
        </div>
      </li>
    );
  }

  const withoutVideo = modules.filter((m) => !m.video);

  return (
    <div className="space-y-5">
      {message ? <InlineAlert tone={message.tone}>{message.text}</InlineAlert> : null}

      <InlineAlert tone="info">
        <Film className="mr-1 inline h-3.5 w-3.5" />
        Tant qu&apos;un fichier n&apos;est pas publié, l&apos;apprenant voit le
        script, le storyboard, les chapitres et la transcription — jamais un
        lecteur qui ne fonctionne pas. Collez ici l&apos;URL du fichier réel pour
        activer la lecture (elle reste servie par une URL signée de 5 minutes).
      </InlineAlert>

      {withoutVideo.length > 0 ? (
        <InlineAlert tone="warning">
          {withoutVideo.length} module(s) n&apos;ont pas de package vidéo :{' '}
          {withoutVideo.map((m) => m.title).join(', ')}
        </InlineAlert>
      ) : null}

      <section>
        <h2 className="section-title mb-3">
          Vidéos de module ({modules.length})
        </h2>
        <ul className="space-y-3">
          {modules.map((m) =>
            m.video ? (
              row(m.video, `Module — ${m.title}`)
            ) : (
              <li key={m.id} className="card card-body text-sm text-zinc-500">
                <Video className="mr-2 inline h-3.5 w-3.5" />
                Aucun package vidéo pour « {m.title} ».
              </li>
            ),
          )}
        </ul>
      </section>

      <section>
        <h2 className="section-title mb-3">
          Vidéos de leçon ({lessons.length})
        </h2>
        {lessons.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Aucune vidéo de leçon enregistrée.
          </p>
        ) : (
          <ul className="space-y-3">{lessons.map((l) => row(l.video, l.title))}</ul>
        )}
      </section>

      <p className="flex items-center gap-1.5 text-xs text-zinc-600">
        <Check className="h-3 w-3" />
        Un fichier téléversé par l&apos;administrateur reste la seule source de
        vérité : aucune URL de démonstration n&apos;est stockée en base.
      </p>
    </div>
  );
}
