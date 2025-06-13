import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { baseOptions } from '@/app/layout.config';
import { source } from '@/lib/source';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout 
      tree={source.pageTree} 
      {...baseOptions}
      sidebar={{
        banner: (
          <div className="flex items-center gap-2 p-2 text-sm bg-muted/50 rounded-lg">
            <a 
              href="https://github.com/genesis-ai-dev/codex-documentation/issues/new/choose"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-centermt-8 p-1 bg-fd-primary/10 hover:bg-fd-primary/15 transition-all duration-200 shadow-md hover:shadow-lg rounded-md"
            >
              <span className="mr-2">📢</span>
              
              Report An Issue
            </a>
          </div>
        )
      }}
    >
      {children}
    </DocsLayout>
  );
}
