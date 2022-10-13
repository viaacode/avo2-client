import { isPast } from 'date-fns/esm';
import { useMemo } from 'react';

import { Assignment_v2 } from '../assignment.types';

export function useAssignmentPastDeadline(assignment: Assignment_v2 | null): boolean {
	return useMemo(
		() => (assignment?.deadline_at && isPast(new Date(assignment.deadline_at))) || false,
		[assignment]
	);
}
