import { UseQueryResult, useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '../../shared/constants/query-keys';
import { WorkspaceService } from '../workspace.service';
import { type WorkspaceCounts } from '../workspace.types';

export const useGetWorkspaceCounts = (
  options: {
    enabled: boolean;
    refetchInterval: number | false;
    refetchIntervalInBackground?: boolean;
  } = {
    enabled: true,
    refetchInterval: false,
    refetchIntervalInBackground: false,
  },
): UseQueryResult<WorkspaceCounts> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_WORKSPACE_COUNTS],
    queryFn: () => {
      return WorkspaceService.getWorkspaceCounts();
    },
    ...options,
  });
};
