import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '../../../shared/constants/query-keys';
import { ItemsService } from '../items.service';

export const useGetItemWithRelations = (
	itemUuid: string,
	options: {
		enabled: boolean;
	} = { enabled: true }
) => {
	return useQuery(
		[QUERY_KEYS.GET_ITEM_USED_BY, itemUuid],
		async () => await ItemsService.fetchItemByUuid(itemUuid, true),
		options
	);
};
