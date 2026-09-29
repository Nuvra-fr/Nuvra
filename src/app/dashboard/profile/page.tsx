import type { Metadata } from 'next';
import { Badge, PageHeader, Card } from '@/components/ui';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import ResendVerificationButton from './ResendVerificationButton';

export const metadata: Metadata = { title: 'Profil' };

export default async function ProfilePage() {
  const ctx = await requireUser();
  const activeSessions = await db
    .select({
      id: sessions.id,
      createdAt: sessions.createdAt,
      userAgent: sessions.userAgent,
    })
    .from(sessions)
    .where(eq(sessions.userId, ctx.user.id))
    .all();

  return (
    <div>
      <PageHeader
        title="Profil"
        description="Votre compte, votre lien Nuvra et vos sessions."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card padded>
          <div className="mb-4 section-title">Compte</div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Nom</span>
              <span className="text-zinc-200">{ctx.user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Email</span>
              <span className="text-zinc-200">{ctx.user.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Statut de l’email</span>
              {ctx.user.emailVerifiedAt ? (
                <Badge tone="green">Vérifié</Badge>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge tone="amber">Unverified</Badge>
                  <ResendVerificationButton />
                </div>
              )}
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Rôle</span>
              <span className="text-zinc-200">{ctx.user.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Nuvra Link</span>
              <a
                href={`/@${ctx.profile?.username ?? ''}`}
                target="_blank"
                className="text-nuvra-400 hover:underline"
              >
                /@{ctx.profile?.username}
              </a>
            </div>
          </div>
        </Card>

        <Card padded>
          <div className="mb-4 section-title">Sessions</div>
          <div className="space-y-2">
            {activeSessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-white/[0.07] px-3 py-2.5 text-xs"
              >
                <span className="truncate text-zinc-400">
                  {s.userAgent?.slice(0, 60) ?? 'Cet appareil'}
                </span>
                <span className="text-zinc-600">
                  since {new Date(s.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-zinc-600">
            Changer votre mot de passe invalide toutes les sessions. Les
            sessions expirent au bout de 30 jours.
          </p>
        </Card>
      </div>
    </div>
  );
}
