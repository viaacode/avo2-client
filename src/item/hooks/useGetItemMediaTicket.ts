import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { QUERY_KEYS } from '../../shared/constants/query-keys';
import { fetchPlayerTicket } from '../../shared/services/player-ticket-service';

export const useGetItemMediaTicket = (
	itemId: string,
	options: {
		enabled?: boolean;
		refetchInterval?: number | false;
		refetchIntervalInBackground?: boolean;
	} = {}
): UseQueryResult<string> => {
	return useQuery(
		[QUERY_KEYS.GET_ITEM_MEDIA_TICKET, itemId],
		async () => {
			return await fetchPlayerTicket(itemId);
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
