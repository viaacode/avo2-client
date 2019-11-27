import { ROUTE_PARTS } from '../../shared/constants';
import { TableColumn } from '../../shared/types';

export const CONTENT_PATH = {
	CONTENT: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.content}`,
	CONTENT_DETAIL: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.content}/:id`,
	CONTENT_CREATE: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.content}/${ROUTE_PARTS.create}`,
	CONTENT_EDIT: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.content}/:id/${ROUTE_PARTS.edit}`,
};

export const CONTENT_OVERVIEW_TABLE_COLS: TableColumn[] = [
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
