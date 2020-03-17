import { gql } from 'apollo-boost';

export const GET_INTERACTIVE_TOUR = gql`
	query getInteractiveTour(
		$routeId: String!
		$notificationKeyPrefix: String!
		$profileId: uuid!
	) {
		app_interactive_tour(where: { page: { _eq: $routeId } }, order_by: { created_at: asc }) {
			steps
			id
		}
		users_notifications(
			where: { profile_id: { _eq: $profileId }, key: { _ilike: $notificationKeyPrefix } }
		) {
			through_platform
			key
		}
	}
`;

export const GET_NOTIFICATION_INTERACTIVE_TOUR_SEEN = gql`
	query getInteractiveTour($key: String!, $profileId: uuid!) {
		users_notifications(where: { profile_id: { _eq: $profileId }, key: { _eq: $key } }) {
			key
		}
	}
`;

export const INSERT_NOTIFICATION_INTERACTIVE_TOUR_SEEN = gql`
	mutation insertInteractiveTourAsSeen($key: String!, $profileId: uuid!) {
		insert_users_notifications(
			objects: { key: $key, profile_id: $profileId, through_platform: false }
		) {
			affected_rows
		}
	}
`;

export const UPDATE_NOTIFICATION_INTERACTIVE_TOUR_SEEN = gql`
	mutation updateInteractiveTourAsSeen($key: String!, $profileId: uuid!) {
		update_users_notifications(
			where: { profile_id: { _eq: $profileId }, key: { _eq: $key } }
			_set: { through_platform: false }
		) {
			affected_rows
		}
	}
`;
