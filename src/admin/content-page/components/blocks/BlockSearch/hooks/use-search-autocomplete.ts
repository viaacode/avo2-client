import { useQuery } from '@tanstack/react-query';
import { AvoSearchOrderDirection, AvoSearchResults } from '@viaa/avo2-types';
import { QUERY_KEYS } from '../../../../../../shared/constants/query-keys';
import { fetchSearchResults } from '../../../../../../search/search.service';

async function getSearchAutocomplete(
  query: string,
  limit: number,
): Promise<AvoSearchResults | null> {
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
) => {
  return useQuery<AvoSearchResults | null>({
    queryKey: [QUERY_KEYS.SEARCH_AUTOCOMPLETE, query, limit],
    queryFn: () => getSearchAutocomplete(query, limit),
    enabled: options.enabled ?? true,
    staleTime: 30000,
    ...options,
  });
};
