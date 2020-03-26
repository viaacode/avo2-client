import queryString from 'query-string';

import { Avo } from '@viaa/avo2-types';

import { CustomError, getEnv } from '../helpers';

export class ContentPageService {
	/**
	 * Get a content page with all of its content without the user having o be logged in
	 * @param path The path to identify the content page including the leading slash. eg: /over
	 */
	public static async getContentPageByPath(path: string): Promise<Avo.Content.Content | null> {
		try {
			const response = await fetch(
				`${getEnv('PROXY_URL')}/content-pages?${queryString.stringify({
					path,
				})}`,
				{
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
				}
			);
			if (response.status === 404) {
				return null;
			}
			if (response.status < 200 && response.status >= 400) {
				throw new CustomError('Failed to get content page from /content-pages', null, {
					path,
					response,
				});
			}
			return await response.json();
		} catch (err) {
			throw new CustomError('Failed to get all user groups', err);
		}
	}
}
