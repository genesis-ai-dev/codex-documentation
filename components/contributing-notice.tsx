import { Card } from 'fumadocs-ui/components/card';

export function ContributingNotice() {
  return (
    <div className="mt-12 border border-fd-border/50 bg-fd-card rounded-xl overflow-hidden">
      <Card
        title="Help Improve This Documentation"
        description={
          <>
            Found an issue, have a suggestion, or want to request new content?{' '}
            <span className="text-fd-primary font-medium">Let us know on GitHub.</span>
          </>
        }
        external
        href="https://github.com/genesis-ai-dev/codex-documentation/issues/new/choose"
      />
    </div>
  );
} 