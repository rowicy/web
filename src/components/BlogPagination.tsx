import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
};

const BlogPagination = ({ currentPage, totalPages, onPageChange }: Props) => {
  const handlePageClick = (page: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (onPageChange) {
      onPageChange(page);
    } else {
      // Fallback: navigate using href
      const url = page === 1 ? '/blog' : `/blog?page=${page}`;
      window.location.href = url;
    }
  };

  const getPageUrl = (page: number) => {
    return page === 1 ? '/blog' : `/blog?page=${page}`;
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than or equal to max visible pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink
              href={getPageUrl(i)}
              onClick={handlePageClick(i)}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Always show first page
      pages.push(
        <PaginationItem key={1}>
          <PaginationLink
            href={getPageUrl(1)}
            onClick={handlePageClick(1)}
            isActive={currentPage === 1}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      // Show ellipsis if current page is far from start
      if (currentPage > 3) {
        pages.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Show pages around current page
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink
              href={getPageUrl(i)}
              onClick={handlePageClick(i)}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      // Show ellipsis if current page is far from end
      if (currentPage < totalPages - 2) {
        pages.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Always show last page
      pages.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            href={getPageUrl(totalPages)}
            onClick={handlePageClick(totalPages)}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return pages;
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={currentPage > 1 ? getPageUrl(currentPage - 1) : '#'}
            onClick={
              currentPage > 1
                ? handlePageClick(currentPage - 1)
                : e => e.preventDefault()
            }
            aria-disabled={currentPage === 1 ? 'true' : 'false'}
            className={
              currentPage === 1 ? 'pointer-events-none opacity-50' : ''
            }
          />
        </PaginationItem>

        {renderPageNumbers()}

        <PaginationItem>
          <PaginationNext
            href={currentPage < totalPages ? getPageUrl(currentPage + 1) : '#'}
            onClick={
              currentPage < totalPages
                ? handlePageClick(currentPage + 1)
                : e => e.preventDefault()
            }
            aria-disabled={currentPage === totalPages ? 'true' : 'false'}
            className={
              currentPage === totalPages ? 'pointer-events-none opacity-50' : ''
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default BlogPagination;
