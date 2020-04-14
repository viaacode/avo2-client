import { TabProps } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { ROUTE_PARTS } from '../../shared/constants';
import i18n from '../../shared/translations/i18n';

import {
	ContentOverviewTableCols,
	ContentPageEditFormState,
	ContentPageType,
	ContentTableState,
	ContentWidth,
} from './content.types';

export const CONTENT_RESULT_PATH = {
	COUNT: 'app_content_aggregate',
	GET: 'data.app_content',
	INSERT: 'insert_app_content',
	UPDATE: 'update_app_content',
};

export const CONTENT_TYPES_LOOKUP_PATH = 'lookup_enum_content_types';

export const TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT: Partial<
	{
		[columnId in ContentOverviewTableCols]: (order: Avo.Search.OrderDirection) => any;
	}
> = {
	author: (order: Avo.Search.OrderDirection) => ({
		profile: { usersByuserId: { last_name: order } },
	}),
	role: (order: Avo.Search.OrderDirection) => ({
		profile: { usersByuserId: { first_name: order } },
	}),
};

export const CONTENT_PATH = {
	CONTENT: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.content}`,
	CONTENT_CREATE: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.content}/${ROUTE_PARTS.create}`,
	CONTENT_DETAIL: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.content}/:id`,
	CONTENT_EDIT: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.content}/:id/${ROUTE_PARTS.edit}`,
	PAGES: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.content}?content_type=PAGINA`,
	NEWS: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.content}?content_type=NIEUWS_ITEM`,
	FAQS: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.content}?content_type=FAQ_ITEM`,
	SCREENCASTS: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.content}?content_type=SCREENCAST`,
	PROJECTS: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.content}?content_type=PROJECT`,
	OVERVIEWS: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.content}?content_type=OVERZICHT`,
};

export const ITEMS_PER_PAGE = 10;

export const INITIAL_FILTER_FORM = (): ContentTableState => ({
	content_type: [],
	created_at: { gte: '', lte: '' },
	updated_at: { gte: '', lte: '' },
	publish_at: { gte: '', lte: '' },
	depublish_at: { gte: '', lte: '' },
	query: '',
	page: 0,
	sort_column: 'updated_at',
	sort_order: 'desc' as Avo.Search.OrderDirection,
});

export const INITIAL_CONTENT_OVERVIEW_STATE = () => ({
	filterForm: INITIAL_FILTER_FORM(),
});

export const INITIAL_CONTENT_FORM = (): ContentPageEditFormState => ({
	thumbnail_path: null,
	title: '',
	description: '',
	isProtected: false,
	path: '',
	contentType: '',
	contentWidth: ContentWidth.REGULAR,
	publishAt: '',
	depublishAt: '',
	userGroupIds: [],
	labels: [],
});

export const GET_CONTENT_DETAIL_TABS: () => TabProps[] = () => [
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

export const GET_CONTENT_WIDTH_OPTIONS = () => [
	{
		label: i18n.t('admin/content/content___kies-een-content-breedte'),
		value: '',
		disabled: true,
	},
	{ label: i18n.t('admin/content/content___max-1300-px'), value: 'REGULAR' },
	{ label: i18n.t('admin/content/content___breed-940-px'), value: 'LARGE' },
	{ label: i18n.t('admin/content/content___medium-720-px'), value: 'MEDIUM' },
];

export const DEFAULT_PAGES_WIDTH: { [key in ContentWidth]: string[] } = {
	[ContentWidth.REGULAR]: [ContentPageType.Project],
	[ContentWidth.LARGE]: [],
	[ContentWidth.MEDIUM]: [ContentPageType.NewsItem],
};
