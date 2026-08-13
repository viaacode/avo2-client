import { type FilterableTableState } from '@meemoo/admin-core-ui/admin';

import { type ACTIONS_TABLE_COLUMN_ID } from '../../shared/helpers/table-column-list-to-csv-column-list';
import { type NULL_FILTER } from '../shared/helpers/filters';

export enum CollectionBulkAction {
  PUBLISH = 'PUBLISH',
  DEPUBLISH = 'DEPUBLISH',
  DELETE = 'DELETE',
  CHANGE_AUTHOR = 'CHANGE_AUTHOR',
  CHANGE_LABELS = 'CHANGE_LABELS',
  EXPORT_ALL = 'EXPORT_ALL',
}

export type CollectionSortProps =
  | 'title'
  | 'owner_profile_id'
  | 'author_user_group'
  | 'last_updated_by_profile'
  | 'created_at'
  | 'updated_at'
  | 'is_public'
  | 'is_managed'
  | 'views'
  | 'bookmarks'
  | 'copies'
  | 'in_bundle'
  | 'in_assignment'
  | 'quick_lane_links'
  | 'contributors'
  | 'share_type'
  | 'share_type_order'
  | 'mgmt_current_status'
  | 'mgmt_updated_at'
  | 'mgmt_status_expires_at'
  | 'mgmt_last_eindcheck_date'
  | 'actualisation_manager'
  | 'mgmt_language_check'
  | 'mgmt_quality_check'
  | 'mgmt_eind_check_date'
  | 'marcom_last_communication_channel_type'
  | 'marcom_last_communication_channel_name'
  | 'marcom_last_communication_at'
  | 'marcom_klascement';

type CollectionsOrBundlesOverviewTableColsBase =
  | 'title'
  | 'owner_profile_id'
  | 'author_user_group'
  | 'last_updated_by_profile'
  | 'created_at'
  | 'updated_at'
  | 'is_public'
  | 'collection_labels'
  | 'subjects'
  | 'themas'
  | 'education_levels'
  | 'education_degrees'
  | typeof ACTIONS_TABLE_COLUMN_ID;

export type CollectionsOrBundlesOverviewTableCols =
  | CollectionsOrBundlesOverviewTableColsBase
  | 'is_managed'
  | 'views'
  | 'bookmarks'
  | 'copies'
  | 'in_bundle'
  | 'in_assignment'
  | 'quick_lane_links'
  | 'is_copy'
  | 'organisation'
  | 'contributors'
  | 'share_type'
  | 'share_type_order';

// A column id is also the url query param and the key the filter value is sent to the proxy under,
// so these have to match the keys of CollectionFilters in the proxy exactly. For the editorial
// overviews they are named after the columns of the db view the rows are selected from. Do not list
// alternative spellings here: two names for one column is what let the proxy and the client drift
// apart before (AVO-3477), which silently disabled the filters.
export type CollectionOrBundleActualisationOverviewTableCols =
  | CollectionsOrBundlesOverviewTableColsBase
  | 'mgmt_current_status'
  | 'mgmt_updated_at'
  | 'mgmt_status_expires_at'
  | 'mgmt_last_eindcheck_date'
  // The db view exposes this one as manager.profile_id
  | 'actualisation_manager';

export type CollectionOrBundleQualityCheckOverviewTableCols =
  | CollectionsOrBundlesOverviewTableColsBase
  | 'mgmt_language_check'
  | 'mgmt_quality_check'
  | 'mgmt_eind_check_date';

export type CollectionOrBundleMarcomOverviewTableCols =
  | CollectionsOrBundlesOverviewTableColsBase
  | 'marcom_last_communication_channel_type'
  | 'marcom_last_communication_channel_name'
  | 'marcom_last_communication_at'
  | 'marcom_klascement';

export type CollectionTableColumns =
  | CollectionsOrBundlesOverviewTableCols
  | CollectionOrBundleActualisationOverviewTableCols
  | CollectionOrBundleQualityCheckOverviewTableCols
  | CollectionOrBundleMarcomOverviewTableCols;

export enum EditorialType {
  GENERAL = 'general',
  ACTUALISATION = 'actualisation',
  QUALITY_CHECK = 'quality_check',
  MARCOM = 'marcom',
}

// The table state is filled by the filters of the FilterTable, so a property is typed after the
// filterType of its column, not after the data type of the column itself. Sent to the proxy as is,
// so the property names are the column ids and the value shapes are what CollectionFilters expects.
type BooleanFilterValue = ('true' | 'false' | typeof NULL_FILTER)[];
type DateRangeFilterValue = { gte?: string; lte?: string };

interface CollectionOrBundleTableStateBase extends FilterableTableState {
  owner_profile_id: string[];
  author_user_group: string[];
  created_at: DateRangeFilterValue;
  updated_at: DateRangeFilterValue;
  is_public: BooleanFilterValue;
  collection_labels: string[];
  subjects: string[];
  education_levels: string[];
  education_degrees: string[];
  organisation: string[];
}

export interface CollectionsOrBundlesTableState
  extends CollectionOrBundleTableStateBase {
  is_managed: BooleanFilterValue;
  is_copy: BooleanFilterValue;
}

export interface CollectionOrBundleActualisationTableState
  extends CollectionOrBundleTableStateBase {
  mgmt_current_status: ManagementStatus[];
  actualisation_manager: string[];
  mgmt_updated_at: DateRangeFilterValue; // equals to updated_at of the collection_management entry
  mgmt_status_expires_at: DateRangeFilterValue;
  mgmt_last_eindcheck_date: DateRangeFilterValue; // equal to created_at of the collection_management_QC table where qc_label === EINDCHECK
}

export interface CollectionOrBundleQualityCheckTableState
  extends CollectionOrBundleTableStateBase {
  mgmt_language_check: BooleanFilterValue;
  mgmt_quality_check: BooleanFilterValue;
}

export interface CollectionOrBundleMarcomTableState
  extends CollectionOrBundleTableStateBase {
  marcom_last_communication_channel_type: string[];
  marcom_last_communication_channel_name: string[];
  marcom_klascement: BooleanFilterValue;
}

export type CollectionTableStates =
  | CollectionsOrBundlesTableState
  | CollectionOrBundleActualisationTableState
  | CollectionOrBundleQualityCheckTableState
  | CollectionOrBundleMarcomTableState;

export type ManagementStatus =
  | null
  | 'ACTUEEL'
  | 'ACTUALISEREN'
  | 'HERZIEN'
  | 'GEARCHIVEERD';
