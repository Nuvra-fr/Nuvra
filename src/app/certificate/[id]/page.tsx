import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { Award, CheckCircle2, GraduationCap, ShieldCheck } from 'lucide-react';
import { db } from '@/lib/db';
import { courses, enrollments, users } from '@/db/schema';
import { getCertificateByCode } from '@/lib/academy';
import { appBaseUrl } from '@/lib/utils';
import { BrandLogo } from '@/components/BrandLogo';
import { InlineAlert } from '@/components/ui';
import CopyCertificateLink from '@/components/academy/CopyCertificateLink';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const cert = await getCertificateByCode(decodeURIComponent(id));
  if (!cert) return { title: 'Certificat introuvable — Nuvra Academy' };
  const user = await db.select({ name: users.name }).from(users).where(eq(users.id, cert.userId)).get();
  const course = cert.enrollmentId
    ? await db
        .select({ title: courses.title, course: courses })
        .from(enrollments)
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .where(eq(enrollments.id, cert.enrollmentId))
        .get()
    : null;
  return {
    title: `Certificat Nuvra Academy — ${user?.name ?? ''}`,
    description: `Certificat vérifiable : ${user?.name ?? 'apprenant'} a terminé ${course?.title ?? 'Nuvra Academy'}.`,
  };
}

/**
 * Public certificate verification page — `/certificate/[id]`.
 *
 * Deliberately public: anyone can check that a certificate is real, without
 * creating an account. Only the learner's display name and the course are
 * exposed; no email, no workspace, no progress.
 */
export default async function CertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cert = await getCertificateByCode(decodeURIComponent(id));
  if (!cert) notFound();

  const user = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, cert.userId))
    .get();
  const course = await db
    .select({ title: courses.title, course: courses })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(enrollments.id, cert.enrollmentId))
    .get();

  const shareUrl = `${appBaseUrl()}/certificate/${cert.code}`;

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-6">
        <BrandLogo href="/" size="md" />
        <Link href="/academy" className="btn-secondary">
          Nuvra Academy
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-20">
        <div className="relative isolate overflow-hidden rounded-3xl border border-white/[0.08] bg-ink-925">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_-10%,rgba(27,81,245,0.28),transparent_70%)]"
          />
          <div className="relative px-6 py-10 text-center sm:px-10 sm:py-14">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10">
              <Award className="h-7 w-7 text-amber-300" />
            </div>
            <div className="mt-5 eyebrow text-amber-300/80">Certificat vérifié</div>
            <h1 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
              {user?.name ?? 'Apprenant Nuvra'}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              a terminé avec succès le programme
            </p>
            <p className="mt-1 text-lg font-semibold text-zinc-100">
              {course?.title ?? 'Nuvra Academy'}
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              Délivré le{' '}
              {new Date(cert.issuedAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>

            <div className="mx-auto mt-8 max-w-sm rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-4">
              <div className="eyebrow">Identifiant du certificat</div>
              <div className="mt-1.5 select-all font-mono text-lg tracking-[0.18em] text-nuvra-200">
                {cert.code}
              </div>
              <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-emerald-300/80">
                <ShieldCheck className="h-3.5 w-3.5" /> Authentique — émis par
                Nuvra
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <CopyCertificateLink value={shareUrl} />
              <Link href="/academy" className="btn-ghost btn-sm">
                <GraduationCap className="h-3.5 w-3.5" /> Découvrir l&apos;Académie
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <InlineAlert tone="success">
            <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />
            Ce certificat est authentique. Nuvra Academy fait partie des
            118 leçons construites sur la plateforme Nuvra : offre, tunnel,
            formation, acquisition, conversion, automatisation et croissance.
          </InlineAlert>
          <p className="text-xs leading-relaxed text-zinc-600">
            Cette page ne contient que le nom affiché de l&apos;apprenant, le
            programme et la date de délivrance. Aucun email, aucun espace de
            travail, aucune donnée de progression n&apos;y est exposé.
          </p>
        </div>
      </main>
    </div>
  );
}
