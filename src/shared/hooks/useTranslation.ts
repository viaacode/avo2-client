import {
	DefaultNamespace,
	useTranslation as useTranslationI18n,
	UseTranslationResponse,
} from 'react-i18next';

import { tHtml, tText } from '../helpers/translate';

const useTranslation = (): Omit<UseTranslationResponse<DefaultNamespace>, 't'> & {
	tHtml: typeof tHtml;
	tText: typeof tText;
} => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { t, ...rest } = useTranslationI18n();
	return { tHtml, tText, ...rest };
};

export default useTranslation;
