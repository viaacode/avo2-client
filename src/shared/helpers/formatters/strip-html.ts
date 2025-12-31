/**
 * @jest-environment jsdom
 */

import { isServerSideRendering } from "../routing/is-server-side-rendering.ts";

/**
 * Strips html tags and resolves any html entities
 * @param html
 */
export function stripHtml(html: string | null | undefined): string {
  if (isServerSideRendering()) {
    // Simple regex to remove HTML tags in SSR environment
    return html ? html.replace(/<[^>]+>/g, '') : '';
  }
  // Use browser to interpret HTML and get text content
  const el = document.createElement('html');
  el.innerHTML = html || '';
  // replace multiple new lines, and various types of spaces by a single space
  return (el.textContent || '').replace(/[\r\n \u202F\u00A0]+/g, ' ').trim();
}
