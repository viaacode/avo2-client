import { type TOptions } from 'i18next';
import React, { type ReactNode } from 'react';

import Html from '../components/Html/Html';

import { tText } from './translate';

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
