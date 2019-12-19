import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translations from './nl.json';

console.log('translations: ', translations);
i18n
	.use(initReactI18next) // passes i18n down to react-i18next
	.init({
		debug: true,
		resources: {
			nl: {
				translation: translations,
			},
		},
		lng: 'nl',
		fallbackLng: 'nl',
		interpolation: {
			escapeValue: false,
		},
	});

export default i18n;
