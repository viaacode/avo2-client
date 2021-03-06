import { Avo } from '@viaa/avo2-types';

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
	serie: [],
	provider: [],
	collectionLabel: [],
};

export const DEFAULT_SORT_ORDER: SortOrder = {
	orderProperty: 'relevance',
	orderDirection: 'desc',
};
