import type { Avo } from '@viaa/avo2-types';

import type { TableColumnDataType } from '../shared/types/table-column-data-type';

export type EmbedCodeContentType = 'ITEM' | 'COLLECTION' | 'ASSIGNMENT';

export interface EmbedCode {
	id: string;
	title: string;
	externalWebsite: EmbedCodeExternalWebsite;
	contentType: EmbedCodeContentType;
	contentId: string;
	content: Avo.Item.Item | Avo.Collection.Collection | Avo.Assignment.Assignment;
	descriptionType: EmbedCodeDescriptionType;
	description: string | null;
	owner: Avo.User.CommonUser;
	ownerProfileId: string;
	start: number | null;
	end: number | null;
	createdAt: string; // ISO datetime string
	updatedAt: string; // ISO datetime string
	thumbnailPath: string;
}

export enum EmbedCodeExternalWebsite {
	SMARTSCHOOL = 'SMARTSCHOOL',
	BOOKWIDGETS = 'BOOKWIDGETS',
}

export enum EmbedCodeDescriptionType {
	ORIGINAL = 'ORIGINAL',
	CUSTOM = 'CUSTOM',
	NONE = 'NONE',
}
export type EmbedCodeOverviewTableColumns =
	| 'thumbnail'
	| 'title'
	| 'createdAt'
	| 'updatedAt'
	| 'start'
	| 'externalWebsite'
	| 'action';

export const EMBED_CODE_DEFAULTS = {
	sort_column: 'updated_at',
	sort_order: 'desc',
};

export interface FetchEmbedCodeParams {
	sortColumn: EmbedCodeOverviewTableColumns;
	sortOrder: Avo.Search.OrderDirection;
	tableColumnDataType: TableColumnDataType;
	offset: number;
	limit?: number | null;
	filterString?: string;
}

export interface EmbedCodeOverviewFilterState {
	columns: any[];
	page: number;
	query?: string;
	sort_column?: string;
	sort_order?: Avo.Search.OrderDirection;
}
