import { type TOptions } from 'i18next';
import { type ReactNode } from 'react';
import {
	type DefaultNamespace,
	type Namespace,
	useTranslation as useI18NextTranslation,
	type UseTranslationResponse,
} from 'react-i18next';

import { tHtml } from '../../helpers/translate-html.js';
import { tText } from '../../helpers/translate-text.js';

type useTranslationsResponse<N extends Namespace = DefaultNamespace> = Omit<
	UseTranslationResponse<N>,
	't'
> & {
	tHtml: (key: string, params?: TOptions | string | undefined) => ReactNode;
	tText: (key: string, params?: TOptions | string | undefined) => string;
};

export const useTranslation = (): useTranslationsResponse => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { t, ...rest } = useI18NextTranslation();
	return { tHtml, tText, ...rest };
};
