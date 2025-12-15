import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';
import rehypeToc from 'rehype-toc';
import rehypeSlug from 'rehype-slug';
import remarkLinkCard from 'remark-link-card-plus';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.rowicy.com',
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
    rehypePlugins: [rehypeSlug, [rehypeToc, { headings: ['h2', 'h3', 'h4'] }]],
    remarkPlugins: [[remarkLinkCard, {
      cache: false,
      shortenUrl: true,
      thumbnailPosition: "left",
    }]],
  },
});
