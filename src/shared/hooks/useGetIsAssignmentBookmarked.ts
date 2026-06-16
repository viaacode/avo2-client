import { type UseQueryResult, useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '../constants/query-keys';
import { isUuid } from '../helpers/uuid.ts';
import { BookmarksViewsPlaysService } from '../services/bookmarks-views-plays-service/bookmarks-views-plays-service';

export const useGetIsAssignmentBookmarked = (
  assignmentUuid: string | null | undefined,
  options: { enabled?: boolean } = {},
): UseQueryResult<boolean> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_IS_ASSIGNMENT_BOOKMARKED, assignmentUuid],
    queryFn: () =>
      BookmarksViewsPlaysService.getAssignmentIsBookmarked(
        assignmentUuid as string,
        undefined,
      ),
    enabled:
      !!assignmentUuid && isUuid(assignmentUuid) && (options.enabled ?? true),
  });
};
