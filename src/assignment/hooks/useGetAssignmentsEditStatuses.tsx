import { useQuery } from '@tanstack/react-query';

import { AssignmentService } from '../assignment.service';

export const useGetAssignmentsEditStatuses = (
	assignmentsIds: string[],
	options: {
		enabled: boolean;
		refetchInterval: number;
		refetchIntervalInBackground?: boolean;
	} = {
		enabled: false,
		refetchInterval: 0,
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
