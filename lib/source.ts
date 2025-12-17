import { docs } from '@/.source';
import { loader } from 'fumadocs-core/source';

// See https://fumadocs.vercel.app/docs/headless/source-api for more info
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sourceData = docs.toFumadocsSource() as any;
export const source = loader({
  // it assigns a URL to your pages
  baseUrl: '/docs',
  source: {
    files: typeof sourceData.files === 'function' ? sourceData.files() : sourceData.files,
  },
});
