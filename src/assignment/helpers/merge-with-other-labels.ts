import { type Avo } from '@viaa/avo2-types';

const addTypeToLabel = (
	item: { assignment_label: Avo.LabelClass.LabelClass },
	type: Avo.LabelClass.Type
) => ({
	...item,
	assignment_label: {
		...item.assignment_label,
		type,
	},
});

export const mergeWithOtherLabels = (
	prev: { assignment_label: Avo.LabelClass.LabelClass }[],
	changed: { assignment_label: Avo.LabelClass.LabelClass }[],
	type: Avo.LabelClass.Type
): { assignment_label: Avo.LabelClass.LabelClass }[] => [
	...prev.filter((item) => item.assignment_label.type !== type),
	...changed.map((item) => addTypeToLabel(item, type)),
];
