import { type ReactNode } from 'react';

import { Html } from '../components/Html/Html';

import { tText } from './translate-text';

/**
 * Wrapper around tText() that renders the translated text as html
 * @param key
 * @param params
 */
export function tHtml(
  key: string,
  params?: Record<string, string | number> | undefined,
): ReactNode | string {
  const translatedValue: string = tText(
    /* IGNORE_ADMIN_CORE_TRANSLATIONS_EXTRACTION */
    key,
    params,
  );

  if (translatedValue.includes('<')) {
    return <Html content={translatedValue} />;
  }

  return translatedValue;
}
