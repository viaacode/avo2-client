import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { Avo } from '@viaa/avo2-types';

import { ItemsService } from '../../admin/items/items.service';
import { QUERY_KEYS } from '../../shared/constants/query-keys';

export const useGetItemByExternalId = (
	itemId: string,
	options: {
		enabled?: boolean;
		refetchInterval?: number | false;
		refetchIntervalInBackground?: boolean;
	} = {}
): UseQueryResult<Avo.Item.Item> => {
	return useQuery(
		[QUERY_KEYS.GET_ITEM_BY_EXTERNAL_ID, itemId],
		async () => {
			return await ItemsService.fetchItemByExternalId(itemId);
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
