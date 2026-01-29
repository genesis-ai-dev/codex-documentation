import { docs } from '@/.source/server';
import { loader } from 'fumadocs-core/source';

// See https://fumadocs.vercel.app/docs/headless/source-api for more info
export const source = loader(docs.toFumadocsSource(), {
  // it assigns a URL to your pages
  baseUrl: '/docs',
});
