'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'lg' ? 'h-9 w-9 text-lg' : size === 'sm' ? 'h-6 w-6 text-xs' : 'h-8 w-8 text-sm';
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Nuvra home">
      <span
        className={`${s} flex items-center justify-center rounded-lg bg-nuvra-600 font-bold text-white shadow-glow`}
      >
        N
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-zinc-100">Nuvra</span>
    </Link>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-950 px-4 py-10">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="card w-full max-w-md p-7">
        <h1 className="text-lg font-semibold text-zinc-100">{title}</h1>
        <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
      {footer ? <div className="mt-5 text-center text-sm text-zinc-500">{footer}</div> : null}
    </div>
  );
}

export function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="mb-4">
      <label className="label" htmlFor={props.name}>
        {label}
      </label>
      <input className="input" {...props} />
    </div>
  );
}

export function FormError({ error }: { error?: string | null }) {
  if (!error) return null;
  return (
    <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
      {error}
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Unable to sign in.');
        return;
      }
      router.push(data.next ?? '/dashboard');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <FormError error={error} />
      <Field label="Email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        placeholder="••••••••"
      />
      <div className="mb-5 flex justify-end">
        <Link href="/forgot-password" className="text-xs text-nuvra-400 hover:text-nuvra-300">
          Forgot password?
        </Link>
      </div>
      <button className="btn-primary w-full" disabled={loading} type="submit">
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          password: form.get('password'),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Unable to create the account.');
        return;
      }
      router.push(data.next ?? '/dashboard');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <FormError error={error} />
      <Field label="Full name" name="name" autoComplete="name" required placeholder="Alex Martin" />
      <Field label="Email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      <Field
        label="Password (8+ characters)"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        placeholder="••••••••"
      />
      <button className="btn-primary w-full" disabled={loading} type="submit">
        {loading ? 'Creating account…' : 'Start for free'}
      </button>
      <p className="mt-4 text-center text-xs text-zinc-600">
        By continuing you agree to our Terms and Privacy Policy.
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.get('email') }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Unable to process the request.');
        return;
      }
      setDone(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-3 text-sm text-emerald-200">
        If that account exists, a reset link has been sent. Check your inbox (and the Nuvra outbox in
        Admin → Emails if no email provider is configured).
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <FormError error={error} />
      <Field label="Email" name="email" type="email" required placeholder="you@example.com" />
      <button className="btn-primary w-full" disabled={loading} type="submit">
        {loading ? 'Sending…' : 'Send reset link'}
      </button>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: form.get('password') }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Unable to reset the password.');
        return;
      }
      router.push('/login');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <FormError error={error} />
      <Field
        label="New password (8+ characters)"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        placeholder="••••••••"
      />
      <button className="btn-primary w-full" disabled={loading} type="submit">
        {loading ? 'Updating…' : 'Update password'}
      </button>
    </form>
  );
}
