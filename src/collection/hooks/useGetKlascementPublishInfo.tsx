import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { QUERY_KEYS } from '../../shared/constants/query-keys';
import { tHtml } from '../../shared/helpers/translate-html';
import {
	type KlascementPublishInfo,
	KlascementService,
} from '../../shared/services/klascement-service';

export const useGetKlascementPublishInfo = (
	collectionId: string
): UseQueryResult<KlascementPublishInfo> => {
	return useQuery(
		[QUERY_KEYS.GET_KLASCEMENT_PUBLISH_INFO, collectionId],
		async () => {
			return KlascementService.getKlascementPublishInfoForCollection(collectionId);
		},
		{
			meta: {
				errorMessage: tHtml('Failed to fetch klascement publish info from the database'),
			},
		}
	);
};
