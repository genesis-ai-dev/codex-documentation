import './global.css';
import { RootProvider } from 'fumadocs-ui/provider';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Codex Editor Documentation',
    template: '%s | Codex Editor',
  },
  description: 'Official documentation for Codex Editor - The modern text editor for writers and developers.',
  icons: {
    icon: '/icon.svg',
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <head>
        <script defer src="https://cloud.umami.is/script.js" data-website-id="16ce21bc-d12b-4ff0-93d0-bf6e1388cd56"></script>
      </head>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
