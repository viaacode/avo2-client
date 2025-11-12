import { UseQueryResult, useQuery } from '@tanstack/react-query'

import { QUERY_KEYS } from '../../shared/constants/query-keys.js'
import { WorkspaceService } from '../workspace.service.js'
import { type WorkspaceCounts } from '../workspace.types.js'

export const useGetWorkspaceCounts = (
  options: {
    enabled: boolean
    refetchInterval: number | false
    refetchIntervalInBackground?: boolean
  } = {
    enabled: true,
    refetchInterval: false,
    refetchIntervalInBackground: false,
  },
): UseQueryResult<WorkspaceCounts> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_WORKSPACE_COUNTS],
    queryFn: () => {
      return WorkspaceService.getWorkspaceCounts()
    },
    ...options,
  })
}
