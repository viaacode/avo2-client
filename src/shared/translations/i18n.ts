/**
 * @jest-environment jsdom
 */

import { lowerCase, upperFirst } from 'es-toolkit';
import I18n from 'i18next';
import i18nHttpFetch from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

import { getEnv } from '../helpers/env';

const i18nConfig = {
  debug: false,
  keySeparator: '^' as const,
  nsSeparator: '^' as const,
  lng: 'nl',
  fallbackLng: 'nl',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
  parseMissingKeyHandler: (key: string) => {
    if (key.includes('___')) {
      return `${upperFirst(lowerCase(key.split('___').pop() || ''))} ***`;
    }
    return `${key} ***`;
  },
};

/**
 * Load translations for initial render.
 * - On client: Uses SSR-injected translations if available for instant hydration
 * - On server: Fetches translations via HTTP
 */
export async function loadTranslations() {
  // Client-side: Use SSR-injected translations for hydration
  if (typeof window !== 'undefined' && window.__i18nResources) {
    await I18n.use(initReactI18next).init({
      ...i18nConfig,
      resources: window.__i18nResources,
    });
    return;
  }

  // Server-side (or client fallback): Fetch translations via HTTP
  await I18n.use(i18nHttpFetch)
    .use(initReactI18next)
    .init({
      ...i18nConfig,
      backend: {
        loadPath: `${getEnv('PROXY_URL')}/admin/translations/nl.json`,
        parse: (data: any) => {
          return JSON.parse(data);
        },
      },
      initImmediate: true,
    });
}

/**
 * Refresh translations from the server.
 * Call this after hydration to fetch the latest translations.
 */
export async function refreshTranslations() {
  try {
    const response = await fetch(
      `${getEnv('PROXY_URL')}/admin/translations/nl.json`,
    );
    const translations = await response.json();
    I18n.addResourceBundle('nl', 'translation', translations, true, true);
  } catch (error) {
    console.error('Failed to refresh translations:', error);
  }
}

export default I18n;
