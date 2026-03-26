import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const separator = baseUrl.includes("?") ? "&" : "?";

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Pagination">
      {currentPage > 1 && (
        <Link
          href={`${baseUrl}${separator}page=${currentPage - 1}`}
          className="rounded px-3 py-2 text-sm text-stone-600 hover:bg-stone-100"
        >
          Précédent
        </Link>
      )}
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-2 text-stone-400">
            ...
          </span>
        ) : (
          <Link
            key={p}
            href={`${baseUrl}${separator}page=${p}`}
            className={`rounded px-3 py-2 text-sm ${
              p === currentPage
                ? "bg-blue-800 text-white"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            {p}
          </Link>
        )
      )}
      {currentPage < totalPages && (
        <Link
          href={`${baseUrl}${separator}page=${currentPage + 1}`}
          className="rounded px-3 py-2 text-sm text-stone-600 hover:bg-stone-100"
        >
          Suivant
        </Link>
      )}
    </nav>
  );
}
