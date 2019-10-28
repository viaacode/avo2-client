import { Avo } from '@viaa/avo2-types';

export interface AssignmentColumn {
	id: keyof Avo.Assignment.Assignment | 'actions';
	label: string;
	sortable?: boolean;
}

export enum AssignmentLayout {
	OnlyPlayer = 0,
	PlayerAndText = 1,
}
