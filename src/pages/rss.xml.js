import rss, { pagesGlobToRssItems } from '@astrojs/rss';
import siteInfo from '@/data/siteInfo';

export async function GET(context) {
  return rss({
    title: siteInfo.appName,
    description: siteInfo.description,
    site: context.site,
    items: await pagesGlobToRssItems(import.meta.glob('./blog/*.md')),
    customData: `<language>ja-jp</language>`,
  });
}
