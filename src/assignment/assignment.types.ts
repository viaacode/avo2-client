import { TableColumn } from '@viaa/avo2-components';
import { AssignmentSchema_v2 } from '@viaa/avo2-types/types/assignment';

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

export interface AssignmentColumn extends TableColumn {
	id: AssignmentOverviewTableColumns;
	label: string;
	sortable?: boolean;
}

export enum AssignmentLabelType {
	LABEL = 'LABEL',
	CLASS = 'CLASS',
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

export type AssignmentFormState = Pick<AssignmentSchema_v2, 'title'>;
