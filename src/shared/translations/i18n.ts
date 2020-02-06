import i18n from 'i18next';
import { get } from 'lodash-es';
import { initReactI18next } from 'react-i18next';

import translations from './nl.json';

i18n
	.use(initReactI18next) // passes i18n down to react-i18next
	.init({
		debug: get(window, '_ENV_.ENV') === 'local',
		resources: {
			nl: {
				translation: translations,
			},
		},
		keySeparator: '^',
		nsSeparator: '^',
		lng: 'nl',
		fallbackLng: 'nl',
		interpolation: {
			escapeValue: false,
		},
	});

export default i18n;
