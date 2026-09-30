import { Fragment, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Minimal, dependency-free Markdown renderer for lesson bodies.
 *
 * Lesson content is stored in the database as Markdown and rendered here as
 * React elements (never `dangerouslySetInnerHTML`), so a compromised seed or a
 * bad admin edit cannot inject markup. Supports: headings, paragraphs, bullet
 * and numbered lists, blockquotes, rules, bold, italic, inline code, links and
 * line breaks — everything the authored lessons use, in French.
 */
function inline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern =
    /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = pattern.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const token = m[0];
    const key = `${keyPrefix}-i${i++}`;
    if (token.startsWith('**')) {
      out.push(
        <strong key={key} className="font-semibold text-zinc-100">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith('`')) {
      out.push(
        <code
          key={key}
          className="rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-0.5 text-[0.85em] text-nuvra-200"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith('[')) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
      const href = linkMatch?.[2] ?? '#';
      const external = /^https?:\/\//.test(href);
      out.push(
        <a
          key={key}
          href={href}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="text-nuvra-300 underline decoration-nuvra-500/40 underline-offset-2 hover:decoration-nuvra-400"
        >
          {linkMatch?.[1] ?? href}
        </a>,
      );
    } else {
      out.push(
        <em key={key} className="text-zinc-300">
          {token.slice(1, -1)}
        </em>,
      );
    }
    last = m.index + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export default function LessonContent({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  const blocks = content.replace(/\r\n/g, '\n').split('\n');
  const nodes: ReactNode[] = [];
  let list: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let quote: string[] = [];
  let paragraph: string[] = [];

  const flushList = () => {
    if (!list) return;
    const items = list.items;
    const Tag = list.type;
    nodes.push(
      <Tag
        key={`l-${nodes.length}`}
        className={cn(
          'my-3 space-y-1.5 pl-1',
          list.type === 'ul' ? 'list-disc' : 'list-decimal',
        )}
        style={{ listStylePosition: 'outside' }}
      >
        {items.map((item, i) => (
          <li key={i} className="pl-1 text-[0.95rem] leading-relaxed text-zinc-300">
            {inline(item, `li-${nodes.length}-${i}`)}
          </li>
        ))}
      </Tag>,
    );
    list = null;
  };

  const flushQuote = () => {
    if (!quote.length) return;
    nodes.push(
      <blockquote
        key={`q-${nodes.length}`}
        className="my-3 rounded-r-xl border-l-2 border-nuvra-500/60 bg-nuvra-500/[0.07] py-2.5 pl-4 pr-3 text-[0.95rem] italic leading-relaxed text-zinc-300"
      >
        {inline(quote.join(' '), `q-${nodes.length}`)}
      </blockquote>,
    );
    quote = [];
  };

  const flushParagraph = () => {
    if (!paragraph.length) return;
    nodes.push(
      <p
        key={`p-${nodes.length}`}
        className="my-3 text-[0.95rem] leading-[1.75] text-zinc-300"
      >
        {inline(paragraph.join(' '), `p-${nodes.length}`)}
      </p>,
    );
    paragraph = [];
  };

  for (const raw of blocks) {
    const line = raw.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      flushQuote();
      flushParagraph();
      continue;
    }
    if (/^-{3,}$|^\*{3,}$|^_+$/.test(trimmed)) {
      flushList();
      flushQuote();
      flushParagraph();
      nodes.push(<hr key={`h-${nodes.length}`} className="my-6 border-white/[0.08]" />);
      continue;
    }
    const heading = trimmed.match(/^(#{2,4})\s+(.*)$/);
    if (heading) {
      flushList();
      flushQuote();
      flushParagraph();
      const level = heading[1]!.length;
      const text = heading[2]!;
      if (level === 2) {
        nodes.push(
          <h2
            key={`h2-${nodes.length}`}
            className="mt-8 mb-1 text-lg font-semibold tracking-[-0.01em] text-zinc-50"
          >
            {inline(text, `h2-${nodes.length}`)}
          </h2>,
        );
      } else if (level === 3) {
        nodes.push(
          <h3
            key={`h3-${nodes.length}`}
            className="mt-6 mb-1 text-[0.95rem] font-semibold uppercase tracking-[0.08em] text-nuvra-300"
          >
            {inline(text, `h3-${nodes.length}`)}
          </h3>,
        );
      } else {
        nodes.push(
          <h4
            key={`h4-${nodes.length}`}
            className="mt-4 mb-1 text-sm font-semibold text-zinc-200"
          >
            {inline(text, `h4-${nodes.length}`)}
          </h4>,
        );
      }
      continue;
    }
    const bullet = trimmed.match(/^[-*•]\s+(.*)$/);
    if (bullet) {
      flushQuote();
      flushParagraph();
      if (!list || list.type !== 'ul') {
        flushList();
        list = { type: 'ul', items: [] };
      }
      list.items.push(bullet[1]!);
      continue;
    }
    const numbered = trimmed.match(/^\d+[.)]\s+(.*)$/);
    if (numbered) {
      flushQuote();
      flushParagraph();
      if (!list || list.type !== 'ol') {
        flushList();
        list = { type: 'ol', items: [] };
      }
      list.items.push(numbered[1]!);
      continue;
    }
    const quoted = trimmed.match(/^>\s?(.*)$/);
    if (quoted) {
      flushList();
      flushParagraph();
      quote.push(quoted[1]!);
      continue;
    }
    flushList();
    flushQuote();
    paragraph.push(trimmed);
  }
  flushList();
  flushQuote();
  flushParagraph();

  return <div className={cn('max-w-none', className)}>{nodes.map((n, i) => <Fragment key={i}>{n}</Fragment>)}</div>;
}
