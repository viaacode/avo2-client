import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { QUERY_KEYS } from '../../shared/constants/query-keys';
import { EmbedCodeService } from '../embed-code-service';
import { type EmbedCode } from '../embed-code.types';

export const useGetEmbedCode = (
	embedCodeId: string | null,
	enabled = true
): UseQueryResult<EmbedCode> => {
	return useQuery(
		[QUERY_KEYS.GET_EMBED_CODES, embedCodeId, EmbedCodeService.getJwtToken()],
		async () => {
			if (!embedCodeId) {
				return null;
			}
			return EmbedCodeService.getEmbedCode(embedCodeId);
		},
		{
			enabled,
			refetchInterval: false,
			refetchIntervalInBackground: false,
			keepPreviousData: true,
			retry: false, // otherwise in case of failure this keeps retrying at least 3 times
			cacheTime: 60 * 60 * 1000, // 1 hour
			staleTime: 60 * 60 * 1000, // 1 hour
		}
	);
};
