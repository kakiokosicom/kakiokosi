import { Link } from "react-router";
import { Icon } from "./icon";

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
    <nav className="mt-24 flex items-center justify-center gap-4" aria-label="ページネーション">
      {currentPage > 1 && (
        <Link
          to={currentPage === 2 ? baseUrl : `${baseUrl}/page/${currentPage - 1}`}
          className="flex items-center gap-2 px-6 py-2 bg-surface-container-high text-primary hover:bg-primary hover:text-on-primary transition-all font-bold text-xs tracking-widest uppercase no-underline"
        >
          <Icon name="arrow_back" className="w-4 h-4" />
          前へ
        </Link>
      )}
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="mx-2 text-outline-variant">
            ...
          </span>
        ) : (
          <Link
            key={p}
            to={p === 1 ? baseUrl : `${baseUrl}/page/${p}`}
            className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm no-underline transition-all ${
              p === currentPage
                ? "bg-primary text-on-primary"
                : "bg-surface-container-high text-primary hover:bg-primary hover:text-on-primary"
            }`}
          >
            {p}
          </Link>
        )
      )}
      {currentPage < totalPages && (
        <Link
          to={`${baseUrl}/page/${currentPage + 1}`}
          className="flex items-center gap-2 px-6 py-2 bg-surface-container-high text-primary hover:bg-primary hover:text-on-primary transition-all font-bold text-xs tracking-widest uppercase no-underline"
        >
          次へ
          <Icon name="arrow_forward" className="w-4 h-4" />
        </Link>
      )}
    </nav>
  );
}
