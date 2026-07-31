import Anthropic from '@anthropic-ai/sdk';
import { getDocsCorpus } from '@/lib/docs-corpus';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MODEL = process.env.CHATBOT_MODEL ?? 'claude-haiku-4-5';
const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 4000;

// Best-effort per-instance rate limit; good enough to stop casual abuse of a
// public docs endpoint without adding infrastructure.
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) return true;
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 10_000) hits.clear();
  return false;
}

const INSTRUCTIONS = `You are the documentation assistant for Codex Editor, embedded in the official docs site. Answer questions from translators, project coordinators, media teams, and support staff using ONLY the documentation provided below.

Rules:
- Answer from the documentation. If the docs don't cover something, say so plainly and suggest the closest relevant page — never invent features, menu labels, or behavior.
- Use current Codex UI labels exactly as they appear in the docs.
- When app behavior is involved, distinguish the Codex desktop app from the Codex Translation Editor extension.
- Keep answers short and task-focused. Link to the relevant page using its url from the page metadata, as a markdown link like [Page Title](/docs/...).
- Use "cell" or "segment" for general workflows; use "verse" only for scripture-specific guidance.
- If the question is unrelated to Codex Editor or its documentation, politely decline and redirect to the docs.`;

export async function POST(req: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: 'The docs assistant is not configured on this deployment.' },
      { status: 503 },
    );
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (rateLimited(ip)) {
    return Response.json(
      { error: 'Too many requests — please wait a minute and try again.' },
      { status: 429 },
    );
  }

  let messages: { role: 'user' | 'assistant'; content: string }[];
  try {
    const body = await req.json();
    messages = body.messages;
    if (
      !Array.isArray(messages) ||
      messages.length === 0 ||
      messages.length > MAX_MESSAGES ||
      messages.some(
        (m) =>
          (m.role !== 'user' && m.role !== 'assistant') ||
          typeof m.content !== 'string' ||
          m.content.length === 0 ||
          m.content.length > MAX_MESSAGE_LENGTH,
      )
    ) {
      throw new Error('invalid');
    }
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const client = new Anthropic();

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 1024,
    system: [
      {
        type: 'text',
        text: `${INSTRUCTIONS}\n\n<documentation>\n${getDocsCorpus()}\n</documentation>`,
        // The instructions + docs corpus are identical on every request, so
        // repeat questions read them from cache at ~10% of input price.
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    start(controller) {
      stream.on('text', (delta) => controller.enqueue(encoder.encode(delta)));
      stream.on('end', () => controller.close());
      stream.on('error', (err) => {
        console.error('chat stream error:', err);
        controller.enqueue(
          encoder.encode('\n\nSorry, something went wrong. Please try again.'),
        );
        controller.close();
      });
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
