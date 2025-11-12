import { UseQueryResult, useQuery } from '@tanstack/react-query'
import { Avo } from '@viaa/avo2-types'
import { QUERY_KEYS } from '../../shared/constants/query-keys.js'
import { AssignmentService } from '../assignment.service.js'

export const useGetAssignmentsEditStatuses = (
  assignmentsIds: string[],
  options: {
    enabled: boolean
    refetchInterval: number | false
    refetchIntervalInBackground?: boolean
  } = {
    enabled: true,
    refetchInterval: false,
    refetchIntervalInBackground: false,
  },
): UseQueryResult<Avo.Share.EditStatusResponse | null, Error> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_ASSIGNMENTS_EDIT_STATUSES, assignmentsIds],
    queryFn: () => {
      return AssignmentService.getAssignmentsEditStatuses(assignmentsIds)
    },
    ...options,
  })
}
