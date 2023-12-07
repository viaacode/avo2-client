import { fetchWithLogoutJson } from '@meemoo/admin-core-ui';
import { type Avo } from '@viaa/avo2-types';

import { CustomError, getEnv } from '../helpers';

export class LomService {
	public static async fetchSubjects(): Promise<Avo.Lom.LomField[]> {
		try {
			return await fetchWithLogoutJson(`${getEnv('PROXY_URL')}/admin/lookup/subjects`);
		} catch (err) {
			throw new CustomError('Failed to get subjects from the database', err, {
				path: '/admin/lookup/subjects',
			});
		}
	}

	public static async fetchThemes(): Promise<Avo.Lom.LomField[]> {
		try {
			return await fetchWithLogoutJson(`${getEnv('PROXY_URL')}/admin/lookup/themes`);
		} catch (err) {
			throw new CustomError('Failed to get themas from the database', err, {
				path: '/admin/lookup/themes',
			});
		}
	}

	public static async fetchEducationLevels(): Promise<Avo.Lom.LomField[]> {
		try {
			return await fetchWithLogoutJson(
				`${getEnv('PROXY_URL')}/admin/lookup/education-levels`
			);
		} catch (err) {
			throw new CustomError('Failed to get education levels from the database', err, {
				path: '/admin/lookup/education-levels',
			});
		}
	}
}
