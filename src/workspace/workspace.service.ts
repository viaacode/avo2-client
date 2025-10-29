import { fetchWithLogoutJson } from '@meemoo/admin-core-ui/client';

import { CustomError } from '../shared/helpers/custom-error';
import { getEnv } from '../shared/helpers/env';
import type { BookmarkInfo } from '../shared/services/bookmarks-views-plays-service/bookmarks-views-plays-service.types';

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

	public static getAllBookmarksForUser(): Promise<BookmarkInfo[]> {
		let url: string | null = null;
		try {
			url = (getEnv('PROXY_URL') as string) + '/workspace/bookmarks';
			return fetchWithLogoutJson<BookmarkInfo[]>(url, {
				method: 'GET',
			});
		} catch (err) {
			throw new CustomError('Failed to get bookmarks', err, { url });
		}
	}
}
