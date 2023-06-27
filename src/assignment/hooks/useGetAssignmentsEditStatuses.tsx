import { useQuery } from '@tanstack/react-query';

import { AssignmentService } from '../assignment.service';

export const useGetAssignmentsEditStatuses = (
	assignmentsIds: string[],
	enabled: boolean,
	interval: number,
	options: {
		enabled: boolean;
		refetchInterval: number;
		refetchIntervalInBackground: boolean;
	} = {
		enabled: enabled || false,
		refetchInterval: interval || 0,
		refetchIntervalInBackground: true,
	}
) => {
	return useQuery(
		['GET_ASSIGNMENTS_EDIT_STATUSES', assignmentsIds],
		() => {
			return AssignmentService.getAssignmentsEditStatuses(assignmentsIds);
		},
		options
	);
};
