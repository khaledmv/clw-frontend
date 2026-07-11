import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { documentApi, ApiRequestError } from "@/lib/api";
import { processDescription, stripHtml } from "@/lib/content";
import { TableOfContents } from "@/components/TableOfContents";
import type { Document } from "@/types";

// Revalidate the cached page in the background at most once an hour so
// crawlers and users get an instantly-served, pre-rendered document while
// edits made in the CMS still show up without a full redeploy.
// export const revalidate = 3600;

export const dynamic = "force-dynamic";
export const revalidate = 0;

// async function getDocument(slug: string): Promise<Document> {
//   try {
//     const res = await documentApi.get(slug, { next: { revalidate } });
//     return res.data;
//   } catch (err) {
//     if (err instanceof ApiRequestError && err.status === 404) {
//       notFound();
//     }
//     throw err;
//   }
// }

async function getDocument(slug: string): Promise<Document> {
  try {
    const res = await documentApi.get(slug, {
      cache: "no-store",
    });

    return res.data;
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 404) {
      notFound();
    }

    throw err;
  }
}

// ── SEO ───────────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getDocument(slug);

  const title = doc.meta_title || doc.title;
  const description =
    doc.meta_description ||
    (doc.description
      ? stripHtml(doc.description).slice(0, 160)
      : `${doc.title} — download this ${doc.document_types[0]?.name?.toLowerCase() ?? "document"} from CLW Documents.`);

  return {
    title,
    description,
    alternates: { canonical: `/${doc.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/${doc.slug}`,
      ...(doc.thumbnail_url ? { images: [{ url: doc.thumbnail_url }] } : {}),
    },
    twitter: {
      card: doc.thumbnail_url ? "summary_large_image" : "summary",
      title,
      description,
      ...(doc.thumbnail_url ? { images: [doc.thumbnail_url] } : {}),
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = await getDocument(slug);

  const { html: processedHtml, headings } = doc.description
    ? processDescription(doc.description)
    : { html: "", headings: [] };

  const join = (items: { name: string }[]) =>
    items.length ? items.map((i) => i.name).join(", ") : undefined;

  const metaRows = [
    { label: "Document Type", value: join(doc.document_types) },
    { label: "Brand", value: join(doc.brands) },
    { label: "Application", value: join(doc.applications) },
    { label: "Solution", value: join(doc.solutions) },
    { label: "Product Category", value: join(doc.product_categories) },
    { label: "Location", value: join(doc.locations) },
    { label: "Published", value: doc.published_at ?? undefined },
    { label: "File", value: doc.file_name },
    { label: "Size", value: doc.file_size_human ?? undefined },
  ].filter((row): row is { label: string; value: string } => Boolean(row.value));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DigitalDocument",
    name: doc.title,
    description: doc.description ? stripHtml(doc.description).slice(0, 300) : undefined,
    url: `/${doc.slug}`,
    fileFormat: doc.file_name?.split(".").pop(),
    contentUrl: doc.file_url,
    datePublished: doc.published_at ?? undefined,
    genre: join(doc.document_types),
    keywords: doc.all_tags?.length ? doc.all_tags.join(", ") : undefined,
  };

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-12">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* <div className="flex gap-20 xl:gap-14"> */}
      <div className={`flex ${ headings.length > 0 ? "gap-20 xl:gap-14" : "justify-center" }`}>

        {/* ── Left TOC sidebar (xl+ only) ───────────────────────────────── */}
        {headings.length > 0 && (
          <aside className="hidden w-52 shrink-0 xl:block">
            <TableOfContents headings={headings} />
          </aside>
        )}

        {/* ── Main content ──────────────────────────────────────────────── */}
        <div className={`min-w-0 ${ headings.length > 0  ? "max-w-3xl flex-1"  : "w-full max-w-4xl" }`}>
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
            {doc.all_tags?.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                  Tags
                </h3>

                <div className="flex flex-wrap gap-2">
                  {doc.all_tags.map((tag, index) => (
                    <span
                      key={`${tag}-${index}`}
                      className="rounded-full bg-secondary px-2.5 py-1 text-sm text-secondary-foreground"
                    >
                      {tag}
                      {index < doc.all_tags.length - 1 && ","}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
