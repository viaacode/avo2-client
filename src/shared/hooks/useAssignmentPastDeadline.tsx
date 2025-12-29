import { AvoAssignmentAssignment } from '@viaa/avo2-types';

import { isPast } from 'date-fns';
import { useMemo } from 'react';

export function useAssignmentPastDeadline(
  assignment?: AvoAssignmentAssignment | null,
): boolean {
  return useMemo(
    () =>
      (assignment?.deadline_at && isPast(new Date(assignment.deadline_at))) ||
      false,
    [assignment?.deadline_at],
  );
}
