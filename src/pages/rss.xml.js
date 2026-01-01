import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import siteInfo from '@/data/siteInfo';

function extractImageUrl(body, contextSite) {
  if (!body) return null;
  const relativeImages = [];
  const absoluteImages = [];
  const imgTagRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/g;
  const mdImageRegex = /!\[[^\]]*\]\(([^)]+)\)/g;
  
  const imgMatches = [...body.matchAll(imgTagRegex)];
  const mdMatches = [...body.matchAll(mdImageRegex)];
  const allUrls = [
    ...imgMatches.map(match => match[1]),
    ...mdMatches.map(match => match[1])
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
      length: 0
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
      categories: blog.data.tags,
      enclosure: extractImageUrl(blog.body, context.site)?.[0] || {
        url: new URL(`/og/${blog.slug}.png`, context.site).toString(),
        type: 'image/png',
        length: 0,
      },
    })),
    customData: `<language>ja-jp</language>`,
  });
}
