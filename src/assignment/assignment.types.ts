import { TableColumn } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { AssignmentBlock, AssignmentLabel_v2 } from '@viaa/avo2-types/types/assignment';

export type AssignmentOverviewTableColumns =
	| 'title'
	| 'assignment_type'
	| 'labels'
	| 'author'
	| 'class_room'
	| 'deadline_at'
	| 'responses'
	| 'updated_at'
	| 'created_at'
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
	Partial<
		Pick<Avo.Assignment.Assignment_v2, 'id' | 'available_at' | 'deadline_at' | 'answer_url'>
	> & {
		labels: AssignmentSchemaLabel_v2[];
		blocks: Omit<AssignmentBlock, 'item'>[]; // avoid circular reference ts error
	};

export type AssignmentBlockTypeDict<T> = { [key in AssignmentBlockType]: T }; // eslint-disable-line