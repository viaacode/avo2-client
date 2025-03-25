import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { QUERY_KEYS } from '../../shared/constants/query-keys';
import { tHtml } from '../../shared/helpers/translate-html';
import {
	type KlascementAssignmentPublishInfo,
	KlascementService,
} from '../../shared/services/klascement-service';

export const useGetKlascementAssignmentPublishInfo = (
	assignmentId: string
): UseQueryResult<KlascementAssignmentPublishInfo> => {
	return useQuery(
		[QUERY_KEYS.GET_KLASCEMENT_ASSIGNMENT_PUBLISH_INFO, assignmentId],
		async () => {
			return KlascementService.getKlascementPublishInfoForAssignment(assignmentId);
		},
		{
			meta: {
				errorMessage: tHtml('Failed to fetch klascement publish info from the database'),
			},
		}
	);
};
