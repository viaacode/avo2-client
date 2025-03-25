import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { QUERY_KEYS } from '../../shared/constants/query-keys';
import { tHtml } from '../../shared/helpers/translate-html';
import {
	type KlascementCollectionPublishInfo,
	KlascementService,
} from '../../shared/services/klascement-service';

export const useGetKlascementPublishInfo = (
	collectionId: string
): UseQueryResult<KlascementCollectionPublishInfo> => {
	return useQuery(
		[QUERY_KEYS.GET_KLASCEMENT_COLLECTION_PUBLISH_INFO, collectionId],
		async () => {
			return KlascementService.getKlascementPublishInfoForCollection(collectionId);
		},
		{
			meta: {
				errorMessage: tHtml('Het ophalen van de klascement informatie is mislukt'),
			},
		}
	);
};
