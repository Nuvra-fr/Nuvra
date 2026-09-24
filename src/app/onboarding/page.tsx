import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import OnboardingClient from './OnboardingClient';

export const metadata: Metadata = { title: 'Set up your space' };

export default async function OnboardingPage() {
  const ctx = await getSession();
  if (!ctx) redirect('/register');
  if (ctx.profile && ctx.profile.onboardingStep >= 5) redirect('/dashboard');
  return <OnboardingClient username={ctx.profile?.username ?? 'creator'} />;
}
