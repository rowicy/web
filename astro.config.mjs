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
import expressiveCode from 'astro-expressive-code';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.rowicy.com',
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
