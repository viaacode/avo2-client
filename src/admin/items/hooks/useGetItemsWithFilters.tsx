import { getFilters } from '@meemoo/admin-core-ui/dist/admin.mjs';
import { useQuery } from '@tanstack/react-query';
import { type Avo } from '@viaa/avo2-types';

import { OrderDirection } from '../../../search/search.const';
import { QUERY_KEYS } from '../../../shared/constants/query-keys';
import { tHtml } from '../../../shared/helpers/translate-html';
import { ITEMS_PER_PAGE } from '../../collectionsOrBundles/collections-or-bundles.const';
import { ItemsService } from '../items.service';
import type { ItemsOverviewTableCols, ItemsTableState } from '../items.types';

export const useGetItemsWithFilters = (
	tableState: Partial<ItemsTableState>,
	options: {
		enabled?: boolean;
		refetchInterval?: number | false;
		refetchIntervalInBackground?: boolean;
	} = {}
) => {
	return useQuery<{ items: Avo.Item.Item[]; total: number }>(
		[QUERY_KEYS.GET_ITEMS_WITH_FILTER, tableState],
		() => {
			return ItemsService.fetchItemsWithFilters(
				(tableState.page || 0) * ITEMS_PER_PAGE,
				ITEMS_PER_PAGE,
				(tableState.sort_column || 'created_at') as ItemsOverviewTableCols,
				tableState.sort_order || OrderDirection.desc,
				getFilters(tableState)
			);
		},
		{
			enabled: true,
			refetchInterval: false,
			refetchIntervalInBackground: false,
			retry: false,
			...options,
			meta: {
				errorMessage: tHtml(
					'admin/items/views/items-overview___het-ophalen-van-de-items-is-mislukt'
				),
			},
		}
	);
};
