import type { Avo } from '@viaa/avo2-types';
import { sortBy } from 'lodash-es';

import {
	GetEducationLevelsDocument,
	GetEducationLevelsQuery,
	GetSubjectsDocument,
	GetSubjectsQuery,
} from '../shared/generated/graphql-db-types';
import { CustomError, getEnv } from '../shared/helpers';
import { fetchWithLogout } from '../shared/helpers/fetch-with-logout';
import { dataService } from '../shared/services/data-service';

export class SettingsService {
	public static async updateProfileInfo(
		profile: Avo.User.Profile | null,
		variables: Partial<Avo.User.UpdateProfileValues>
	): Promise<void> {
		try {
			if (!profile) {
				return;
			}

			const response = await fetchWithLogout(`${getEnv('PROXY_URL')}/profile`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify(variables),
			});

			let body;

			try {
				body = await response.json();
			} catch (err) {
				// ignore errors since they are handled below using the status code
			}

			if (response.status < 200 || response.status >= 400) {
				throw new CustomError(
					"Failed to update profile because response status wasn't in the valid range",
					null,
					{ response, body }
				);
			}
		} catch (err) {
			throw new CustomError('Failed to update profile information', err, {
				profile,
				variables,
			});
		}
	}

	public static async fetchSubjects(): Promise<string[]> {
		try {
			const response: GetSubjectsQuery = await dataService.query<GetSubjectsQuery>({
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
			const response = await dataService.query<GetEducationLevelsQuery>({
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
