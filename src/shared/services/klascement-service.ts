import { fetchWithLogoutJson } from '@meemoo/admin-core-ui/dist/client.mjs';

import { CustomError, getEnv } from '../helpers';

export interface KlascementPublishData {
	collectionId: string;
	imageUrl: string;
	altText: string;
	sourceText: string;
}

export class KlascementService {
	public static async publishCollection(data: KlascementPublishData): Promise<void> {
		let url: string | undefined = undefined;

		try {
			url = `${getEnv('PROXY_URL')}/klascement/publish/collection`;

			return await fetchWithLogoutJson(url, {
				method: 'POST',
				body: JSON.stringify(data),
				forceLogout: false,
			});
		} catch (err) {
			throw new CustomError('Failed to publish to Klascement', err, {
				url,
				data,
			});
		}
	}
}
