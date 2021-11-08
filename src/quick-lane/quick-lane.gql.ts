import { gql } from 'apollo-boost';

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
			title
			view_mode
		}
	}
`;

export const INSERT_QUICK_LANE = gql`
	mutation insterQuickLane($objects: [app_quick_lanes_insert_input!]!) {
		insert_app_quick_lanes(objects: $objects) {
			affected_rows
			returning {
				id
				title
				view_mode
			}
		}
	}
`;
