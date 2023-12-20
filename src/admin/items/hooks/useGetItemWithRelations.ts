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
		async () => {
			const itemObj = await ItemsService.fetchItemByUuid(itemUuid);
			const replacedByUuid: string | undefined = itemObj?.relations?.[0]?.object;
			if (replacedByUuid && itemObj.relations) {
				itemObj.relations[0].object_meta =
					await ItemsService.fetchItemByUuid(replacedByUuid);
			}
			return itemObj;
		},
		options
	);
};
