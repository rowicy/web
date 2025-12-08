import { useState, useEffect } from 'react';
import BlogCard from '@/components/BlogCard';
import BlogPagination from '@/components/BlogPagination';
import type { CollectionEntry } from 'astro:content';

type Props = {
  blogs: CollectionEntry<'blog'>[];
};

const POSTS_PER_PAGE = 10;

const BlogList = ({ blogs }: Props) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Read page from URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const page = Number(params.get('page')) || 1;
      setCurrentPage(page);
    }
  }, []);

  // Update URL when page changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (currentPage === 1) {
        url.searchParams.delete('page');
      } else {
        url.searchParams.set('page', String(currentPage));
      }
      window.history.pushState({}, '', url);
    }
  }, [currentPage]);

  const totalPages = Math.ceil(blogs.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentBlogs = blogs.slice(startIndex, endIndex);

  return (
    <>
      <div className="flex flex-col gap-3">
        {currentBlogs.map(blog => (
          <BlogCard key={blog.slug} blog={blog} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8">
          <BlogPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </>
  );
};

export default BlogList;
