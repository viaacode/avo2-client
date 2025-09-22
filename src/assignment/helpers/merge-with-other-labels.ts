import { type Avo } from '@viaa/avo2-types';

const addTypeToLabel = (
	item: { assignment_label: Avo.LabelOrClass.LabelOrClass },
	type: Avo.LabelOrClass.Type
) => ({
	...item,
	assignment_label: {
		...item.assignment_label,
		type,
	},
});

export const mergeWithOtherLabels = (
	prev: { assignment_label: Avo.LabelOrClass.LabelOrClass }[],
	changed: { assignment_label: Avo.LabelOrClass.LabelOrClass }[],
	type: Avo.LabelOrClass.Type
): { assignment_label: Avo.LabelOrClass.LabelOrClass }[] => [
	...prev.filter((item) => item.assignment_label.type !== type),
	...changed.map((item) => addTypeToLabel(item, type)),
];
