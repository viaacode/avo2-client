import { gql } from 'apollo-boost';

export const GET_CONTENT_PAGE_BY_PATH = gql`
	query getContentPageByPath($path: String!) {
		app_content(where: { path: { _eq: $path } }) {
			title
			content_type
			created_at
			depublish_at
			description
			id
			is_protected
			is_public
			is_published
			publish_at
			path
			contentBlockssBycontentId(order_by: { position: asc }) {
				content_block_type
				content_id
				created_at
				id
				position
				updated_at
				variables
				enum_content_block_type {
					description
					value
				}
			}
			user_group_ids
		}
	}
`;
