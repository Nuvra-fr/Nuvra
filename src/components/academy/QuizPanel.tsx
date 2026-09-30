'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProgressBar } from '@/components/ui';
import { submitAcademyQuizAction } from '@/server/actions/academy';

export interface QuizQuestion {
  question: string;
  options: string[];
  explanation?: string;
}

interface Result {
  score: number;
  passed: boolean;
  passingScore: number;
  details: {
    question: string;
    given: number;
    expected: number;
    ok: boolean;
    explanation: string;
  }[];
}

export default function QuizPanel({
  quizId,
  title,
  questions,
  passingScore,
  bestScore,
  attempts,
}: {
  quizId: string;
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
  bestScore: number | null;
  attempts: number;
}) {
  const [answers, setAnswers] = useState<(number | null)[]>(questions.map(() => null));
  const [result, setResult] = useState<Result | null>(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const answered = answers.filter((a) => a !== null).length;

  function submit() {
    setError(null);
    start(async () => {
      const res = await submitAcademyQuizAction({
        quizId,
        answers: answers.map((a) => (a === null ? -1 : a)),
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setResult(res.data);
      if (res.data.passed) router.refresh();
    });
  }

  function retry() {
    setAnswers(questions.map(() => null));
    setResult(null);
  }

  return (
    <section className="card overflow-hidden" aria-label={title}>
      <div className="card-head flex-wrap gap-2">
        <div>
          <h2 className="section-title">{title}</h2>
          <p className="section-subtitle">
            {questions.length} question{questions.length > 1 ? 's' : ''} · score
            minimum {passingScore} %
          </p>
        </div>
        {bestScore !== null ? (
          <span className="text-xs text-zinc-500">
            Meilleur score : {bestScore} %
          </span>
        ) : null}
      </div>

      <div className="card-body space-y-5">
        {questions.map((q, qi) => {
          const detail = result?.details[qi];
          return (
            <fieldset key={q.question} className="space-y-2">
              <legend className="text-sm font-medium text-zinc-200">
                {qi + 1}. {q.question}
              </legend>
              <div className="space-y-1.5">
                {q.options.map((opt, oi) => {
                  const chosen = answers[qi] === oi;
                  const isRight = detail?.ok === true && detail.expected === oi;
                  const isWrong = detail?.ok === false && detail.given === oi;
                  return (
                    <label
                      key={opt}
                      className={cn(
                        'flex cursor-pointer items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm transition duration-200',
                        isRight
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100'
                          : isWrong
                            ? 'border-red-500/40 bg-red-500/10 text-red-100'
                            : chosen
                              ? 'border-nuvra-500/50 bg-nuvra-500/10 text-zinc-100'
                              : 'border-white/[0.08] text-zinc-300 hover:border-white/20',
                        result ? 'cursor-default' : 'hover:bg-white/[0.04]',
                      )}
                    >
                      <input
                        type="radio"
                        name={q.question}
                        className="mt-1 accent-nuvra-500"
                        checked={chosen}
                        disabled={!!result}
                        onChange={() =>
                          setAnswers((prev) =>
                            prev.map((a, i) => (i === qi ? oi : a)),
                          )
                        }
                      />
                      <span className="leading-relaxed">{opt}</span>
                    </label>
                  );
                })}
              </div>
              {detail ? (
                <p
                  className={cn(
                    'flex items-start gap-1.5 rounded-lg px-3 py-2 text-xs leading-relaxed',
                    detail.ok
                      ? 'bg-emerald-500/10 text-emerald-200'
                      : 'bg-amber-500/10 text-amber-200',
                  )}
                >
                  {detail.ok ? (
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  )}
                  {detail.explanation || (detail.ok ? 'Bonne réponse.' : 'Réponse incorrecte.')}
                </p>
              ) : null}
            </fieldset>
          );
        })}

        {result ? (
          <div
            className={cn(
              'rounded-xl border px-4 py-3',
              result.passed
                ? 'border-emerald-500/30 bg-emerald-500/10'
                : 'border-amber-500/30 bg-amber-500/10',
            )}
            role="status"
          >
            <div className="flex items-center justify-between gap-3">
              <span
                className={cn(
                  'text-sm font-semibold',
                  result.passed ? 'text-emerald-200' : 'text-amber-200',
                )}
              >
                {result.passed ? 'Quiz réussi' : 'Quiz non validé'} — {result.score} %
              </span>
              <span className="text-xs text-zinc-500">
                {result.details.filter((d) => d.ok).length}/{result.details.length} bonnes
                réponses
              </span>
            </div>
            <div className="mt-2">
              <ProgressBar value={result.score} />
            </div>
            {result.passed ? (
              <p className="mt-2 text-xs text-emerald-200/80">
                Cette leçon est marquée comme terminée — votre progression est à
                jour.
              </p>
            ) : (
              <button type="button" onClick={retry} className="btn-secondary btn-sm mt-3">
                Réessayer
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={submit}
              disabled={pending || answered < questions.length}
              className="btn-primary"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Valider mes réponses
            </button>
            <span className="text-xs text-zinc-500">
              {answered}/{questions.length} réponse{answered > 1 ? 's' : ''}
              {attempts > 0
                ? ` · ${attempts} tentative${attempts > 1 ? 's' : ''} au total`
                : ''}
            </span>
          </div>
        )}

        {error ? <p className="text-xs text-red-300">{error}</p> : null}
      </div>
    </section>
  );
}
