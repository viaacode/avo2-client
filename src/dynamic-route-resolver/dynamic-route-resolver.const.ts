import { type ReactNode } from 'react';

import { getEnv } from '../shared/helpers/env';
import { tHtml } from '../shared/helpers/translate-html';

export const GET_REDIRECTS: () => { [avo1Path: string]: string } = () => ({
	'/frontpage': '/start',
	'/themas.*': '/zoeken',
	'/collecties': '/zoeken',
	'/content/beeldgeletterdheid': '/projecten/beeldgeletterdheid',
	'/content/501-werken-van-de-literaire-canon': '/projecten/501-werken-van-de-literaire-canon',
	'/content/actief-met-archief': '/projecten/actief-met-archief',
	'/content/cultuur-de-spiegel': '/projecten/cultuur-de-spiegel',
	'/user': '/instellingen/profiel',
	'/user/[0-9]+#media': '/werkruimte/collecties',
	'/user/[0-9]+/bundels#media': '/werkruimte/bundels',
	'/user/[0-9]+/watch_later#media': '/werkruimte/bladwijzers',
	'/user/[0-9]+/favourites#media': '/werkruimte/bladwijzers',
	'/cookieverklaring': '/cookiebeleid',
	'/privacyverklaring': '/privacy-voorwaarden',
	'/hulp#.*': '/hulp',
	'/faq': '/faq-lesgever',
	'/faq#.*': '/faq-lesgever',
	'/aanmelden-op-het-archief-voor-onderwijs-met-smartschool': '/faq-lesgever',
	'/aanmelden-op-het-archief-voor-onderwijs-met-klascement': '/faq-lesgever',
	'/wat-zijn-collecties': '/faq-lesgever?item=/faq-lesgever/wat-zijn-collecties',
	'/alles-over-collecties': '/faq-lesgever?item=/faq-lesgever/wat-zijn-collecties',
	'/barend-van-heusden-aan-het-woord-over-cultuur-de-spiegel':
		'/nieuws/barend-van-heusden-aan-het-woord-over-cultuur-de-spiegel',

	'/klaar.json': `${getEnv('PROXY_URL')}/klaar/klaar.json`,
	'/projecten/klaar': '/projecten/uitgeklaard',
	'/beheer': '/admin',
	'/leerlingen-toegang-geven': '/starten-met-de-leerlingenruimte',
});

export const GET_ERROR_MESSAGES: () => { [key: string]: ReactNode } = () => ({
	DEPUBLISHED_PAGINA: tHtml(
		'dynamic-route-resolver/dynamic-route-resolver___deze-pagina-is-niet-meer-beschikbaar'
	),
	PUPIL_ONLY: tHtml('deze pagina is enkel voor leerlingen'),
	NOT_FOR_PUPILS: tHtml('deze pagina is niet voor leerlingen'),
	OTHER_ROLES: tHtml('de pagina is voor gebruikers met andere rechten'),
	DEPUBLISHED_EVENT_DETAIL: tHtml(
		'dynamic-route-resolver/dynamic-route-resolver___dit-event-is-reeds-afgelopen-a-href-workshops-en-events-bekijk-al-onze-events-a'
	),
});
