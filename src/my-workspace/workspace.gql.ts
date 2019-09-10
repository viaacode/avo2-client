import { gql } from 'apollo-boost';

export const GET_WORKSPACE_TAB_COUNTS = gql`
	query getWorkspaceTabCounts($ownerId: uuid) {
		app_collections_aggregate(where: { owner_uid: { _eq: $ownerId } }) {
			aggregate {
				count
			}
		}
	}
`;
