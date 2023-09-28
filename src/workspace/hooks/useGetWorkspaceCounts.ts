import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '../../shared/constants/query-keys';
import { WorkspaceService } from '../workspace.service';
import { WorkspaceCounts } from '../workspace.types';

export const useGetWorkspaceCounts = (
	options: {
		enabled: boolean;
		refetchInterval: number | false;
		refetchIntervalInBackground?: boolean;
	} = {
		enabled: true,
		refetchInterval: false,
		refetchIntervalInBackground: false,
	}
) => {
	return useQuery<WorkspaceCounts>(
		[QUERY_KEYS.GET_WORKSPACE_COUNTS],
		() => {
			return WorkspaceService.getWorkspaceCounts();
		},
		options
	);
};
