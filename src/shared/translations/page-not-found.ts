import { ReactNode } from 'react';

import { tHtml } from '../helpers/translate';

export function getPageNotFoundError(loggedIn: boolean): ReactNode {
	return loggedIn
		? tHtml('error/views/error-view___de-pagina-werd-niet-gevonden-ingelogd')
		: tHtml('error/views/error-view___de-pagina-werd-niet-gevonden-niet-ingelogd');
}
