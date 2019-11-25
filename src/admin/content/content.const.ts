import { ROUTE_PARTS } from '../../shared/constants';

export const CONTENT_PATH = {
	CONTENT: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.content}`,
};

export const CONTENT_OVERVIEW_TABLE_COLS = [
	{ id: 'title', label: 'Titel' },
	{ id: 'content_type', label: 'Content type' },
	{ id: 'author', label: 'Auteur' },
	{ id: 'role', label: 'Rol' },
	{ id: 'publish_at', label: 'Gepubliceerd' },
	{ id: 'depublish_at', label: 'Gedepubliceerd' },
	{ id: 'created_at', label: 'Aangemaakt' },
	{ id: 'updated_at', label: 'Laatst bewerkt' },
	{ id: 'actions', label: '' },
];
