// TODO use interface from avo2-types package

export interface Filters {
	query: string;
	'administrative_type.filter': string[]; //    Type
	'lom_typical_age_range.filter': string[]; //  Onderwijs niveau
	'lom_context.filter': string[]; //            Domein
	dcterms_issued: {
		// Uitzenddatum
		gte: string;
		lte: string;
	};
	lom_languages: string[]; //          Taal
	'lom_keywords.filter': string[]; //           Onderwerp
	'lom_classification.filter': string[]; //     Vak
	'dc_titles_serie.filter': string[]; //        Serie
	fragment_duration_seconds: {
		// Duur
		gte: string | number; // String on the client, but converted to number when sent to backend
		lte: string | number; // String on the client, but converted to number when sent to backend
	};
	'original_cp.filter': string[]; //            Aanbieder
}

export interface SearchRequest {
	// Used on client to verify request structure
	filters?: Partial<Filters>;
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
	administrative_type: string;
	administrative_external_id: string;
}

export interface OptionProp {
	option_name: string;
	option_count: number;
}

export interface FilterOptions {
	[prop: string]: OptionProp[];
}
