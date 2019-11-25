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
