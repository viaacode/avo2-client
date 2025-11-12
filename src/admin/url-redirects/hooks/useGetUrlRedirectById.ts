import { type UseQueryResult, useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '../../../shared/constants/query-keys.js';
import { INITIAL_URL_REDIRECT } from '../url-redirects.const.js';
import { UrlRedirectsService } from '../url-redirects.service.js';
import { type UrlRedirect } from '../url-redirects.types.js';

export const useGetUrlRedirectById = (
  urlRedirectId: number,
  options: {
    enabled?: boolean;
    refetchInterval?: number | false;
    refetchIntervalInBackground?: boolean;
  } = {},
): UseQueryResult<UrlRedirect> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_URL_REDIRECTS, urlRedirectId],
    queryFn: async () => {
      if (!urlRedirectId) {
        return INITIAL_URL_REDIRECT();
      }
      return UrlRedirectsService.fetchSingleUrlRedirect(urlRedirectId);
    },
    ...options,
  });
};
