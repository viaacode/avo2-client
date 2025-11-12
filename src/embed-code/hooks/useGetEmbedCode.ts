import { type UseQueryResult, useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '../../shared/constants/query-keys';
import { type EmbedCode } from '../embed-code.types';
import { EmbedCodeService } from '../embed-code-service';

export const useGetEmbedCode = (
  embedCodeId: string | null,
  enabled = true,
): UseQueryResult<EmbedCode | null, Error> => {
  return useQuery({
    queryKey: [
      QUERY_KEYS.GET_EMBED_CODES,
      embedCodeId,
      EmbedCodeService.getJwtToken(),
    ],
    queryFn: async () => {
      if (!embedCodeId) {
        return null;
      }
      return EmbedCodeService.getEmbedCode(embedCodeId);
    },
    enabled,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};
