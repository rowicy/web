import { useState, useEffect, useMemo, useCallback } from 'react';
import BlogCard from '@/components/BlogCard';
import BlogPagination from '@/components/BlogPagination';
import type { CollectionEntry } from 'astro:content';

type Props = {
  blogs: CollectionEntry<'blog'>[];
};

const POSTS_PER_PAGE = 20;

const BlogList = ({ blogs }: Props) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Read page from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const page = Number(params.get('page')) || 1;
    setCurrentPage(page);
  }, []);

  // Update URL when page changes
  useEffect(() => {
    const url = new URL(window.location.href);
    if (currentPage === 1) {
      url.searchParams.delete('page');
    } else {
      url.searchParams.set('page', String(currentPage));
    }
    window.history.pushState({}, '', url);
  }, [currentPage]);

  const totalPages = useMemo(
    () => Math.ceil(blogs.length / POSTS_PER_PAGE),
    [blogs]
  );

  const currentBlogs = useMemo(() => {
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    return blogs.slice(startIndex, endIndex);
  }, [blogs, currentPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      {totalPages > 1 && (
        <BlogPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      <div className="flex flex-col gap-3">
        {currentBlogs.map(blog => (
          <BlogCard key={blog.slug} blog={blog} />
        ))}
      </div>

      {totalPages > 1 && (
        <BlogPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default BlogList;
