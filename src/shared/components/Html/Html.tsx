import { sanitizeHtml, SanitizePreset } from '@meemoo/admin-core-ui/client';
import { type FC, useEffect, useState } from 'react';

export interface HtmlProps {
  content: string;
  sanitizePreset?: SanitizePreset;
  type?: 'p' | 'div' | 'span';
  className?: string;
}

// Block-level elements that cannot be nested inside <p> tags
const BLOCK_ELEMENT_REGEX =
  /<(p|div|h[1-6]|ul|ol|li|table|blockquote|pre|section|article|header|footer|nav|aside|figure|figcaption|details|summary|main)\b/i;

export const Html: FC<HtmlProps> = ({
  content,
  sanitizePreset = SanitizePreset.link,
  type = 'p',
  className,
}) => {
  // Skip sanitization during SSR and initial hydration to avoid attribute-order
  // mismatches (DOMPurify reorders attributes differently from the raw HTML the
  // server sends). Sanitization kicks in on the first client-only re-render.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Avoid invalid nesting (e.g. <p><p>…</p></p>) which causes SSR hydration
  // mismatches because the browser's HTML parser auto-closes the outer <p>.
  const Type = type === 'p' && BLOCK_ELEMENT_REGEX.test(content) ? 'div' : type;

  return (
    <Type
      dangerouslySetInnerHTML={{
        __html: mounted ? sanitizeHtml(content, sanitizePreset) : content,
      }}
      className={className}
    />
  );
};
