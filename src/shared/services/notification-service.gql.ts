import { gql } from 'apollo-boost';

export const GET_NOTIFICATION = gql`
	query getNotification($key: String!, $profileId: uuid!) {
		users_notifications(where: { profile_id: { _eq: $profileId }, key: { _eq: $key } }) {
			through_email
			through_platform
		}
	}
`;

export const INSERT_NOTIFICATION = gql`
	mutation insertNotification(
		$key: String!
		$profileId: uuid!
		$throughEmail: Boolean!
		$throughPlatform: Boolean!
	) {
		insert_users_notifications(
			objects: {
				key: $key
				profile_id: $profileId
				through_email: $throughEmail
				through_platform: $throughPlatform
			}
		) {
			affected_rows
		}
	}
`;

export const UPDATE_NOTIFICATION = gql`
	mutation updateNotification(
		$key: String!
		$profileId: uuid!
		$throughEmail: Boolean!
		$throughPlatform: Boolean!
	) {
		update_users_notifications(
			where: { profile_id: { _eq: $profileId }, key: { _eq: $key } }
			_set: { through_email: $throughEmail, through_platform: $throughPlatform }
		) {
			affected_rows
		}
	}
`;
