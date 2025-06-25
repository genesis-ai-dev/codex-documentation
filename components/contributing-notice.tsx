import { Card } from 'fumadocs-ui/components/card';

export function ContributingNotice() {
  return (
    <div className="mt-8 border-2 border-dashed border-fd-primary/30 hover:border-fd-primary/50 bg-fd-primary/5 hover:bg-fd-primary/10 transition-all duration-200 shadow-sm hover:shadow-md rounded-lg">
      <Card
        title="Help improve Codex Documentation!👋"
        description={
          <>
            Found a bug in our documentation, have a suggestion, or want to request new content? <br />
            <span className="underline">Click this card to let us know on GitHub.</span>
          </>
        }
        external
        href="https://github.com/genesis-ai-dev/codex-documentation/issues/new/choose"
      />
    </div>
  );
} 