"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { documentApi, getFilters } from "@/lib/api";
import type { Document, FilterOptions } from "@/types";

const PER_PAGE_OPTIONS = ["12", "24", "48", "96"] as const;

interface FilterState {
  search: string;
  document_type_id: string;
  brand_id: string;
  application_id: string;
  solution_id: string;
  product_category_id: string;
  location_id: string;
  per_page: string;
  page: number;
}

const DEFAULT_FILTERS: FilterState = {
  search: "",
  document_type_id: "",
  brand_id: "",
  application_id: "",
  solution_id: "",
  product_category_id: "",
  location_id: "",
  per_page: "12",
  page: 1,
};

export default function DocumentsPage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [searchInput, setSearchInput] = useState("");
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search input → filters.search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch filter options once on mount
  useEffect(() => {
    getFilters().then(setFilterOptions).catch(() => {});
  }, []);

  // Fetch documents whenever filters change
  useEffect(() => {
    setLoading(true);
    setError(null);

    const params: Record<string, string> = {
      per_page: filters.per_page,
      page: String(filters.page),
    };
    if (filters.search) params.search = filters.search;
    if (filters.document_type_id) params.document_type_id = filters.document_type_id;
    if (filters.brand_id) params.brand_id = filters.brand_id;
    if (filters.application_id) params.application_id = filters.application_id;
    if (filters.solution_id) params.solution_id = filters.solution_id;
    if (filters.product_category_id) params.product_category_id = filters.product_category_id;
    if (filters.location_id) params.location_id = filters.location_id;

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

  const setFilter = (key: keyof Omit<FilterState, "page" | "search">, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const hasActiveFilters =
    filters.document_type_id ||
    filters.brand_id ||
    filters.application_id ||
    filters.solution_id ||
    filters.product_category_id ||
    filters.location_id ||
    filters.search;

  const filterGroups = [
    { key: "document_type_id" as const, label: "Document Type", options: filterOptions?.document_types ?? [] },
    { key: "brand_id" as const, label: "Brand", options: filterOptions?.brands ?? [] },
    { key: "application_id" as const, label: "Application", options: filterOptions?.applications ?? [] },
    { key: "solution_id" as const, label: "Solution", options: filterOptions?.solutions ?? [] },
    { key: "product_category_id" as const, label: "Product Category", options: filterOptions?.product_categories ?? [] },
    { key: "location_id" as const, label: "Location", options: filterOptions?.locations ?? [] },
  ];

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="mt-1 text-muted-foreground">Browse and download technical documents</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filter sidebar */}
        <aside className="w-full lg:w-56 xl:w-64 shrink-0">
          <div className="sticky top-20 space-y-4">
            <input
              type="search"
              placeholder="Search documents..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />

            {filterGroups.map(({ key, label, options }) => (
              <div key={key}>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  {label}
                </label>
                <select
                  value={filters[key]}
                  onChange={(e) => setFilter(key, e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">All</option>
                  {options.map((opt) => (
                    <option key={opt.id} value={String(opt.id)}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setFilters(DEFAULT_FILTERS);
                }}
                className="text-sm text-muted-foreground underline hover:text-foreground"
              >
                Clear all filters
              </button>
            )}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {meta ? `${meta.total} document${meta.total !== 1 ? "s" : ""}` : " "}
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

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Skeleton */}
          {loading && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-60 animate-pulse rounded-lg border border-border bg-muted" />
              ))}
            </div>
          )}

          {/* Cards */}
          {!loading && !error && (
            <>
              {documents.length === 0 ? (
                <div className="py-20 text-center text-muted-foreground">
                  No documents match your filters.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {documents.map((doc) => (
                    <DocumentCard key={doc.slug} document={doc} />
                  ))}
                </div>
              )}

              {/* Pagination */}
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

function DocumentCard({ document: doc }: { document: Document }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/50">
      {/* Thumbnail */}
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
            {doc.document_type.name}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <Link
          href={`/documents/${doc.slug}`}
          className="mb-1 line-clamp-2 text-sm font-semibold leading-snug hover:text-primary"
        >
          {doc.title}
        </Link>

        {doc.description && (
          <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">{doc.description}</p>
        )}

        {doc.all_tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {doc.all_tags.slice(0, 3).map((tag) => (
              <span
                key={tag.slug}
                className="rounded bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground"
              >
                {tag.name}
              </span>
            ))}
            {doc.all_tags.length > 3 && (
              <span className="text-xs text-muted-foreground">+{doc.all_tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer */}
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
