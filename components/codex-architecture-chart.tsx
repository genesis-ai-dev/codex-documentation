"use client";

import Link from "next/link";

function LayerConnector() {
  return (
    <div className="flex justify-center py-1">
      <div className="flex flex-col items-center gap-0.5">
        <div className="h-4 w-px bg-fd-primary/40" />
        <svg
          className="h-2.5 w-2.5 text-fd-primary/50"
          viewBox="0 0 10 10"
          fill="currentColor"
        >
          <path d="M5 10 L0 3 L10 3 Z" />
        </svg>
      </div>
    </div>
  );
}

function LayerSection({
  label,
  sublabel,
  accent = false,
  children,
}: {
  label: string;
  sublabel: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border ${
        accent
          ? "border-fd-primary/30 bg-fd-primary/[0.03]"
          : "border-fd-border bg-fd-card/60"
      }`}
    >
      <div className="border-b border-fd-border/60 px-5 py-3 text-center">
        <p className="text-base font-bold tracking-wide uppercase text-fd-foreground">{label}</p>
        <p className="mt-0.5 text-xs text-fd-muted-foreground">{sublabel}</p>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  );
}

function ExtensionCard({
  name,
  desc,
  wide = false,
  muted = false,
}: {
  name: string;
  desc: string;
  wide?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 ${
        wide ? "col-span-2 text-center" : ""
      } ${
        muted
          ? "border-fd-border/50 bg-fd-muted/30"
          : "border-fd-border bg-fd-background"
      }`}
    >
      <p
        className={`text-sm font-medium ${
          muted ? "text-fd-muted-foreground" : "text-fd-foreground"
        }`}
      >
        {name}
      </p>
      <p className="mt-0.5 text-xs text-fd-muted-foreground">{desc}</p>
    </div>
  );
}


export function CodexArchitectureChart() {
  return (
    <div className="not-prose my-8 space-y-3">
      <LayerSection
        label="Foundation"
        sublabel="Desktop application for Windows, macOS, and Linux"
      >
        <Link
          href="/docs/getting-started/download-codex"
          className="block rounded-xl border border-fd-primary/20 bg-fd-primary/5 px-4 py-3 text-center transition-colors hover:bg-fd-primary/10 hover:border-fd-primary/40"
        >
          <p className="text-sm font-semibold text-fd-foreground">
            Codex Application
          </p>
          <p className="mt-0.5 text-xs text-fd-muted-foreground">
            Custom VS Code distribution (via VSCodium) with Open VSX marketplace
          </p>
          <p className="mt-2 inline-flex items-center gap-1 rounded-md bg-fd-primary/10 px-2.5 py-1 text-xs font-medium text-fd-primary">
            Download for your platform →
          </p>
        </Link>
      </LayerSection>

      <LayerConnector />

      <LayerSection
        label="Extension Layer"
        sublabel="Modular components installed from Open VSX"
        accent
      >
        <div className="grid grid-cols-2 gap-3">
          <ExtensionCard
            name="Extension Sideloader"
            desc="Bundled in the binary — activates on first launch, fetches the extensions below, then sits idle"
            wide
            muted
          />
          <ExtensionCard
            name="Codex Translation Editor"
            desc="Custom .codex notebook editor, AI-powered translation tools, language server, and webview panels"
            wide
          />
          <ExtensionCard
            name="Frontier Authentication"
            desc="User accounts, cloud sync via GitLab, team collaboration"
          />
          <ExtensionCard
            name="Shared State Store"
            desc="Cross-extension reactive state for keeping panels in sync"
          />
        </div>
      </LayerSection>
    </div>
  );
}
