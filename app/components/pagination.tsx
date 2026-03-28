import { Link } from "react-router";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
};

export function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <nav className="flex justify-center gap-2 mt-8" aria-label="ページネーション">
      {currentPage > 1 && (
        <Link
          to={currentPage === 2 ? baseUrl : `${baseUrl}/page/${currentPage - 1}`}
          className="px-3 py-2 text-sm border rounded hover:bg-gray-50 no-underline text-gray-700"
        >
          前へ
        </Link>
      )}
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-3 py-2 text-sm text-gray-400">
            ...
          </span>
        ) : (
          <Link
            key={p}
            to={p === 1 ? baseUrl : `${baseUrl}/page/${p}`}
            className={`px-3 py-2 text-sm border rounded no-underline ${
              p === currentPage
                ? "bg-gray-900 text-white border-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            {p}
          </Link>
        )
      )}
      {currentPage < totalPages && (
        <Link
          to={`${baseUrl}/page/${currentPage + 1}`}
          className="px-3 py-2 text-sm border rounded hover:bg-gray-50 no-underline text-gray-700"
        >
          次へ
        </Link>
      )}
    </nav>
  );
}
