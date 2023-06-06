import { fetchWithLogoutJson } from '@meemoo/admin-core-ui';
import { Avo } from '@viaa/avo2-types';
import { stringifyUrl } from 'query-string';

import { CustomError, getEnv } from '../helpers';

export class LomService {
	static async fetchEducationLevels(): Promise<Avo.Lom.LomField[]> {
		try {
			return await fetchWithLogoutJson(
				stringifyUrl({
					url: `${getEnv('PROXY_URL')}/lom-fields`,
					query: { type: 'structure' },
				}),
				{
					method: 'GET',
				}
			);
		} catch (err) {
			throw new CustomError('Failed to get education levels', err);
		}
	}

	static async fetchSubjects(subjectIds: string[]): Promise<Avo.Lom.LomField[]> {
		try {
			return await fetchWithLogoutJson(
				stringifyUrl({
					url: `${getEnv('PROXY_URL')}/lom-fields`,
					query: {
						type: 'subject',
						parents: subjectIds,
					},
				}),
				{ method: 'GET' }
			);
		} catch (err) {
			throw new CustomError('Failed to get subjects', err);
		}
	}

	static async fetchThemes(themesIds: string[]): Promise<Avo.Lom.LomField[]> {
		try {
			return await fetchWithLogoutJson(
				stringifyUrl({
					url: `${getEnv('PROXY_URL')}/lom-fields`,
					query: {
						type: 'theme',
						parents: themesIds,
					},
				}),
				{ method: 'GET' }
			);
		} catch (err) {
			throw new CustomError('Failed to get themes', err);
		}
	}
}
