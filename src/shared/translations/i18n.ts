/**
 * @jest-environment jsdom
 */

import { lowerCase, upperFirst } from 'es-toolkit';
import I18n from 'i18next';
import i18nHttpFetch from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

import { getEnv } from '../helpers/env';

// let resolveTranslations: (value?: unknown) => void | undefined;
// export const waitForTranslations = new Promise((resolve) => {
//   resolveTranslations = resolve;
// });

export async function loadTranslations() {
  await I18n.use(i18nHttpFetch)
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
      backend: {
        loadPath: `${getEnv('PROXY_URL')}/admin/translations/nl.json`,
        parse: (data: any) => {
          // setTimeout(() => {
          //   resolveTranslations();
          // }, 0);
          return JSON.parse(data);
        },
      },
      debug: false,
      keySeparator: '^',
      nsSeparator: '^',
      lng: 'nl',
      fallbackLng: 'nl',
      interpolation: {
        escapeValue: false,
      },
      initImmediate: true,
      react: {
        useSuspense: false,
      },
      parseMissingKeyHandler: (key) => {
        if (key.includes('___')) {
          return `${upperFirst(lowerCase(key.split('___').pop() || ''))} ***`;
        }
        return `${key} ***`;
      },
    });
}

export default I18n;
