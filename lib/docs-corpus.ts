import fs from 'node:fs';
import path from 'node:path';

const DOCS_DIR = path.join(process.cwd(), 'content', 'docs');

interface DocPage {
  url: string;
  title: string;
  description: string;
  body: string;
}

function parseFrontmatter(raw: string): {
  title: string;
  description: string;
  body: string;
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { title: '', description: '', body: raw };
  const frontmatter = match[1];
  const get = (key: string) => {
    const line = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
    return line ? line[1].trim().replace(/^['"]|['"]$/g, '') : '';
  };
  return {
    title: get('title'),
    description: get('description'),
    body: raw.slice(match[0].length),
  };
}

function collectPages(dir: string, segments: string[] = []): DocPage[] {
  const pages: DocPage[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      pages.push(...collectPages(path.join(dir, entry.name), [...segments, entry.name]));
    } else if (entry.name.endsWith('.mdx')) {
      const raw = fs.readFileSync(path.join(dir, entry.name), 'utf8');
      const { title, description, body } = parseFrontmatter(raw);
      const slug = entry.name.replace(/\.mdx$/, '');
      const urlSegments = slug === 'index' ? segments : [...segments, slug];
      pages.push({
        url: `/docs${urlSegments.length > 0 ? `/${urlSegments.join('/')}` : ''}`,
        title: title || slug,
        description,
        body,
      });
    }
  }
  return pages;
}

let cachedCorpus: string | null = null;

/**
 * The full documentation corpus as a single string, with each page prefixed
 * by its title and site URL so the model can cite pages by link. Built once
 * per server instance; the whole corpus is ~30k tokens, small enough to fit
 * in a single cached prompt.
 */
export function getDocsCorpus(): string {
  if (cachedCorpus !== null) return cachedCorpus;
  const pages = collectPages(DOCS_DIR);
  pages.sort((a, b) => a.url.localeCompare(b.url));
  cachedCorpus = pages
    .map(
      (page) =>
        `<page url="${page.url}" title="${page.title}"${
          page.description ? ` description="${page.description}"` : ''
        }>\n${page.body.trim()}\n</page>`,
    )
    .join('\n\n');
  return cachedCorpus;
}
