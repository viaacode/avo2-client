import { Avo } from '@viaa/avo2-types';

import { ROUTE_PARTS } from '../shared/constants/routes';

import { SortOrder } from './search.types';

export const SEARCH_PATH = Object.freeze({
	SEARCH: `/${ROUTE_PARTS.search}`,
});

export const ITEMS_PER_PAGE = 10;

export const DEFAULT_FORM_STATE: Avo.Search.Filters = {
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
	serie: [],
	provider: [],
};

export const DEFAULT_SORT_ORDER: SortOrder = {
	orderProperty: 'relevance',
	orderDirection: 'desc',
};
