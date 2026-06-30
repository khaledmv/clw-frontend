import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import { TableOfContents } from "@/components/TableOfContents";
import { getDocPage, getAllDocSlugs } from "@/lib/docs-content";

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export async function generateStaticParams() {
  return getAllDocSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug = [] } = await params;
  const page = getDocPage(slug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
  };
}

export default async function DocsPage({ params }: PageProps) {
  const { slug = [] } = await params;
  const page = getDocPage(slug);

  if (!page) notFound();

  return (
    <div className="flex">
      {/* Main content */}
      <main className="flex-1 min-w-0 px-6 py-10 lg:px-10 xl:px-12 max-w-3xl">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {page.title}
          </h1>
          {page.description && (
            <p className="mt-2 text-lg text-muted-foreground">
              {page.description}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="prose-docs">{page.content}</div>

        {/* Prev / Next navigation */}
        {(page.prev || page.next) && (
          <div className="mt-12 pt-6 border-t border-border grid grid-cols-2 gap-4">
            {page.prev ? (
              <Link
                href={page.prev.href}
                className="group flex flex-col gap-1 rounded-lg border border-border p-4 hover:bg-accent transition-colors"
              >
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ChevronLeft className="size-3" /> Previous
                </span>
                <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {page.prev.title}
                </span>
              </Link>
            ) : (
              <div />
            )}

            {page.next ? (
              <Link
                href={page.next.href}
                className="group flex flex-col items-end gap-1 rounded-lg border border-border p-4 hover:bg-accent transition-colors"
              >
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  Next <ChevronRight className="size-3" />
                </span>
                <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {page.next.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
          </div>
        )}
      </main>

      {/* Right TOC — hidden on small screens */}
      <aside className="hidden xl:block w-52 shrink-0 pr-4">
        <TableOfContents headings={page.headings} />
      </aside>
    </div>
  );
}
