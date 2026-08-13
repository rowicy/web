import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
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
// data URIはURL.canParse()を通り、かつdev/build/prodのどの環境・ポートでも
// そのまま表示できるため、ホスト名に依存する絶対URLより確実(svgは537byteと小さい)。
const LINK_CARD_FALLBACK_IMAGE_URL = `data:image/svg+xml;base64,${readFileSync(
  fileURLToPath(
    new URL('./public/images/link-card-fallback.svg', import.meta.url)
  )
).toString('base64')}`;

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
