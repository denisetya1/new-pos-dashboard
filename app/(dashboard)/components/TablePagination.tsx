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
    const pages: (number | "ellipsis" | "first" | "last")[] = [];

    // Always show page 1
    pages.push(1);

    // First ellipsis if gap after page 1
    if (currentPage > 5) {
      pages.push("ellipsis");
    }

    // Middle pages: show 5 pages around current (but skip if already covered)
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(2, currentPage - half); // Start after page 1
    let end = Math.min(totalPages - 1, start + maxVisible - 1); // End before last page

    if (end - start + 1 < maxVisible) {
      start = Math.max(2, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Last ellipsis if gap before last page
    if (
      totalPages > 5 &&
      (pages[pages.length - 1] as number) < totalPages - 1
    ) {
      pages.push("ellipsis");
    }

    // Always show last page (if different from middle pages)
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageChange = (page: number) => {
    const url = createPageURL(pathname, searchParams, page, limit);
    router.push(url);
  };

  const pageNumbers = getPageNumbers();

  return (
    <Pagination className="justify-end">
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
        {pageNumbers.map((page, index) => (
          <PaginationItem key={`${page}-${index}`}>
            {typeof page === "number" ? (
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
            ) : (
              <PaginationEllipsis />
            )}
          </PaginationItem>
        ))}

        {/* Ellipsis if needed */}
        {(pageNumbers[pageNumbers.length - 1] as number) < totalPages && (
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
