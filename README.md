# codex-documentation

User-facing documentation for Codex Editor, built with Next.js and Fumadocs.

## Purpose

This site explains how translators, project coordinators, media teams, and support staff use the current Codex desktop app and Codex Translation Editor extension. Treat `codex-editor` and `codex` as source-of-truth repos for product behavior and UI labels.

## Local Development

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

After adding, deleting, or renaming MDX files, regenerate the Fumadocs source layer:

```bash
pnpm postinstall
```

## Useful Commands

```bash
pnpm build
pnpm watch
```

## Docs Assistant (Ask AI)

The docs site includes an "Ask AI" chat widget (bottom-right of every docs page) that answers verbatim questions from the documentation. It sends the full docs corpus to Claude Haiku with prompt caching, so no search index or vector database is involved.

- Set `ANTHROPIC_API_KEY` in the deployment environment to enable it. Without the key, the widget shows a "not configured" message and the rest of the site works normally.
- Optionally set `CHATBOT_MODEL` to override the model (defaults to `claude-haiku-4-5`).
- The API route is `app/api/chat/route.ts`; the widget is `components/ask-ai.tsx`; the corpus builder is `lib/docs-corpus.ts`. New or edited MDX pages are picked up automatically on the next deploy.

## Content Map

- `content/docs/` contains MDX documentation pages.
- `content/docs/meta.json` controls top-level navigation.
- Each section folder has its own `meta.json` for ordering.
- `public/images/` contains screenshots and static assets.
- `components/` contains custom MDX components such as troubleshooting flows.
- `docs/plans/` contains durable branch briefs for larger rewrites.

## Writing Rules

- Use current Codex UI labels exactly.
- Prefer task-based pages over long feature inventories.
- Keep FAQ answers short and link to canonical pages.
- Use "cell" or "segment" for general workflows; use "verse" only for scripture-specific guidance.
- Do not document inactive importers or unshipped features as available.
- When app behavior is involved, distinguish the Codex desktop app from the Codex Translation Editor extension.
