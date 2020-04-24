export type AssignmentOverviewTableColumns =
	| 'title'
	| 'assignment_type'
	| 'assignment_assignment_tags'
	| 'class_room'
	| 'deadline_at'
	| 'assignment_responses'
	| 'actions';

export interface AssignmentColumn {
	id: AssignmentOverviewTableColumns;
	label: string;
	sortable?: boolean;
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
