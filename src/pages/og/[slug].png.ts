import { getOgImage } from '@/components/OgImage';
import type { APIContext } from 'astro';
import { getCollection, getEntry } from 'astro:content';

export async function getStaticPaths() {
  const blogs = await getCollection('blog');

  return blogs.map(blog => ({
    params: {
      slug: blog.slug,
    },
  }));
}

export async function GET({ params }: APIContext) {
  if (!params.slug) return;
  const blog = await getEntry('blog', params.slug);
  const body = await getOgImage({
    title: blog?.data.title,
    author: blog?.data.author,
  });

  return new Response(new Uint8Array(body));
}
