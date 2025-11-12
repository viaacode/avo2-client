import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import type { Avo } from '@viaa/avo2-types'

import { QUERY_KEYS } from '../../../shared/constants/query-keys.js'

export const useGetProfileById = (
  id: string | undefined | null,
  options?: UseQueryOptions<
    Avo.User.CommonUser | null,
    any,
    Avo.User.CommonUser | null,
    (typeof QUERY_KEYS.GET_PROFILE_BY_ID)[]
  >,
): UseQueryResult<Avo.User.CommonUser | null> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_PROFILE_BY_ID],
    queryFn: async () => {
      if (!id) {
        return null
      }
      const { UserService } = await import('@meemoo/admin-core-ui/admin')
      return UserService.getUserById(String(id))
    },
    ...options,
  })
}
