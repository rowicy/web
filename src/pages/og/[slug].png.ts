import { getOgImage } from '@/components/OgImage';
import type { APIContext } from 'astro';
import { getCollection, getEntryBySlug } from 'astro:content';

export async function getStaticPaths() {
  const blogs = await getCollection('blog');

  return blogs.map(blog => ({
    params: {
      slug: blog.slug,
    },
  }));
}

export async function GET({ params }: APIContext) {
  if (params.slug === undefined) return;
  const blog = await getEntryBySlug('blog', params.slug);
  const body = await getOgImage({
    title: blog?.data.title,
    author: blog?.data.author,
  });

  return new Response(body);
}
