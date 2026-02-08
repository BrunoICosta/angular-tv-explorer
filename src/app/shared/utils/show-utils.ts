/** Extracts the 4-digit year from an ISO date (`2013-06-24` → `2013`). */
export function yearOf(date: string | null | undefined): string | null {
  return date && /^\d{4}/.test(date) ? date.slice(0, 4) : null;
}

/** Converts an HTML snippet from the API into plain text (for cards, meta tags, etc). */
export function stripHtml(html: string | null | undefined): string {
  if (!html) {
    return '';
  }
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
