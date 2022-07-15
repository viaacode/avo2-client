import { AssignmentLabelType } from '@viaa/avo2-types/types/assignment';

import { AssignmentSchemaLabel_v2 } from '../assignment.types';

const addTypeToLabel = (item: AssignmentSchemaLabel_v2, type: AssignmentLabelType) => ({
	...item,
	assignment_label: {
		...item.assignment_label,
		type,
	},
});

export const mergeWithOtherLabels = (
	prev: AssignmentSchemaLabel_v2[],
	changed: AssignmentSchemaLabel_v2[],
	type: AssignmentLabelType
) => [
	...prev.filter((item) => item.assignment_label.type !== type),
	...changed.map((item) => addTypeToLabel(item, type)),
];
