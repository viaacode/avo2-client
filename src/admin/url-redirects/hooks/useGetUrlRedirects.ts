import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { Avo } from '@viaa/avo2-types';
import { QUERY_KEYS } from '../../../shared/constants/query-keys';
import { ITEMS_PER_PAGE } from '../url-redirects.const';
import { UrlRedirectsService } from '../url-redirects.service';
import {
  type UrlRedirect,
  type UrlRedirectOverviewFilterState,
} from '../url-redirects.types';

export const useGetUrlRedirects = (
  params: UrlRedirectOverviewFilterState | undefined,
  options: {
    enabled?: boolean;
    refetchInterval?: number | false;
    refetchIntervalInBackground?: boolean;
  } = {},
): UseQueryResult<{
  urlRedirects: UrlRedirect[];
  count: number;
}> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_URL_REDIRECTS, params],
    queryFn: async () =>
      UrlRedirectsService.fetchUrlRedirectsOverview({
        query: params?.query,
        created_at: params?.createdAt,
        updated_at: params?.updatedAt,
        old_path_pattern: params?.oldPathPattern,
        sortOrder:
          params?.sort_order ||
          (Avo.Search.OrderDirection.DESC as Avo.Search.OrderDirection),
        sortColumn: params?.sort_column || 'updated_at',
        limit: ITEMS_PER_PAGE,
        offset: (params?.page || 0) * ITEMS_PER_PAGE,
      }),
    ...options,
  });
};
