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

export function creditsUsedThisMonth(workspaceId: string): number {
  const rows = db
    .select({ creditsUsed: aiUsage.creditsUsed })
    .from(aiUsage)
    .where(and(eq(aiUsage.workspaceId, workspaceId), gte(aiUsage.createdAt, monthStart())))
    .all();
  return rows.reduce((s, r) => s + r.creditsUsed, 0);
}

export function creditQuota(plan: string): number {
  return aiCreditsForPlan(plan);
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
    'You are Nuvra AI, an expert funnel architect. Given a business description, output a concise funnel plan: steps (landing → lead → sales → checkout → upsell → thank you), page purpose, headline suggestions and CTA copy. Plain text, structured with headings.',
  course_planner:
    'You are Nuvra AI, an expert course designer. Given a course idea, output a syllabus: modules, lesson titles per module, learning objectives and one quiz question per module. Plain text, structured with headings.',
  copywriter:
    'You are Nuvra AI, a direct-response copywriter. Given a product/audience description, write: 3 headlines, a hero subheadline, a short sales paragraph, and 3 CTA variations. Plain text.',
  analytics_assistant:
    'You are Nuvra AI, a business analytics assistant. Given metrics context, explain what is working, what is declining, which data deserves attention and which experiments to run. Present everything as suggestions, never guarantees. Plain text.',
};

export async function aiGenerate(input: AIGenerateInput): Promise<AIGenerateResult> {
  if (!flagEnabled('ai')) throw new AIUnavailableError('AI features are disabled by an administrator (feature flag: ai).');
  const key = providerKey();
  if (!key) {
    throw new AIUnavailableError(
      'AI provider is not configured. Set the AI_API_KEY environment variable (OpenAI-compatible) to enable Nuvra AI.',
    );
  }
  const used = creditsUsedThisMonth(input.workspaceId);
  const quota = creditQuota(input.plan);
  if (used + 1 > quota) {
    throw new AICreditError(
      `Monthly AI credit quota reached (${quota}). Upgrade your plan or wait for next month's reset.`,
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
      throw new AIUnavailableError(`AI provider error (${res.status}): ${err.slice(0, 300)}`);
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    const text = data.choices?.[0]?.message?.content?.trim() ?? '';
    const creditsUsed = 1;
    db.insert(aiUsage)
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
