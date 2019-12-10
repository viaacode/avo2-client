import { Avo } from '@viaa/avo2-types';

export interface AssignmentColumn {
	id: keyof Avo.Assignment.Assignment | 'actions';
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
