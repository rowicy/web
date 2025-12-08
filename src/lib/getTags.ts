import { getCollection } from 'astro:content';

const getTags = async () => {
  const blogs = await getCollection('blog');
  // NOTE: 特殊文字を含むタグがある場合に備えてエンコード
  const allTags = blogs.flatMap(blog =>
    blog.data.tags.map(tag => encodeURIComponent(tag))
  );
  const uniqueTags = [...new Set(allTags)].sort();

  return uniqueTags;
};

export default getTags;
