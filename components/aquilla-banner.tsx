import { Banner } from 'fumadocs-ui/components/banner';

// Site-wide announcement that Codex is becoming Aquilla. The wording follows
// the codexeditor.app banner and its /codex-is-aquilla page. The `id` makes it
// dismissible; Fumadocs remembers the dismissal in localStorage, so change the
// id to show a new announcement to readers who closed this one.
export function AquillaBanner() {
  return (
    <Banner
      id="aquilla-announcement"
      className="gap-x-3 bg-[oklch(0.22_0.06_250)] pe-10 text-white [&>button]:text-white/70 [&>button:hover]:text-white"
    >
      <span className="sm:hidden">Codex is becoming Aquilla.</span>
      <span className="hidden sm:inline">
        Codex is becoming Aquilla. Your projects, users, and translation data come with you.
      </span>
      <a
        href="https://codexeditor.app/codex-is-aquilla"
        className="underline underline-offset-4 hover:text-white/80"
      >
        Learn more
      </a>
      <a
        href="https://aquilla.app"
        className="hidden underline underline-offset-4 hover:text-white/80 sm:inline"
      >
        Open aquilla.app
      </a>
    </Banner>
  );
}
