import { getCollection } from 'astro:content';

const getBlog = async () => {
  const blogs = await getCollection('blog');
  const sortesBlogs = blogs.sort((a, b) => {
    const dateA = new Date(a.data.pubDate).getTime();
    const dateB = new Date(b.data.pubDate).getTime();
    return dateB - dateA;
  });

  return sortesBlogs;
};

export default getBlog;
