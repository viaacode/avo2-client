import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS } from '../../../shared/constants/query-keys.js'
import { ItemsService } from '../items.service.js'

export const useGetItemWithRelations = (
  itemUuid: string,
  options: {
    enabled: boolean
  } = { enabled: true },
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_ITEM_USED_BY, itemUuid],
    queryFn: async () => await ItemsService.fetchItemByUuid(itemUuid, true),
    ...options,
  })
}
