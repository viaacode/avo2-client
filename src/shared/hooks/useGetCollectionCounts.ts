import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { QUERY_KEYS } from '../constants/query-keys';
import { BookmarksViewsPlaysService } from '../services/bookmarks-views-plays-service/bookmarks-views-plays-service';
import { type BookmarkViewPlayCounts } from '../services/bookmarks-views-plays-service/bookmarks-views-plays-service.types';

export const useGetCollectionCounts = (
  collectionUuid: string | null | undefined,
  options: { enabled?: boolean } = {},
): UseQueryResult<BookmarkViewPlayCounts> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_COLLECTION_COUNTS, collectionUuid],
    queryFn: () =>
      BookmarksViewsPlaysService.getCollectionCounts(collectionUuid as string),
    enabled: !!collectionUuid && (options.enabled ?? true),
  });
};
