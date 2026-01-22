import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';
import rehypeToc from 'rehype-toc';
import rehypeSlug from 'rehype-slug';
import remarkLinkCard from 'remark-link-card-plus';
import remarkBreaks from 'remark-breaks';
import { remarkMermaidInjector } from './src/plugins/remark/remark-mermaid-injector.mjs';
import node from '@astrojs/node';
import { SITE_URL } from './src/data/site';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  site: SITE_URL,
  prefetch: {
    prefetchAll: true,
  },
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
  ],
  markdown: {
    excludeLangs: ['mermaid'],
    rehypePlugins: [rehypeSlug, [rehypeToc, { headings: ['h2', 'h3', 'h4'] }]],
    remarkPlugins: [
      remarkMermaidInjector,
      remarkBreaks,
      [
        remarkLinkCard,
        { cache: false, shortenUrl: true, thumbnailPosition: 'left' },
      ],
    ],
  },
});
