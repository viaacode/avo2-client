import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { QUERY_KEYS } from '../../shared/constants/query-keys';
import { tHtml } from '../../shared/helpers/translate-html';
import {
	type KlascementAssignmentPublishInfo,
	KlascementService,
} from '../../shared/services/klascement-service';

export const useGetKlascementAssignmentPublishInfo = (
	assignmentId: string,
	options: { enabled?: boolean } = {}
): UseQueryResult<KlascementAssignmentPublishInfo> => {
	return useQuery(
		[QUERY_KEYS.GET_KLASCEMENT_ASSIGNMENT_PUBLISH_INFO, assignmentId],
		async () => {
			return KlascementService.getKlascementPublishInfoForAssignment(assignmentId);
		},
		{
			enabled: true,
			meta: {
				errorMessage: tHtml(
					'assignment/hooks/use-get-klascement-assignment-publish-info___het-ophalen-van-de-klascement-informatie-is-mislukt'
				),
			},
			...options,
		}
	);
};
