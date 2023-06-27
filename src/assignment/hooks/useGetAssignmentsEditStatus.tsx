import { useQuery } from '@tanstack/react-query';

import { AssignmentService } from '../assignment.service';

export const useGetAssignmentsEditStatuses = (
	assignmentIds: string[],
	interval: number,
	options: {
		enabled: boolean;
		refetchInterval: number;
		refetchIntervalInBackground: boolean;
	} = { enabled: true, refetchInterval: interval || 0, refetchIntervalInBackground: true }
) => {
	return useQuery(
		['GET_ASSIGNMENT_EDIT_STATUS', assignmentIds],
		() => {
			return AssignmentService.getAssignmentsEditStatuses(assignmentIds);
		},
		options
	);
};
