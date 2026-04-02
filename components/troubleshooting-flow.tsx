"use client";

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type SupportLink = {
  title: string;
  href: string;
};

type TroubleshootingPath = {
  id: string;
  title: string;
  summary: string;
  symptoms: string[];
  checks: string[];
  docs: SupportLink[];
};

type EvidenceFields = {
  projectName: string;
  username: string;
  appVersion: string;
  extensionVersion: string;
  operatingSystem: string;
  task: string;
  reproductionSteps: string;
  expectedResult: string;
  actualResult: string;
  errorText: string;
  screenshotNotes: string;
};

type EvidenceFieldKey = keyof EvidenceFields;

const COPY_RESET_MS = 2500;

const STEP_LABELS = [
  'Choose issue',
  'Confirm symptoms',
  'Try fixes',
  'Review docs',
  'Capture details',
  'Escalate',
];

const troubleshootingPaths: TroubleshootingPath[] = [
  {
    id: 'install-startup',
    title: 'Codex will not install or start',
    summary: 'The app will not launch, is blocked by security settings, or fails right after opening.',
    symptoms: [
      'The app does not open.',
      'The installer is blocked.',
      'Nothing happens after launching.',
      'Linux or macOS says the file cannot run.',
    ],
    checks: [
      'Update Codex and the extension to the latest version.',
      'Restart the application or reload the editor window.',
      'Verify you downloaded the correct installer for your OS and architecture.',
      'Re-download the installer if the file may be incomplete.',
      'Check security prompts, antivirus, or system permission settings.',
      'On Linux, verify the executable has the correct permissions.',
    ],
    docs: [
      { title: 'Download Codex', href: '/docs/getting-started/download-codex' },
      { title: 'Initial Setup', href: '/docs/getting-started/initial-setup' },
    ],
  },
  {
    id: 'login-setup',
    title: 'I cannot log in or finish setup',
    summary: 'Account creation, sign-in, or permissions during setup are failing.',
    symptoms: [
      'Account creation fails.',
      'You cannot log in.',
      'Your email is already registered.',
      'Setup gets blocked by permissions or network issues.',
    ],
    checks: [
      'Update Codex and the extension to the latest version.',
      'Restart the application or reload the editor window.',
      'Confirm your password meets the requirements.',
      'Use password reset if you already created an account.',
      'Make sure the app has the permissions it requests.',
      'Check your network if the issue involves sign-in or AI access.',
      'Check the Codex Status page (status.codexeditor.com) to see if the servers are currently down.',
    ],
    docs: [
      { title: 'Initial Setup', href: '/docs/getting-started/initial-setup' },
      { title: 'FAQ', href: '/docs/faq' },
      { title: 'Codex Status', href: 'https://status.codexeditor.com' },
    ],
  },
  {
    id: 'project-open-init',
    title: 'My project will not open or initialize',
    summary: 'Projects get stuck loading, fail to initialize, or behave strangely after opening.',
    symptoms: [
      'A project will not open.',
      'Initialization fails.',
      'The project looks stuck loading.',
      'Codex reports an error while opening or switching projects.',
    ],
    checks: [
      'Update Codex and the extension to the latest version.',
      'Restart the application and reopen the project.',
      'Check internet connectivity and available storage.',
      'Compare your symptoms against the latest release notes in case the issue is already fixed.',
    ],
    docs: [
      { title: 'Creating a Project', href: '/docs/project-management/creating-project' },
      { title: 'How to Update Codex', href: '/docs/project-management/update-extensions' },
      { title: 'Release Notes', href: '/docs/releases/latest' },
    ],
  },
  {
    id: 'import-alignment',
    title: 'Import failed or aligned badly',
    summary: 'Files are rejected, content imports incorrectly, or translated content does not line up.',
    symptoms: [
      'The file is not recognized.',
      'Import fails with an error.',
      'Images or formatting are missing.',
      'Imported translations align poorly with the source.',
    ],
    checks: [
      'Update Codex and the extension to the latest version.',
      'Restart the application or reload the editor window.',
      'Verify the file format is supported.',
      'Open the file in its original application to confirm it is not corrupted.',
      'Use the round-trip importer if you need to preserve format for export.',
      'Recheck that you selected the correct source file and alignment method.',
    ],
    docs: [
      { title: 'Importing Files', href: '/docs/project-management/importing-files' },
      { title: 'Video & Audio Translation', href: '/docs/translation/video-audio-translation' },
    ],
  },
  {
    id: 'sync-offline',
    title: 'Sync or offline behavior is strange',
    summary: 'Updates are not appearing, projects seem out of date, or network state looks wrong.',
    symptoms: [
      "Other users' changes do not appear.",
      'The project seems outdated.',
      'Codex reports server or connection problems.',
      'Media or project state behaves differently online versus offline.',
    ],
    checks: [
      'Update Codex and the extension to the latest version.',
      'Confirm your internet connection is stable.',
      'Reload the project or editor window.',
      'Check for updates and recent fixes related to sync or offline behavior.',
      'Ask teammates whether they have synced recently if this is a shared project.',
      'Check the Codex Status page (status.codexeditor.com) to see if the servers are currently down.',
    ],
    docs: [
      { title: 'Sync Troubleshooting', href: '/docs/project-management/sync-troubleshooting' },
      { title: 'Sharing & Managing Projects', href: '/docs/project-management/sharing-managing-projects' },
      { title: 'How to Update Codex', href: '/docs/project-management/update-extensions' },
      { title: 'Release Notes', href: '/docs/releases/latest' },
      { title: 'Codex Status', href: 'https://status.codexeditor.com' },
    ],
  },
  {
    id: 'ai-translation',
    title: 'AI suggestions are poor or failing',
    summary: 'Generation fails, quality drops, or the AI is not behaving as expected.',
    symptoms: [
      'AI generation fails or times out.',
      'Suggestions are poor quality.',
      'Back translation is not helpful.',
      'Batch translation is not doing what you expect.',
    ],
    checks: [
      'Update Codex and the extension to the latest version.',
      'Restart the application or reload the editor window.',
      'Confirm the correct source and target languages are set.',
      'Review your AI instructions and simplify them if needed.',
      'Edit AI outputs to guide future suggestions.',
      'Check whether the issue may be related to connectivity or a recent release.',
      'Check the Codex Status page (status.codexeditor.com) to see if the AI services are currently down.',
    ],
    docs: [
      { title: 'AI Settings', href: '/docs/translation/ai-settings' },
      { title: 'Translation Tools', href: '/docs/translation/translation-tools' },
      { title: 'Batch Translation', href: '/docs/translation/batch-translation' },
      { title: 'Codex Status', href: 'https://status.codexeditor.com' },
    ],
  },
  {
    id: 'audio-video',
    title: 'Audio or video workflow is broken',
    summary: 'Subtitles, playback, transcription, or recordings are not working correctly.',
    symptoms: [
      'Audio controls do not appear.',
      'Waveform appears but audio does not play.',
      'Subtitle timing is wrong.',
      'Transcription does not start.',
      'Recordings or media attachments behave unexpectedly.',
    ],
    checks: [
      'Update Codex and the extension to the latest version.',
      'Reload the editor window.',
      'Verify the audio or subtitle file is valid and not corrupted.',
      'Try a simpler or smaller test file.',
      'Check any network dependency used for transcription.',
    ],
    docs: [
      { title: 'Video & Audio Translation', href: '/docs/translation/video-audio-translation' },
      { title: 'Release Notes', href: '/docs/releases/latest' },
    ],
  },
  {
    id: 'export-update',
    title: 'Export or update did not work',
    summary: 'Exports fail, files are incomplete, or updating does not resolve the issue.',
    symptoms: [
      'Export fails or produces incomplete output.',
      'Export format is wrong.',
      'Updating does not seem to fix the issue.',
      'A recent change may have affected your workflow.',
    ],
    checks: [
      'Update both the Codex app and the extension.',
      'Restart the application or reload the editor window.',
      'Re-run the export with the correct output type.',
      'Verify whether you need a round-trip workflow.',
      'Review the latest release notes to see whether the bug is already fixed.',
    ],
    docs: [
      { title: 'Exporting Projects', href: '/docs/translation/exporting-project' },
      { title: 'How to Update Codex', href: '/docs/project-management/update-extensions' },
      { title: 'Release Notes', href: '/docs/releases/latest' },
    ],
  },
];

const VERSION_HELP_HREF = '/docs/project-management/update-extensions#verifying-your-versions';

const requiredFields: { key: EvidenceFieldKey; label: string; placeholder: string; multiline: boolean; helpHref?: string; helpLabel?: string }[] = [
  { key: 'projectName', label: 'Project name', placeholder: 'e.g. My Translation Project', multiline: false },
  { key: 'username', label: 'Username', placeholder: 'Your Codex account username', multiline: false },
  { key: 'appVersion', label: 'Codex app version', placeholder: 'e.g. 1.108.11148', multiline: false, helpHref: `${VERSION_HELP_HREF}`, helpLabel: 'How to find this (Help → About)' },
  { key: 'extensionVersion', label: 'Extension version', placeholder: 'e.g. 1.8.0', multiline: false, helpHref: `${VERSION_HELP_HREF}`, helpLabel: 'How to find this (Extensions panel)' },
  { key: 'operatingSystem', label: 'Operating system', placeholder: 'e.g. macOS 15, Ubuntu 24.04, Windows 11', multiline: false },
  { key: 'task', label: 'What were you trying to do?', placeholder: 'Describe the workflow or action', multiline: false },
  { key: 'reproductionSteps', label: 'Exact steps to reproduce', placeholder: 'List the steps someone else could follow', multiline: true },
  { key: 'expectedResult', label: 'Expected result', placeholder: 'What should have happened?', multiline: true },
  { key: 'actualResult', label: 'Actual result', placeholder: 'What happened instead?', multiline: true },
];

const optionalFields: { key: EvidenceFieldKey; label: string; placeholder: string }[] = [
  { key: 'errorText', label: 'Error text (if any)', placeholder: 'Paste the exact error message or console output' },
  { key: 'screenshotNotes', label: 'Screenshot or recording notes', placeholder: 'Mention any attachments you plan to include' },
];

const emptyEvidence: EvidenceFields = {
  projectName: '',
  username: '',
  appVersion: '',
  extensionVersion: '',
  operatingSystem: '',
  task: '',
  reproductionSteps: '',
  expectedResult: '',
  actualResult: '',
  errorText: '',
  screenshotNotes: '',
};

function templateValue(value: string): string {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : '(not provided)';
}

function ProgressStepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8 flex items-center gap-1 overflow-x-auto">
      {STEP_LABELS.map((label, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <div key={label} className="flex items-center gap-1">
            {index > 0 && (
              <div
                className={`hidden h-px w-4 sm:block ${isCompleted ? 'bg-fd-primary' : 'bg-fd-border'}`}
              />
            )}
            <div
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-fd-primary text-fd-primary-foreground'
                  : isCompleted
                    ? 'bg-fd-primary/15 text-fd-primary'
                    : 'bg-fd-card text-fd-muted-foreground'
              }`}
            >
              <span className="tabular-nums">{index + 1}</span>
              <span className="hidden sm:inline">{label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WizardCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-fd-border bg-fd-card/60 p-6">
      {children}
    </div>
  );
}

function NavButtons({
  onBack,
  onNext,
  nextLabel = 'Continue',
  nextDisabled = false,
  backLabel = 'Back',
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  backLabel?: string;
}) {
  return (
    <div className="mt-6 flex items-center justify-between gap-3">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-fd-border bg-fd-background px-4 py-2 text-sm font-medium text-fd-muted-foreground transition-colors hover:border-fd-primary/40 hover:text-fd-foreground"
        >
          {backLabel}
        </button>
      ) : (
        <div />
      )}
      {onNext ? (
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className={`rounded-xl px-5 py-2 text-sm font-semibold transition-opacity ${
            nextDisabled
              ? 'cursor-not-allowed bg-fd-muted text-fd-muted-foreground'
              : 'bg-fd-primary text-fd-primary-foreground hover:opacity-90'
          }`}
        >
          {nextLabel}
        </button>
      ) : null}
    </div>
  );
}

export function TroubleshootingFlow() {
  const [step, setStep] = useState(0);
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [completedChecks, setCompletedChecks] = useState<Set<number>>(new Set());
  const [evidence, setEvidence] = useState<EvidenceFields>(emptyEvidence);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedPath = useMemo(
    () => (selectedPathId ? troubleshootingPaths.find((p) => p.id === selectedPathId) ?? null : null),
    [selectedPathId],
  );

  const completedCheckLabels = useMemo(() => {
    if (!selectedPath) return [];
    return [...completedChecks].sort().map((i) => selectedPath.checks[i]).filter(Boolean) as string[];
  }, [completedChecks, selectedPath]);

  const filledRequiredCount = useMemo(
    () => requiredFields.filter((f) => evidence[f.key].trim().length > 0).length,
    [evidence],
  );
  const isEvidenceComplete = filledRequiredCount === requiredFields.length;

  const supportTemplate = useMemo(() => {
    const checkedList =
      completedCheckLabels.length > 0 ? completedCheckLabels.map((l) => `- ${l}`).join('\n') : '- (none recorded)';
    const docsList = selectedPath
      ? selectedPath.docs.map((d) => `- ${d.title}: ${d.href}`).join('\n')
      : '- (none)';

    return `Issue category: ${selectedPath?.title ?? '(not selected)'}

Project: ${templateValue(evidence.projectName)}
Username: ${templateValue(evidence.username)}

Environment
- Codex version: ${templateValue(evidence.appVersion)}
- Extension version: ${templateValue(evidence.extensionVersion)}
- Operating system: ${templateValue(evidence.operatingSystem)}

Problem summary
- What I was trying to do: ${templateValue(evidence.task)}
- Expected result: ${templateValue(evidence.expectedResult)}
- Actual result: ${templateValue(evidence.actualResult)}

Reproduction steps
${templateValue(evidence.reproductionSteps)}

Troubleshooting already tried
${checkedList}

Error text
${templateValue(evidence.errorText)}

Screenshots or recordings
${templateValue(evidence.screenshotNotes)}

Relevant docs reviewed
${docsList}`;
  }, [completedCheckLabels, evidence, selectedPath]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const scrollToTop = useCallback(() => {
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const goTo = useCallback(
    (target: number) => {
      setStep(target);
      scrollToTop();
    },
    [scrollToTop],
  );

  const handleSelectPath = (pathId: string) => {
    setSelectedPathId(pathId);
    setCompletedChecks(new Set());
    setCopyState('idle');
    goTo(1);
  };

  const handleSkipToEvidence = () => {
    setSelectedPathId(null);
    setCompletedChecks(new Set());
    goTo(4);
  };

  const handleToggleCheck = (index: number) => {
    setCompletedChecks((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleEvidenceChange = (field: EvidenceFieldKey, value: string) => {
    setEvidence((prev) => ({ ...prev, [field]: value }));
    setCopyState('idle');
  };

  const handleCopy = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
      setCopyState('failed');
      return;
    }
    try {
      await navigator.clipboard.writeText(supportTemplate);
      setCopyState('copied');
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopyState('idle'), COPY_RESET_MS);
    } catch {
      setCopyState('failed');
    }
  };

  return (
    <div ref={containerRef} className="not-prose my-8 scroll-mt-24">
      <ProgressStepper currentStep={step} />

      {step === 0 && (
        <WizardCard>
          <h2 className="text-2xl font-semibold text-fd-foreground">What kind of problem are you seeing?</h2>
          <p className="mt-2 text-sm leading-6 text-fd-muted-foreground">
            Pick the closest match. This narrows the checks and docs you will see next.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {troubleshootingPaths.map((path) => (
              <button
                key={path.id}
                type="button"
                onClick={() => handleSelectPath(path.id)}
                className="rounded-xl border border-fd-border bg-fd-background p-4 text-left transition-colors hover:border-fd-primary/40 hover:bg-fd-primary/5"
              >
                <p className="text-base font-semibold text-fd-foreground">{path.title}</p>
                <p className="mt-2 text-sm leading-6 text-fd-muted-foreground">{path.summary}</p>
              </button>
            ))}
          </div>

          <div className="mt-5 border-t border-fd-border pt-5">
            <button
              type="button"
              onClick={handleSkipToEvidence}
              className="text-sm font-medium text-fd-muted-foreground transition-colors hover:text-fd-foreground"
            >
              My issue is not listed here &mdash; skip to the support form
            </button>
          </div>
        </WizardCard>
      )}

      {step === 1 && selectedPath && (
        <WizardCard>
          <h2 className="text-2xl font-semibold text-fd-foreground">{selectedPath.title}</h2>
          <p className="mt-2 text-sm leading-6 text-fd-muted-foreground">
            Do any of these symptoms match what you are seeing?
          </p>

          <ul className="mt-5 space-y-2">
            {selectedPath.symptoms.map((symptom) => (
              <li
                key={symptom}
                className="rounded-xl border border-fd-border bg-fd-background px-4 py-3 text-sm leading-6 text-fd-foreground"
              >
                {symptom}
              </li>
            ))}
          </ul>

          <NavButtons
            onBack={() => goTo(0)}
            onNext={() => goTo(2)}
            nextLabel="Yes, continue to fixes"
            backLabel="Pick a different issue"
          />

          <div className="mt-3 text-right">
            <button
              type="button"
              onClick={() => goTo(0)}
              className="text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground"
            >
              These don&apos;t match &mdash; go back
            </button>
          </div>
        </WizardCard>
      )}

      {step === 2 && selectedPath && (
        <WizardCard>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-fd-foreground">Try these fixes first</h2>
            <span className="rounded-full bg-fd-primary/10 px-3 py-1 text-sm font-medium text-fd-primary">
              {completedChecks.size}/{selectedPath.checks.length} tried
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-fd-muted-foreground">
            Tap each fix you have already tried. These feed into the support template so the next person
            knows what you ruled out.
          </p>

          <div className="mt-5 space-y-3">
            {selectedPath.checks.map((check, index) => {
              const isDone = completedChecks.has(index);

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleToggleCheck(index)}
                  className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm leading-6 transition-colors ${
                    isDone
                      ? 'border-fd-primary bg-fd-primary/10 text-fd-foreground'
                      : 'border-fd-border bg-fd-background text-fd-muted-foreground hover:border-fd-primary/40 hover:bg-fd-primary/5'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs ${
                      isDone
                        ? 'border-fd-primary bg-fd-primary text-fd-primary-foreground'
                        : 'border-fd-border bg-fd-background'
                    }`}
                  >
                    {isDone ? '✓' : ''}
                  </span>
                  <span>{check}</span>
                </button>
              );
            })}
          </div>

          {completedChecks.size === 0 && (
            <p className="mt-4 rounded-xl border border-fd-warning/40 bg-fd-warning/10 px-4 py-3 text-sm leading-6 text-fd-foreground">
              Mark at least one fix you have tried before continuing. If none apply, go back and pick a
              different issue category.
            </p>
          )}

          <NavButtons
            onBack={() => goTo(1)}
            onNext={() => goTo(3)}
            nextLabel="I've tried these — continue"
            nextDisabled={completedChecks.size === 0}
          />
        </WizardCard>
      )}

      {step === 3 && selectedPath && (
        <WizardCard>
          <h2 className="text-2xl font-semibold text-fd-foreground">Review the related docs</h2>
          <p className="mt-2 text-sm leading-6 text-fd-muted-foreground">
            These pages cover the deeper details for your issue. Skim them before moving to the support form
            &mdash; the answer may already be there.
          </p>

          <div className="mt-5 space-y-3">
            {selectedPath.docs.map((doc) => (
              <a
                key={doc.href}
                href={doc.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-fd-border bg-fd-background px-4 py-3 text-sm font-medium text-fd-foreground transition-colors hover:border-fd-primary/40 hover:bg-fd-primary/5"
              >
                <span>{doc.title}</span>
                <span className="text-fd-muted-foreground">&rarr;</span>
              </a>
            ))}
          </div>

          <NavButtons
            onBack={() => goTo(2)}
            onNext={() => goTo(4)}
            nextLabel="Still stuck — continue to support form"
          />
        </WizardCard>
      )}

      {step === 4 && (
        <WizardCard>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-fd-foreground">Capture the support details</h2>
            <span className="rounded-full bg-fd-primary/10 px-3 py-1 text-sm font-medium text-fd-primary">
              {filledRequiredCount}/{requiredFields.length} required
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-fd-muted-foreground">
            Fill in as much as you can. This generates the support template you will paste into Discord or a
            bug report.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {requiredFields.map((field) => (
              <label
                key={field.key}
                className={`text-sm font-medium text-fd-foreground ${field.multiline ? 'md:col-span-2' : ''}`}
              >
                <span className="flex items-baseline justify-between gap-2">
                  <span>{field.label}</span>
                  {field.helpHref && (
                    <a
                      href={field.helpHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-normal text-fd-primary transition-colors hover:text-fd-accent"
                    >
                      {field.helpLabel ?? 'How to find this'}
                    </a>
                  )}
                </span>
                {field.multiline ? (
                  <textarea
                    value={evidence[field.key]}
                    onChange={(e) => handleEvidenceChange(field.key, e.target.value)}
                    rows={3}
                    placeholder={field.placeholder}
                    className="mt-2 w-full rounded-xl border border-fd-border bg-fd-background px-3 py-2 text-sm font-normal text-fd-foreground"
                  />
                ) : (
                  <input
                    value={evidence[field.key]}
                    onChange={(e) => handleEvidenceChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="mt-2 w-full rounded-xl border border-fd-border bg-fd-background px-3 py-2 text-sm font-normal text-fd-foreground"
                  />
                )}
              </label>
            ))}

            <div className="md:col-span-2 border-t border-fd-border pt-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-fd-muted-foreground">
                Optional
              </p>
            </div>

            {optionalFields.map((field) => (
              <label key={field.key} className="text-sm font-medium text-fd-foreground">
                {field.label}
                <textarea
                  value={evidence[field.key]}
                  onChange={(e) => handleEvidenceChange(field.key, e.target.value)}
                  rows={3}
                  placeholder={field.placeholder}
                  className="mt-2 w-full rounded-xl border border-fd-border bg-fd-background px-3 py-2 text-sm font-normal text-fd-foreground"
                />
              </label>
            ))}
          </div>

          <NavButtons
            onBack={selectedPath ? () => goTo(3) : () => goTo(0)}
            onNext={() => goTo(5)}
            nextLabel="Generate support template"
            nextDisabled={!isEvidenceComplete}
            backLabel={selectedPath ? 'Back' : 'Back to issue picker'}
          />

          {!isEvidenceComplete && (
            <p className="mt-3 text-right text-sm text-fd-muted-foreground">
              Complete all {requiredFields.length} required fields to continue.
            </p>
          )}
        </WizardCard>
      )}

      {step === 5 && (
        <WizardCard>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-fd-foreground">Your support handoff</h2>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-xl bg-fd-primary px-4 py-2 text-sm font-semibold text-fd-primary-foreground transition-opacity hover:opacity-90"
            >
              {copyState === 'copied' ? 'Copied!' : 'Copy template'}
            </button>
          </div>

          <p className="mt-2 text-sm leading-6 text-fd-muted-foreground">
            Paste this into Discord or a GitHub issue. It gives the support team everything they need
            without back-and-forth.
          </p>

          <textarea
            readOnly
            value={supportTemplate}
            rows={20}
            className="mt-4 w-full rounded-xl border border-fd-border bg-fd-background px-3 py-3 font-mono text-xs leading-5 text-fd-foreground"
          />

          {copyState === 'failed' && (
            <p className="mt-3 text-sm text-fd-muted-foreground">
              Clipboard access is unavailable. Select the text above and copy it manually.
            </p>
          )}

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <a
              href="https://status.codexeditor.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-fd-border bg-fd-background px-4 py-4 text-sm text-fd-foreground transition-colors hover:border-fd-primary/40 hover:bg-fd-primary/5"
            >
              <span className="block text-base font-semibold">Check server status</span>
              <span className="mt-2 block text-fd-muted-foreground">
                See if the Codex API services are currently up or experiencing issues.
              </span>
            </a>
            <a
              href="https://discord.gg/6kVJTEXYEp"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-fd-border bg-fd-background px-4 py-4 text-sm text-fd-foreground transition-colors hover:border-fd-primary/40 hover:bg-fd-primary/5"
            >
              <span className="block text-base font-semibold">Discord triage</span>
              <span className="mt-2 block text-fd-muted-foreground">
                Start here for a quick check on whether the issue is known.
              </span>
            </a>
            <Link
              href="/docs/project-management/reporting-bugs"
              className="rounded-xl border border-fd-border bg-fd-background px-4 py-4 text-sm text-fd-foreground transition-colors hover:border-fd-primary/40 hover:bg-fd-primary/5"
            >
              <span className="block text-base font-semibold">File a bug report</span>
              <span className="mt-2 block text-fd-muted-foreground">
                Use the reporting guide to decide whether it belongs on GitHub.
              </span>
            </Link>
          </div>

          <NavButtons
            onBack={() => goTo(4)}
            backLabel="Edit details"
          />

          <div className="mt-4 border-t border-fd-border pt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setStep(0);
                setSelectedPathId(null);
                setCompletedChecks(new Set());
                setEvidence(emptyEvidence);
                setCopyState('idle');
                scrollToTop();
              }}
              className="text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground"
            >
              Start over with a different issue
            </button>
          </div>
        </WizardCard>
      )}
    </div>
  );
}
