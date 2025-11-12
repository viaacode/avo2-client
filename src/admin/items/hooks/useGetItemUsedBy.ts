import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '../../../shared/constants/query-keys';
import { ItemsService } from '../items.service';

export const useGetItemUsedBy = (
  {
    itemUuid,
    sortProp,
    sortDirection,
  }: {
    itemUuid: string;
    sortProp: string | undefined;
    sortDirection: string | undefined;
  },
  options: {
    enabled: boolean;
  } = { enabled: true },
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_ITEM_USED_BY, itemUuid, sortProp, sortDirection],
    queryFn: () => {
      return ItemsService.getItemUsedBy(itemUuid, sortProp, sortDirection);
    },
    ...options,
  });
};
