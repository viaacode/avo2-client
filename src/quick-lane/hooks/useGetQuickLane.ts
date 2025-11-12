import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { QUERY_KEYS } from '../../shared/constants/query-keys.js';
import type { QuickLaneUrlObject } from '../../shared/types/index.js';
import { QuickLaneService } from '../quick-lane.service.js';

export const useGetQuickLane = (
	quickLaneId: string | undefined,
	options: {
		enabled?: boolean;
		refetchInterval?: number | false;
		refetchIntervalInBackground?: boolean;
	} = {}
): UseQueryResult<QuickLaneUrlObject> => {
	return useQuery(
		[QUERY_KEYS.GET_ASSIGNMENTS, quickLaneId],
		async () => {
			if (!quickLaneId) {
				return null;
			}
			return QuickLaneService.fetchQuickLaneById(quickLaneId);
		},
		{
			enabled: true,
			refetchInterval: false,
			refetchIntervalInBackground: false,
			keepPreviousData: true,
			...options,
		}
	);
};
