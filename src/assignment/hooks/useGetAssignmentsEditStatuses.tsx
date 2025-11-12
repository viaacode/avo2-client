import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '../../shared/constants/query-keys.js';
import { AssignmentService } from '../assignment.service.js';

export const useGetAssignmentsEditStatuses = (
	assignmentsIds: string[],
	options: {
		enabled: boolean;
		refetchInterval: number | false;
		refetchIntervalInBackground?: boolean;
	} = {
		enabled: true,
		refetchInterval: false,
		refetchIntervalInBackground: false,
	}
) => {
	return useQuery(
		[QUERY_KEYS.GET_ASSIGNMENTS_EDIT_STATUSES, assignmentsIds],
		() => {
			return AssignmentService.getAssignmentsEditStatuses(assignmentsIds);
		},
		options
	);
};
