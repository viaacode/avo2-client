import { fetchWithLogoutJson } from '@meemoo/admin-core-ui';
import type { Avo } from '@viaa/avo2-types';
import { sortBy } from 'lodash-es';

import {
	GetEducationLevelsDocument,
	GetEducationLevelsQuery,
	GetEducationLevelsQueryVariables,
	GetSubjectsDocument,
	GetSubjectsQuery,
	GetSubjectsQueryVariables,
} from '../shared/generated/graphql-db-types';
import { CustomError, getEnv } from '../shared/helpers';
import { dataService } from '../shared/services/data-service';

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

	public static async fetchSubjects(): Promise<string[]> {
		try {
			const response: GetSubjectsQuery = await dataService.query<
				GetSubjectsQuery,
				GetSubjectsQueryVariables
			>({
				query: GetSubjectsDocument,
			});

			const subjects = (response.lookup_enum_lom_classification || []).map(
				(item: { description: string }) => item.description
			);

			return sortBy(subjects, (subject) => subject.toLowerCase());
		} catch (err) {
			throw new CustomError('Failed to get subjects from the database', err, {
				query: 'GET_SUBJECTS',
			});
		}
	}

	public static async fetchEducationLevels(): Promise<string[]> {
		try {
			const response = await dataService.query<
				GetEducationLevelsQuery,
				GetEducationLevelsQueryVariables
			>({
				query: GetEducationLevelsDocument,
			});

			return (
				(response.lookup_enum_lom_context || []) as {
					description: string;
				}[]
			).map((item: { description: string }) => item.description);
		} catch (err) {
			throw new CustomError('Failed to get education levels from the database', err, {
				query: 'GET_EDUCATION_LEVELS',
			});
		}
	}
}
