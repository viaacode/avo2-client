import { fetchWithLogoutJson } from '@meemoo/admin-core-ui/dist/client.mjs';
import { type Avo } from '@viaa/avo2-types';

import { CustomError, getEnv } from '../shared/helpers';

export class SettingsService {
	public static async updateProfileInfo(
		profile: Partial<Avo.User.UpdateProfileValues>
	): Promise<void> {
		try {
			if (!profile) {
				return;
			}

			await fetchWithLogoutJson(`${getEnv('PROXY_URL')}/profile`, {
				method: 'POST',
				body: JSON.stringify(profile),
			});
		} catch (err) {
			throw new CustomError('Failed to update profile information', err, {
				profile,
			});
		}
	}
}
