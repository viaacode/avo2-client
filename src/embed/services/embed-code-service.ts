import { fetchWithLogoutJson } from '@meemoo/admin-core-ui/dist/client.mjs';

import { type EmbedCode } from '../../embed-code/embed-code.types';
import { CustomError, getEnv } from '../../shared/helpers';

export class EmbedCodeService {
	public static async getEmbedCode(embedId: string): Promise<EmbedCode> {
		let url: string | undefined = undefined;

		if (!embedId) {
			const error = new CustomError('Failed to get embed code when embedId is empty', {
				url,
			});
			console.log(error);
			throw error;
		}

		try {
			url = `${getEnv('PROXY_URL')}/embed-codes/${embedId}`;

			return fetchWithLogoutJson<EmbedCode>(url, {
				method: 'GET',
				forceLogout: false,
			});
		} catch (err) {
			const error = new CustomError('Failed to get embed code', err, {
				url,
			});
			console.log(error);
			throw error;
		}
	}
}
