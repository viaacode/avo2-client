import { type UseQueryResult, useQuery } from '@tanstack/react-query'
import type { Avo } from '@viaa/avo2-types'

import { QUERY_KEYS } from '../../shared/constants/query-keys.js'
import { AssignmentService } from '../assignment.service.js'
import { type FetchAssignmentsParams } from '../assignment.types.js'

export const useGetAssignments = (
  requestParams: FetchAssignmentsParams,
  options: {
    enabled?: boolean
    refetchInterval?: number | false
    refetchIntervalInBackground?: boolean
  } = {},
): UseQueryResult<{
  assignments: Avo.Assignment.Assignment[]
  count: number
}> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_ASSIGNMENTS, requestParams],
    queryFn: async () => {
      return AssignmentService.fetchAssignments(requestParams)
    },
    enabled: true,
    refetchInterval: false,
    refetchIntervalInBackground: false,
    ...options,
  })
}
