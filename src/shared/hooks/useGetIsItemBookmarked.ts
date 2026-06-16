import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { QUERY_KEYS } from '../constants/query-keys';
import { BookmarksViewsPlaysService } from '../services/bookmarks-views-plays-service/bookmarks-views-plays-service';

export const useGetIsItemBookmarked = (
  itemUuid: string | null | undefined,
  options: { enabled?: boolean } = {},
): UseQueryResult<boolean> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_IS_ITEM_BOOKMARKED, itemUuid],
    queryFn: () =>
      BookmarksViewsPlaysService.getItemIsBookmarked(itemUuid as string),
    enabled: !!itemUuid && (options.enabled ?? true),
  });
};
