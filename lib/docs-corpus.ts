import corpus from './docs-corpus.generated.json';

/**
 * The full documentation corpus as a single string, with each page prefixed
 * by its title and site URL so the model can cite pages by link. Generated
 * at build time by scripts/generate-docs-corpus.mjs (run via postinstall
 * and the build script) and bundled as a JSON module, so the chat route
 * works on hosts without a runtime filesystem (e.g. Cloudflare Workers).
 * The whole corpus is ~30k tokens — small enough for a single cached prompt.
 */
export function getDocsCorpus(): string {
  return corpus.text;
}
