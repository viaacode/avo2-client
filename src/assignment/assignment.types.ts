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

// TODO replace with typings version after update to 2.16.0
export interface AssignmentLabel {
	id: number;
	label: string | null; // Wiskunde
	color_enum_value: string; // BRIGHT_RED
	color_override: string | null; // #FFFF00
	owner_profile_id: string;
	enum_color?: AssignmentLabelColor;
}

export interface AssignmentLabelColor {
	label: string; // #FF0000
	value: string; // BRIGHT_RED
}
