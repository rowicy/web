import rss, { pagesGlobToRssItems } from '@astrojs/rss';
import siteInfo from '@/data/siteInfo';

export async function GET(context) {
  return rss({
    title: `Blog | ${siteInfo.appName}`,
    description: `${siteInfo.appName} Memberが執筆したBlog記事です。`,
    site: context.site,
    items: await pagesGlobToRssItems(import.meta.glob('./blog/*.md')),
    customData: `<language>ja-jp</language>`,
  });
}
