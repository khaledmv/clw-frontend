"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { documentApi } from "@/lib/api";
import { slugify } from "@/lib/utils";
import { TableOfContents } from "@/components/TableOfContents";
import type { Document, Heading } from "@/types";

// ── Heading extraction ────────────────────────────────────────────────────────
//
// Injects id="" attributes into every h1/h2/h3 element in the raw HTML string
// and returns the modified HTML alongside the Heading[] array for the TOC.
// Using a backreference (\1) so opening/closing tags must match.

function processDescription(html: string): { html: string; headings: Heading[] } {
  const headings: Heading[] = [];
  const counts: Record<string, number> = {};

  const processed = html.replace(
    /<(h[123])([^>]*)>([\s\S]*?)<\/\1>/gi,
    (_, tag: string, attrs: string, inner: string) => {
      const level = Number(tag[1]) as 1 | 2 | 3;
      const text = inner.replace(/<[^>]+>/g, "").trim();
      if (!text) return _;

      const base = slugify(text);
      const n = counts[base] ?? 0;
      const id = n === 0 ? base : `${base}-${n}`;
      counts[base] = n + 1;

      // Only h2 and h3 appear in the TOC (matches the Heading type constraint)
      if (level === 2 || level === 3) {
        headings.push({ id, text, level });
      }

      return `<${tag}${attrs} id="${id}">${inner}</${tag}>`;
    }
  );

  return { html: processed, headings };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DocumentDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    documentApi
      .get(slug)
      .then((res) => setDoc(res.data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const { html: processedHtml, headings } = useMemo(
    () =>
      doc?.description
        ? processDescription(doc.description)
        : { html: "", headings: [] as Heading[] },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [doc?.description]
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-8 w-3/4 rounded bg-muted" />
          <div className="h-4 w-1/2 rounded bg-muted" />
          <div className="h-48 rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="mb-4 text-destructive">{error ?? "Document not found."}</p>
        <Link href="/" className="text-sm text-primary hover:underline">
          ← Back to Documents
        </Link>
      </div>
    );
  }

  const metaRows = [
    { label: "Document Type", value: doc.document_type?.name },
    { label: "Brand", value: doc.brand?.name },
    { label: "Application", value: doc.application?.name },
    { label: "Solution", value: doc.solution?.name },
    { label: "Product Category", value: doc.product_category?.name },
    { label: "Location", value: doc.location?.name },
    { label: "Published", value: doc.published_at ?? undefined },
    { label: "File", value: doc.file_name },
    { label: "Size", value: doc.file_size_human ?? undefined },
  ].filter((row): row is { label: string; value: string } => Boolean(row.value));

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-12">
      <div className="flex gap-20 xl:gap-14">

        {/* ── Left TOC sidebar (xl+ only) ───────────────────────────────── */}
        {headings.length > 0 && (
          <aside className="hidden w-52 shrink-0 xl:block">
            <TableOfContents headings={headings} />
          </aside>
        )}

        {/* ── Main content ──────────────────────────────────────────────── */}
        <div className="min-w-0 max-w-3xl flex-1">
          <Link
            href="/"
            className="mb-8 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Documents
          </Link>

          <div className="space-y-6">
            {/* {doc.document_type && (
              <span className="text-sm font-medium text-primary">{doc.document_type.name}</span>
            )} */}

            <h1 className="text-3xl font-bold tracking-tight">{doc.title}</h1>

            {/* Rich HTML — headings now have injected id attrs for the TOC observer */}
            {processedHtml && (
              <div
                className="prose-docs"
                dangerouslySetInnerHTML={{ __html: processedHtml }}
              />
            )}

            <a
              href={doc.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download{doc.file_size_human ? ` (${doc.file_size_human})` : ""}
            </a>

            {/* {doc.thumbnail_url && (
              <div className="overflow-hidden rounded-lg border border-border">
                <img
                  src={doc.thumbnail_url}
                  alt={doc.title}
                  className="max-h-96 w-full object-cover"
                />
              </div>
            )} */}

            {metaRows.length > 0 && (
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <tbody>
                    {metaRows.map(({ label, value }) => (
                      <tr key={label} className="border-b border-border last:border-0">
                        <td className="w-40 px-4 py-3 font-medium text-muted-foreground">{label}</td>
                        <td className="px-4 py-3">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
