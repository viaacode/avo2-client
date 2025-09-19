import {
	type DefaultNamespace,
	useTranslation as useTranslationI18n,
	type UseTranslationResponse,
} from 'react-i18next';

import { tHtml } from '../helpers/translate-html';
import { tText } from '../helpers/translate-text';

export const useTranslation = (): Omit<UseTranslationResponse<DefaultNamespace>, 't'> & {
	tHtml: typeof tHtml;
	tText: typeof tText;
} => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { t, ...rest } = useTranslationI18n();
	return { tHtml, tText, ...rest };
};
