import { TableColumn } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { AssignmentBlock, AssignmentLabel_v2 } from '@viaa/avo2-types/types/assignment';

import { FilterState } from '../search/search.types';

export type AssignmentOverviewTableColumns =
	| 'title'
	| 'owner'
	| 'created_at'
	| 'updated_at'
	| 'deadline_at'
	| 'status'
	| 'pupilCollections'
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
	PAST_DEADLINE = 'PAST_DEADLINE',
}

export interface AssignmentLabelColor {
	label: string; // #FF0000
	value: string; // BRIGHT_RED
}

/// Zoek & bouw

// Omit avoids a typescript error here
export type AssignmentSchemaLabel_v2 = { assignment_label: Omit<AssignmentLabel_v2, 'profile'> };

export type AssignmentFormState = Pick<Avo.Assignment.Assignment_v2, 'title'> &
	Pick<
		Partial<Avo.Assignment.Assignment_v2>,
		'id' | 'available_at' | 'deadline_at' | 'answer_url'
	> & {
		labels: AssignmentSchemaLabel_v2[];
		blocks: Omit<AssignmentBlock, 'item_meta'>[]; // avoid circular reference ts error
	};

export type AssignmentResponseFormState = Pick<
	Partial<Avo.Assignment.Response_v2>,
	'collection_title' | 'id'
> & {
	pupil_collection_blocks: Omit<PupilCollectionFragment, 'item_meta'>[]; // avoid circular reference ts error
};

export interface PupilSearchFilterState extends FilterState {
	tab: string; // Which tab is active: assignment, search or my collection
	selectedSearchResultId?: string; // Search result of which the detail page should be shown
	focus?: string; // Search result that should be scrolled into view
}

export interface PupilCollectionFragment extends Avo.Core.BlockItemBase {
	assignment_response_id: string;
	fragment_id: string;
	is_deleted: boolean;
}
