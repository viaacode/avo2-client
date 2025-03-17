import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { type AssignmentMarcomEntry } from '../../collection/collection.types';
import { QUERY_KEYS } from '../../shared/constants/query-keys';
import { tHtml } from '../../shared/helpers/translate-html';
import { AssignmentService } from '../assignment.service';

export const useGetAssignmentMarcomEntries = (
	assignmentId: string,
	options: {
		enabled?: boolean;
		refetchInterval?: number | false;
		refetchIntervalInBackground?: boolean;
	} = {}
): UseQueryResult<AssignmentMarcomEntry[]> => {
	return useQuery(
		[QUERY_KEYS.GET_ASSIGNMENT_MARCOM_ENTRIES, assignmentId],
		async () => {
			return AssignmentService.getMarcomEntries(assignmentId);
		},
		{
			enabled: true,
			refetchInterval: false,
			refetchIntervalInBackground: false,
			keepPreviousData: true,
			...options,
			meta: {
				errorMessage: tHtml('Het ophalen van de marcom entries is mislukt'),
			},
		}
	);
};
