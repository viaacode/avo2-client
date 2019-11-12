import { Avo } from '@viaa/avo2-types';
import { RouteComponentProps } from 'react-router';
import { Dispatch } from 'redux';

export type SearchFilterFieldValues = string | string[] | Avo.Search.DateRange | null;
export type SearchFilterMultiOptions = { [key: string]: Avo.Search.OptionProp[] };

export interface SearchProps extends RouteComponentProps {
	searchResults: Avo.Search.Search | null;
	searchResultsLoading: boolean;
	search: (
		orderProperty: Avo.Search.OrderProperty,
		orderDirection: Avo.Search.OrderDirection,
		from: number,
		size: number,
		filters?: Partial<Avo.Search.Filters>,
		filterOptionSearch?: Partial<Avo.Search.FilterOption>
	) => Dispatch;
}

export interface SortOrder {
	orderProperty: Avo.Search.OrderProperty;
	orderDirection: Avo.Search.OrderDirection;
}

export interface SearchResults {
	count: number;
	items: Avo.Search.ResultItem[];
}

interface SearchResultItemHandlers {
	handleBookmarkToggle: (id: string, active: boolean) => void;
	handleOriginalCpLinkClicked: (id: string, cp: string) => void;
}

export interface SearchResultItemProps extends SearchResultItemHandlers {
	result: Avo.Search.ResultItem;
}

export interface SearchResultsProps extends SearchResultItemHandlers {
	currentPage: number;
	loading: boolean;
	pageCount: number;
	data: Avo.Search.Search | null;
	setPage: (page: number) => void;
}

export interface SearchFilterControlsProps {
	formState: Avo.Search.Filters;
	handleFilterFieldChange: (
		values: SearchFilterFieldValues,
		propertyName: Avo.Search.FilterProp
	) => void;
	multiOptions: SearchFilterMultiOptions;
}
