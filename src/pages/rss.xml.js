import rss from '@astrojs/rss';
import { getFeed } from '@/lib/getFeed';

export async function GET(context) {
  const feedOption = await getFeed(context.site);
  return rss(feedOption);
}
