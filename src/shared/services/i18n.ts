import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';

i18n
	.use(initReactI18next) // passes i18n down to react-i18next
	.init({
		resources: {
			nl: {
				translation: {
					test: 'dit is een test',
				},
			},
		},
		lng: 'nl',
		fallbackLng: 'nl',

		interpolation: {
			escapeValue: false,
		},
	});
