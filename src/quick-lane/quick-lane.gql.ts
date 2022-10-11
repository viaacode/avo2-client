import { gql } from 'apollo-boost';

export const GET_QUICK_LANE_BY_ID = gql`
	query getQuickLaneById($id: uuid = "") {
		app_quick_lanes(where: { id: { _eq: $id } }) {
			id
			content_id
			content_label
			title
			view_mode
			created_at
			updated_at
			owner {
				id
				avatar
				user: usersByuserId {
					full_name
					first_name
					last_name
				}
				organisation {
					name
					logo_url
				}
			}
		}
	}
`;

export const GET_QUICK_LANE_BY_CONTENT_AND_OWNER = gql`
	query getQuickLaneByContentAndOwner(
		$contentId: uuid = ""
		$contentLabel: String = ""
		$profileId: uuid = ""
	) {
		app_quick_lanes(
			where: {
				content_id: { _eq: $contentId }
				content_label: { _eq: $contentLabel }
				owner_profile_id: { _eq: $profileId }
			}
		) {
			id
			content_id
			content_label
			title
			view_mode
			created_at
			updated_at
			owner {
				id
				avatar
				user: usersByuserId {
					full_name
					first_name
					last_name
				}
				organisation {
					name
					logo_url
				}
			}
		}
	}
`;

export const INSERT_QUICK_LANE = gql`
	mutation insertQuickLanes($objects: [app_quick_lanes_insert_input!]!) {
		insert_app_quick_lanes(objects: $objects) {
			affected_rows
			returning {
				id
				content_id
				content_label
				title
				view_mode
				created_at
				updated_at
				owner {
					id
					avatar
					user: usersByuserId {
						full_name
						first_name
						last_name
					}
					organisation {
						name
						logo_url
					}
				}
			}
		}
	}
`;

export const UPDATE_QUICK_LANE = gql`
	mutation updateQuickLaneById($id: uuid!, $object: app_quick_lanes_set_input!) {
		update_app_quick_lanes(where: { id: { _eq: $id } }, _set: $object) {
			affected_rows
			returning {
				id
				content_id
				content_label
				title
				view_mode
				created_at
				updated_at
				owner {
					id
					avatar
					user: usersByuserId {
						full_name
						first_name
						last_name
					}
					organisation {
						name
						logo_url
					}
				}
			}
		}
	}
`;

export const REMOVE_QUICK_LANES = gql`
	mutation removeQuickLanes($ids: [uuid!]!) {
		delete_app_quick_lanes(where: { id: { _in: $ids } }) {
			affected_rows
			returning {
				id
			}
		}
	}
`;
