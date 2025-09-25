import { useQuery } from '@tanstack/react-query';
import type { Avo } from '@viaa/avo2-types';

import { QUERY_KEYS } from '../../shared/constants/query-keys';
import type { BookmarkInfo } from '../../shared/services/bookmarks-views-plays-service/bookmarks-views-plays-service.types';
import type { TableColumnDataType } from '../../shared/types/table-column-data-type';
import { WorkspaceService } from '../workspace.service';

export const useGetBookmarksForUser = (
	offset: number,
	limit: number | null,
	sortColumn: keyof BookmarkInfo,
	sortOrder: Avo.Search.OrderDirection,
	tableColumnDataType: TableColumnDataType,
	filterString: string | undefined,
	labelIds?: string[],
	classIds?: string[],
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
	return useQuery<BookmarkInfo[]>(
		[
			QUERY_KEYS.GET_BOOKMARKS_FOR_USER,
			offset,
			limit,
			sortColumn,
			sortOrder,
			tableColumnDataType,
			filterString,
			labelIds,
			classIds,
		],
		() => {
			return WorkspaceService.getAllBookmarksForUser(
				offset,
				limit,
				sortColumn,
				sortOrder,
				tableColumnDataType,
				filterString,
				labelIds,
				classIds
			);
		},
		options
	);
};
