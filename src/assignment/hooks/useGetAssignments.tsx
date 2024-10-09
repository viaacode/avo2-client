import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { Avo } from '@viaa/avo2-types';

import { QUERY_KEYS } from '../../shared/constants/query-keys';
import type { TableColumnDataType } from '../../shared/types/table-column-data-type';
import { AssignmentService } from '../assignment.service';
import { type AssignmentOverviewTableColumns } from '../assignment.types';

export const useGetAssignments = (
	requestParams: {
		pastDeadline: boolean | null;
		sortColumn: AssignmentOverviewTableColumns;
		sortOrder: Avo.Search.OrderDirection;
		tableColumnDataType: TableColumnDataType;
		offset: number;
		limit?: number;
		filterString: string | undefined;
		labelIds: string[] | undefined;
		classIds: string[] | undefined;
		shareTypeIds: string[] | undefined;
	},
	options: {
		enabled?: boolean;
		refetchInterval?: number | false;
		refetchIntervalInBackground?: boolean;
	} = {}
): UseQueryResult<{ assignments: Avo.Assignment.Assignment[]; count: number }> => {
	return useQuery(
		[QUERY_KEYS.GET_ASSIGNMENTS, requestParams],
		async () => {
			return AssignmentService.fetchAssignments(requestParams);
		},
		{
			enabled: true,
			refetchInterval: false,
			refetchIntervalInBackground: false,
			keepPreviousData: true,
			...options,
		}
	);
};
