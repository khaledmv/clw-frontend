"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight, FileText } from "lucide-react";
import { documentApi } from "@/lib/api";
import type { Document } from "@/types";
import { cn } from "@/lib/utils";

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Debounce query → Meilisearch via /api/v1/documents?search=
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      documentApi
        .list({ search: query, per_page: "8" })
        .then((res) => setResults(res.data))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  //
  useEffect(() => {
    setActiveIndex(0);
  }, [results]);

  // Navigate to document page and reset state
  const navigate = useCallback(
    (slug: string) => {
      router.push(`/${slug}`);
      onClose();
      setQuery("");
      setResults([]);
      setActiveIndex(0);
    },
    [router, onClose]
  );

  // Format tag for display (capitalize first letter of each word)
  const formatTag = (tag: string) =>
  tag
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

 // Focus input when dialog opens, reset state when it closes
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
      setActiveIndex(0);
    }
  }, [open]);
 // Handle keyboard navigation and selection
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && results[activeIndex]) {
        navigate(results[activeIndex].slug);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, results, activeIndex, navigate, onClose]);

  if (!open) return null;

   
  const highlightText = (
  text: string | null | undefined,
  query: string
) => {
  text = text ?? "";

  if (!query.trim()) return text;

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedQuery})`, "gi");

  return text.split(regex).map((part, index) =>
    regex.test(part) ? (
      <mark
        key={index}
        className="rounded bg-yellow-200 px-0.5 text-black dark:bg-yellow-500 dark:text-black"
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
};

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        className={cn(
          "relative mx-4 w-full max-w-lg overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input row */}
        <div className="flex items-center gap-3 border-b border-border px-4">
          {loading ? (
            <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          ) : (
            <Search className="size-4 shrink-0 text-muted-foreground" />
          )}
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents…"
            className="flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
          <kbd className="hidden items-center gap-1 rounded border border-border px-1.5 py-0.5 text-xs text-muted-foreground sm:flex">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <ul className="max-h-80 overflow-y-auto py-2">
          {!query.trim() ? (
            <li className="px-4 py-8 text-center text-sm text-muted-foreground">
              Type to search documents…
            </li>
          ) : loading ? (
            <li className="px-4 py-8 text-center text-sm text-muted-foreground">
              Searching…
            </li>
          ) : results.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-muted-foreground">
              No results for &ldquo;{query}&rdquo;
            </li>
          ) : (
            results.map((doc, i) => (
              <li key={doc.slug}>
                <button
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors",
                    i === activeIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                  )}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => navigate(doc.slug)}
                >
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-foreground">
                      {highlightText(doc.title, query)}
                    </span>

                     {doc.search_snippet ? (
                            <div
                              className="mt-1 text-xs text-muted-foreground line-clamp-2 [&_mark]:rounded [&_mark]:bg-yellow-200 [&_mark]:px-0.5 [&_mark]:text-black dark:[&_mark]:bg-yellow-500"
                              dangerouslySetInnerHTML={{
                                __html: doc.search_snippet,
                              }}
                            />
                          ) : (
                            <span className="block truncate text-xs text-muted-foreground">
                              {stripHtml(doc.description ?? "")}
                            </span>
                      )}

                      {doc.all_tags
                          .filter(tag =>
                            tag.toLowerCase().includes(query.toLowerCase())
                          )
                          .map((tag, index) => (
                            <span
                              key={index}
                              className="rounded bg-muted px-2 py-0.5 text-[10px]"
                            >
                              {highlightText(formatTag(tag), query)}
                            </span>
                          ))}

                    <span className="block truncate text-xs text-muted-foreground">
                      {[doc.document_type?.name, doc.brand?.name]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                </button>
              </li>
            ))
          )}
        </ul>

        {/* Footer */}
        <div className="flex items-center gap-4 border-t border-border px-4 py-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border px-1">↑↓</kbd> navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border px-1">↵</kbd> open
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border px-1">Esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  );
}
