import { type UseQueryResult, useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '../constants/query-keys';
import { isUuid } from '../helpers/uuid.ts';
import { BookmarksViewsPlaysService } from '../services/bookmarks-views-plays-service/bookmarks-views-plays-service';
import { type BookmarkViewPlayCounts } from '../services/bookmarks-views-plays-service/bookmarks-views-plays-service.types';

export const useGetItemCounts = (
  itemUuid: string | null | undefined,
  options: { enabled?: boolean } = {},
): UseQueryResult<BookmarkViewPlayCounts> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_ITEM_COUNTS, itemUuid],
    queryFn: () => BookmarksViewsPlaysService.getItemCounts(itemUuid as string),
    enabled: !!itemUuid && isUuid(itemUuid) && (options.enabled ?? true),
  });
};
