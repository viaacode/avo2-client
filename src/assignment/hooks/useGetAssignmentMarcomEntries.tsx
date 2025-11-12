import { type UseQueryResult, useQuery } from '@tanstack/react-query'

import { type AssignmentMarcomEntry } from '../../collection/collection.types.js'
import { QUERY_KEYS } from '../../shared/constants/query-keys.js'
import { tHtml } from '../../shared/helpers/translate-html.js'
import { AssignmentService } from '../assignment.service.js'

export const useGetAssignmentMarcomEntries = (
  assignmentId: string,
  options: {
    enabled?: boolean
    refetchInterval?: number | false
    refetchIntervalInBackground?: boolean
  } = {},
): UseQueryResult<AssignmentMarcomEntry[]> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_ASSIGNMENT_MARCOM_ENTRIES, assignmentId],
    queryFn: async () => {
      return AssignmentService.getMarcomEntries(assignmentId)
    },
    enabled: true,
    refetchInterval: false,
    refetchIntervalInBackground: false,
    ...options,
    meta: {
      errorMessage: tHtml(
        'assignment/hooks/use-get-assignment-marcom-entries___het-ophalen-van-de-marcom-entries-is-mislukt',
      ),
    },
  })
}
