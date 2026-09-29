import { and, eq, gte } from 'drizzle-orm';
import { db } from '@/lib/db';
import { aiUsage } from '@/db/schema';
import { aiCreditsForPlan, flagEnabled, getConfig } from '@/lib/config';
import type { AIFeature } from '@/lib/constants';

// ─────────────────────────────────────────────────────────────
// Nuvra AI — provider adapter + credit quotas.
// With AI_API_KEY set, calls an OpenAI-compatible chat completions API.
// Without it, endpoints return a precise "provider required" error —
// never fake generated content.
// ─────────────────────────────────────────────────────────────

export class AIUnavailableError extends Error {
  constructor(public readonly hint: string) {
    super(hint);
  }
}

export class AICreditError extends Error {}

function providerKey(): string | null {
  return process.env.AI_API_KEY?.trim() || null;
}

export function aiProviderConfigured(): boolean {
  return providerKey() !== null;
}

export function monthStart(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export async function creditsUsedThisMonth(workspaceId: string): Promise<number> {
  const rows = await db
    .select({ creditsUsed: aiUsage.creditsUsed })
    .from(aiUsage)
    .where(and(eq(aiUsage.workspaceId, workspaceId), gte(aiUsage.createdAt, monthStart())))
    .all();
  return rows.reduce((s, r) => s + r.creditsUsed, 0);
}

export async function creditQuota(plan: string): Promise<number> {
  return await aiCreditsForPlan(plan);
}

export interface AIGenerateInput {
  feature: AIFeature;
  prompt: string;
  userId: string;
  workspaceId: string;
  plan: string;
}

export interface AIGenerateResult {
  text: string;
  creditsUsed: number;
  model: string;
}

const SYSTEM_PROMPTS: Record<AIFeature, string> = {
  funnel_builder:
    'Tu es Nuvra AI, architecte expert en tunnels de vente. À partir d’une description d’activité, produis un plan de tunnel concis : étapes (page de vente → prospect → vente → paiement → upsell → remerciement), rôle de chaque page, suggestions de titres et textes de boutons. Texte brut, structuré avec des titres.',
  course_planner:
    'Tu es Nuvra AI, concepteur expert de formations. À partir d’une idée de formation, produis un programme : modules, titres des leçons par module, objectifs pédagogiques et une question de quiz par module. Texte brut, structuré avec des titres.',
  copywriter:
    'Tu es Nuvra AI, copywriter spécialisé en vente directe. À partir d’une description produit/audience, rédige : 3 titres, un sous-titre principal, un court paragraphe de vente et 3 variantes de bouton d’appel à l’action. Texte brut.',
  analytics_assistant:
    'Tu es Nuvra AI, assistant en analyse business. À partir d’un contexte de métriques, explique ce qui fonctionne, ce qui recule, quelles données méritent attention et quelles expériences lancer. Présente tout comme des suggestions, jamais comme des garanties. Texte brut.',
};

export async function aiGenerate(input: AIGenerateInput): Promise<AIGenerateResult> {
  if (!await flagEnabled('ai')) throw new AIUnavailableError('Les fonctions IA sont désactivées par un administrateur (option de fonctionnalité : ai).');
  const key = providerKey();
  if (!key) {
    throw new AIUnavailableError(
      'Le fournisseur IA n’est pas configuré. Définissez la variable AI_API_KEY (compatible OpenAI) pour activer Nuvra AI.',
    );
  }
  const used = await creditsUsedThisMonth(input.workspaceId);
  const quota = await creditQuota(input.plan);
  if (used + 1 > quota) {
    throw new AICreditError(
      `Quota mensuel de crédits IA atteint (${quota}). Passez à un plan supérieur ou attendez la réinitialisation du mois prochain.`,
    );
  }

  const model = process.env.AI_MODEL?.trim() || 'gpt-4o-mini';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPTS[input.feature] },
          { role: 'user', content: input.prompt.slice(0, 8000) },
        ],
        max_tokens: 1200,
        temperature: 0.7,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new AIUnavailableError(`Erreur du fournisseur IA (${res.status}) : ${err.slice(0, 300)}`);
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    const text = data.choices?.[0]?.message?.content?.trim() ?? '';
    const creditsUsed = 1;
    await db.insert(aiUsage)
      .values({
        workspaceId: input.workspaceId,
        userId: input.userId,
        feature: input.feature,
        model,
        creditsUsed,
        tokensIn: data.usage?.prompt_tokens ?? 0,
        tokensOut: data.usage?.completion_tokens ?? 0,
      })
      .run();
    return { text, creditsUsed, model };
  } finally {
    clearTimeout(timeout);
  }
}

export function aiStatus(plan: string) {
  return {
    configured: aiProviderConfigured(),
    flag: flagEnabled('ai'),
    used: 0, // caller supplies workspace
    quota: creditQuota(plan),
    model: process.env.AI_MODEL ?? 'gpt-4o-mini',
    defaultCredits: getConfig('ai.freeCredits'),
  };
}
