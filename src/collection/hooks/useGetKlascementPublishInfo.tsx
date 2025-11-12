import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { QUERY_KEYS } from '../../shared/constants/query-keys.js';
import { tHtml } from '../../shared/helpers/translate-html.js';
import {
	type KlascementCollectionPublishInfo,
	KlascementService,
} from '../../shared/services/klascement-service.js';

export const useGetKlascementPublishInfo = (
	collectionId: string,
	options: { enabled?: boolean } = {}
): UseQueryResult<KlascementCollectionPublishInfo> => {
	return useQuery(
		[QUERY_KEYS.GET_KLASCEMENT_COLLECTION_PUBLISH_INFO, collectionId],
		async () => {
			return KlascementService.getKlascementPublishInfoForCollection(collectionId);
		},
		{
			enabled: true,
			meta: {
				errorMessage: tHtml(
					'collection/hooks/use-get-klascement-publish-info___het-ophalen-van-de-klascement-informatie-is-mislukt'
				),
			},
			...options,
		}
	);
};
