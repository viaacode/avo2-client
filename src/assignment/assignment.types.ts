import { TableColumn } from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';

import { FilterState } from '../search/search.types';
import {
	GetAssignmentBlocksQuery,
	GetAssignmentByUuidQuery,
	GetAssignmentLabelsByProfileIdQuery,
	GetAssignmentResponseByIdQuery,
	GetAssignmentResponsesByAssignmentIdQuery,
	GetAssignmentsAdminOverviewQuery,
	GetAssignmentsByOwnerQuery,
	GetAssignmentsByResponseOwnerIdQuery,
	GetAssignmentWithResponseQuery,
	Lookup_Enum_Colors_Enum,
	UpdateAssignmentBlockMutation,
} from '../shared/generated/graphql-db-types';

import { AssignmentBlockItemDescriptionType } from './components/AssignmentBlockDescriptionButtons';

export type Assignment_v2_With_Blocks = Exclude<
	GetAssignmentByUuidQuery['app_assignments_v2_overview'][0],
	undefined | null
>;

export type Assignment_v2_With_Responses = Exclude<
	GetAssignmentWithResponseQuery['app_assignments_v2_overview'][0],
	undefined | null
>;

export type Assignment_v2_With_Labels = Exclude<
	| GetAssignmentByUuidQuery['app_assignments_v2_overview'][0]
	| GetAssignmentsByOwnerQuery['app_assignments_v2_overview'][0]
	| GetAssignmentsByResponseOwnerIdQuery['app_assignments_v2_overview'][0]
	| GetAssignmentWithResponseQuery['app_assignments_v2_overview'][0],
	undefined | null
>;

export type Assignment_v2 = Exclude<
	| GetAssignmentsByOwnerQuery['app_assignments_v2_overview'][0]
	| GetAssignmentsByResponseOwnerIdQuery['app_assignments_v2_overview'][0]
	| GetAssignmentsAdminOverviewQuery['app_assignments_v2_overview'][0]
	| GetAssignmentWithResponseQuery['app_assignments_v2_overview'][0]
	| GetAssignmentByUuidQuery['app_assignments_v2_overview'][0],
	undefined | null
>;

export type Assignment_Response_v2 = Exclude<
	| GetAssignmentWithResponseQuery['app_assignments_v2_overview'][0]['responses'][0]
	| GetAssignmentResponsesByAssignmentIdQuery['app_assignment_responses_v2'][0]
	| GetAssignmentResponseByIdQuery['app_assignment_responses_v2'][0],
	undefined | null
>;

export type AssignmentResponseInfo = Omit<Assignment_Response_v2, 'pupil_collection_blocks'> & {
	pupil_collection_blocks: BaseBlockWithMeta[];
};

export type AssignmentBlock = Exclude<
	| GetAssignmentBlocksQuery['app_assignment_blocks_v2'][0]
	| GetAssignmentByUuidQuery['app_assignments_v2_overview'][0]['blocks'][0]
	| UpdateAssignmentBlockMutation['update_app_assignment_blocks_v2_by_pk'],
	undefined | null
>;

export type PupilCollectionFragment = Exclude<
	GetAssignmentResponseByIdQuery['app_assignment_responses_v2'][0]['pupil_collection_blocks'][0],
	undefined | null
>;

type EditableBlockFields = {
	ownTitle?: string;
	ownDescription?: string;
	noTitle?: string;
	editMode?: AssignmentBlockItemDescriptionType;
};

export type EditablePupilCollectionFragment = PupilCollectionFragment & EditableBlockFields;

export type BaseBlockWithMeta = (PupilCollectionFragment | AssignmentBlock) &
	Pick<Avo.Core.BlockItemBase, 'item_meta'> & { type: string };

export type Assignment_Label_v2 = Exclude<
	GetAssignmentLabelsByProfileIdQuery['app_assignment_labels_v2'][0],
	undefined | null
>;

export type AssignmentOverviewTableColumns =
	| 'title'
	| 'author'
	| 'created_at'
	| 'updated_at'
	| 'deadline_at'
	| 'status'
	| 'responses'
	| 'views'
	| 'actions'
	| 'share_type';

export type AssignmentResponseTableColumns =
	| 'pupil'
	| 'collection_title'
	| 'pupil_collection_block_count'
	| 'updated_at'
	| 'actions';

export interface AssignmentColumn extends TableColumn {
	id: AssignmentOverviewTableColumns;
	label: string;
	sortable?: boolean;
}

export interface AssignmentResponseColumn extends TableColumn {
	id: AssignmentResponseTableColumns;
	label: string;
	sortable?: boolean;
}

export enum AssignmentType {
	ZOEK = 'ZOEK',
	KIJK = 'KIJK',
	BOUW = 'BOUW',
}

export enum AssignmentBlockType {
	TEXT = 'TEXT',
	ITEM = 'ITEM',
	ZOEK = 'ZOEK',
	BOUW = 'BOUW',
}

export enum AssignmentView {
	ACTIVE = 'assignments',
	FINISHED = 'finished_assignments',
}

export enum AssignmentLayout {
	PlayerAndText = 0,
	OnlyPlayer = 1,
}

export enum AssignmentRetrieveError {
	DELETED = 'DELETED',
	NOT_YET_AVAILABLE = 'NOT_YET_AVAILABLE',
}

export enum AssignmentShareType {
	GEDEELD_MET_MIJ = 'GEDEELD_MET_MIJ',
	GEDEELD_MET_ANDERE = 'GEDEELD_MET_ANDERE',
	NIET_GEDEELD = 'NIET_GEDEELD',
}

export interface AssignmentLabelColor {
	label: string; // #FF0000
	value: Lookup_Enum_Colors_Enum; // BRIGHT_RED
}

/// Zoek & bouw

export type AssignmentFormState = Omit<
	Assignment_v2_With_Blocks & Assignment_v2_With_Labels,
	'id'
> & { id: string | null };

export type AssignmentResponseFormState = Pick<
	AssignmentResponseInfo,
	'collection_title' | 'id'
> & {
	pupil_collection_blocks: Omit<PupilCollectionFragment, 'item_meta'>[]; // avoid circular reference ts error
};

export interface PupilSearchFilterState extends FilterState {
	tab: string; // Which tab is active: assignment, search or my collection
	selectedSearchResultId?: string; // Search result of which the detail page should be shown
	focus?: string; // Search result that should be scrolled into view
}

export interface EditBlockProps {
	block: EditableAssignmentBlock;
	setBlock: (updatedBlock: EditableAssignmentBlock) => void;
}

export type EditableAssignmentBlock = AssignmentBlock &
	Pick<Avo.Core.BlockItemBase, 'item_meta'> &
	EditableBlockFields;
