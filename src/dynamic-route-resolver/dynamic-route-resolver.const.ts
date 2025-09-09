import { type ReactNode } from 'react';

import { tHtml } from '../shared/helpers/translate-html';

export const GET_ERROR_MESSAGES: () => { [key: string]: ReactNode } = () => ({
	DEPUBLISHED_PAGINA: tHtml(
		'dynamic-route-resolver/dynamic-route-resolver___deze-pagina-is-niet-meer-beschikbaar'
	),
	DEPUBLISHED_EVENT_DETAIL: tHtml(
		'dynamic-route-resolver/dynamic-route-resolver___dit-event-is-reeds-afgelopen-a-href-workshops-en-events-bekijk-al-onze-events-a'
	),
});
