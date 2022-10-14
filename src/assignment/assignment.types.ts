import { TableColumn } from '@viaa/avo2-components';
import { BlockItemBaseSchema } from '@viaa/avo2-types/types/core';

import { FilterState } from '../search/search.types';
import {
	App_Assignments_V2_Assignment_Labels_V2,
	GetAssignmentBlocksQuery,
	GetAssignmentByUuidQuery,
	GetAssignmentLabelsByProfileIdQuery,
	GetAssignmentResponseByIdQuery,
	GetAssignmentsAdminOverviewQuery,
	GetAssignmentsByOwnerQuery,
	GetAssignmentsByResponseOwnerIdQuery,
	GetAssignmentWithResponseQuery,
	GetPupilCollectionsAdminOverviewQuery,
	Lookup_Enum_Colors_Enum,
	UpdateAssignmentBlockMutation,
} from '../shared/generated/graphql-db-types';

import { AssignmentBlockItemDescriptionType } from './components/AssignmentBlockDescriptionButtons';

export type Assignment_v2_With_Blocks = GetAssignmentByUuidQuery['app_assignments_v2'][0];

export type Assignment_v2_With_Responses = GetAssignmentWithResponseQuery['app_assignments_v2'][0];

export type Assignment_v2 =
	| (
			| GetAssignmentsByOwnerQuery
			| GetAssignmentsByResponseOwnerIdQuery
			| GetAssignmentsAdminOverviewQuery
			| GetAssignmentWithResponseQuery
	  )['app_assignments_v2'][0]
	| Assignment_v2_With_Blocks;

export type SimplifiedAssignment = Assignment_v2 & {
	blocks: AssignmentBlock[];
	labels: App_Assignments_V2_Assignment_Labels_V2[];
};

export type Assignment_Response_v2_With_Pupil_Collection_Blocks = Exclude<
	GetAssignmentResponseByIdQuery['app_assignment_responses_v2'][0],
	undefined | null
>;

export type Assignment_Response_v2 = Exclude<
	| Assignment_Response_v2_With_Pupil_Collection_Blocks
	| GetPupilCollectionsAdminOverviewQuery['app_assignment_responses_v2'][0],
	undefined | null
>;

export type AssignmentResponseInfo = Omit<Assignment_Response_v2, 'pupil_collection_blocks'> & {
	pupil_collection_blocks: BaseBlockWithMeta[];
};

export type AssignmentBlock = Exclude<
	| GetAssignmentBlocksQuery['app_assignment_blocks_v2'][0]
	| GetAssignmentByUuidQuery['app_assignments_v2'][0]['blocks'][0]
	| UpdateAssignmentBlockMutation['update_app_assignment_blocks_v2_by_pk'],
	undefined | null
>;

export type PupilCollectionFragment = Exclude<
	GetAssignmentResponseByIdQuery['app_assignment_responses_v2'][0]['pupil_collection_blocks'][0],
	undefined | null
>;

export type BaseBlockWithMeta = (PupilCollectionFragment | AssignmentBlock) &
	Pick<BlockItemBaseSchema, 'item_meta'> & { type: string };

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
	| 'actions';

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

export interface AssignmentLabelColor {
	label: string; // #FF0000
	value: Lookup_Enum_Colors_Enum; // BRIGHT_RED
}

/// Zoek & bouw

// Omit avoids a typescript error here
export type AssignmentSchemaLabel_v2 = { assignment_label: Assignment_Label_v2 };

export type AssignmentFormState = Pick<Assignment_v2, 'title'> &
	Pick<Partial<Assignment_v2>, 'id' | 'available_at' | 'deadline_at' | 'answer_url'> & {
		labels: AssignmentSchemaLabel_v2[];
		blocks: Omit<AssignmentBlock, 'item_meta'>[]; // avoid circular reference ts error
	};

export type AssignmentResponseFormState = Pick<
	Partial<Assignment_Response_v2>,
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
	Pick<BlockItemBaseSchema, 'item_meta'> & {
		ownTitle?: string;
		ownDescription?: string;
		noTitle?: string;
		editMode?: AssignmentBlockItemDescriptionType;
	};
