/**
 * @jest-environment jsdom
 */

/**
 * Strips html tags and resolves any html entities
 * @param html
 */
export function stripHtml(html: string | null | undefined): string {
  const el = document.createElement('html')
  el.innerHTML = html || ''
  // replace multiple new lines, and various types of spaces by a single space
  return (el.textContent || '').replace(/[\r\n \u202F\u00A0]+/g, ' ').trim()
}
