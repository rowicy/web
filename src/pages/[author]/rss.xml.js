import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import siteInfo from '@/data/siteInfo';
import member from '@/data/member';

export async function getStaticPaths() {
  const authors = member.map(m => m.name);

  return authors.map(author => ({
    params: { author },
  }));
}

export async function GET(context) {
  const { author } = context.params;
  const blogs = await getCollection('blog');

  const filteredBlogs = blogs.filter(blog => blog.data.author === author);

  return rss({
    title: `${siteInfo.appName}`,
    description: `${author}の記事一覧`,
    site: context.site,
    items: filteredBlogs.map(blog => ({
      title: blog.data.title,
      pubDate: blog.data.pubDate,
      description: blog.data.description,
      customData: blog.data.customData,
      link: `/blog/${blog.slug}/`,
    })),
    customData: `<language>ja-jp</language>`,
  });
}
