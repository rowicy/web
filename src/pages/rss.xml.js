import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import siteInfo from '@/data/siteInfo';

export async function GET(context) {
  const blogs = await getCollection('blog');
  return rss({
    title: siteInfo.appName,
    description: siteInfo.description,
    site: context.site,
    items: blogs.map(blog => ({
      title: blog.data.title,
      pubDate: blog.data.pubDate,
      description: blog.data.description,
      customData: blog.data.customData,
      link: `/blog/${blog.slug}/`,
    })),
    customData: `<language>ja-jp</language>`,
  });
}
