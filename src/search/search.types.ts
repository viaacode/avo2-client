import { type Avo } from '@viaa/avo2-types';
import { type ReactNode } from 'react';
import { type UrlUpdateType } from 'use-query-params';

import { type CollectionLabelLookup, type QualityLabel } from '../collection/collection.types';
import { type BookmarkStatusLookup } from '../shared/services/bookmarks-views-plays-service/bookmarks-views-plays-service.types';

import { type SearchOrderAndDirectionProperty, type SearchOrderProperty } from './search.const';

export type SearchFilterFieldValues = string | string[] | Avo.Search.DateRange | null;
export type SearchFilterMultiOptions = { [key: string]: Avo.Search.OptionProp[] };

export interface SearchState {
	readonly data: Avo.Search.Search | null;
	readonly loading: boolean;
	readonly error: any | null;
}

interface RenderLinks {
	renderDetailLink: (
		linkText: string | ReactNode,
		id: string,
		type: Avo.Core.ContentType
	) => ReactNode;
	renderSearchLink: (
		linkText: string | ReactNode,
		newFilters: FilterState,
		className?: string
	) => ReactNode;
}

export interface SearchFiltersAndResultsProps extends RenderLinks {
	enabledFilters?: (keyof Avo.Search.Filters)[];
	enabledTypeOptions?: Avo.Core.ContentType[];
	enabledOrderProperties?: SearchOrderAndDirectionProperty[];
	bookmarks: boolean;
	filterState: FilterState;
	setFilterState: (state: FilterState, urlPushType?: UrlUpdateType) => void;
}

export interface SortOrder {
	orderProperty: Avo.Search.OrderProperty;
	orderDirection: Avo.Search.OrderDirection;
}

export interface FilterState {
	filters?: Partial<Avo.Search.Filters>;
	orderProperty?: SearchOrderProperty;
	orderDirection?: Avo.Search.OrderDirection;
	page?: number;
}

export interface SearchFilterControlsProps {
	filterState: Partial<Avo.Search.Filters>;
	handleFilterFieldChange: (
		values: SearchFilterFieldValues,
		propertyName: Avo.Search.FilterProp
	) => void;
	multiOptions: SearchFilterMultiOptions;
	onSearch?: (aggId: string) => void;
	enabledFilters?: (keyof Avo.Search.Filters)[];
	collectionLabels: QualityLabel[];
}

interface SearchResultItemHandlers extends RenderLinks {
	handleBookmarkToggle: (uuid: string, active: boolean) => void;
	handleTagClicked?: (id: string) => void;
}

export interface SearchResultItemProps extends SearchResultItemHandlers, RenderLinks {
	id: string;
	result: Avo.Search.ResultItem;
	qualityLabelLookup: CollectionLabelLookup;
	isBookmarked: boolean | null;
	bookmarkButton: boolean;
}

export interface SearchResultsProps extends SearchResultItemHandlers {
	loading: boolean;
	data: Avo.Search.Search | null;
	currentItemIndex: number;
	totalItemCount: number;
	setCurrentItemIndex: (newCurrentItemIndex: number) => void;
	bookmarkStatuses: BookmarkStatusLookup | null;
	navigateUserRequestForm: () => void;
	bookmarkButtons: boolean;
	qualityLabels: QualityLabel[];
}
