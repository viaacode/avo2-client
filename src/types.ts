// TODO use interface from avo2-types package

export interface Filters {
	query: string;
	type: ContentType[];
	educationLevel: string[];
	domain: string[];
	broadcastDate: DateRange;
	language: string[];
	keyword: string[];
	subject: string[]; // Vak
	serie: string[];
	provider: string[];
}

export type ContentType = 'collection' | 'video' | 'audio';

export interface DateRange {
	gte: string | '' | null | undefined;
	lte: string | '' | null | undefined;
}

export interface FilterOptionSearch {
	type: ContentType;
	educationLevel: string;
	domain: string;
	language: string;
	keyword: string;
	subject: string; // Vak
	serie: string;
	provider: string;
}

export interface SearchRequest {
	filters?: Partial<Filters>;
	filterOptionSearch?: Partial<FilterOptionSearch>;
	orderProperty?: SearchOrderProperty;
	orderDirection?: SearchOrderDirection;
	from: number;
	size: number;
}

export interface SearchResponse {
	results: SearchResultItem[];
	count: number;
	aggregations: FilterOptions;
}

export interface SearchResultItem {
	pid: string;
	table_name: string;
	dc_title: string;
	dc_titles_serie: string;
	thumbnail_path: string;
	original_cp: string;
	original_cp_id: string;
	lom_context: string[];
	lom_keywords: string[];
	lom_languages: string[];
	dcterms_issued: string;
	dcterms_abstract: string;
	lom_classification: string[];
	lom_typical_age_range: string[];
	lom_intended_enduser_role: string[];
	algemeen_briefing_id: string[];
	fragment_duration_time: null;
	fragment_duration_seconds: number;
	administrative_type: ContentType;
	administrative_external_id: string;
}

export interface OptionProp {
	option_name: string;
	option_count: number;
}

export interface FilterOptions {
	[prop: string]: OptionProp[];
}

export type SearchOrderProperty =
	| 'relevance'
	| 'views'
	| 'broadcastDate'
	| 'addedDate'
	| 'editDate';

export type SearchOrderDirection = 'asc' | 'desc';
