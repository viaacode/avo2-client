import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { AvoSearchOrderDirection, AvoSearchSearch } from '@viaa/avo2-types';
import { fetchSearchResults } from '../../../../../../search/search.service';
import { QUERY_KEYS } from '../../../../../../shared/constants/query-keys';

async function getSearchAutocomplete(
  query: string,
  limit: number,
): Promise<AvoSearchSearch | null> {
  const filters = { query };
  return fetchSearchResults(
    'relevance',
    AvoSearchOrderDirection.DESC,
    0,
    limit,
    filters,
    {},
  );
}

export const useSearchAutocomplete = (
  query: string,
  limit = 5,
  options: { enabled?: boolean } = {},
): UseQueryResult<AvoSearchSearch | null> => {
  return useQuery<AvoSearchSearch | null>({
    queryKey: [QUERY_KEYS.SEARCH_AUTOCOMPLETE, query, limit],
    queryFn: () => getSearchAutocomplete(query, limit),
    enabled: options.enabled ?? true,
    staleTime: 30000,
    ...options,
  });
};
