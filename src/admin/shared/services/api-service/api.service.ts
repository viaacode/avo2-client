import ky from 'ky-universal';
import { KyInstance } from 'ky/distribution/types/ky';

import { getEnv } from '../../../../shared/helpers';
import { goToLoginBecauseOfUnauthorizedError } from '../../../../shared/helpers/fetch-with-logout';

export abstract class ApiService {
	private static api: KyInstance | null = null;

	public static getApi(ignoreAuthError = false): KyInstance {
		if (!ApiService.api) {
			this.api = ky.create({
				prefixUrl: getEnv('PROXY_URL'),
				headers: {
					'content-type': 'application/json',
				},
				credentials: 'include', // TODO change to same-origin once working on server
				hooks: {
					afterResponse: [
						(_request, _options, response) => {
							if (response.status === 401 && !ignoreAuthError) {
								// User is no longer logged in => force them to login again
								goToLoginBecauseOfUnauthorizedError();
							}
						},
					],
				},
			});
		}
		return this.api as KyInstance;
	}
}
