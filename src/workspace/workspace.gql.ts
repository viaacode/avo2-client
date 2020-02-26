import { gql } from 'apollo-boost';

export const GET_WORKSPACE_TAB_COUNTS = gql`
	query getWorkspaceTabCounts($owner_profile_id: uuid) {
		collection_counts: app_collections_aggregate(
			where: { owner_profile_id: { _eq: $owner_profile_id }, type_id: { _eq: 3 } }
		) {
			aggregate {
				count
			}
		}
		bundle_counts: app_collections_aggregate(
			where: { owner_profile_id: { _eq: $owner_profile_id }, type_id: { _eq: 4 } }
		) {
			aggregate {
				count
			}
		}
		assignment_counts: app_assignments_aggregate(
			where: { owner_profile_id: { _eq: $owner_profile_id } }
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

export const DELETE_ITEM = gql`
	mutation deleteItemBookmark($itemUuid: uuid!, $profileId: uuid!) {
		delete_app_item_bookmarks(
			where: { item_id: { _eq: $itemUuid }, profile_id: { _eq: $profileId } }
		) {
			affected_rows
		}
	}
`;

export const DELETE_COLLECTION = gql`
	mutation deleteItemBookmark($collectionUuid: uuid!, $profileId: uuid!) {
		delete_app_collection_bookmarks(
			where: { collection_uuid: { _eq: $collectionUuid }, profile_id: { _eq: $profileId } }
		) {
			affected_rows
		}
	}
`;
