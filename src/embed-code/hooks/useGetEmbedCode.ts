import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { QUERY_KEYS } from '../../shared/constants/query-keys';
import { EmbedCodeService } from '../embed-code-service';
import { type EmbedCode } from '../embed-code.types';

export const useGetEmbedCode = (embedCodeId: string): UseQueryResult<EmbedCode> => {
	return useQuery(
		[QUERY_KEYS.GET_EMBED_CODES, embedCodeId],
		async () => {
			return EmbedCodeService.getEmbedCode(embedCodeId);
		},
		{
			enabled: true,
			refetchInterval: false,
			refetchIntervalInBackground: false,
			keepPreviousData: true,
		}
	);
};
