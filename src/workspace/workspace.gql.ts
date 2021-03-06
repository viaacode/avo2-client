import { gql } from 'apollo-boost';

export const GET_WORKSPACE_TAB_COUNTS = gql`
	query getWorkspaceTabCounts($owner_profile_id: uuid) {
		collection_counts: app_collections_aggregate(
			where: {
				owner_profile_id: { _eq: $owner_profile_id }
				type_id: { _eq: 3 }
				is_deleted: { _eq: false }
			}
		) {
			aggregate {
				count
			}
		}
		bundle_counts: app_collections_aggregate(
			where: {
				owner_profile_id: { _eq: $owner_profile_id }
				type_id: { _eq: 4 }
				is_deleted: { _eq: false }
			}
		) {
			aggregate {
				count
			}
		}
		assignment_counts: app_assignments_aggregate(
			where: {
				owner_profile_id: { _eq: $owner_profile_id }
				is_archived: { _eq: false }
				is_deleted: { _eq: false }
			}
		) {
			aggregate {
				count
			}
		}
		collection_bookmark_counts: app_collection_bookmarks_aggregate(
			where: { profile_id: { _eq: $owner_profile_id } }
		) {
			aggregate {
				count
			}
		}
		item_bookmark_counts: app_item_bookmarks_aggregate(
			where: { profile_id: { _eq: $owner_profile_id } }
		) {
			aggregate {
				count
			}
		}
	}
`;
