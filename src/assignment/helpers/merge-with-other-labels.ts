import { AvoAssignmentLabel, AvoAssignmentLabelType } from '@viaa/avo2-types';

const addTypeToLabel = (
  item: { assignment_label: AvoAssignmentLabel },
  type: AvoAssignmentLabelType,
) => ({
  ...item,
  assignment_label: {
    ...item.assignment_label,
    type,
  },
});

export const mergeWithOtherLabels = (
  prev: { assignment_label: AvoAssignmentLabel }[],
  changed: { assignment_label: AvoAssignmentLabel }[],
  type: AvoAssignmentLabelType,
): { assignment_label: AvoAssignmentLabel }[] =>
  [
    ...prev.filter(
      (item: { assignment_label: AvoAssignmentLabel }) =>
        item.assignment_label.type !== type,
    ),
    ...changed.map((item: { assignment_label: AvoAssignmentLabel }) =>
      addTypeToLabel(item, type),
    ),
  ] as { assignment_label: AvoAssignmentLabel }[];
