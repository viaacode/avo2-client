import { Avo } from '@viaa/avo2-types';
import { SearchFilters } from '@viaa/avo2-types/types/search';

import { SortOrder } from './search.types';

export const ITEMS_PER_PAGE = 10;

export enum SearchFilter {
	query = 'query',
	type = 'type',
	educationLevel = 'educationLevel',
	domain = 'domain',
	broadcastDate = 'broadcastDate',
	language = 'language',
	keyword = 'keyword',
	subject = 'subject',
	serie = 'serie',
	provider = 'provider',
	collectionLabel = 'collectionLabel',
}

export const ALL_SEARCH_FILTERS: (keyof SearchFilters)[] = [
	SearchFilter.query,
	SearchFilter.type,
	SearchFilter.educationLevel,
	SearchFilter.domain,
	SearchFilter.broadcastDate,
	SearchFilter.language,
	SearchFilter.keyword,
	SearchFilter.subject,
	SearchFilter.serie,
	SearchFilter.provider,
	SearchFilter.collectionLabel,
];

export enum OrderDirection {
	asc = 'asc',
	desc = 'desc',
}

export const DEFAULT_FILTER_STATE: Avo.Search.Filters = {
	[SearchFilter.query]: '',
	[SearchFilter.type]: [],
	[SearchFilter.educationLevel]: [],
	[SearchFilter.domain]: [],
	[SearchFilter.broadcastDate]: {
		gte: '',
		lte: '',
	},
	[SearchFilter.language]: [],
	[SearchFilter.keyword]: [],
	[SearchFilter.subject]: [],
	[SearchFilter.serie]: [],
	[SearchFilter.provider]: [],
	[SearchFilter.collectionLabel]: [],
};

export const DEFAULT_SORT_ORDER: SortOrder = {
	orderProperty: 'relevance',
	orderDirection: 'desc',
};

export const GET_SEARCH_ORDER_OPTIONS = (
	t: (key: string) => string
): { label: string; value: string }[] => [
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
