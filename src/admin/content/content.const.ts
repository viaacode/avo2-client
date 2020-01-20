import { TabProps } from '@viaa/avo2-components';

import { ROUTE_PARTS } from '../../shared/constants';
import i18n from '../../shared/translations/i18n';
import { TableColumn } from '../../shared/types';

import { ContentEditFormState } from './content.types';
import { fetchCollections, fetchContent, fetchItems, fetchStatic } from './helpers/content-types';

export const CONTENT_RESULT_PATH = {
	COUNT: 'app_content_aggregate',
	GET: 'app_content',
	INSERT: 'insert_app_content',
	UPDATE: 'update_app_content',
};

export const CONTENT_TYPES_LOOKUP_PATH = 'lookup_enum_content_types';

export const CONTENT_PATH = {
	CONTENT: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.content}`,
	CONTENT_CREATE: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.content}/${ROUTE_PARTS.create}`,
	CONTENT_DETAIL: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.content}/:id`,
	CONTENT_EDIT: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.content}/:id/${ROUTE_PARTS.edit}`,
};

export const ITEMS_PER_PAGE = 10;

export const CONTENT_OVERVIEW_TABLE_COLS: TableColumn[] = [
	{ id: 'title', label: i18n.t('admin/content/content___titel') },
	{ id: 'content_type', label: i18n.t('admin/content/content___content-type') },
	{ id: 'author', label: i18n.t('admin/content/content___auteur') },
	{ id: 'role', label: i18n.t('admin/content/content___rol') },
	{ id: 'publish_at', label: i18n.t('admin/content/content___publicatiedatum'), sortable: true },
	{
		id: 'depublish_at',
		label: i18n.t('admin/content/content___depublicatiedatum'),
		sortable: true,
	},
	{ id: 'created_at', label: i18n.t('admin/content/content___aangemaakt'), sortable: true },
	{ id: 'updated_at', label: i18n.t('admin/content/content___laatst-bewerkt'), sortable: true },
	{ id: 'actions', label: '' },
];

export const INITIAL_CONTENT_FORM = (): ContentEditFormState => ({
	title: '',
	description: '',
	isProtected: false,
	path: '',
	contentType: '',
	publishAt: '',
	depublishAt: '',
});

export const CONTENT_DETAIL_TABS: TabProps[] = [
	{
		id: 'inhoud',
		label: i18n.t('admin/content/content___inhoud'),
		icon: 'layout',
	},
	{
		id: 'metadata',
		label: i18n.t('admin/content/content___metadata'),
		icon: 'file-text',
	},
];

export const CONTENT_TYPES = [
	{
		value: 'content',
		label: i18n.t('admin/content/content___content'),
		disabled: false,
		fetch: fetchContent,
	},
	{
		value: 'static',
		label: i18n.t('admin/content/content___statisch'),
		disabled: false,
		fetch: fetchStatic,
	},
	{
		value: 'collection',
		label: i18n.t('admin/content/content___collecties'),
		disabled: false,
		fetch: fetchCollections,
	},
	{
		value: 'item',
		label: i18n.t('admin/content/content___items'),
		disabled: false,
		fetch: fetchItems,
	},
];
