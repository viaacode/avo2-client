import { type Avo } from '@viaa/avo2-types';

const addTypeToLabel = (
	item: { assignment_label: Avo.Assignment.Label },
	type: Avo.Assignment.LabelType
) => ({
	...item,
	assignment_label: {
		...item.assignment_label,
		type,
	},
});

export const mergeWithOtherLabels = (
	prev: { assignment_label: Avo.Assignment.Label }[],
	changed: { assignment_label: Avo.Assignment.Label }[],
	type: Avo.Assignment.LabelType
): { assignment_label: Avo.Assignment.Label }[] => [
	...prev.filter((item) => item.assignment_label.type !== type),
	...changed.map((item) => addTypeToLabel(item, type)),
];
