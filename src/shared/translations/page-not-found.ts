import { tText } from '../helpers/translate';

export function getPageNotFoundError(loggedIn: boolean): string {
	return loggedIn
		? tText('error/views/error-view___de-pagina-werd-niet-gevonden-ingelogd')
		: tText('error/views/error-view___de-pagina-werd-niet-gevonden-niet-ingelogd');
}
