import { ROUTE_PARTS } from '../../shared/constants';
import { TableColumn } from '../../shared/types';
import { ContentEditFormState } from './content.types';

export const CONTENT_RESULT_PATH = {
	GET: 'app_content',
	INSERT: 'insert_app_content',
	UPDATE: 'update_app_content',
};

export const CONTENT_PATH = {
	CONTENT: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.content}`,
	CONTENT_CREATE: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.content}/${ROUTE_PARTS.create}`,
	CONTENT_DETAIL: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.content}/:id`,
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

export const INITIAL_CONTENT_FORM = (): ContentEditFormState => ({
	title: '',
	description: '',
	contentType: '',
	publishAt: '',
	depublishAt: '',
});
