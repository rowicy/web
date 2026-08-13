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

const SITE_URL = 'https://www.rowicy.com';
const LINK_CARD_FALLBACK_IMAGE_URL = new URL(
  '/images/link-card-fallback.svg',
  SITE_URL
).toString();

// https://astro.build/config
export default defineConfig({
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
        {
          cache: false,
          shortenUrl: true,
          thumbnailPosition: 'left',
          ogTransformer: og => {
            if (og.imageUrl && URL.canParse(og.imageUrl)) return og;
            return { ...og, imageUrl: LINK_CARD_FALLBACK_IMAGE_URL };
          },
        },
      ],
    ],
  },
});
