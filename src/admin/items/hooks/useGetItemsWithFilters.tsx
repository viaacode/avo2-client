import { getFilters } from '@meemoo/admin-core-ui/admin';
import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { Avo } from '@viaa/avo2-types';

import { QUERY_KEYS } from '../../../shared/constants/query-keys.js';
import { tHtml } from '../../../shared/helpers/translate-html.js';
import { ITEMS_PER_PAGE } from '../../collectionsOrBundles/collections-or-bundles.const.js';
import { ItemsService } from '../items.service.js';
import type {
  ItemsOverviewTableCols,
  ItemsTableState,
} from '../items.types.js';

export const useGetItemsWithFilters = (
  tableState: Partial<ItemsTableState>,
  options: {
    enabled?: boolean;
    refetchInterval?: number | false;
    refetchIntervalInBackground?: boolean;
  } = {},
): UseQueryResult<{ items: Avo.Item.Item[]; total: number }> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_ITEMS_WITH_FILTER, tableState],
    queryFn: () => {
      return ItemsService.fetchItemsWithFilters(
        (tableState.page || 0) * ITEMS_PER_PAGE,
        ITEMS_PER_PAGE,
        (tableState.sort_column || 'created_at') as ItemsOverviewTableCols,
        tableState.sort_order || Avo.Search.OrderDirection.DESC,
        getFilters(tableState),
      );
    },
    enabled: true,
    ...options,
    meta: {
      errorMessage: tHtml(
        'admin/items/views/items-overview___het-ophalen-van-de-items-is-mislukt',
      ),
    },
  });
};
