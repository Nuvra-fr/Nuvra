'use client';

import { useCallback, useMemo, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Eye,
  Monitor,
  Plus,
  Rocket,
  Save,
  Trash2,
  ChevronLeft,
} from 'lucide-react';
import { savePageAction } from '@/server/actions/builder';
import { PageRenderer, parseBlocks, type Block } from '@/components/PageRenderer';
import { PAGE_BLOCK_TEMPLATES, BLOCK_TYPES, type BlockType } from '@/lib/constants';
import { cn, randomCode } from '@/lib/utils';
import { Badge, StatusBadge } from '@/components/ui';
import { FormError } from '@/components/auth';

interface PageProp {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  views: number;
  funnelId: string | null;
}

type SaveState = 'saved' | 'saving' | 'dirty' | 'error';

const SCALAR_LABELS: Record<string, string> = {
  heading: 'Heading',
  subheading: 'Subheading',
  title: 'Title',
  body: 'Body text',
  label: 'Label',
  ctaLabel: 'CTA label',
  buttonLabel: 'Button label',
  href: 'Link URL',
  ctaHref: 'CTA link',
  src: 'Image URL',
  alt: 'Alt text',
  url: 'Video URL',
  align: 'Alignment (left | center | right)',
  variant: 'Variant (primary | secondary)',
  productId: 'Product ID',
  courseId: 'Course ID',
  untilDays: 'Days',
  size: 'Size (px)',
  icon: 'Icon',
};

export default function PageEditor({ page, workspaceSlug }: { page: PageProp; workspaceSlug: string }) {
  const router = useRouter();
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [status, setStatus] = useState(page.status);
  const [blocks, setBlocks] = useState<Block[]>(parseBlocks(page.content));
  const [selectedId, setSelectedId] = useState<string | null>(blocks[0]?.id ?? null);
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);
  const [seoTitle, setSeoTitle] = useState(page.seoTitle);
  const [seoDescription, setSeoDescription] = useState(page.seoDescription);
  const [pending] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selected = useMemo(() => blocks.find((b) => b.id === selectedId) ?? null, [blocks, selectedId]);

  const save = useCallback(
    (next: { blocks?: Block[]; title?: string; slug?: string; status?: string; seoTitle?: string; seoDescription?: string }) => {
      setSaveState('saving');
      const payload: Parameters<typeof savePageAction>[1] = {};
      if (next.blocks) payload.content = JSON.stringify({ blocks: next.blocks });
      if (next.title !== undefined) payload.title = next.title;
      if (next.slug !== undefined) payload.slug = next.slug;
      if (next.status !== undefined) payload.status = next.status as 'DRAFT' | 'PUBLISHED';
      if (next.seoTitle !== undefined) payload.seoTitle = next.seoTitle;
      if (next.seoDescription !== undefined) payload.seoDescription = next.seoDescription;
      savePageAction(page.id, payload)
        .then((res) => {
          if (!res.ok) {
            setSaveState('error');
            setError(res.error);
          } else {
            setSaveState('saved');
            setError(null);
          }
        })
        .catch(() => setSaveState('error'));
    },
    [page.id],
  );

  function autosave(next: Parameters<typeof save>[0]) {
    setSaveState('dirty');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => save(next), 700);
  }

  function updateBlocks(next: Block[], viaAutosave = true) {
    setBlocks(next);
    if (viaAutosave) autosave({ blocks: next });
  }

  function addBlock(type: BlockType) {
    const block: Block = {
      id: randomCode(10),
      type,
      data: JSON.parse(JSON.stringify(PAGE_BLOCK_TEMPLATES[type] ?? {})),
    };
    updateBlocks([...blocks, block]);
    setSelectedId(block.id);
    setAddOpen(false);
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    const tmp = next[index]!;
    next[index] = next[target]!;
    next[target] = tmp;
    updateBlocks(next);
  }

  function remove(id: string) {
    updateBlocks(blocks.filter((b) => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function editSelected(key: string, value: unknown) {
    if (!selected) return;
    const next = blocks.map((b) => (b.id === selected.id ? { ...b, data: { ...b.data, [key]: value } } : b));
    updateBlocks(next);
  }

  function togglePublish() {
    const nextStatus = status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    setStatus(nextStatus);
    setSaveState('saving');
    savePageAction(page.id, { status: nextStatus as 'DRAFT' | 'PUBLISHED', title, slug })
      .then((res) => {
        if (!res.ok) setError(res.error);
        else {
          setError(null);
          router.refresh();
        }
        setSaveState(res.ok ? 'saved' : 'error');
      })
      .catch(() => setSaveState('error'));
  }

  const publicUrl = `/p/${workspaceSlug}/${slug}`;

  return (
    <div className="-mx-4 -my-6 md:-mx-6 md:-my-8">
      {/* Editor topbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.07] bg-ink-900/60 px-4 py-3 md:px-6">
        <Link href="/dashboard/pages" className="btn-ghost !px-2" aria-label="Back to pages">
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            autosave({ title: e.target.value });
          }}
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-zinc-100 outline-none"
          aria-label="Page title"
        />
        <StatusBadge status={status} />
        <span className="text-xs text-zinc-600">
          {saveState === 'saved' && (
            <span className="inline-flex items-center gap-1"><Save className="h-3 w-3" /> Saved</span>
          )}
          {saveState === 'saving' && 'Saving…'}
          {saveState === 'dirty' && 'Unsaved changes…'}
          {saveState === 'error' && <span className="text-red-400">Save failed</span>}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            className={cn('btn-ghost', preview && 'bg-white/[0.08] text-zinc-200')}
            onClick={() => setPreview((p) => !p)}
            title="Toggle preview"
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Preview</span>
          </button>
          {status === 'PUBLISHED' ? (
            <a href={publicUrl} target="_blank" className="btn-secondary !py-2">
              <ExternalLink className="h-4 w-4" /> Live
            </a>
          ) : null}
          <button className={status === 'PUBLISHED' ? 'btn-secondary !py-2' : 'btn-primary'} onClick={togglePublish} disabled={pending}>
            <Rocket className="h-4 w-4" />
            {status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </div>

      <FormError error={error} />

      <div className="grid min-h-[calc(100vh-8rem)] lg:grid-cols-[280px_1fr_320px]">
        {/* Blocks panel */}
        <aside className="border-b border-white/[0.07] bg-ink-900/40 p-4 lg:border-b-0 lg:border-r">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Blocks</span>
            <button className="btn-secondary !px-2.5 !py-1 !text-xs" onClick={() => setAddOpen((o) => !o)}>
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>

          {addOpen && (
            <div className="mb-3 max-h-64 overflow-y-auto rounded-lg border border-white/10 bg-ink-850 p-2">
              {BLOCK_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => addBlock(t)}
                  className="block w-full rounded-md px-2.5 py-1.5 text-left text-xs capitalize text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200"
                >
                  {t.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-1.5">
            {blocks.map((b, i) => (
              <div
                key={b.id}
                onClick={() => setSelectedId(b.id)}
                className={cn(
                  'group cursor-pointer rounded-lg border px-3 py-2.5 transition',
                  selectedId === b.id
                    ? 'border-nuvra-500/50 bg-nuvra-500/10'
                    : 'border-white/[0.07] bg-white/[0.02] hover:border-white/15',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-medium capitalize text-zinc-300">
                    {b.type.replace(/_/g, ' ')}
                  </span>
                  <div className="flex gap-0.5 opacity-0 transition group-hover:opacity-100">
                    <button onClick={(e) => { e.stopPropagation(); move(i, -1); }} className="rounded p-1 hover:bg-white/10" aria-label="Move up">
                      <ArrowUp className="h-3 w-3 text-zinc-500" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); move(i, 1); }} className="rounded p-1 hover:bg-white/10" aria-label="Move down">
                      <ArrowDown className="h-3 w-3 text-zinc-500" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); remove(b.id); }} className="rounded p-1 hover:bg-red-500/20" aria-label="Delete block">
                      <Trash2 className="h-3 w-3 text-zinc-500" />
                    </button>
                  </div>
                </div>
                <div className="mt-0.5 truncate text-[11px] text-zinc-600">
                  {String(b.data?.heading ?? b.data?.title ?? b.data?.label ?? b.data?.body ?? '') || '—'}
                </div>
              </div>
            ))}
            {blocks.length === 0 && (
              <p className="rounded-lg border border-dashed border-white/10 px-3 py-6 text-center text-xs text-zinc-600">
                Empty page. Add a block to start.
              </p>
            )}
          </div>

          {/* SEO */}
          <div className="mt-5 border-t border-white/[0.07] pt-4">
            <button className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wide text-zinc-500" onClick={() => setSeoOpen((o) => !o)}>
              SEO & slug
              <span>{seoOpen ? '−' : '+'}</span>
            </button>
            {seoOpen && (
              <div className="mt-3 space-y-3">
                <div>
                  <label className="label">Slug</label>
                  <input
                    className="input !py-2 text-xs"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      autosave({ slug: e.target.value });
                    }}
                  />
                  <p className="mt-1 text-[10px] text-zinc-600">{publicUrl}</p>
                </div>
                <div>
                  <label className="label">SEO title</label>
                  <input
                    className="input !py-2 text-xs"
                    value={seoTitle}
                    onChange={(e) => {
                      setSeoTitle(e.target.value);
                      autosave({ seoTitle: e.target.value });
                    }}
                  />
                </div>
                <div>
                  <label className="label">SEO description</label>
                  <textarea
                    className="input !py-2 text-xs"
                    rows={3}
                    value={seoDescription}
                    onChange={(e) => {
                      setSeoDescription(e.target.value);
                      autosave({ seoDescription: e.target.value });
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Canvas */}
        <div className="min-w-0 bg-ink-950">
          {preview ? (
            <div className="p-4 md:p-8">
              <div className="mb-3 flex items-center gap-2 text-xs text-zinc-600">
                <Monitor className="h-3.5 w-3.5" /> Preview of {title}
              </div>
              <div className="overflow-hidden rounded-xl border border-white/10 bg-ink-950">
                <PageRenderer blocks={blocks} workspaceId={page.id} basePath={publicUrl} isPreview />
              </div>
            </div>
          ) : (
            <div className="p-4 md:p-6">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-zinc-600">
                  {blocks.length} block{blocks.length === 1 ? '' : 's'} · drag-free reorder with ↑ ↓
                </span>
                <button className="btn-ghost !py-1 !text-xs" onClick={() => setPreview(true)}>
                  <Eye className="h-3.5 w-3.5" /> Preview
                </button>
              </div>
              <div className="space-y-2">
                {blocks.map((b, i) => (
                  <div
                    key={b.id}
                    onClick={() => setSelectedId(b.id)}
                    className={cn(
                      'cursor-pointer rounded-lg border p-4 transition',
                      selectedId === b.id ? 'border-nuvra-500/50 bg-nuvra-500/[0.06]' : 'border-white/[0.07] bg-ink-900/60 hover:border-white/15',
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <Badge tone={selectedId === b.id ? 'blue' : 'default'}>
                        {i + 1}. {b.type.replace(/_/g, ' ')}
                      </Badge>
                      <div className="flex gap-1">
                        <button onClick={(e) => { e.stopPropagation(); move(i, -1); }} className="rounded p-1 hover:bg-white/10" aria-label="Move up">
                          <ArrowUp className="h-3.5 w-3.5 text-zinc-500" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); move(i, 1); }} className="rounded p-1 hover:bg-white/10" aria-label="Move down">
                          <ArrowDown className="h-3.5 w-3.5 text-zinc-500" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); remove(b.id); }} className="rounded p-1 hover:bg-red-500/20" aria-label="Delete block">
                          <Trash2 className="h-3.5 w-3.5 text-zinc-500" />
                        </button>
                      </div>
                    </div>
                    <div className="truncate text-sm text-zinc-400">
                      {String(b.data?.heading ?? b.data?.title ?? b.data?.label ?? '') || <span className="text-zinc-600">Empty block</span>}
                    </div>
                  </div>
                ))}
                {blocks.length === 0 && (
                  <button
                    onClick={() => setAddOpen(true)}
                    className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-white/15 px-6 py-14 text-zinc-600 hover:border-nuvra-500/40 hover:text-zinc-400"
                  >
                    <Plus className="h-6 w-6" />
                    <span className="text-sm">Add your first block</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Inspector */}
        <aside className="border-t border-white/[0.07] bg-ink-900/40 p-4 lg:border-l lg:border-t-0">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Inspector</div>
          {!selected ? (
            <p className="text-xs text-zinc-600">Select a block to edit its content.</p>
          ) : (
            <div className="space-y-3.5">
              <div className="text-xs font-medium capitalize text-nuvra-300">
                {selected.type.replace(/_/g, ' ')}
              </div>
              {Object.keys(selected.data).map((key) => {
                const value = (selected.data as Record<string, unknown>)[key];
                const label = SCALAR_LABELS[key] ?? key.replace(/([A-Z])/g, ' $1');
                if (Array.isArray(value) || (value && typeof value === 'object')) {
                  return (
                    <div key={key}>
                      <label className="label">{label} (JSON)</label>
                      <textarea
                        className="input font-mono !text-[11px]"
                        rows={Math.min(10, Math.max(4, JSON.stringify(value, null, 1).split('\n').length))}
                        defaultValue={JSON.stringify(value, null, 1)}
                        onBlur={(e) => {
                          try {
                            editSelected(key, JSON.parse(e.target.value));
                          } catch {
                            setError('Invalid JSON — not saved');
                          }
                        }}
                      />
                    </div>
                  );
                }
                if (typeof value === 'boolean') {
                  return (
                    <label key={key} className="flex items-center justify-between text-xs text-zinc-400">
                      {label}
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => editSelected(key, e.target.checked)}
                        className="h-4 w-4 accent-[#1B51F5]"
                      />
                    </label>
                  );
                }
                if (key === 'align') {
                  return (
                    <div key={key}>
                      <label className="label">{label}</label>
                      <div className="flex gap-1.5">
                        {['left', 'center', 'right'].map((a) => (
                          <button
                            key={a}
                            onClick={() => editSelected(key, a)}
                            className={cn(
                              'flex-1 rounded-md border px-2 py-1.5 text-xs capitalize',
                              value === a ? 'border-nuvra-500 bg-nuvra-500/15 text-nuvra-200' : 'border-white/10 text-zinc-500',
                            )}
                          >
                            {a}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={key}>
                    <label className="label">{label}</label>
                    <input
                      className="input !py-2 text-xs"
                      value={
                        typeof value === 'number' || typeof value === 'string'
                          ? value
                          : value == null
                            ? ''
                            : String(value)
                      }
                      onChange={(e) =>
                        editSelected(key, typeof value === 'number' ? Number(e.target.value) || 0 : e.target.value)
                      }
                    />
                  </div>
                );
              })}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
