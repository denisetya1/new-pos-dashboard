import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationEllipsis,
  PaginationNext,
} from "@/components/ui/pagination";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

const createPageURL = (
  pathname: string,
  searchParams: URLSearchParams,
  page: number,
  limit: number,
) => {
  const params = new URLSearchParams(searchParams.toString());
  params.set("page", page.toString());
  params.set("limit", limit.toString());
  return `${pathname}?${params.toString()}`;
};

const TablePagination = ({
  currentPage,
  totalPages,
  limit,
}: {
  currentPage: number;
  totalPages: number;
  limit: number;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const getPageNumbers = () => {
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);
    const pages: number[] = [];

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handlePageChange = (page: number) => {
    const url = createPageURL(pathname, searchParams, page, limit);
    router.push(url);
  };

  const pageNumbers = getPageNumbers();

  return (
    <Pagination className="justify-end my-4">
      <PaginationContent>
        {/* Previous Button */}
        <PaginationItem>
          <PaginationPrevious
            href={
              currentPage > 1
                ? createPageURL(pathname, searchParams, currentPage - 1, limit)
                : undefined
            }
            className={
              currentPage <= 1
                ? "pointer-events-none opacity-50 cursor-not-allowed"
                : ""
            }
            onClick={(e) => {
              if (currentPage > 1) {
                e.preventDefault();
                handlePageChange(currentPage - 1);
              }
            }}
          />
        </PaginationItem>

        {/* Page Numbers */}
        {pageNumbers.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href={createPageURL(pathname, searchParams, page, limit)}
              isActive={page === currentPage}
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(page);
              }}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {/* Ellipsis if needed */}
        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {/* Next Button */}
        <PaginationItem>
          <PaginationNext
            href={
              currentPage < totalPages
                ? createPageURL(pathname, searchParams, currentPage + 1, limit)
                : undefined
            }
            className={
              currentPage >= totalPages
                ? "pointer-events-none opacity-50 cursor-not-allowed"
                : ""
            }
            onClick={(e) => {
              if (currentPage < totalPages) {
                e.preventDefault();
                handlePageChange(currentPage + 1);
              }
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default TablePagination;
