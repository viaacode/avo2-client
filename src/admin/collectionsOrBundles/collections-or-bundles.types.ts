import { FilterableTableState } from '../shared/components/FilterTable/FilterTable';

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
	| 'education_levels'
	| 'actions';

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
	| 'organisation';

export type CollectionOrBundleActualisationOverviewTableCols =
	| CollectionsOrBundlesOverviewTableColsBase
	| 'actualisation_status'
	| 'actualisation_last_actualised_at'
	| 'actualisation_status_valid_until'
	| 'actualisation_approved_at'
	| 'actualisation_manager';

export type CollectionOrBundleQualityCheckOverviewTableCols =
	| CollectionsOrBundlesOverviewTableColsBase
	| 'quality_check_language_check'
	| 'quality_check_quality_check'
	| 'quality_check_approved_at';

export type CollectionOrBundleMarcomOverviewTableCols =
	| CollectionsOrBundlesOverviewTableColsBase
	| 'marcom_last_communication_channel_type'
	| 'marcom_last_communication_channel_name'
	| 'marcom_last_communication_at'
	| 'marcom_klascement';

export type CollectionTableCols =
	| CollectionsOrBundlesOverviewTableCols
	| CollectionOrBundleActualisationOverviewTableCols
	| CollectionOrBundleQualityCheckOverviewTableCols
	| CollectionOrBundleMarcomOverviewTableCols;

export type EditorialType = 'actualisation' | 'quality_check' | 'marcom';

export interface CollectionOrBundleTableStateBase extends FilterableTableState {
	title: string;
	author: string;
	author_user_group: string;
	last_updated_by_profile: string;
	created_at: string;
	updated_at: string;
	is_public: boolean;
	collection_labels: string[];
	subjects: string[];
	education_levels: string[];
	organisation: string[];
}

export interface CollectionsOrBundlesTableState extends CollectionOrBundleTableStateBase {
	views: number;
	bookmarks: number;
	copies: number;
	in_bundle: boolean;
	in_assignment: boolean;
	is_copy: boolean;
	quick_lane_links: number;
}

export interface CollectionOrBundleActualisationTableState
	extends CollectionOrBundleTableStateBase {
	actualisation_status: ManagementStatus;
	actualisation_last_actualised_at: string; // equals to updated_at of the collection_management entry
	actualisation_status_valid_until: string;
	actualisation_approved_at: string; // equal to created_at of the collection_management_QC table where qc_label === EINDCHECK
}

export interface CollectionOrBundleQualityCheckTableState extends CollectionOrBundleTableStateBase {
	quality_check_language_check: boolean | null;
	quality_check_quality_check: boolean | null;
	quality_check_approved_at: string;
}

export interface CollectionOrBundleMarcomTableState extends CollectionOrBundleTableStateBase {
	marcom_last_communication_medium: string;
	marcom_last_communication_at: string;
	marcom_klascement: boolean;
}

export type CollectionTableStates =
	| CollectionsOrBundlesTableState
	| CollectionOrBundleActualisationTableState
	| CollectionOrBundleQualityCheckTableState
	| CollectionOrBundleMarcomTableState;

export type CollectionBulkAction =
	| 'publish'
	| 'depublish'
	| 'delete'
	| 'change_author'
	| 'change_labels';

export type ManagementStatus = null | 'ACTUEEL' | 'ACTUALISEREN' | 'HERZIEN' | 'GEARCHIVEERD';

export type QualityCheckLabel = 'TAALCHECK' | 'KWALITEITSCHECK' | 'EINDCHECK';
