import { TableColumn } from '@viaa/avo2-components';
import { AssignmentBlock, AssignmentLabel_v2 } from '@viaa/avo2-types/types/assignment';
import { BlockItemBaseSchema } from '@viaa/avo2-types/types/core';

import { FilterState } from '../search/search.types';
import {
	GetAssignmentBlocksQuery,
	GetAssignmentLabelsByProfileIdQuery,
	GetAssignmentResponseByIdQuery,
	GetAssignmentsByOwnerQuery,
	GetAssignmentsByResponseOwnerIdQuery,
	GetPupilCollectionsAdminOverviewQuery,
	Lookup_Enum_Colors_Enum,
} from '../shared/generated/graphql-db-types';

import { AssignmentBlockItemDescriptionType } from './components/AssignmentBlockDescriptionButtons';

export type Assignment_v2 = (
	| GetAssignmentsByOwnerQuery
	| GetAssignmentsByResponseOwnerIdQuery
)['app_assignments_v2'][0];

export type Assignment_Response_v2 =
	| GetAssignmentResponseByIdQuery['app_assignment_responses_v2'][0]
	| GetPupilCollectionsAdminOverviewQuery['app_assignment_responses_v2'][0];

export type AssignmentResponseInfo = Omit<Assignment_Response_v2, 'pupil_collection_blocks'> & {
	pupil_collection_blocks: BaseBlockWithMeta[];
};

export type PupilCollectionFragment =
	| GetAssignmentResponseByIdQuery['app_assignment_responses_v2'][0]['pupil_collection_blocks'][0]
	| GetAssignmentBlocksQuery['app_assignment_blocks_v2'][0];

export type BaseBlockWithMeta = (PupilCollectionFragment | AssignmentBlock) &
	Pick<BlockItemBaseSchema, 'item_meta'> & { type: string };

export type Label_v2 = GetAssignmentLabelsByProfileIdQuery['app_assignment_labels_v2'][0];

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
export type AssignmentSchemaLabel_v2 = { assignment_label: Omit<AssignmentLabel_v2, 'profile'> };

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
	block: EditableBlockItem;
	setBlock: (updatedBlock: EditableBlockItem) => void;
}

export interface EditableBlockItem extends BaseBlockWithMeta {
	ownTitle?: string;
	ownDescription?: string;
	noTitle?: string;
	editMode?: AssignmentBlockItemDescriptionType;
}
