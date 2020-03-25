import i18n from 'i18next';
import Fetch from 'i18next-fetch-backend';
// import XHR from 'i18next-xhr-backend';
import { get } from 'lodash-es';
import { initReactI18next } from 'react-i18next';

import { getEnv } from '../helpers';

// import translations from './nl.json';

// {
//     "name": "translations-frontend",
//     "value": {
//         "shared/components/share-through-email-modal/share-through-email-modal___stuur-een-link-via-email": "Stuur een link via emails"
//     }
// }

// const retrieveFrontendTranslations = async () => {
// 	const url = `${getEnv('PROXY_URL')}/translations/nl.json`;

// 	const response = await fetch(url, {
// 		method: 'GET',
// 		headers: {
// 			'Content-Type': 'application/json',
// 		},
// 	});

// 	const translations = await response.json();

// 	return translations;
// };

i18n.use(Fetch)
	.use(initReactI18next) // passes i18n down to react-i18next
	.init({
		resources: {},
		backend: {
			loadPath: `${getEnv('PROXY_URL')}/translations/nl.json`,
			parse: (data: any) => ({
				nl: {
					translations: JSON.parse(data).value,
				},
			}),
		},
		debug: get(window, '_ENV_.ENV') === 'local',
		keySeparator: '^',
		nsSeparator: '^',
		lng: 'nl',
		fallbackLng: 'nl',
		interpolation: {
			escapeValue: false,
		},
	});

// retrieveFrontendTranslations().then(translations => {
// 	debugger;
// 	i18n.addResources('nl', 'translation', get(translations, 'value'));
// });

export default i18n;
