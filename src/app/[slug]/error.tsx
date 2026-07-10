"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-center">
      <p className="mb-4 text-destructive">{error.message || "Something went wrong."}</p>
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => reset()}
          className="text-sm text-primary hover:underline"
        >
          Try again
        </button>
        <Link href="/" className="text-sm text-primary hover:underline">
          ← Back to Documents
        </Link>
      </div>
    </div>
  );
}
