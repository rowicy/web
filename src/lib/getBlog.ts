import { getCollection } from 'astro:content';

const getBlog = async () => {
  const blogs = await getCollection('blog');
  const sortedBlogs = blogs.sort((a, b) => {
    const dateA = new Date(a.data.pubDate).getTime();
    const dateB = new Date(b.data.pubDate).getTime();
    return dateB - dateA;
  });

  return sortedBlogs;
};

export default getBlog;
