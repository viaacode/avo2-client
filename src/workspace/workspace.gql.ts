import { gql } from 'apollo-boost';

export const GET_WORKSPACE_TAB_COUNTS = gql`
	query getWorkspaceTabCounts($owner_profile_id: uuid, $company_id: String) {
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
		organisation_content_counts: app_collections_aggregate(
			where: {
				owner: { company_id: { _eq: $company_id } }
				is_deleted: { _eq: false }
				is_public: { _eq: true }
			}
		) {
			aggregate {
				count
			}
		}
		app_quick_lane_counts: app_quick_lanes_overview_aggregate(
			where: { owner_profile_id: { _eq: $owner_profile_id } }
		) {
			aggregate {
				count
			}
		}
		app_quick_lane_organisation_counts: app_quick_lanes_overview_aggregate(
			where: { company_id: { _eq: $company_id } }
		) {
			aggregate {
				count
			}
		}
	}
`;
