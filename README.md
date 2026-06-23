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
