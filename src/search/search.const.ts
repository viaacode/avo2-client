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
