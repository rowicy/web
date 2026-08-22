import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const blogCollection = defineCollection({
  loader: glob({
    base: './src/content/blog',
    // NOTE: アンスコファイルは除外する
    pattern: '**/!(_)*.{md,mdx}',
  }),
  schema: z.object({
    title: z.string(),
    pubDate: z.string(),
    description: z.string(),
    author: z.string(),
    tags: z.array(z.string()),
    externalUrl: z.url().optional(),
  }),
});

export const collections = {
  blog: blogCollection,
};
