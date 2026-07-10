import type { Metadata } from "next";
import Link from "next/link";
import { FileX2 } from "lucide-react";

// This segment can only be reached via notFound() called from a page that
// has a sibling loading.tsx — once that loading state starts streaming, the
// HTTP status is already committed as 200, so a true 404 is not possible
// here. noindex is the standard fallback signal for that "soft 404" case.
export const metadata: Metadata = {
  title: "Document Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-screen-xl flex-col items-center px-4 py-24 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <FileX2 className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
      </div>

      <p className="text-sm font-semibold uppercase tracking-wider text-primary">404 error</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Document not found</h1>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">
        This document doesn&apos;t exist, may have been unpublished, or the link
        is out of date.
      </p>

      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Back to Documents
      </Link>
    </div>
  );
}
