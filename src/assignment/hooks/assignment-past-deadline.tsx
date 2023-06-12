import { isPast } from 'date-fns/esm';
import { useMemo } from 'react';

import { Avo } from '@viaa/avo2-types';

export function useAssignmentPastDeadline(assignment: Avo.Assignment.Assignment | null): boolean {
	return useMemo(
		() => (assignment?.deadline_at && isPast(new Date(assignment.deadline_at))) || false,
		[assignment]
	);
}
