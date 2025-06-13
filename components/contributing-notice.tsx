import { Card } from 'fumadocs-ui/components/card';

export function ContributingNotice() {
  return (
    <div className="mt-8">
      <Card
        title="Help improve Codex Documentation!👋"
        description={
          <>
            <br />
            Found a bug, have a suggestion, or want to request new content? <br />
            <span className="underline">Click this card to let us know on GitHub.</span>
          </>
        }
        external
        href="https://github.com/genesis-ai-dev/codex-documentation/issues/new/choose"
      />
    </div>
  );
} 