import { type UseQueryResult, useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '../../shared/constants/query-keys';
import { type EmbedCode } from '../embed-code.types';
import { type EmbedCodeFilters, EmbedCodeService } from '../embed-code-service';

export const useGetEmbedCodes = (
  embedCodeFilters: EmbedCodeFilters,
  enabled = true,
): UseQueryResult<
  {
    embedCodes: EmbedCode[];
    count: number;
  } | null,
  Error
> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_EMBED_CODES, embedCodeFilters],
    queryFn: async () => {
      if (!embedCodeFilters) {
        return null;
      }
      return EmbedCodeService.getEmbedCodes(embedCodeFilters);
    },
    enabled,
  });
};
