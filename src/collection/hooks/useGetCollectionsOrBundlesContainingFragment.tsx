import { useQuery } from '@tanstack/react-query'

import { OrderDirection } from '../../search/search.const.js'
import { QUERY_KEYS } from '../../shared/constants/query-keys.js'
import { type ACTIONS_TABLE_COLUMN_ID } from '../../shared/helpers/table-column-list-to-csv-column-list.js'
import { CollectionService } from '../collection.service.js'
import { type ParentBundle } from '../collection.types.js'

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
  orderDirection: OrderDirection = Avo.Search.OrderDirection.ASC,
  options: Partial<{
    enabled: boolean
    refetchInterval: number | false
    refetchIntervalInBackground?: boolean
  }> = {},
) => {
  return useQuery<ParentBundle[]>(
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
        orderDirection,
      )
    },
    {
      enabled: true,
      refetchInterval: false,
      refetchIntervalInBackground: false,
      ...options,
    },
  )
}
