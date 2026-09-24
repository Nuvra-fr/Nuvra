'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateCourseAction, deleteCourseAction } from '@/server/actions/courses';
import { FormError } from '@/components/auth';

export default function CourseSettingsForm({
  courseId,
  initial,
}: {
  courseId: string;
  initial: {
    title: string;
    description: string;
    price: string;
    status: string;
    level: string;
    category: string;
    coverUrl: string;
  };
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    setSaved(false);
    const priceCents = Math.round(parseFloat(form.price || '0') * 100);
    startTransition(async () => {
      const res = await updateCourseAction(courseId, {
        title: form.title,
        description: form.description,
        priceCents,
        status: form.status as 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED',
        level: form.level,
        category: form.category,
        coverUrl: form.coverUrl,
      });
      if (!res.ok) setError(res.error);
      else {
        setSaved(true);
        router.refresh();
      }
    });
  }

  function remove() {
    if (!confirm('Delete this course, its curriculum and enrollments?')) return;
    startTransition(async () => {
      const res = await deleteCourseAction(courseId);
      if (!res.ok) setError(res.error);
      else {
        router.push('/dashboard/courses');
        router.refresh();
      }
    });
  }

  return (
    <div className="card p-5">
      <div className="space-y-3.5">
        <div>
          <label className="label">Title</label>
          <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            className="input"
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Price (USD)</label>
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Level</label>
            <select className="input" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Category</label>
            <input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Marketing" />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="DRAFT">Draft</option>
              <option value="REVIEW">In review</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">Cover image URL</label>
          <input className="input" value={form.coverUrl} onChange={(e) => setForm({ ...form, coverUrl: e.target.value })} placeholder="https://…" />
        </div>
      </div>

      <FormError error={error} />

      <div className="mt-5 flex items-center justify-between">
        <button className="btn-danger !py-2 !text-xs" onClick={remove} disabled={pending}>
          Delete course
        </button>
        <div className="flex items-center gap-3">
          {saved ? <span className="text-xs text-emerald-400">Saved ✓</span> : null}
          <button className="btn-primary" onClick={save} disabled={pending}>
            {pending ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
