import { type FilterableTableState } from '@meemoo/admin-core-ui/admin';

import { type ACTIONS_TABLE_COLUMN_ID } from '../../shared/helpers/table-column-list-to-csv-column-list';

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
	| 'actualisation_status'
	| 'actualisation_last_actualised_at'
	| 'actualisation_status_valid_until'
	| 'actualisation_approved_at'
	| 'actualisation_manager'
	| 'quality_check_language_check'
	| 'quality_check_quality_check'
	| 'quality_check_approved_at'
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

export type CollectionOrBundleActualisationOverviewTableCols =
	| CollectionsOrBundlesOverviewTableColsBase

	// Some views in the db use mgmt_current_status, the tables use actualisation_status
	| 'mgmt_current_status'
	| 'actualisation_status'

	// Some views in the db use mgmt_updated_at, the tables use actualisation_last_actualised_at
	| 'mgmt_updated_at'
	| 'actualisation_last_actualised_at'

	// Some views in the db use mgmt_status_expires_at, the tables use actualisation_status_valid_until
	| 'mgmt_status_expires_at'
	| 'actualisation_status_valid_until'

	// Some views in the db use mgmt_last_eindcheck_date, the tables use actualisation_approved_at
	| 'mgmt_last_eindcheck_date'
	| 'actualisation_approved_at'

	// Some views in the db use manager.profile_id, the tables use actualisation_manager
	| 'actualisation_manager';

export type CollectionOrBundleQualityCheckOverviewTableCols =
	| CollectionsOrBundlesOverviewTableColsBase

	// Some views in the db use mgmt_language_check, the tables use quality_check_language_check
	| 'mgmt_language_check'
	| 'quality_check_language_check'

	// Some views in the db use mgmt_quality_check, the tables use quality_check_quality_check
	| 'mgmt_quality_check'
	| 'quality_check_quality_check'

	// Some views in the db use mgmt_eind_check_date, the tables use quality_check_approved_at
	| 'mgmt_eind_check_date'
	| 'quality_check_approved_at';

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

interface CollectionOrBundleTableStateBase extends FilterableTableState {
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
	education_degrees: string[];
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
	marcom_last_communication_channel_type: string[];
	marcom_last_communication_at: string;
	marcom_last_communication_channel_name: string[];
	marcom_klascement: boolean;
}

export type CollectionTableStates =
	| CollectionsOrBundlesTableState
	| CollectionOrBundleActualisationTableState
	| CollectionOrBundleQualityCheckTableState
	| CollectionOrBundleMarcomTableState;

export type ManagementStatus = null | 'ACTUEEL' | 'ACTUALISEREN' | 'HERZIEN' | 'GEARCHIVEERD';
