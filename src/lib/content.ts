import { slugify } from "@/lib/utils";
import type { Heading } from "@/types";

// ── HTML utilities shared between the document list and detail pages ────────

export function stripHtml(html: string): string {
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

// Injects id="" attributes into every h1/h2/h3 element in the raw HTML string
// and returns the modified HTML alongside the Heading[] array for the TOC.
// Using a backreference (\1) so opening/closing tags must match.
export function processDescription(html: string): { html: string; headings: Heading[] } {
  const headings: Heading[] = [];
  const counts: Record<string, number> = {};

  const processed = html.replace(
    /<(h[123])([^>]*)>([\s\S]*?)<\/\1>/gi,
    (full, tag: string, attrs: string, inner: string) => {
      const level = Number(tag[1]) as 1 | 2 | 3;
      const text = inner.replace(/<[^>]+>/g, "").trim();
      if (!text) return full;

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
