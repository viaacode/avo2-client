import { ContentType } from './searchTypes';

// TODO ge  extend this with fields from graphql like views and bookmarks
export interface DetailResponse {
	id: string;
	external_id?: string;
	administrative_external_id?: string;
	pid?: string;
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
	briefing_id: string[];
	duration_time: string;
	duration_seconds: number;
	administrative_type: ContentType;
}
