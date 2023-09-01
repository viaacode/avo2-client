import { fetchWithLogoutJson } from '@meemoo/admin-core-ui';
import { ButtonAction } from '@viaa/avo2-components';

import { ResolvedItemOrCollectionOrAssignment } from '../../../search/components/MediaGridWrapper/MediaGridWrapper.types';
import { CustomError, getEnv } from '../../../shared/helpers';

export class ContentPageService {
	public static async resolveMediaItems(
		searchQuery: string | null,
		searchQueryLimit: number | undefined,
		mediaItems:
			| {
					mediaItem: ButtonAction;
			  }[]
			| undefined
	): Promise<ResolvedItemOrCollectionOrAssignment[]> {
		let url: string | undefined = undefined;
		let body: any | undefined = undefined;
		try {
			url = (getEnv('PROXY_URL') as string) + '/content-pages/media';
			body = {
				searchQuery,
				searchQueryLimit,
				mediaItems,
			};
			return fetchWithLogoutJson(url, {
				method: 'POST',
				body: JSON.stringify(body),
			});
		} catch (err) {
			throw new CustomError('Failed to resolve media items through proxy', err, {
				searchQuery,
				searchQueryLimit,
				mediaItems,
				url,
				body,
			});
		}
	}
}
