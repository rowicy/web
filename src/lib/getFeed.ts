import { type RSSOptions } from '@astrojs/rss';
import { getCollection } from 'astro:content';
import siteInfo from '@/data/siteInfo';

function extractImageUrl(body: string) {
  if (!body) return null;
  const relativeImages = [];
  const absoluteImages = [];
  const imgTagRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/g;
  const mdImageRegex = /!\[[^\]]*\]\(([^)]+)\)/g;

  const imgMatches = [...body.matchAll(imgTagRegex)];
  const mdMatches = [...body.matchAll(mdImageRegex)];
  const allUrls = [
    ...imgMatches.map(match => match[1]),
    ...mdMatches.map(match => match[1]),
  ];

  if (allUrls.length === 0) return null;

  for (const url of allUrls) {
    const isRelative = url.startsWith('/');
    let fullUrl = url;
    const ext = fullUrl.split('?')[0].split('.').pop()?.toLowerCase();
    let type;

    switch (ext) {
      case 'jpg':
      case 'jpeg':
        type = 'image/jpeg';
        break;
      case 'png':
        type = 'image/png';
        break;
      case 'gif':
        type = 'image/gif';
        break;
      case 'webp':
        type = 'image/webp';
        break;
      case 'svg':
        type = 'image/svg+xml';
        break;
      default:
        continue;
    }

    const imageObj = {
      url: fullUrl,
      type: type,
      length: 0,
    };

    if (isRelative) {
      relativeImages.push(imageObj);
    } else {
      absoluteImages.push(imageObj);
    }
  }

  const images = [...relativeImages, ...absoluteImages];
  return images.length > 0 ? images : null;
}

async function getFeed(
  siteUrl: string,
  maxItems?: number,
  filter?: { tag?: string; author?: string }
) {
  let blogs = await getCollection('blog');
  if (filter) {
    if (filter.author) {
      blogs = blogs.filter(blog => blog.data.author === filter.author);
    }
    if (filter.tag) {
      blogs = blogs.filter(blog => blog.data.tags?.includes(filter.tag!));
    }
  }
  blogs = blogs
    .sort(
      (a, b) =>
        new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime()
    )
    .slice(0, maxItems || 50);
  let title = siteInfo.appName;
  if (filter?.author) {
    title += ` - Author: ${filter.author}`;
  }
  if (filter?.tag) {
    title += ` - Tag: ${filter.tag}`;
  }
  const rssOptions: RSSOptions = {
    title: title,
    description: siteInfo.description,
    site: siteUrl,
    items: blogs.map(blog => ({
      title: blog.data.title,
      pubDate: new Date(blog.data.pubDate),
      description: blog.data.description,
      link: blog.data.externalUrl
        ? blog.data.externalUrl
        : `/blog/${blog.slug}/`,
      categories: blog.data.tags,
      enclosure: extractImageUrl(blog.body)?.[0] || {
        url: `/og/${blog.slug}.png`,
        type: 'image/png',
        length: 0,
      },
    })),
    customData: `<language>ja-jp</language>`,
  };
  return rssOptions;
}

export { getFeed };
