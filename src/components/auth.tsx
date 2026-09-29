'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/BrandLogo';

/**
 * @deprecated Use <BrandLogo> from '@/components/BrandLogo' directly — the brand
 * component renders the official artwork and handles sizing/priority. Kept as a
 * thin alias so existing auth screens keep working unchanged.
 */
export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return <BrandLogo size={size} />;
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
        <BrandLogo size="lg" orientation="stacked" />
      </div>
      <div className="card w-full max-w-md p-7">
        <h1 className="text-lg font-semibold text-zinc-100">{title}</h1>
        <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
      {footer ? (
        <div className="mt-6 text-center text-sm text-zinc-500">{footer}</div>
      ) : null}
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
        body: JSON.stringify({
          email: form.get('email'),
          password: form.get('password'),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Impossible de vous connecter.');
        return;
      }
      router.push(data.next ?? '/dashboard');
      router.refresh();
    } catch {
      setError('Erreur réseau. Merci de réessayer.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <FormError error={error} />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="vous@exemple.com"
      />
      <Field
        label="Mot de passe"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        placeholder="••••••••"
      />
      <div className="mb-5 flex justify-end">
        <Link
          href="/forgot-password"
          className="text-xs text-nuvra-400 hover:text-nuvra-300"
        >
          Mot de passe oublié ?
        </Link>
      </div>
      <button className="btn-primary w-full" disabled={loading} type="submit">
        {loading ? 'Connexion…' : 'Se connecter'}
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
        setError(data.error ?? 'Impossible de créer le compte.');
        return;
      }
      router.push(data.next ?? '/dashboard');
      router.refresh();
    } catch {
      setError('Erreur réseau. Merci de réessayer.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <FormError error={error} />
      <Field
        label="Nom complet"
        name="name"
        autoComplete="name"
        required
        placeholder="Camille Martin"
      />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="vous@exemple.com"
      />
      <Field
        label="Mot de passe (8 caractères minimum)"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        placeholder="••••••••"
      />
      <button className="btn-primary w-full" disabled={loading} type="submit">
        {loading ? 'Création du compte…' : 'Commencer gratuitement'}
      </button>
      <p className="mt-4 text-center text-xs text-zinc-600">
        En continuant, vous acceptez nos Conditions et notre Politique de
        confidentialité.
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
        setError(data.error ?? 'Impossible de traiter la demande.');
        return;
      }
      setDone(true);
    } catch {
      setError('Erreur réseau. Merci de réessayer.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-3 text-sm text-emerald-200">
        Si ce compte existe, un lien de réinitialisation vient d’être envoyé.
        Consultez votre boîte de réception (et la boîte d’envoi Nuvra dans Admin
        → Emails si aucun service d’email n’est configuré).
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <FormError error={error} />
      <Field
        label="Email"
        name="email"
        type="email"
        required
        placeholder="vous@exemple.com"
      />
      <button className="btn-primary w-full" disabled={loading} type="submit">
        {loading ? 'Envoi…' : 'Envoyer le lien de réinitialisation'}
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
        setError(data.error ?? 'Impossible de réinitialiser le mot de passe.');
        return;
      }
      router.push('/login');
    } catch {
      setError('Erreur réseau. Merci de réessayer.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <FormError error={error} />
      <Field
        label="Nouveau mot de passe (8 caractères minimum)"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        placeholder="••••••••"
      />
      <button className="btn-primary w-full" disabled={loading} type="submit">
        {loading ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
      </button>
    </form>
  );
}
