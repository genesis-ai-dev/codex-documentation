'use client';

import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  'How do I create a new translation project?',
  'How do I import an existing translation?',
  'What is the difference between the desktop app and the extension?',
];

/**
 * Minimal renderer for the markdown subset the assistant is prompted to use:
 * paragraphs, bullet lists, links, bold, and inline code.
 */
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\(([^)\s]+)\)|`([^`]+)`|\*\*([^*]+)\*\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const key = `${keyPrefix}-${i++}`;
    if (match[1] !== undefined) {
      const href = match[2];
      nodes.push(
        href.startsWith('/') ? (
          <Link key={key} href={href} className="text-fd-primary underline underline-offset-2">
            {match[1]}
          </Link>
        ) : (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-fd-primary underline underline-offset-2"
          >
            {match[1]}
          </a>
        ),
      );
    } else if (match[3] !== undefined) {
      nodes.push(
        <code key={key} className="rounded bg-fd-muted px-1 py-0.5 text-[0.85em]">
          {match[3]}
        </code>,
      );
    } else if (match[4] !== undefined) {
      nodes.push(
        <strong key={key} className="font-semibold">
          {match[4]}
        </strong>,
      );
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function AssistantMarkdown({ content }: { content: string }) {
  const blocks: ReactNode[] = [];
  const lines = content.split('\n');
  let list: string[] = [];
  let paragraph: string[] = [];
  let key = 0;

  const flushList = () => {
    if (list.length === 0) return;
    blocks.push(
      <ul key={key++} className="my-1 list-disc space-y-1 pl-5">
        {list.map((item, i) => (
          <li key={i}>{renderInline(item, `li-${key}-${i}`)}</li>
        ))}
      </ul>,
    );
    list = [];
  };
  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push(<p key={key++}>{renderInline(paragraph.join(' '), `p-${key}`)}</p>);
    paragraph = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    const bullet = trimmed.match(/^[-*]\s+(.*)$/);
    if (bullet) {
      flushParagraph();
      list.push(bullet[1]);
    } else if (trimmed === '') {
      flushList();
      flushParagraph();
    } else {
      flushList();
      paragraph.push(trimmed);
    }
  }
  flushList();
  flushParagraph();

  return <div className="space-y-2">{blocks}</div>;
}

export function AskAI() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const ask = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (trimmed === '' || loading) return;
      const history = [...messages, { role: 'user' as const, content: trimmed }];
      setMessages([...history, { role: 'assistant', content: '' }]);
      setInput('');
      setLoading(true);

      const controller = new AbortController();
      abortRef.current = controller;
      const appendToAnswer = (text: string) => {
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          next[next.length - 1] = { ...last, content: last.content + text };
          return next;
        });
      };

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) {
          const detail = await res.json().catch(() => null);
          appendToAnswer(
            detail?.error ?? 'Sorry, something went wrong. Please try again.',
          );
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          appendToAnswer(decoder.decode(value, { stream: true }));
        }
      } catch (err) {
        if (!(err instanceof DOMException && err.name === 'AbortError')) {
          appendToAnswer('Sorry, something went wrong. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    },
    [messages, loading],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void ask(input);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close docs assistant' : 'Ask AI about the docs'}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-fd-border bg-fd-background px-4 py-2.5 text-sm font-medium text-fd-foreground shadow-lg transition-colors hover:bg-fd-accent"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 3a6 6 0 0 0-6 6c0 2 1 3.5 2 4.5V16a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.5c1-1 2-2.5 2-4.5a6 6 0 0 0-6-6Z" />
          <path d="M10 21h4" />
        </svg>
        Ask AI
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Docs assistant"
          className="fixed bottom-20 right-5 z-40 flex h-[min(32rem,calc(100dvh-7rem))] w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-xl border border-fd-border bg-fd-background shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-fd-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Docs assistant</p>
              <p className="text-xs text-fd-muted-foreground">
                AI answers from the Codex docs — may make mistakes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="rounded p-1 text-fd-muted-foreground hover:text-fd-foreground"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm">
            {messages.length === 0 ? (
              <div className="space-y-2">
                <p className="text-fd-muted-foreground">
                  Ask a question in your own words, for example:
                </p>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void ask(s)}
                    className="block w-full rounded-lg border border-fd-border px-3 py-2 text-left text-fd-foreground transition-colors hover:bg-fd-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : (
              messages.map((m, i) =>
                m.role === 'user' ? (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[85%] rounded-lg bg-fd-primary/10 px-3 py-2">
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="max-w-full">
                    {m.content === '' && loading && i === messages.length - 1 ? (
                      <p className="animate-pulse text-fd-muted-foreground">Thinking…</p>
                    ) : (
                      <AssistantMarkdown content={m.content} />
                    )}
                  </div>
                ),
              )
            )}
          </div>

          <form onSubmit={onSubmit} className="flex gap-2 border-t border-fd-border p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Codex Editor…"
              maxLength={4000}
              className="flex-1 rounded-lg border border-fd-border bg-fd-background px-3 py-2 text-sm outline-none placeholder:text-fd-muted-foreground focus:border-fd-primary"
            />
            <button
              type="submit"
              disabled={loading || input.trim() === ''}
              className="rounded-lg bg-fd-primary px-3 py-2 text-sm font-medium text-fd-primary-foreground transition-opacity disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
