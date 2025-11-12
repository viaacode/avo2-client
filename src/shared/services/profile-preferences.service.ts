import {
	type GetProfilePreferenceQuery,
	type GetProfilePreferenceQueryVariables,
	type SetProfilePreferenceMutation,
	type SetProfilePreferenceMutationVariables,
} from '../generated/graphql-db-operations.js';
import {
	GetProfilePreferenceDocument,
	SetProfilePreferenceDocument,
} from '../generated/graphql-db-react-query.js';
import { CustomError } from '../helpers/custom-error.js';

import { dataService } from './data-service.js';
import { type ProfilePreferenceKey } from './profile-preferences.types.js';

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
			const response = await dataService.query<
				GetProfilePreferenceQuery,
				GetProfilePreferenceQueryVariables
			>({
				query: GetProfilePreferenceDocument,
				variables: { profileId, key },
			});

			return response.users_profile_preferences ?? [];
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
			const response = await dataService.query<
				SetProfilePreferenceMutation,
				SetProfilePreferenceMutationVariables
			>({
				query: SetProfilePreferenceDocument,
				variables,
			});

			return response.insert_users_profile_preferences?.affected_rows || 0;
		} catch (err) {
			throw new CustomError('Het updaten van de profile preference is mislukt.', err, {
				query: 'SET_PROFILE_PREFERENCE',
				variables: { profileId, key },
			});
		}
	}
}
