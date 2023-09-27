import { fetchWithLogoutJson } from '@meemoo/admin-core-ui';

import { CustomError, getEnv } from '../shared/helpers';

import { WorkspaceCounts } from './workspace.types';

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
}
