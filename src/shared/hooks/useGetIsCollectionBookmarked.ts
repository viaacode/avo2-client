import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { QUERY_KEYS } from '../constants/query-keys';
import { BookmarksViewsPlaysService } from '../services/bookmarks-views-plays-service/bookmarks-views-plays-service';

export const useGetIsCollectionBookmarked = (
  collectionUuid: string | null | undefined,
  options: { enabled?: boolean } = {},
): UseQueryResult<boolean> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_IS_COLLECTION_BOOKMARKED, collectionUuid],
    queryFn: () =>
      BookmarksViewsPlaysService.getIsCollectionBookmarked(
        collectionUuid as string,
        undefined,
      ),
    enabled: !!collectionUuid && (options.enabled ?? true),
  });
};
