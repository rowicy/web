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
import { remarkCallout } from './src/plugins/remark/remark-callout.mjs';
import expressiveCode from 'astro-expressive-code';
import { unified } from '@astrojs/markdown-remark';

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
    expressiveCode({
      themes: ['vesper'],
      frames: {
        showCopyToClipboardButton: false,
      },
      customizeTheme: theme => {
        theme.bg = '#14151a';
        theme.colors['editor.background'] = '#14151a';
        theme.settings
          .filter(s =>
            (Array.isArray(s.scope) ? s.scope : [s.scope]).some(scope =>
              scope?.includes('comment')
            )
          )
          .forEach(s => {
            s.settings.foreground = '#6b7089';
          });
      },
      styleOverrides: {
        borderWidth: '0px',
        codeBackground: '#0C1222',
        frames: {
          editorBackground: '#262B30',
          terminalBackground: '#262B30',
        },
      },
    }),
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
    processor: unified({
      rehypePlugins: [
        rehypeSlug,
        [rehypeToc, { headings: ['h2', 'h3', 'h4'] }],
      ],
      remarkPlugins: [
        remarkMermaidInjector,
        remarkBreaks,
        remarkCallout,
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
    }),
  },
});
