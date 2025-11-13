import { useQuery } from '@tanstack/react-query'
import { Avo } from '@viaa/avo2-types'
import { QUERY_KEYS } from '../../shared/constants/query-keys';
import { type ACTIONS_TABLE_COLUMN_ID } from '../../shared/helpers/table-column-list-to-csv-column-list';
import { CollectionService } from '../collection.service';
import { type ParentBundle } from '../collection.types';

export type BundleColumnId =
  | 'title'
  | 'author'
  | 'is_public'
  | 'organisation'
  | typeof ACTIONS_TABLE_COLUMN_ID

export enum BundleSortProp {
  title = 'title',
  owner = 'owner',
  publishStatus = 'publishStatus',
}

export const useGetCollectionsOrBundlesContainingFragment = (
  fragmentId: string,
  orderProp: BundleSortProp = BundleSortProp.title,
  orderDirection: Avo.Search.OrderDirection = Avo.Search.OrderDirection.ASC,
  options: Partial<{
    enabled: boolean
    refetchInterval: number | false
    refetchIntervalInBackground?: boolean
  }> = {},
) => {
  return useQuery<ParentBundle[]>({
    queryKey: [
      QUERY_KEYS.GET_COLLECTIONS_OR_BUNDLES_CONTAINING_FRAGMENT,
      fragmentId,
      orderProp,
      orderDirection,
    ],
    queryFn: () => {
      return CollectionService.getCollectionsOrBundlesContainingFragment(
        fragmentId,
        orderProp,
        orderDirection,
      )
    },
    enabled: true,
    refetchInterval: false,
    refetchIntervalInBackground: false,
    ...options,
  })
}
