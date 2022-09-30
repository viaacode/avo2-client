import { get } from 'lodash-es';

import {
	GET_PROFILE_PREFERENCE,
	SET_PROFILE_PREFERENCE,
} from '../components/ACMIDMNudgeModal/profile-preference.gql';
import { CustomError } from '../helpers';

import { dataService } from './data-service';

export enum ProfilePreferenceKey {
	DoNotShow = 'DO_NOT_SHOW',
}

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
			const response = await dataService.query({
				query: GET_PROFILE_PREFERENCE,
				variables: { profileId, key },
			});

			return get(response, 'data.users_profile_preferences', []);
		} catch (err) {
			throw new CustomError('Het ophalen van de profile preference is mislukt.', err, {
				query: GET_PROFILE_PREFERENCE,
				variables: { profileId, key },
			});
		}
	}

	static async setProfilePreference(
		profileId: string,
		key: ProfilePreferenceKey
	): Promise<number> {
		try {
			const response = await dataService.mutate({
				mutation: SET_PROFILE_PREFERENCE,
				variables: { profileId, key },
			});

			return response?.data?.insert_users_profile_preferences?.affected_rows;
		} catch (err) {
			throw new CustomError('Het inserten van de profile preference is mislukt.', err, {
				query: SET_PROFILE_PREFERENCE,
				variables: { profileId, key },
			});
		}
	}
}
