import { Avo } from '@viaa/avo2-types';

import { SEARCH_FILTER_STATE_SERIES_PROP } from '../shared/constants';

import { SortOrder } from './search.types';

export const ITEMS_PER_PAGE = 10;

export const DEFAULT_FILTER_STATE: Avo.Search.Filters = {
	query: '',
	type: [],
	educationLevel: [],
	domain: [],
	broadcastDate: {
		gte: '',
		lte: '',
	},
	language: [],
	keyword: [],
	subject: [],
	[SEARCH_FILTER_STATE_SERIES_PROP]: [],
	provider: [],
	collectionLabel: [],
};

export const DEFAULT_SORT_ORDER: SortOrder = {
	orderProperty: 'relevance',
	orderDirection: 'desc',
};

export const GET_SEARCH_ORDER_OPTIONS = (t: (key: string) => string) => [
	{ label: t('search/views/search___meest-relevant'), value: 'relevance_desc' },
	{ label: t('search/views/search___meest-bekeken'), value: 'views_desc' },
	{ label: t('search/views/search___uitzenddatum-aflopend'), value: 'broadcastDate_desc' },
	{ label: t('search/views/search___uitzenddatum-oplopend'), value: 'broadcastDate_asc' },
	{
		label: t('search/views/search___laatst-toegevoegd'),
		value: 'createdAt_desc',
	},
	{ label: t('search/views/search___laatst-gewijzigd'), value: 'updatedAt_desc' },
];
