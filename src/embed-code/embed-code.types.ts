import {
  AvoAssignmentAssignment,
  AvoCollectionCollection,
  AvoContentTypeEnglish,
  AvoItemItem,
  AvoSearchOrderDirection,
  AvoUserCommonUser,
} from '@viaa/avo2-types';
import type { TableColumnDataType } from '../shared/types/table-column-data-type';

export enum EmbedCodeContentType {
  item = 'ITEM',
  collection = 'COLLECTION',
  assignment = 'ASSIGNMENT',
}

export const EMBED_CONTENT_TYPE_TO_ENGLISH_CONTENT_TYPE: Record<
  EmbedCodeContentType,
  AvoContentTypeEnglish
> = {
  ITEM: AvoContentTypeEnglish.ITEM,
  COLLECTION: AvoContentTypeEnglish.COLLECTION,
  ASSIGNMENT: AvoContentTypeEnglish.ASSIGNMENT,
};

export interface EmbedCode {
  id: string;
  title: string;
  externalWebsite: EmbedCodeExternalWebsite;
  contentType: EmbedCodeContentType;
  contentId: string;
  content: AvoItemItem | AvoCollectionCollection | AvoAssignmentAssignment;
  descriptionType: EmbedCodeDescriptionType;
  description: string | null;
  owner: AvoUserCommonUser;
  ownerProfileId: string;
  start: number | null;
  end: number | null;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
  thumbnailPath: string;
  contentIsReplaced: boolean;
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
  sortOrder: AvoSearchOrderDirection;
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
  sort_order?: AvoSearchOrderDirection;
}
