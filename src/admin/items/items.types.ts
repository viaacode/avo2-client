import { type FilterableTableState } from '@meemoo/admin-core-ui/admin';
import { type Avo } from '@viaa/avo2-types';

import { type EmbedCodeExternalWebsite } from '../../embed-code/embed-code.types.js';
import { type ACTIONS_TABLE_COLUMN_ID } from '../../shared/helpers/table-column-list-to-csv-column-list.js';

export type PublishedStatus = 'published' | 'unpublished';

export type ItemsOverviewTableCols =
	| 'depublish_at'
	| 'description'
	| 'duration'
	| 'expiry_date'
	| 'external_id'
	| 'uid'
	| 'is_deleted'
	| 'is_published'
	| 'issued'
	| 'lom_classification'
	| 'lom_thema'
	| 'lom_context'
	| 'lom_intendedenduserrole'
	| 'lom_keywords'
	| 'lom_languages'
	| 'lom_typical_age_range'
	| 'organisation'
	| 'publish_at'
	| 'published_at'
	| 'series'
	| 'title'
	| 'type'
	| 'updated_at'
	| 'views'
	| 'in_collection'
	| 'bookmarks'
	| 'in_assignment'
	| 'quick_lane_links'
	| typeof ACTIONS_TABLE_COLUMN_ID;

export type UnpublishedItemsOverviewTableCols =
	| 'title'
	| 'pid'
	| 'updated_at'
	| 'status'
	| typeof ACTIONS_TABLE_COLUMN_ID;

export interface ItemsTableState extends FilterableTableState {
	depublish_at: string;
	description: string;
	duration: string;
	expiry_date: string;
	external_id: string;
	uid: string;
	is_deleted: boolean;
	is_published: PublishedStatus;
	issued: string;
	lom_classification: string[];
	lom_thema: string[];
	lom_context: string[];
	lom_intendedenduserrole: string[];
	lom_keywords: string[];
	lom_languages: string[];
	lom_typical_age_range: string[];
	organisation: string;
	publish_at: string;
	published_at: string;
	series: string;
	title: string;
	type: string;
	updated_at: string;
	views: number;
	in_collection: number;
	bookmarks: number;
	in_assignment: number;
	quick_lane_links: number;
}

export type UnpublishedStatus = 'NEW' | 'UPDATE' | 'OK' | null;

export interface UnpublishedItem {
	id: number;
	pid: string;
	title: string;
	updated_at: string;
	status: UnpublishedStatus;
	item_meta: Partial<Avo.Item.Item> | null;
}

export interface UnpublishedItemsTableState extends UnpublishedItem, FilterableTableState {}

export interface ItemUsedByEntry {
	createdAt: string;
	id: string;
	isPublic?: boolean;
	organisation: string | undefined;
	owner: string;
	title: string;
	type: 'COLLECTION' | 'ASSIGNMENT' | 'QUICK_LANE' | 'EMBED_CODE';
	externalWebsite?: EmbedCodeExternalWebsite;
}

export interface ItemUsedByResponse {
	collections: ItemUsedByEntry[];
	assignments: ItemUsedByEntry[];
	quickLanes: ItemUsedByEntry[];
	embedCodes: ItemUsedByEntry[];
}

export type ItemUsedByColumnId = keyof ItemUsedByEntry;
