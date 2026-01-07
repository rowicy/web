import rss from '@astrojs/rss';
import { getFeed } from '@/lib/getFeed';
import member from '@/data/member';

export async function getStaticPaths() {
  const authors = member.map(m => m.name);

  return authors.map(author => ({
    params: { author },
  }));
}

export async function GET(context) {
  const { author } = context.params;
  const feedOption = await getFeed(context.site, 50, { author });

  return rss(feedOption);
}
