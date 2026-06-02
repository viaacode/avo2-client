import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '../../../shared/constants/query-keys';
import { ItemsService } from '../items.service';

export const useGetItemWithRelations = (
  itemUuid: string,
  withRelations: boolean,
  censorUnpublishedItems: boolean,
  options: {
    enabled: boolean;
  } = { enabled: true },
) => {
  return useQuery({
    queryKey: [
      QUERY_KEYS.GET_ITEM_USED_BY,
      itemUuid,
      withRelations,
      censorUnpublishedItems,
    ],
    queryFn: async () =>
      await ItemsService.fetchItemByUuid(
        itemUuid,
        withRelations,
        censorUnpublishedItems,
      ),
    ...options,
  });
};
