import { gql } from 'apollo-boost';

export const GET_WORKSPACE_TAB_COUNTS = gql`
	query getWorkspaceTabCounts($owner_profile_id: uuid) {
		app_collections_aggregate(where: { owner_profile_id: { _eq: $owner_profile_id } }) {
			aggregate {
				count
			}
		}

		app_assignments_aggregate(where: { owner_profile_id: { _eq: $owner_profile_id } }) {
			aggregate {
				count
			}
		}
	}
`;
