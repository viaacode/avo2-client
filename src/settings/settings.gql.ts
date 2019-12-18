import { gql } from 'apollo-boost';

export const DELETE_PROFILE_OBJECTS = gql`
	mutation deleteProfileObjects($profileId: uuid!) {
		delete_users_profile_organizations(where: { profile_id: { _eq: $profileId } }) {
			affected_rows
		}
		delete_users_profile_contexts(where: { profile_id: { _eq: $profileId } }) {
			affected_rows
		}
		delete_users_profile_classifications(where: { profile_id: { _eq: $profileId } }) {
			affected_rows
		}
	}
`;

export const UPDATE_PROFILE_INFO = gql`
	mutation InsertProfileObject(
		$educationLevels: [users_profile_contexts_insert_input!]!
		$subjects: [users_profile_classifications_insert_input!]!
		$organizations: [users_profile_organizations_insert_input!]!
		$profileId: uuid!
		$alias: String
		$alternativeEmail: String
		$avatar: String
		$bio: String
		$function: String
		$location: bpchar
		$stamboek: String
	) {
		insert_users_profile_contexts(objects: $educationLevels) {
			affected_rows
		}
		insert_users_profile_classifications(objects: $subjects) {
			affected_rows
		}
		insert_users_profile_organizations(objects: $organizations) {
			affected_rows
		}
		update_users_profiles(
			where: { id: { _eq: $profileId } }
			_set: {
				alias: $alias
				alternative_email: $alternativeEmail
				avatar: $avatar
				bio: $bio
				function: $function
				location: $location
				stamboek: $stamboek
			}
		) {
			affected_rows
		}
	}
`;
