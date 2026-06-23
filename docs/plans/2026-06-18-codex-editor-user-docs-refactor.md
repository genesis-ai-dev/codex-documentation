# Codex Editor User Docs Refactor Brief

Date: 2026-06-18
Branch: `docs/codex-editor-user-docs-refactor`

## Goal

Refactor `codex-documentation` so it serves Codex Editor users first: translators, project coordinators, media teams, and support staff. The site should explain the current Codex desktop app and Codex Translation Editor extension as they ship today, not as an older extension-sideloader prototype.

The rewrite should preserve the useful support material already in the site, but reorganize the information around the real user journey:

1. Install Codex and understand what is being installed.
2. Create or open a project from the startup screen.
3. Import source and target files.
4. Translate, validate, comment, search, and use AI.
5. Collaborate, sync, manage media, and handle updates.
6. Export finished work.
7. Troubleshoot with accurate labels and current product behavior.

## Repositories Pulled

- `codex-documentation`: `origin/main` fast-forwarded before branching.
- `codex-editor`: `main` fast-forwarded to current remote.
- `codex`: `master` already up to date.

## Source Of Truth

### Documentation Site

- Content root: `content/docs/`
- Navigation: `content/docs/meta.json` and per-folder `meta.json`
- Page shell: `app/docs/[[...slug]]/page.tsx`
- Fumadocs source: `lib/source.ts`, `source.config.ts`
- Conventions: `.cursor/rules/docs-conventions.mdc`

### Codex Editor

- Extension version: `codex-editor/package.json` is `0.28.0`
- Startup/project list: `webviews/codex-webviews/src/StartupFlow/`
- Main menu/project settings: `webviews/codex-webviews/src/MainMenu/index.tsx`
- Sync settings: `webviews/codex-webviews/src/MainMenu/SyncSettings.tsx`
- Import wizard and importers: `webviews/codex-webviews/src/NewSourceUploader/`
- Navigation view: `webviews/codex-webviews/src/NavigationView/index.tsx`
- Cell editor: `webviews/codex-webviews/src/CodexCellEditor/`
- Export wizard: `src/projectManager/projectExportView.ts`
- Export formats: `src/exportHandler/exportHandler.ts`
- Audio export: `src/exportHandler/audioExporter.ts`, `src/exportHandler/characterAudioExporter.ts`
- Media strategies: `src/utils/mediaStrategyManager.ts`
- Remote update and project swap: `src/commands/remoteUpdatingCommands.ts`, `src/utils/projectSwapManager.ts`

### Codex Desktop App

- App-layer behavior: `codex/AGENTS.md`
- Extension sideload list and gallery: `codex/product.json`
- CodexConductor pins/profiles: `codex/src/stable/src/vs/workbench/contrib/codexConductor/browser/`
- CodexSideloader: `codex/src/stable/src/vs/workbench/contrib/codexSideloader/browser/`
- CLI pins: `codex/src/stable/cli/src/commands/pin.rs`
- User-facing app docs: `codex/docs/usage.md`, `codex/docs/extensions.md`, `codex/docs/troubleshooting.md`

## Verified Corrections

- The docs site currently puts troubleshooting before onboarding. The new IA should start with overview/getting started.
- Exports are not just plaintext/HTML plus beta formats. CSV, TSV, backtranslations, subtitle formats, USFM, XLIFF, round-trip, and audio export are shipped features in the current export wizard.
- Audio export includes per-cell audio, timestamps, and character-consolidated audio export with preview options.
- Export is not always a fixed three-step flow. Bible audio workflows can add milestone selection.
- The Main Menu button is **Export**, opening the **Export Project** wizard.
- Project creation collects project name, source language, and target language in the startup flow.
- Startup project filters are **All Projects**, **Available Locally**, **Online Only**, **Synced Projects**, and **Non-Synced Projects**.
- Project card actions include **Download**, **Open**, **Open Offline**, **Fix & Open**, **Update**, **Update Project**, **Clean Media**, **ZIP (with git)**, **Mini ZIP**, and **Delete**.
- Media strategies are **Auto Download Media**, **Stream & Save**, and **Stream Only**. Stream-only projects can affect round-trip export because original media may not be present locally.
- The import entry is Navigation -> **Add Source File** or **Import Target File**. The import wizard separates source/target intent from the importer picker.
- The USFM importer label is **USFM** / **USFM Biblical Texts**, not "USFM New".
- PDF import is not active in the current importer registry. Do not document it as a supported import path.
- Main Menu settings use **Interface Settings**, not "Text Display".
- Batch AI should distinguish **Autocomplete Chapter** from per-cell **Autocomplete with AI**.
- Backtranslation is in the Source tab's Backtranslation section with **Generate Backtranslation**, not a separate "Back Translation" tab.
- Password validation is minimum 15 characters and must not include parts of the username/email. Uppercase/lowercase is not verified as a server rule.
- Do not claim users stay logged in for one year. Explain session persistence without fixed duration.
- The desktop app now has built-in CodexSideloader and CodexConductor behavior. The old story that a bundled Extension Sideloader fetches a GitHub manifest is no longer accurate.
- Manual extension updates are unsafe guidance for pinned team projects. Explain app-managed extension profiles and pins first, then mention manual updates only as fallback or unpinned-project behavior.

## Rewrite IA

Top-level order:

1. Overview (`index`)
2. Getting Started
3. Project Management
4. Translation
5. Releases
6. Troubleshooting
7. Antivirus Blockages
8. FAQ

Project Management order:

1. Creating a Project
2. Opening and Closing Projects
3. Project Settings
4. Source and Target Languages
5. Importing Files
6. Media and Storage
7. Backup Your Project
8. Sharing and Managing Projects
9. Managing Project Permissions
10. Sync Troubleshooting
11. Project Swap
12. Update Codex and Extensions
13. Migration Tool
14. Reporting Bugs

Translation order:

1. Translation Tools
2. AI Settings
3. Batch Translation
4. Milestones and Navigation
5. Search and Replace
6. Comments
7. Merging and Editing Source Cells
8. Child Cell Editing
9. Video and Audio Translation
10. Exporting Projects
11. Seed Bible Upload

## Batch Loop

### Batch 1: IA, overview, and startup

- Update top-level and folder meta files.
- Rewrite `index.mdx` around the product/user journey and current Codex app architecture.
- Rewrite `getting-started/initial-setup.mdx` to correct account/password/session claims and explain first-launch extension loading.
- Rewrite `project-management/creating-project.mdx` and `opening-and-closing-projects.mdx` around startup flow labels, project filters, offline states, and project-card actions.

Gate:

- `pnpm postinstall`
- `pnpm build`

### Batch 2: Import, project settings, media, collaboration, updates

- Rewrite `project-management/importing-files.mdx` for current Navigation/import wizard labels and active importer list.
- Rewrite `project-management/project-settings.mdx` for Main Menu, Interface Settings, validation counts, AI Metrics, Copilot, Import Labels, Migration, and Close Project.
- Add `project-management/media-and-storage.mdx`.
- Refresh sharing/permissions language enough to remove duplicated or stale labels.
- Rewrite `project-management/update-extensions.mdx` around app updates, CodexConductor pins/profiles, manual-update caveats, and version verification.

Gate:

- `pnpm postinstall`
- `pnpm build`

### Batch 3: Translation and export

- Rewrite `translation/translation-tools.mdx` around cells/segments, AI autocomplete, Source tab, validation, locks, paste-as-plain-text, edit history, footnotes, and audio tools.
- Refresh `translation/ai-settings.mdx` and `batch-translation.mdx`.
- Add `translation/milestones-and-navigation.mdx`.
- Rewrite `translation/exporting-project.mdx` for shipped export formats, audio/data export, subtitle variants, milestone selection, and stream-only caveats.
- Refresh `translation/video-audio-translation.mdx` export paths and recording details.

Gate:

- `pnpm postinstall`
- `pnpm build`

### Batch 4: FAQ, releases, repo hygiene

- Slim `faq.mdx` into short answers that link to canonical pages.
- Update `releases/latest.mdx` enough to stop claiming v0.27.0 is current; call out v0.28.0 user-facing changes found in code/release audit.
- Replace boilerplate `README.md` with contributor instructions for this docs site.
- Add conventions about canonical pages vs FAQ duplication.

Gate:

- `pnpm postinstall`
- `pnpm build`
- `git diff --check`

## Editing Constraints

- Keep pages focused and user-facing; avoid implementation detail unless it helps explain visible behavior.
- Use current UI labels exactly.
- Prefer "cell" or "segment" for general workflows; use "verse" only where scripture-specific behavior is being discussed.
- Keep FAQ answers short and link to canonical pages instead of duplicating procedures.
- Do not document inactive importers as supported.
- Do not add screenshots unless existing assets already support the claim.
- Keep all new content ASCII.
