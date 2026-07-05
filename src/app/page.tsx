"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { documentApi, getFilters } from "@/lib/api";
import type { Document, FilterOptions, TaxonomyItem } from "@/types";

const PER_PAGE_OPTIONS = ["12", "24", "48", "96"] as const;

const MULTI_KEYS = [
  "document_type",
  "brand",
  "application",
  "solution",
  "product_category",
  "location",
] as const;
type MultiKey = (typeof MULTI_KEYS)[number];

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function highlight(text: string, query: string) {
  if (!query.trim()) return text;
  const words = query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!words.length) return text;
  const pattern = new RegExp(`(${words.join("|")})`, "gi");
  const parts = text.split(pattern);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark
        key={i}
        className="rounded-sm bg-yellow-200/90 px-0.5 text-yellow-900 not-italic dark:bg-yellow-500/25 dark:text-yellow-200"
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function tagMatches(name: string, query: string): boolean {
  if (!query.trim()) return false;
  const lower = name.toLowerCase();
  return query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .some((word) => word && lower.includes(word));
}

// ── Filter state ──────────────────────────────────────────────────────────────

interface FilterState {
  search: string;
  document_type: string[];
  brand: string[];
  application: string[];
  solution: string[];
  product_category: string[];
  location: string[];
  per_page: string;
  page: number;
}

// ── Root export — Suspense required for useSearchParams ───────────────────────

export default function Page() {
  return (
    <Suspense>
      <DocumentsPage />
    </Suspense>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

function DocumentsPage() {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FilterState>(() => {
    const get = (key: string) => {
      const val = searchParams.get(key);
      return val ? val.split(" ").filter(Boolean) : [];
    };
    return {
      search: searchParams.get("search") ?? "",
      document_type: get("document_type"),
      brand: get("brand"),
      application: get("application"),
      solution: get("solution"),
      product_category: get("product_category"),
      location: get("location"),
      per_page: searchParams.get("per_page") ?? "12",
      page: Number(searchParams.get("page") ?? "1"),
    };
  });

  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [meta, setMeta] = useState<{
    current_page: number;
    last_page: number;
    total: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFilters().then(setFilterOptions).catch(() => {});
  }, []);

  // Sync filters → URL using history API directly (avoids Next.js re-renders
  // from router.replace which was preventing the fetch effect from running)
  useEffect(() => {
    const params = new URLSearchParams();
    MULTI_KEYS.forEach((key) => {
      if (filters[key].length) params.set(key, filters[key].join(" "));
    });
    if (filters.search) params.set("search", filters.search);
    if (filters.page > 1) params.set("page", String(filters.page));
    if (filters.per_page !== "12") params.set("per_page", filters.per_page);
    const qs = params.toString();
    window.history.replaceState({}, "", qs ? `?${qs}` : window.location.pathname);
  }, [filters]);

  // Fetch documents whenever filters change
  useEffect(() => {
    setLoading(true);
    setError(null);

    const params: Record<string, string> = {
      per_page: filters.per_page,
      page: String(filters.page),
    };
    if (filters.search) params.search = filters.search;
    MULTI_KEYS.forEach((key) => {
      if (filters[key].length) params[key] = filters[key].join(" ");
    });

    documentApi
      .list(params)
      .then((res) => {
        setDocuments(res.data);
        setMeta({
          current_page: res.meta.current_page ?? res.meta.page ?? 1,
          last_page: res.meta.last_page,
          total: res.meta.total,
        });
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filters]);

  const toggleFilter = useCallback((key: MultiKey, slug: string) => {
    setFilters((prev) => {
      const current = prev[key];
      const next = current.includes(slug)
        ? current.filter((s) => s !== slug)
        : [...current, slug];
      return { ...prev, [key]: next, page: 1 };
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      ...Object.fromEntries(MULTI_KEYS.map((k) => [k, []])),
      page: 1,
    }));
  }, []);

  const hasActiveFilters = MULTI_KEYS.some((key) => filters[key].length > 0);
  const totalActive = MULTI_KEYS.reduce((sum, key) => sum + filters[key].length, 0);

  const filterGroups: { key: MultiKey; label: string; options: TaxonomyItem[] }[] = [
    { key: "document_type", label: "Document Types", options: filterOptions?.document_types ?? [] },
    { key: "brand", label: "Brands", options: filterOptions?.brands ?? [] },
    { key: "application", label: "Application", options: filterOptions?.applications ?? [] },
    { key: "solution", label: "Solutions", options: filterOptions?.solutions ?? [] },
    { key: "product_category", label: "Product Categories", options: filterOptions?.product_categories ?? [] },
    { key: "location", label: "Location", options: filterOptions?.locations ?? [] },
  ];

  const searchQuery = filters.search;

  const toolbarLabel = (() => {
    if (!meta) return " ";
    if (searchQuery)
      return `${meta.total} result${meta.total !== 1 ? "s" : ""} for "${searchQuery}"`;
    return `${meta.total} document${meta.total !== 1 ? "s" : ""}`;
  })();

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 mb-10">
      <div className="mx-auto mb-8 text-center py-10 ">
        <h1 className="text-3xl font-bold  tracking-tight">Document Library</h1>
        <p className="mx-auto mt-1 text-center text-muted-foreground max-w-4xl">Brochures, Case Studies, Data Sheets and more.
Filter by Application, Solution, Product Category, Brand, Document Type or Location. 
Don't see what you're looking for? Contact us and we'll provide it within 24 hours. Email: marketing@cleanwater1.com.</p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* ── Filter sidebar ───────────────────────────────────────────────── */}
        <aside className="w-full shrink-0 lg:w-56 xl:w-64">
          <div className="sticky top-20">
            {/* Filter groups accordion */}
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              {filterGroups.map(({ key, label, options }, idx) =>
                options.length === 0 ? null : (
                  <FilterGroup
                    key={key}
                    label={label}
                    options={options}
                    selected={filters[key]}
                    onToggle={(slug) => toggleFilter(key, slug)}
                    isLast={idx === filterGroups.filter((g) => g.options.length > 0).length - 1}
                  />
                )
              )}
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="mt-3 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                Clear Filters
                {totalActive > 0 && (
                  <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold leading-none text-primary-foreground">
                    {totalActive}
                  </span>
                )}
              </button>
            )}
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {loading ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {searchQuery ? "Searching…" : "Loading…"}
                </span>
              ) : (
                toolbarLabel
              )}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Per page</span>
              <select
                value={filters.per_page}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, per_page: e.target.value, page: 1 }))
                }
                className="rounded-md border border-input bg-background px-2 py-1 text-sm focus:outline-none"
              >
                {PER_PAGE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {loading && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-60 animate-pulse rounded-lg border border-border bg-muted"
                />
              ))}
            </div>
          )}

          {!loading && !error && (
            <>
              {documents.length === 0 ? (
                <div className="py-20 text-center text-muted-foreground">
                  {searchQuery
                    ? `No results for "${searchQuery}". Try a different search term.`
                    : "No documents match your filters."}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {documents.map((doc) => (
                    <DocumentCard key={doc.slug} document={doc} searchQuery={searchQuery} />
                  ))}
                </div>
              )}

              {meta && meta.last_page > 1 && (
                <div className="mt-8 flex items-center justify-center gap-3">
                  <button
                    disabled={filters.page <= 1}
                    onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                    className="rounded-md border border-input px-3 py-1.5 text-sm hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Page {filters.page} of {meta.last_page}
                  </span>
                  <button
                    disabled={filters.page >= meta.last_page}
                    onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                    className="rounded-md border border-input px-3 py-1.5 text-sm hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── FilterGroup (accordion dropdown) ─────────────────────────────────────────

const SHOW_LIMIT = 6;

function FilterGroup({
  label,
  options,
  selected,
  onToggle,
  isLast,
}: {
  label: string;
  options: TaxonomyItem[];
  selected: string[];
  onToggle: (slug: string) => void;
  isLast: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? options : options.slice(0, SHOW_LIMIT);

  return (
    <div className={!isLast ? "border-b border-border" : undefined}>
      {/* Header row */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-accent/50"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          {label}
          {selected.length > 0 && (
            <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold leading-none text-primary-foreground">
              {selected.length}
            </span>
          )}
        </span>
        <span className="text-lg leading-none text-muted-foreground select-none">
          {open ? "−" : "+"}
        </span>
      </button>

      {/* Options */}
      {open && (
        <div className="border-t border-border/50 bg-muted/30 px-4 pb-3 pt-2">
          <div className="space-y-0.5">
            {visible.map((opt) => {
              const checked = selected.includes(opt.slug);
              return (
                <label
                  key={opt.id}
                  className="flex cursor-pointer items-center gap-2.5 rounded px-1 py-1.5 hover:bg-accent"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(opt.slug)}
                    className="h-3.5 w-3.5 shrink-0 rounded border-input accent-primary"
                  />
                  <span
                    className={`truncate text-sm leading-tight ${
                      checked ? "font-medium text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {opt.name}
                  </span>
                </label>
              );
            })}
          </div>

          {options.length > SHOW_LIMIT && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="mt-1.5 pl-1 text-xs text-primary hover:underline"
            >
              {showAll ? "Show less" : `+${options.length - SHOW_LIMIT} more`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── DocumentCard ──────────────────────────────────────────────────────────────

function DocumentCard({
  document: doc,
  searchQuery,
}: {
  document: Document;
  searchQuery: string;
}) {
  const isSearching = searchQuery.trim().length > 0;
  const visibleTags = isSearching ? doc.all_tags : doc.all_tags.slice(0, 3);
  const hiddenCount = isSearching ? 0 : Math.max(0, doc.all_tags.length - 3);

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/50">
      <div className="relative flex h-36 items-center justify-center overflow-hidden bg-muted">
        {doc.thumbnail_url ? (
          <img src={doc.thumbnail_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <svg
            className="h-12 w-12 text-muted-foreground/30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        )}
        {doc.document_type && (
          <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
            {highlight(doc.document_type.name, searchQuery)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <Link
          href={`/${doc.slug}`}
          className="mb-1 line-clamp-2 text-sm font-semibold leading-snug hover:text-primary"
        >
          {highlight(doc.title, searchQuery)}
        </Link>

        {doc.description && (
          <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">
            {highlight(stripHtml(doc.description), searchQuery)}
          </p>
        )}

          {/* {visibleTags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1">
              {visibleTags.map((tag, i) => {
                const matched = isSearching && tagMatches(tag, searchQuery);

                return (
                  <span
                    key={`${tag}-${i}`}
                    className={
                      matched
                        ? "rounded bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-800 ring-1 ring-yellow-300 dark:bg-yellow-900/40 dark:text-yellow-200 dark:ring-yellow-700/60"
                        : "rounded bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground"
                    }
                  >
                    {highlight(tag, searchQuery)}
                  </span>
                );
              })}

              {hiddenCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  +{hiddenCount}
                </span>
              )}
            </div>
          )} */}

        <div className="mt-auto flex items-center justify-between">
          {doc.file_size_human && (
            <span className="text-xs text-muted-foreground">{doc.file_size_human}</span>
          )}
          <a
            href={doc.file_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="ml-auto flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Download
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
