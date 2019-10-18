import { Avo } from '@viaa/avo2-types';

export interface AssignmentColumn {
	id: keyof Avo.Assignment.Assignment | 'actions';
	label: string;
	sortable?: boolean;
}
