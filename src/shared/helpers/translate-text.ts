/**
 * @jest-environment jsdom
 */

import { decodeHTML } from 'entities';
import { isNil } from 'es-toolkit';
import { type TOptions } from 'i18next';

import i18n from '../translations/i18n';

/**
 * Wrapper around tText() that simply returns the translated text as a string
 * @param key
 * @param params
 */
export function tText(
  key: string,
  params?: TOptions | string | undefined,
): string {
  const translation: string | null | undefined = i18n?.t(key, params);

  // Fallback to formatted key + *** if translation is missing
  if (isNil(translation) || translation === key) {
    return (key.split('___')[1] || key).replace('-', ' ') + ' ***';
  }

  return decodeHTML(translation);
}
