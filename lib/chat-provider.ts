import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Provider-agnostic chat layer. The active model is chosen with the
 * CHATBOT_MODEL env var and the provider is inferred from its name:
 * `claude-*` routes to Anthropic, anything else to OpenAI
 * (e.g. `gpt-5.6-luna`). Swap models by changing the env var — no code
 * changes needed.
 */
export const CHAT_MODEL = process.env.CHATBOT_MODEL ?? 'claude-haiku-4-5';

type Provider = 'anthropic' | 'openai';

function provider(): Provider {
  return CHAT_MODEL.startsWith('claude') ? 'anthropic' : 'openai';
}

export function chatConfigured(): boolean {
  return provider() === 'anthropic'
    ? Boolean(process.env.ANTHROPIC_API_KEY)
    : Boolean(process.env.OPENAI_API_KEY);
}

const MAX_OUTPUT_TOKENS = 1024;

function anthropicStream(
  system: string,
  messages: ChatMessage[],
): ReadableStream<Uint8Array> {
  const client = new Anthropic();
  const stream = client.messages.stream({
    model: CHAT_MODEL,
    max_tokens: MAX_OUTPUT_TOKENS,
    system: [
      {
        type: 'text',
        text: system,
        // The system prompt (instructions + docs corpus) is identical on
        // every request, so repeat questions read it from cache at ~10%
        // of input price.
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages,
  });

  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      stream.on('text', (delta) => controller.enqueue(encoder.encode(delta)));
      stream.on('end', () => controller.close());
      stream.on('error', (err) => {
        console.error('chat stream error (anthropic):', err);
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
}

function openaiStream(
  system: string,
  messages: ChatMessage[],
): ReadableStream<Uint8Array> {
  const client = new OpenAI();
  const encoder = new TextEncoder();
  const abort = new AbortController();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        // OpenAI caches long stable prompt prefixes automatically — the
        // system message just needs to come first and stay byte-identical.
        const stream = await client.chat.completions.create(
          {
            model: CHAT_MODEL,
            stream: true,
            max_completion_tokens: MAX_OUTPUT_TOKENS,
            messages: [{ role: 'system', content: system }, ...messages],
          },
          { signal: abort.signal },
        );
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) controller.enqueue(encoder.encode(delta));
        }
        controller.close();
      } catch (err) {
        if (abort.signal.aborted) return;
        console.error('chat stream error (openai):', err);
        controller.enqueue(
          encoder.encode('\n\nSorry, something went wrong. Please try again.'),
        );
        controller.close();
      }
    },
    cancel() {
      abort.abort();
    },
  });
}

export function streamChat(
  system: string,
  messages: ChatMessage[],
): ReadableStream<Uint8Array> {
  return provider() === 'anthropic'
    ? anthropicStream(system, messages)
    : openaiStream(system, messages);
}
