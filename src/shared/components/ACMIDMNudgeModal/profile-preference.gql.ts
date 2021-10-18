import { gql } from 'apollo-boost';

export const GET_PROFILE_PREFERENCE = gql`
	query getProfilePreference(
		$profileId: uuid!
		$key: lookup_enum_profile_preferences_keys_enum!
	) {
		users_profile_preferences(
			where: { _and: { key: { _eq: $key }, profile_id: { _eq: $profileId } } }
		) {
			id
			profile_id
			key
		}
	}
`;

export const SET_PROFILE_PREFERENCE = gql`
	mutation setProfilePreference(
		$profileId: uuid!
		$key: lookup_enum_profile_preferences_keys_enum!
	) {
		insert_users_profile_preferences(objects: { key: $key, profile_id: $profileId }) {
			affected_rows
		}
	}
`;
