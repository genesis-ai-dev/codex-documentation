import { docs } from '@/.source';
import { loader } from 'fumadocs-core/source';

// See https://fumadocs.vercel.app/docs/headless/source-api for more info
const sourceData = docs.toFumadocsSource();
export const source = loader({
  // it assigns a URL to your pages
  baseUrl: '/docs',
  source: {
    files: typeof sourceData.files === 'function' ? sourceData.files() : sourceData.files,
  },
});
