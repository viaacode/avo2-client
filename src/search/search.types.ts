import {
  AvoCoreContentType,
  AvoSearchDateRange,
  AvoSearchFilterProp,
  AvoSearchFilters,
  AvoSearchOptionProp,
  AvoSearchOrderDirection,
  AvoSearchOrderProperty,
  AvoSearchResultItem,
  AvoSearchSearch,
} from '@viaa/avo2-types';

import { type ReactNode } from 'react';
import {
  type CollectionLabelLookup,
  type QualityLabel,
} from '../collection/collection.types';
import { type BookmarkStatusLookup } from '../shared/services/bookmarks-views-plays-service/bookmarks-views-plays-service.types';
import { UrlUpdateType } from '../shared/types/use-query-params.ts';
import {
  type SearchOrderAndDirectionProperty,
  type SearchOrderProperty,
} from './search.const';

export type SearchFilterFieldValues =
  | string
  | string[]
  | AvoSearchDateRange
  | null;
export type SearchFilterMultiOptions = {
  [key: string]: AvoSearchOptionProp[];
};

export interface SearchState {
  readonly data: AvoSearchSearch | null;
  readonly loading: boolean;
  readonly error: any | null;
}

interface RenderLinks {
  renderDetailLink: (
    linkText: string | ReactNode,
    id: string,
    type: AvoCoreContentType,
  ) => ReactNode;
  renderSearchLink: (
    linkText: string | ReactNode,
    newFilters: FilterState,
    className?: string,
  ) => ReactNode;
}

export interface SearchFiltersAndResultsProps extends RenderLinks {
  enabledFilters?: (keyof AvoSearchFilters)[];
  enabledTypeOptions?: AvoCoreContentType[];
  enabledOrderProperties?: SearchOrderAndDirectionProperty[];
  bookmarks: boolean;
  filterState: FilterState;
  setFilterState: (state: FilterState, urlPushType?: UrlUpdateType) => void;
}

export interface SortOrder {
  orderProperty: AvoSearchOrderProperty;
  orderDirection: AvoSearchOrderDirection;
}

export interface FilterState {
  filters?: Partial<AvoSearchFilters>;
  orderProperty?: SearchOrderProperty | undefined | null;
  orderDirection?: AvoSearchOrderDirection | undefined | null;
  page?: number;
}

export interface SearchFilterControlsProps {
  filterState: Partial<AvoSearchFilters>;
  handleFilterFieldChange: (
    values: SearchFilterFieldValues,
    propertyName: AvoSearchFilterProp,
  ) => void;
  multiOptions: SearchFilterMultiOptions;
  onSearch?: (aggId: string) => void;
  enabledFilters?: (keyof AvoSearchFilters)[];
  collectionLabels: QualityLabel[];
}

interface SearchResultItemHandlers extends RenderLinks {
  handleBookmarkToggle: (uuid: string, active: boolean) => void;
  handleTagClicked?: (id: string) => void;
}

export interface SearchResultItemProps
  extends SearchResultItemHandlers,
    RenderLinks {
  id: string;
  result: AvoSearchResultItem;
  qualityLabelLookup: CollectionLabelLookup;
  isBookmarked: boolean | null;
  bookmarkButton: boolean;
}

export interface SearchResultsProps extends SearchResultItemHandlers {
  loading: boolean;
  data: AvoSearchSearch | null;
  currentItemIndex: number;
  totalItemCount: number;
  setCurrentItemIndex: (newCurrentItemIndex: number) => void;
  bookmarkStatuses: BookmarkStatusLookup | null;
  navigateUserRequestForm: () => void;
  bookmarkButtons: boolean;
  qualityLabels: QualityLabel[];
}
