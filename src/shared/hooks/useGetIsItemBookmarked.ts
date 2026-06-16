import { type UseQueryResult, useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '../constants/query-keys';
import { isUuid } from '../helpers/uuid.ts';
import { BookmarksViewsPlaysService } from '../services/bookmarks-views-plays-service/bookmarks-views-plays-service';

export const useGetIsItemBookmarked = (
  itemUuid: string | null | undefined,
  options: { enabled?: boolean } = {},
): UseQueryResult<boolean> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_IS_ITEM_BOOKMARKED, itemUuid],
    queryFn: () =>
      BookmarksViewsPlaysService.getItemIsBookmarked(itemUuid as string),
    enabled: !!itemUuid && isUuid(itemUuid) && (options.enabled ?? true),
  });
};
