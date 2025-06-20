import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Cards, Card } from 'fumadocs-ui/components/card';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { LoomVideo } from '@/components/loom-video';
import type { MDXComponents } from 'mdx/types';
import { ContributingNotice } from './components/contributing-notice';

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Cards,
    Card,
    Accordion,
    Accordions,
    LoomVideo,
    ContributingNotice,
    ...components,
  };
}
