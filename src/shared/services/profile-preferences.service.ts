import { get } from 'lodash-es';

import {
	GetProfilePreferenceDocument,
	GetProfilePreferenceQuery,
	SetProfilePreferenceDocument,
	SetProfilePreferenceMutation,
	SetProfilePreferenceMutationVariables,
} from '../generated/graphql-db-types';
import { CustomError } from '../helpers';

import { dataService } from './data-service';
import { ProfilePreferenceKey } from './profile-preferences.types';

export interface ProfilePreference {
	id: number;
	profile_id: string;
	key: 'DO_NOT_SHOW' | string;
}

export class ProfilePreferencesService {
	static async fetchProfilePreference(
		profileId: string,
		key: ProfilePreferenceKey
	): Promise<ProfilePreference[]> {
		try {
			const response = await dataService.query<GetProfilePreferenceQuery>({
				query: GetProfilePreferenceDocument,
				variables: { profileId, key },
			});

			return get(response, 'data.users_profile_preferences', []);
		} catch (err) {
			throw new CustomError('Het ophalen van de profile preference is mislukt.', err, {
				query: 'GET_PROFILE_PREFERENCE',
				variables: { profileId, key },
			});
		}
	}

	static async setProfilePreference(
		profileId: string,
		key: ProfilePreferenceKey
	): Promise<number> {
		try {
			const variables: SetProfilePreferenceMutationVariables = { profileId, key };
			const response = await dataService.query<SetProfilePreferenceMutation>({
				query: SetProfilePreferenceDocument,
				variables,
			});

			return response.insert_users_profile_preferences?.affected_rows || 0;
		} catch (err) {
			throw new CustomError('Het inserten van de profile preference is mislukt.', err, {
				query: 'SET_PROFILE_PREFERENCE',
				variables: { profileId, key },
			});
		}
	}
}
