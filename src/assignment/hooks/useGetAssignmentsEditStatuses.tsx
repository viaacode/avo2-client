import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { AvoShareEditStatusResponse } from '@viaa/avo2-types';
import { QUERY_KEYS } from '../../shared/constants/query-keys';
import { AssignmentService } from '../assignment.service';

export const useGetAssignmentsEditStatuses = (
  assignmentsIds: string[],
  options: {
    enabled: boolean;
    refetchInterval: number | false;
    refetchIntervalInBackground?: boolean;
  } = {
    enabled: true,
    refetchInterval: false,
    refetchIntervalInBackground: false,
  },
): UseQueryResult<AvoShareEditStatusResponse | null, Error> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_ASSIGNMENTS_EDIT_STATUSES, assignmentsIds],
    queryFn: () => {
      return AssignmentService.getAssignmentsEditStatuses(assignmentsIds);
    },
    ...options,
  });
};
