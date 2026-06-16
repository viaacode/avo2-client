import { type UseQueryResult, useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '../constants/query-keys';
import { isUuid } from '../helpers/uuid.ts';
import { BookmarksViewsPlaysService } from '../services/bookmarks-views-plays-service/bookmarks-views-plays-service';
import { type BookmarkViewPlayCounts } from '../services/bookmarks-views-plays-service/bookmarks-views-plays-service.types';

export const useGetAssignmentCounts = (
  assignmentUuid: string | null | undefined,
  options: { enabled?: boolean } = {},
): UseQueryResult<BookmarkViewPlayCounts> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_ASSIGNMENT_COUNTS, assignmentUuid],
    queryFn: () => {
      return BookmarksViewsPlaysService.getAssignmentCounts(
        assignmentUuid as string,
      );
    },
    enabled:
      !!assignmentUuid && isUuid(assignmentUuid) && (options.enabled ?? true),
  });
};
