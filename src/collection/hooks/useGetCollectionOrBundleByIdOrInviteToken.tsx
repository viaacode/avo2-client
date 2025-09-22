import { useQuery } from '@tanstack/react-query';
import { type Avo } from '@viaa/avo2-types';

import { QUERY_KEYS } from '../../shared/constants/query-keys';
import { CollectionService } from '../collection.service';
import { type CollectionOrBundle } from '../collection.types';

export const useGetCollectionOrBundleByIdOrInviteToken = (
	collectionId: string,
	type: CollectionOrBundle,
	inviteToken: string | undefined,
	options: {
		enabled?: boolean;
		refetchInterval?: number | false;
		refetchIntervalInBackground?: boolean;
	} = {}
) => {
	return useQuery<Avo.Collection.Collection | null>(
		[
			QUERY_KEYS.GET_COLLECTION_OR_BUNDLE_BY_ID_OR_INVITE_TOKEN,
			collectionId,
			type,
			inviteToken,
		],
		() => {
			return CollectionService.fetchCollectionOrBundleByIdOrInviteToken(
				collectionId,
				type,
				inviteToken
			);
		},
		{
			enabled: true,
			refetchInterval: false,
			refetchIntervalInBackground: false,
			...options,
		}
	);
};
