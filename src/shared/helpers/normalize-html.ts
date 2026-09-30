import { isRichTextEmpty } from './is-rich-text-empty';

/**
 * Normalize html so formatting differences introduced by the rich text editor (eg: whitespace between tags)
 * are not seen as changes
 */
export function normalizeHtml(html: string | null | undefined): string {
  if (isRichTextEmpty(html)) {
    return '';
  }
  return String(html).replace(/>\s+</g, '><').trim();
}
