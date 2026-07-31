// Builds the docs corpus used by the Ask AI assistant into a JSON module at
// build time, so the chat API route has no runtime filesystem dependency
// (required for hosts like Cloudflare Workers). Runs from postinstall and
// the build script; output is gitignored.
import fs from 'node:fs';
import path from 'node:path';

const DOCS_DIR = path.join(process.cwd(), 'content', 'docs');
const OUT_FILE = path.join(process.cwd(), 'lib', 'docs-corpus.generated.json');

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { title: '', description: '', body: raw };
  const frontmatter = match[1];
  const get = (key) => {
    const line = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
    return line ? line[1].trim().replace(/^['"]|['"]$/g, '') : '';
  };
  return {
    title: get('title'),
    description: get('description'),
    body: raw.slice(match[0].length),
  };
}

function collectPages(dir, segments = []) {
  const pages = [];
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

const pages = collectPages(DOCS_DIR);
pages.sort((a, b) => a.url.localeCompare(b.url));
const text = pages
  .map(
    (page) =>
      `<page url="${page.url}" title="${page.title}"${
        page.description ? ` description="${page.description}"` : ''
      }>\n${page.body.trim()}\n</page>`,
  )
  .join('\n\n');

fs.writeFileSync(OUT_FILE, JSON.stringify({ text }));
console.log(`docs corpus: ${pages.length} pages, ${text.length} chars -> ${path.relative(process.cwd(), OUT_FILE)}`);
