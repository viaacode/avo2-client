import { Avo } from '@viaa/avo2-types';

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
