'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Captions,
  FileText,
  Film,
  ListVideo,
  Loader2,
  PlayCircle,
  RefreshCw,
  ScrollText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge, ProgressBar } from '@/components/ui';
import { saveVideoProgressAction } from '@/server/actions/academy';

export interface VideoPayload {
  id: string;
  title: string;
  description: string | null;
  status: 'SCRIPTED' | 'UPLOADED';
  durationSec: number;
  thumbnailUrl: string | null;
  chapters: { title: string; time: number }[];
  storyboard: { time: string; visual: string; narration: string; onScreenText: string }[];
  script: string | null;
  transcript: string | null;
  playbackUrl: string | null;
  progress?: { positionSec: number; percent: number } | null;
}

function fmtTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

type Tab = 'player' | 'chapters' | 'transcript' | 'script';

export default function AcademyVideo({
  assetId,
  lessonId,
  title,
  onWatched,
}: {
  assetId: string;
  lessonId: string;
  title: string;
  onWatched?: (seconds: number) => void;
}) {
  const [asset, setAsset] = useState<VideoPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('player');
  const [resume, setResume] = useState(0);
  const [watchPct, setWatchPct] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const savedAt = useRef(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/academy/assets/${assetId}`, { cache: 'no-store' });
      if (res.status === 403) {
        setError('Accès Académie requis pour cette vidéo.');
        return;
      }
      if (!res.ok) {
        setError('Média indisponible.');
        return;
      }
      const data = (await res.json()) as VideoPayload;
      setAsset(data);
      if (data.playbackUrl) {
        setResume(data.progress?.positionSec ?? 0);
        setWatchPct(data.progress?.percent ?? 0);
      }
    } catch {
      setError('Connexion impossible — réessayez.');
    } finally {
      setLoading(false);
    }
  }, [assetId]);

  useEffect(() => {
    void load();
  }, [load]);

  const persist = useCallback(
    async (position: number, duration: number) => {
      const now = Date.now();
      if (now - savedAt.current < 10_000 && position < duration) return;
      savedAt.current = now;
      const res = await saveVideoProgressAction(lessonId, position, duration);
      if (res.ok) setWatchPct(res.data.percent);
      onWatched?.(position);
    },
    [lessonId, onWatched],
  );

  const chapters = useMemo(() => asset?.chapters ?? [], [asset]);
  const jump = useCallback(
    (time: number) => {
      const el = videoRef.current;
      if (el) {
        el.currentTime = time;
        void el.play().catch(() => undefined);
      }
    },
    [],
  );

  if (loading) {
    return (
      <div className="card flex aspect-video items-center justify-center">
        <span className="inline-flex items-center gap-2 text-sm text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Chargement de la vidéo…
        </span>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="card card-body flex flex-col items-center gap-3 py-10 text-center">
        <Film className="h-6 w-6 text-zinc-600" />
        <p className="text-sm text-zinc-400">{error ?? 'Vidéo indisponible.'}</p>
        <button type="button" onClick={load} className="btn-secondary btn-sm">
          <RefreshCw className="h-3.5 w-3.5" /> Réessayer
        </button>
      </div>
    );
  }

  const isScripted = asset.status !== 'UPLOADED' || !asset.playbackUrl;
  const playable =
    !isScripted && asset.playbackUrl
      ? { ...asset, playbackUrl: asset.playbackUrl as string }
      : null;

  return (
    <section className="card overflow-hidden" aria-label={`Vidéo — ${title}`}>
      <div className="card-head flex-wrap gap-2">
        <div className="min-w-0">
          <h2 className="section-title truncate">{asset.title || title}</h2>
          {asset.description ? (
            <p className="section-subtitle line-clamp-2">{asset.description}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {asset.durationSec > 0 ? (
            <Badge>{fmtTime(asset.durationSec)}</Badge>
          ) : null}
          <Badge tone={isScripted ? 'amber' : 'green'}>
            {isScripted ? 'Script validé' : 'Vidéo publiée'}
          </Badge>
        </div>
      </div>

      <div
        className="flex gap-1 overflow-x-auto border-b border-white/[0.07] px-3 pt-2"
        role="tablist"
        aria-label="Contenu de la vidéo"
      >
        {(
          [
            ['player', 'Lecteur'],
            ['chapters', `Chapitres (${chapters.length})`],
            ['transcript', 'Transcription'],
            ['script', 'Script & storyboard'],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn(
              'whitespace-nowrap rounded-t-lg border-b-2 px-3 py-2 text-xs font-medium transition duration-200',
              tab === key
                ? 'border-nuvra-500 text-zinc-100'
                : 'border-transparent text-zinc-500 hover:text-zinc-300',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'player' ? (
        isScripted || !playable ? (
          <div className="card-body">
            <InlineAlert tone="info">
              <strong>Vidéo en production.</strong> Le script complet, le
              storyboard et la transcription sont disponibles dans les onglets
              ci-contre — le fichier vidéo sera déposé ici par
              l&apos;administrateur (Admin → Académie → Médias). Rien n&apos;est
              simulé : aucun lecteur ne s&apos;active tant que le fichier
              n&apos;est pas publié.
            </InlineAlert>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {chapters.map((c) => (
                <div
                  key={c.title}
                  className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-xs text-zinc-400"
                >
                  <ListVideo className="h-3.5 w-3.5 shrink-0 text-nuvra-400" />
                  <span className="tabular-nums text-zinc-500">{c.time}</span>
                  <span className="truncate">{c.title}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card-body">
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black">
              <video
                ref={videoRef}
                key={playable.playbackUrl}
                controls
                playsInline
                preload="metadata"
                className="aspect-video w-full"
                poster={asset.thumbnailUrl || undefined}
                onLoadedMetadata={(e) => {
                  const el = e.currentTarget;
                  if (resume > 0 && resume < el.duration - 5) el.currentTime = resume;
                }}
                onTimeUpdate={(e) => {
                  const el = e.currentTarget;
                  if (el.duration > 0) {
                    void persist(el.currentTime, el.duration);
                  }
                }}
                onPause={(e) => {
                  const el = e.currentTarget;
                  if (el.duration > 0) void persist(el.currentTime, el.duration);
                }}
                onEnded={(e) => {
                  const el = e.currentTarget;
                  void persist(el.duration, el.duration);
                }}
              >
                <source src={playable.playbackUrl} type="video/mp4" />
                Votre navigateur ne peut pas lire cette vidéo.
              </video>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
                <Captions className="h-3.5 w-3.5" /> Sous-titres et
                transcription disponibles ci-dessous
              </span>
              {watchPct > 0 ? (
                <span className="inline-flex items-center gap-2 text-xs text-zinc-500">
                  <span className="w-20">
                    <ProgressBar value={watchPct} />
                  </span>
                  {watchPct} % visionné
                </span>
              ) : null}
            </div>
            {chapters.length > 0 ? (
              <div className="mt-4 grid gap-1.5 sm:grid-cols-2">
                {chapters.map((c) => (
                  <button
                    key={c.title}
                    type="button"
                    onClick={() => jump(c.time)}
                    className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-left text-xs text-zinc-400 transition duration-200 hover:border-white/15 hover:text-zinc-200"
                  >
                    <PlayCircle className="h-3.5 w-3.5 shrink-0 text-nuvra-400" />
                    <span className="tabular-nums text-zinc-500">
                      {fmtTime(c.time)}
                    </span>
                    <span className="truncate">{c.title}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        )
      ) : tab === 'chapters' ? (
        <div className="card-body">
          {chapters.length === 0 ? (
            <p className="text-sm text-zinc-500">Aucun chapitre défini.</p>
          ) : (
            <ol className="space-y-2">
              {chapters.map((c) => (
                <li
                  key={c.title}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-2.5"
                >
                  <span className="tabular-nums text-xs text-nuvra-300">
                    {fmtTime(c.time)}
                  </span>
                  <span className="text-sm text-zinc-200">{c.title}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      ) : tab === 'transcript' ? (
        <div className="card-body">
          {asset.transcript ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
              {asset.transcript}
            </p>
          ) : (
            <p className="text-sm text-zinc-500">
              La transcription sera ajoutée avec la vidéo.
            </p>
          )}
        </div>
      ) : (
        <div className="card-body space-y-4">
          {asset.storyboard.length > 0 ? (
            <div>
              <div className="eyebrow mb-2 flex items-center gap-1.5">
                <ScrollText className="h-3.5 w-3.5" /> Storyboard
              </div>
              <ol className="space-y-2">
                {asset.storyboard.map((s, i) => (
                  <li
                    key={`${s.time}-${i}`}
                    className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="blue">{s.time}</Badge>
                      <span className="text-sm text-zinc-200">{s.visual}</span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                      {s.narration}
                    </p>
                    {s.onScreenText ? (
                      <p className="mt-1.5 text-xs text-zinc-500">
                        <FileText className="mr-1 inline h-3 w-3" />
                        {s.onScreenText}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
          {asset.script ? (
            <div>
              <div className="eyebrow mb-2">Script complet</div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                {asset.script}
              </p>
            </div>
          ) : null}
          {!asset.script && asset.storyboard.length === 0 ? (
            <p className="text-sm text-zinc-500">Aucun script disponible.</p>
          ) : null}
        </div>
      )}
    </section>
  );
}

function InlineAlert({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'success' | 'warning' | 'error';
  children: React.ReactNode;
}) {
  const tones = {
    info: 'border-nuvra-500/30 bg-nuvra-500/10 text-nuvra-200',
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
    warning: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
    error: 'border-red-500/30 bg-red-500/10 text-red-200',
  };
  return (
    <div className={cn('rounded-xl border px-4 py-3 text-sm leading-relaxed', tones[tone])} role="status">
      {children}
    </div>
  );
}
