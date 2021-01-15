import i18n from './i18n';

export function getPageNotFoundError(loggedIn: boolean): string {
	return loggedIn
		? i18n.t('error/views/error-view___de-pagina-werd-niet-gevonden-ingelogd')
		: i18n.t('error/views/error-view___de-pagina-werd-niet-gevonden-niet-ingelogd');
}
