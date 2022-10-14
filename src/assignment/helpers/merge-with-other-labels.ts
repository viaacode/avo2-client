import { AssignmentLabelType } from '@viaa/avo2-types/types/assignment';

import { Assignment_Label_v2 } from '../assignment.types';

const addTypeToLabel = (
	item: { assignment_label: Assignment_Label_v2 },
	type: AssignmentLabelType
) => ({
	...item,
	assignment_label: {
		...item.assignment_label,
		type,
	},
});

export const mergeWithOtherLabels = (
	prev: { assignment_label: Assignment_Label_v2 }[],
	changed: { assignment_label: Assignment_Label_v2 }[],
	type: AssignmentLabelType
): { assignment_label: Assignment_Label_v2 }[] => [
	...prev.filter((item) => item.assignment_label.type !== type),
	...changed.map((item) => addTypeToLabel(item, type)),
];
