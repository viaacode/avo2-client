import { fetchWithLogoutJson } from '@meemoo/admin-core-ui/client'
import { Avo } from '@viaa/avo2-types'
import { set } from 'es-toolkit/compat'

import { getEnv } from '../shared/helpers/env';

export const fetchSearchResults = (
  orderProperty: Avo.Search.OrderProperty = 'relevance',
  orderDirection = Avo.Search.OrderDirection.DESC,
  from = 0,
  size: number,
  filters?: Partial<Avo.Search.Filters>,
  filterOptionSearch?: Partial<Avo.Search.FilterOption>,
  requestedAggs?: Avo.Search.FilterProp[],
  aggsSize?: number,
): Promise<Avo.Search.Search> => {
  const controller = new AbortController()

  if (filters) {
    const gte = filters?.broadcastDate?.gte
    const lte = filters?.broadcastDate?.lte
    if (gte) {
      set(filters, 'broadcastDate.gte', gte.split(' ')[0])
    }
    if (lte) {
      set(filters, 'broadcastDate.lte', lte.split(' ')[0])
    }
  }

  return fetchWithLogoutJson(`${getEnv('PROXY_URL')}/search`, {
    method: 'POST',
    body: JSON.stringify({
      filters,
      filterOptionSearch,
      orderProperty,
      orderDirection,
      from,
      size,
      requestedAggs,
      aggsSize,
    }),
    signal: controller.signal,
  })
}
