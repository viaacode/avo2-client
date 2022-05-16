import { gql } from 'apollo-boost';

export const GET_QUICK_LANE_BY_CONTENT_ID = gql`
	query getQuickLanesByContentId($contentId: uuid) {
		app_quick_lanes(where: { content_id: { _eq: $contentId } }) {
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
