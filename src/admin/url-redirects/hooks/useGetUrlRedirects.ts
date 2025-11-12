import { useQuery, type UseQueryResult } from '@tanstack/react-query'

import { OrderDirection } from '../../../search/search.const.js'
import { QUERY_KEYS } from '../../../shared/constants/query-keys.js'
import { ITEMS_PER_PAGE } from '../url-redirects.const.js'
import { UrlRedirectsService } from '../url-redirects.service.js'
import {
  type UrlRedirect,
  type UrlRedirectOverviewFilterState,
} from '../url-redirects.types.js'
import { Avo } from '@viaa/avo2-types'

export const useGetUrlRedirects = (
  params: UrlRedirectOverviewFilterState | undefined,
  options: {
    enabled?: boolean
    refetchInterval?: number | false
    refetchIntervalInBackground?: boolean
  } = {},
): UseQueryResult<{
  urlRedirects: UrlRedirect[]
  count: number
}> => {
  return useQuery(
    [QUERY_KEYS.GET_URL_REDIRECTS, params],
    async () =>
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
    {
      refetchInterval: false,
      refetchIntervalInBackground: false,
      keepPreviousData: true,
      retry: false,
      ...options,
    },
  )
}
