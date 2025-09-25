import { fetchWithLogoutJson } from '@meemoo/admin-core-ui/dist/client.mjs';
import { type Avo } from '@viaa/avo2-types';
import { stringifyUrl } from 'query-string';

import { CustomError } from '../shared/helpers/custom-error';
import { getEnv } from '../shared/helpers/env';
import type { BookmarkInfo } from '../shared/services/bookmarks-views-plays-service/bookmarks-views-plays-service.types';
import { type TableColumnDataType } from '../shared/types/table-column-data-type';

import { type WorkspaceCounts } from './workspace.types';

export class WorkspaceService {
	public static getWorkspaceCounts(): Promise<WorkspaceCounts> {
		let url: string | null = null;
		try {
			url = (getEnv('PROXY_URL') as string) + '/workspace/counts';
			return fetchWithLogoutJson<WorkspaceCounts>(url, {
				method: 'GET',
			});
		} catch (err) {
			throw new CustomError('Failed to get workspace counts', err, { url });
		}
	}

	public static getAllBookmarksForUser(
		offset: number,
		limit: number | null,
		sortColumn: keyof BookmarkInfo,
		sortOrder: Avo.Search.OrderDirection,
		tableColumnDataType: TableColumnDataType,
		filterString: string | undefined,
		labelIds?: string[],
		classIds?: string[]
	): Promise<BookmarkInfo[]> {
		let url: string | null = null;
		try {
			url = stringifyUrl({
				url: `${getEnv('PROXY_URL')}/workspace/bookmarks`,
				query: {
					sortColumn,
					sortOrder,
					tableColumnDataType,
					offset,
					limit,
					filterString: filterString,
					labelIds: labelIds?.join(','),
					classIds: classIds?.join(','),
				},
			});
			return fetchWithLogoutJson<BookmarkInfo[]>(url, {
				method: 'GET',
			});
		} catch (err) {
			throw new CustomError('Failed to get bookmarks', err, { url });
		}
	}
}
