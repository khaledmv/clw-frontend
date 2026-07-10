import type { Metadata } from "next";
import Link from "next/link";
import { FileQuestion } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-screen-xl flex-col items-center px-4 py-24 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <FileQuestion className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
      </div>

      <p className="text-sm font-semibold uppercase tracking-wider text-primary">404 error</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        Try searching the document library (
        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-xs">
          Ctrl K
        </kbd>
        ) or head back home.
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
