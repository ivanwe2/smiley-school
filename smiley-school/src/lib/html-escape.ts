/**
 * Escapes a string for safe insertion into HTML context.
 * Replaces &, <, >, ", and ' with their HTML entities.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Escapes HTML and converts newlines to <br> for display in preformatted blocks.
 */
export function escapeHtmlWithBreaks(str: string): string {
  return escapeHtml(str).replace(/\n/g, "<br>");
}
