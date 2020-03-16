import { Avo } from '@viaa/avo2-types';

import { DateRange } from '../../shared/components/DateRangeDropdown/DateRangeDropdown';
import { FilterableTableState } from '../shared/components/FilterTable/FilterTable';
import { ContentBlockConfig } from '../shared/types';

// Pages
export enum PageType {
	Create = 'create',
	Edit = 'edit',
}

export enum ContentPageType {
	NewsItem = 'NIEUWS_ITEM',
	FaqItem = 'FAQ_ITEM',
	Screencast = 'SCREENCAST',
	Page = 'PAGINA',
	Project = 'PROJECT',
	overview = 'OVERZICHT',
}

export enum ContentWidth {
	MEDIUM = 'MEDIUM',
	LARGE = 'LARGE',
	REGULAR = 'REGULAR',
}

// Content Overview
export type ContentOverviewTableCols =
	| 'title'
	| 'content_type'
	| 'author'
	| 'role'
	| 'publish_at'
	| 'depublish_at'
	| 'created_at'
	| 'updated_at'
	| 'actions';

export type DateRangeKeys = 'created_at' | 'updated_at' | 'publish_at' | 'depublish_at';
export type FilterRangeKeys = 'created_at' | 'updated_at' | 'publish_at' | 'depublish_at';
export type RangeFilters = {
	[key in FilterRangeKeys]?: { _gte?: string; _lte?: string };
};

export interface ContentTableState extends FilterableTableState {
	content_type: string[];
	created_at: DateRange;
	updated_at: DateRange;
	publish_at: DateRange;
	depublish_at: DateRange;
}

// Content Detail
export type ContentDetailParams = { id: string };

// Content Edit
export interface ContentEditFormState {
	title: string;
	description: string;
	isProtected: boolean;
	path: string;
	contentType: string;
	contentWidth: Avo.Content.ContentWidth;
	publishAt: string;
	depublishAt: string;
	userGroupIds: number[];
	labels: Partial<Avo.Content.ContentLabel>[];
}

export interface ContentEditState {
	readonly contentBlockConfigs: ContentBlockConfig[];
}

export type ContentEditFormErrors = Partial<{ [key in keyof ContentEditFormState]: string }>;

export enum ContentEditActionType {
	ADD_CONTENT_BLOCK_CONFIG = '@@admin-content-edit/ADD_CONTENT_BLOCK_CONFIG',
	REMOVE_CONTENT_BLOCK_CONFIG = '@@admin-content-edit/REMOVE_CONTENT_BLOCK_CONFIG',
	REORDER_CONTENT_BLOCK_CONFIG = '@@admin-content-edit/REORDER_CONTENT_BLOCK_CONFIG',
	SET_CONTENT_BLOCK_CONFIGS = '@@admin-content-edit/SET_CONTENT_BLOCK_CONFIGS',
	ADD_COMPONENTS_STATE = '@@admin-content-edit/ADD_COMPONENTS_STATE',
	SET_COMPONENTS_STATE = '@@admin-content-edit/SET_COMPONENTS_STATE',
	REMOVE_COMPONENTS_STATE = '@@admin-content-edit/REMOVE_COMPONENTS_STATE',
	SET_BLOCK_STATE = '@@admin-content-edit/SET_BLOCK_STATE',
}

export interface ContentEditAction {
	type: ContentEditActionType;
	payload: any;
}

export type DbContent = Avo.Content.Content & {
	content_content_labels: Avo.Content.ContentLabelLink[];
};
