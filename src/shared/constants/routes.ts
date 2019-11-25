import { Avo } from '@viaa/avo2-types';

export const ROUTE_PARTS = Object.freeze({
	admin: 'beheer',
	assignment: 'opdracht',
	assignments: 'opdrachten',
	bookmarks: 'bladwijzers',
	collection: 'collectie',
	collections: 'collecties',
	create: 'maak',
	detail: 'detail',
	discover: 'ontdek',
	edit: 'bewerk',
	folder: 'map',
	folders: 'mappen',
	item: 'item',
	loginAvo: 'login-avo',
	logout: 'afmelden',
	menu: 'navigatie',
	news: 'nieuws',
	projects: 'projecten',
	register: 'registreren',
	registerOrLogin: 'registreer-of-login',
	pupilOrTeacher: 'leerling-of-leerkracht',
	stamboek: 'stamboek',
	manualAccessRequest: 'manuele-toegangsaanvraag',
	responses: 'indieningen',
	search: 'zoeken',
	searchQuery: 'zoekopdracht',
	workspace: 'mijn-werkruimte',
});

export const CONTENT_TYPE_TO_ROUTE: { [contentType in Avo.Core.ContentType]: string } = {
	video: ROUTE_PARTS.item,
	audio: ROUTE_PARTS.item,
	collectie: ROUTE_PARTS.collection,
	bundel: ROUTE_PARTS.folder,
};
