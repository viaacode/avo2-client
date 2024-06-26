import { decode } from 'he';
import { type TOptions } from 'i18next';
import React, { type ReactNode } from 'react';

import Html from '../components/Html/Html';
import i18n from '../translations/i18n';

/**
 * Wrapper around tText() that renders the translated text as html
 * @param key
 * @param params
 */
export function tHtml(key: string, params?: TOptions | string | undefined): ReactNode | string {
	const translatedValue: string = tText(key, params);

	if (translatedValue.includes('<')) {
		return <Html content={translatedValue} />;
	}

	return translatedValue;
}

/**
 * Wrapper around tText() that simply returns the translated text as a string
 * @param key
 * @param params
 */
export function tText(key: string, params?: TOptions | string | undefined): string {
	const translation: string | null | undefined = i18n?.t(key, params);

	// Fallback to formatted key + *** if translation is missing
	if (!translation || translation === key) {
		return (key.split('___')[1] || key).replace('-', ' ') + ' ***';
	}

	return decode(translation);
}
