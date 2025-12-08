import { getCollection } from 'astro:content';

const getTags = async () => {
  const blogs = await getCollection('blog');
  const allTags = blogs.flatMap(blog => blog.data.tags);
  const uniqueTags = [...new Set(allTags)].sort();

  return uniqueTags;
};

export default getTags;
