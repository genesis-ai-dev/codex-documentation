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
          <a 
            href="https://github.com/genesis-ai-dev/codex-documentation/issues/new/choose"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-sm text-fd-muted-foreground hover:text-fd-foreground bg-fd-primary/5 hover:bg-fd-primary/10 border border-fd-primary/10 rounded-lg transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
            </svg>
            Report an Issue
          </a>
        )
      }}
    >
      {children}
    </DocsLayout>
  );
}
