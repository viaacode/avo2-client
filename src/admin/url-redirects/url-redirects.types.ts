import { AvoSearchOrderDirection } from '@viaa/avo2-types';
import type { DateRange } from '../../shared/components/DateRangeDropdown/DateRangeDropdown';
import { type ACTIONS_TABLE_COLUMN_ID } from '../../shared/helpers/table-column-list-to-csv-column-list';

export enum UrlRedirectPathPattern {
  PLAIN_TEXT = 'PLAIN_TEXT',
  REGEX = 'REGEX',
}

export type UrlRedirectOverviewTableCols =
  | 'oldPath'
  | 'oldPathPattern'
  | 'newPath'
  | 'createdAt'
  | 'updatedAt'
  | typeof ACTIONS_TABLE_COLUMN_ID;

export interface UrlRedirectEditFormErrorState {
  old_path?: string;
  new_path?: string;
  oldPathPattern?: UrlRedirectPathPattern;
}

export type UrlRedirect = {
  id: number;
  oldPath: string;
  newPath: string;
  createdAt: string;
  updatedAt: string;
  oldPathPattern: UrlRedirectPathPattern;
};

export interface UrlRedirectFilters {
  query?: string;
  sortColumn?: string;
  sortOrder?: AvoSearchOrderDirection;
  limit: number;
  offset: number;
  created_at?: DateRange;
  updated_at?: DateRange;
  old_path_pattern?: UrlRedirectPathPattern[];
}

export interface UrlRedirectOverviewFilterState {
  columns: any[];
  page: number;
  query?: string;
  sort_column?: string;
  sort_order?: AvoSearchOrderDirection;
  createdAt?: DateRange;
  updatedAt?: DateRange;
  oldPathPattern?: UrlRedirectPathPattern[];
}
