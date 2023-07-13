import { fetchWithLogoutJson } from '@meemoo/admin-core-ui';
import type { Avo } from '@viaa/avo2-types';
import { stringifyUrl } from 'query-string';

import { CustomError, getEnv } from '../helpers';

export class LomService {
	static async fetchLomFields(
		type: 'structure' | 'subject' | 'theme'
	): Promise<Avo.Lom.LomField[]> {
		try {
			return await fetchWithLogoutJson(
				stringifyUrl({
					url: `${getEnv('PROXY_URL')}/lom-fields`,
					query: { type },
				}),
				{
					method: 'GET',
				}
			);
		} catch (err) {
			throw new CustomError('Failed to get lom fields', err, { type });
		}
	}
}
