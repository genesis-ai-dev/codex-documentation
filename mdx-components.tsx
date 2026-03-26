import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Cards, Card } from 'fumadocs-ui/components/card';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { LoomVideo } from '@/components/loom-video';
import { TroubleshootingFlow } from '@/components/troubleshooting-flow';
import { CodexArchitectureChart } from '@/components/codex-architecture-chart';
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
    Tab,
    Tabs,
    Step,
    Steps,
    LoomVideo,
    TroubleshootingFlow,
    CodexArchitectureChart,
    ContributingNotice,
    ...components,
  };
}
