import { useQuery } from '@tanstack/react-query';

import { OrderDirection } from '../../search/search.const';
import { QUERY_KEYS } from '../../shared/constants/query-keys';
import { type ACTIONS_TABLE_COLUMN_ID } from '../../shared/helpers/table-column-list-to-csv-column-list';
import { CollectionService } from '../collection.service';

export type BundleColumnId =
	| 'title'
	| 'author'
	| 'is_public'
	| 'organization'
	| typeof ACTIONS_TABLE_COLUMN_ID;

export enum BundleSortProp {
	title = 'title',
	owner = 'owner',
	publishStatus = 'publishStatus',
}

export const useGetCollectionsOrBundlesContainingFragment = (
	fragmentId: string,
	orderProp: BundleSortProp = BundleSortProp.title,
	orderDirection: OrderDirection = OrderDirection.asc,
	options: Partial<{
		enabled: boolean;
		refetchInterval: number | false;
		refetchIntervalInBackground?: boolean;
	}> = {}
) => {
	return useQuery<{ id: string; title: string }[]>(
		[
			QUERY_KEYS.GET_COLLECTIONS_OR_BUNDLES_CONTAINING_FRAGMENT,
			fragmentId,
			orderProp,
			orderDirection,
		],
		() => {
			return CollectionService.getCollectionsOrBundlesContainingFragment(
				fragmentId,
				orderProp,
				orderDirection
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
