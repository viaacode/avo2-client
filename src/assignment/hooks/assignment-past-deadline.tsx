import { Avo } from '@viaa/avo2-types';
import { isPast } from 'date-fns/esm';
import { useMemo } from 'react';

export function useAssignmentPastDeadline(
	assignment: Avo.Assignment.Assignment_v2 | null
): boolean {
	return useMemo(
		() => (assignment?.deadline_at && isPast(new Date(assignment.deadline_at))) || false,
		[assignment]
	);
}
