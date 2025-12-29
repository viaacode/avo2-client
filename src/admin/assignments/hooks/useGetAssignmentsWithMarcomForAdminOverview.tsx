import { getFilters } from '@meemoo/admin-core-ui/admin';
import { useQuery } from '@tanstack/react-query';
import {
  AvoAssignmentAssignment,
  AvoSearchOrderDirection,
} from '@viaa/avo2-types';
import { QUERY_KEYS } from '../../../shared/constants/query-keys';
import { tHtml } from '../../../shared/helpers/translate-html';
import { ITEMS_PER_PAGE } from '../../collectionsOrBundles/collections-or-bundles.const';
import { AssignmentsAdminService } from '../assignments.admin.service';
import {
  type AssignmentMarcomTableState,
  type AssignmentSortProps,
} from '../assignments.types';

export const useGetAssignmentsWithMarcomForAdminOverview = (
  tableState: Partial<AssignmentMarcomTableState>,
  options: {
    enabled?: boolean;
    refetchInterval?: number | false;
    refetchIntervalInBackground?: boolean;
  } = {},
) => {
  return useQuery<{ assignments: AvoAssignmentAssignment[]; total: number }>({
    queryKey: [QUERY_KEYS.GET_ASSIGNMENTS_WITH_MARCOM, tableState],
    queryFn: () => {
      return AssignmentsAdminService.getAssignmentsWithMarcom(
        (tableState.page || 0) * ITEMS_PER_PAGE,
        ITEMS_PER_PAGE,
        (tableState.sort_column || 'updated_at') as AssignmentSortProps,
        tableState.sort_order || AvoSearchOrderDirection.DESC,
        getFilters(tableState),
        true,
      );
    },
    enabled: true,
    refetchInterval: false,
    refetchIntervalInBackground: false,
    ...options,
    meta: {
      errorMessage: tHtml(
        'admin/assignments/views/assignments-marcom-overview___het-ophalen-van-de-opdracht-actualisaties-is-mislukt',
      ),
    },
  });
};
