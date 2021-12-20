import { gql } from 'apollo-boost';

export const GET_QUICK_LANE_BY_CONTENT_ID = gql`
	query getQuickLanesByContentId($contentId: uuid) {
		app_quick_lanes(where: { content_id: { _eq: $contentId } }) {
			id
			title
			view_mode
			content_label
			created_at
			updated_at
			owner {
				id
				usersByuserId {
					full_name
				}
			}
		}
	}
`;
