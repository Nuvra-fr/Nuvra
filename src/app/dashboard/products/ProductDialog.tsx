'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from '@/server/actions/products';
import { FormError } from '@/components/auth';
import { StatusBadge } from '@/components/ui';

interface ProductProp {
  id: string;
  name: string;
  description: string;
  type: string;
  priceCents: number;
  status: string;
  downloadUrl: string;
  coverUrl: string;
}

export default function ProductDialog({
  open,
  product,
}: {
  open: boolean;
  product: ProductProp | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    type: product?.type ?? 'DIGITAL',
    price: ((product?.priceCents ?? 9900) / 100).toString(),
    status: product?.status ?? 'DRAFT',
    downloadUrl: product?.downloadUrl ?? '',
    coverUrl: product?.coverUrl ?? '',
  });

  if (!open) return null;

  function close() {
    router.push('/dashboard/products');
  }

  function submit() {
    setError(null);
    const priceCents = Math.round(parseFloat(form.price || '0') * 100);
    if (!Number.isFinite(priceCents) || priceCents < 0) {
      setError('Prix invalide');
      return;
    }
    startTransition(async () => {
      const payload = {
        name: form.name,
        description: form.description,
        type: form.type as 'DIGITAL' | 'SERVICE' | 'AUDIO' | 'TEMPLATE',
        priceCents,
        status: form.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
        downloadUrl: form.downloadUrl || undefined,
        coverUrl: form.coverUrl || undefined,
      };
      const res = product
        ? await updateProductAction(product.id, payload)
        : await createProductAction(payload);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push('/dashboard/products');
      router.refresh();
    });
  }

  function remove() {
    if (!product) return;
    if (!confirm('Supprimer ce produit ? Cette action est irréversible.'))
      return;
    startTransition(async () => {
      const res = await deleteProductAction(product.id);
      if (!res.ok) setError(res.error);
      else {
        router.push('/dashboard/products');
        router.refresh();
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-10">
      <div className="absolute inset-0" onClick={close} />
      <div className="relative w-full max-w-lg rounded-xl border border-white/10 bg-ink-850 p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-100">
            {product ? 'Modifier le produit' : 'Nouveau produit'}
          </h2>
          <div className="flex items-center gap-2">
            {product ? <StatusBadge status={product.status} /> : null}
            <button
              className="btn-ghost !p-1.5"
              onClick={close}
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-3.5">
          <div>
            <label className="label">Nom</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Pack de modèles Notion"
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input"
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Que reçoit l’acheteur ?"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Type</label>
              <select
                className="input"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="DIGITAL">Digital</option>
                <option value="TEMPLATE">Template</option>
                <option value="AUDIO">Audio</option>
                <option value="SERVICE">Service</option>
              </select>
            </div>
            <div>
              <label className="label">Prix (USD)</label>
              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">
              URL de livraison (téléchargement / accès)
            </label>
            <input
              className="input"
              value={form.downloadUrl}
              onChange={(e) =>
                setForm({ ...form, downloadUrl: e.target.value })
              }
              placeholder="https://…"
            />
          </div>
          <div>
            <label className="label">Statut</label>
            <select
              className="input"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="DRAFT">Brouillon</option>
              <option value="PUBLISHED">Publié</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        <FormError error={error} />

        <div className="mt-6 flex items-center justify-between">
          {product ? (
            <button
              className="btn-danger !py-2 !text-xs"
              onClick={remove}
              disabled={pending}
            >
              Supprimer
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={close}>
              Annuler
            </button>
            <button
              className="btn-primary"
              onClick={submit}
              disabled={pending || form.name.trim().length < 2}
            >
              {pending
                ? 'Enregistrement…'
                : product
                  ? 'Enregistrer'
                  : 'Créer le produit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
